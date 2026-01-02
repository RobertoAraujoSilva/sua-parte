import { useState, useCallback } from 'react';
import * as XLSX from 'xlsx';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import {
  ProgramasSpreadsheetRow,
  ProcessedProgramData,
  ProgramValidationResult,
  ProgramImportSummary,
  PROGRAM_STATUS_MAPPING,
  ASSIGNMENT_STATUS_MAPPING
} from '@/types/programasSpreadsheet';

const BATCH_SIZE = 50;

export function useProgramasImport() {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [validationResults, setValidationResults] = useState<ProgramValidationResult[]>([]);
  const [importSummary, setImportSummary] = useState<ProgramImportSummary | null>(null);
  const [progress, setProgress] = useState(0);

  const parseDate = (dateStr: string): string | null => {
    if (!dateStr) return null;
    
    // Try DD/MM/YYYY format
    const ddmmyyyy = dateStr.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
    if (ddmmyyyy) {
      const [, day, month, year] = ddmmyyyy;
      return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
    }
    
    // Try YYYY-MM-DD format
    const yyyymmdd = dateStr.match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if (yyyymmdd) {
      return dateStr;
    }
    
    // Try Excel serial date number
    const serialNumber = parseFloat(dateStr);
    if (!isNaN(serialNumber) && serialNumber > 0) {
      const excelEpoch = new Date(1899, 11, 30);
      const date = new Date(excelEpoch.getTime() + serialNumber * 24 * 60 * 60 * 1000);
      return date.toISOString().split('T')[0];
    }
    
    return null;
  };

  const validateRow = (row: ProgramasSpreadsheetRow, rowIndex: number): ProgramValidationResult => {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Required field validation
    if (!row['Título']?.toString().trim()) {
      errors.push('Título é obrigatório');
    }

    if (!row['Semana']?.toString().trim()) {
      errors.push('Semana é obrigatória');
    }

    if (!row['Data Início Semana']) {
      errors.push('Data Início Semana é obrigatória');
    }

    const parsedDate = parseDate(row['Data Início Semana']?.toString() || '');
    if (row['Data Início Semana'] && !parsedDate) {
      errors.push('Data Início Semana inválida (use DD/MM/YYYY)');
    }

    // Status validation
    const statusInput = row['Status']?.toString().trim() || 'draft';
    const status = PROGRAM_STATUS_MAPPING[statusInput];
    if (row['Status'] && !status) {
      warnings.push(`Status "${statusInput}" não reconhecido, usando "Rascunho"`);
    }

    // Assignment status validation
    const assignmentInput = row['Status Designação']?.toString().trim() || 'pending';
    const assignmentStatus = ASSIGNMENT_STATUS_MAPPING[assignmentInput];
    if (row['Status Designação'] && !assignmentStatus) {
      warnings.push(`Status Designação "${assignmentInput}" não reconhecido, usando "Pendente"`);
    }

    if (errors.length > 0) {
      return { isValid: false, errors, warnings, rowIndex };
    }

    const processedData: ProcessedProgramData = {
      titulo: row['Título'].toString().trim(),
      semana: row['Semana'].toString().trim(),
      data: parsedDate!,
      data_inicio_semana: parsedDate!,
      mes_apostila: row['Mês Apostila']?.toString().trim() || undefined,
      status: status || 'draft',
      assignment_status: assignmentStatus || 'pending',
      conteudo: undefined
    };

    return { isValid: true, errors: [], warnings, data: processedData, rowIndex };
  };

  const validateFile = useCallback(async (file: File): Promise<ProgramValidationResult[]> => {
    setIsLoading(true);
    setProgress(0);

    try {
      // Validate file type
      const validTypes = [
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'application/vnd.ms-excel'
      ];
      if (!validTypes.includes(file.type) && !file.name.match(/\.(xlsx|xls)$/i)) {
        throw new Error('Formato de arquivo inválido. Use .xlsx ou .xls');
      }

      // Validate file size (10MB max)
      if (file.size > 10 * 1024 * 1024) {
        throw new Error('Arquivo muito grande. Máximo: 10MB');
      }

      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data, { type: 'array' });
      
      const firstSheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[firstSheetName];
      
      const jsonData = XLSX.utils.sheet_to_json<ProgramasSpreadsheetRow>(worksheet, {
        defval: ''
      });

      if (jsonData.length === 0) {
        throw new Error('Planilha vazia. Adicione dados e tente novamente.');
      }

      const results: ProgramValidationResult[] = [];
      
      for (let i = 0; i < jsonData.length; i++) {
        const row = jsonData[i];
        const result = validateRow(row, i + 2); // +2 for header row and 1-based index
        results.push(result);
        setProgress(Math.round((i / jsonData.length) * 50));
      }

      setValidationResults(results);
      setProgress(50);

      return results;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro ao processar arquivo';
      toast.error(message);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const importPrograms = useCallback(async (
    validationResults: ProgramValidationResult[]
  ): Promise<ProgramImportSummary> => {
    if (!user?.id) {
      throw new Error('Usuário não autenticado');
    }

    setIsLoading(true);
    setProgress(50);

    const validResults = validationResults.filter(r => r.isValid && r.data);
    const invalidResults = validationResults.filter(r => !r.isValid);
    const warningResults = validationResults.filter(r => r.warnings.length > 0);

    let importedCount = 0;
    const errors: ProgramValidationResult[] = [...invalidResults];

    try {
      // Process in batches
      for (let i = 0; i < validResults.length; i += BATCH_SIZE) {
        const batch = validResults.slice(i, i + BATCH_SIZE);
        
        const programsToInsert = batch.map(result => ({
          user_id: user.id,
          titulo: result.data!.titulo,
          semana: result.data!.semana,
          data: result.data!.data,
          data_inicio_semana: result.data!.data_inicio_semana,
          mes_apostila: result.data!.mes_apostila,
          status: result.data!.status,
          assignment_status: result.data!.assignment_status,
          conteudo: result.data!.conteudo ?? null
        }));

        const { error } = await supabase
          .from('programas')
          .insert(programsToInsert);

        if (error) {
          console.error('Batch insert error:', error);
          batch.forEach(result => {
            errors.push({
              ...result,
              isValid: false,
              errors: [...result.errors, `Erro ao inserir: ${error.message}`]
            });
          });
        } else {
          importedCount += batch.length;
        }

        setProgress(50 + Math.round((i / validResults.length) * 50));
      }

      const summary: ProgramImportSummary = {
        totalRows: validationResults.length,
        validRows: validResults.length,
        invalidRows: invalidResults.length,
        imported: importedCount,
        errors,
        warnings: warningResults
      };

      setImportSummary(summary);
      setProgress(100);

      if (importedCount > 0) {
        toast.success(`${importedCount} programa(s) importado(s) com sucesso!`);
      }

      if (errors.length > 0) {
        toast.warning(`${errors.length} linha(s) com erro(s)`);
      }

      return summary;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro na importação';
      toast.error(message);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [user?.id]);

  const downloadTemplate = useCallback(() => {
    const ws = XLSX.utils.json_to_sheet([
      {
        "Título": "Reunião Vida e Ministério - Semana 1",
        "Semana": "1-7 Janeiro",
        "Data Início Semana": "01/01/2025",
        "Mês Apostila": "Janeiro 2025",
        "Status": "Rascunho",
        "Status Designação": "Pendente",
        "Observações": ""
      },
      {
        "Título": "Reunião Vida e Ministério - Semana 2",
        "Semana": "8-14 Janeiro",
        "Data Início Semana": "08/01/2025",
        "Mês Apostila": "Janeiro 2025",
        "Status": "Ativo",
        "Status Designação": "Completo",
        "Observações": "Designações confirmadas"
      }
    ]);

    // Set column widths
    ws['!cols'] = [
      { wch: 40 }, // Título
      { wch: 20 }, // Semana
      { wch: 20 }, // Data Início Semana
      { wch: 20 }, // Mês Apostila
      { wch: 15 }, // Status
      { wch: 20 }, // Status Designação
      { wch: 30 }  // Observações
    ];

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Programas');

    // Add instructions sheet
    const instructions = [
      ['Instruções para Importação de Programas'],
      [''],
      ['Campos Obrigatórios:'],
      ['- Título: Nome do programa'],
      ['- Semana: Descrição da semana (ex: "1-7 Janeiro")'],
      ['- Data Início Semana: Data no formato DD/MM/YYYY'],
      [''],
      ['Campos Opcionais:'],
      ['- Mês Apostila: Mês de referência da apostila'],
      ['- Status: Rascunho, Ativo, Publicado ou Arquivado'],
      ['- Status Designação: Pendente, Em Progresso ou Completo'],
      ['- Observações: Notas adicionais'],
      [''],
      ['Valores válidos para Status:'],
      ['- Rascunho (draft)'],
      ['- Ativo (active)'],
      ['- Publicado (published)'],
      ['- Arquivado (archived)'],
      [''],
      ['Valores válidos para Status Designação:'],
      ['- Pendente (pending)'],
      ['- Em Progresso (in_progress)'],
      ['- Completo (completed)']
    ];

    const wsInstructions = XLSX.utils.aoa_to_sheet(instructions);
    wsInstructions['!cols'] = [{ wch: 60 }];
    XLSX.utils.book_append_sheet(wb, wsInstructions, 'Instruções');

    XLSX.writeFile(wb, 'template_programas.xlsx');
    toast.success('Template baixado com sucesso!');
  }, []);

  const resetImport = useCallback(() => {
    setValidationResults([]);
    setImportSummary(null);
    setProgress(0);
  }, []);

  const getImportStats = useCallback((results: ProgramValidationResult[]) => {
    return {
      total: results.length,
      valid: results.filter(r => r.isValid).length,
      invalid: results.filter(r => !r.isValid).length,
      warnings: results.filter(r => r.warnings.length > 0).length
    };
  }, []);

  return {
    isLoading,
    validationResults,
    importSummary,
    progress,
    validateFile,
    importPrograms,
    downloadTemplate,
    resetImport,
    getImportStats
  };
}

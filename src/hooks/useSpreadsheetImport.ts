import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import {
  SpreadsheetRow,
  ProcessedStudentData,
  ValidationResult,
  ImportSummary
} from '@/types/spreadsheet';
import { readExcelFile, processRow } from '@/utils/spreadsheetProcessor';
import { EstudanteInsert } from '@/types/estudantes';

export const useSpreadsheetImport = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [validationResults, setValidationResults] = useState<ValidationResult[]>([]);
  const [importSummary, setImportSummary] = useState<ImportSummary | null>(null);
  const [importProgress, setImportProgress] = useState<{
    current: number;
    total: number;
    phase: 'importing' | 'linking' | 'complete';
    message: string;
  }>({ current: 0, total: 0, phase: 'importing', message: '' });

  /**
   * Validates Excel file and returns validation results
   */
  const validateFile = async (file: File): Promise<ValidationResult[]> => {
    if (!file) {
      throw new Error('Nenhum arquivo selecionado');
    }

    if (!file.name.toLowerCase().endsWith('.xlsx') && !file.name.toLowerCase().endsWith('.xls')) {
      throw new Error('Arquivo deve ser do tipo Excel (.xlsx ou .xls)');
    }

    if (file.size > 10 * 1024 * 1024) { // 10MB limit
      throw new Error('Arquivo muito grande. Limite máximo: 10MB');
    }

    setLoading(true);
    try {
      const rawData = await readExcelFile(file);
      
      if (rawData.length === 0) {
        throw new Error('Planilha está vazia');
      }

      // Validate each row
      const results = rawData.map((row, index) => processRow(row, index + 2)); // +2 because Excel rows start at 1 and we skip header
      
      setValidationResults(results);
      return results;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro ao processar arquivo';
      toast({
        title: 'Erro na validação',
        description: errorMessage,
        variant: 'destructive'
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Imports valid students to database
   */
  const importStudents = async (validationResults: ValidationResult[]): Promise<ImportSummary> => {
    if (!user) {
      throw new Error('Usuário não autenticado');
    }

    const validResults = validationResults.filter(result => result.isValid && result.data);
    
    if (validResults.length === 0) {
      throw new Error('Nenhum estudante válido para importar');
    }

    setLoading(true);
    let imported = 0;
    const errors: ValidationResult[] = [];

    try {
      // Process in batches to avoid timeout
      const batchSize = 10;
      const batches = [];

      for (let i = 0; i < validResults.length; i += batchSize) {
        batches.push(validResults.slice(i, i + batchSize));
      }

      // Initialize progress
      setImportProgress({
        current: 0,
        total: validResults.length,
        phase: 'importing',
        message: 'Importando estudantes...'
      });

      for (let batchIndex = 0; batchIndex < batches.length; batchIndex++) {
        const batch = batches[batchIndex];
        const insertData: EstudanteInsert[] = batch.map(result => ({
          user_id: user.id,
          nome: result.data!.nome,
          idade: result.data!.idade,
          genero: result.data!.genero,
          email: result.data!.email || null,
          telefone: result.data!.telefone || null,
          data_batismo: result.data!.data_batismo || null,
          cargo: result.data!.cargo,
          ativo: result.data!.ativo,
          observacoes: result.data!.observacoes || null,
          id_pai_mae: null // Will be handled in a second pass for parent relationships
        }));

        const { error } = await supabase
          .from('estudantes')
          .insert(insertData);

        if (error) {
          console.error('Batch import error:', error);
          // Add failed batch to errors
          batch.forEach(result => {
            errors.push({
              ...result,
              errors: [`Erro na importação: ${error.message}`]
            });
          });
        } else {
          imported += batch.length;
        }

        // Update progress
        setImportProgress({
          current: Math.min((batchIndex + 1) * batchSize, validResults.length),
          total: validResults.length,
          phase: 'importing',
          message: `Importando estudantes... ${Math.min((batchIndex + 1) * batchSize, validResults.length)}/${validResults.length}`
        });
      }

      // Second pass: Handle parent relationships
      if (imported > 0) {
        setImportProgress({
          current: validResults.length,
          total: validResults.length,
          phase: 'linking',
          message: 'Vinculando relacionamentos familiares...'
        });
        await linkParentChildRelationships(validResults);
      }

      // Complete progress
      setImportProgress({
        current: validResults.length,
        total: validResults.length,
        phase: 'complete',
        message: 'Importação concluída!'
      });

      const summary: ImportSummary = {
        totalRows: validationResults.length,
        validRows: validResults.length,
        invalidRows: validationResults.filter(r => !r.isValid).length,
        imported,
        errors: [...validationResults.filter(r => !r.isValid), ...errors],
        warnings: validationResults.filter(r => r.warnings.length > 0)
      };

      setImportSummary(summary);

      toast({
        title: 'Importação concluída',
        description: `${imported} estudantes importados com sucesso`,
        variant: imported > 0 ? 'default' : 'destructive'
      });

      return summary;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro na importação';
      toast({
        title: 'Erro na importação',
        description: errorMessage,
        variant: 'destructive'
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Links parent-child relationships after import
   */
  const linkParentChildRelationships = async (validResults: ValidationResult[]) => {
    if (!user) return;

    try {
      // Get all students (existing + newly imported) to create name-to-ID mapping
      const { data: allStudents } = await supabase
        .from('estudantes')
        .select('id, nome')
        .eq('user_id', user.id);

      if (!allStudents) return;

      // Create name-to-ID mapping
      const nameToIdMap = new Map<string, string>();
      allStudents.forEach(student => {
        nameToIdMap.set(student.nome.toLowerCase().trim(), student.id);
      });

      // Find students that need parent linking
      const studentsNeedingParents = validResults
        .filter(result =>
          result.isValid &&
          result.data &&
          result.data.parente_responsavel &&
          result.data.parente_responsavel.trim() !== ''
        )
        .map(result => ({
          nome: result.data!.nome,
          parentName: result.data!.parente_responsavel!.toLowerCase().trim()
        }));

      if (studentsNeedingParents.length === 0) return;

      // Process parent linking in batches
      const batchSize = 10;
      for (let i = 0; i < studentsNeedingParents.length; i += batchSize) {
        const batch = studentsNeedingParents.slice(i, i + batchSize);

        for (const student of batch) {
          const parentId = nameToIdMap.get(student.parentName);
          const studentId = nameToIdMap.get(student.nome.toLowerCase().trim());

          if (parentId && studentId && parentId !== studentId) {
            // Update the student's parent relationship
            await supabase
              .from('estudantes')
              .update({ id_pai_mae: parentId })
              .eq('id', studentId)
              .eq('user_id', user.id);
          }
        }
      }

      console.log(`Processed parent-child relationships for ${studentsNeedingParents.length} students`);
    } catch (error) {
      console.error('Error linking parent-child relationships:', error);
      // Don't throw error - this is a secondary operation
    }
  };

  /**
   * Checks for duplicate students by name
   */
  const checkDuplicates = async (students: ProcessedStudentData[]): Promise<string[]> => {
    if (!user) return [];

    try {
      const names = students.map(s => s.nome);
      const { data: existingStudents } = await supabase
        .from('estudantes')
        .select('nome')
        .eq('user_id', user.id)
        .in('nome', names);

      return existingStudents?.map(s => s.nome) || [];
    } catch (error) {
      console.error('Error checking duplicates:', error);
      return [];
    }
  };

  /**
   * Gets import statistics
   */
  const getImportStats = (results: ValidationResult[]) => {
    const valid = results.filter(r => r.isValid).length;
    const invalid = results.filter(r => !r.isValid).length;
    const warnings = results.filter(r => r.warnings.length > 0).length;

    return {
      total: results.length,
      valid,
      invalid,
      warnings,
      validPercentage: results.length > 0 ? Math.round((valid / results.length) * 100) : 0
    };
  };

  /**
   * Resets import state
   */
  const resetImport = () => {
    setValidationResults([]);
    setImportSummary(null);
    setImportProgress({ current: 0, total: 0, phase: 'importing', message: '' });
  };

  return {
    loading,
    validationResults,
    importSummary,
    importProgress,
    validateFile,
    importStudents,
    checkDuplicates,
    getImportStats,
    resetImport
  };
};

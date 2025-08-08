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

      for (const batch of batches) {
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
      }

      // TODO: Handle parent relationships in a second pass
      // This would require matching parent names to imported students

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
  };

  return {
    loading,
    validationResults,
    importSummary,
    validateFile,
    importStudents,
    checkDuplicates,
    getImportStats,
    resetImport
  };
};

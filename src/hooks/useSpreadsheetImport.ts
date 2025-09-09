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
   * Enhanced parent-child relationship linking with fuzzy matching
   */
  const linkParentChildRelationships = async (validResults: ValidationResult[]) => {
    if (!user) return;

    try {
      // Get all students with additional fields for better matching
      const { data: allStudents } = await supabase
        .from('estudantes')
        .select('id, nome, email, telefone')
        .eq('user_id', user.id);

      if (!allStudents) return;

      // Create enhanced mapping with multiple search strategies
      const studentMaps = {
        byName: new Map<string, string>(),
        byEmail: new Map<string, string>(),
        byPhone: new Map<string, string>(),
      };

      allStudents.forEach(student => {
        // Name mapping
        if (student.nome) {
          studentMaps.byName.set(student.nome.toLowerCase().trim(), student.id);
        }

        // Email mapping
        if (student.email) {
          studentMaps.byEmail.set(student.email.toLowerCase().trim(), student.id);
        }

        // Phone mapping
        if (student.telefone) {
          const normalizedPhone = normalizePhone(student.telefone);
          studentMaps.byPhone.set(normalizedPhone, student.id);
        }
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
          parentName: result.data!.parente_responsavel!.toLowerCase().trim(),
          email: result.data!.email,
          telefone: result.data!.telefone,
        }));

      if (studentsNeedingParents.length === 0) return;

      let linkedCount = 0;
      let notFoundCount = 0;

      // Process parent linking with enhanced matching
      for (const student of studentsNeedingParents) {
        const studentId = studentMaps.byName.get(student.nome.toLowerCase().trim());
        if (!studentId) continue;

        let parentId: string | null = null;

        // Strategy 1: Exact name match
        parentId = studentMaps.byName.get(student.parentName);

        // Strategy 2: Fuzzy name match across all students
        if (!parentId) {
          for (const [name, id] of studentMaps.byName) {
            if (calculateNameSimilarity(name, student.parentName) > 0.8) {
              parentId = id;
              break;
            }
          }
        }

        // Strategy 3: Email match (if parent email provided in notes or other field)
        if (!parentId && student.email) {
          // Check if parent might have similar email domain
          const emailDomain = student.email.split('@')[1];
          if (emailDomain) {
            for (const [email, id] of studentMaps.byEmail) {
              if (email.includes(emailDomain) &&
                  calculateNameSimilarity(
                    allStudents.find(s => s.id === id)?.nome || '',
                    student.parentName
                  ) > 0.7) {
                parentId = id;
                break;
              }
            }
          }
        }

        // Strategy 4: Phone-based matching
        if (!parentId && student.telefone) {
          const normalizedPhone = normalizePhone(student.telefone);
          // Look for similar phone numbers (same area code)
          const areaCode = normalizedPhone.substring(0, 4);
          for (const [phone, id] of studentMaps.byPhone) {
            if (phone.startsWith(areaCode) &&
                calculateNameSimilarity(
                  allStudents.find(s => s.id === id)?.nome || '',
                  student.parentName
                ) > 0.7) {
              parentId = id;
              break;
            }
          }
        }

        // Update relationship if parent found
        if (parentId && parentId !== studentId) {
          try {
            await supabase
              .from('estudantes')
              .update({ id_pai_mae: parentId })
              .eq('id', studentId)
              .eq('user_id', user.id);

            linkedCount++;
          } catch (updateError) {
            console.error(`Error linking ${student.nome} to parent:`, updateError);
          }
        } else {
          notFoundCount++;
          console.warn(`Parent not found for ${student.nome}: ${student.parentName}`);
        }
      }

      console.log(`Parent-child linking completed: ${linkedCount} linked, ${notFoundCount} not found`);
    } catch (error) {
      console.error('Error linking parent-child relationships:', error);
      // Don't throw error - this is a secondary operation
    }
  };

  /**
   * Enhanced duplicate detection using database function
   */
  const checkDuplicates = async (students: ProcessedStudentData[]): Promise<string[]> => {
    if (!user) return [];

    try {
      const duplicates: string[] = [];

      // Check each student using the database function
      for (const student of students) {
        const { data: isDuplicate } = await supabase
          .rpc('check_student_duplicate', {
            p_user_id: user.id,
            p_nome: student.nome,
            p_email: student.email || null,
            p_telefone: student.telefone || null
          });

        if (isDuplicate) {
          duplicates.push(student.nome);
        }
      }

      return duplicates;
    } catch (error) {
      console.error('Error checking duplicates:', error);
      return [];
    }
  };

  /**
   * Calculates name similarity using Levenshtein distance
   */
  const calculateNameSimilarity = (name1: string, name2: string): number => {
    const s1 = name1.toLowerCase().trim();
    const s2 = name2.toLowerCase().trim();

    if (s1 === s2) return 1;

    const longer = s1.length > s2.length ? s1 : s2;
    const shorter = s1.length > s2.length ? s2 : s1;

    if (longer.length === 0) return 1;

    const distance = levenshteinDistance(longer, shorter);
    return (longer.length - distance) / longer.length;
  };

  /**
   * Calculates Levenshtein distance between two strings
   */
  const levenshteinDistance = (str1: string, str2: string): number => {
    const matrix = Array(str2.length + 1).fill(null).map(() => Array(str1.length + 1).fill(null));

    for (let i = 0; i <= str1.length; i++) matrix[0][i] = i;
    for (let j = 0; j <= str2.length; j++) matrix[j][0] = j;

    for (let j = 1; j <= str2.length; j++) {
      for (let i = 1; i <= str1.length; i++) {
        const indicator = str1[i - 1] === str2[j - 1] ? 0 : 1;
        matrix[j][i] = Math.min(
          matrix[j][i - 1] + 1,
          matrix[j - 1][i] + 1,
          matrix[j - 1][i - 1] + indicator
        );
      }
    }

    return matrix[str2.length][str1.length];
  };

  /**
   * Normalizes phone number for comparison
   */
  const normalizePhone = (phone: string): string => {
    return phone.replace(/\D/g, '');
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

/**
 * React Hook for Enhanced Family Migration
 * 
 * This hook provides a React interface for managing the migration to the enhanced
 * family relationship system, including progress tracking and error handling.
 */

import { useState, useCallback, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { DataMigrationHelper, type MigrationResult, type MigrationOptions } from '@/utils/dataMigrationHelper';
import { EnhancedFamilyValidator } from '@/utils/enhancedFamilyValidation';
import type { EstudanteEnhanced, S38TComplianceCheck } from '@/types/enhanced-estudantes';

export interface MigrationState {
  isLoading: boolean;
  isChecking: boolean;
  isMigrated: boolean;
  migrationProgress: number;
  studentsCount: number;
  enhancedStudentsCount: number;
  familyLinksCount: number;
  lastResult?: MigrationResult;
  complianceReport?: S38TComplianceCheck[];
  error?: string;
}

export interface MigrationActions {
  checkMigrationStatus: () => Promise<void>;
  runMigration: (options?: Partial<MigrationOptions>) => Promise<MigrationResult>;
  runDryRun: () => Promise<MigrationResult>;
  rollbackMigration: () => Promise<MigrationResult>;
  generateComplianceReport: () => Promise<void>;
  clearError: () => void;
}

/**
 * Hook for managing enhanced family migration
 */
export function useEnhancedFamilyMigration(): MigrationState & MigrationActions {
  const { user } = useAuth();
  
  const [state, setState] = useState<MigrationState>({
    isLoading: false,
    isChecking: false,
    isMigrated: false,
    migrationProgress: 0,
    studentsCount: 0,
    enhancedStudentsCount: 0,
    familyLinksCount: 0
  });
  
  /**
   * Checks current migration status
   */
  const checkMigrationStatus = useCallback(async () => {
    if (!user?.id) return;
    
    setState(prev => ({ ...prev, isChecking: true, error: undefined }));
    
    try {
      const status = await DataMigrationHelper.getMigrationStatus(user.id);
      
      setState(prev => ({
        ...prev,
        isChecking: false,
        isMigrated: status.isMigrated,
        migrationProgress: status.migrationProgress,
        studentsCount: status.studentsCount,
        enhancedStudentsCount: status.enhancedStudentsCount,
        familyLinksCount: status.familyLinksCount
      }));
      
    } catch (error) {
      console.error('Error checking migration status:', error);
      setState(prev => ({
        ...prev,
        isChecking: false,
        error: error instanceof Error ? error.message : 'Failed to check migration status'
      }));
    }
  }, [user?.id]);
  
  /**
   * Runs the migration with specified options
   */
  const runMigration = useCallback(async (options: Partial<MigrationOptions> = {}): Promise<MigrationResult> => {
    if (!user?.id) {
      throw new Error('User not authenticated');
    }
    
    setState(prev => ({ ...prev, isLoading: true, error: undefined }));
    
    const migrationOptions: MigrationOptions = {
      dryRun: false,
      userId: user.id,
      preserveExistingData: true,
      autoInferRelationships: true,
      validateAfterMigration: true,
      ...options
    };
    
    try {
      console.log('🚀 Starting migration with options:', migrationOptions);
      
      const result = await DataMigrationHelper.migrateStudentData(migrationOptions);
      
      setState(prev => ({
        ...prev,
        isLoading: false,
        lastResult: result,
        error: result.success ? undefined : result.details.errors.join('; ')
      }));
      
      // Refresh status after migration
      if (result.success) {
        await checkMigrationStatus();
      }
      
      return result;
      
    } catch (error) {
      console.error('Migration failed:', error);
      const errorMessage = error instanceof Error ? error.message : 'Migration failed';
      
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: errorMessage
      }));
      
      return {
        success: false,
        message: errorMessage,
        details: {
          studentsProcessed: 0,
          relationshipsCreated: 0,
          errors: [errorMessage],
          warnings: []
        }
      };
    }
  }, [user?.id, checkMigrationStatus]);
  
  /**
   * Runs a dry run migration to preview changes
   */
  const runDryRun = useCallback(async (): Promise<MigrationResult> => {
    return runMigration({ dryRun: true });
  }, [runMigration]);
  
  /**
   * Rolls back the migration (emergency use only)
   */
  const rollbackMigration = useCallback(async (): Promise<MigrationResult> => {
    if (!user?.id) {
      throw new Error('User not authenticated');
    }
    
    setState(prev => ({ ...prev, isLoading: true, error: undefined }));
    
    try {
      console.log('🔄 Starting migration rollback...');
      
      const result = await DataMigrationHelper.rollbackMigration(user.id);
      
      setState(prev => ({
        ...prev,
        isLoading: false,
        lastResult: result,
        error: result.success ? undefined : result.details.errors.join('; ')
      }));
      
      // Refresh status after rollback
      if (result.success) {
        await checkMigrationStatus();
      }
      
      return result;
      
    } catch (error) {
      console.error('Rollback failed:', error);
      const errorMessage = error instanceof Error ? error.message : 'Rollback failed';
      
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: errorMessage
      }));
      
      return {
        success: false,
        message: errorMessage,
        details: {
          studentsProcessed: 0,
          relationshipsCreated: 0,
          errors: [errorMessage],
          warnings: []
        }
      };
    }
  }, [user?.id, checkMigrationStatus]);
  
  /**
   * Generates S-38-T compliance report
   */
  const generateComplianceReport = useCallback(async () => {
    if (!user?.id) return;
    
    setState(prev => ({ ...prev, isLoading: true, error: undefined }));
    
    try {
      // This would need to be implemented to load students with family data
      // For now, we'll create a placeholder
      const complianceReport: S38TComplianceCheck[] = [];
      
      setState(prev => ({
        ...prev,
        isLoading: false,
        complianceReport
      }));
      
    } catch (error) {
      console.error('Error generating compliance report:', error);
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to generate compliance report'
      }));
    }
  }, [user?.id]);
  
  /**
   * Clears any error state
   */
  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: undefined }));
  }, []);
  
  // Check migration status on mount and when user changes
  useEffect(() => {
    if (user?.id) {
      checkMigrationStatus();
    }
  }, [user?.id, checkMigrationStatus]);
  
  return {
    // State
    ...state,
    
    // Actions
    checkMigrationStatus,
    runMigration,
    runDryRun,
    rollbackMigration,
    generateComplianceReport,
    clearError
  };
}

/**
 * Hook for enhanced family validation
 */
export function useEnhancedFamilyValidation() {
  const [isValidating, setIsValidating] = useState(false);
  const [validationResults, setValidationResults] = useState<{
    studentValidations: Map<string, { isValid: boolean; errors: string[]; warnings: string[] }>;
    structureValidation?: { isValid: boolean; errors: string[]; warnings: string[]; suggestions: string[] };
    complianceReport?: S38TComplianceCheck[];
  }>({
    studentValidations: new Map()
  });
  
  /**
   * Validates a single student
   */
  const validateStudent = useCallback(async (student: EstudanteEnhanced) => {
    setIsValidating(true);
    
    try {
      const validation = EnhancedFamilyValidator.validateStudentData(student);
      
      setValidationResults(prev => ({
        ...prev,
        studentValidations: new Map(prev.studentValidations).set(student.id, validation)
      }));
      
      return validation;
      
    } catch (error) {
      console.error('Error validating student:', error);
      return {
        isValid: false,
        errors: [error instanceof Error ? error.message : 'Validation failed'],
        warnings: []
      };
    } finally {
      setIsValidating(false);
    }
  }, []);
  
  /**
   * Validates family structure
   */
  const validateFamilyStructure = useCallback(async (students: EstudanteEnhanced[]) => {
    setIsValidating(true);
    
    try {
      const validation = EnhancedFamilyValidator.validateFamilyStructure(students);
      
      setValidationResults(prev => ({
        ...prev,
        structureValidation: validation
      }));
      
      return validation;
      
    } catch (error) {
      console.error('Error validating family structure:', error);
      return {
        isValid: false,
        errors: [error instanceof Error ? error.message : 'Structure validation failed'],
        warnings: [],
        suggestions: []
      };
    } finally {
      setIsValidating(false);
    }
  }, []);
  
  /**
   * Validates family pairing for assignments
   */
  const validateFamilyPairing = useCallback(async (
    student1: EstudanteEnhanced,
    student2: EstudanteEnhanced
  ) => {
    setIsValidating(true);
    
    try {
      // Convert to EstudanteWithFamily format (simplified)
      const student1WithFamily = { ...student1, family_members: [], family_conflicts: [], nuclear_family_size: 0, is_adult_child: false, has_dependents: false, is_family_head: false, can_be_paired_with_opposite_gender: false, pairing_restrictions: { can_pair_with_males: true, can_pair_with_females: true, requires_family_relationship: false, family_member_ids: [] } };
      const student2WithFamily = { ...student2, family_members: [], family_conflicts: [], nuclear_family_size: 0, is_adult_child: false, has_dependents: false, is_family_head: false, can_be_paired_with_opposite_gender: false, pairing_restrictions: { can_pair_with_males: true, can_pair_with_females: true, requires_family_relationship: false, family_member_ids: [] } };
      
      const validation = await EnhancedFamilyValidator.validateFamilyPairing(
        student1WithFamily,
        student2WithFamily
      );
      
      return validation;
      
    } catch (error) {
      console.error('Error validating family pairing:', error);
      return {
        is_valid: false,
        warnings: [],
        violations: [error instanceof Error ? error.message : 'Pairing validation failed'],
        suggestions: [],
        confidence_level: 'low' as const
      };
    } finally {
      setIsValidating(false);
    }
  }, []);
  
  /**
   * Clears validation results
   */
  const clearValidationResults = useCallback(() => {
    setValidationResults({
      studentValidations: new Map()
    });
  }, []);
  
  return {
    isValidating,
    validationResults,
    validateStudent,
    validateFamilyStructure,
    validateFamilyPairing,
    clearValidationResults
  };
}
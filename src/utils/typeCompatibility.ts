/**
 * Type Compatibility Utilities
 * 
 * This module provides utilities to bridge between existing types and the new
 * enhanced family relationship types, ensuring backward compatibility during migration.
 */

import type { EstudanteRow, EstudanteWithParent } from '@/types/estudantes';
import type { 
  EstudanteEnhanced, 
  EstudanteWithFamily,
  EstudantesTableExtended,
  EstadoCivil,
  PapelFamiliar,
  RelacaoFamiliar
} from '@/types/enhanced-estudantes';

/**
 * Converts legacy EstudanteRow to enhanced format
 */
export function convertToEnhanced(legacy: EstudanteRow): EstudanteEnhanced {
  return {
    // Core fields (direct mapping)
    id: legacy.id,
    user_id: legacy.user_id,
    nome: legacy.nome,
    idade: legacy.idade || 0,
    genero: legacy.genero,
    email: legacy.email || undefined,
    telefone: legacy.telefone || undefined,
    data_batismo: legacy.data_batismo || undefined,
    cargo: legacy.cargo,
    id_pai_mae: legacy.id_pai_mae || undefined,
    ativo: legacy.ativo ?? true,
    observacoes: legacy.observacoes || undefined,
    created_at: legacy.created_at || new Date().toISOString(),
    updated_at: legacy.updated_at || new Date().toISOString(),
    
    // Enhanced fields with defaults
    familia: extractFamilyName(legacy.nome),
    data_nascimento: estimateBirthDate(legacy.idade),
    estado_civil: 'desconhecido' as EstadoCivil,
    papel_familiar: inferPapelFamiliar(legacy.idade || 0, legacy.genero),
    id_pai: undefined,
    id_mae: undefined,
    id_conjuge: undefined,
    coabitacao: true,
    menor: (legacy.idade || 0) < 18,
    responsavel_primario: undefined,
    responsavel_secundario: undefined,
    
    // Qualification fields (defaults to false if not present, but check if they exist in legacy data)
    chairman: (legacy as any).chairman ?? false,
    pray: (legacy as any).pray ?? false,
    tresures: (legacy as any).tresures ?? false,
    gems: (legacy as any).gems ?? false,
    reading: (legacy as any).reading ?? false,
    starting: (legacy as any).starting ?? false,
    following: (legacy as any).following ?? false,
    making: (legacy as any).making ?? false,
    explaining: (legacy as any).explaining ?? false,
    talk: (legacy as any).talk ?? false
  };
}

/**
 * Converts enhanced format back to legacy format for backward compatibility
 */
export function convertToLegacy(enhanced: EstudanteEnhanced): EstudanteRow {
  return {
    id: enhanced.id,
    user_id: enhanced.user_id,
    nome: enhanced.nome,
    idade: enhanced.idade,
    genero: enhanced.genero,
    email: enhanced.email || null,
    telefone: enhanced.telefone || null,
    data_batismo: enhanced.data_batismo || null,
    cargo: enhanced.cargo,
    id_pai_mae: enhanced.id_pai_mae || null,
    ativo: enhanced.ativo,
    observacoes: enhanced.observacoes || null,
    created_at: enhanced.created_at,
    updated_at: enhanced.updated_at
  };
}

/**
 * Converts EstudanteWithParent to EstudanteWithFamily
 */
export function convertToWithFamily(legacy: EstudanteWithParent): EstudanteWithFamily {
  const enhanced = convertToEnhanced(legacy);
  
  return {
    ...enhanced,
    
    // Family member references
    pai: undefined,
    mae: undefined,
    conjuge: undefined,
    filhos: [],
    responsavel_primario_info: undefined,
    responsavel_secundario_info: undefined,
    
    // Computed flags
    is_adult_child: isAdultChild(enhanced.papel_familiar),
    has_dependents: false, // Would need to be computed from actual data
    is_family_head: isFamilyHead(enhanced.papel_familiar, enhanced.idade),
    can_be_paired_with_opposite_gender: false, // Would need family relationship data
    
    // Family tree information
    family_members: [],
    family_conflicts: [],
    nuclear_family_size: 1,
    
    // S-38-T compliance information
    pairing_restrictions: {
      can_pair_with_males: enhanced.genero === 'masculino' || false, // Would need family data
      can_pair_with_females: enhanced.genero === 'feminino' || false, // Would need family data
      requires_family_relationship: enhanced.genero !== enhanced.genero, // Mixed gender requires family
      family_member_ids: []
    }
  };
}

/**
 * Merges enhanced data into existing legacy student
 */
export function mergeEnhancedData(
  legacy: EstudanteRow, 
  enhanced: Partial<EstudanteEnhanced>
): EstudanteEnhanced {
  const base = convertToEnhanced(legacy);
  
  return {
    ...base,
    ...enhanced,
    // Ensure core fields are not overwritten with undefined
    id: legacy.id,
    user_id: legacy.user_id,
    nome: legacy.nome,
    created_at: legacy.created_at || base.created_at,
    updated_at: enhanced.updated_at || new Date().toISOString()
  };
}

/**
 * Checks if a student has enhanced data
 */
export function hasEnhancedData(student: any): boolean {
  // Check if any enhanced fields are present (not just undefined/null)
  return !!(
    student.papel_familiar ||
    student.estado_civil ||
    student.id_pai ||
    student.id_mae ||
    student.id_conjuge ||
    student.menor !== null ||
    student.familia ||
    // Check for qualification fields
    student.chairman !== undefined ||
    student.pray !== undefined ||
    student.tresures !== undefined ||
    student.gems !== undefined ||
    student.reading !== undefined ||
    student.starting !== undefined ||
    student.following !== undefined ||
    student.making !== undefined ||
    student.explaining !== undefined ||
    student.talk !== undefined
  );
}

/**
 * Extracts family name from full name
 */
function extractFamilyName(nome: string): string {
  const parts = nome.trim().split(' ');
  return parts[parts.length - 1];
}

/**
 * Estimates birth date from age
 */
function estimateBirthDate(idade?: number): string | undefined {
  if (!idade) return undefined;
  
  const currentYear = new Date().getFullYear();
  const estimatedBirthYear = currentYear - idade;
  return `${estimatedBirthYear}-06-15`; // Mid-year estimate
}

/**
 * Infers papel_familiar from age and gender
 */
function inferPapelFamiliar(idade: number, genero: string): PapelFamiliar | undefined {
  if (idade >= 25) {
    return genero === 'masculino' ? 'pai' : 'mae';
  } else if (idade < 18) {
    return genero === 'masculino' ? 'filho' : 'filha';
  } else {
    return genero === 'masculino' ? 'filho_adulto' : 'filha_adulta';
  }
}

/**
 * Checks if papel_familiar indicates adult child
 */
function isAdultChild(papel?: PapelFamiliar): boolean {
  return papel === 'filho_adulto' || papel === 'filha_adulta';
}

/**
 * Checks if papel_familiar and age indicate family head
 */
function isFamilyHead(papel?: PapelFamiliar, idade?: number): boolean {
  return (papel === 'pai' || papel === 'mae') && (idade || 0) >= 25;
}

/**
 * Type guard to check if object is EstudanteEnhanced
 */
export function isEstudanteEnhanced(obj: any): obj is EstudanteEnhanced {
  return obj && typeof obj === 'object' && 
         'id' in obj && 
         'user_id' in obj && 
         'nome' in obj &&
         ('papel_familiar' in obj || 'estado_civil' in obj);
}

/**
 * Type guard to check if object is EstudanteWithFamily
 */
export function isEstudanteWithFamily(obj: any): obj is EstudanteWithFamily {
  return isEstudanteEnhanced(obj) && 
         'family_members' in obj && 
         'pairing_restrictions' in obj;
}

/**
 * Safely gets a field value with fallback
 */
export function safeGet<T>(obj: any, field: string, fallback: T): T {
  return obj && typeof obj === 'object' && field in obj ? obj[field] : fallback;
}

/**
 * Creates a compatibility wrapper for components expecting legacy types
 */
export class TypeCompatibilityWrapper {
  
  /**
   * Wraps enhanced student data for legacy components
   */
  static wrapForLegacy(enhanced: EstudanteEnhanced): EstudanteWithParent {
    const legacy = convertToLegacy(enhanced);
    
    return {
      ...legacy,
      pai_mae: enhanced.id_pai || enhanced.id_mae ? {
        ...legacy,
        id: enhanced.id_pai || enhanced.id_mae || '',
        nome: 'Responsável', // Would need to be fetched from actual data
        genero: enhanced.id_pai ? 'masculino' : 'feminino'
      } : undefined,
      filhos: [] // Would need to be populated from actual data
    };
  }
  
  /**
   * Adapts enhanced data for existing hooks and utilities
   */
  static adaptForExistingHooks(enhanced: EstudanteEnhanced[]): EstudanteRow[] {
    return enhanced.map(convertToLegacy);
  }
  
  /**
   * Creates a migration-aware data loader
   */
  static createMigrationAwareLoader() {
    return {
      async loadStudent(id: string): Promise<EstudanteEnhanced | null> {
        // This would integrate with actual data loading logic
        // For now, return null as placeholder
        return null;
      },
      
      async loadStudents(userId: string): Promise<EstudanteEnhanced[]> {
        // This would integrate with actual data loading logic
        // For now, return empty array as placeholder
        return [];
      },
      
      async saveStudent(student: EstudanteEnhanced): Promise<boolean> {
        // This would integrate with actual data saving logic
        // For now, return false as placeholder
        return false;
      }
    };
  }
}

/**
 * Validation utilities for enhanced types
 */
export class EnhancedTypeValidator {
  
  /**
   * Validates EstadoCivil value
   */
  static isValidEstadoCivil(value: any): value is EstadoCivil {
    return typeof value === 'string' && 
           ['solteiro', 'casado', 'viuvo', 'desconhecido'].includes(value);
  }
  
  /**
   * Validates PapelFamiliar value
   */
  static isValidPapelFamiliar(value: any): value is PapelFamiliar {
    return typeof value === 'string' && 
           ['pai', 'mae', 'filho', 'filha', 'filho_adulto', 'filha_adulta'].includes(value);
  }
  
  /**
   * Validates RelacaoFamiliar value
   */
  static isValidRelacaoFamiliar(value: any): value is RelacaoFamiliar {
    return typeof value === 'string' && 
           ['conjuge', 'filho_de', 'tutor_de'].includes(value);
  }
  
  /**
   * Validates enhanced student data structure
   */
  static validateEnhancedStudent(student: any): {
    isValid: boolean;
    errors: string[];
    warnings: string[];
  } {
    const errors: string[] = [];
    const warnings: string[] = [];
    
    // Required fields
    if (!student.id) errors.push('ID is required');
    if (!student.user_id) errors.push('User ID is required');
    if (!student.nome) errors.push('Nome is required');
    if (typeof student.idade !== 'number') errors.push('Idade must be a number');
    if (!student.genero) errors.push('Genero is required');
    if (!student.cargo) errors.push('Cargo is required');
    
    // Enhanced field validation
    if (student.estado_civil && !this.isValidEstadoCivil(student.estado_civil)) {
      errors.push('Invalid estado_civil value');
    }
    
    if (student.papel_familiar && !this.isValidPapelFamiliar(student.papel_familiar)) {
      errors.push('Invalid papel_familiar value');
    }
    
    // Logical consistency checks
    if (student.menor === true && student.idade >= 18) {
      warnings.push('Student marked as minor but age is 18 or older');
    }
    
    if (student.menor === false && student.idade < 18) {
      warnings.push('Student not marked as minor but age is under 18');
    }
    
    if (student.id_pai === student.id) {
      errors.push('Student cannot be their own father');
    }
    
    if (student.id_mae === student.id) {
      errors.push('Student cannot be their own mother');
    }
    
    if (student.id_conjuge === student.id) {
      errors.push('Student cannot be their own spouse');
    }
    
    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }
}

/**
 * Migration status utilities
 */
export class MigrationStatusHelper {
  
  /**
   * Calculates migration progress for a list of students
   */
  static calculateMigrationProgress(students: any[]): {
    progress: number;
    migrated: number;
    total: number;
    needsMigration: any[];
  } {
    const total = students.length;
    const migrated = students.filter(hasEnhancedData).length;
    const progress = total > 0 ? (migrated / total) * 100 : 0;
    const needsMigration = students.filter(s => !hasEnhancedData(s));
    
    return {
      progress,
      migrated,
      total,
      needsMigration
    };
  }
  
  /**
   * Identifies students that need migration
   */
  static identifyMigrationCandidates(students: any[]): {
    candidates: any[];
    reasons: Record<string, string[]>;
  } {
    const candidates: any[] = [];
    const reasons: Record<string, string[]> = {};
    
    students.forEach(student => {
      const studentReasons: string[] = [];
      
      if (!hasEnhancedData(student)) {
        studentReasons.push('Missing enhanced family data');
      }
      
      if (!student.familia) {
        studentReasons.push('Missing family surname');
      }
      
      if (student.menor === null || student.menor === undefined) {
        studentReasons.push('Minor status not set');
      }
      
      if (!student.papel_familiar) {
        studentReasons.push('Family role not defined');
      }
      
      if (studentReasons.length > 0) {
        candidates.push(student);
        reasons[student.id] = studentReasons;
      }
    });
    
    return { candidates, reasons };
  }
  
  /**
   * Generates migration recommendations
   */
  static generateMigrationRecommendations(students: any[]): {
    recommendations: string[];
    priority: 'high' | 'medium' | 'low';
    estimatedTime: string;
  } {
    const { progress, total, needsMigration } = this.calculateMigrationProgress(students);
    const recommendations: string[] = [];
    
    if (progress === 0) {
      recommendations.push('Execute full migration to enable enhanced family features');
      recommendations.push('Run dry-run first to preview changes');
      recommendations.push('Backup data before migration');
    } else if (progress < 50) {
      recommendations.push('Complete partial migration to ensure data consistency');
      recommendations.push('Review existing enhanced data for accuracy');
    } else if (progress < 100) {
      recommendations.push('Finish migration for remaining students');
      recommendations.push('Validate family relationships');
    } else {
      recommendations.push('Migration complete - validate family relationships');
      recommendations.push('Run compliance checks');
    }
    
    const priority = progress === 0 ? 'high' : progress < 80 ? 'medium' : 'low';
    const estimatedTime = total < 50 ? '< 5 minutes' : total < 200 ? '5-15 minutes' : '15-30 minutes';
    
    return {
      recommendations,
      priority,
      estimatedTime
    };
  }
}
/**
 * Supabase Type Extensions for Enhanced Family Relationships
 * 
 * This file extends the auto-generated Supabase types to include the new
 * enhanced family relationship fields without modifying the generated file.
 */

import type { Database } from '@/integrations/supabase/types';

// ============================================================================
// ENHANCED ENUM TYPES
// ============================================================================

export type EstadoCivil = 'solteiro' | 'casado' | 'viuvo' | 'desconhecido';
export type PapelFamiliar = 'pai' | 'mae' | 'filho' | 'filha' | 'filho_adulto' | 'filha_adulta';
export type RelacaoFamiliar = 'conjuge' | 'filho_de' | 'tutor_de';

// ============================================================================
// EXTENDED DATABASE TYPES
// ============================================================================

// Extended estudantes table with new fields
export interface EstudantesTableExtended extends Database['public']['Tables']['estudantes']['Row'] {
  // New enhanced fields
  data_nascimento_estimada?: string;
  estado_civil?: EstadoCivil;
  papel_familiar?: PapelFamiliar;
  id_pai?: string;
  id_mae?: string;
  id_conjuge?: string;
  coabitacao?: boolean;
  menor?: boolean;
  responsavel_primario?: string;
  responsavel_secundario?: string;
  familia?: string;
  
  // Qualification fields (if not already present)
  chairman?: boolean;
  pray?: boolean;
  tresures?: boolean;
  gems?: boolean;
  reading?: boolean;
  starting?: boolean;
  following?: boolean;
  making?: boolean;
  explaining?: boolean;
  talk?: boolean;
}

// Extended estudantes insert type
export interface EstudantesInsertExtended extends Database['public']['Tables']['estudantes']['Insert'] {
  data_nascimento_estimada?: string;
  estado_civil?: EstadoCivil;
  papel_familiar?: PapelFamiliar;
  id_pai?: string;
  id_mae?: string;
  id_conjuge?: string;
  coabitacao?: boolean;
  menor?: boolean;
  responsavel_primario?: string;
  responsavel_secundario?: string;
  familia?: string;
  chairman?: boolean;
  pray?: boolean;
  tresures?: boolean;
  gems?: boolean;
  reading?: boolean;
  starting?: boolean;
  following?: boolean;
  making?: boolean;
  explaining?: boolean;
  talk?: boolean;
}

// Extended estudantes update type
export interface EstudantesUpdateExtended extends Database['public']['Tables']['estudantes']['Update'] {
  data_nascimento_estimada?: string;
  estado_civil?: EstadoCivil;
  papel_familiar?: PapelFamiliar;
  id_pai?: string;
  id_mae?: string;
  id_conjuge?: string;
  coabitacao?: boolean;
  menor?: boolean;
  responsavel_primario?: string;
  responsavel_secundario?: string;
  familia?: string;
  chairman?: boolean;
  pray?: boolean;
  tresures?: boolean;
  gems?: boolean;
  reading?: boolean;
  starting?: boolean;
  following?: boolean;
  making?: boolean;
  explaining?: boolean;
  talk?: boolean;
}

// New family_links table type
export interface FamilyLinksTable {
  Row: {
    id: string;
    user_id: string;
    source_id: string;
    target_id: string;
    relacao: RelacaoFamiliar;
    created_at: string;
  };
  Insert: {
    id?: string;
    user_id: string;
    source_id: string;
    target_id: string;
    relacao: RelacaoFamiliar;
    created_at?: string;
  };
  Update: {
    id?: string;
    user_id?: string;
    source_id?: string;
    target_id?: string;
    relacao?: RelacaoFamiliar;
    created_at?: string;
  };
}

// Extended designacoes table with new tracking fields
export interface DesignacoesTableExtended extends Database['public']['Tables']['designacoes']['Row'] {
  generation_algorithm_version?: string;
  confidence_score?: number;
  alternative_suggestions?: any; // JSON field
  feedback_rating?: number;
}

export interface DesignacoesInsertExtended extends Database['public']['Tables']['designacoes']['Insert'] {
  generation_algorithm_version?: string;
  confidence_score?: number;
  alternative_suggestions?: any;
  feedback_rating?: number;
}

export interface DesignacoesUpdateExtended extends Database['public']['Tables']['designacoes']['Update'] {
  generation_algorithm_version?: string;
  confidence_score?: number;
  alternative_suggestions?: any;
  feedback_rating?: number;
}

// Extended programas table with new processing fields
export interface ProgramasTableExtended extends Database['public']['Tables']['programas']['Row'] {
  processing_status?: string;
  template_version?: number;
  content_hash?: string;
  processing_notes?: string;
}

// ============================================================================
// EXTENDED DATABASE INTERFACE
// ============================================================================

export interface DatabaseExtended extends Database {
  public: Database['public'] & {
    Tables: Database['public']['Tables'] & {
      estudantes: {
        Row: EstudantesTableExtended;
        Insert: EstudantesInsertExtended;
        Update: EstudantesUpdateExtended;
        Relationships: Database['public']['Tables']['estudantes']['Relationships'] & [
          {
            foreignKeyName: "estudantes_id_pai_fkey";
            columns: ["id_pai"];
            isOneToOne: false;
            referencedRelation: "estudantes";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "estudantes_id_mae_fkey";
            columns: ["id_mae"];
            isOneToOne: false;
            referencedRelation: "estudantes";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "estudantes_id_conjuge_fkey";
            columns: ["id_conjuge"];
            isOneToOne: false;
            referencedRelation: "estudantes";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "estudantes_responsavel_primario_fkey";
            columns: ["responsavel_primario"];
            isOneToOne: false;
            referencedRelation: "estudantes";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "estudantes_responsavel_secundario_fkey";
            columns: ["responsavel_secundario"];
            isOneToOne: false;
            referencedRelation: "estudantes";
            referencedColumns: ["id"];
          }
        ];
      };
      family_links: FamilyLinksTable;
      designacoes: {
        Row: DesignacoesTableExtended;
        Insert: DesignacoesInsertExtended;
        Update: DesignacoesUpdateExtended;
        Relationships: Database['public']['Tables']['designacoes']['Relationships'];
      };
      programas: {
        Row: ProgramasTableExtended;
        Insert: Database['public']['Tables']['programas']['Insert'] & {
          processing_status?: string;
          template_version?: number;
          content_hash?: string;
          processing_notes?: string;
        };
        Update: Database['public']['Tables']['programas']['Update'] & {
          processing_status?: string;
          template_version?: number;
          content_hash?: string;
          processing_notes?: string;
        };
        Relationships: Database['public']['Tables']['programas']['Relationships'];
      };
    };
    Enums: Database['public']['Enums'] & {
      estado_civil: EstadoCivil;
      papel_familiar: PapelFamiliar;
      relacao_familiar: RelacaoFamiliar;
    };
    Functions: Database['public']['Functions'] & {
      get_family_members: {
        Args: { student_id: string };
        Returns: Array<{
          id: string;
          nome: string;
          genero: Database['public']['Enums']['app_genero'];
          idade: number;
          relacao: string;
        }>;
      };
      can_students_be_paired: {
        Args: { student1_id: string; student2_id: string };
        Returns: boolean;
      };
    };
  };
}

// ============================================================================
// CONVENIENCE TYPE ALIASES
// ============================================================================

export type EstudanteRowExtended = EstudantesTableExtended;
export type EstudanteInsertExtended = EstudantesInsertExtended;
export type EstudanteUpdateExtended = EstudantesUpdateExtended;

export type FamilyLinkRow = FamilyLinksTable['Row'];
export type FamilyLinkInsert = FamilyLinksTable['Insert'];
export type FamilyLinkUpdate = FamilyLinksTable['Update'];

export type DesignacaoRowExtended = DesignacoesTableExtended;
export type DesignacaoInsertExtended = DesignacoesInsertExtended;
export type DesignacaoUpdateExtended = DesignacoesUpdateExtended;

export type ProgramaRowExtended = ProgramasTableExtended;

// ============================================================================
// UTILITY TYPES FOR QUERIES
// ============================================================================

// Type for estudante with family relationships populated
export interface EstudanteWithFamilyRelations extends EstudanteRowExtended {
  pai?: EstudanteRowExtended;
  mae?: EstudanteRowExtended;
  conjuge?: EstudanteRowExtended;
  filhos?: EstudanteRowExtended[];
  responsavel_primario_info?: EstudanteRowExtended;
  responsavel_secundario_info?: EstudanteRowExtended;
  family_links_as_source?: FamilyLinkRow[];
  family_links_as_target?: FamilyLinkRow[];
}

// Type for designacao with student information
export interface DesignacaoWithStudents extends DesignacaoRowExtended {
  estudante?: EstudanteWithFamilyRelations;
  ajudante?: EstudanteWithFamilyRelations;
  programa?: ProgramaRowExtended;
}

// Type for programa with assignments
export interface ProgramaWithAssignments extends ProgramaRowExtended {
  designacoes?: DesignacaoWithStudents[];
  assignment_count?: number;
}

// ============================================================================
// QUERY BUILDER HELPERS
// ============================================================================

// Helper type for building complex queries with joins
export type EstudanteQueryBuilder = {
  select: string;
  joins: {
    pai?: boolean;
    mae?: boolean;
    conjuge?: boolean;
    filhos?: boolean;
    responsavel_primario?: boolean;
    responsavel_secundario?: boolean;
    family_links?: boolean;
  };
};

// Common query patterns
export const ESTUDANTE_QUERY_PATTERNS = {
  BASIC: '*',
  WITH_FAMILY: `
    *,
    pai:id_pai(*),
    mae:id_mae(*),
    conjuge:id_conjuge(*),
    responsavel_primario_info:responsavel_primario(*),
    responsavel_secundario_info:responsavel_secundario(*)
  `,
  WITH_CHILDREN: `
    *,
    filhos:estudantes!id_pai(*),
    filhas:estudantes!id_mae(*)
  `,
  WITH_ALL_RELATIONS: `
    *,
    pai:id_pai(*),
    mae:id_mae(*),
    conjuge:id_conjuge(*),
    filhos:estudantes!id_pai(*),
    filhas:estudantes!id_mae(*),
    responsavel_primario_info:responsavel_primario(*),
    responsavel_secundario_info:responsavel_secundario(*),
    family_links_as_source:family_links!source_id(*),
    family_links_as_target:family_links!target_id(*)
  `
} as const;

export const DESIGNACAO_QUERY_PATTERNS = {
  BASIC: '*',
  WITH_STUDENTS: `
    *,
    estudante:id_estudante(*),
    ajudante:id_ajudante(*)
  `,
  WITH_STUDENTS_AND_FAMILY: `
    *,
    estudante:id_estudante(${ESTUDANTE_QUERY_PATTERNS.WITH_FAMILY}),
    ajudante:id_ajudante(${ESTUDANTE_QUERY_PATTERNS.WITH_FAMILY}),
    programa:id_programa(*)
  `
} as const;

// ============================================================================
// VALIDATION HELPERS
// ============================================================================

export const isEstadoCivil = (value: string): value is EstadoCivil => {
  return ['solteiro', 'casado', 'viuvo', 'desconhecido'].includes(value);
};

export const isPapelFamiliar = (value: string): value is PapelFamiliar => {
  return ['pai', 'mae', 'filho', 'filha', 'filho_adulto', 'filha_adulta'].includes(value);
};

export const isRelacaoFamiliar = (value: string): value is RelacaoFamiliar => {
  return ['conjuge', 'filho_de', 'tutor_de'].includes(value);
};

// ============================================================================
// MIGRATION HELPERS
// ============================================================================

export interface MigrationStatus {
  hasEnhancedFields: boolean;
  hasFamilyLinks: boolean;
  migrationProgress: number;
  needsMigration: boolean;
}

export const checkMigrationStatus = (student: any): MigrationStatus => {
  const hasEnhancedFields = !!(
    student.papel_familiar ||
    student.estado_civil ||
    student.id_pai ||
    student.id_mae ||
    student.id_conjuge ||
    student.menor !== null
  );
  
  return {
    hasEnhancedFields,
    hasFamilyLinks: false, // Would need to check family_links table
    migrationProgress: hasEnhancedFields ? 100 : 0,
    needsMigration: !hasEnhancedFields
  };
};
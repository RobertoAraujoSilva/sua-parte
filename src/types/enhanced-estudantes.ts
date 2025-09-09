/**
 * Enhanced TypeScript Types for Sistema Ministerial
 * Based on estudantes_enriquecido.xlsx structure analysis
 * 
 * This file contains the enhanced type definitions that support the new
 * family relationship system and improved data structure.
 */

import { Database } from "@/integrations/supabase/types";

// ============================================================================
// ENUM TYPES (matching database enums)
// ============================================================================

export type EstadoCivil = 'solteiro' | 'casado' | 'viuvo' | 'desconhecido';
export type PapelFamiliar = 'pai' | 'mae' | 'filho' | 'filha' | 'filho_adulto' | 'filha_adulta';
export type RelacaoFamiliar = 'conjuge' | 'filho_de' | 'tutor_de';
export type Genero = 'masculino' | 'feminino';

// Cargo types (existing)
export type Cargo = 
  | 'anciao' 
  | 'servo_ministerial' 
  | 'pioneiro_regular' 
  | 'publicador_batizado' 
  | 'publicador_nao_batizado' 
  | 'estudante_novo';

// ============================================================================
// BASE DATABASE TYPES
// ============================================================================

// Enhanced database row type
export type EstudanteEnhancedRow = Database['public']['Tables']['estudantes']['Row'] & {
  // New enhanced fields
  data_nascimento?: string;
  estado_civil: EstadoCivil;
  papel_familiar?: PapelFamiliar;
  id_pai?: string;
  id_mae?: string;
  id_conjuge?: string;
  coabitacao: boolean;
  menor?: boolean;
  responsavel_primario?: string;
  responsavel_secundario?: string;
  familia?: string;
};

export type FamilyLinkRow = {
  id: string;
  user_id: string;
  source_id: string;
  target_id: string;
  relacao: RelacaoFamiliar;
  created_at: string;
};

// ============================================================================
// ENHANCED STUDENT INTERFACE (32+ fields from Excel)
// ============================================================================

export interface EstudanteEnhanced {
  // Core identification fields
  id: string;
  user_id: string;
  familia?: string;
  nome: string;
  idade: number;
  genero: Genero;
  
  // Contact information
  email?: string;
  telefone?: string;
  
  // Spiritual information
  data_batismo?: string; // ISO date string
  cargo: Cargo;
  
  // Legacy compatibility
  id_pai_mae?: string; // Maintained for backward compatibility
  
  // Status and metadata
  ativo: boolean;
  observacoes?: string;
  created_at: string; // ISO datetime string
  updated_at: string; // ISO datetime string
  
  // Qualification flags (S-38-T compliance)
  chairman: boolean;    // Pode presidir?
  pray: boolean;        // Pode orar?
  tresures: boolean;    // Apto a "Tesouros"?
  gems: boolean;        // Apto a "Joias"?
  reading: boolean;     // Apto a Leitura da Bíblia
  starting: boolean;    // Apto a Iniciar Conversação
  following: boolean;   // Apto a Fazer Revisita
  making: boolean;      // Apto a Fazer Discípulos (Estudo)
  explaining: boolean;  // Apto a Explicar Crenças
  talk: boolean;        // Apto ao Discurso 1
  
  // NEW ENHANCED RELATIONSHIP FIELDS
  data_nascimento?: string; // ISO date string
  estado_civil: EstadoCivil;
  papel_familiar?: PapelFamiliar;
  id_pai?: string;
  id_mae?: string;
  id_conjuge?: string;
  coabitacao: boolean;
  menor?: boolean;
  responsavel_primario?: string;
  responsavel_secundario?: string;
}

// ============================================================================
// FAMILY RELATIONSHIP INTERFACE
// ============================================================================

export interface FamilyLink {
  id: string;
  user_id: string;
  source_id: string;
  target_id: string;
  relacao: RelacaoFamiliar;
  created_at: string;
}

// ============================================================================
// COMPUTED/DERIVED INTERFACES
// ============================================================================

// Extended interface with computed fields for UI
export interface EstudanteWithFamily extends EstudanteEnhanced {
  // Family member references (populated via joins)
  pai?: EstudanteEnhanced;
  mae?: EstudanteEnhanced;
  conjuge?: EstudanteEnhanced;
  filhos?: EstudanteEnhanced[];
  responsavel_primario_info?: EstudanteEnhanced;
  responsavel_secundario_info?: EstudanteEnhanced;
  
  // Computed flags
  is_adult_child: boolean;        // filho_adulto or filha_adulta
  has_dependents: boolean;        // has children or is responsible for minors
  is_family_head: boolean;        // pai or mae with dependents
  can_be_paired_with_opposite_gender: boolean; // has family members of opposite gender
  
  // Family tree information
  family_members: EstudanteEnhanced[];
  family_conflicts: string[];
  nuclear_family_size: number;
  
  // S-38-T compliance information
  pairing_restrictions: {
    can_pair_with_males: boolean;
    can_pair_with_females: boolean;
    requires_family_relationship: boolean;
    family_member_ids: string[];
  };
}

// ============================================================================
// ASSIGNMENT-RELATED INTERFACES
// ============================================================================

// Enhanced assignment interface with family validation
export interface DesignacaoEnhanced {
  id: string;
  id_programa: string;
  id_estudante: string;
  id_ajudante?: string;
  numero_parte: number;
  titulo_parte?: string;
  tipo_parte: string;
  tempo_minutos: number;
  cena?: string;
  confirmado: boolean;
  data_inicio_semana: string;
  user_id: string;
  created_at: string;
  updated_at: string;
  
  // Enhanced tracking fields
  generation_algorithm_version?: string;
  confidence_score?: number;
  alternative_suggestions?: AlternativeSuggestion[];
  feedback_rating?: number;
  
  // Family validation results
  family_compliance_status: 'compliant' | 'warning' | 'violation';
  family_validation_notes?: string[];
  
  // Student information (populated via joins)
  estudante?: EstudanteWithFamily;
  ajudante?: EstudanteWithFamily;
}

// ============================================================================
// SUPPORTING INTERFACES
// ============================================================================

export interface AlternativeSuggestion {
  id_estudante: string;
  id_ajudante?: string;
  confidence_score: number;
  reason: string;
  compliance_issues?: string[];
  family_relationship?: string;
}

export interface FamilyValidationResult {
  is_valid: boolean;
  warnings: string[];
  violations: string[];
  suggestions: string[];
  relationship_type?: string;
  confidence_level: 'high' | 'medium' | 'low';
}

export interface S38TComplianceCheck {
  rule_name: string;
  is_compliant: boolean;
  severity: 'error' | 'warning' | 'info';
  message: string;
  affected_students: string[];
  suggested_alternatives?: string[];
}

// ============================================================================
// FILTER AND SEARCH INTERFACES
// ============================================================================

export interface EstudanteFilters {
  searchTerm: string;
  cargo: Cargo | 'todos';
  genero: Genero | 'todos';
  ativo: boolean | 'todos';
  estado_civil?: EstadoCivil | 'todos';
  papel_familiar?: PapelFamiliar | 'todos';
  menor?: boolean | 'todos';
  familia?: string;
  has_family_relationships?: boolean;
  idade_min?: number;
  idade_max?: number;
  qualifications?: {
    chairman?: boolean;
    pray?: boolean;
    reading?: boolean;
    talk?: boolean;
  };
}

export interface FamilyFilters {
  familia: string;
  include_extended_family: boolean;
  only_active_members: boolean;
  include_minors: boolean;
  relationship_types?: RelacaoFamiliar[];
}

// ============================================================================
// STATISTICS AND ANALYTICS INTERFACES
// ============================================================================

export interface EstudanteStatistics {
  total: number;
  ativos: number;
  inativos: number;
  menores: number;
  homens: number;
  mulheres: number;
  
  // Enhanced statistics
  families: number;
  nuclear_families: number;
  single_parents: number;
  married_couples: number;
  adult_children: number;
  
  // By cargo
  cargoStats: Record<Cargo, number>;
  
  // By estado_civil
  estadoCivilStats: Record<EstadoCivil, number>;
  
  // By papel_familiar
  papelFamiliarStats: Record<PapelFamiliar, number>;
  
  // Family relationship statistics
  family_relationships: {
    parent_child: number;
    spouse: number;
    guardian: number;
    total_links: number;
  };
  
  // S-38-T compliance statistics
  s38t_compliance: {
    can_read_bible: number;
    can_give_talks: number;
    can_do_demonstrations: number;
    can_be_paired_mixed_gender: number;
  };
}

// ============================================================================
// IMPORT/EXPORT INTERFACES
// ============================================================================

export interface ExcelImportRow {
  // All 32+ fields from Excel structure
  id?: string;
  user_id?: string;
  familia?: string;
  nome: string;
  idade: number;
  genero: string;
  email?: string;
  telefone?: string;
  data_batismo?: string;
  cargo: string;
  id_pai_mae?: string;
  ativo: boolean;
  observacoes?: string;
  chairman: boolean;
  pray: boolean;
  tresures: boolean;
  gems: boolean;
  reading: boolean;
  starting: boolean;
  following: boolean;
  making: boolean;
  explaining: boolean;
  talk: boolean;
  data_nascimento?: string;
  estado_civil?: string;
  papel_familiar?: string;
  id_pai?: string;
  id_mae?: string;
  id_conjuge?: string;
  coabitacao?: boolean;
  menor?: boolean;
  responsavel_primario?: string;
  responsavel_secundario?: string;
}

export interface ImportValidationResult {
  valid_rows: ExcelImportRow[];
  invalid_rows: Array<{
    row: ExcelImportRow;
    errors: string[];
    line_number: number;
  }>;
  warnings: Array<{
    row: ExcelImportRow;
    warnings: string[];
    line_number: number;
  }>;
  summary: {
    total_rows: number;
    valid_rows: number;
    invalid_rows: number;
    warnings: number;
    families_detected: number;
    relationships_detected: number;
  };
  family_analysis: {
    detected_families: Array<{
      familia: string;
      members: number;
      parents: number;
      children: number;
      relationships: Array<{
        type: RelacaoFamiliar;
        count: number;
      }>;
    }>;
  };
}

// ============================================================================
// UTILITY TYPES
// ============================================================================

// Type for creating new students (some fields optional)
export type CreateEstudanteInput = Omit<
  EstudanteEnhanced, 
  'id' | 'created_at' | 'updated_at'
> & {
  id?: string;
};

// Type for updating students (most fields optional)
export type UpdateEstudanteInput = Partial<
  Omit<EstudanteEnhanced, 'id' | 'user_id' | 'created_at'>
>;

// Type for family relationship operations
export type CreateFamilyLinkInput = Omit<FamilyLink, 'id' | 'created_at'>;

// Type for assignment generation with family context
export interface AssignmentGenerationContext {
  students: EstudanteWithFamily[];
  family_relationships: FamilyLink[];
  historical_assignments: DesignacaoEnhanced[];
  s38t_rules: S38TComplianceCheck[];
  preferences: {
    prefer_family_pairs: boolean;
    balance_by_family: boolean;
    avoid_consecutive_assignments: boolean;
  };
}

// ============================================================================
// CONSTANTS AND MAPPINGS
// ============================================================================

export const ESTADO_CIVIL_LABELS: Record<EstadoCivil, string> = {
  solteiro: 'Solteiro(a)',
  casado: 'Casado(a)',
  viuvo: 'Viúvo(a)',
  desconhecido: 'Não informado'
};

export const PAPEL_FAMILIAR_LABELS: Record<PapelFamiliar, string> = {
  pai: 'Pai',
  mae: 'Mãe',
  filho: 'Filho',
  filha: 'Filha',
  filho_adulto: 'Filho (adulto)',
  filha_adulta: 'Filha (adulta)'
};

export const RELACAO_FAMILIAR_LABELS: Record<RelacaoFamiliar, string> = {
  conjuge: 'Cônjuge',
  filho_de: 'Filho(a) de',
  tutor_de: 'Responsável por'
};

export const CARGO_LABELS: Record<Cargo, string> = {
  anciao: 'Ancião',
  servo_ministerial: 'Servo Ministerial',
  pioneiro_regular: 'Pioneiro Regular',
  publicador_batizado: 'Publicador Batizado',
  publicador_nao_batizado: 'Publicador Não Batizado',
  estudante_novo: 'Estudante'
};

export const GENERO_LABELS: Record<Genero, string> = {
  masculino: 'Masculino',
  feminino: 'Feminino'
};

// ============================================================================
// VALIDATION CONSTANTS
// ============================================================================

export const VALIDATION_RULES = {
  nome: {
    required: true,
    minLength: 2,
    maxLength: 100,
  },
  idade: {
    required: true,
    min: 1,
    max: 120,
  },
  email: {
    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  },
  telefone: {
    pattern: /^[\d\s\-()]+$/,
    minLength: 8,
    maxLength: 20,
  },
  familia: {
    maxLength: 100,
  },
} as const;

// S-38-T compliance rules
export const S38T_RULES = {
  BIBLE_READING_MALE_ONLY: 'Leitura da Bíblia - apenas homens',
  TALKS_QUALIFIED_MALES: 'Discursos - apenas homens qualificados',
  MIXED_GENDER_PAIRS_FAMILY_ONLY: 'Pares de gêneros diferentes - apenas familiares',
  MINORS_SAME_GENDER: 'Menores de idade - sempre mesmo gênero',
  ONE_ASSIGNMENT_PER_WEEK: 'Máximo uma designação por semana por estudante',
} as const;

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

export const isMinor = (idade: number): boolean => idade < 18;

export const isAdultChild = (papel_familiar?: PapelFamiliar): boolean => 
  papel_familiar === 'filho_adulto' || papel_familiar === 'filha_adulta';

export const canGiveDiscursos = (cargo: Cargo, genero: Genero): boolean => {
  if (genero === "feminino") return false;
  return ["anciao", "servo_ministerial", "publicador_batizado"].includes(cargo);
};

export const getEstadoCivilLabel = (estado: EstadoCivil): string => 
  ESTADO_CIVIL_LABELS[estado];

export const getPapelFamiliarLabel = (papel?: PapelFamiliar): string => 
  papel ? PAPEL_FAMILIAR_LABELS[papel] : 'Não definido';

export const getRelacaoFamiliarLabel = (relacao: RelacaoFamiliar): string => 
  RELACAO_FAMILIAR_LABELS[relacao];

export const getCargoLabel = (cargo: Cargo): string => CARGO_LABELS[cargo];

export const getGeneroLabel = (genero: Genero): string => GENERO_LABELS[genero];
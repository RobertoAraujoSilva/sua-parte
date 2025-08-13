// Enhanced TypeScript Types for Sistema Ministerial
// Based on estudantes_enriquecido.xlsx structure analysis

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
// ENHANCED STUDENT INTERFACE (32 fields from Excel)
// ============================================================================

export interface EstudanteEnhanced {
  // Core identification fields
  id: string;
  user_id: string;
  familia: string;
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
  data_nascimento_estimada?: string; // ISO date string
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
}

export interface FamilyValidationResult {
  is_valid: boolean;
  warnings: string[];
  violations: string[];
  suggestions: string[];
}

export interface S38TComplianceCheck {
  rule_name: string;
  is_compliant: boolean;
  severity: 'error' | 'warning' | 'info';
  message: string;
  affected_students: string[];
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
}

export interface FamilyFilters {
  familia: string;
  include_extended_family: boolean;
  only_active_members: boolean;
  include_minors: boolean;
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
}

// ============================================================================
// IMPORT/EXPORT INTERFACES
// ============================================================================

export interface ExcelImportRow {
  // All 32 fields from Excel structure
  id?: string;
  user_id?: string;
  familia: string;
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
  data_nascimento_estimada?: string;
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
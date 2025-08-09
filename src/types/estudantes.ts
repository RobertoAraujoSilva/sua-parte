import { Database } from "@/integrations/supabase/types";

// Database types
export type EstudanteRow = Database["public"]["Tables"]["estudantes"]["Row"];
export type EstudanteInsert = Database["public"]["Tables"]["estudantes"]["Insert"];
export type EstudanteUpdate = Database["public"]["Tables"]["estudantes"]["Update"];

// Enums from database
export type Genero = Database["public"]["Enums"]["app_genero"];
export type Cargo = Database["public"]["Enums"]["app_cargo"];

// Extended types for UI
export interface EstudanteWithParent extends EstudanteRow {
  pai_mae?: EstudanteRow | null;
  filhos?: EstudanteRow[];
}

// S-38-T Speech Types and Qualifications
export type SpeechType =
  | 'bible_reading'      // Part 3 - Men only
  | 'initial_call'       // Parts 4-7 - Both genders
  | 'return_visit'       // Parts 4-7 - Both genders
  | 'bible_study'        // Parts 4-7 - Both genders
  | 'talk'              // Parts 4-7 - Qualified men only
  | 'demonstration';     // Parts 4-7 - Both genders

export type ProgressLevel =
  | 'beginning'    // New students, basic assignments
  | 'developing'   // Improving students, regular assignments
  | 'qualified'    // Competent students, all assignments
  | 'advanced';    // Experienced students, teaching others

export interface StudentQualifications {
  bible_reading: boolean;      // Part 3 capability
  initial_call: boolean;       // Can do initial calls
  return_visit: boolean;       // Can do return visits
  bible_study: boolean;        // Can conduct Bible studies
  talk: boolean;              // Can give talks (qualified men only)
  demonstration: boolean;      // Can do demonstrations
  can_be_helper: boolean;      // Can assist others
  can_teach_others: boolean;   // Can mentor new students
}

export interface StudentProgress {
  student_id: string;
  progress_level: ProgressLevel;
  qualifications: StudentQualifications;
  last_assignment_date?: string;
  total_assignments: number;
  performance_notes?: string;
  instructor_feedback?: string;
  updated_at: string;
  updated_by: string;
}

export interface EstudanteWithProgress extends EstudanteWithParent {
  progress?: StudentProgress;
  qualifications?: StudentQualifications;
}

// Instructor Dashboard Types
export interface InstructorDashboardData {
  students_by_progress: Record<ProgressLevel, EstudanteWithProgress[]>;
  students_by_speech_type: Record<SpeechType, EstudanteWithProgress[]>;
  recent_updates: StudentProgress[];
  statistics: {
    total_students: number;
    by_progress_level: Record<ProgressLevel, number>;
    by_speech_type: Record<SpeechType, number>;
    active_students: number;
    needs_attention: number;
  };
}

export interface DragDropResult {
  student_id: string;
  from_level: ProgressLevel;
  to_level: ProgressLevel;
  timestamp: string;
}

// Constants for S-38-T Guidelines
export const SPEECH_TYPE_LABELS: Record<SpeechType, string> = {
  bible_reading: 'Leitura da Bíblia (Parte 3)',
  initial_call: 'Primeira Conversa',
  return_visit: 'Revisita',
  bible_study: 'Estudo Bíblico',
  talk: 'Discurso',
  demonstration: 'Demonstração'
};

export const PROGRESS_LEVEL_LABELS: Record<ProgressLevel, string> = {
  beginning: 'Iniciante',
  developing: 'Em Desenvolvimento',
  qualified: 'Qualificado',
  advanced: 'Avançado'
};

export const PROGRESS_LEVEL_COLORS: Record<ProgressLevel, string> = {
  beginning: 'bg-red-50 border-red-200 text-red-800',
  developing: 'bg-yellow-50 border-yellow-200 text-yellow-800',
  qualified: 'bg-blue-50 border-blue-200 text-blue-800',
  advanced: 'bg-green-50 border-green-200 text-green-800'
};

export const SPEECH_TYPE_ICONS: Record<SpeechType, string> = {
  bible_reading: '📖',
  initial_call: '🚪',
  return_visit: '🔄',
  bible_study: '📚',
  talk: '🎤',
  demonstration: '👥'
};

export interface EstudanteFormData {
  nome: string;
  idade: number;
  genero: Genero;
  email?: string;
  telefone?: string;
  data_batismo?: string;
  cargo: Cargo;
  id_pai_mae?: string;
  ativo: boolean;
  observacoes?: string;
}

// Filter and search types
export interface EstudanteFilters {
  searchTerm: string;
  cargo?: Cargo | "todos";
  genero?: Genero | "todos";
  ativo?: boolean | "todos";
  idade_min?: number;
  idade_max?: number;
}

// Validation rules
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
} as const;

// Cargo labels for UI
export const CARGO_LABELS: Record<Cargo, string> = {
  anciao: "Ancião",
  servo_ministerial: "Servo Ministerial",
  pioneiro_regular: "Pioneiro Regular",
  publicador_batizado: "Publicador Batizado",
  publicador_nao_batizado: "Publicador Não Batizado",
  estudante_novo: "Estudante Novo",
};

// Genero labels for UI
export const GENERO_LABELS: Record<Genero, string> = {
  masculino: "Masculino",
  feminino: "Feminino",
};

// Helper functions
export const getCargoLabel = (cargo: Cargo): string => CARGO_LABELS[cargo];
export const getGeneroLabel = (genero: Genero): string => GENERO_LABELS[genero];

export const isMinor = (idade: number): boolean => idade < 18;

export const canGiveDiscursos = (cargo: Cargo, genero: Genero): boolean => {
  if (genero === "feminino") return false;
  return ["anciao", "servo_ministerial", "publicador_batizado"].includes(cargo);
};

export const getQualificacoes = (cargo: Cargo, genero: Genero, idade: number): string[] => {
  const qualificacoes: string[] = [];
  
  // Leitura da Bíblia - todos podem fazer
  qualificacoes.push("Leitura da Bíblia");
  
  // Primeira conversa e revisita - todos podem fazer
  qualificacoes.push("Primeira Conversa", "Revisita");
  
  // Estudo bíblico - apenas homens qualificados
  if (genero === "masculino" && ["anciao", "servo_ministerial", "publicador_batizado"].includes(cargo)) {
    qualificacoes.push("Estudo Bíblico");
  }
  
  // Discursos - apenas homens qualificados
  if (canGiveDiscursos(cargo, genero)) {
    qualificacoes.push("Discurso");
  }
  
  return qualificacoes;
};

// Validation functions
export const validateEstudante = (data: EstudanteFormData): Record<string, string> => {
  const errors: Record<string, string> = {};
  
  // Nome validation
  if (!data.nome || data.nome.trim().length < VALIDATION_RULES.nome.minLength) {
    errors.nome = `Nome deve ter pelo menos ${VALIDATION_RULES.nome.minLength} caracteres`;
  }
  if (data.nome && data.nome.length > VALIDATION_RULES.nome.maxLength) {
    errors.nome = `Nome deve ter no máximo ${VALIDATION_RULES.nome.maxLength} caracteres`;
  }
  
  // Idade validation
  if (!data.idade || data.idade < VALIDATION_RULES.idade.min || data.idade > VALIDATION_RULES.idade.max) {
    errors.idade = `Idade deve estar entre ${VALIDATION_RULES.idade.min} e ${VALIDATION_RULES.idade.max} anos`;
  }
  
  // Email validation
  if (data.email && !VALIDATION_RULES.email.pattern.test(data.email)) {
    errors.email = "Email deve ter um formato válido";
  }
  
  // Telefone validation
  if (data.telefone) {
    if (data.telefone.length < VALIDATION_RULES.telefone.minLength) {
      errors.telefone = `Telefone deve ter pelo menos ${VALIDATION_RULES.telefone.minLength} dígitos`;
    }
    if (!VALIDATION_RULES.telefone.pattern.test(data.telefone)) {
      errors.telefone = "Telefone deve conter apenas números, espaços, hífens, parênteses e +";
    }
  }
  
  // Business rules validation
  if (isMinor(data.idade) && !data.id_pai_mae) {
    errors.id_pai_mae = "Menores de 18 anos devem ter um responsável cadastrado";
  }
  
  if (data.cargo === "anciao" && data.genero === "feminino") {
    errors.cargo = "Apenas homens podem ser anciãos";
  }
  
  if (data.cargo === "servo_ministerial" && data.genero === "feminino") {
    errors.cargo = "Apenas homens podem ser servos ministeriais";
  }
  
  return errors;
};

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

import { Cargo, Genero } from "./estudantes";

// Raw data from Excel spreadsheet
export interface SpreadsheetRow {
  "ID Estudante"?: string | number;
  "Nome Completo": string;
  "Idade": number;
  "Gênero (M/F)": string;
  "Data de Nascimento"?: string;
  "Parente Responsável"?: string;
  "Parentesco"?: string;
  "Família / Agrupamento": string;
  "Data de Batismo"?: string;
  "Cargo Congregacional": string;
  "Telefone"?: string;
  "E-mail"?: string;
  "Observações"?: string;
  "Status (Ativo/Inativo)": string;
}

// Processed data ready for database insertion
export interface ProcessedStudentData {
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
  familia?: string;
  parentesco?: string;
  parente_responsavel?: string;
}

// Validation result for each row
export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  data?: ProcessedStudentData;
  rowIndex: number;
}

// Import summary
export interface ImportSummary {
  totalRows: number;
  validRows: number;
  invalidRows: number;
  imported: number;
  errors: ValidationResult[];
  warnings: ValidationResult[];
}

// Mapping configurations
export const GENDER_MAPPING: Record<string, Genero> = {
  'M': 'masculino',
  'F': 'feminino',
  'Masculino': 'masculino',
  'Feminino': 'feminino',
  'masculino': 'masculino',
  'feminino': 'feminino'
};

export const CARGO_MAPPING: Record<string, Cargo> = {
  'Ancião': 'anciao',
  'Servo Ministerial': 'servo_ministerial',
  'Pioneiro Regular': 'pioneiro_regular',
  'Publicador Batizado': 'publicador_batizado',
  'Publicador Não Batizado': 'publicador_nao_batizado',
  'Estudante Novo': 'estudante_novo',
  'Visitante': 'estudante_novo', // Fallback
  'anciao': 'anciao',
  'servo_ministerial': 'servo_ministerial',
  'pioneiro_regular': 'pioneiro_regular',
  'publicador_batizado': 'publicador_batizado',
  'publicador_nao_batizado': 'publicador_nao_batizado',
  'estudante_novo': 'estudante_novo'
};

export const STATUS_MAPPING: Record<string, boolean> = {
  'Ativo': true,
  'Inativo': false,
  'ativo': true,
  'inativo': false,
  'true': true,
  'false': false,
  '1': true,
  '0': false
};

// Template column definitions
export const TEMPLATE_COLUMNS = [
  'Nome Completo',
  'Idade',
  'Gênero (M/F)',
  'Data de Nascimento',
  'Parente Responsável',
  'Parentesco',
  'Família / Agrupamento',
  'Data de Batismo',
  'Cargo Congregacional',
  'Telefone',
  'E-mail',
  'Observações',
  'Status (Ativo/Inativo)'
] as const;

// Sample data for template
export const TEMPLATE_SAMPLE_DATA: Partial<SpreadsheetRow>[] = [
  {
    "Nome Completo": "João Silva",
    "Idade": 25,
    "Gênero (M/F)": "M",
    "Data de Nascimento": "15/03/1999",
    "Parente Responsável": "",
    "Parentesco": "",
    "Família / Agrupamento": "Família Silva",
    "Data de Batismo": "20/06/2020",
    "Cargo Congregacional": "Publicador Batizado",
    "Telefone": "(11) 99999-9999",
    "E-mail": "joao.silva@email.com",
    "Observações": "Disponível para designações",
    "Status (Ativo/Inativo)": "Ativo"
  },
  {
    "Nome Completo": "Maria Santos",
    "Idade": 16,
    "Gênero (M/F)": "F",
    "Data de Nascimento": "10/08/2008",
    "Parente Responsável": "João Silva",
    "Parentesco": "Pai",
    "Família / Agrupamento": "Família Silva",
    "Data de Batismo": "",
    "Cargo Congregacional": "Estudante Novo",
    "Telefone": "",
    "E-mail": "",
    "Observações": "Menor de idade",
    "Status (Ativo/Inativo)": "Ativo"
  }
];

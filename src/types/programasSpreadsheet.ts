// Raw data from Excel spreadsheet for programs
export interface ProgramasSpreadsheetRow {
  "Título": string;
  "Semana": string;
  "Data Início Semana": string;
  "Mês Apostila"?: string;
  "Status"?: string;
  "Status Designação"?: string;
  "Conteúdo"?: string;
  "Observações"?: string;
}

// Processed data ready for database insertion
export interface ProcessedProgramData {
  titulo: string;
  semana: string;
  data: string;
  data_inicio_semana: string;
  mes_apostila?: string;
  status: string;
  assignment_status: string;
  conteudo?: null;
}

// Validation result for each row
export interface ProgramValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  data?: ProcessedProgramData;
  rowIndex: number;
}

// Import summary
export interface ProgramImportSummary {
  totalRows: number;
  validRows: number;
  invalidRows: number;
  imported: number;
  errors: ProgramValidationResult[];
  warnings: ProgramValidationResult[];
}

// Status mappings
export const PROGRAM_STATUS_MAPPING: Record<string, string> = {
  'Rascunho': 'draft',
  'Draft': 'draft',
  'draft': 'draft',
  'Ativo': 'active',
  'Active': 'active',
  'active': 'active',
  'Publicado': 'published',
  'Published': 'published',
  'published': 'published',
  'Arquivado': 'archived',
  'Archived': 'archived',
  'archived': 'archived'
};

export const ASSIGNMENT_STATUS_MAPPING: Record<string, string> = {
  'Pendente': 'pending',
  'Pending': 'pending',
  'pending': 'pending',
  'Em Progresso': 'in_progress',
  'In Progress': 'in_progress',
  'in_progress': 'in_progress',
  'Completo': 'completed',
  'Completed': 'completed',
  'completed': 'completed'
};

// Template column definitions
export const PROGRAM_TEMPLATE_COLUMNS = [
  'Título',
  'Semana',
  'Data Início Semana',
  'Mês Apostila',
  'Status',
  'Status Designação',
  'Observações'
] as const;

// Sample data for template
export const PROGRAM_TEMPLATE_SAMPLE_DATA: Partial<ProgramasSpreadsheetRow>[] = [
  {
    "Título": "Reunião Vida e Ministério - Semana 1",
    "Semana": "1-7 Janeiro",
    "Data Início Semana": "01/01/2025",
    "Mês Apostila": "Janeiro 2025",
    "Status": "Rascunho",
    "Status Designação": "Pendente",
    "Observações": ""
  },
  {
    "Título": "Reunião Vida e Ministério - Semana 2",
    "Semana": "8-14 Janeiro",
    "Data Início Semana": "08/01/2025",
    "Mês Apostila": "Janeiro 2025",
    "Status": "Ativo",
    "Status Designação": "Completo",
    "Observações": "Designações confirmadas"
  }
];

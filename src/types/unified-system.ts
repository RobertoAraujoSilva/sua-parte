// =====================================================
// Tipos TypeScript para Sistema Unificado
// Admin, Instrutor e Estudante
// =====================================================

// =====================================================
// 1. TIPOS BASE
// =====================================================

export interface BaseEntity {
  id: string;
  created_at: string;
  updated_at?: string;
}

export interface AdminEntity extends BaseEntity {
  admin_user_id: string;
}

// =====================================================
// 2. TIPOS DE VERSÃO MWB
// =====================================================

export type MWBStatus = 'draft' | 'published' | 'archived';
export type MWBLanguage = 'pt-BR' | 'en-US' | 'es-ES';

export interface MWBVersion extends AdminEntity {
  version_code: string; // ex: MWB_2025_09
  language: MWBLanguage;
  title: string;
  description?: string;
  publication_date: string;
  start_month: number; // 1-12
  end_month: number; // 1-12
  year: number;
  status: MWBStatus;
}

// =====================================================
// 3. TIPOS DE ARQUIVOS OFICIAIS
// =====================================================

export type FileType = 'pdf' | 'rtf' | 'sql' | 'image' | 'zip';
export type FileStatus = 'active' | 'archived' | 'error';

export interface OfficialFile extends AdminEntity {
  mwb_version_id: string;
  file_type: FileType;
  file_name: string;
  file_path: string;
  file_size?: number;
  mime_type?: string;
  content_hash?: string;
  metadata?: Record<string, any>;
  status: FileStatus;
}

// =====================================================
// 4. TIPOS DE PROGRAMAÇÃO UNIFICADA
// =====================================================

export type ProgrammingStatus = 'draft' | 'published' | 'archived';

export interface UnifiedProgramming extends AdminEntity {
  mwb_version_id: string;
  week_start_date: string;
  week_end_date: string;
  week_number: number; // 1-52
  week_title?: string;
  status: ProgrammingStatus;
}

// =====================================================
// 5. TIPOS DE PARTES DA PROGRAMAÇÃO
// =====================================================

export type PartType = 
  | 'leitura_biblica'
  | 'tesouros'
  | 'vida_crista'
  | 'ministério'
  | 'abertura'
  | 'conclusao';

export type Section = 
  | 'abertura'
  | 'tesouros'
  | 'ministério'
  | 'vida_crista'
  | 'conclusao';

export interface ProgrammingPart extends BaseEntity {
  unified_programming_id: string;
  part_type: PartType;
  part_title: string;
  duration_minutes: number;
  requirements: S38Requirements;
  content_references?: ContentReferences;
  order_in_meeting: number;
  section: Section;
  notes?: string;
}

// =====================================================
// 6. TIPOS DE REGRAS S-38
// =====================================================

export type RuleType = 'qualificacao' | 'duracao' | 'restricao' | 'validacao';

export interface S38Rule extends AdminEntity {
  rule_code: string; // ex: 'leitura_sem_introducao'
  rule_name: string;
  rule_description?: string;
  rule_type: RuleType;
  rule_conditions: RuleConditions;
  rule_actions: RuleActions;
  is_active: boolean;
}

export interface RuleConditions {
  part_type?: PartType;
  gender?: 'masculino' | 'feminino' | 'ambos';
  baptism_status?: 'batizado' | 'nao_batizado' | 'ambos';
  age_min?: number;
  age_max?: number;
  experience_level?: 'iniciante' | 'intermediario' | 'avancado';
  [key: string]: any;
}

export interface RuleActions {
  allowed?: boolean;
  instruction?: string;
  duration?: number;
  unit?: string;
  message?: string;
  [key: string]: any;
}

export interface S38Requirements {
  gender: 'masculino' | 'feminino' | 'ambos';
  baptism_status: 'batizado' | 'nao_batizado' | 'ambos';
  age_min?: number;
  age_max?: number;
  experience_required?: boolean;
  assistant_required?: boolean;
  family_restrictions?: string[];
  [key: string]: any;
}

export interface ContentReferences {
  bible_references?: string[];
  pdf_pages?: number[];
  video_urls?: string[];
  literature_references?: string[];
  [key: string]: any;
}

// =====================================================
// 7. TIPOS DE CONGREGAÇÃO
// =====================================================

export type CongregationStatus = 'active' | 'inactive' | 'suspended';
export type MeetingDay = 'sunday' | 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday';

export interface Congregation extends AdminEntity {
  name: string;
  code: string;
  language: MWBLanguage;
  timezone: string;
  meeting_day: MeetingDay;
  meeting_time?: string;
  address?: string;
  contact_info?: ContactInfo;
  status: CongregationStatus;
}

export interface ContactInfo {
  phone?: string;
  email?: string;
  website?: string;
  [key: string]: any;
}

// =====================================================
// 8. TIPOS DE INSTRUTORES DE CONGREGAÇÃO
// =====================================================

export type InstructorRole = 'instructor' | 'coordinator' | 'assistant';
export type InstructorStatus = 'active' | 'inactive' | 'suspended';

export interface CongregationInstructor extends AdminEntity {
  congregation_id: string;
  user_id: string;
  role: InstructorRole;
  permissions?: InstructorPermissions;
  start_date: string;
  end_date?: string;
  status: InstructorStatus;
}

export interface InstructorPermissions {
  can_assign_students?: boolean;
  can_edit_assignments?: boolean;
  can_view_reports?: boolean;
  can_manage_congregation?: boolean;
  [key: string]: any;
}

// =====================================================
// 9. TIPOS DE DESIGNAÇÕES
// =====================================================

export type AssignmentStatus = 'assigned' | 'confirmed' | 'completed' | 'cancelled';

export interface CongregationAssignment extends BaseEntity {
  congregation_id: string;
  programming_part_id: string;
  week_start_date: string;
  student_id: string;
  assistant_student_id?: string;
  assigned_by: string;
  status: AssignmentStatus;
  notes?: string;
  confirmation_date?: string;
  completion_date?: string;
}

// =====================================================
// 10. TIPOS DE HISTÓRICO
// =====================================================

export type HistoryAction = 'created' | 'updated' | 'confirmed' | 'completed' | 'cancelled';

export interface AssignmentHistory extends BaseEntity {
  congregation_assignment_id: string;
  action: HistoryAction;
  previous_state?: Record<string, any>;
  new_state?: Record<string, any>;
  changed_by: string;
  change_reason?: string;
}

// =====================================================
// 11. TIPOS DE NOTIFICAÇÕES
// =====================================================

export type NotificationType = 'assignment' | 'reminder' | 'system' | 'update';
export type NotificationStatus = 'pending' | 'sent' | 'delivered' | 'failed';
export type DeliveryMethod = 'app' | 'email' | 'whatsapp';

export interface Notification extends BaseEntity {
  user_id: string;
  type: NotificationType;
  title: string;
  message: string;
  metadata?: NotificationMetadata;
  delivery_methods: DeliveryMethod[];
  status: NotificationStatus;
  sent_at?: string;
  delivered_at?: string;
}

export interface NotificationMetadata {
  congregation_id?: string;
  assignment_id?: string;
  programming_part_id?: string;
  week_start_date?: string;
  [key: string]: any;
}

// =====================================================
// 12. TIPOS DE USUÁRIO E PERFIL
// =====================================================

export type UserRole = 'admin' | 'instructor' | 'student';

export interface UserProfile extends BaseEntity {
  user_id: string;
  role: UserRole;
  full_name: string;
  email: string;
  date_of_birth?: string;
  gender?: 'masculino' | 'feminino';
  baptism_date?: string;
  congregation_id?: string;
  is_active: boolean;
  preferences?: UserPreferences;
}

export interface UserPreferences {
  language: MWBLanguage;
  timezone: string;
  notification_preferences?: NotificationPreferences;
  [key: string]: any;
}

export interface NotificationPreferences {
  email_enabled: boolean;
  app_enabled: boolean;
  whatsapp_enabled: boolean;
  reminder_timing?: number; // horas antes
  [key: string]: any;
}

// =====================================================
// 13. TIPOS DE VALIDAÇÃO E ERROS
// =====================================================

export interface ValidationError {
  field: string;
  message: string;
  code?: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
}

export interface S38ValidationResult extends ValidationResult {
  rule_applied?: string;
  suggestions?: string[];
}

// =====================================================
// 14. TIPOS DE RELATÓRIOS
// =====================================================

export interface AssignmentReport {
  congregation_id: string;
  week_start_date: string;
  total_assignments: number;
  confirmed_assignments: number;
  pending_assignments: number;
  completed_assignments: number;
  assignments_by_type: Record<PartType, number>;
}

export interface CongregationReport {
  congregation_id: string;
  month: number;
  year: number;
  total_weeks: number;
  total_assignments: number;
  student_participation: StudentParticipation[];
}

export interface StudentParticipation {
  student_id: string;
  student_name: string;
  total_assignments: number;
  assignments_by_type: Record<PartType, number>;
  last_assignment_date?: string;
}

// =====================================================
// 15. TIPOS DE CONFIGURAÇÃO DO SISTEMA
// =====================================================

export interface SystemConfig {
  default_language: MWBLanguage;
  supported_languages: MWBLanguage[];
  timezone: string;
  meeting_days: MeetingDay[];
  s38_rules_enabled: boolean;
  notifications_enabled: boolean;
  offline_mode_enabled: boolean;
  max_file_size: number;
  allowed_file_types: FileType[];
}

// =====================================================
// 16. TIPOS DE OPERAÇÕES EM LOTE
// =====================================================

export interface BulkOperation {
  operation_type: 'import' | 'export' | 'update' | 'delete';
  target_table: string;
  records_count: number;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress?: number;
  errors?: string[];
  created_at: string;
  completed_at?: string;
}

// =====================================================
// 17. TIPOS DE SINCRONIZAÇÃO
// =====================================================

export interface SyncStatus {
  last_sync: string;
  sync_type: 'full' | 'incremental';
  records_synced: number;
  errors_count: number;
  status: 'success' | 'partial' | 'failed';
}

// =====================================================
// 18. TIPOS DE AUDITORIA
// =====================================================

export interface AuditLog extends BaseEntity {
  user_id: string;
  action: string;
  table_name: string;
  record_id: string;
  old_values?: Record<string, any>;
  new_values?: Record<string, any>;
  ip_address?: string;
  user_agent?: string;
}

// =====================================================
// 19. TIPOS DE EXPORTAÇÃO
// =====================================================

export type ExportFormat = 'pdf' | 'excel' | 'csv' | 'json';

export interface ExportRequest {
  format: ExportFormat;
  data_type: 'assignments' | 'programming' | 'reports' | 'all';
  filters?: Record<string, any>;
  date_range?: {
    start_date: string;
    end_date: string;
  };
}

// =====================================================
// 20. TIPOS DE IMPORTAÇÃO
// =====================================================

export interface ImportRequest {
  file_type: FileType;
  file_content: string | ArrayBuffer;
  import_type: 'mwb_version' | 'students' | 'assignments' | 'rules';
  validation_rules?: Record<string, any>;
}

// =====================================================
// 21. TIPOS DE RESPOSTA DA API
// =====================================================

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  errors?: ValidationError[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    total_pages: number;
  };
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    total_pages: number;
  };
}

// =====================================================
// 22. TIPOS DE FILTROS E BUSCA
// =====================================================

export interface SearchFilters {
  text?: string;
  date_range?: {
    start_date: string;
    end_date: string;
  };
  status?: string[];
  type?: string[];
  congregation_id?: string;
  user_id?: string;
  [key: string]: any;
}

export interface SortOptions {
  field: string;
  direction: 'asc' | 'desc';
}

// =====================================================
// 23. TIPOS DE ESTATÍSTICAS
// =====================================================

export interface SystemStatistics {
  total_users: number;
  total_congregations: number;
  total_assignments: number;
  active_versions: number;
  system_health: 'excellent' | 'good' | 'warning' | 'critical';
  last_backup?: string;
  uptime_percentage: number;
}

// =====================================================
// 24. TIPOS DE BACKUP E RESTAURAÇÃO
// =====================================================

export interface BackupInfo {
  backup_id: string;
  created_at: string;
  size_bytes: number;
  tables_count: number;
  status: 'completed' | 'failed' | 'in_progress';
  backup_type: 'full' | 'incremental';
  file_path?: string;
}

// =====================================================
// 25. TIPOS DE LOGS E MONITORAMENTO
// =====================================================

export interface SystemLog extends BaseEntity {
  level: 'debug' | 'info' | 'warning' | 'error' | 'critical';
  message: string;
  context?: Record<string, any>;
  user_id?: string;
  ip_address?: string;
  user_agent?: string;
}

// =====================================================
// EXPORTAÇÕES
// =====================================================

export type {
  BaseEntity,
  AdminEntity,
  MWBVersion,
  OfficialFile,
  UnifiedProgramming,
  ProgrammingPart,
  S38Rule,
  Congregation,
  CongregationInstructor,
  CongregationAssignment,
  AssignmentHistory,
  Notification,
  UserProfile,
  ValidationError,
  ValidationResult,
  S38ValidationResult,
  AssignmentReport,
  CongregationReport,
  StudentParticipation,
  SystemConfig,
  BulkOperation,
  SyncStatus,
  AuditLog,
  ExportRequest,
  ImportRequest,
  ApiResponse,
  PaginatedResponse,
  SearchFilters,
  SortOptions,
  SystemStatistics,
  BackupInfo,
  SystemLog
};

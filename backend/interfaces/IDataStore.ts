// Data Access Layer Interface for Desktop Offline System
// This interface provides a unified API for both SQLite (offline) and Supabase (web) implementations

// =====================================================
// CORE DATA MODELS
// =====================================================

export interface Profile {
  id: string;
  email: string;
  role: 'admin' | 'instrutor' | 'estudante';
  nome?: string;
  congregacao_id?: string;
  created_at: string;
  updated_at: string;
}

export interface Estudante {
  id: string;
  nome: string;
  sobrenome?: string;
  data_nascimento?: string;
  telefone?: string;
  email?: string;
  cargo: 'anciao' | 'servo_ministerial' | 'pioneiro_regular' | 'publicador_batizado' | 'publicador_nao_batizado' | 'estudante_novo';
  genero: 'masculino' | 'feminino';
  privilegios?: string;
  congregacao_id: string;
  id_pai_mae?: string;
  ativo: boolean;
  created_at: string;
  updated_at: string;
}

export interface Programa {
  id: string;
  semana_inicio: string;
  semana_fim: string;
  material_estudo?: string;
  congregacao_id: string;
  status: 'rascunho' | 'ativo' | 'arquivado';
  created_at: string;
  updated_at: string;
}

export interface Designacao {
  id: string;
  programa_id: string;
  estudante_id: string;
  ajudante_id?: string;
  parte: string;
  tema?: string;
  tempo_minutos?: number;
  observacoes?: string;
  status: 'agendada' | 'confirmada' | 'cancelada';
  created_at: string;
}

export interface Meeting {
  id: string;
  meeting_date: string;
  meeting_type: 'regular_midweek' | 'regular_weekend' | 'circuit_overseer_visit' | 'assembly_week' | 'convention_week' | 'memorial' | 'special_event' | 'cancelled';
  title: string;
  description?: string;
  start_time?: string;
  end_time?: string;
  circuit_overseer_name?: string;
  service_talk_title?: string;
  closing_song_number?: number;
  congregacao_id: string;
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled' | 'postponed';
  created_at: string;
  updated_at: string;
}

export interface AdministrativeAssignment {
  id: string;
  id_estudante: string;
  role: 'meeting_overseer' | 'meeting_chairman' | 'assistant_counselor' | 'room_overseer' | 'circuit_overseer';
  assignment_date: string;
  start_date?: string;
  end_date?: string;
  is_recurring: boolean;
  assigned_room?: 'main_hall' | 'auxiliary_room_1' | 'auxiliary_room_2' | 'auxiliary_room_3';
  notes?: string;
  congregacao_id: string;
  created_at: string;
  updated_at: string;
}

// =====================================================
// REQUEST/RESPONSE TYPES
// =====================================================

export interface CreateEstudanteRequest {
  nome: string;
  sobrenome?: string;
  data_nascimento?: string;
  telefone?: string;
  email?: string;
  cargo: Estudante['cargo'];
  genero: Estudante['genero'];
  privilegios?: string;
  congregacao_id: string;
  id_pai_mae?: string;
  ativo?: boolean;
}

export interface UpdateEstudanteRequest {
  nome?: string;
  sobrenome?: string;
  data_nascimento?: string;
  telefone?: string;
  email?: string;
  cargo?: Estudante['cargo'];
  genero?: Estudante['genero'];
  privilegios?: string;
  id_pai_mae?: string;
  ativo?: boolean;
}

export interface CreateProgramaRequest {
  semana_inicio: string;
  semana_fim: string;
  material_estudo?: string;
  congregacao_id: string;
  status?: Programa['status'];
}

export interface UpdateProgramaRequest {
  semana_inicio?: string;
  semana_fim?: string;
  material_estudo?: string;
  status?: Programa['status'];
}

export interface CreateDesignacaoRequest {
  programa_id: string;
  estudante_id: string;
  ajudante_id?: string;
  parte: string;
  tema?: string;
  tempo_minutos?: number;
  observacoes?: string;
  status?: Designacao['status'];
}

export interface UpdateDesignacaoRequest {
  estudante_id?: string;
  ajudante_id?: string;
  parte?: string;
  tema?: string;
  tempo_minutos?: number;
  observacoes?: string;
  status?: Designacao['status'];
}

export interface CreateProfileRequest {
  id: string;
  email: string;
  role: Profile['role'];
  nome?: string;
  congregacao_id?: string;
}

export interface UpdateProfileRequest {
  email?: string;
  role?: Profile['role'];
  nome?: string;
  congregacao_id?: string;
}

export interface CreateMeetingRequest {
  meeting_date: string;
  meeting_type: Meeting['meeting_type'];
  title: string;
  description?: string;
  start_time?: string;
  end_time?: string;
  circuit_overseer_name?: string;
  service_talk_title?: string;
  closing_song_number?: number;
  congregacao_id: string;
  status?: Meeting['status'];
}

export interface UpdateMeetingRequest {
  meeting_date?: string;
  meeting_type?: Meeting['meeting_type'];
  title?: string;
  description?: string;
  start_time?: string;
  end_time?: string;
  circuit_overseer_name?: string;
  service_talk_title?: string;
  closing_song_number?: number;
  status?: Meeting['status'];
}

export interface CreateAdministrativeAssignmentRequest {
  id_estudante: string;
  role: AdministrativeAssignment['role'];
  assignment_date: string;
  start_date?: string;
  end_date?: string;
  is_recurring: boolean;
  assigned_room?: AdministrativeAssignment['assigned_room'];
  notes?: string;
  congregacao_id: string;
}

export interface UpdateAdministrativeAssignmentRequest {
  id_estudante?: string;
  role?: AdministrativeAssignment['role'];
  assignment_date?: string;
  start_date?: string;
  end_date?: string;
  is_recurring?: boolean;
  assigned_room?: AdministrativeAssignment['assigned_room'];
  notes?: string;
}

// =====================================================
// FILTER TYPES
// =====================================================

export interface EstudanteFilters {
  congregacao_id?: string;
  cargo?: Estudante['cargo'];
  genero?: Estudante['genero'];
  ativo?: boolean;
  search?: string;
}

export interface ProgramFilters {
  congregacao_id?: string;
  status?: Programa['status'];
  semana_inicio_gte?: string;
  semana_inicio_lte?: string;
}

export interface DesignacaoFilters {
  programa_id?: string;
  estudante_id?: string;
  congregacao_id?: string;
  status?: Designacao['status'];
  semana_inicio_gte?: string;
  semana_inicio_lte?: string;
}

export interface MeetingFilters {
  congregacao_id?: string;
  meeting_type?: Meeting['meeting_type'];
  status?: Meeting['status'];
  meeting_date_gte?: string;
  meeting_date_lte?: string;
}

export interface AdministrativeAssignmentFilters {
  congregacao_id?: string;
  id_estudante?: string;
  role?: AdministrativeAssignment['role'];
  assignment_date_gte?: string;
  assignment_date_lte?: string;
  is_recurring?: boolean;
}

// =====================================================
// SYSTEM TYPES
// =====================================================

export interface HealthStatus {
  status: 'healthy' | 'degraded' | 'unhealthy';
  database: {
    connected: boolean;
    responseTime: number;
    lastCheck: string;
  };
  storage: {
    available: boolean;
    freeSpace?: number;
    totalSpace?: number;
  };
  services: {
    [serviceName: string]: 'active' | 'inactive' | 'error';
  };
}

export interface BackupResult {
  success: boolean;
  backupPath: string;
  size: number;
  timestamp: string;
  tables: string[];
  error?: string;
}

export interface RestoreResult {
  success: boolean;
  restoredTables: string[];
  timestamp: string;
  error?: string;
}

export interface HistoricoDesignacao {
  estudante_id: string;
  designacoes: Array<{
    data_inicio_semana: string;
    parte: string;
    foi_ajudante: boolean;
  }>;
  total_designacoes_8_semanas: number;
  ultima_designacao?: string;
}

// =====================================================
// MAIN INTERFACE
// =====================================================

export interface IDataStore {
  // =====================================================
  // INITIALIZATION AND SYSTEM
  // =====================================================
  
  /**
   * Initialize the data store (create connections, setup schema, etc.)
   */
  initialize(): Promise<void>;
  
  /**
   * Check the health status of the data store
   */
  healthCheck(): Promise<HealthStatus>;
  
  /**
   * Create a backup of all data
   */
  backup(): Promise<BackupResult>;
  
  /**
   * Restore data from a backup
   */
  restore(backupPath: string): Promise<RestoreResult>;
  
  /**
   * Close connections and cleanup resources
   */
  close(): Promise<void>;

  // =====================================================
  // PROFILE MANAGEMENT
  // =====================================================
  
  /**
   * Get a profile by ID
   */
  getProfile(id: string): Promise<Profile | null>;
  
  /**
   * Get a profile by email
   */
  getProfileByEmail(email: string): Promise<Profile | null>;
  
  /**
   * Create a new profile
   */
  createProfile(profile: CreateProfileRequest): Promise<Profile>;
  
  /**
   * Update an existing profile
   */
  updateProfile(id: string, updates: UpdateProfileRequest): Promise<Profile>;
  
  /**
   * Delete a profile
   */
  deleteProfile(id: string): Promise<void>;

  // =====================================================
  // STUDENT MANAGEMENT
  // =====================================================
  
  /**
   * Get all students with optional filtering
   */
  getEstudantes(filters?: EstudanteFilters): Promise<Estudante[]>;
  
  /**
   * Get a student by ID
   */
  getEstudante(id: string): Promise<Estudante | null>;
  
  /**
   * Create a new student
   */
  createEstudante(estudante: CreateEstudanteRequest): Promise<Estudante>;
  
  /**
   * Update an existing student
   */
  updateEstudante(id: string, updates: UpdateEstudanteRequest): Promise<Estudante>;
  
  /**
   * Delete a student
   */
  deleteEstudante(id: string): Promise<void>;
  
  /**
   * Get students by congregation
   */
  getEstudantesByCongregacao(congregacaoId: string): Promise<Estudante[]>;

  // =====================================================
  // PROGRAM MANAGEMENT
  // =====================================================
  
  /**
   * Get all programs with optional filtering
   */
  getProgramas(filters?: ProgramFilters): Promise<Programa[]>;
  
  /**
   * Get a program by ID
   */
  getPrograma(id: string): Promise<Programa | null>;
  
  /**
   * Create a new program
   */
  createPrograma(programa: CreateProgramaRequest): Promise<Programa>;
  
  /**
   * Update an existing program
   */
  updatePrograma(id: string, updates: UpdateProgramaRequest): Promise<Programa>;
  
  /**
   * Delete a program
   */
  deletePrograma(id: string): Promise<void>;

  // =====================================================
  // ASSIGNMENT MANAGEMENT
  // =====================================================
  
  /**
   * Get all assignments with optional filtering
   */
  getDesignacoes(filters?: DesignacaoFilters): Promise<Designacao[]>;
  
  /**
   * Get an assignment by ID
   */
  getDesignacao(id: string): Promise<Designacao | null>;
  
  /**
   * Create a new assignment
   */
  createDesignacao(designacao: CreateDesignacaoRequest): Promise<Designacao>;
  
  /**
   * Update an existing assignment
   */
  updateDesignacao(id: string, updates: UpdateDesignacaoRequest): Promise<Designacao>;
  
  /**
   * Delete an assignment
   */
  deleteDesignacao(id: string): Promise<void>;
  
  /**
   * Get assignment history for a student
   */
  getHistoricoDesignacoes(estudanteId: string, weeks?: number): Promise<HistoricoDesignacao>;
  
  /**
   * Get assignments by program
   */
  getDesignacoesByPrograma(programaId: string): Promise<Designacao[]>;

  // =====================================================
  // MEETING MANAGEMENT
  // =====================================================
  
  /**
   * Get all meetings with optional filtering
   */
  getMeetings(filters?: MeetingFilters): Promise<Meeting[]>;
  
  /**
   * Get a meeting by ID
   */
  getMeeting(id: string): Promise<Meeting | null>;
  
  /**
   * Create a new meeting
   */
  createMeeting(meeting: CreateMeetingRequest): Promise<Meeting>;
  
  /**
   * Update an existing meeting
   */
  updateMeeting(id: string, updates: UpdateMeetingRequest): Promise<Meeting>;
  
  /**
   * Delete a meeting
   */
  deleteMeeting(id: string): Promise<void>;

  // =====================================================
  // ADMINISTRATIVE ASSIGNMENT MANAGEMENT
  // =====================================================
  
  /**
   * Get all administrative assignments with optional filtering
   */
  getAdministrativeAssignments(filters?: AdministrativeAssignmentFilters): Promise<AdministrativeAssignment[]>;
  
  /**
   * Get an administrative assignment by ID
   */
  getAdministrativeAssignment(id: string): Promise<AdministrativeAssignment | null>;
  
  /**
   * Create a new administrative assignment
   */
  createAdministrativeAssignment(assignment: CreateAdministrativeAssignmentRequest): Promise<AdministrativeAssignment>;
  
  /**
   * Update an existing administrative assignment
   */
  updateAdministrativeAssignment(id: string, updates: UpdateAdministrativeAssignmentRequest): Promise<AdministrativeAssignment>;
  
  /**
   * Delete an administrative assignment
   */
  deleteAdministrativeAssignment(id: string): Promise<void>;
}
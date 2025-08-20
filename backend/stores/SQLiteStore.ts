import Database from 'better-sqlite3';
import { v4 as uuidv4 } from 'uuid';
import * as fs from 'fs-extra';
import * as path from 'path';
import {
  IDataStore,
  Profile,
  Estudante,
  Programa,
  Designacao,
  Meeting,
  AdministrativeAssignment,
  CreateEstudanteRequest,
  UpdateEstudanteRequest,
  CreateProgramaRequest,
  UpdateProgramaRequest,
  CreateDesignacaoRequest,
  UpdateDesignacaoRequest,
  CreateProfileRequest,
  UpdateProfileRequest,
  CreateMeetingRequest,
  UpdateMeetingRequest,
  CreateAdministrativeAssignmentRequest,
  UpdateAdministrativeAssignmentRequest,
  EstudanteFilters,
  ProgramFilters,
  DesignacaoFilters,
  MeetingFilters,
  AdministrativeAssignmentFilters,
  HealthStatus,
  BackupResult,
  RestoreResult,
  HistoricoDesignacao
} from '../interfaces/IDataStore';

export class SQLiteStore implements IDataStore {
  private db: Database.Database | null = null;
  private dbPath: string;

  constructor(dbPath: string) {
    this.dbPath = dbPath;
  }

  // =====================================================
  // INITIALIZATION AND SYSTEM
  // =====================================================

  async initialize(): Promise<void> {
    try {
      // Ensure directory exists
      await fs.ensureDir(path.dirname(this.dbPath));
      
      // Open database connection
      this.db = new Database(this.dbPath);
      
      // Enable foreign keys
      this.db.pragma('foreign_keys = ON');
      
      // Create tables if they don't exist
      await this.createTables();
      
      console.log(`✅ SQLite database initialized at: ${this.dbPath}`);
    } catch (error) {
      console.error('❌ Failed to initialize SQLite database:', error);
      throw error;
    }
  }

  async healthCheck(): Promise<HealthStatus> {
    const startTime = Date.now();
    
    try {
      if (!this.db) {
        throw new Error('Database not initialized');
      }

      // Test database connection
      const result = this.db.prepare('SELECT 1 as test').get();
      const responseTime = Date.now() - startTime;

      // Get database file stats
      const stats = await fs.stat(this.dbPath);
      const freeSpace = await this.getFreeSpace();

      return {
        status: 'healthy',
        database: {
          connected: true,
          responseTime,
          lastCheck: new Date().toISOString()
        },
        storage: {
          available: true,
          freeSpace,
          totalSpace: stats.size
        },
        services: {
          sqlite: 'active'
        }
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        database: {
          connected: false,
          responseTime: Date.now() - startTime,
          lastCheck: new Date().toISOString()
        },
        storage: {
          available: false
        },
        services: {
          sqlite: 'error'
        }
      };
    }
  }

  async backup(): Promise<BackupResult> {
    try {
      if (!this.db) {
        throw new Error('Database not initialized');
      }

      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const backupPath = `${this.dbPath}.backup.${timestamp}`;
      
      // Create backup by copying the database file
      await fs.copy(this.dbPath, backupPath);
      
      const stats = await fs.stat(backupPath);
      const tables = this.getTableNames();

      return {
        success: true,
        backupPath,
        size: stats.size,
        timestamp: new Date().toISOString(),
        tables
      };
    } catch (error) {
      return {
        success: false,
        backupPath: '',
        size: 0,
        timestamp: new Date().toISOString(),
        tables: [],
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  async restore(backupPath: string): Promise<RestoreResult> {
    try {
      if (!await fs.pathExists(backupPath)) {
        throw new Error(`Backup file not found: ${backupPath}`);
      }

      // Close current connection
      if (this.db) {
        this.db.close();
      }

      // Copy backup file over current database
      await fs.copy(backupPath, this.dbPath);
      
      // Reinitialize
      await this.initialize();
      
      const tables = this.getTableNames();

      return {
        success: true,
        restoredTables: tables,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      return {
        success: false,
        restoredTables: [],
        timestamp: new Date().toISOString(),
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  async close(): Promise<void> {
    if (this.db) {
      this.db.close();
      this.db = null;
    }
  }

  // =====================================================
  // PROFILE MANAGEMENT
  // =====================================================

  async getProfile(id: string): Promise<Profile | null> {
    if (!this.db) throw new Error('Database not initialized');
    
    const stmt = this.db.prepare('SELECT * FROM profiles WHERE id = ?');
    const result = stmt.get(id) as Profile | undefined;
    return result || null;
  }

  async getProfileByEmail(email: string): Promise<Profile | null> {
    if (!this.db) throw new Error('Database not initialized');
    
    const stmt = this.db.prepare('SELECT * FROM profiles WHERE email = ?');
    const result = stmt.get(email) as Profile | undefined;
    return result || null;
  }

  async createProfile(profile: CreateProfileRequest): Promise<Profile> {
    if (!this.db) throw new Error('Database not initialized');
    
    const now = new Date().toISOString();
    const newProfile: Profile = {
      ...profile,
      created_at: now,
      updated_at: now
    };

    const stmt = this.db.prepare(`
      INSERT INTO profiles (id, email, role, nome, congregacao_id, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);
    
    stmt.run(
      newProfile.id,
      newProfile.email,
      newProfile.role,
      newProfile.nome,
      newProfile.congregacao_id,
      newProfile.created_at,
      newProfile.updated_at
    );

    return newProfile;
  }

  async updateProfile(id: string, updates: UpdateProfileRequest): Promise<Profile> {
    if (!this.db) throw new Error('Database not initialized');
    
    const existing = await this.getProfile(id);
    if (!existing) {
      throw new Error(`Profile with id ${id} not found`);
    }

    const updatedProfile: Profile = {
      ...existing,
      ...updates,
      updated_at: new Date().toISOString()
    };

    const stmt = this.db.prepare(`
      UPDATE profiles 
      SET email = ?, role = ?, nome = ?, congregacao_id = ?, updated_at = ?
      WHERE id = ?
    `);
    
    stmt.run(
      updatedProfile.email,
      updatedProfile.role,
      updatedProfile.nome,
      updatedProfile.congregacao_id,
      updatedProfile.updated_at,
      id
    );

    return updatedProfile;
  }

  async deleteProfile(id: string): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');
    
    const stmt = this.db.prepare('DELETE FROM profiles WHERE id = ?');
    const result = stmt.run(id);
    
    if (result.changes === 0) {
      throw new Error(`Profile with id ${id} not found`);
    }
  }

  // =====================================================
  // STUDENT MANAGEMENT
  // =====================================================

  async getEstudantes(filters?: EstudanteFilters): Promise<Estudante[]> {
    if (!this.db) throw new Error('Database not initialized');
    
    let query = 'SELECT * FROM estudantes WHERE 1=1';
    const params: any[] = [];

    if (filters) {
      if (filters.congregacao_id) {
        query += ' AND congregacao_id = ?';
        params.push(filters.congregacao_id);
      }
      if (filters.cargo) {
        query += ' AND cargo = ?';
        params.push(filters.cargo);
      }
      if (filters.genero) {
        query += ' AND genero = ?';
        params.push(filters.genero);
      }
      if (filters.ativo !== undefined) {
        query += ' AND ativo = ?';
        params.push(filters.ativo ? 1 : 0);
      }
      if (filters.search) {
        query += ' AND (nome LIKE ? OR sobrenome LIKE ? OR email LIKE ?)';
        const searchTerm = `%${filters.search}%`;
        params.push(searchTerm, searchTerm, searchTerm);
      }
    }

    query += ' ORDER BY nome, sobrenome';

    const stmt = this.db.prepare(query);
    return stmt.all(...params) as Estudante[];
  }

  async getEstudante(id: string): Promise<Estudante | null> {
    if (!this.db) throw new Error('Database not initialized');
    
    const stmt = this.db.prepare('SELECT * FROM estudantes WHERE id = ?');
    const result = stmt.get(id) as Estudante | undefined;
    return result || null;
  }

  async createEstudante(estudante: CreateEstudanteRequest): Promise<Estudante> {
    if (!this.db) throw new Error('Database not initialized');
    
    const now = new Date().toISOString();
    const newEstudante: Estudante = {
      id: uuidv4(),
      ...estudante,
      ativo: estudante.ativo ?? true,
      created_at: now,
      updated_at: now
    };

    const stmt = this.db.prepare(`
      INSERT INTO estudantes (
        id, nome, sobrenome, data_nascimento, telefone, email, cargo, genero,
        privilegios, congregacao_id, id_pai_mae, ativo, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    
    stmt.run(
      newEstudante.id,
      newEstudante.nome,
      newEstudante.sobrenome,
      newEstudante.data_nascimento,
      newEstudante.telefone,
      newEstudante.email,
      newEstudante.cargo,
      newEstudante.genero,
      newEstudante.privilegios,
      newEstudante.congregacao_id,
      newEstudante.id_pai_mae,
      newEstudante.ativo ? 1 : 0,
      newEstudante.created_at,
      newEstudante.updated_at
    );

    return newEstudante;
  }

  async updateEstudante(id: string, updates: UpdateEstudanteRequest): Promise<Estudante> {
    if (!this.db) throw new Error('Database not initialized');
    
    const existing = await this.getEstudante(id);
    if (!existing) {
      throw new Error(`Estudante with id ${id} not found`);
    }

    const updatedEstudante: Estudante = {
      ...existing,
      ...updates,
      updated_at: new Date().toISOString()
    };

    const stmt = this.db.prepare(`
      UPDATE estudantes 
      SET nome = ?, sobrenome = ?, data_nascimento = ?, telefone = ?, email = ?,
          cargo = ?, genero = ?, privilegios = ?, id_pai_mae = ?, ativo = ?, updated_at = ?
      WHERE id = ?
    `);
    
    stmt.run(
      updatedEstudante.nome,
      updatedEstudante.sobrenome,
      updatedEstudante.data_nascimento,
      updatedEstudante.telefone,
      updatedEstudante.email,
      updatedEstudante.cargo,
      updatedEstudante.genero,
      updatedEstudante.privilegios,
      updatedEstudante.id_pai_mae,
      updatedEstudante.ativo ? 1 : 0,
      updatedEstudante.updated_at,
      id
    );

    return updatedEstudante;
  }

  async deleteEstudante(id: string): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');
    
    const stmt = this.db.prepare('DELETE FROM estudantes WHERE id = ?');
    const result = stmt.run(id);
    
    if (result.changes === 0) {
      throw new Error(`Estudante with id ${id} not found`);
    }
  }

  async getEstudantesByCongregacao(congregacaoId: string): Promise<Estudante[]> {
    return this.getEstudantes({ congregacao_id: congregacaoId });
  }

  // =====================================================
  // PROGRAM MANAGEMENT
  // =====================================================

  async getProgramas(filters?: ProgramFilters): Promise<Programa[]> {
    if (!this.db) throw new Error('Database not initialized');
    
    let query = 'SELECT * FROM programas WHERE 1=1';
    const params: any[] = [];

    if (filters) {
      if (filters.congregacao_id) {
        query += ' AND congregacao_id = ?';
        params.push(filters.congregacao_id);
      }
      if (filters.status) {
        query += ' AND status = ?';
        params.push(filters.status);
      }
      if (filters.semana_inicio_gte) {
        query += ' AND semana_inicio >= ?';
        params.push(filters.semana_inicio_gte);
      }
      if (filters.semana_inicio_lte) {
        query += ' AND semana_inicio <= ?';
        params.push(filters.semana_inicio_lte);
      }
    }

    query += ' ORDER BY semana_inicio DESC';

    const stmt = this.db.prepare(query);
    return stmt.all(...params) as Programa[];
  }

  async getPrograma(id: string): Promise<Programa | null> {
    if (!this.db) throw new Error('Database not initialized');
    
    const stmt = this.db.prepare('SELECT * FROM programas WHERE id = ?');
    const result = stmt.get(id) as Programa | undefined;
    return result || null;
  }

  async createPrograma(programa: CreateProgramaRequest): Promise<Programa> {
    if (!this.db) throw new Error('Database not initialized');
    
    const now = new Date().toISOString();
    const newPrograma: Programa = {
      id: uuidv4(),
      ...programa,
      status: programa.status ?? 'rascunho',
      created_at: now,
      updated_at: now
    };

    const stmt = this.db.prepare(`
      INSERT INTO programas (id, semana_inicio, semana_fim, material_estudo, congregacao_id, status, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);
    
    stmt.run(
      newPrograma.id,
      newPrograma.semana_inicio,
      newPrograma.semana_fim,
      newPrograma.material_estudo,
      newPrograma.congregacao_id,
      newPrograma.status,
      newPrograma.created_at,
      newPrograma.updated_at
    );

    return newPrograma;
  }

  async updatePrograma(id: string, updates: UpdateProgramaRequest): Promise<Programa> {
    if (!this.db) throw new Error('Database not initialized');
    
    const existing = await this.getPrograma(id);
    if (!existing) {
      throw new Error(`Programa with id ${id} not found`);
    }

    const updatedPrograma: Programa = {
      ...existing,
      ...updates,
      updated_at: new Date().toISOString()
    };

    const stmt = this.db.prepare(`
      UPDATE programas 
      SET semana_inicio = ?, semana_fim = ?, material_estudo = ?, status = ?, updated_at = ?
      WHERE id = ?
    `);
    
    stmt.run(
      updatedPrograma.semana_inicio,
      updatedPrograma.semana_fim,
      updatedPrograma.material_estudo,
      updatedPrograma.status,
      updatedPrograma.updated_at,
      id
    );

    return updatedPrograma;
  }

  async deletePrograma(id: string): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');
    
    const stmt = this.db.prepare('DELETE FROM programas WHERE id = ?');
    const result = stmt.run(id);
    
    if (result.changes === 0) {
      throw new Error(`Programa with id ${id} not found`);
    }
  }

  // =====================================================
  // ASSIGNMENT MANAGEMENT
  // =====================================================

  async getDesignacoes(filters?: DesignacaoFilters): Promise<Designacao[]> {
    if (!this.db) throw new Error('Database not initialized');
    
    let query = `
      SELECT d.* FROM designacoes d
      LEFT JOIN programas p ON d.programa_id = p.id
      WHERE 1=1
    `;
    const params: any[] = [];

    if (filters) {
      if (filters.programa_id) {
        query += ' AND d.programa_id = ?';
        params.push(filters.programa_id);
      }
      if (filters.estudante_id) {
        query += ' AND d.estudante_id = ?';
        params.push(filters.estudante_id);
      }
      if (filters.congregacao_id) {
        query += ' AND p.congregacao_id = ?';
        params.push(filters.congregacao_id);
      }
      if (filters.status) {
        query += ' AND d.status = ?';
        params.push(filters.status);
      }
      if (filters.semana_inicio_gte) {
        query += ' AND p.semana_inicio >= ?';
        params.push(filters.semana_inicio_gte);
      }
      if (filters.semana_inicio_lte) {
        query += ' AND p.semana_inicio <= ?';
        params.push(filters.semana_inicio_lte);
      }
    }

    query += ' ORDER BY p.semana_inicio DESC, d.parte';

    const stmt = this.db.prepare(query);
    return stmt.all(...params) as Designacao[];
  }

  async getDesignacao(id: string): Promise<Designacao | null> {
    if (!this.db) throw new Error('Database not initialized');
    
    const stmt = this.db.prepare('SELECT * FROM designacoes WHERE id = ?');
    const result = stmt.get(id) as Designacao | undefined;
    return result || null;
  }

  async createDesignacao(designacao: CreateDesignacaoRequest): Promise<Designacao> {
    if (!this.db) throw new Error('Database not initialized');
    
    const newDesignacao: Designacao = {
      id: uuidv4(),
      ...designacao,
      status: designacao.status ?? 'agendada',
      created_at: new Date().toISOString()
    };

    const stmt = this.db.prepare(`
      INSERT INTO designacoes (id, programa_id, estudante_id, ajudante_id, parte, tema, tempo_minutos, observacoes, status, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    
    stmt.run(
      newDesignacao.id,
      newDesignacao.programa_id,
      newDesignacao.estudante_id,
      newDesignacao.ajudante_id,
      newDesignacao.parte,
      newDesignacao.tema,
      newDesignacao.tempo_minutos,
      newDesignacao.observacoes,
      newDesignacao.status,
      newDesignacao.created_at
    );

    return newDesignacao;
  }

  async updateDesignacao(id: string, updates: UpdateDesignacaoRequest): Promise<Designacao> {
    if (!this.db) throw new Error('Database not initialized');
    
    const existing = await this.getDesignacao(id);
    if (!existing) {
      throw new Error(`Designacao with id ${id} not found`);
    }

    const updatedDesignacao: Designacao = {
      ...existing,
      ...updates
    };

    const stmt = this.db.prepare(`
      UPDATE designacoes 
      SET estudante_id = ?, ajudante_id = ?, parte = ?, tema = ?, tempo_minutos = ?, observacoes = ?, status = ?
      WHERE id = ?
    `);
    
    stmt.run(
      updatedDesignacao.estudante_id,
      updatedDesignacao.ajudante_id,
      updatedDesignacao.parte,
      updatedDesignacao.tema,
      updatedDesignacao.tempo_minutos,
      updatedDesignacao.observacoes,
      updatedDesignacao.status,
      id
    );

    return updatedDesignacao;
  }

  async deleteDesignacao(id: string): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');
    
    const stmt = this.db.prepare('DELETE FROM designacoes WHERE id = ?');
    const result = stmt.run(id);
    
    if (result.changes === 0) {
      throw new Error(`Designacao with id ${id} not found`);
    }
  }

  async getHistoricoDesignacoes(estudanteId: string, weeks: number = 8): Promise<HistoricoDesignacao> {
    if (!this.db) throw new Error('Database not initialized');
    
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - (weeks * 7));
    const cutoffDateStr = cutoffDate.toISOString().split('T')[0];

    const stmt = this.db.prepare(`
      SELECT d.*, p.semana_inicio
      FROM designacoes d
      JOIN programas p ON d.programa_id = p.id
      WHERE (d.estudante_id = ? OR d.ajudante_id = ?) 
        AND date(p.semana_inicio) >= date(?)
      ORDER BY p.semana_inicio DESC
    `);
    
    const results = stmt.all(estudanteId, estudanteId, cutoffDateStr) as any[];
    
    const designacoes = results.map(row => ({
      data_inicio_semana: row.semana_inicio,
      parte: row.parte,
      foi_ajudante: row.ajudante_id === estudanteId
    }));

    const ultimaDesignacao = designacoes.length > 0 ? designacoes[0].data_inicio_semana : undefined;

    return {
      estudante_id: estudanteId,
      designacoes,
      total_designacoes_8_semanas: designacoes.length,
      ultima_designacao: ultimaDesignacao
    };
  }

  async getDesignacoesByPrograma(programaId: string): Promise<Designacao[]> {
    return this.getDesignacoes({ programa_id: programaId });
  }

  // =====================================================
  // MEETING MANAGEMENT
  // =====================================================

  async getMeetings(filters?: MeetingFilters): Promise<Meeting[]> {
    if (!this.db) throw new Error('Database not initialized');
    
    let query = 'SELECT * FROM meetings WHERE 1=1';
    const params: any[] = [];

    if (filters) {
      if (filters.congregacao_id) {
        query += ' AND congregacao_id = ?';
        params.push(filters.congregacao_id);
      }
      if (filters.meeting_type) {
        query += ' AND meeting_type = ?';
        params.push(filters.meeting_type);
      }
      if (filters.status) {
        query += ' AND status = ?';
        params.push(filters.status);
      }
      if (filters.meeting_date_gte) {
        query += ' AND meeting_date >= ?';
        params.push(filters.meeting_date_gte);
      }
      if (filters.meeting_date_lte) {
        query += ' AND meeting_date <= ?';
        params.push(filters.meeting_date_lte);
      }
    }

    query += ' ORDER BY meeting_date DESC';

    const stmt = this.db.prepare(query);
    return stmt.all(...params) as Meeting[];
  }

  async getMeeting(id: string): Promise<Meeting | null> {
    if (!this.db) throw new Error('Database not initialized');
    
    const stmt = this.db.prepare('SELECT * FROM meetings WHERE id = ?');
    const result = stmt.get(id) as Meeting | undefined;
    return result || null;
  }

  async createMeeting(meeting: CreateMeetingRequest): Promise<Meeting> {
    if (!this.db) throw new Error('Database not initialized');
    
    const now = new Date().toISOString();
    const newMeeting: Meeting = {
      id: uuidv4(),
      ...meeting,
      status: meeting.status ?? 'scheduled',
      created_at: now,
      updated_at: now
    };

    const stmt = this.db.prepare(`
      INSERT INTO meetings (
        id, meeting_date, meeting_type, title, description, start_time, end_time,
        circuit_overseer_name, service_talk_title, closing_song_number,
        congregacao_id, status, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    
    stmt.run(
      newMeeting.id,
      newMeeting.meeting_date,
      newMeeting.meeting_type,
      newMeeting.title,
      newMeeting.description,
      newMeeting.start_time,
      newMeeting.end_time,
      newMeeting.circuit_overseer_name,
      newMeeting.service_talk_title,
      newMeeting.closing_song_number,
      newMeeting.congregacao_id,
      newMeeting.status,
      newMeeting.created_at,
      newMeeting.updated_at
    );

    return newMeeting;
  }

  async updateMeeting(id: string, updates: UpdateMeetingRequest): Promise<Meeting> {
    if (!this.db) throw new Error('Database not initialized');
    
    const existing = await this.getMeeting(id);
    if (!existing) {
      throw new Error(`Meeting with id ${id} not found`);
    }

    const updatedMeeting: Meeting = {
      ...existing,
      ...updates,
      updated_at: new Date().toISOString()
    };

    const stmt = this.db.prepare(`
      UPDATE meetings 
      SET meeting_date = ?, meeting_type = ?, title = ?, description = ?, start_time = ?, end_time = ?,
          circuit_overseer_name = ?, service_talk_title = ?, closing_song_number = ?, status = ?, updated_at = ?
      WHERE id = ?
    `);
    
    stmt.run(
      updatedMeeting.meeting_date,
      updatedMeeting.meeting_type,
      updatedMeeting.title,
      updatedMeeting.description,
      updatedMeeting.start_time,
      updatedMeeting.end_time,
      updatedMeeting.circuit_overseer_name,
      updatedMeeting.service_talk_title,
      updatedMeeting.closing_song_number,
      updatedMeeting.status,
      updatedMeeting.updated_at,
      id
    );

    return updatedMeeting;
  }

  async deleteMeeting(id: string): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');
    
    const stmt = this.db.prepare('DELETE FROM meetings WHERE id = ?');
    const result = stmt.run(id);
    
    if (result.changes === 0) {
      throw new Error(`Meeting with id ${id} not found`);
    }
  }

  // =====================================================
  // ADMINISTRATIVE ASSIGNMENT MANAGEMENT
  // =====================================================

  async getAdministrativeAssignments(filters?: AdministrativeAssignmentFilters): Promise<AdministrativeAssignment[]> {
    if (!this.db) throw new Error('Database not initialized');
    
    let query = 'SELECT * FROM administrative_assignments WHERE 1=1';
    const params: any[] = [];

    if (filters) {
      if (filters.congregacao_id) {
        query += ' AND congregacao_id = ?';
        params.push(filters.congregacao_id);
      }
      if (filters.id_estudante) {
        query += ' AND id_estudante = ?';
        params.push(filters.id_estudante);
      }
      if (filters.role) {
        query += ' AND role = ?';
        params.push(filters.role);
      }
      if (filters.assignment_date_gte) {
        query += ' AND assignment_date >= ?';
        params.push(filters.assignment_date_gte);
      }
      if (filters.assignment_date_lte) {
        query += ' AND assignment_date <= ?';
        params.push(filters.assignment_date_lte);
      }
      if (filters.is_recurring !== undefined) {
        query += ' AND is_recurring = ?';
        params.push(filters.is_recurring ? 1 : 0);
      }
    }

    query += ' ORDER BY assignment_date DESC';

    const stmt = this.db.prepare(query);
    return stmt.all(...params) as AdministrativeAssignment[];
  }

  async getAdministrativeAssignment(id: string): Promise<AdministrativeAssignment | null> {
    if (!this.db) throw new Error('Database not initialized');
    
    const stmt = this.db.prepare('SELECT * FROM administrative_assignments WHERE id = ?');
    const result = stmt.get(id) as AdministrativeAssignment | undefined;
    return result || null;
  }

  async createAdministrativeAssignment(assignment: CreateAdministrativeAssignmentRequest): Promise<AdministrativeAssignment> {
    if (!this.db) throw new Error('Database not initialized');
    
    const now = new Date().toISOString();
    const newAssignment: AdministrativeAssignment = {
      id: uuidv4(),
      ...assignment,
      created_at: now,
      updated_at: now
    };

    const stmt = this.db.prepare(`
      INSERT INTO administrative_assignments (
        id, id_estudante, role, assignment_date, start_date, end_date,
        is_recurring, assigned_room, notes, congregacao_id, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    
    stmt.run(
      newAssignment.id,
      newAssignment.id_estudante,
      newAssignment.role,
      newAssignment.assignment_date,
      newAssignment.start_date,
      newAssignment.end_date,
      newAssignment.is_recurring ? 1 : 0,
      newAssignment.assigned_room,
      newAssignment.notes,
      newAssignment.congregacao_id,
      newAssignment.created_at,
      newAssignment.updated_at
    );

    return newAssignment;
  }

  async updateAdministrativeAssignment(id: string, updates: UpdateAdministrativeAssignmentRequest): Promise<AdministrativeAssignment> {
    if (!this.db) throw new Error('Database not initialized');
    
    const existing = await this.getAdministrativeAssignment(id);
    if (!existing) {
      throw new Error(`Administrative assignment with id ${id} not found`);
    }

    const updatedAssignment: AdministrativeAssignment = {
      ...existing,
      ...updates,
      updated_at: new Date().toISOString()
    };

    const stmt = this.db.prepare(`
      UPDATE administrative_assignments 
      SET id_estudante = ?, role = ?, assignment_date = ?, start_date = ?, end_date = ?,
          is_recurring = ?, assigned_room = ?, notes = ?, updated_at = ?
      WHERE id = ?
    `);
    
    stmt.run(
      updatedAssignment.id_estudante,
      updatedAssignment.role,
      updatedAssignment.assignment_date,
      updatedAssignment.start_date,
      updatedAssignment.end_date,
      updatedAssignment.is_recurring ? 1 : 0,
      updatedAssignment.assigned_room,
      updatedAssignment.notes,
      updatedAssignment.updated_at,
      id
    );

    return updatedAssignment;
  }

  async deleteAdministrativeAssignment(id: string): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');
    
    const stmt = this.db.prepare('DELETE FROM administrative_assignments WHERE id = ?');
    const result = stmt.run(id);
    
    if (result.changes === 0) {
      throw new Error(`Administrative assignment with id ${id} not found`);
    }
  }

  // =====================================================
  // PRIVATE HELPER METHODS
  // =====================================================

  private async createTables(): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    // Create profiles table
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS profiles (
        id TEXT PRIMARY KEY,
        email TEXT UNIQUE NOT NULL,
        role TEXT NOT NULL CHECK (role IN ('admin', 'instrutor', 'estudante')),
        nome TEXT,
        congregacao_id TEXT,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      )
    `);

    // Create estudantes table
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS estudantes (
        id TEXT PRIMARY KEY,
        nome TEXT NOT NULL,
        sobrenome TEXT,
        data_nascimento TEXT,
        telefone TEXT,
        email TEXT,
        cargo TEXT NOT NULL CHECK (cargo IN ('anciao', 'servo_ministerial', 'pioneiro_regular', 'publicador_batizado', 'publicador_nao_batizado', 'estudante_novo')),
        genero TEXT NOT NULL CHECK (genero IN ('masculino', 'feminino')),
        privilegios TEXT,
        congregacao_id TEXT NOT NULL,
        id_pai_mae TEXT,
        ativo INTEGER NOT NULL DEFAULT 1,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL,
        FOREIGN KEY (id_pai_mae) REFERENCES estudantes(id)
      )
    `);

    // Create programas table
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS programas (
        id TEXT PRIMARY KEY,
        semana_inicio TEXT NOT NULL,
        semana_fim TEXT NOT NULL,
        material_estudo TEXT,
        congregacao_id TEXT NOT NULL,
        status TEXT NOT NULL DEFAULT 'rascunho' CHECK (status IN ('rascunho', 'ativo', 'arquivado')),
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      )
    `);

    // Create designacoes table
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS designacoes (
        id TEXT PRIMARY KEY,
        programa_id TEXT NOT NULL,
        estudante_id TEXT NOT NULL,
        ajudante_id TEXT,
        parte TEXT NOT NULL,
        tema TEXT,
        tempo_minutos INTEGER,
        observacoes TEXT,
        status TEXT NOT NULL DEFAULT 'agendada' CHECK (status IN ('agendada', 'confirmada', 'cancelada')),
        created_at TEXT NOT NULL,
        FOREIGN KEY (programa_id) REFERENCES programas(id) ON DELETE CASCADE,
        FOREIGN KEY (estudante_id) REFERENCES estudantes(id),
        FOREIGN KEY (ajudante_id) REFERENCES estudantes(id)
      )
    `);

    // Create meetings table
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS meetings (
        id TEXT PRIMARY KEY,
        meeting_date TEXT NOT NULL,
        meeting_type TEXT NOT NULL CHECK (meeting_type IN ('regular_midweek', 'regular_weekend', 'circuit_overseer_visit', 'assembly_week', 'convention_week', 'memorial', 'special_event', 'cancelled')),
        title TEXT NOT NULL,
        description TEXT,
        start_time TEXT,
        end_time TEXT,
        circuit_overseer_name TEXT,
        service_talk_title TEXT,
        closing_song_number INTEGER,
        congregacao_id TEXT NOT NULL,
        status TEXT NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'in_progress', 'completed', 'cancelled', 'postponed')),
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      )
    `);

    // Create administrative_assignments table
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS administrative_assignments (
        id TEXT PRIMARY KEY,
        id_estudante TEXT NOT NULL,
        role TEXT NOT NULL CHECK (role IN ('meeting_overseer', 'meeting_chairman', 'assistant_counselor', 'room_overseer', 'circuit_overseer')),
        assignment_date TEXT NOT NULL,
        start_date TEXT,
        end_date TEXT,
        is_recurring INTEGER NOT NULL DEFAULT 0,
        assigned_room TEXT CHECK (assigned_room IN ('main_hall', 'auxiliary_room_1', 'auxiliary_room_2', 'auxiliary_room_3')),
        notes TEXT,
        congregacao_id TEXT NOT NULL,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL,
        FOREIGN KEY (id_estudante) REFERENCES estudantes(id)
      )
    `);

    // Create indexes for performance
    this.db.exec(`
      CREATE INDEX IF NOT EXISTS idx_estudantes_congregacao ON estudantes(congregacao_id);
      CREATE INDEX IF NOT EXISTS idx_estudantes_cargo ON estudantes(cargo);
      CREATE INDEX IF NOT EXISTS idx_estudantes_ativo ON estudantes(ativo);
      CREATE INDEX IF NOT EXISTS idx_programas_congregacao ON programas(congregacao_id);
      CREATE INDEX IF NOT EXISTS idx_programas_semana ON programas(semana_inicio);
      CREATE INDEX IF NOT EXISTS idx_designacoes_programa ON designacoes(programa_id);
      CREATE INDEX IF NOT EXISTS idx_designacoes_estudante ON designacoes(estudante_id);
      CREATE INDEX IF NOT EXISTS idx_meetings_congregacao ON meetings(congregacao_id);
      CREATE INDEX IF NOT EXISTS idx_meetings_date ON meetings(meeting_date);
      CREATE INDEX IF NOT EXISTS idx_admin_assignments_estudante ON administrative_assignments(id_estudante);
      CREATE INDEX IF NOT EXISTS idx_admin_assignments_congregacao ON administrative_assignments(congregacao_id);
    `);
  }

  private getTableNames(): string[] {
    if (!this.db) return [];
    
    const stmt = this.db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'");
    const tables = stmt.all() as { name: string }[];
    return tables.map(t => t.name);
  }

  private async getFreeSpace(): Promise<number> {
    try {
      const stats = await fs.stat(path.dirname(this.dbPath));
      // This is a simplified implementation - in a real scenario you'd use a library like 'check-disk-space'
      return 1024 * 1024 * 1024; // Return 1GB as placeholder
    } catch {
      return 0;
    }
  }
}
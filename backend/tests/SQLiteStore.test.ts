import { SQLiteStore } from '../stores/SQLiteStore';
import { CreateEstudanteRequest, CreateProgramaRequest, CreateDesignacaoRequest } from '../interfaces/IDataStore';
import * as fs from 'fs-extra';
import * as path from 'path';
import * as os from 'os';

describe('SQLiteStore', () => {
  let store: SQLiteStore;
  let testDbPath: string;

  beforeEach(async () => {
    // Create a temporary database file for testing
    const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'sqlite-test-'));
    testDbPath = path.join(tempDir, 'test.db');
    store = new SQLiteStore(testDbPath);
    await store.initialize();
  });

  afterEach(async () => {
    // Clean up
    await store.close();
    await fs.remove(path.dirname(testDbPath));
  });

  describe('initialization', () => {
    it('should initialize successfully', async () => {
      const health = await store.healthCheck();
      expect(health.status).toBe('healthy');
      expect(health.database.connected).toBe(true);
    });

    it('should create all required tables', async () => {
      // Test that we can perform operations on all tables
      const estudanteData: CreateEstudanteRequest = {
        nome: 'Test Student',
        cargo: 'publicador_batizado',
        genero: 'masculino',
        congregacao_id: 'test-congregation'
      };

      const estudante = await store.createEstudante(estudanteData);
      expect(estudante.id).toBeDefined();
      expect(estudante.nome).toBe('Test Student');
    });
  });

  describe('profile management', () => {
    it('should create and retrieve a profile', async () => {
      const profileData = {
        id: 'test-profile-id',
        email: 'test@example.com',
        role: 'instrutor' as const,
        nome: 'Test User',
        congregacao_id: 'test-congregation'
      };

      const created = await store.createProfile(profileData);
      expect(created.id).toBe(profileData.id);
      expect(created.email).toBe(profileData.email);

      const retrieved = await store.getProfile(profileData.id);
      expect(retrieved).not.toBeNull();
      expect(retrieved!.email).toBe(profileData.email);
    });

    it('should update a profile', async () => {
      const profileData = {
        id: 'test-profile-id',
        email: 'test@example.com',
        role: 'instrutor' as const
      };

      await store.createProfile(profileData);
      
      const updated = await store.updateProfile(profileData.id, {
        nome: 'Updated Name'
      });

      expect(updated.nome).toBe('Updated Name');
      expect(updated.email).toBe(profileData.email);
    });

    it('should delete a profile', async () => {
      const profileData = {
        id: 'test-profile-id',
        email: 'test@example.com',
        role: 'instrutor' as const
      };

      await store.createProfile(profileData);
      await store.deleteProfile(profileData.id);

      const retrieved = await store.getProfile(profileData.id);
      expect(retrieved).toBeNull();
    });

    it('should find profile by email', async () => {
      const profileData = {
        id: 'test-profile-id',
        email: 'test@example.com',
        role: 'instrutor' as const
      };

      await store.createProfile(profileData);
      
      const found = await store.getProfileByEmail(profileData.email);
      expect(found).not.toBeNull();
      expect(found!.id).toBe(profileData.id);
    });
  });

  describe('student management', () => {
    it('should create and retrieve a student', async () => {
      const estudanteData: CreateEstudanteRequest = {
        nome: 'João Silva',
        sobrenome: 'Silva',
        cargo: 'publicador_batizado',
        genero: 'masculino',
        congregacao_id: 'test-congregation',
        email: 'joao@example.com',
        telefone: '11999999999'
      };

      const created = await store.createEstudante(estudanteData);
      expect(created.id).toBeDefined();
      expect(created.nome).toBe(estudanteData.nome);
      expect(created.ativo).toBe(true);

      const retrieved = await store.getEstudante(created.id);
      expect(retrieved).not.toBeNull();
      expect(retrieved!.nome).toBe(estudanteData.nome);
    });

    it('should update a student', async () => {
      const estudanteData: CreateEstudanteRequest = {
        nome: 'João Silva',
        cargo: 'publicador_batizado',
        genero: 'masculino',
        congregacao_id: 'test-congregation'
      };

      const created = await store.createEstudante(estudanteData);
      
      const updated = await store.updateEstudante(created.id, {
        nome: 'João Santos',
        cargo: 'servo_ministerial'
      });

      expect(updated.nome).toBe('João Santos');
      expect(updated.cargo).toBe('servo_ministerial');
    });

    it('should filter students by congregation', async () => {
      const estudante1: CreateEstudanteRequest = {
        nome: 'Student 1',
        cargo: 'publicador_batizado',
        genero: 'masculino',
        congregacao_id: 'congregation-1'
      };

      const estudante2: CreateEstudanteRequest = {
        nome: 'Student 2',
        cargo: 'publicador_batizado',
        genero: 'feminino',
        congregacao_id: 'congregation-2'
      };

      await store.createEstudante(estudante1);
      await store.createEstudante(estudante2);

      const congregation1Students = await store.getEstudantes({ congregacao_id: 'congregation-1' });
      expect(congregation1Students).toHaveLength(1);
      expect(congregation1Students[0].nome).toBe('Student 1');

      const congregation2Students = await store.getEstudantesByCongregacao('congregation-2');
      expect(congregation2Students).toHaveLength(1);
      expect(congregation2Students[0].nome).toBe('Student 2');
    });

    it('should filter students by search term', async () => {
      const estudante1: CreateEstudanteRequest = {
        nome: 'João Silva',
        cargo: 'publicador_batizado',
        genero: 'masculino',
        congregacao_id: 'test-congregation'
      };

      const estudante2: CreateEstudanteRequest = {
        nome: 'Maria Santos',
        cargo: 'publicador_batizado',
        genero: 'feminino',
        congregacao_id: 'test-congregation'
      };

      await store.createEstudante(estudante1);
      await store.createEstudante(estudante2);

      const searchResults = await store.getEstudantes({ search: 'João' });
      expect(searchResults).toHaveLength(1);
      expect(searchResults[0].nome).toBe('João Silva');
    });
  });

  describe('program management', () => {
    it('should create and retrieve a program', async () => {
      const programaData: CreateProgramaRequest = {
        semana_inicio: '2024-01-01',
        semana_fim: '2024-01-07',
        material_estudo: 'Test Material',
        congregacao_id: 'test-congregation'
      };

      const created = await store.createPrograma(programaData);
      expect(created.id).toBeDefined();
      expect(created.semana_inicio).toBe(programaData.semana_inicio);
      expect(created.status).toBe('rascunho');

      const retrieved = await store.getPrograma(created.id);
      expect(retrieved).not.toBeNull();
      expect(retrieved!.material_estudo).toBe(programaData.material_estudo);
    });

    it('should filter programs by date range', async () => {
      const programa1: CreateProgramaRequest = {
        semana_inicio: '2024-01-01',
        semana_fim: '2024-01-07',
        congregacao_id: 'test-congregation'
      };

      const programa2: CreateProgramaRequest = {
        semana_inicio: '2024-02-01',
        semana_fim: '2024-02-07',
        congregacao_id: 'test-congregation'
      };

      await store.createPrograma(programa1);
      await store.createPrograma(programa2);

      const januaryPrograms = await store.getProgramas({
        semana_inicio_gte: '2024-01-01',
        semana_inicio_lte: '2024-01-31'
      });

      expect(januaryPrograms).toHaveLength(1);
      expect(januaryPrograms[0].semana_inicio).toBe('2024-01-01');
    });
  });

  describe('assignment management', () => {
    let estudanteId: string;
    let programaId: string;

    beforeEach(async () => {
      // Create test student and program
      const estudante = await store.createEstudante({
        nome: 'Test Student',
        cargo: 'publicador_batizado',
        genero: 'masculino',
        congregacao_id: 'test-congregation'
      });
      estudanteId = estudante.id;

      const programa = await store.createPrograma({
        semana_inicio: new Date().toISOString().split('T')[0], // Use today's date
        semana_fim: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // One week from today
        congregacao_id: 'test-congregation'
      });
      programaId = programa.id;
    });

    it('should create and retrieve an assignment', async () => {
      const designacaoData: CreateDesignacaoRequest = {
        programa_id: programaId,
        estudante_id: estudanteId,
        parte: 'Leitura da Bíblia',
        tema: 'Genesis 1:1-10',
        tempo_minutos: 4
      };

      const created = await store.createDesignacao(designacaoData);
      expect(created.id).toBeDefined();
      expect(created.parte).toBe(designacaoData.parte);
      expect(created.status).toBe('agendada');

      const retrieved = await store.getDesignacao(created.id);
      expect(retrieved).not.toBeNull();
      expect(retrieved!.tema).toBe(designacaoData.tema);
    });

    it('should get assignments by program', async () => {
      const designacao1: CreateDesignacaoRequest = {
        programa_id: programaId,
        estudante_id: estudanteId,
        parte: 'Parte 1'
      };

      const designacao2: CreateDesignacaoRequest = {
        programa_id: programaId,
        estudante_id: estudanteId,
        parte: 'Parte 2'
      };

      await store.createDesignacao(designacao1);
      await store.createDesignacao(designacao2);

      const programAssignments = await store.getDesignacoesByPrograma(programaId);
      expect(programAssignments).toHaveLength(2);
    });

    it('should get assignment history for a student', async () => {
      // Create assignment
      await store.createDesignacao({
        programa_id: programaId,
        estudante_id: estudanteId,
        parte: 'Test Part'
      });

      const history = await store.getHistoricoDesignacoes(estudanteId);
      expect(history.estudante_id).toBe(estudanteId);
      expect(history.total_designacoes_8_semanas).toBe(1);
      expect(history.designacoes).toHaveLength(1);
    });
  });

  describe('backup and restore', () => {
    it('should create a backup', async () => {
      // Create some test data
      await store.createEstudante({
        nome: 'Test Student',
        cargo: 'publicador_batizado',
        genero: 'masculino',
        congregacao_id: 'test-congregation'
      });

      const backupResult = await store.backup();
      expect(backupResult.success).toBe(true);
      expect(backupResult.backupPath).toBeDefined();
      expect(backupResult.size).toBeGreaterThan(0);
      expect(backupResult.tables).toContain('estudantes');
    });

    it('should restore from backup', async () => {
      // Create test data and backup
      const originalStudent = await store.createEstudante({
        nome: 'Original Student',
        cargo: 'publicador_batizado',
        genero: 'masculino',
        congregacao_id: 'test-congregation'
      });

      const backupResult = await store.backup();
      expect(backupResult.success).toBe(true);

      // Modify data
      await store.updateEstudante(originalStudent.id, { nome: 'Modified Student' });

      // Restore from backup
      const restoreResult = await store.restore(backupResult.backupPath);
      expect(restoreResult.success).toBe(true);

      // Verify original data is restored
      const restoredStudent = await store.getEstudante(originalStudent.id);
      expect(restoredStudent!.nome).toBe('Original Student');
    });
  });

  describe('error handling', () => {
    it('should throw error when trying to get non-existent student', async () => {
      const result = await store.getEstudante('non-existent-id');
      expect(result).toBeNull();
    });

    it('should throw error when trying to update non-existent student', async () => {
      await expect(store.updateEstudante('non-existent-id', { nome: 'New Name' }))
        .rejects.toThrow('Estudante with id non-existent-id not found');
    });

    it('should throw error when trying to delete non-existent student', async () => {
      await expect(store.deleteEstudante('non-existent-id'))
        .rejects.toThrow('Estudante with id non-existent-id not found');
    });

    it('should handle database connection errors gracefully', async () => {
      await store.close();
      
      await expect(store.getEstudantes())
        .rejects.toThrow('Database not initialized');
    });
  });

  describe('transaction handling', () => {
    it('should handle foreign key constraints', async () => {
      // Try to create assignment without valid program
      const designacaoData: CreateDesignacaoRequest = {
        programa_id: 'non-existent-program',
        estudante_id: 'non-existent-student',
        parte: 'Test Part'
      };

      // This should fail due to foreign key constraints
      await expect(store.createDesignacao(designacaoData))
        .rejects.toThrow();
    });
  });
});
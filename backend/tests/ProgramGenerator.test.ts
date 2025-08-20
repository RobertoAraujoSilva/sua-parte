import { describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import { SQLiteStore } from '../stores/SQLiteStore';
import { DatabaseManager } from '../db/DatabaseManager';
import * as path from 'path';
import * as fs from 'fs-extra';
import * as os from 'os';

const ProgramGenerator = require('../services/programGenerator');

describe('ProgramGenerator with SQLiteStore', () => {
  let store: SQLiteStore;
  let programGenerator: any;
  let testDbPath: string;
  let tempDir: string;

  beforeEach(async () => {
    // Create temporary directory for test database
    tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'program-generator-test-'));
    testDbPath = path.join(tempDir, 'test.db');

    // Initialize database manager and store
    const dbManager = new DatabaseManager({
      userDataPath: tempDir,
      databaseName: 'test.db'
    });
    
    await dbManager.ensureDatabase();
    
    store = new SQLiteStore(testDbPath);
    await store.initialize();

    // Create test congregation and profile
    await store.createProfile({
      id: 'test-user-1',
      email: 'test@example.com',
      role: 'instrutor',
      nome: 'Test User',
      congregacao_id: 'test-congregation-1'
    });

    // Create test students
    await store.createEstudante({
      nome: 'João',
      sobrenome: 'Silva',
      cargo: 'publicador_batizado',
      genero: 'masculino',
      congregacao_id: 'test-congregation-1',
      ativo: true
    });

    await store.createEstudante({
      nome: 'Maria',
      sobrenome: 'Santos',
      cargo: 'publicador_batizado',
      genero: 'feminino',
      congregacao_id: 'test-congregation-1',
      ativo: true
    });

    // Initialize ProgramGenerator with SQLiteStore
    programGenerator = new ProgramGenerator(store);
    await programGenerator.initialize();
  });

  afterEach(async () => {
    if (store) {
      await store.close();
    }
    if (tempDir) {
      await fs.remove(tempDir);
    }
  });

  describe('initialization', () => {
    it('should initialize successfully with SQLiteStore', async () => {
      expect(programGenerator).toBeDefined();
      expect(programGenerator.dataStore).toBe(store);
    });
  });

  describe('generateWeeklyProgram', () => {
    it('should generate a weekly program with SQLiteStore', async () => {
      const materialInfo = {
        filename: 'mwb_T_202509.pdf',
        materialType: 'meeting_workbook',
        period: '202509',
        language: 'pt-BR',
        localPath: '/test/path'
      };

      const program = await programGenerator.generateWeeklyProgram(materialInfo, 'test-congregation-1');

      expect(program).toBeDefined();
      expect(program.id).toBeDefined();
      expect(program.congregacao_id).toBe('test-congregation-1');
      expect(program.status).toBe('rascunho');
    });

    it('should throw error for non-MWB materials', async () => {
      const materialInfo = {
        filename: 'some-other-material.pdf',
        materialType: 'other',
        period: '202509',
        language: 'pt-BR',
        localPath: '/test/path'
      };

      await expect(
        programGenerator.generateWeeklyProgram(materialInfo, 'test-congregation-1')
      ).rejects.toThrow('Apenas materiais MWB podem gerar programas');
    });
  });

  describe('createAssignmentsForProgram', () => {
    it('should create assignments for a program', async () => {
      // First create a program
      const program = await store.createPrograma({
        semana_inicio: '2025-09-01T00:00:00.000Z',
        semana_fim: '2025-09-07T23:59:59.999Z',
        material_estudo: 'mwb_T_202509.pdf',
        congregacao_id: 'test-congregation-1',
        status: 'rascunho'
      });

      // Get students for assignments
      const students = await store.getEstudantes({ congregacao_id: 'test-congregation-1' });
      expect(students.length).toBeGreaterThan(0);

      // Create assignments
      const assignments = [
        {
          estudante_id: students[0].id,
          parte: 'Leitura da Bíblia',
          tema: 'Gênesis 1:1-10',
          tempo_minutos: 4,
          observacoes: 'Primeira leitura da semana'
        },
        {
          estudante_id: students[1].id,
          ajudante_id: students[0].id,
          parte: 'Primeira Conversa',
          tema: 'Como iniciar conversas',
          tempo_minutos: 6,
          observacoes: 'Demonstração prática'
        }
      ];

      const createdAssignments = await programGenerator.createAssignmentsForProgram(program.id, assignments);

      expect(createdAssignments).toHaveLength(2);
      expect(createdAssignments[0].programa_id).toBe(program.id);
      expect(createdAssignments[0].estudante_id).toBe(students[0].id);
      expect(createdAssignments[1].ajudante_id).toBe(students[0].id);
    });
  });

  describe('getAssignmentsForProgram', () => {
    it('should retrieve assignments for a program', async () => {
      // Create a program
      const program = await store.createPrograma({
        semana_inicio: '2025-09-01T00:00:00.000Z',
        semana_fim: '2025-09-07T23:59:59.999Z',
        material_estudo: 'mwb_T_202509.pdf',
        congregacao_id: 'test-congregation-1',
        status: 'rascunho'
      });

      // Get a student
      const students = await store.getEstudantes({ congregacao_id: 'test-congregation-1' });
      
      // Create an assignment directly
      await store.createDesignacao({
        programa_id: program.id,
        estudante_id: students[0].id,
        parte: 'Test Assignment',
        tema: 'Test Theme',
        tempo_minutos: 5,
        status: 'agendada'
      });

      // Retrieve assignments through ProgramGenerator
      const assignments = await programGenerator.getAssignmentsForProgram(program.id);

      expect(assignments).toHaveLength(1);
      expect(assignments[0].programa_id).toBe(program.id);
      expect(assignments[0].parte).toBe('Test Assignment');
    });
  });

  describe('getStudentAssignmentHistory', () => {
    it('should retrieve student assignment history', async () => {
      const students = await store.getEstudantes({ congregacao_id: 'test-congregation-1' });
      const studentId = students[0].id;

      // Create a program and assignment for history
      const program = await store.createPrograma({
        semana_inicio: '2025-08-25T00:00:00.000Z',
        semana_fim: '2025-08-31T23:59:59.999Z',
        material_estudo: 'mwb_T_202508.pdf',
        congregacao_id: 'test-congregation-1',
        status: 'ativo'
      });

      await store.createDesignacao({
        programa_id: program.id,
        estudante_id: studentId,
        parte: 'Historical Assignment',
        tema: 'Past Theme',
        tempo_minutos: 4,
        status: 'confirmada'
      });

      // Get history through ProgramGenerator
      const history = await programGenerator.getStudentAssignmentHistory(studentId, 8);

      expect(history).toBeDefined();
      expect(history.estudante_id).toBe(studentId);
      expect(history.designacoes).toBeDefined();
    });
  });

  describe('getAvailableStudents', () => {
    it('should retrieve available students for assignments', async () => {
      const students = await programGenerator.getAvailableStudents('test-congregation-1');

      expect(students.length).toBeGreaterThanOrEqual(2);
      const joao = students.find((s: any) => s.nome === 'João');
      const maria = students.find((s: any) => s.nome === 'Maria');
      expect(joao).toBeDefined();
      expect(maria).toBeDefined();
      expect(students.every((s: any) => s.ativo === 1 || s.ativo === true)).toBe(true);
    });

    it('should filter students by cargo', async () => {
      // Create a student with different cargo
      await store.createEstudante({
        nome: 'Pedro',
        sobrenome: 'Costa',
        cargo: 'anciao',
        genero: 'masculino',
        congregacao_id: 'test-congregation-1',
        ativo: true
      });

      const elders = await programGenerator.getAvailableStudents('test-congregation-1', { 
        cargo: 'anciao' 
      });

      expect(elders).toHaveLength(1);
      expect(elders[0].nome).toBe('Pedro');
      expect(elders[0].cargo).toBe('anciao');
    });
  });

  describe('listPrograms', () => {
    it('should list all programs', async () => {
      // Create test programs
      await store.createPrograma({
        semana_inicio: '2025-09-01T00:00:00.000Z',
        semana_fim: '2025-09-07T23:59:59.999Z',
        material_estudo: 'mwb_T_202509.pdf',
        congregacao_id: 'test-congregation-1',
        status: 'rascunho'
      });

      await store.createPrograma({
        semana_inicio: '2025-09-08T00:00:00.000Z',
        semana_fim: '2025-09-14T23:59:59.999Z',
        material_estudo: 'mwb_T_202509.pdf',
        congregacao_id: 'test-congregation-1',
        status: 'ativo'
      });

      const allPrograms = await programGenerator.listPrograms();
      expect(allPrograms.length).toBeGreaterThanOrEqual(2);

      const activePrograms = await programGenerator.listPrograms('ativo');
      expect(activePrograms.length).toBeGreaterThanOrEqual(1);
      expect(activePrograms.some((p: any) => p.status === 'ativo')).toBe(true);
    });
  });

  describe('publishProgram', () => {
    it('should publish a program by updating its status', async () => {
      // Create a draft program
      const program = await store.createPrograma({
        semana_inicio: '2025-09-01T00:00:00.000Z',
        semana_fim: '2025-09-07T23:59:59.999Z',
        material_estudo: 'mwb_T_202509.pdf',
        congregacao_id: 'test-congregation-1',
        status: 'rascunho'
      });

      // Publish the program
      const publishedProgram = await programGenerator.publishProgram(program.id);

      expect(publishedProgram.status).toBe('ativo');
      expect(publishedProgram.id).toBe(program.id);
    });
  });

  describe('generateTestProgram', () => {
    it('should generate a test program successfully', async () => {
      const testProgram = await programGenerator.generateTestProgram();

      expect(testProgram).toBeDefined();
      expect(testProgram.id).toBeDefined();
      expect(testProgram.status).toBe('rascunho');
      expect(testProgram.material_estudo).toBe('mwb_T_202509.pdf');
    });
  });

  describe('offline mode functionality', () => {
    it('should initialize in offline mode by default', () => {
      expect(programGenerator.offlineMode).toBe(true);
      expect(programGenerator.enableLocalStorage).toBe(true);
      expect(programGenerator.enableNotifications).toBe(true);
    });

    it('should validate offline mode successfully', async () => {
      const validation = await programGenerator.validateOfflineMode();
      
      expect(validation).toBeDefined();
      expect(validation.isValid).toBe(true);
      expect(validation.results.dataStore).toBe(true);
      expect(validation.results.offlineMode).toBe(true);
    });

    it('should ensure local material references', () => {
      const externalUrl = 'https://jw.org/materials/mwb_T_202509.pdf';
      const localRef = programGenerator.ensureLocalMaterialReference(externalUrl);
      
      expect(localRef).toBe('mwb_T_202509.pdf');
      expect(localRef).not.toContain('http');
      expect(localRef).not.toContain('jw.org');
    });

    it('should store local notifications in offline mode', async () => {
      const notification = {
        type: 'test_notification',
        message: 'Test message',
        timestamp: new Date().toISOString()
      };

      // This should not throw an error
      await expect(programGenerator.storeLocalNotification(notification)).resolves.not.toThrow();
    });
  });
});
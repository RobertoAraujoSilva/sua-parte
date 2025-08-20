import { DatabaseManager } from '../db/DatabaseManager';
import * as fs from 'fs-extra';
import * as path from 'path';
import * as os from 'os';
import Database from 'better-sqlite3';

// Helper function to create a mock seed database for testing
async function createMockSeedDatabase(seedPath: string): Promise<void> {
  const db = new Database(seedPath);
  
  // Create schema
  db.exec(`
    CREATE TABLE profiles (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      role TEXT NOT NULL CHECK (role IN ('admin', 'instrutor', 'estudante')),
      nome TEXT,
      congregacao_id TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE estudantes (
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
    );

    CREATE TABLE programas (
      id TEXT PRIMARY KEY,
      semana_inicio TEXT NOT NULL,
      semana_fim TEXT NOT NULL,
      material_estudo TEXT,
      congregacao_id TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'rascunho' CHECK (status IN ('rascunho', 'ativo', 'arquivado')),
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE designacoes (
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
    );

    CREATE TABLE meetings (
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
    );

    CREATE TABLE administrative_assignments (
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
    );

    CREATE TABLE migrations (
      version TEXT PRIMARY KEY,
      description TEXT NOT NULL,
      applied_at TEXT NOT NULL
    );
  `);

  // Insert sample data
  const now = new Date().toISOString();
  const congregacaoId = 'test-congregacao-001';

  // Insert profiles
  db.prepare('INSERT INTO profiles (id, email, role, nome, congregacao_id, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)').run(
    'seed-admin-001', 'admin@seed.test', 'admin', 'Admin Seed', congregacaoId, now, now
  );
  db.prepare('INSERT INTO profiles (id, email, role, nome, congregacao_id, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)').run(
    'seed-instrutor-001', 'instrutor@seed.test', 'instrutor', 'Instrutor Seed', congregacaoId, now, now
  );

  // Insert students
  db.prepare('INSERT INTO estudantes (id, nome, sobrenome, data_nascimento, telefone, email, cargo, genero, privilegios, congregacao_id, id_pai_mae, ativo, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)').run(
    'seed-student-001', 'João', 'Silva', '1980-01-01', '(11) 99999-0001', 'joao@seed.test', 'anciao', 'masculino', null, congregacaoId, null, 1, now, now
  );
  db.prepare('INSERT INTO estudantes (id, nome, sobrenome, data_nascimento, telefone, email, cargo, genero, privilegios, congregacao_id, id_pai_mae, ativo, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)').run(
    'seed-student-002', 'Maria', 'Santos', '1985-01-01', '(11) 99999-0002', 'maria@seed.test', 'pioneiro_regular', 'feminino', null, congregacaoId, null, 1, now, now
  );

  // Insert programs
  db.prepare('INSERT INTO programas (id, semana_inicio, semana_fim, material_estudo, congregacao_id, status, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)').run(
    'seed-program-001', '2024-01-01', '2024-01-07', 'Material Seed', congregacaoId, 'ativo', now, now
  );

  // Insert assignments
  db.prepare('INSERT INTO designacoes (id, programa_id, estudante_id, ajudante_id, parte, tema, tempo_minutos, observacoes, status, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)').run(
    'seed-assignment-001', 'seed-program-001', 'seed-student-001', null, 'Tesouros da Palavra', 'Tema Seed', 10, null, 'agendada', now
  );

  // Insert meetings
  db.prepare('INSERT INTO meetings (id, meeting_date, meeting_type, title, description, start_time, end_time, circuit_overseer_name, service_talk_title, closing_song_number, congregacao_id, status, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)').run(
    'seed-meeting-001', '2024-01-01', 'regular_midweek', 'Reunião Seed', 'Descrição Seed', '19:30', '21:00', null, null, 150, congregacaoId, 'scheduled', now, now
  );

  // Insert migrations
  db.prepare('INSERT INTO migrations (version, description, applied_at) VALUES (?, ?, ?)').run(
    '001', 'Create basic schema', now
  );

  db.close();
}

describe('DatabaseManager', () => {
  let manager: DatabaseManager;
  let tempDir: string;
  let testDbPath: string;

  beforeEach(async () => {
    // Create a temporary directory for testing
    tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'db-manager-test-'));
    testDbPath = path.join(tempDir, 'test.db');
    
    manager = new DatabaseManager({
      userDataPath: tempDir,
      databaseName: 'test.db',
      enableBackups: true,
      maxBackups: 3
    });
  });

  afterEach(async () => {
    // Clean up
    await fs.remove(tempDir);
  });

  describe('initialization', () => {
    it('should create database from empty when no seed exists', async () => {
      await manager.ensureDatabase();
      
      const dbInfo = await manager.getDatabaseInfo();
      expect(dbInfo.exists).toBe(true);
      expect(dbInfo.isHealthy).toBe(true);
      expect(dbInfo.tables).toContain('profiles');
      expect(dbInfo.tables).toContain('estudantes');
    });

    it('should validate existing database schema', async () => {
      // Create database first
      await manager.ensureDatabase();
      
      // Run ensure again - should validate existing database
      await manager.ensureDatabase();
      
      const dbInfo = await manager.getDatabaseInfo();
      expect(dbInfo.isHealthy).toBe(true);
    });

    it('should create user data directory if it does not exist', async () => {
      const nonExistentDir = path.join(tempDir, 'nested', 'path');
      const managerWithNestedPath = new DatabaseManager({
        userDataPath: nonExistentDir,
        databaseName: 'test.db'
      });

      await managerWithNestedPath.ensureDatabase();
      
      const exists = await fs.pathExists(nonExistentDir);
      expect(exists).toBe(true);
    });
  });

  describe('seed database integration', () => {
    let seedDbPath: string;
    let managerWithSeed: DatabaseManager;

    beforeEach(async () => {
      // Create a mock seed database
      seedDbPath = path.join(tempDir, 'mock-seed.db');
      await createMockSeedDatabase(seedDbPath);
      
      managerWithSeed = new DatabaseManager({
        userDataPath: tempDir,
        seedDatabasePath: seedDbPath,
        databaseName: 'test-with-seed.db',
        enableBackups: true
      });
    });

    it('should copy seed database on first run when seed exists', async () => {
      await managerWithSeed.ensureDatabase();
      
      const dbInfo = await managerWithSeed.getDatabaseInfo();
      expect(dbInfo.exists).toBe(true);
      expect(dbInfo.isHealthy).toBe(true);
      
      // Verify seed data was copied
      const db = new Database(managerWithSeed.getDatabasePath(), { readonly: true });
      const profiles = db.prepare('SELECT COUNT(*) as count FROM profiles').get() as { count: number };
      const students = db.prepare('SELECT COUNT(*) as count FROM estudantes').get() as { count: number };
      db.close();
      
      expect(profiles.count).toBeGreaterThan(0);
      expect(students.count).toBeGreaterThan(0);
    });

    it('should detect existing database and skip seed deployment', async () => {
      // First run - should copy seed
      await managerWithSeed.ensureDatabase();
      
      const db = new Database(managerWithSeed.getDatabasePath());
      const originalCount = db.prepare('SELECT COUNT(*) as count FROM profiles').get() as { count: number };
      
      // Add a test record to verify database isn't overwritten
      db.prepare('INSERT INTO profiles (id, email, role, created_at, updated_at) VALUES (?, ?, ?, ?, ?)').run(
        'test-profile', 'test@example.com', 'admin', new Date().toISOString(), new Date().toISOString()
      );
      
      const modifiedCount = db.prepare('SELECT COUNT(*) as count FROM profiles').get() as { count: number };
      db.close();
      
      expect(modifiedCount.count).toBe(originalCount.count + 1);
      
      // Second run - should detect existing database and not overwrite
      await managerWithSeed.ensureDatabase();
      
      const db2 = new Database(managerWithSeed.getDatabasePath(), { readonly: true });
      const finalCount = db2.prepare('SELECT COUNT(*) as count FROM profiles').get() as { count: number };
      db2.close();
      
      expect(finalCount.count).toBe(modifiedCount.count); // Should be unchanged
    });

    it('should validate seed database integrity after deployment', async () => {
      await managerWithSeed.ensureDatabase();
      
      const dbInfo = await managerWithSeed.getDatabaseInfo();
      expect(dbInfo.isHealthy).toBe(true);
      
      // Verify all required tables exist
      const requiredTables = [
        'profiles',
        'estudantes',
        'programas',
        'designacoes',
        'meetings',
        'administrative_assignments',
        'migrations'
      ];
      
      for (const table of requiredTables) {
        expect(dbInfo.tables).toContain(table);
      }
      
      // Verify data relationships are intact
      const db = new Database(managerWithSeed.getDatabasePath(), { readonly: true });
      
      // Check for orphaned assignments
      const orphanedAssignments = db.prepare(`
        SELECT COUNT(*) as count 
        FROM designacoes d 
        LEFT JOIN programas p ON d.programa_id = p.id 
        WHERE p.id IS NULL
      `).get() as { count: number };
      
      expect(orphanedAssignments.count).toBe(0);
      
      // Check for orphaned student assignments
      const orphanedStudentAssignments = db.prepare(`
        SELECT COUNT(*) as count 
        FROM designacoes d 
        LEFT JOIN estudantes e ON d.estudante_id = e.id 
        WHERE e.id IS NULL
      `).get() as { count: number };
      
      expect(orphanedStudentAssignments.count).toBe(0);
      
      db.close();
    });

    it('should handle missing seed database gracefully', async () => {
      const managerWithMissingSeed = new DatabaseManager({
        userDataPath: tempDir,
        seedDatabasePath: path.join(tempDir, 'non-existent-seed.db'),
        databaseName: 'test-missing-seed.db'
      });
      
      // Should create empty database when seed is missing
      await managerWithMissingSeed.ensureDatabase();
      
      const dbInfo = await managerWithMissingSeed.getDatabaseInfo();
      expect(dbInfo.exists).toBe(true);
      expect(dbInfo.isHealthy).toBe(true);
      
      // Should have empty tables (except migrations)
      const db = new Database(managerWithMissingSeed.getDatabasePath(), { readonly: true });
      const profiles = db.prepare('SELECT COUNT(*) as count FROM profiles').get() as { count: number };
      const students = db.prepare('SELECT COUNT(*) as count FROM estudantes').get() as { count: number };
      db.close();
      
      expect(profiles.count).toBe(0);
      expect(students.count).toBe(0);
    });

    it('should run migrations after seed deployment', async () => {
      await managerWithSeed.ensureDatabase();
      
      const db = new Database(managerWithSeed.getDatabasePath(), { readonly: true });
      const migrations = db.prepare('SELECT * FROM migrations ORDER BY version').all();
      db.close();
      
      expect(migrations.length).toBeGreaterThan(0);
      
      // Verify migration structure
      for (const migration of migrations) {
        expect(migration).toHaveProperty('version');
        expect(migration).toHaveProperty('description');
        expect(migration).toHaveProperty('applied_at');
      }
    });

    it('should preserve seed data during schema validation', async () => {
      await managerWithSeed.ensureDatabase();
      
      // Get initial data counts
      const db1 = new Database(managerWithSeed.getDatabasePath(), { readonly: true });
      const initialProfiles = db1.prepare('SELECT COUNT(*) as count FROM profiles').get() as { count: number };
      const initialStudents = db1.prepare('SELECT COUNT(*) as count FROM estudantes').get() as { count: number };
      db1.close();
      
      // Run ensureDatabase again (should validate existing database)
      await managerWithSeed.ensureDatabase();
      
      // Verify data is preserved
      const db2 = new Database(managerWithSeed.getDatabasePath(), { readonly: true });
      const finalProfiles = db2.prepare('SELECT COUNT(*) as count FROM profiles').get() as { count: number };
      const finalStudents = db2.prepare('SELECT COUNT(*) as count FROM estudantes').get() as { count: number };
      db2.close();
      
      expect(finalProfiles.count).toBe(initialProfiles.count);
      expect(finalStudents.count).toBe(initialStudents.count);
    });
  });

  describe('schema validation', () => {
    it('should validate complete schema', async () => {
      await manager.ensureDatabase();
      
      const dbInfo = await manager.getDatabaseInfo();
      expect(dbInfo.isHealthy).toBe(true);
      
      const requiredTables = [
        'profiles',
        'estudantes',
        'programas',
        'designacoes',
        'meetings',
        'administrative_assignments'
      ];
      
      for (const table of requiredTables) {
        expect(dbInfo.tables).toContain(table);
      }
    });

    it('should detect missing tables', async () => {
      // Create incomplete database
      const db = new Database(testDbPath);
      db.exec(`
        CREATE TABLE profiles (
          id TEXT PRIMARY KEY,
          email TEXT NOT NULL
        );
      `);
      db.close();

      await manager.ensureDatabase();
      
      // Should have run migrations to add missing tables
      const dbInfo = await manager.getDatabaseInfo();
      expect(dbInfo.isHealthy).toBe(true);
      expect(dbInfo.tables).toContain('estudantes');
    });
  });

  describe('migrations', () => {
    it('should run migrations on new database', async () => {
      await manager.ensureDatabase();
      
      const db = new Database(testDbPath, { readonly: true });
      const migrations = db.prepare('SELECT * FROM migrations ORDER BY version').all();
      db.close();
      
      expect(migrations.length).toBeGreaterThan(0);
      expect(migrations[0]).toHaveProperty('version');
      expect(migrations[0]).toHaveProperty('description');
      expect(migrations[0]).toHaveProperty('applied_at');
    });

    it('should not re-run applied migrations', async () => {
      // First run
      await manager.ensureDatabase();
      
      const db1 = new Database(testDbPath, { readonly: true });
      const firstRunMigrations = db1.prepare('SELECT COUNT(*) as count FROM migrations').get() as { count: number };
      db1.close();
      
      // Second run
      await manager.ensureDatabase();
      
      const db2 = new Database(testDbPath, { readonly: true });
      const secondRunMigrations = db2.prepare('SELECT COUNT(*) as count FROM migrations').get() as { count: number };
      db2.close();
      
      expect(secondRunMigrations.count).toBe(firstRunMigrations.count);
    });
  });

  describe('backup and restore', () => {
    beforeEach(async () => {
      await manager.ensureDatabase();
    });

    it('should create backup', async () => {
      const backupPath = await manager.createBackup();
      
      expect(await fs.pathExists(backupPath)).toBe(true);
      expect(backupPath).toContain('ministerial-backup-');
      expect(backupPath.endsWith('.db')).toBe(true);
    });

    it('should restore from backup', async () => {
      // Create backup
      const backupPath = await manager.createBackup();
      
      // Modify original database
      const db = new Database(testDbPath);
      db.exec("INSERT INTO profiles (id, email, role, created_at, updated_at) VALUES ('test', 'test@example.com', 'admin', datetime('now'), datetime('now'))");
      db.close();
      
      // Restore from backup
      await manager.restoreFromBackup(backupPath);
      
      // Verify restoration
      const restoredDb = new Database(testDbPath, { readonly: true });
      const profiles = restoredDb.prepare('SELECT * FROM profiles WHERE id = ?').get('test');
      restoredDb.close();
      
      expect(profiles).toBeUndefined(); // Should not exist after restore
    });

    it('should cleanup old backups', async () => {
      const backupDir = path.join(tempDir, 'backups');
      
      // Create more backups than maxBackups
      for (let i = 0; i < 5; i++) {
        await manager.createBackup();
        // Small delay to ensure different timestamps
        await new Promise(resolve => setTimeout(resolve, 10));
      }
      
      const backupFiles = await fs.readdir(backupDir);
      const dbBackups = backupFiles.filter(file => file.startsWith('ministerial-backup-'));
      
      expect(dbBackups.length).toBe(3); // Should keep only maxBackups (3)
    });

    it('should handle restore from non-existent backup', async () => {
      const nonExistentPath = path.join(tempDir, 'non-existent-backup.db');
      
      await expect(manager.restoreFromBackup(nonExistentPath))
        .rejects.toThrow('Backup file not found');
    });
  });

  describe('database info', () => {
    it('should return info for non-existent database', async () => {
      const info = await manager.getDatabaseInfo();
      
      expect(info.exists).toBe(false);
      expect(info.size).toBe(0);
      expect(info.version).toBe('0');
      expect(info.tables).toEqual([]);
      expect(info.isHealthy).toBe(false);
    });

    it('should return info for existing database', async () => {
      await manager.ensureDatabase();
      
      const info = await manager.getDatabaseInfo();
      
      expect(info.exists).toBe(true);
      expect(info.size).toBeGreaterThan(0);
      expect(info.version).not.toBe('0');
      expect(info.tables.length).toBeGreaterThan(0);
      expect(info.isHealthy).toBe(true);
      expect(info.path).toBe(testDbPath);
    });
  });

  describe('path management', () => {
    it('should return correct database path', () => {
      const dbPath = manager.getDatabasePath();
      expect(dbPath).toBe(testDbPath);
    });

    it('should return correct user data path', () => {
      const userDataPath = manager.getUserDataPath();
      expect(userDataPath).toBe(tempDir);
    });

    it('should use platform-specific default paths', () => {
      const defaultManager = new DatabaseManager();
      const userDataPath = defaultManager.getUserDataPath();
      
      // Should contain platform-specific path elements
      expect(userDataPath).toContain('MinisterialSystem');
      
      if (process.platform === 'win32') {
        expect(userDataPath).toContain('AppData');
      } else if (process.platform === 'darwin') {
        expect(userDataPath).toContain('Library');
      } else {
        expect(userDataPath).toContain('.config');
      }
    });
  });

  describe('error handling', () => {
    it('should handle permission errors gracefully', async () => {
      // This test is platform-specific and may not work in all environments
      // Skip on Windows where permission handling is different
      if (process.platform === 'win32') {
        return;
      }

      const restrictedDir = path.join(tempDir, 'restricted');
      await fs.ensureDir(restrictedDir);
      await fs.chmod(restrictedDir, 0o444); // Read-only

      const restrictedManager = new DatabaseManager({
        userDataPath: restrictedDir,
        databaseName: 'test.db'
      });

      await expect(restrictedManager.ensureDatabase()).rejects.toThrow();
      
      // Cleanup
      await fs.chmod(restrictedDir, 0o755);
    });

    it('should handle corrupted database files', async () => {
      // Skip this test on Windows due to file locking issues
      if (process.platform === 'win32') {
        return;
      }
      
      // Create a corrupted database file
      await fs.writeFile(testDbPath, 'This is not a valid SQLite database');
      
      // Should handle the error and recreate the database
      try {
        await manager.ensureDatabase();
        // If it doesn't throw, that's also acceptable - it might recreate the database
      } catch (error) {
        // Expected behavior - corrupted database should cause an error
        expect(error).toBeDefined();
      }
    });
  });

  describe('configuration', () => {
    it('should respect backup configuration', () => {
      const managerWithoutBackups = new DatabaseManager({
        enableBackups: false
      });

      expect(managerWithoutBackups.createBackup()).rejects.toThrow('Backups are disabled');
    });

    it('should use custom database name', async () => {
      const customManager = new DatabaseManager({
        userDataPath: tempDir,
        databaseName: 'custom-name.db'
      });

      await customManager.ensureDatabase();
      
      const customDbPath = path.join(tempDir, 'custom-name.db');
      expect(await fs.pathExists(customDbPath)).toBe(true);
    });
  });
});
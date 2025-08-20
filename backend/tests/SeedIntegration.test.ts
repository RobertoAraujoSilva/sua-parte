import { DatabaseManager } from '../db/DatabaseManager';
import * as fs from 'fs-extra';
import * as path from 'path';
import * as os from 'os';
import { describe, expect, it, beforeEach, afterEach } from '@jest/globals';

describe('Seed Database Integration', () => {
  let testDir: string;
  let databaseManager: DatabaseManager;
  let seedPath: string;

  beforeEach(async () => {
    // Create temporary test directory
    testDir = await fs.mkdtemp(path.join(os.tmpdir(), 'ministerial-test-'));
    
    // Use the actual seed database from resources
    seedPath = path.join(__dirname, '../../resources/seed/ministerial-seed.db');
    
    // Initialize database manager with test directory
    databaseManager = new DatabaseManager({
      userDataPath: testDir,
      seedDatabasePath: seedPath,
      databaseName: 'test-ministerial.db',
      enableBackups: false
    });
  });

  afterEach(async () => {
    // Clean up test directory
    await fs.remove(testDir);
  });

  describe('First Run Experience', () => {
    it('should detect missing database and deploy seed', async () => {
      // Verify no database exists initially
      const dbPath = path.join(testDir, 'test-ministerial.db');
      expect(await fs.pathExists(dbPath)).toBe(false);

      // Initialize database (should deploy seed)
      await databaseManager.ensureDatabase();

      // Verify database was created
      expect(await fs.pathExists(dbPath)).toBe(true);

      // Verify database has expected structure
      const dbInfo = await databaseManager.getDatabaseInfo();
      expect(dbInfo.exists).toBe(true);
      expect(dbInfo.isHealthy).toBe(true);
      expect(dbInfo.tables).toContain('profiles');
      expect(dbInfo.tables).toContain('estudantes');
      expect(dbInfo.tables).toContain('programas');
      expect(dbInfo.tables).toContain('designacoes');
    });

    it('should skip seed deployment if database already exists', async () => {
      // First initialization
      await databaseManager.ensureDatabase();
      const firstInfo = await databaseManager.getDatabaseInfo();
      const firstSize = firstInfo.size;

      // Second initialization (should skip seed deployment)
      await databaseManager.ensureDatabase();
      const secondInfo = await databaseManager.getDatabaseInfo();

      // Database should remain unchanged
      expect(secondInfo.size).toBe(firstSize);
      expect(secondInfo.isHealthy).toBe(true);
    });

    it('should handle missing seed database gracefully', async () => {
      // Create database manager with non-existent seed path
      const invalidManager = new DatabaseManager({
        userDataPath: testDir,
        seedDatabasePath: '/non/existent/path.db',
        databaseName: 'test-ministerial.db',
        enableBackups: false
      });

      // Should create empty database instead of failing
      await expect(invalidManager.ensureDatabase()).resolves.not.toThrow();

      // Verify empty database was created
      const dbInfo = await invalidManager.getDatabaseInfo();
      expect(dbInfo.exists).toBe(true);
      expect(dbInfo.isHealthy).toBe(true);
    });
  });

  describe('Seed Database Validation', () => {
    it('should validate seed database before deployment', async () => {
      // Verify seed database exists and is valid
      expect(await fs.pathExists(seedPath)).toBe(true);

      // Initialize should succeed with valid seed
      await expect(databaseManager.ensureDatabase()).resolves.not.toThrow();

      const dbInfo = await databaseManager.getDatabaseInfo();
      expect(dbInfo.isHealthy).toBe(true);
    });

    it('should contain expected sample data', async () => {
      await databaseManager.ensureDatabase();

      // Test that seed database contains sample data
      const { SQLiteStore } = await import('../stores/SQLiteStore');
      const store = new SQLiteStore(databaseManager.getDatabasePath());
      await store.initialize();

      // Should have sample students
      const estudantes = await store.getEstudantes();
      expect(estudantes.length).toBeGreaterThan(0);

      // Verify sample data has proper structure
      const firstStudent = estudantes[0];
      expect(firstStudent.nome).toBeDefined();
      expect(firstStudent.cargo).toBeDefined();
      expect(firstStudent.congregacao_id).toBeDefined();

      await store.close();
    });
  });

  describe('Electron Integration Simulation', () => {
    it('should work with Electron resource paths', async () => {
      // Simulate Electron production resource path
      const electronResourcePath = path.join(testDir, 'resources');
      const electronSeedPath = path.join(electronResourcePath, 'seed', 'ministerial-seed.db');
      
      // Copy seed to simulated Electron resource location
      await fs.ensureDir(path.dirname(electronSeedPath));
      await fs.copy(seedPath, electronSeedPath);

      const electronManager = new DatabaseManager({
        userDataPath: path.join(testDir, 'app-data'),
        seedDatabasePath: electronSeedPath,
        databaseName: 'ministerial.db',
        enableBackups: true
      });

      // Should work with Electron-style paths
      await expect(electronManager.ensureDatabase()).resolves.not.toThrow();

      const dbInfo = await electronManager.getDatabaseInfo();
      expect(dbInfo.exists).toBe(true);
      expect(dbInfo.isHealthy).toBe(true);
    });
  });
});
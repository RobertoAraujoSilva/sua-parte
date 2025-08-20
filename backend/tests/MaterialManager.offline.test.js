const fs = require('fs-extra');
const path = require('path');

// Mock MaterialManager since it's a JS file
const MaterialManager = require('../services/materialManager');

// Mock dataStore for testing
const mockDataStore = {
  healthCheck: jest.fn().mockResolvedValue({
    status: 'healthy',
    database: { connected: true, responseTime: 50, lastCheck: new Date().toISOString() },
    storage: { available: true },
    services: {}
  }),
  
  getProgramas: jest.fn().mockResolvedValue([
    {
      id: '1',
      semana_inicio: '2024-01-01',
      semana_fim: '2024-01-07',
      congregacao_id: 'test-congregation',
      status: 'ativo',
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z'
    }
  ])
};

describe('MaterialManager Offline Mode', () => {
  let materialManager;
  let testDir;

  beforeEach(async () => {
    // Create temporary test directory
    testDir = path.join(__dirname, 'temp_material_test');
    await fs.ensureDir(testDir);
    
    // Mock the paths to use test directory
    const originalJoin = path.join;
    jest.spyOn(path, 'join').mockImplementation((...args) => {
      if (args.includes('../../docs/Oficial')) {
        return path.join(testDir, 'Oficial');
      }
      if (args.includes('../../docs/Programas')) {
        return path.join(testDir, 'Programas');
      }
      if (args.includes('../../docs/Backup')) {
        return path.join(testDir, 'Backup');
      }
      return originalJoin(...args);
    });
  });

  afterEach(async () => {
    // Cleanup test directory
    if (await fs.pathExists(testDir)) {
      await fs.remove(testDir);
    }
    jest.restoreAllMocks();
  });

  describe('Offline Mode Initialization', () => {
    it('should initialize in offline mode when no dataStore provided', async () => {
      materialManager = new MaterialManager();
      
      expect(materialManager.isOfflineMode()).toBe(true);
      
      await materialManager.initialize();
      
      // Verify directories were created
      expect(await fs.pathExists(path.join(testDir, 'Oficial'))).toBe(true);
      expect(await fs.pathExists(path.join(testDir, 'Programas'))).toBe(true);
      expect(await fs.pathExists(path.join(testDir, 'Backup'))).toBe(true);
    });

    it('should initialize in online mode when dataStore provided', async () => {
      materialManager = new MaterialManager(mockDataStore);
      
      expect(materialManager.isOfflineMode()).toBe(false);
      
      await materialManager.initialize();
    });

    it('should allow switching between offline and online modes', async () => {
      materialManager = new MaterialManager();
      
      expect(materialManager.isOfflineMode()).toBe(true);
      
      materialManager.setOfflineMode(false);
      expect(materialManager.isOfflineMode()).toBe(false);
      
      materialManager.setOfflineMode(true);
      expect(materialManager.isOfflineMode()).toBe(true);
    });

    it('should initialize with custom options', async () => {
      const options = {
        offlineMode: true,
        allowExternalDownloads: false
      };
      
      materialManager = new MaterialManager(null, options);
      
      expect(materialManager.isOfflineMode()).toBe(true);
      expect(materialManager.canDownloadExternally()).toBe(false);
    });
  });

  describe('Health Check in Offline Mode', () => {
    beforeEach(async () => {
      materialManager = new MaterialManager();
      await materialManager.initialize();
    });

    it('should perform health check in offline mode', async () => {
      const health = await materialManager.checkSystemHealth();
      
      expect(health.status).toBe('healthy');
      expect(health.mode).toBe('offline');
      expect(health.checks.database.status).toBe('offline');
      expect(health.checks.materialsDirectory.status).toBe('healthy');
      expect(health.checks.programsDirectory.status).toBe('healthy');
      expect(health.checks.backupDirectory.status).toBe('healthy');
      expect(health.checks.materialCache).toBeDefined();
      expect(health.checks.offlineMode).toBeDefined();
    });

    it('should detect directory access issues', async () => {
      // Remove one of the directories to simulate access issue
      await fs.remove(path.join(testDir, 'Oficial'));
      
      const health = await materialManager.checkSystemHealth();
      
      expect(health.status).toBe('degraded');
      expect(health.checks.materialsDirectory.status).toBe('error');
    });
  });

  describe('Local Materials Management', () => {
    beforeEach(async () => {
      materialManager = new MaterialManager();
      await materialManager.initialize();
    });

    it('should get local materials list', async () => {
      // Create some test files
      await fs.writeFile(path.join(testDir, 'Oficial', 'test.pdf'), 'test content');
      await fs.writeFile(path.join(testDir, 'Oficial', 'test.jwpub'), 'jwpub content');
      
      // Refresh cache
      await materialManager.refreshMaterialCache();
      
      const materials = await materialManager.getLocalMaterials();
      
      expect(materials).toHaveLength(2);
      
      // Sort materials by name for consistent testing
      materials.sort((a, b) => a.name.localeCompare(b.name));
      
      expect(materials[0].name).toBe('test.jwpub');
      expect(materials[0].type).toBe('JWPUB');
      expect(materials[0].isLocal).toBe(true);
      expect(materials[1].name).toBe('test.pdf');
      expect(materials[1].type).toBe('PDF');
    });

    it('should add local material', async () => {
      // Create a source file
      const sourceFile = path.join(testDir, 'source.pdf');
      await fs.writeFile(sourceFile, 'test pdf content');
      
      const result = await materialManager.addLocalMaterial(sourceFile, 'added.pdf');
      
      expect(result.name).toBe('added.pdf');
      expect(result.type).toBe('PDF');
      expect(await fs.pathExists(path.join(testDir, 'Oficial', 'added.pdf'))).toBe(true);
    });

    it('should remove local material', async () => {
      // Create a test file
      await fs.writeFile(path.join(testDir, 'Oficial', 'to-remove.pdf'), 'test content');
      await materialManager.refreshMaterialCache();
      
      const result = await materialManager.removeLocalMaterial('to-remove.pdf');
      
      expect(result).toBe(true);
      expect(await fs.pathExists(path.join(testDir, 'Oficial', 'to-remove.pdf'))).toBe(false);
    });

    it('should search local materials', async () => {
      // Create test files
      await fs.writeFile(path.join(testDir, 'Oficial', 'watchtower.pdf'), 'watchtower content');
      await fs.writeFile(path.join(testDir, 'Oficial', 'meeting.jwpub'), 'meeting content');
      await materialManager.refreshMaterialCache();
      
      const results = await materialManager.searchLocalMaterials('watch');
      
      expect(results).toHaveLength(1);
      expect(results[0].name).toBe('watchtower.pdf');
    });

    it('should get material path', async () => {
      await fs.writeFile(path.join(testDir, 'Oficial', 'test.pdf'), 'test content');
      await materialManager.refreshMaterialCache();
      
      const materialPath = materialManager.getMaterialPath('test.pdf');
      
      expect(materialPath).toBe(path.join(testDir, 'Oficial', 'test.pdf'));
    });
  });

  describe('Sync Info in Offline Mode', () => {
    beforeEach(async () => {
      materialManager = new MaterialManager();
      await materialManager.initialize();
    });

    it('should return offline sync info when no sync file exists', async () => {
      const syncInfo = await materialManager.getLastSyncInfo();
      
      expect(syncInfo.mode).toBe('offline');
      expect(syncInfo.lastProgramCreated).toBeNull();
      expect(syncInfo.lastProgramUpdated).toBeNull();
      expect(syncInfo.lastSync).toBeDefined();
    });

    it('should read sync info from local file when available', async () => {
      const testSyncInfo = {
        lastProgramCreated: '2024-01-01T00:00:00Z',
        lastProgramUpdated: '2024-01-01T12:00:00Z',
        mode: 'offline'
      };
      
      const syncPath = path.join(testDir, 'Backup', 'last_sync.json');
      await fs.ensureDir(path.dirname(syncPath));
      await fs.writeJson(syncPath, testSyncInfo);
      
      const syncInfo = await materialManager.getLastSyncInfo();
      
      expect(syncInfo.lastProgramCreated).toBe(testSyncInfo.lastProgramCreated);
      expect(syncInfo.lastProgramUpdated).toBe(testSyncInfo.lastProgramUpdated);
      expect(syncInfo.mode).toBe('offline');
    });
  });

  describe('Online Mode with DataStore', () => {
    beforeEach(async () => {
      materialManager = new MaterialManager(mockDataStore);
      await materialManager.initialize();
    });

    it('should use dataStore for sync info in online mode', async () => {
      const syncInfo = await materialManager.getLastSyncInfo();
      
      expect(syncInfo.mode).toBe('online');
      expect(syncInfo.lastProgramCreated).toBeDefined();
      expect(mockDataStore.getProgramas).toHaveBeenCalled();
    });

    it('should save sync info locally for offline reference', async () => {
      await materialManager.getLastSyncInfo();
      
      const syncPath = path.join(testDir, 'Backup', 'last_sync.json');
      expect(await fs.pathExists(syncPath)).toBe(true);
      
      const savedSyncInfo = await fs.readJson(syncPath);
      expect(savedSyncInfo.mode).toBe('online');
    });

    it('should use dataStore for health check in online mode', async () => {
      const health = await materialManager.checkSystemHealth();
      
      expect(health.mode).toBe('online');
      expect(health.checks.database.status).toBe('healthy');
      expect(mockDataStore.healthCheck).toHaveBeenCalled();
    });
  });

  describe('Usage Statistics', () => {
    beforeEach(async () => {
      materialManager = new MaterialManager();
      await materialManager.initialize();
    });

    it('should get usage statistics in offline mode', async () => {
      // Create some test materials
      await fs.writeFile(path.join(testDir, 'Oficial', 'test.pdf'), 'test content');
      await fs.writeFile(path.join(testDir, 'Oficial', 'test.jwpub'), 'jwpub content');
      await materialManager.refreshMaterialCache();
      
      const stats = await materialManager.getUsageStats();
      
      expect(stats.mode).toBe('offline');
      expect(stats.storage).toBeDefined();
      expect(stats.lastSync).toBeDefined();
      expect(stats.backups).toBeDefined();
      expect(stats.materials).toBeDefined();
      expect(stats.materials.total).toBe(2);
      expect(stats.materials.types).toBeDefined();
      expect(stats.allowExternalDownloads).toBe(false);
    });

    it('should get usage statistics in online mode', async () => {
      materialManager.setDataStore(mockDataStore);
      materialManager.setOfflineMode(false); // Explicitly set online mode
      
      const stats = await materialManager.getUsageStats();
      
      expect(stats.mode).toBe('online');
      expect(stats.storage).toBeDefined();
      expect(stats.lastSync).toBeDefined();
      expect(stats.backups).toBeDefined();
      expect(stats.materials).toBeDefined();
    });
  });

  describe('External Downloads Configuration', () => {
    beforeEach(async () => {
      materialManager = new MaterialManager();
      await materialManager.initialize();
    });

    it('should control external downloads setting', async () => {
      expect(materialManager.canDownloadExternally()).toBe(false);
      
      materialManager.setAllowExternalDownloads(true);
      expect(materialManager.canDownloadExternally()).toBe(false); // Still false because offline mode
      
      materialManager.setOfflineMode(false);
      expect(materialManager.canDownloadExternally()).toBe(true);
      
      materialManager.setAllowExternalDownloads(false);
      expect(materialManager.canDownloadExternally()).toBe(false);
    });
  });
});
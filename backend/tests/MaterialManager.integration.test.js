const MaterialManager = require('../services/materialManager');
const fs = require('fs-extra');
const path = require('path');

describe('MaterialManager Integration Tests', () => {
  let materialManager;
  let testDir;

  beforeEach(async () => {
    // Create temporary test directory
    testDir = path.join(__dirname, 'temp_integration_test');
    await fs.ensureDir(testDir);
    
    // Create MaterialManager with test paths
    const options = {
      materialsPath: path.join(testDir, 'Oficial'),
      programsPath: path.join(testDir, 'Programas'),
      backupPath: path.join(testDir, 'Backup'),
      offlineMode: true,
      allowExternalDownloads: false
    };
    
    materialManager = new MaterialManager(null, options);
  });

  afterEach(async () => {
    // Cleanup test directory
    if (await fs.pathExists(testDir)) {
      await fs.remove(testDir);
    }
  });

  describe('Complete Offline Workflow', () => {
    it('should handle complete offline material management workflow', async () => {
      // Initialize
      await materialManager.initialize();
      expect(materialManager.isOfflineMode()).toBe(true);
      expect(materialManager.canDownloadExternally()).toBe(false);
      
      // Create test materials
      const testFile1 = path.join(testDir, 'test1.pdf');
      const testFile2 = path.join(testDir, 'test2.jwpub');
      await fs.writeFile(testFile1, 'PDF content for test');
      await fs.writeFile(testFile2, 'JWPUB content for test');
      
      // Add materials
      const material1 = await materialManager.addLocalMaterial(testFile1);
      const material2 = await materialManager.addLocalMaterial(testFile2);
      
      expect(material1.name).toBe('test1.pdf');
      expect(material1.type).toBe('PDF');
      expect(material2.name).toBe('test2.jwpub');
      expect(material2.type).toBe('JWPUB');
      
      // List materials
      const materials = await materialManager.getLocalMaterials();
      expect(materials).toHaveLength(2);
      
      // Search materials
      const pdfMaterials = await materialManager.searchLocalMaterials('pdf');
      expect(pdfMaterials).toHaveLength(1);
      expect(pdfMaterials[0].name).toBe('test1.pdf');
      
      // Get material path
      const materialPath = materialManager.getMaterialPath('test1.pdf');
      expect(materialPath).toBeTruthy();
      expect(await fs.pathExists(materialPath)).toBe(true);
      
      // Health check
      const health = await materialManager.checkSystemHealth();
      expect(health.status).toBe('healthy');
      expect(health.mode).toBe('offline');
      expect(health.checks.materialCache.count).toBe(2);
      
      // Usage stats
      const stats = await materialManager.getUsageStats();
      expect(stats.mode).toBe('offline');
      expect(stats.materials.total).toBe(2);
      expect(stats.materials.types.PDF.count).toBe(1);
      expect(stats.materials.types.JWPUB.count).toBe(1);
      
      // Backup
      const backupResult = await materialManager.backupMaterials();
      expect(backupResult.materialCount).toBe(2);
      
      // List backups
      const backups = await materialManager.listBackups();
      expect(backups).toHaveLength(1);
      
      // Remove material
      const removed = await materialManager.removeLocalMaterial('test1.pdf');
      expect(removed).toBe(true);
      
      const remainingMaterials = await materialManager.getLocalMaterials();
      expect(remainingMaterials).toHaveLength(1);
      expect(remainingMaterials[0].name).toBe('test2.jwpub');
    });

    it('should handle integrity verification', async () => {
      await materialManager.initialize();
      
      // Create test material
      const testFile = path.join(testDir, 'integrity-test.pdf');
      await fs.writeFile(testFile, 'Test content for integrity check');
      await materialManager.addLocalMaterial(testFile);
      
      // Verify integrity
      const integrity = await materialManager.verifyMaterialsIntegrity();
      expect(integrity.status).toBe('healthy');
      expect(integrity.checks.Oficial.status).toBe('healthy');
      expect(integrity.checks.materialsFiles.count).toBe(1);
    });

    it('should handle temp file cleanup', async () => {
      await materialManager.initialize();
      
      // Create temp files
      const tempDir = path.join(testDir, 'Oficial', 'temp');
      await fs.ensureDir(tempDir);
      await fs.writeFile(path.join(tempDir, 'temp1.txt'), 'temp content 1');
      await fs.writeFile(path.join(tempDir, 'temp2.txt'), 'temp content 2');
      
      // Cleanup
      const result = await materialManager.cleanupTempFiles();
      expect(result.success).toBe(true);
      expect(result.cleanedFiles).toBe(2);
      expect(await fs.pathExists(tempDir)).toBe(false);
    });
  });

  describe('Configuration Management', () => {
    it('should handle offline mode configuration', async () => {
      await materialManager.initialize();
      
      expect(materialManager.isOfflineMode()).toBe(true);
      expect(materialManager.canDownloadExternally()).toBe(false);
      
      // Enable external downloads
      materialManager.setAllowExternalDownloads(true);
      expect(materialManager.canDownloadExternally()).toBe(false); // Still false due to offline mode
      
      // Switch to online mode
      materialManager.setOfflineMode(false);
      expect(materialManager.canDownloadExternally()).toBe(true);
      
      // Disable external downloads
      materialManager.setAllowExternalDownloads(false);
      expect(materialManager.canDownloadExternally()).toBe(false);
    });
  });
});
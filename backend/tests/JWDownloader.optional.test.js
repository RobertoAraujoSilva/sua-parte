const JWDownloader = require('../services/jwDownloader');
const fs = require('fs-extra');
const path = require('path');

describe('JWDownloader Optional Mode', () => {
  let testDownloadPath;
  
  beforeEach(async () => {
    // Create temporary test directory
    testDownloadPath = path.join(__dirname, 'temp-downloads');
    await fs.ensureDir(testDownloadPath);
  });
  
  afterEach(async () => {
    // Clean up test directory
    await fs.remove(testDownloadPath);
  });

  describe('Configuration Options', () => {
    it('should initialize with default options (enabled)', () => {
      const downloader = new JWDownloader();
      const status = downloader.getStatus();
      
      expect(status.enabled).toBe(true);
      expect(status.offlineMode).toBe(false);
      expect(status.allowAutoDownloads).toBe(true);
      expect(status.requireExplicitRequest).toBe(false);
      expect(status.canDownload).toBe(true);
      expect(status.canAutoDownload).toBe(true);
    });

    it('should initialize with offline mode options', () => {
      const downloader = new JWDownloader({
        offlineMode: true,
        requireExplicitRequest: true
      });
      const status = downloader.getStatus();
      
      expect(status.enabled).toBe(true);
      expect(status.offlineMode).toBe(true);
      expect(status.requireExplicitRequest).toBe(true);
      expect(status.canDownload).toBe(false);
      expect(status.canAutoDownload).toBe(false);
      expect(status.downloadReason).toContain('modo offline');
    });

    it('should initialize with explicit request only mode', () => {
      const downloader = new JWDownloader({
        requireExplicitRequest: true,
        allowAutoDownloads: false
      });
      const status = downloader.getStatus();
      
      expect(status.enabled).toBe(true);
      expect(status.offlineMode).toBe(false);
      expect(status.requireExplicitRequest).toBe(true);
      expect(status.allowAutoDownloads).toBe(false);
      expect(status.canDownload).toBe(true);
      expect(status.canAutoDownload).toBe(false);
      expect(status.autoDownloadReason).toContain('Downloads automáticos desabilitados');
    });

    it('should initialize with disabled options', () => {
      const downloader = new JWDownloader({
        enabled: false
      });
      const status = downloader.getStatus();
      
      expect(status.enabled).toBe(false);
      expect(status.canDownload).toBe(false);
      expect(status.canAutoDownload).toBe(false);
      expect(status.downloadReason).toContain('desabilitado');
    });
  });

  describe('Download Permission Checks', () => {
    it('should allow downloads when enabled and not in offline mode', async () => {
      const downloader = new JWDownloader({
        enabled: true,
        offlineMode: false
      });
      
      const canDownload = downloader.canDownload();
      expect(canDownload.allowed).toBe(true);
      expect(canDownload.reason).toContain('permitidos');
    });

    it('should block downloads when disabled', async () => {
      const downloader = new JWDownloader({
        enabled: false
      });
      
      const canDownload = downloader.canDownload();
      expect(canDownload.allowed).toBe(false);
      expect(canDownload.reason).toContain('desabilitado');
    });

    it('should block downloads when in offline mode', async () => {
      const downloader = new JWDownloader({
        enabled: true,
        offlineMode: true
      });
      
      const canDownload = downloader.canDownload();
      expect(canDownload.allowed).toBe(false);
      expect(canDownload.reason).toContain('modo offline');
    });

    it('should allow auto downloads when configured', async () => {
      const downloader = new JWDownloader({
        enabled: true,
        offlineMode: false,
        allowAutoDownloads: true,
        requireExplicitRequest: false
      });
      
      const canAutoDownload = downloader.canAutoDownload();
      expect(canAutoDownload.allowed).toBe(true);
      expect(canAutoDownload.reason).toContain('permitidos');
    });

    it('should block auto downloads when explicit request required', async () => {
      const downloader = new JWDownloader({
        enabled: true,
        offlineMode: false,
        requireExplicitRequest: true
      });
      
      const canAutoDownload = downloader.canAutoDownload();
      expect(canAutoDownload.allowed).toBe(false);
      expect(canAutoDownload.reason).toContain('apenas downloads explícitos');
    });

    it('should block auto downloads when not allowed', async () => {
      const downloader = new JWDownloader({
        enabled: true,
        offlineMode: false,
        allowAutoDownloads: false
      });
      
      const canAutoDownload = downloader.canAutoDownload();
      expect(canAutoDownload.allowed).toBe(false);
      expect(canAutoDownload.reason).toContain('desabilitados na configuração');
    });
  });

  describe('Method Behavior with Permissions', () => {
    it('should throw error when trying to check versions in offline mode without explicit request', async () => {
      const downloader = new JWDownloader({
        offlineMode: true
      });
      
      await expect(downloader.checkForNewVersions('pt-BR', false))
        .rejects.toThrow('Download não permitido');
    });

    it('should throw error when trying to download material when disabled without explicit request', async () => {
      const downloader = new JWDownloader({
        enabled: false
      });
      
      const materialInfo = {
        url: 'https://example.com/test.pdf',
        filename: 'test.pdf'
      };
      
      await expect(downloader.downloadMaterial(materialInfo, false))
        .rejects.toThrow('Download não permitido');
    });

    it('should throw error when trying to download by URL when disabled without explicit request', async () => {
      const downloader = new JWDownloader({
        enabled: false
      });
      
      await expect(downloader.downloadByUrl('https://example.com/test.pdf', 'pt-BR', false))
        .rejects.toThrow('Download não permitido');
    });

    it('should throw error when trying to check and download all in offline mode without explicit request', async () => {
      const downloader = new JWDownloader({
        offlineMode: true
      });
      
      await expect(downloader.checkAndDownloadAll(false))
        .rejects.toThrow('Download não permitido');
    });

    it('should throw error when trying auto download with explicit request required', async () => {
      const downloader = new JWDownloader({
        requireExplicitRequest: true
      });
      
      await expect(downloader.checkAndDownloadAll(false))
        .rejects.toThrow('apenas downloads explícitos');
    });
  });

  describe('Explicit Request Override', () => {
    it('should allow downloads with explicit request even in restricted modes', async () => {
      const downloader = new JWDownloader({
        requireExplicitRequest: true,
        allowAutoDownloads: false
      });
      
      // Mock the actual download functionality to avoid network calls
      const originalDownloadMaterial = downloader.downloadMaterial;
      downloader.downloadMaterial = jest.fn().mockResolvedValue({
        status: 'downloaded',
        filename: 'test.pdf'
      });
      
      // This should not throw because it's an explicit request
      const result = await downloader.downloadByUrl('https://example.com/test.pdf', 'pt-BR', true);
      expect(result.status).toBe('downloaded');
      
      // Restore original method
      downloader.downloadMaterial = originalDownloadMaterial;
    });
  });

  describe('Status Reporting', () => {
    it('should provide comprehensive status information', () => {
      const downloader = new JWDownloader({
        enabled: true,
        offlineMode: false,
        allowAutoDownloads: true,
        requireExplicitRequest: false
      });
      
      const status = downloader.getStatus();
      
      expect(status).toHaveProperty('enabled');
      expect(status).toHaveProperty('offlineMode');
      expect(status).toHaveProperty('allowAutoDownloads');
      expect(status).toHaveProperty('requireExplicitRequest');
      expect(status).toHaveProperty('canDownload');
      expect(status).toHaveProperty('canAutoDownload');
      expect(status).toHaveProperty('downloadReason');
      expect(status).toHaveProperty('autoDownloadReason');
      expect(status).toHaveProperty('downloadPath');
      expect(status).toHaveProperty('isDownloading');
      expect(status).toHaveProperty('queueLength');
    });
  });
});
const { createServiceContainer } = require('../dist/container/ServiceContainer');
const fs = require('fs-extra');
const path = require('path');

describe('JWDownloader Integration with ServiceContainer', () => {
  let container;
  let originalEnv;
  
  beforeEach(() => {
    // Save original environment
    originalEnv = { ...process.env };
    container = createServiceContainer();
  });
  
  afterEach(() => {
    // Restore original environment
    process.env = originalEnv;
  });

  describe('Service Container Configuration', () => {
    it('should configure JWDownloader for offline mode when database is SQLite', () => {
      // Set environment for offline mode
      const originalNodeEnv = process.env.NODE_ENV;
      const originalDbType = process.env.DATABASE_TYPE;
      
      process.env.NODE_ENV = 'production';
      process.env.DATABASE_TYPE = 'sqlite';
      
      // Create container after setting environment
      const container = createServiceContainer();
      const jwDownloader = container.resolve('jwDownloader');
      const status = jwDownloader.getStatus();
      
      expect(status.offlineMode).toBe(true);
      expect(status.requireExplicitRequest).toBe(true);
      expect(status.canAutoDownload).toBe(false);
      
      // Restore environment
      process.env.NODE_ENV = originalNodeEnv;
      process.env.DATABASE_TYPE = originalDbType;
    });

    it('should configure JWDownloader for development mode when database is Supabase', () => {
      // Set environment for development mode
      const originalNodeEnv = process.env.NODE_ENV;
      const originalDbType = process.env.DATABASE_TYPE;
      
      process.env.NODE_ENV = 'development';
      process.env.DATABASE_TYPE = 'supabase';
      
      // Create container after setting environment
      const container = createServiceContainer();
      const jwDownloader = container.resolve('jwDownloader');
      const status = jwDownloader.getStatus();
      
      expect(status.offlineMode).toBe(false);
      expect(status.canDownload).toBe(true);
      
      // Restore environment
      process.env.NODE_ENV = originalNodeEnv;
      process.env.DATABASE_TYPE = originalDbType;
    });

    it('should respect JW_DOWNLOADER_ENABLED environment variable', () => {
      process.env.JW_DOWNLOADER_ENABLED = 'false';
      
      const container = createServiceContainer();
      const jwDownloader = container.resolve('jwDownloader');
      const status = jwDownloader.getStatus();
      
      expect(status.enabled).toBe(false);
      expect(status.canDownload).toBe(false);
    });

    it('should respect JW_ALLOW_AUTO_DOWNLOADS environment variable', () => {
      process.env.JW_ALLOW_AUTO_DOWNLOADS = 'true';
      process.env.NODE_ENV = 'development';
      
      const container = createServiceContainer();
      const jwDownloader = container.resolve('jwDownloader');
      const status = jwDownloader.getStatus();
      
      expect(status.allowAutoDownloads).toBe(true);
    });

    it('should respect JW_REQUIRE_EXPLICIT_REQUEST environment variable', () => {
      process.env.JW_REQUIRE_EXPLICIT_REQUEST = 'true';
      process.env.NODE_ENV = 'development';
      
      const container = createServiceContainer();
      const jwDownloader = container.resolve('jwDownloader');
      const status = jwDownloader.getStatus();
      
      expect(status.requireExplicitRequest).toBe(true);
      expect(status.canAutoDownload).toBe(false);
    });
  });

  describe('Service Initialization', () => {
    it('should initialize JWDownloader service successfully', async () => {
      const jwDownloader = container.resolve('jwDownloader');
      
      // Should not throw
      await expect(jwDownloader.initialize()).resolves.not.toThrow();
      
      const status = jwDownloader.getStatus();
      expect(status).toBeDefined();
      expect(typeof status.enabled).toBe('boolean');
      expect(typeof status.canDownload).toBe('boolean');
    });

    it('should provide consistent status across multiple resolutions', () => {
      const jwDownloader1 = container.resolve('jwDownloader');
      const jwDownloader2 = container.resolve('jwDownloader');
      
      // Should be the same instance (not singleton, but same configuration)
      const status1 = jwDownloader1.getStatus();
      const status2 = jwDownloader2.getStatus();
      
      expect(status1.enabled).toBe(status2.enabled);
      expect(status1.offlineMode).toBe(status2.offlineMode);
      expect(status1.allowAutoDownloads).toBe(status2.allowAutoDownloads);
    });
  });

  describe('Environment-based Configuration', () => {
    const testCases = [
      {
        name: 'Production SQLite (Offline Mode)',
        env: {
          NODE_ENV: 'production',
          DATABASE_TYPE: 'sqlite'
        },
        expected: {
          offlineMode: true,
          requireExplicitRequest: true,
          canDownload: false,
          canAutoDownload: false
        }
      },
      {
        name: 'Development with explicit request required',
        env: {
          NODE_ENV: 'development',
          JW_REQUIRE_EXPLICIT_REQUEST: 'true'
        },
        expected: {
          offlineMode: false,
          requireExplicitRequest: true,
          canDownload: true,
          canAutoDownload: false
        }
      },
      {
        name: 'Development with auto downloads enabled',
        env: {
          NODE_ENV: 'development',
          JW_ALLOW_AUTO_DOWNLOADS: 'true'
        },
        expected: {
          offlineMode: false,
          allowAutoDownloads: true,
          canDownload: true,
          canAutoDownload: true
        }
      },
      {
        name: 'Disabled service',
        env: {
          JW_DOWNLOADER_ENABLED: 'false'
        },
        expected: {
          enabled: false,
          canDownload: false,
          canAutoDownload: false
        }
      }
    ];

    testCases.forEach(({ name, env, expected }) => {
      it(`should configure correctly for ${name}`, () => {
        // Set environment variables
        Object.keys(env).forEach(key => {
          process.env[key] = env[key];
        });
        
        const container = createServiceContainer();
        const jwDownloader = container.resolve('jwDownloader');
        const status = jwDownloader.getStatus();
        
        // Check expected properties
        Object.keys(expected).forEach(key => {
          expect(status[key]).toBe(expected[key]);
        });
      });
    });
  });

  describe('Error Handling', () => {
    it('should handle service resolution errors gracefully', () => {
      // This should not throw during resolution
      expect(() => container.resolve('jwDownloader')).not.toThrow();
    });

    it('should provide meaningful error messages for blocked operations', async () => {
      process.env.NODE_ENV = 'production';
      process.env.DATABASE_TYPE = 'sqlite';
      
      const container = createServiceContainer();
      const jwDownloader = container.resolve('jwDownloader');
      
      await expect(jwDownloader.checkForNewVersions('pt-BR', false))
        .rejects.toThrow(/Download não permitido.*modo offline/);
    });
  });
});
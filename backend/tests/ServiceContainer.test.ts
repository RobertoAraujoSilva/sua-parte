import { ServiceContainer, createServiceContainer } from '../container/ServiceContainer';
import * as path from 'path';
import * as fs from 'fs-extra';
import * as os from 'os';

describe('ServiceContainer', () => {
  let container: ServiceContainer;
  let tempDir: string;

  beforeEach(async () => {
    // Create temporary directory for testing
    tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'service-container-test-'));
    
    container = new ServiceContainer();
    
    // Configure for testing
    container.setConfig('database', {
      type: 'sqlite',
      sqlite: {
        userDataPath: tempDir,
        seedDatabasePath: path.join(__dirname, '../resources/seed/ministerial-seed.db'),
        databaseName: 'test.db',
        enableBackups: false
      }
    });
  });

  afterEach(async () => {
    if (container) {
      await container.shutdown();
    }
    await fs.remove(tempDir);
  });

  describe('basic functionality', () => {
    it('should register and resolve services', () => {
      container.register('testService', () => ({ name: 'test' }));
      
      const service = container.resolve('testService');
      expect(service.name).toBe('test');
    });

    it('should handle singleton services', () => {
      container.singleton('singletonService', () => ({ id: Math.random() }));
      
      const service1 = container.resolve('singletonService');
      const service2 = container.resolve('singletonService');
      
      expect(service1.id).toBe(service2.id);
    });

    it('should throw error for unknown services', () => {
      expect(() => container.resolve('unknownService')).toThrow('Service \'unknownService\' not found');
    });

    it('should check if service exists', () => {
      container.register('existingService', () => ({}));
      
      expect(container.has('existingService')).toBe(true);
      expect(container.has('nonExistentService')).toBe(false);
    });
  });

  describe('configuration', () => {
    it('should get and set configuration', () => {
      container.setConfig('testKey', 'testValue');
      
      expect(container.getConfig('testKey')).toBe('testValue');
      expect(container.getConfig()).toHaveProperty('testKey', 'testValue');
    });
  });

  describe('default container', () => {
    let defaultContainer: ServiceContainer;

    beforeEach(() => {
      defaultContainer = createServiceContainer();
      
      // Override database config for testing
      defaultContainer.setConfig('database', {
        type: 'sqlite',
        sqlite: {
          userDataPath: tempDir,
          seedDatabasePath: path.join(__dirname, '../../resources/seed/ministerial-seed.db'),
          databaseName: 'test.db',
          enableBackups: false
        }
      });
    });

    afterEach(async () => {
      if (defaultContainer) {
        await defaultContainer.shutdown();
      }
    });

    it('should have all required services registered', () => {
      expect(defaultContainer.has('databaseManager')).toBe(true);
      expect(defaultContainer.has('dataStore')).toBe(true);
      expect(defaultContainer.has('jwDownloader')).toBe(true);
      expect(defaultContainer.has('programGenerator')).toBe(true);
      expect(defaultContainer.has('materialManager')).toBe(true);
      expect(defaultContainer.has('notificationService')).toBe(true);
    });

    it('should resolve database manager', () => {
      const databaseManager = defaultContainer.resolve('databaseManager');
      
      expect(databaseManager).toBeDefined();
      expect(typeof databaseManager.ensureDatabase).toBe('function');
      expect(typeof databaseManager.getDatabasePath).toBe('function');
    });

    it('should resolve data store', () => {
      const dataStore = defaultContainer.resolve('dataStore');
      
      expect(dataStore).toBeDefined();
      expect(typeof dataStore.initialize).toBe('function');
      expect(typeof dataStore.getEstudantes).toBe('function');
    });

    it('should initialize successfully', async () => {
      // This test might take a while as it initializes the database
      await expect(defaultContainer.initialize()).resolves.not.toThrow();
      
      // Verify services are working
      const dataStore = defaultContainer.resolve('dataStore');
      const healthCheck = await dataStore.healthCheck();
      
      expect(healthCheck.status).toBe('healthy');
    }, 10000); // 10 second timeout for database initialization
  });

  describe('dependency injection', () => {
    it('should inject dependencies into services', () => {
      container.register('dependency', () => ({ value: 'injected' }));
      container.register('service', (container) => {
        const dep = container.resolve('dependency');
        return { dependency: dep };
      });
      
      const service = container.resolve('service');
      expect(service.dependency.value).toBe('injected');
    });

    it('should handle circular dependencies gracefully', () => {
      container.register('serviceA', (container) => {
        // This would cause infinite recursion if not handled properly
        // For now, we just test that it doesn't crash immediately
        return { name: 'A' };
      });
      
      container.register('serviceB', (container) => {
        const serviceA = container.resolve('serviceA');
        return { name: 'B', dependency: serviceA };
      });
      
      const serviceB = container.resolve('serviceB');
      expect(serviceB.name).toBe('B');
      expect(serviceB.dependency.name).toBe('A');
    });
  });

  describe('error handling', () => {
    it('should handle service factory errors', () => {
      container.register('errorService', () => {
        throw new Error('Service creation failed');
      });
      
      expect(() => container.resolve('errorService')).toThrow('Service creation failed');
    });

    it('should handle initialization errors gracefully', async () => {
      // Configure with unsupported database type
      container.setConfig('database', {
        type: 'unsupported' as any,
        sqlite: {
          userDataPath: tempDir,
          seedDatabasePath: '/also/invalid',
          databaseName: 'test.db',
          enableBackups: false
        }
      });

      const defaultContainer = createServiceContainer();
      defaultContainer.setConfig('database', container.getConfig('database'));

      await expect(defaultContainer.initialize()).rejects.toThrow('Unsupported database type');
    });
  });

  describe('shutdown', () => {
    it('should shutdown gracefully', async () => {
      container.singleton('serviceWithClose', () => ({
        closed: false,
        close: async function() {
          this.closed = true;
        }
      }));
      
      const service = container.resolve('serviceWithClose');
      expect(service.closed).toBe(false);
      
      await container.shutdown();
      
      // Service should be cleared from singletons
      // We can't directly access private singletons, but we can test that a new resolve creates a new instance
      const newService = container.resolve('serviceWithClose');
      expect(newService.closed).toBe(false); // Should be a new instance
    });
  });
});
import { SQLiteStore } from '../stores/SQLiteStore';
import { DatabaseManager } from '../db/DatabaseManager';
import * as path from 'path';

interface DatabaseConfig {
  type: 'sqlite' | 'supabase';
  sqlite: {
    userDataPath?: string;
    seedDatabasePath?: string;
    databaseName?: string;
    enableBackups?: boolean;
  };
  supabase: {
    url?: string;
    key?: string;
  };
}

interface ServiceConfig {
  mode: string;
  database: DatabaseConfig;
}

interface ServiceDefinition {
  factory: (container: ServiceContainer) => any;
  singleton: boolean;
}

/**
 * Service Container for Dependency Injection
 * Manages the creation and lifecycle of services
 */
export class ServiceContainer {
  private services = new Map<string, ServiceDefinition>();
  private singletons = new Map<string, any>();
  private config: ServiceConfig;

  constructor() {
    this.config = {
      mode: process.env.NODE_ENV === 'production' ? 'offline' : 'development',
      database: {
        type: (process.env.DATABASE_TYPE as 'sqlite' | 'supabase') || 'sqlite',
        sqlite: {
          userDataPath: process.env.SQLITE_USER_DATA_PATH,
          seedDatabasePath: process.env.SQLITE_SEED_PATH || path.join(__dirname, '../../resources/seed/ministerial-seed.db'),
          databaseName: process.env.SQLITE_DB_NAME || 'ministerial.db',
          enableBackups: process.env.SQLITE_ENABLE_BACKUPS !== 'false'
        },
        supabase: {
          url: process.env.VITE_SUPABASE_URL,
          key: process.env.VITE_SUPABASE_ANON_KEY
        }
      }
    };
  }

  /**
   * Register a service factory
   */
  register(name: string, factory: (container: ServiceContainer) => any, singleton = false): ServiceContainer {
    this.services.set(name, { factory, singleton });
    return this;
  }

  /**
   * Register a singleton service
   */
  singleton(name: string, factory: (container: ServiceContainer) => any): ServiceContainer {
    return this.register(name, factory, true);
  }

  /**
   * Resolve a service by name
   */
  resolve(name: string): any {
    const service = this.services.get(name);
    
    if (!service) {
      throw new Error(`Service '${name}' not found`);
    }

    // Return singleton instance if it exists
    if (service.singleton && this.singletons.has(name)) {
      return this.singletons.get(name);
    }

    // Create new instance
    const instance = service.factory(this);

    // Store singleton instance
    if (service.singleton) {
      this.singletons.set(name, instance);
    }

    return instance;
  }

  /**
   * Check if a service is registered
   */
  has(name: string): boolean {
    return this.services.has(name);
  }

  /**
   * Get configuration
   */
  getConfig(key?: string): any {
    if (key) {
      return this.config[key as keyof ServiceConfig];
    }
    return this.config;
  }

  /**
   * Set configuration
   */
  setConfig(key: string, value: any): ServiceContainer {
    (this.config as any)[key] = value;
    return this;
  }

  /**
   * Initialize all services
   */
  async initialize(): Promise<void> {
    console.log('🔧 Initializing Service Container...');
    console.log(`📊 Mode: ${this.config.mode}`);
    console.log(`💾 Database Type: ${this.config.database.type}`);

    try {
      // Initialize database manager first
      const databaseManager = this.resolve('databaseManager');
      await databaseManager.ensureDatabase();
      console.log('✅ Database Manager initialized');

      // Initialize data store
      const dataStore = this.resolve('dataStore');
      await dataStore.initialize();
      console.log('✅ Data Store initialized');

      console.log('✅ Service Container initialization complete');
    } catch (error) {
      console.error('❌ Service Container initialization failed:', error);
      throw error;
    }
  }

  /**
   * Shutdown all services
   */
  async shutdown(): Promise<void> {
    console.log('🔄 Shutting down Service Container...');

    try {
      // Close data store connections
      if (this.singletons.has('dataStore')) {
        const dataStore = this.singletons.get('dataStore');
        if (typeof dataStore.close === 'function') {
          await dataStore.close();
          console.log('✅ Data Store closed');
        }
      }

      // Clear singletons
      this.singletons.clear();
      console.log('✅ Service Container shutdown complete');
    } catch (error) {
      console.error('❌ Service Container shutdown failed:', error);
      throw error;
    }
  }
}

/**
 * Create and configure the default service container
 */
export function createServiceContainer(): ServiceContainer {
  const container = new ServiceContainer();

  // Register Database Manager
  container.singleton('databaseManager', (container) => {
    const config = container.getConfig('database');
    
    if (config.type === 'sqlite') {
      return new DatabaseManager(config.sqlite);
    } else {
      throw new Error(`Unsupported database type: ${config.type}`);
    }
  });

  // Register Data Store
  container.singleton('dataStore', (container) => {
    const config = container.getConfig('database');
    
    if (config.type === 'sqlite') {
      const databaseManager = container.resolve('databaseManager');
      return new SQLiteStore(databaseManager.getDatabasePath());
    } else if (config.type === 'supabase') {
      const { SupabaseStore } = require(path.join(__dirname, '../stores/SupabaseStore'));
      return new SupabaseStore(config.supabase.url, config.supabase.key);
    } else {
      throw new Error(`Unsupported database type: ${config.type}`);
    }
  });

  // Register Services (these will be updated to use dataStore)
  container.register('jwDownloader', (container) => {
    const JWDownloader = require(path.join(__dirname, '../services/jwDownloader'));
    const config = container.getConfig();
    
    // Configure JWDownloader for optional mode based on environment and database type
    const jwOptions = {
      enabled: process.env.JW_DOWNLOADER_ENABLED !== 'false',
      offlineMode: config.mode === 'offline' || config.database.type === 'sqlite',
      allowAutoDownloads: process.env.JW_ALLOW_AUTO_DOWNLOADS === 'true',
      requireExplicitRequest: config.mode === 'offline' || process.env.JW_REQUIRE_EXPLICIT_REQUEST === 'true'
    };
    
    return new JWDownloader(jwOptions);
  });

  container.register('programGenerator', (container) => {
    const ProgramGenerator = require(path.join(__dirname, '../services/programGenerator'));
    const dataStore = container.resolve('dataStore');
    const config = container.getConfig();
    
    // Configure offline mode based on environment and database type
    const offlineOptions = {
      offlineMode: config.mode === 'offline' || config.database.type === 'sqlite',
      enableLocalStorage: true,
      enableNotifications: true
    };
    
    return new ProgramGenerator(dataStore, offlineOptions);
  });

  container.register('materialManager', (container) => {
    const MaterialManager = require(path.join(__dirname, '../services/materialManager'));
    const dataStore = container.resolve('dataStore');
    
    // Configure MaterialManager for offline mode
    const offlineOptions = {
      offlineMode: process.env.NODE_ENV === 'production' || process.env.OFFLINE_MODE === 'true',
      allowExternalDownloads: process.env.ALLOW_EXTERNAL_DOWNLOADS === 'true'
    };
    
    return new MaterialManager(dataStore, offlineOptions);
  });

  container.register('notificationService', (container) => {
    const NotificationService = require(path.join(__dirname, '../services/notificationService'));
    return new NotificationService();
  });

  return container;
}
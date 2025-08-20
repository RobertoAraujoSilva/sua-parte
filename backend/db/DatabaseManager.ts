import * as fs from 'fs-extra';
import * as path from 'path';
import * as os from 'os';
import Database from 'better-sqlite3';
import { SQLiteStore } from '../stores/SQLiteStore';

export interface DatabaseConfig {
  userDataPath?: string;
  seedDatabasePath?: string;
  databaseName?: string;
  enableBackups?: boolean;
  maxBackups?: number;
}

export interface MigrationInfo {
  version: string;
  description: string;
  sql: string;
  applied: boolean;
  appliedAt?: string;
}

export interface DatabaseInfo {
  path: string;
  exists: boolean;
  size: number;
  version: string;
  tables: string[];
  isHealthy: boolean;
}

export class DatabaseManager {
  private config: Required<DatabaseConfig>;
  private dbPath: string;
  private seedPath: string;

  constructor(config: DatabaseConfig = {}) {
    this.config = {
      userDataPath: config.userDataPath || this.getDefaultUserDataPath(),
      seedDatabasePath: config.seedDatabasePath || path.join(__dirname, '../../resources/seed/ministerial-seed.db'),
      databaseName: config.databaseName || 'ministerial.db',
      enableBackups: config.enableBackups ?? true,
      maxBackups: config.maxBackups || 10
    };

    this.dbPath = path.join(this.config.userDataPath, this.config.databaseName);
    this.seedPath = this.config.seedDatabasePath;
  }

  /**
   * Ensure the database exists and is properly initialized
   */
  async ensureDatabase(): Promise<void> {
    try {
      console.log('🔍 Checking database status...');
      
      // Ensure user data directory exists
      await fs.ensureDir(this.config.userDataPath);
      console.log(`📁 User data directory: ${this.config.userDataPath}`);
      
      // Check if database already exists (first-run detection)
      const dbExists = await fs.pathExists(this.dbPath);
      
      if (!dbExists) {
        console.log('🆕 First run detected - no existing database found');
        console.log('📦 Initializing database from seed for first-time setup...');
        
        // This is the first run - copy seed database to user's local directory
        await this.createFromSeed();
        
        // Verify successful deployment
        const dbInfo = await this.getDatabaseInfo();
        console.log(`📊 First-run database deployment completed:`);
        console.log(`   - Tables created: ${dbInfo.tables.length}`);
        console.log(`   - Database size: ${dbInfo.size} bytes`);
        console.log(`   - Health status: ${dbInfo.isHealthy ? 'Healthy' : 'Needs attention'}`);
      } else {
        console.log('✅ Existing database found - skipping first-run seed deployment');
        console.log('🔍 Validating existing database schema...');
        const isValid = await this.validateSchema();
        
        if (!isValid) {
          console.log('⚠️ Schema validation failed, running migrations...');
          await this.runMigrations();
        } else {
          console.log('✅ Database schema is valid and up-to-date');
        }
      }
      
      console.log('✅ Database is ready for use');
    } catch (error) {
      console.error('❌ Failed to ensure database:', error);
      throw error;
    }
  }

  /**
   * Create database from seed file on first run
   * This method implements the core requirement to copy the "Exemplar" seed database
   * to the user's local data directory when the application starts for the first time.
   */
  async createFromSeed(): Promise<void> {
    try {
      console.log('🌱 Initializing database from seed on first run...');
      
      // Check if seed database exists
      const seedExists = await fs.pathExists(this.seedPath);
      
      if (seedExists) {
        console.log(`📋 Found seed database at: ${this.seedPath}`);
        console.log('🔍 Validating seed database integrity before deployment...');
        
        // Validate seed database before copying
        const isValidSeed = await this.validateSeedDatabase();
        if (!isValidSeed) {
          console.log('⚠️ Seed database validation failed, creating empty database instead...');
          await this.createEmptyDatabase();
        } else {
          console.log('✅ Seed database validation passed');
          console.log(`📋 Copying "Exemplar" seed database to user data directory...`);
          console.log(`   Source: ${this.seedPath}`);
          console.log(`   Target: ${this.dbPath}`);
          
          await fs.copy(this.seedPath, this.dbPath);
          console.log(`✅ Seed database deployed successfully at: ${this.dbPath}`);
          
          // Verify the copied database
          const isHealthy = await this.validateSchema();
          if (!isHealthy) {
            console.log('⚠️ Copied database failed validation, running repairs...');
          } else {
            console.log('✅ Deployed database passed health check');
          }
        }
      } else {
        console.log(`⚠️ Seed database not found at: ${this.seedPath}`);
        console.log('📦 Creating empty database with basic schema...');
        await this.createEmptyDatabase();
      }
      
      // Run any pending migrations
      console.log('🔄 Running post-deployment migrations...');
      await this.runMigrations();
      
      console.log('✅ First-run database initialization completed successfully');
      
    } catch (error) {
      console.error('❌ Failed to create database from seed:', error);
      throw error;
    }
  }

  /**
   * Create an empty database with basic schema
   */
  async createEmptyDatabase(): Promise<void> {
    const store = new SQLiteStore(this.dbPath);
    await store.initialize();
    await store.close();
    console.log('✅ Empty database created with basic schema');
  }

  /**
   * Validate database schema
   */
  async validateSchema(): Promise<boolean> {
    try {
      const db = new Database(this.dbPath, { readonly: true });
      
      // Check for required tables
      const requiredTables = [
        'profiles',
        'estudantes',
        'programas',
        'designacoes',
        'meetings',
        'administrative_assignments'
      ];
      
      const existingTables = db.prepare(`
        SELECT name FROM sqlite_master 
        WHERE type='table' AND name NOT LIKE 'sqlite_%'
      `).all() as { name: string }[];
      
      const existingTableNames = existingTables.map(t => t.name);
      
      db.close();
      
      // Check if all required tables exist
      const missingTables = requiredTables.filter(table => !existingTableNames.includes(table));
      
      if (missingTables.length > 0) {
        console.log(`⚠️ Missing tables: ${missingTables.join(', ')}`);
        return false;
      }
      
      return true;
    } catch (error) {
      console.error('❌ Schema validation failed:', error);
      return false;
    }
  }

  /**
   * Validate seed database before deployment
   */
  private async validateSeedDatabase(): Promise<boolean> {
    try {
      if (!await fs.pathExists(this.seedPath)) {
        return false;
      }

      const db = new Database(this.seedPath, { readonly: true });
      
      // Check for required tables
      const requiredTables = [
        'profiles',
        'estudantes',
        'programas',
        'designacoes',
        'meetings',
        'administrative_assignments'
      ];
      
      const existingTables = db.prepare(`
        SELECT name FROM sqlite_master 
        WHERE type='table' AND name NOT LIKE 'sqlite_%'
      `).all() as { name: string }[];
      
      const existingTableNames = existingTables.map(t => t.name);
      
      // Check if all required tables exist
      const missingTables = requiredTables.filter(table => !existingTableNames.includes(table));
      
      if (missingTables.length > 0) {
        console.log(`⚠️ Seed database missing tables: ${missingTables.join(', ')}`);
        db.close();
        return false;
      }

      // Basic data integrity checks
      try {
        // Check for at least one profile
        const profileCount = db.prepare('SELECT COUNT(*) as count FROM profiles').get() as { count: number };
        if (profileCount.count === 0) {
          console.log('⚠️ Seed database has no profiles');
          db.close();
          return false;
        }

        // Check for valid foreign key relationships (if there are assignments)
        const assignmentCount = db.prepare('SELECT COUNT(*) as count FROM designacoes').get() as { count: number };
        if (assignmentCount.count > 0) {
          const orphanedAssignments = db.prepare(`
            SELECT COUNT(*) as count 
            FROM designacoes d 
            LEFT JOIN programas p ON d.programa_id = p.id 
            WHERE p.id IS NULL
          `).get() as { count: number };

          if (orphanedAssignments.count > 0) {
            console.log(`⚠️ Seed database has ${orphanedAssignments.count} orphaned assignments`);
            db.close();
            return false;
          }
        }

        console.log('✅ Seed database validation passed');
        db.close();
        return true;
      } catch (dataError) {
        console.log('⚠️ Seed database data validation failed:', dataError);
        db.close();
        return false;
      }
    } catch (error) {
      console.error('❌ Seed database validation failed:', error);
      return false;
    }
  }

  /**
   * Run database migrations
   */
  async runMigrations(): Promise<void> {
    try {
      console.log('🔄 Running database migrations...');
      
      const db = new Database(this.dbPath);
      
      // Create migrations table if it doesn't exist
      db.exec(`
        CREATE TABLE IF NOT EXISTS migrations (
          version TEXT PRIMARY KEY,
          description TEXT NOT NULL,
          applied_at TEXT NOT NULL
        )
      `);
      
      // Get applied migrations
      const appliedMigrations = db.prepare('SELECT version FROM migrations').all() as { version: string }[];
      const appliedVersions = appliedMigrations.map(m => m.version);
      
      // Get available migrations
      const availableMigrations = await this.getAvailableMigrations();
      
      // Apply pending migrations
      let appliedCount = 0;
      for (const migration of availableMigrations) {
        if (!appliedVersions.includes(migration.version)) {
          console.log(`📝 Applying migration ${migration.version}: ${migration.description}`);
          
          try {
            // Execute migration in a transaction
            const transaction = db.transaction(() => {
              db.exec(migration.sql);
              db.prepare('INSERT INTO migrations (version, description, applied_at) VALUES (?, ?, ?)').run(
                migration.version,
                migration.description,
                new Date().toISOString()
              );
            });
            
            transaction();
            appliedCount++;
            console.log(`✅ Migration ${migration.version} applied successfully`);
          } catch (error) {
            console.error(`❌ Failed to apply migration ${migration.version}:`, error);
            throw error;
          }
        }
      }
      
      db.close();
      
      if (appliedCount > 0) {
        console.log(`✅ Applied ${appliedCount} migrations`);
      } else {
        console.log('✅ No pending migrations');
      }
      
    } catch (error) {
      console.error('❌ Migration failed:', error);
      throw error;
    }
  }

  /**
   * Get available migrations
   */
  private async getAvailableMigrations(): Promise<MigrationInfo[]> {
    // For now, return basic migrations
    // In a full implementation, these would be loaded from migration files
    return [
      {
        version: '001',
        description: 'Create basic schema',
        sql: `
          -- This migration ensures all tables exist with proper constraints
          CREATE TABLE IF NOT EXISTS profiles (
            id TEXT PRIMARY KEY,
            email TEXT UNIQUE NOT NULL,
            role TEXT NOT NULL CHECK (role IN ('admin', 'instrutor', 'estudante')),
            nome TEXT,
            congregacao_id TEXT,
            created_at TEXT NOT NULL,
            updated_at TEXT NOT NULL
          );

          CREATE TABLE IF NOT EXISTS estudantes (
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

          CREATE TABLE IF NOT EXISTS programas (
            id TEXT PRIMARY KEY,
            semana_inicio TEXT NOT NULL,
            semana_fim TEXT NOT NULL,
            material_estudo TEXT,
            congregacao_id TEXT NOT NULL,
            status TEXT NOT NULL DEFAULT 'rascunho' CHECK (status IN ('rascunho', 'ativo', 'arquivado')),
            created_at TEXT NOT NULL,
            updated_at TEXT NOT NULL
          );

          CREATE TABLE IF NOT EXISTS designacoes (
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

          CREATE TABLE IF NOT EXISTS meetings (
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

          CREATE TABLE IF NOT EXISTS administrative_assignments (
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
        `,
        applied: false
      },
      {
        version: '002',
        description: 'Create indexes for performance',
        sql: `
          CREATE INDEX IF NOT EXISTS idx_estudantes_congregacao ON estudantes(congregacao_id);
          CREATE INDEX IF NOT EXISTS idx_estudantes_cargo ON estudantes(cargo);
          CREATE INDEX IF NOT EXISTS idx_estudantes_ativo ON estudantes(ativo);
          CREATE INDEX IF NOT EXISTS idx_programas_congregacao ON programas(congregacao_id);
          CREATE INDEX IF NOT EXISTS idx_programas_semana ON programas(semana_inicio);
          CREATE INDEX IF NOT EXISTS idx_designacoes_programa ON designacoes(programa_id);
          CREATE INDEX IF NOT EXISTS idx_designacoes_estudante ON designacoes(estudante_id);
          CREATE INDEX IF NOT EXISTS idx_meetings_congregacao ON meetings(congregacao_id);
          CREATE INDEX IF NOT EXISTS idx_meetings_date ON meetings(meeting_date);
          CREATE INDEX IF NOT EXISTS idx_admin_assignments_estudante ON administrative_assignments(id_estudante);
          CREATE INDEX IF NOT EXISTS idx_admin_assignments_congregacao ON administrative_assignments(congregacao_id);
        `,
        applied: false
      }
    ];
  }

  /**
   * Create a backup of the database
   */
  async createBackup(): Promise<string> {
    if (!this.config.enableBackups) {
      throw new Error('Backups are disabled');
    }

    try {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const backupDir = path.join(this.config.userDataPath, 'backups');
      const backupPath = path.join(backupDir, `ministerial-backup-${timestamp}.db`);
      
      await fs.ensureDir(backupDir);
      await fs.copy(this.dbPath, backupPath);
      
      // Clean up old backups
      await this.cleanupOldBackups(backupDir);
      
      console.log(`✅ Backup created: ${backupPath}`);
      return backupPath;
    } catch (error) {
      console.error('❌ Backup failed:', error);
      throw error;
    }
  }

  /**
   * Restore database from backup
   */
  async restoreFromBackup(backupPath: string): Promise<void> {
    try {
      if (!await fs.pathExists(backupPath)) {
        throw new Error(`Backup file not found: ${backupPath}`);
      }

      // Create a backup of current database before restore
      const currentBackup = await this.createBackup();
      console.log(`📦 Current database backed up to: ${currentBackup}`);

      // Restore from backup
      await fs.copy(backupPath, this.dbPath);
      
      // Validate restored database
      const isValid = await this.validateSchema();
      if (!isValid) {
        throw new Error('Restored database failed schema validation');
      }

      console.log(`✅ Database restored from: ${backupPath}`);
    } catch (error) {
      console.error('❌ Restore failed:', error);
      throw error;
    }
  }

  /**
   * Get database information
   */
  async getDatabaseInfo(): Promise<DatabaseInfo> {
    try {
      const exists = await fs.pathExists(this.dbPath);
      
      if (!exists) {
        return {
          path: this.dbPath,
          exists: false,
          size: 0,
          version: '0',
          tables: [],
          isHealthy: false
        };
      }

      const stats = await fs.stat(this.dbPath);
      const db = new Database(this.dbPath, { readonly: true });
      
      // Get tables
      const tables = db.prepare(`
        SELECT name FROM sqlite_master 
        WHERE type='table' AND name NOT LIKE 'sqlite_%'
      `).all() as { name: string }[];
      
      // Get version from migrations
      let version = '0';
      try {
        const migrations = db.prepare('SELECT version FROM migrations ORDER BY version DESC LIMIT 1').all() as { version: string }[];
        if (migrations.length > 0) {
          version = migrations[0].version;
        }
      } catch {
        // Migrations table doesn't exist
      }
      
      db.close();
      
      const isHealthy = await this.validateSchema();

      return {
        path: this.dbPath,
        exists: true,
        size: stats.size,
        version,
        tables: tables.map(t => t.name),
        isHealthy
      };
    } catch (error) {
      console.error('❌ Failed to get database info:', error);
      return {
        path: this.dbPath,
        exists: false,
        size: 0,
        version: '0',
        tables: [],
        isHealthy: false
      };
    }
  }

  /**
   * Clean up old backup files
   */
  private async cleanupOldBackups(backupDir: string): Promise<void> {
    try {
      const files = await fs.readdir(backupDir);
      const backupFiles = files
        .filter(file => file.startsWith('ministerial-backup-') && file.endsWith('.db'))
        .map(file => ({
          name: file,
          path: path.join(backupDir, file),
          stat: fs.statSync(path.join(backupDir, file))
        }))
        .sort((a, b) => b.stat.mtime.getTime() - a.stat.mtime.getTime());

      // Keep only the most recent backups
      const filesToDelete = backupFiles.slice(this.config.maxBackups);
      
      for (const file of filesToDelete) {
        await fs.remove(file.path);
        console.log(`🗑️ Removed old backup: ${file.name}`);
      }
    } catch (error) {
      console.error('⚠️ Failed to cleanup old backups:', error);
      // Don't throw - this is not critical
    }
  }

  /**
   * Get default user data path based on operating system
   */
  private getDefaultUserDataPath(): string {
    const platform = os.platform();
    const homeDir = os.homedir();
    
    switch (platform) {
      case 'win32':
        return path.join(homeDir, 'AppData', 'Roaming', 'MinisterialSystem');
      case 'darwin':
        return path.join(homeDir, 'Library', 'Application Support', 'MinisterialSystem');
      case 'linux':
        return path.join(homeDir, '.config', 'MinisterialSystem');
      default:
        return path.join(homeDir, '.ministerial-system');
    }
  }

  /**
   * Get database path
   */
  getDatabasePath(): string {
    return this.dbPath;
  }

  /**
   * Get user data path
   */
  getUserDataPath(): string {
    return this.config.userDataPath;
  }
}
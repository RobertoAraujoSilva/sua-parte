# Design Document

## Overview

The Desktop Offline System transforms the current web-based Ministerial System into a standalone desktop application using Electron, with complete offline functionality powered by SQLite. The system maintains all existing features while ensuring complete data privacy and offline operation.

## Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Electron Main Process                    │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────────┐    ┌─────────────────────────────────┐ │
│  │   App Lifecycle │    │      Backend Server Manager     │ │
│  │   - Window Mgmt │    │      - Express Server (3001)   │ │
│  │   - Auto-updater│    │      - SQLite Integration      │ │
│  │   - Menu System │    │      - Service Initialization  │ │
│  └─────────────────┘    └─────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────┐
│                 Electron Renderer Process                   │
├─────────────────────────────────────────────────────────────┤
│                    React Frontend                           │
│              (Existing UI Components)                       │
│                                                             │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐ │
│  │   Admin     │  │ Instructor  │  │     Student         │ │
│  │ Dashboard   │  │ Dashboard   │  │    Portal           │ │
│  └─────────────┘  └─────────────┘  └─────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────┐
│                   Data Access Layer                         │
├─────────────────────────────────────────────────────────────┤
│                    IDataStore Interface                     │
│                                                             │
│  ┌─────────────────┐              ┌─────────────────────┐   │
│  │  SQLiteStore    │              │   SupabaseStore     │   │
│  │  (Desktop)      │              │   (Web Legacy)      │   │
│  │                 │              │                     │   │
│  │ - Local SQLite  │              │ - Remote Supabase   │   │
│  │ - Offline Mode  │              │ - Online Mode       │   │
│  │ - Privacy First │              │ - Development Only  │   │
│  └─────────────────┘              └─────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────┐
│                    Local Storage                            │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────────┐              ┌─────────────────────┐   │
│  │ SQLite Database │              │   Materials Store   │   │
│  │                 │              │                     │   │
│  │ - ministerial.db│              │ - docs/Oficial/     │   │
│  │ - User data     │              │ - PDF files         │   │
│  │ - Programs      │              │ - JWPUB files       │   │
│  │ - Assignments   │              │ - Audio files       │   │
│  └─────────────────┘              └─────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

### Data Flow

1. **Application Startup**: Electron main process starts Express server with SQLite
2. **Database Initialization**: Check for existing database, create from seed if needed
3. **Frontend Loading**: React app loads in Electron renderer, connects to local backend
4. **User Interactions**: All CRUD operations go through IDataStore → SQLiteStore → SQLite
5. **Material Management**: Optional JW.org downloads stored locally, served by Express

## Components and Interfaces

### 1. Electron Main Process (`electron/main.ts`)

```typescript
interface ElectronMainConfig {
  window: {
    width: number;
    height: number;
    minWidth: number;
    minHeight: number;
    webPreferences: {
      nodeIntegration: boolean;
      contextIsolation: boolean;
      enableRemoteModule: boolean;
    };
  };
  server: {
    port: number;
    startupDelay: number;
  };
}

class MainProcess {
  private server: ChildProcess | null;
  private mainWindow: BrowserWindow | null;
  
  async initialize(): Promise<void>;
  async startBackendServer(): Promise<void>;
  async createWindow(): Promise<void>;
  async handleAppEvents(): Promise<void>;
}
```

### 2. Data Access Layer

```typescript
interface IDataStore {
  // Student Management
  getEstudantes(congregacaoId?: string): Promise<Estudante[]>;
  createEstudante(estudante: CreateEstudanteRequest): Promise<Estudante>;
  updateEstudante(id: string, updates: UpdateEstudanteRequest): Promise<Estudante>;
  deleteEstudante(id: string): Promise<void>;
  
  // Program Management
  getProgramas(filters?: ProgramFilters): Promise<Programa[]>;
  createPrograma(programa: CreateProgramaRequest): Promise<Programa>;
  updatePrograma(id: string, updates: UpdateProgramaRequest): Promise<Programa>;
  
  // Assignment Management
  getDesignacoes(filters?: DesignacaoFilters): Promise<Designacao[]>;
  createDesignacao(designacao: CreateDesignacaoRequest): Promise<Designacao>;
  getHistoricoDesignacoes(estudanteId: string, weeks?: number): Promise<HistoricoDesignacao[]>;
  
  // User Management
  getProfile(userId: string): Promise<Profile>;
  updateProfile(userId: string, updates: ProfileUpdates): Promise<Profile>;
  
  // System Operations
  initialize(): Promise<void>;
  healthCheck(): Promise<HealthStatus>;
  backup(): Promise<BackupResult>;
  restore(backupPath: string): Promise<RestoreResult>;
}

class SQLiteStore implements IDataStore {
  private db: Database;
  private dbPath: string;
  
  constructor(dbPath: string);
  async initialize(): Promise<void>;
  // ... implement all IDataStore methods
}

class SupabaseStore implements IDataStore {
  private client: SupabaseClient;
  
  constructor(url: string, key: string);
  // ... implement all IDataStore methods for web compatibility
}
```

### 3. Database Management

```typescript
interface DatabaseManager {
  ensureDatabase(): Promise<void>;
  createFromSeed(): Promise<void>;
  runMigrations(): Promise<void>;
  validateSchema(): Promise<boolean>;
}

class SQLiteDatabaseManager implements DatabaseManager {
  private seedPath: string;
  private userDataPath: string;
  private dbPath: string;
  
  async ensureDatabase(): Promise<void> {
    // Check if database exists in user data directory
    // If not, copy from seed and run any pending migrations
  }
  
  async createFromSeed(): Promise<void> {
    // Copy ministerial-seed.db to user data directory
    // Apply any version-specific migrations
  }
}
```

### 4. Application Configuration

```typescript
interface AppConfig {
  database: {
    path: string;
    seedPath: string;
    backupPath: string;
  };
  server: {
    port: number;
    host: string;
  };
  materials: {
    storagePath: string;
    downloadEnabled: boolean;
  };
  privacy: {
    telemetryEnabled: boolean;
    crashReportingEnabled: boolean;
  };
}
```

## Data Models

### SQLite Schema

The SQLite database will mirror the current Supabase schema:

```sql
-- Core Tables
CREATE TABLE profiles (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('admin', 'instrutor', 'estudante')),
  nome TEXT,
  congregacao_id TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE estudantes (
  id TEXT PRIMARY KEY,
  nome TEXT NOT NULL,
  sobrenome TEXT,
  data_nascimento DATE,
  telefone TEXT,
  email TEXT,
  cargo TEXT,
  privilegios TEXT,
  congregacao_id TEXT NOT NULL,
  ativo BOOLEAN DEFAULT TRUE,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE programas (
  id TEXT PRIMARY KEY,
  semana_inicio DATE NOT NULL,
  semana_fim DATE NOT NULL,
  material_estudo TEXT,
  congregacao_id TEXT NOT NULL,
  status TEXT DEFAULT 'rascunho',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE designacoes (
  id TEXT PRIMARY KEY,
  programa_id TEXT NOT NULL,
  estudante_id TEXT NOT NULL,
  parte TEXT NOT NULL,
  tema TEXT,
  tempo_minutos INTEGER,
  observacoes TEXT,
  status TEXT DEFAULT 'agendada',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (programa_id) REFERENCES programas(id),
  FOREIGN KEY (estudante_id) REFERENCES estudantes(id)
);

-- Indexes for performance
CREATE INDEX idx_estudantes_congregacao ON estudantes(congregacao_id);
CREATE INDEX idx_programas_congregacao ON programas(congregacao_id);
CREATE INDEX idx_designacoes_programa ON designacoes(programa_id);
CREATE INDEX idx_designacoes_estudante ON designacoes(estudante_id);
```

### Seed Data Structure

The "Exemplar" seed database will contain:

```typescript
interface SeedData {
  congregacao: {
    id: string;
    nome: string;
    cidade: string;
  };
  profiles: Profile[];
  estudantes: Estudante[];
  programas: Programa[];
  designacoes: Designacao[];
  materiais: MaterialInfo[];
}
```

## Error Handling

### Database Error Handling

```typescript
class DatabaseError extends Error {
  constructor(
    message: string,
    public code: string,
    public operation: string,
    public originalError?: Error
  ) {
    super(message);
    this.name = 'DatabaseError';
  }
}

class ErrorHandler {
  static handleDatabaseError(error: Error, operation: string): DatabaseError {
    // Convert SQLite errors to user-friendly messages
    // Log technical details for debugging
    // Return sanitized error for UI display
  }
  
  static handleFileSystemError(error: Error, path: string): FileSystemError {
    // Handle file access, permission, and disk space errors
  }
}
```

### Graceful Degradation

- **Database Corruption**: Automatic backup restoration
- **Disk Space**: Warning system with cleanup suggestions
- **Permission Issues**: Clear instructions for user resolution
- **Migration Failures**: Rollback mechanism with data preservation

## Testing Strategy

### Unit Testing

```typescript
describe('SQLiteStore', () => {
  let store: SQLiteStore;
  let testDb: string;
  
  beforeEach(async () => {
    testDb = await createTestDatabase();
    store = new SQLiteStore(testDb);
    await store.initialize();
  });
  
  afterEach(async () => {
    await cleanupTestDatabase(testDb);
  });
  
  describe('getEstudantes', () => {
    it('should return all students for a congregation', async () => {
      // Test implementation
    });
    
    it('should handle empty results gracefully', async () => {
      // Test implementation
    });
  });
});
```

### Integration Testing

```typescript
describe('Desktop Application Integration', () => {
  let app: Application;
  
  beforeEach(async () => {
    app = await startElectronApp();
  });
  
  afterEach(async () => {
    await app.stop();
  });
  
  it('should start with seed database', async () => {
    // Verify database creation and seed data loading
  });
  
  it('should handle offline operations', async () => {
    // Test all CRUD operations without network
  });
});
```

### End-to-End Testing

- **Installation Testing**: Verify installer creates proper directory structure
- **First Run Experience**: Test seed database creation and initial setup
- **Offline Functionality**: Comprehensive testing without network access
- **Data Import/Export**: Test backup and restore functionality
- **Cross-Platform**: Test on Windows, macOS, and Linux

### Performance Testing

- **Database Performance**: Test with large datasets (1000+ students, 500+ programs)
- **Startup Time**: Measure application launch time with various database sizes
- **Memory Usage**: Monitor memory consumption during extended use
- **File I/O**: Test material import/export with large files

## Security Considerations

### Data Privacy

- **Local Storage Only**: All data remains on user's machine
- **No Telemetry**: Zero data collection or transmission
- **Encrypted Backups**: Optional encryption for export packages
- **Secure Deletion**: Proper cleanup when uninstalling

### Application Security

- **Code Signing**: Sign installers for Windows and macOS
- **Sandboxing**: Use Electron security best practices
- **Update Security**: Secure update mechanism with signature verification
- **Input Validation**: Sanitize all user inputs before database operations

## Deployment and Distribution

### Build Configuration

```javascript
// electron-builder.yml
{
  "appId": "com.ministerial.system",
  "productName": "Sistema Ministerial",
  "directories": {
    "output": "dist-electron"
  },
  "files": [
    "dist/**/*",
    "backend/**/*",
    "resources/**/*",
    "!backend/node_modules"
  ],
  "extraResources": [
    {
      "from": "resources/seed",
      "to": "seed"
    },
    {
      "from": "docs/Oficial",
      "to": "materials"
    }
  ],
  "win": {
    "target": "nsis",
    "icon": "resources/icon.ico"
  },
  "mac": {
    "target": "dmg",
    "icon": "resources/icon.icns"
  },
  "linux": {
    "target": [
      "AppImage",
      "deb"
    ],
    "icon": "resources/icon.png"
  }
}
```

### Installation Paths

- **Windows**: `%AppData%/MinisterialSystem/`
- **macOS**: `~/Library/Application Support/MinisterialSystem/`
- **Linux**: `~/.config/MinisterialSystem/`

### Auto-Update System

```typescript
interface UpdateManager {
  checkForUpdates(): Promise<UpdateInfo | null>;
  downloadUpdate(): Promise<void>;
  installUpdate(): Promise<void>;
  scheduleUpdate(): Promise<void>;
}
```

## Migration Strategy

### Phase 1: Parallel Development

1. Implement SQLiteStore alongside existing SupabaseStore
2. Create Electron wrapper around existing web application
3. Test desktop functionality with current features

### Phase 2: Database Migration

1. Create conversion utilities from Supabase to SQLite
2. Implement seed database generation from existing data
3. Test data integrity and performance

### Phase 3: Feature Parity

1. Ensure all web features work in desktop mode
2. Implement offline-specific features (import/export)
3. Comprehensive testing across all platforms

### Phase 4: Production Release

1. Code signing and installer creation
2. Documentation and user guides
3. Distribution through GitHub Releases

## Performance Optimization

### Database Optimization

- **Indexing Strategy**: Optimize queries for common operations
- **Connection Pooling**: Efficient database connection management
- **Query Optimization**: Use prepared statements and batch operations
- **Vacuum Operations**: Regular database maintenance

### Application Optimization

- **Lazy Loading**: Load components and data on demand
- **Memory Management**: Proper cleanup of resources
- **Caching Strategy**: Cache frequently accessed data
- **Bundle Optimization**: Minimize application size

## Monitoring and Logging

### Local Logging System

```typescript
interface Logger {
  info(message: string, context?: object): void;
  warn(message: string, context?: object): void;
  error(message: string, error?: Error, context?: object): void;
  debug(message: string, context?: object): void;
}

class FileLogger implements Logger {
  private logPath: string;
  private maxFileSize: number;
  private maxFiles: number;
  
  // Implement log rotation and cleanup
}
```

### Health Monitoring

- **Database Health**: Regular integrity checks
- **File System Health**: Monitor disk space and permissions
- **Application Health**: Memory usage and performance metrics
- **User Activity**: Anonymous usage patterns for optimization
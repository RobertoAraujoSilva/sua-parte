import { app, BrowserWindow, Menu, shell } from 'electron';
import { spawn, ChildProcess } from 'child_process';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { DatabaseManager } from '../backend/db/DatabaseManager';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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
  private server: ChildProcess | null = null;
  private mainWindow: BrowserWindow | null = null;
  private config: ElectronMainConfig;
  private databaseManager: DatabaseManager;

  constructor() {
    this.config = {
      window: {
        width: 1200,
        height: 800,
        minWidth: 800,
        minHeight: 600,
        webPreferences: {
          nodeIntegration: false,
          contextIsolation: true,
          enableRemoteModule: false,
        },
      },
      server: {
        port: 3001,
        startupDelay: 2000,
      },
    };

    // Initialize database manager with seed path
    const isDev = process.env.NODE_ENV === 'development';
    const seedPath = isDev
      ? path.join(__dirname, '..', 'resources', 'seed', 'ministerial-seed.db')
      : path.join(process.resourcesPath, 'seed', 'ministerial-seed.db');

    this.databaseManager = new DatabaseManager({
      seedDatabasePath: seedPath,
      enableBackups: true,
      maxBackups: 5
    });
  }

  async initialize(): Promise<void> {
    // Handle app events
    await this.handleAppEvents();

    // Initialize database first (this will deploy seed if needed)
    await this.initializeDatabase();

    // Start backend server
    await this.startBackendServer();

    // Create main window after server startup delay
    setTimeout(async () => {
      await this.createWindow();
    }, this.config.server.startupDelay);
  }

  async initializeDatabase(): Promise<void> {
    try {
      console.log('🔧 Initializing database system...');
      await this.databaseManager.ensureDatabase();

      const dbInfo = await this.databaseManager.getDatabaseInfo();
      console.log(`✅ Database ready: ${dbInfo.tables.length} tables, ${Math.round(dbInfo.size / 1024)}KB`);
    } catch (error) {
      console.error('❌ Database initialization failed:', error);
      throw error;
    }
  }

  async startBackendServer(): Promise<void> {
    return new Promise((resolve, reject) => {
      const isDev = process.env.NODE_ENV === 'development';
      const backendPath = isDev
        ? path.join(__dirname, '..', 'backend')
        : path.join(process.resourcesPath, 'backend');

      console.log('Starting backend server from:', backendPath);

      // Start the backend server
      this.server = spawn('node', ['server.js'], {
        cwd: backendPath,
        stdio: 'pipe',
        env: {
          ...process.env,
          PORT: this.config.server.port.toString(),
          NODE_ENV: isDev ? 'development' : 'production',
        },
      });

      this.server.stdout?.on('data', (data) => {
        console.log(`Backend: ${data}`);
      });

      this.server.stderr?.on('data', (data) => {
        console.error(`Backend Error: ${data}`);
      });

      this.server.on('error', (error) => {
        console.error('Failed to start backend server:', error);
        reject(error);
      });

      this.server.on('spawn', () => {
        console.log('Backend server started successfully');
        resolve();
      });
    });
  }

  async createWindow(): Promise<void> {
    // Create the browser window
    this.mainWindow = new BrowserWindow({
      width: this.config.window.width,
      height: this.config.window.height,
      minWidth: this.config.window.minWidth,
      minHeight: this.config.window.minHeight,
      webPreferences: this.config.window.webPreferences,
      icon: this.getAppIcon(),
      show: false, // Don't show until ready
      titleBarStyle: process.platform === 'darwin' ? 'hiddenInset' : 'default',
    });

    // Load the app
    const isDev = process.env.NODE_ENV === 'development';
    const startUrl = isDev
      ? 'http://localhost:5173' // Vite dev server
      : `http://localhost:${this.config.server.port}`; // Local backend serving built files

    await this.mainWindow.loadURL(startUrl);

    // Show window when ready
    this.mainWindow.once('ready-to-show', () => {
      this.mainWindow?.show();

      // Open DevTools in development
      if (isDev) {
        this.mainWindow?.webContents.openDevTools();
      }
    });

    // Handle window closed
    this.mainWindow.on('closed', () => {
      this.mainWindow = null;
    });

    // Handle external links
    this.mainWindow.webContents.setWindowOpenHandler(({ url }) => {
      shell.openExternal(url);
      return { action: 'deny' };
    });

    // Set up application menu
    this.createApplicationMenu();
  }

  async handleAppEvents(): Promise<void> {
    // This method will be called when Electron has finished initialization
    app.whenReady().then(() => {
      // On macOS, re-create window when dock icon is clicked
      app.on('activate', async () => {
        if (BrowserWindow.getAllWindows().length === 0) {
          await this.createWindow();
        }
      });
    });

    // Quit when all windows are closed, except on macOS
    app.on('window-all-closed', () => {
      if (process.platform !== 'darwin') {
        this.cleanup();
        app.quit();
      }
    });

    // Handle app quit
    app.on('before-quit', () => {
      this.cleanup();
    });

    // Security: Prevent new window creation (handled by setWindowOpenHandler in createWindow)
  }

  private cleanup(): void {
    // Terminate backend server
    if (this.server) {
      console.log('Shutting down backend server...');
      this.server.kill('SIGTERM');
      this.server = null;
    }
  }

  private getAppIcon(): string | undefined {
    const iconPath = path.join(__dirname, '..', 'resources');

    switch (process.platform) {
      case 'win32':
        return path.join(iconPath, 'icon.ico');
      case 'darwin':
        return path.join(iconPath, 'icon.icns');
      case 'linux':
        return path.join(iconPath, 'icon.png');
      default:
        return undefined;
    }
  }

  private createApplicationMenu(): void {
    const template: Electron.MenuItemConstructorOptions[] = [
      {
        label: 'File',
        submenu: [
          {
            label: 'Import Data',
            accelerator: 'CmdOrCtrl+I',
            click: () => {
              // TODO: Implement data import functionality
              console.log('Import data clicked');
            },
          },
          {
            label: 'Export Data',
            accelerator: 'CmdOrCtrl+E',
            click: () => {
              // TODO: Implement data export functionality
              console.log('Export data clicked');
            },
          },
          { type: 'separator' },
          {
            label: 'Quit',
            accelerator: process.platform === 'darwin' ? 'Cmd+Q' : 'Ctrl+Q',
            click: () => {
              app.quit();
            },
          },
        ],
      },
      {
        label: 'Edit',
        submenu: [
          { role: 'undo' },
          { role: 'redo' },
          { type: 'separator' },
          { role: 'cut' },
          { role: 'copy' },
          { role: 'paste' },
        ],
      },
      {
        label: 'View',
        submenu: [
          { role: 'reload' },
          { role: 'forceReload' },
          { role: 'toggleDevTools' },
          { type: 'separator' },
          { role: 'resetZoom' },
          { role: 'zoomIn' },
          { role: 'zoomOut' },
          { type: 'separator' },
          { role: 'togglefullscreen' },
        ],
      },
      {
        label: 'Window',
        submenu: [
          { role: 'minimize' },
          { role: 'close' },
        ],
      },
      {
        label: 'Help',
        submenu: [
          {
            label: 'About Sistema Ministerial',
            click: () => {
              // TODO: Show about dialog
              console.log('About clicked');
            },
          },
        ],
      },
    ];

    // macOS specific menu adjustments
    if (process.platform === 'darwin') {
      template.unshift({
        label: app.getName(),
        submenu: [
          { role: 'about' },
          { type: 'separator' },
          { role: 'services' },
          { type: 'separator' },
          { role: 'hide' },
          { role: 'hideOthers' },
          { role: 'unhide' },
          { type: 'separator' },
          { role: 'quit' },
        ],
      });

      // Window menu
      (template[4].submenu as Electron.MenuItemConstructorOptions[]).push(
        { type: 'separator' },
        { role: 'front' }
      );
    }

    const menu = Menu.buildFromTemplate(template);
    Menu.setApplicationMenu(menu);
  }
}

// Initialize the main process
const mainProcess = new MainProcess();

// Start the application
app.whenReady().then(async () => {
  try {
    await mainProcess.initialize();
  } catch (error) {
    console.error('Failed to initialize application:', error);
    app.quit();
  }
});
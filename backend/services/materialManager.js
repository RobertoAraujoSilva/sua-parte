const fs = require('fs-extra');
const path = require('path');

class MaterialManager {
  constructor(dataStore = null, options = {}) {
    this.materialsPath = options.materialsPath || path.join(__dirname, '../../docs/Oficial');
    this.programsPath = options.programsPath || path.join(__dirname, '../../docs/Programas');
    this.backupPath = options.backupPath || path.join(__dirname, '../../docs/Backup');
    this.dataStore = dataStore;
    this.offlineMode = options.offlineMode !== undefined ? options.offlineMode : !dataStore;
    this.allowExternalDownloads = options.allowExternalDownloads || false;
    
    // Initialize local material cache
    this.materialCache = new Map();
    this.initialized = false;
  }

  async initialize() {
    try {
      await fs.ensureDir(this.materialsPath);
      await fs.ensureDir(this.programsPath);
      await fs.ensureDir(this.backupPath);
      
      // Initialize material cache
      await this.refreshMaterialCache();
      
      this.initialized = true;
      console.log(`✅ MaterialManager inicializado (modo: ${this.offlineMode ? 'offline' : 'online'})`);
    } catch (error) {
      console.error('❌ Erro ao inicializar MaterialManager:', error);
      throw error;
    }
  }

  // Refresh local material cache
  async refreshMaterialCache() {
    try {
      this.materialCache.clear();
      
      if (await fs.pathExists(this.materialsPath)) {
        const files = await fs.readdir(this.materialsPath, { withFileTypes: true });
        
        for (const file of files) {
          if (file.isFile()) {
            const filePath = path.join(this.materialsPath, file.name);
            const stats = await fs.stat(filePath);
            
            this.materialCache.set(file.name, {
              name: file.name,
              path: filePath,
              size: stats.size,
              modifiedAt: stats.mtime,
              type: this.getMaterialType(file.name)
            });
          }
        }
      }
      
      console.log(`📚 Cache de materiais atualizado: ${this.materialCache.size} arquivos`);
    } catch (error) {
      console.error('❌ Erro ao atualizar cache de materiais:', error);
    }
  }

  // Get material type based on file extension
  getMaterialType(filename) {
    const ext = path.extname(filename).toLowerCase();
    const typeMap = {
      '.pdf': 'PDF',
      '.jwpub': 'JWPUB',
      '.epub': 'EPUB',
      '.mp3': 'Audio',
      '.mp4': 'Video',
      '.json': 'Data',
      '.txt': 'Text',
      '.rtf': 'RTF'
    };
    return typeMap[ext] || 'Unknown';
  }

  // Obter informações de armazenamento
  async getStorageInfo() {
    try {
      const materialsSize = await this.getDirectorySize(this.materialsPath);
      const programsSize = await this.getDirectorySize(this.programsPath);
      const backupSize = await this.getDirectorySize(this.backupPath);
      const totalSize = materialsSize + programsSize + backupSize;

      return {
        materials: {
          path: this.materialsPath,
          size: materialsSize,
          sizeFormatted: this.formatBytes(materialsSize)
        },
        programs: {
          path: this.programsPath,
          size: programsSize,
          sizeFormatted: this.formatBytes(programsSize)
        },
        backup: {
          path: this.backupPath,
          size: backupSize,
          sizeFormatted: this.formatBytes(backupSize)
        },
        total: {
          size: totalSize,
          sizeFormatted: this.formatBytes(totalSize)
        }
      };
    } catch (error) {
      console.error('❌ Erro ao obter informações de armazenamento:', error);
      return {};
    }
  }

  // Obter tamanho de diretório
  async getDirectorySize(dirPath) {
    try {
      if (!(await fs.pathExists(dirPath))) {
        return 0;
      }

      let totalSize = 0;
      const files = await fs.readdir(dirPath);

      for (const file of files) {
        const filePath = path.join(dirPath, file);
        const stats = await fs.stat(filePath);
        
        if (stats.isFile()) {
          totalSize += stats.size;
        } else if (stats.isDirectory()) {
          totalSize += await this.getDirectorySize(filePath);
        }
      }

      return totalSize;
    } catch (error) {
      console.error('❌ Erro ao calcular tamanho do diretório:', error);
      return 0;
    }
  }

  // Obter informações da última sincronização
  async getLastSyncInfo() {
    try {
      if (this.offlineMode || !this.dataStore) {
        // In offline mode, get info from local files
        const syncInfoPath = path.join(this.backupPath, 'last_sync.json');
        
        if (await fs.pathExists(syncInfoPath)) {
          const syncInfo = await fs.readJson(syncInfoPath);
          return {
            ...syncInfo,
            lastSync: new Date().toISOString()
          };
        }
        
        return {
          lastProgramCreated: null,
          lastProgramUpdated: null,
          lastSync: new Date().toISOString(),
          mode: 'offline'
        };
      }

      // Use dataStore for online mode
      const programs = await this.dataStore.getProgramas({});
      const sortedPrograms = programs.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
      const lastProgram = sortedPrograms[0];

      const syncInfo = {
        lastProgramCreated: lastProgram?.created_at || null,
        lastProgramUpdated: lastProgram?.updated_at || null,
        lastSync: new Date().toISOString(),
        mode: 'online'
      };

      // Save sync info for offline reference
      const syncInfoPath = path.join(this.backupPath, 'last_sync.json');
      await fs.ensureDir(this.backupPath);
      await fs.writeJson(syncInfoPath, syncInfo, { spaces: 2 });

      return syncInfo;
    } catch (error) {
      console.error('❌ Erro ao obter informações de sincronização:', error);
      return {
        lastProgramCreated: null,
        lastProgramUpdated: null,
        lastSync: new Date().toISOString(),
        mode: this.offlineMode ? 'offline' : 'online',
        error: error.message
      };
    }
  }

  // Verificar saúde do sistema
  async checkSystemHealth() {
    try {
      const health = {
        timestamp: new Date().toISOString(),
        status: 'healthy',
        mode: this.offlineMode ? 'offline' : 'online',
        checks: {}
      };

      // Verificar conectividade com banco (apenas se não estiver em modo offline)
      if (!this.offlineMode && this.dataStore) {
        try {
          const dataStoreHealth = await this.dataStore.healthCheck();
          health.checks.database = {
            status: dataStoreHealth.status === 'healthy' ? 'healthy' : 'error',
            message: dataStoreHealth.status === 'healthy' ? 'Conexão estabelecida' : 'Problemas na conexão',
            details: dataStoreHealth
          };
        } catch (error) {
          health.checks.database = {
            status: 'error',
            message: error.message
          };
        }
      } else {
        health.checks.database = {
          status: 'offline',
          message: 'Modo offline - banco local'
        };
      }

      // Verificar acesso aos diretórios
      try {
        await fs.access(this.materialsPath);
        health.checks.materialsDirectory = {
          status: 'healthy',
          message: 'Acesso permitido',
          path: this.materialsPath
        };
      } catch (error) {
        health.checks.materialsDirectory = {
          status: 'error',
          message: 'Sem acesso ao diretório',
          path: this.materialsPath,
          error: error.message
        };
      }

      try {
        await fs.access(this.programsPath);
        health.checks.programsDirectory = {
          status: 'healthy',
          message: 'Acesso permitido',
          path: this.programsPath
        };
      } catch (error) {
        health.checks.programsDirectory = {
          status: 'error',
          message: 'Sem acesso ao diretório',
          path: this.programsPath,
          error: error.message
        };
      }

      try {
        await fs.access(this.backupPath);
        health.checks.backupDirectory = {
          status: 'healthy',
          message: 'Acesso permitido',
          path: this.backupPath
        };
      } catch (error) {
        health.checks.backupDirectory = {
          status: 'error',
          message: 'Sem acesso ao diretório',
          path: this.backupPath,
          error: error.message
        };
      }

      // Verificar espaço em disco
      try {
        const stats = await fs.stat(this.materialsPath);
        health.checks.diskSpace = {
          status: 'healthy',
          message: 'Espaço disponível'
        };
      } catch (error) {
        health.checks.diskSpace = {
          status: 'warning',
          message: 'Não foi possível verificar espaço em disco'
        };
      }

      // Verificar cache de materiais
      try {
        const materialsCount = this.materialCache.size;
        health.checks.materialCache = {
          status: 'healthy',
          message: `Cache inicializado com ${materialsCount} materiais`,
          count: materialsCount,
          initialized: this.initialized
        };
      } catch (error) {
        health.checks.materialCache = {
          status: 'warning',
          message: 'Cache de materiais não inicializado'
        };
      }

      // Verificar configurações de modo offline
      health.checks.offlineMode = {
        status: 'healthy',
        message: `Modo ${this.offlineMode ? 'offline' : 'online'} ativo`,
        offlineMode: this.offlineMode,
        allowExternalDownloads: this.allowExternalDownloads
      };

      // Verificar se há erros
      const hasErrors = Object.values(health.checks).some(check => check.status === 'error');
      const hasWarnings = Object.values(health.checks).some(check => check.status === 'warning');
      
      if (hasErrors) {
        health.status = 'degraded';
      } else if (hasWarnings) {
        health.status = 'warning';
      }

      return health;
    } catch (error) {
      console.error('❌ Erro no health check:', error);
      return {
        timestamp: new Date().toISOString(),
        status: 'error',
        mode: this.offlineMode ? 'offline' : 'online',
        error: error.message
      };
    }
  }

  // Fazer backup dos materiais
  async backupMaterials() {
    try {
      console.log('💾 Iniciando backup dos materiais...');
      
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const backupDir = path.join(this.backupPath, `backup_${timestamp}`);
      
      await fs.ensureDir(backupDir);
      
      // Copiar materiais
      const materialsBackup = path.join(backupDir, 'materials');
      await fs.copy(this.materialsPath, materialsBackup);
      
      // Copiar programas
      const programsBackup = path.join(backupDir, 'programs');
      await fs.copy(this.programsPath, programsBackup);
      
      // Criar arquivo de metadados do backup
      const localMaterials = await this.getLocalMaterials();
      const metadata = {
        timestamp: new Date().toISOString(),
        source: {
          materials: this.materialsPath,
          programs: this.programsPath
        },
        backup: backupDir,
        size: await this.getDirectorySize(backupDir),
        materialCount: localMaterials.length,
        offlineMode: this.offlineMode,
        version: '1.0'
      };
      
      await fs.writeJson(path.join(backupDir, 'backup_metadata.json'), metadata, { spaces: 2 });
      
      console.log(`✅ Backup concluído: ${backupDir}`);
      return metadata;
      
    } catch (error) {
      console.error('❌ Erro no backup:', error);
      throw error;
    }
  }

  // Restaurar backup
  async restoreBackup(backupPath) {
    try {
      console.log(`🔄 Restaurando backup: ${backupPath}`);
      
      if (!(await fs.pathExists(backupPath))) {
        throw new Error('Caminho do backup não encontrado');
      }
      
      // Verificar se é um backup válido
      const metadataPath = path.join(backupPath, 'backup_metadata.json');
      if (!(await fs.pathExists(metadataPath))) {
        throw new Error('Backup inválido - metadados não encontrados');
      }
      
      const metadata = await fs.readJson(metadataPath);
      
      // Fazer backup do estado atual antes da restauração
      await this.backupMaterials();
      
      // Restaurar materiais
      const materialsBackup = path.join(backupPath, 'materials');
      if (await fs.pathExists(materialsBackup)) {
        await fs.emptyDir(this.materialsPath);
        await fs.copy(materialsBackup, this.materialsPath);
      }
      
      // Restaurar programas
      const programsBackup = path.join(backupPath, 'programs');
      if (await fs.pathExists(programsBackup)) {
        await fs.emptyDir(this.programsPath);
        await fs.copy(programsBackup, this.programsPath);
      }
      
      // Refresh material cache after restore
      await this.refreshMaterialCache();
      
      console.log('✅ Restauração concluída com sucesso');
      return metadata;
      
    } catch (error) {
      console.error('❌ Erro na restauração:', error);
      throw error;
    }
  }

  // Listar backups disponíveis
  async listBackups() {
    try {
      const backups = [];
      
      if (await fs.pathExists(this.backupPath)) {
        const backupDirs = await fs.readdir(this.backupPath);
        
        for (const dir of backupDirs) {
          const backupPath = path.join(this.backupPath, dir);
          const stats = await fs.stat(backupPath);
          
          if (stats.isDirectory()) {
            const metadataPath = path.join(backupPath, 'backup_metadata.json');
            
            if (await fs.pathExists(metadataPath)) {
              try {
                const metadata = await fs.readJson(metadataPath);
                backups.push({
                  name: dir,
                  path: backupPath,
                  timestamp: metadata.timestamp,
                  size: metadata.size,
                  sizeFormatted: this.formatBytes(metadata.size)
                });
              } catch (error) {
                console.error(`❌ Erro ao ler metadados do backup ${dir}:`, error);
              }
            }
          }
        }
      }
      
      return backups.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
      
    } catch (error) {
      console.error('❌ Erro ao listar backups:', error);
      return [];
    }
  }

  // Limpar backups antigos
  async cleanupOldBackups(daysToKeep = 30) {
    try {
      console.log(`🗑️ Limpando backups antigos (mais de ${daysToKeep} dias)...`);
      
      const backups = await this.listBackups();
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);
      
      const toDelete = backups.filter(backup => new Date(backup.timestamp) < cutoffDate);
      
      for (const backup of toDelete) {
        await fs.remove(backup.path);
        console.log(`🗑️ Backup removido: ${backup.name}`);
      }
      
      console.log(`✅ Limpeza concluída: ${toDelete.length} backups removidos`);
      return {
        deleted: toDelete.length,
        remaining: backups.length - toDelete.length
      };
      
    } catch (error) {
      console.error('❌ Erro na limpeza de backups:', error);
      throw error;
    }
  }

  // Formatar bytes para legibilidade
  formatBytes(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  // Obter estatísticas de uso
  async getUsageStats() {
    try {
      const storageInfo = await this.getStorageInfo();
      const lastSync = await this.getLastSyncInfo();
      const backups = await this.listBackups();
      const localMaterials = await this.getLocalMaterials();
      
      return {
        storage: storageInfo,
        lastSync,
        backups: {
          total: backups.length,
          totalSize: backups.reduce((sum, b) => sum + b.size, 0),
          totalSizeFormatted: this.formatBytes(backups.reduce((sum, b) => sum + b.size, 0))
        },
        materials: {
          total: localMaterials.length,
          totalSize: localMaterials.reduce((sum, m) => sum + m.size, 0),
          totalSizeFormatted: this.formatBytes(localMaterials.reduce((sum, m) => sum + m.size, 0)),
          types: this.getMaterialTypeStats(localMaterials)
        },
        mode: this.offlineMode ? 'offline' : 'online',
        allowExternalDownloads: this.allowExternalDownloads,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('❌ Erro ao obter estatísticas de uso:', error);
      return {
        mode: this.offlineMode ? 'offline' : 'online',
        allowExternalDownloads: this.allowExternalDownloads,
        error: error.message
      };
    }
  }

  // Get material type statistics
  getMaterialTypeStats(materials) {
    const stats = {};
    materials.forEach(material => {
      const type = material.type;
      if (!stats[type]) {
        stats[type] = { count: 0, size: 0 };
      }
      stats[type].count++;
      stats[type].size += material.size;
    });
    
    // Format sizes
    Object.keys(stats).forEach(type => {
      stats[type].sizeFormatted = this.formatBytes(stats[type].size);
    });
    
    return stats;
  }

  // Verificar se está em modo offline
  isOfflineMode() {
    return this.offlineMode;
  }

  // Definir modo offline/online
  setOfflineMode(offline = true) {
    this.offlineMode = offline;
    console.log(`📡 MaterialManager modo: ${offline ? 'offline' : 'online'}`);
  }

  // Definir dataStore (para injeção de dependência)
  setDataStore(dataStore) {
    this.dataStore = dataStore;
    // Only change offline mode if it wasn't explicitly set in constructor options
    if (this.offlineMode === !this.dataStore) { // If offline mode matches the previous dataStore state
      this.offlineMode = !dataStore;
    }
    console.log(`🔗 MaterialManager dataStore configurado: ${dataStore ? 'sim' : 'não'}`);
  }

  // Get local materials list
  async getLocalMaterials() {
    try {
      if (!this.initialized) {
        await this.refreshMaterialCache();
      }
      
      return Array.from(this.materialCache.values()).map(material => ({
        ...material,
        sizeFormatted: this.formatBytes(material.size),
        isLocal: true,
        source: 'local'
      }));
    } catch (error) {
      console.error('❌ Erro ao obter materiais locais:', error);
      return [];
    }
  }

  // Add material to local storage
  async addLocalMaterial(filePath, targetName = null) {
    try {
      if (!await fs.pathExists(filePath)) {
        throw new Error('Arquivo não encontrado');
      }

      const fileName = targetName || path.basename(filePath);
      const targetPath = path.join(this.materialsPath, fileName);
      
      // Check if file already exists
      if (await fs.pathExists(targetPath)) {
        const stats = await fs.stat(targetPath);
        const sourceStats = await fs.stat(filePath);
        
        // Skip if identical file already exists
        if (stats.size === sourceStats.size && stats.mtime >= sourceStats.mtime) {
          console.log(`📄 Material já existe: ${fileName}`);
          return this.materialCache.get(fileName);
        }
      }

      // Copy file to materials directory
      await fs.copy(filePath, targetPath);
      
      // Update cache
      const stats = await fs.stat(targetPath);
      const materialInfo = {
        name: fileName,
        path: targetPath,
        size: stats.size,
        modifiedAt: stats.mtime,
        type: this.getMaterialType(fileName),
        addedAt: new Date().toISOString()
      };
      
      this.materialCache.set(fileName, materialInfo);
      
      console.log(`✅ Material adicionado: ${fileName} (${this.formatBytes(stats.size)})`);
      return materialInfo;
      
    } catch (error) {
      console.error('❌ Erro ao adicionar material:', error);
      throw error;
    }
  }

  // Remove local material
  async removeLocalMaterial(fileName) {
    try {
      const materialPath = path.join(this.materialsPath, fileName);
      
      if (await fs.pathExists(materialPath)) {
        await fs.remove(materialPath);
        this.materialCache.delete(fileName);
        console.log(`🗑️ Material removido: ${fileName}`);
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('❌ Erro ao remover material:', error);
      throw error;
    }
  }

  // Get material file path (for serving files)
  getMaterialPath(fileName) {
    const material = this.materialCache.get(fileName);
    if (material && fs.pathExistsSync(material.path)) {
      return material.path;
    }
    
    // Fallback to direct path construction
    const fallbackPath = path.join(this.materialsPath, fileName);
    if (fs.pathExistsSync(fallbackPath)) {
      return fallbackPath;
    }
    
    return null;
  }

  // Search local materials
  async searchLocalMaterials(query) {
    try {
      const materials = await this.getLocalMaterials();
      
      if (!query || query.trim() === '') {
        return materials;
      }
      
      const searchTerm = query.toLowerCase();
      return materials.filter(material => 
        material.name.toLowerCase().includes(searchTerm) ||
        material.type.toLowerCase().includes(searchTerm)
      );
    } catch (error) {
      console.error('❌ Erro na busca de materiais:', error);
      return [];
    }
  }

  // Enable/disable external downloads
  setAllowExternalDownloads(allow) {
    this.allowExternalDownloads = allow;
    console.log(`🌐 Downloads externos: ${allow ? 'habilitados' : 'desabilitados'}`);
  }

  // Check if external downloads are allowed
  canDownloadExternally() {
    return this.allowExternalDownloads && !this.offlineMode;
  }

  // Verificar integridade dos materiais locais
  async verifyMaterialsIntegrity() {
    try {
      const integrity = {
        timestamp: new Date().toISOString(),
        status: 'healthy',
        checks: {}
      };

      // Verificar estrutura de diretórios
      const requiredDirs = [this.materialsPath, this.programsPath, this.backupPath];
      for (const dir of requiredDirs) {
        try {
          await fs.ensureDir(dir);
          const stats = await fs.stat(dir);
          integrity.checks[path.basename(dir)] = {
            status: 'healthy',
            message: 'Diretório acessível',
            path: dir,
            isDirectory: stats.isDirectory()
          };
        } catch (error) {
          integrity.checks[path.basename(dir)] = {
            status: 'error',
            message: 'Erro ao acessar diretório',
            path: dir,
            error: error.message
          };
        }
      }

      // Verificar arquivos de materiais
      if (await fs.pathExists(this.materialsPath)) {
        const files = await fs.readdir(this.materialsPath);
        integrity.checks.materialsFiles = {
          status: 'healthy',
          message: `${files.length} arquivos encontrados`,
          count: files.length,
          files: files.slice(0, 10) // Primeiros 10 arquivos
        };
      }

      // Verificar se há erros
      const hasErrors = Object.values(integrity.checks).some(check => check.status === 'error');
      if (hasErrors) {
        integrity.status = 'degraded';
      }

      return integrity;
    } catch (error) {
      console.error('❌ Erro na verificação de integridade:', error);
      return {
        timestamp: new Date().toISOString(),
        status: 'error',
        error: error.message
      };
    }
  }

  // Limpar cache e arquivos temporários
  async cleanupTempFiles() {
    try {
      const tempDirs = [
        path.join(this.materialsPath, 'temp'),
        path.join(this.programsPath, 'temp'),
        path.join(this.backupPath, 'temp')
      ];

      let cleanedFiles = 0;
      let cleanedSize = 0;

      for (const tempDir of tempDirs) {
        if (await fs.pathExists(tempDir)) {
          const size = await this.getDirectorySize(tempDir);
          const files = await fs.readdir(tempDir);
          
          await fs.remove(tempDir);
          
          cleanedFiles += files.length;
          cleanedSize += size;
        }
      }

      console.log(`🧹 Limpeza concluída: ${cleanedFiles} arquivos, ${this.formatBytes(cleanedSize)}`);
      
      return {
        success: true,
        cleanedFiles,
        cleanedSize,
        cleanedSizeFormatted: this.formatBytes(cleanedSize),
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('❌ Erro na limpeza de arquivos temporários:', error);
      return {
        success: false,
        error: error.message,
        timestamp: new Date().toISOString()
      };
    }
  }
}

module.exports = MaterialManager;

const fs = require('fs-extra');
const path = require('path');
const { supabase } = require('../config/database');

class MaterialManager {
  constructor() {
    this.materialsPath = path.join(__dirname, '../../docs/Oficial');
    this.programsPath = path.join(__dirname, '../../docs/Programas');
    this.backupPath = path.join(__dirname, '../../docs/Backup');
  }

  async initialize() {
    try {
      await fs.ensureDir(this.materialsPath);
      await fs.ensureDir(this.programsPath);
      await fs.ensureDir(this.backupPath);
      console.log('✅ MaterialManager inicializado');
    } catch (error) {
      console.error('❌ Erro ao inicializar MaterialManager:', error);
      throw error;
    }
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
      // Buscar último programa criado
      const { data: lastProgram, error } = await supabase
        .from('programas')
        .select('criado_em, atualizado_em')
        .order('criado_em', { ascending: false })
        .limit(1);

      if (error) {
        throw error;
      }

      return {
        lastProgramCreated: lastProgram?.[0]?.criado_em || null,
        lastProgramUpdated: lastProgram?.[0]?.atualizado_em || null,
        lastSync: new Date().toISOString()
      };
    } catch (error) {
      console.error('❌ Erro ao obter informações de sincronização:', error);
      return {
        lastProgramCreated: null,
        lastProgramUpdated: null,
        lastSync: new Date().toISOString()
      };
    }
  }

  // Verificar saúde do sistema
  async checkSystemHealth() {
    try {
      const health = {
        timestamp: new Date().toISOString(),
        status: 'healthy',
        checks: {}
      };

      // Verificar conectividade com banco
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('count')
          .limit(1);

        health.checks.database = {
          status: error ? 'error' : 'healthy',
          message: error ? error.message : 'Conexão estabelecida'
        };
      } catch (error) {
        health.checks.database = {
          status: 'error',
          message: error.message
        };
      }

      // Verificar acesso aos diretórios
      try {
        const materialsAccess = await fs.access(this.materialsPath);
        health.checks.materialsDirectory = {
          status: 'healthy',
          message: 'Acesso permitido'
        };
      } catch (error) {
        health.checks.materialsDirectory = {
          status: 'error',
          message: 'Sem acesso ao diretório'
        };
      }

      try {
        const programsAccess = await fs.access(this.programsPath);
        health.checks.programsDirectory = {
          status: 'healthy',
          message: 'Acesso permitido'
        };
      } catch (error) {
        health.checks.programsDirectory = {
          status: 'error',
          message: 'Sem acesso ao diretório'
        };
      }

      // Verificar se há erros
      const hasErrors = Object.values(health.checks).some(check => check.status === 'error');
      if (hasErrors) {
        health.status = 'degraded';
      }

      return health;
    } catch (error) {
      console.error('❌ Erro no health check:', error);
      return {
        timestamp: new Date().toISOString(),
        status: 'error',
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
      const metadata = {
        timestamp: new Date().toISOString(),
        source: {
          materials: this.materialsPath,
          programs: this.programsPath
        },
        backup: backupDir,
        size: await this.getDirectorySize(backupDir)
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
      
      return {
        storage: storageInfo,
        lastSync,
        backups: {
          total: backups.length,
          totalSize: backups.reduce((sum, b) => sum + b.size, 0),
          totalSizeFormatted: this.formatBytes(backups.reduce((sum, b) => sum + b.size, 0))
        },
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('❌ Erro ao obter estatísticas de uso:', error);
      return {};
    }
  }
}

module.exports = MaterialManager;

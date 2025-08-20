const fetch = require('node-fetch');
const fs = require('fs-extra');
const path = require('path');
const cheerio = require('cheerio');
const mwbSources = require('../config/mwbSources.json');

class JWDownloader {
  constructor(options = {}) {
    this.downloadPath = path.join(__dirname, '../../docs/Oficial');
    this.downloadQueue = [];
    this.isDownloading = false;
    
    // Optional mode configuration
    this.options = {
      enabled: options.enabled !== false, // Default to enabled for backward compatibility
      offlineMode: options.offlineMode || false,
      allowAutoDownloads: options.allowAutoDownloads !== false,
      requireExplicitRequest: options.requireExplicitRequest || false,
      ...options
    };
    
    console.log(`🔧 JWDownloader initialized with options:`, {
      enabled: this.options.enabled,
      offlineMode: this.options.offlineMode,
      allowAutoDownloads: this.options.allowAutoDownloads,
      requireExplicitRequest: this.options.requireExplicitRequest
    });
  }

  async initialize() {
    try {
      await fs.ensureDir(this.downloadPath);
      
      if (this.options.offlineMode) {
        console.log('✅ JWDownloader inicializado em modo offline - downloads externos desabilitados');
      } else if (this.options.requireExplicitRequest) {
        console.log('✅ JWDownloader inicializado em modo opcional - downloads apenas quando solicitados');
      } else {
        console.log('✅ JWDownloader inicializado em modo padrão');
      }
    } catch (error) {
      console.error('❌ Erro ao inicializar JWDownloader:', error);
      throw error;
    }
  }

  // Check if downloads are allowed
  canDownload() {
    if (!this.options.enabled) {
      return { allowed: false, reason: 'JWDownloader está desabilitado' };
    }
    
    if (this.options.offlineMode) {
      return { allowed: false, reason: 'Sistema está em modo offline' };
    }
    
    return { allowed: true, reason: 'Downloads permitidos' };
  }

  // Check if automatic downloads are allowed
  canAutoDownload() {
    const downloadCheck = this.canDownload();
    if (!downloadCheck.allowed) {
      return downloadCheck;
    }
    
    if (this.options.requireExplicitRequest) {
      return { allowed: false, reason: 'Downloads automáticos desabilitados - apenas downloads explícitos' };
    }
    
    if (!this.options.allowAutoDownloads) {
      return { allowed: false, reason: 'Downloads automáticos desabilitados na configuração' };
    }
    
    return { allowed: true, reason: 'Downloads automáticos permitidos' };
  }

  // Verificar se há novas versões disponíveis
  async checkForNewVersions(language = 'pt-BR', explicitRequest = false) {
    const downloadCheck = this.canDownload();
    if (!downloadCheck.allowed && !explicitRequest) {
      throw new Error(`Download não permitido: ${downloadCheck.reason}`);
    }

    try {
      const source = mwbSources[language];
      if (!source || !source.active) {
        throw new Error(`Idioma ${language} não está ativo`);
      }

      if (explicitRequest) {
        console.log(`🔍 Verificando novas versões para ${language} (solicitação explícita)...`);
      } else {
        console.log(`🔍 Verificando novas versões para ${language}...`);
      }
      
      const response = await fetch(source.url);
      const html = await response.text();
      const $ = cheerio.load(html);

      const materials = [];
      
      // Buscar links de materiais (PDF, DAISY, JWPUB)
      $('a').each((_, element) => {
        const href = $(element).attr('href');
        const text = $(element).text().trim();
        
        if (href && this.isMaterialLink(href)) {
          const materialInfo = this.parseMaterialInfo(href, text, language);
          if (materialInfo) {
            materials.push(materialInfo);
          }
        }
      });

      console.log(`✅ Encontrados ${materials.length} materiais para ${language}`);
      return materials;

    } catch (error) {
      console.error(`❌ Erro ao verificar versões para ${language}:`, error);
      throw error;
    }
  }

  // Verificar se o link é de um material válido
  isMaterialLink(href) {
    const validExtensions = ['.pdf', '.daisy.zip', '.jwpub', '.rtf'];
    return validExtensions.some(ext => href.toLowerCase().includes(ext));
  }

  // Parsear informações do material
  parseMaterialInfo(href, text, language) {
    try {
      const filename = href.split('/').pop();
      const extension = path.extname(filename);
      
      // Extrair informações do nome do arquivo
      let materialType = 'unknown';
      let period = '';
      let version = '';

      if (filename.includes('mwb_')) {
        materialType = 'meeting_workbook';
        const match = filename.match(/mwb_([A-Z])_(\d{6})/);
        if (match) {
          version = match[1];
          period = match[2];
        }
      } else if (filename.includes('S-38')) {
        materialType = 's38_guidelines';
      }

      return {
        url: href.startsWith('http') ? href : `https://www.jw.org${href}`,
        filename,
        text,
        language,
        materialType,
        period,
        version,
        extension,
        size: 0,
        lastChecked: new Date().toISOString()
      };
    } catch (error) {
      console.error('❌ Erro ao parsear material:', error);
      return null;
    }
  }

  // Baixar material específico
  async downloadMaterial(materialInfo, explicitRequest = false) {
    const downloadCheck = this.canDownload();
    if (!downloadCheck.allowed && !explicitRequest) {
      throw new Error(`Download não permitido: ${downloadCheck.reason}`);
    }

    try {
      if (explicitRequest) {
        console.log(`📥 Baixando (solicitação explícita): ${materialInfo.filename}`);
      } else {
        console.log(`📥 Baixando: ${materialInfo.filename}`);
      }
      
      const response = await fetch(materialInfo.url);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const filePath = path.join(this.downloadPath, materialInfo.filename);
      
      // Verificar se o arquivo já existe
      if (await fs.pathExists(filePath)) {
        const stats = await fs.stat(filePath);
        if (stats.size > 0) {
          console.log(`⚠️ Arquivo já existe: ${materialInfo.filename}`);
          return {
            ...materialInfo,
            status: 'already_exists',
            localPath: filePath,
            size: stats.size
          };
        }
      }

      // Baixar arquivo
      const fileStream = fs.createWriteStream(filePath);
      await new Promise((resolve, reject) => {
        response.body.pipe(fileStream);
        response.body.on('error', reject);
        fileStream.on('finish', resolve);
      });

      // Verificar tamanho do arquivo baixado
      const stats = await fs.stat(filePath);
      materialInfo.size = stats.size;
      materialInfo.localPath = filePath;
      materialInfo.status = 'downloaded';
      materialInfo.downloadedAt = new Date().toISOString();

      console.log(`✅ Download concluído: ${materialInfo.filename} (${this.formatBytes(stats.size)})`);
      return materialInfo;

    } catch (error) {
      console.error(`❌ Erro ao baixar ${materialInfo.filename}:`, error);
      materialInfo.status = 'error';
      materialInfo.error = error.message;
      return materialInfo;
    }
  }

  // Verificar e baixar todos os materiais
  async checkAndDownloadAll(explicitRequest = false) {
    const downloadCheck = explicitRequest ? this.canDownload() : this.canAutoDownload();
    if (!downloadCheck.allowed) {
      throw new Error(`Download não permitido: ${downloadCheck.reason}`);
    }

    try {
      if (explicitRequest) {
        console.log('🔄 Verificando e baixando todos os materiais (solicitação explícita)...');
      } else {
        console.log('🔄 Verificando e baixando todos os materiais...');
      }
      
      const results = {
        checked: [],
        downloaded: [],
        errors: [],
        newMaterials: []
      };

      // Verificar cada idioma ativo
      for (const [language, source] of Object.entries(mwbSources)) {
        if (!source.active) continue;

        try {
          const materials = await this.checkForNewVersions(language, explicitRequest);
          
          for (const material of materials) {
            results.checked.push(material);
            
            // Verificar se já existe localmente
            const localPath = path.join(this.downloadPath, material.filename);
            if (!(await fs.pathExists(localPath))) {
              // Baixar material
              const downloadResult = await this.downloadMaterial(material, explicitRequest);
              
              if (downloadResult.status === 'downloaded') {
                results.downloaded.push(downloadResult);
                results.newMaterials.push(downloadResult);
              } else if (downloadResult.status === 'error') {
                results.errors.push(downloadResult);
              }
            }
          }
        } catch (error) {
          console.error(`❌ Erro ao processar idioma ${language}:`, error);
          results.errors.push({
            language,
            error: error.message
          });
        }
      }

      console.log(`✅ Verificação concluída: ${results.downloaded.length} novos materiais`);
      return results;

    } catch (error) {
      console.error('❌ Erro na verificação geral:', error);
      throw error;
    }
  }

  // Baixar material específico por URL
  async downloadByUrl(url, language = 'pt-BR', explicitRequest = true) {
    const downloadCheck = this.canDownload();
    if (!downloadCheck.allowed && !explicitRequest) {
      throw new Error(`Download não permitido: ${downloadCheck.reason}`);
    }

    try {
      const materialInfo = {
        url,
        filename: url.split('/').pop(),
        language,
        materialType: 'manual',
        lastChecked: new Date().toISOString()
      };

      return await this.downloadMaterial(materialInfo, explicitRequest);
    } catch (error) {
      console.error('❌ Erro ao baixar por URL:', error);
      throw error;
    }
  }

  // Listar materiais baixados
  async listDownloadedMaterials() {
    try {
      const files = await fs.readdir(this.downloadPath);
      const materials = [];

      for (const file of files) {
        const filePath = path.join(this.downloadPath, file);
        const stats = await fs.stat(filePath);
        
        materials.push({
          filename: file,
          size: stats.size,
          sizeFormatted: this.formatBytes(stats.size),
          modifiedAt: stats.mtime,
          path: filePath
        });
      }

      return materials.sort((a, b) => b.modifiedAt - a.modifiedAt);
    } catch (error) {
      console.error('❌ Erro ao listar materiais:', error);
      throw error;
    }
  }

  // Get service status and configuration
  getStatus() {
    const downloadCheck = this.canDownload();
    const autoDownloadCheck = this.canAutoDownload();
    
    return {
      enabled: this.options.enabled,
      offlineMode: this.options.offlineMode,
      allowAutoDownloads: this.options.allowAutoDownloads,
      requireExplicitRequest: this.options.requireExplicitRequest,
      canDownload: downloadCheck.allowed,
      canAutoDownload: autoDownloadCheck.allowed,
      downloadReason: downloadCheck.reason,
      autoDownloadReason: autoDownloadCheck.reason,
      downloadPath: this.downloadPath,
      isDownloading: this.isDownloading,
      queueLength: this.downloadQueue.length
    };
  }

  // Formatar bytes para legibilidade
  formatBytes(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  // Limpar materiais antigos
  async cleanupOldMaterials(daysToKeep = 90) {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

      const materials = await this.listDownloadedMaterials();
      const toDelete = materials.filter(m => m.modifiedAt < cutoffDate);

      for (const material of toDelete) {
        await fs.remove(material.path);
        console.log(`🗑️ Removido material antigo: ${material.filename}`);
      }

      return {
        deleted: toDelete.length,
        remaining: materials.length - toDelete.length
      };
    } catch (error) {
      console.error('❌ Erro na limpeza:', error);
      throw error;
    }
  }
}

module.exports = JWDownloader;

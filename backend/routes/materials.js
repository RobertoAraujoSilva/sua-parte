const express = require('express');
const router = express.Router();
const path = require('path');

// Services will be injected via container
let jwDownloader;
let materialManager;

// Initialize services from container
const initializeServices = (container) => {
  jwDownloader = container.resolve('jwDownloader');
  materialManager = container.resolve('materialManager');
};

// Middleware de autenticação (simplificado para desenvolvimento)
const requireAuth = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ error: 'Token de autenticação necessário' });
  }
  next();
};

// =====================================================
// ROTAS DE MATERIAIS
// =====================================================

// Listar todos os materiais (local e baixados)
router.get('/', requireAuth, async (req, res) => {
  try {
    let materials = [];
    
    // Get local materials from MaterialManager
    const localMaterials = await materialManager.getLocalMaterials();
    materials = materials.concat(localMaterials);
    
    // If external downloads are allowed, also get downloaded materials
    if (materialManager.canDownloadExternally()) {
      try {
        const downloadedMaterials = await jwDownloader.listDownloadedMaterials();
        materials = materials.concat(downloadedMaterials.map(m => ({
          ...m,
          source: 'downloaded',
          isLocal: false
        })));
      } catch (error) {
        console.warn('⚠️ Erro ao listar materiais baixados:', error.message);
      }
    }
    
    res.json({
      success: true,
      materials,
      total: materials.length,
      mode: materialManager.isOfflineMode() ? 'offline' : 'online',
      allowExternalDownloads: materialManager.canDownloadExternally()
    });
  } catch (error) {
    console.error('❌ Erro ao listar materiais:', error);
    res.status(500).json({ 
      error: 'Erro ao listar materiais',
      details: error.message 
    });
  }
});

// Search local materials
router.get('/search', requireAuth, async (req, res) => {
  try {
    const { q: query } = req.query;
    const materials = await materialManager.searchLocalMaterials(query);
    
    res.json({
      success: true,
      materials,
      total: materials.length,
      query
    });
  } catch (error) {
    console.error('❌ Erro na busca de materiais:', error);
    res.status(500).json({ 
      error: 'Erro na busca de materiais',
      details: error.message 
    });
  }
});

// Add local material
router.post('/local', requireAuth, async (req, res) => {
  try {
    const { filePath, targetName } = req.body;
    
    if (!filePath) {
      return res.status(400).json({
        error: 'Caminho do arquivo é obrigatório'
      });
    }
    
    const material = await materialManager.addLocalMaterial(filePath, targetName);
    
    res.json({
      success: true,
      message: 'Material adicionado com sucesso',
      material
    });
  } catch (error) {
    console.error('❌ Erro ao adicionar material:', error);
    res.status(500).json({ 
      error: 'Erro ao adicionar material',
      details: error.message 
    });
  }
});

// Remove local material
router.delete('/local/:filename', requireAuth, async (req, res) => {
  try {
    const { filename } = req.params;
    const removed = await materialManager.removeLocalMaterial(filename);
    
    if (removed) {
      res.json({
        success: true,
        message: 'Material removido com sucesso'
      });
    } else {
      res.status(404).json({
        error: 'Material não encontrado'
      });
    }
  } catch (error) {
    console.error('❌ Erro ao remover material:', error);
    res.status(500).json({ 
      error: 'Erro ao remover material',
      details: error.message 
    });
  }
});

// Serve local material file
router.get('/file/:filename', requireAuth, async (req, res) => {
  try {
    const { filename } = req.params;
    const materialPath = materialManager.getMaterialPath(filename);
    
    if (!materialPath) {
      return res.status(404).json({
        error: 'Material não encontrado'
      });
    }
    
    // Set appropriate headers
    res.setHeader('Content-Disposition', `inline; filename="${filename}"`);
    res.sendFile(materialPath);
    
  } catch (error) {
    console.error('❌ Erro ao servir material:', error);
    res.status(500).json({ 
      error: 'Erro ao servir material',
      details: error.message 
    });
  }
});

// Obter informações de um material específico
router.get('/:filename', requireAuth, async (req, res) => {
  try {
    const { filename } = req.params;
    
    // First check local materials
    const localMaterials = await materialManager.getLocalMaterials();
    let material = localMaterials.find(m => m.name === filename);
    
    if (!material && materialManager.canDownloadExternally()) {
      // If not found locally and external downloads are allowed, check downloaded materials
      const downloadedMaterials = await jwDownloader.listDownloadedMaterials();
      material = downloadedMaterials.find(m => m.filename === filename);
    }
    
    if (!material) {
      return res.status(404).json({ error: 'Material não encontrado' });
    }
    
    res.json({
      success: true,
      material
    });
  } catch (error) {
    console.error('❌ Erro ao obter material:', error);
    res.status(500).json({ 
      error: 'Erro ao obter material',
      details: error.message 
    });
  }
});

// Baixar material por URL
router.post('/download', requireAuth, async (req, res) => {
  try {
    const { url, language } = req.body;
    
    if (!url) {
      return res.status(400).json({ error: 'URL é obrigatória' });
    }

    // Check if downloads are allowed
    const status = jwDownloader.getStatus();
    if (!status.canDownload) {
      return res.status(403).json({
        success: false,
        error: `Downloads não permitidos: ${status.downloadReason}`,
        status: status
      });
    }

    console.log(`📥 Baixando material: ${url}`);
    const result = await jwDownloader.downloadByUrl(url, language || 'pt-BR', true); // true = explicit request
    
    res.json({
      success: true,
      message: 'Material baixado com sucesso',
      material: result
    });
  } catch (error) {
    console.error('❌ Erro ao baixar material:', error);
    res.status(500).json({ 
      error: 'Erro ao baixar material',
      details: error.message 
    });
  }
});

// Verificar atualizações disponíveis
router.post('/check-updates', requireAuth, async (req, res) => {
  try {
    const { language } = req.body;
    
    // Check if downloads are allowed
    const status = jwDownloader.getStatus();
    if (!status.canDownload) {
      return res.status(403).json({
        success: false,
        error: `Downloads não permitidos: ${status.downloadReason}`,
        status: status
      });
    }

    console.log(`🔍 Verificando atualizações para ${language || 'todos os idiomas'}...`);
    const results = await jwDownloader.checkForNewVersions(language, true); // true = explicit request
    
    res.json({
      success: true,
      message: 'Verificação concluída',
      results
    });
  } catch (error) {
    console.error('❌ Erro ao verificar atualizações:', error);
    res.status(500).json({ 
      error: 'Erro ao verificar atualizações',
      details: error.message 
    });
  }
});

// Verificar e baixar todas as atualizações
router.post('/sync-all', requireAuth, async (req, res) => {
  try {
    // Check if downloads are allowed
    const status = jwDownloader.getStatus();
    if (!status.canDownload) {
      return res.status(403).json({
        success: false,
        error: `Downloads não permitidos: ${status.downloadReason}`,
        status: status
      });
    }

    console.log('🔄 Sincronizando todos os materiais...');
    
    const results = await jwDownloader.checkAndDownloadAll(true); // true = explicit request
    
    res.json({
      success: true,
      message: 'Sincronização concluída',
      results
    });
  } catch (error) {
    console.error('❌ Erro na sincronização:', error);
    res.status(500).json({ 
      error: 'Erro na sincronização',
      details: error.message 
    });
  }
});

// =====================================================
// ROTAS DE ARMAZENAMENTO
// =====================================================

// Obter informações de armazenamento
router.get('/storage/info', requireAuth, async (req, res) => {
  try {
    const storageInfo = await materialManager.getStorageInfo();
    
    res.json({
      success: true,
      storage: storageInfo
    });
  } catch (error) {
    console.error('❌ Erro ao obter informações de armazenamento:', error);
    res.status(500).json({ 
      error: 'Erro ao obter informações de armazenamento',
      details: error.message 
    });
  }
});

// Obter estatísticas de uso
router.get('/storage/stats', requireAuth, async (req, res) => {
  try {
    const stats = await materialManager.getUsageStats();
    
    res.json({
      success: true,
      stats
    });
  } catch (error) {
    console.error('❌ Erro ao obter estatísticas:', error);
    res.status(500).json({ 
      error: 'Erro ao obter estatísticas',
      details: error.message 
    });
  }
});

// =====================================================
// ROTAS DE BACKUP
// =====================================================

// Fazer backup dos materiais
router.post('/backup', requireAuth, async (req, res) => {
  try {
    console.log('💾 Iniciando backup dos materiais...');
    
    const backup = await materialManager.backupMaterials();
    
    res.json({
      success: true,
      message: 'Backup concluído com sucesso',
      backup
    });
  } catch (error) {
    console.error('❌ Erro no backup:', error);
    res.status(500).json({ 
      error: 'Erro no backup',
      details: error.message 
    });
  }
});

// Listar backups disponíveis
router.get('/backup', requireAuth, async (req, res) => {
  try {
    const backups = await materialManager.listBackups();
    
    res.json({
      success: true,
      backups,
      total: backups.length
    });
  } catch (error) {
    console.error('❌ Erro ao listar backups:', error);
    res.status(500).json({ 
      error: 'Erro ao listar backups',
      details: error.message 
    });
  }
});

// Restaurar backup
router.post('/backup/:backupName/restore', requireAuth, async (req, res) => {
  try {
    const { backupName } = req.params;
    const backupPath = path.join(materialManager.backupPath, backupName);
    
    console.log(`🔄 Restaurando backup: ${backupName}`);
    
    const result = await materialManager.restoreBackup(backupPath);
    
    res.json({
      success: true,
      message: 'Backup restaurado com sucesso',
      result
    });
  } catch (error) {
    console.error('❌ Erro na restauração:', error);
    res.status(500).json({ 
      error: 'Erro na restauração',
      details: error.message 
    });
  }
});

// Limpar backups antigos
router.post('/backup/cleanup', requireAuth, async (req, res) => {
  try {
    const { daysToKeep } = req.body;
    
    console.log(`🗑️ Limpando backups antigos (mais de ${daysToKeep || 30} dias)...`);
    
    const result = await materialManager.cleanupOldBackups(daysToKeep);
    
    res.json({
      success: true,
      message: 'Limpeza de backups concluída',
      result
    });
  } catch (error) {
    console.error('❌ Erro na limpeza de backups:', error);
    res.status(500).json({ 
      error: 'Erro na limpeza de backups',
      details: error.message 
    });
  }
});

// =====================================================
// ROTAS DE MANUTENÇÃO
// =====================================================

// Limpar materiais antigos
router.post('/cleanup', requireAuth, async (req, res) => {
  try {
    const { daysToKeep } = req.body;
    
    console.log(`🗑️ Limpando materiais antigos (mais de ${daysToKeep || 90} dias)...`);
    
    const result = await jwDownloader.cleanupOldMaterials(daysToKeep);
    
    res.json({
      success: true,
      message: 'Limpeza concluída com sucesso',
      result
    });
  } catch (error) {
    console.error('❌ Erro na limpeza:', error);
    res.status(500).json({ 
      error: 'Erro na limpeza',
      details: error.message 
    });
  }
});

// Verificar saúde do sistema
router.get('/health', requireAuth, async (req, res) => {
  try {
    const health = await materialManager.checkSystemHealth();
    
    res.json({
      success: true,
      health
    });
  } catch (error) {
    console.error('❌ Erro no health check:', error);
    res.status(500).json({ 
      error: 'Erro no health check',
      details: error.message 
    });
  }
});

// Configure offline mode settings
router.post('/config/offline', requireAuth, async (req, res) => {
  try {
    const { offlineMode, allowExternalDownloads } = req.body;
    
    if (typeof offlineMode === 'boolean') {
      materialManager.setOfflineMode(offlineMode);
    }
    
    if (typeof allowExternalDownloads === 'boolean') {
      materialManager.setAllowExternalDownloads(allowExternalDownloads);
    }
    
    res.json({
      success: true,
      message: 'Configurações atualizadas',
      config: {
        offlineMode: materialManager.isOfflineMode(),
        allowExternalDownloads: materialManager.canDownloadExternally()
      }
    });
  } catch (error) {
    console.error('❌ Erro ao configurar modo offline:', error);
    res.status(500).json({ 
      error: 'Erro ao configurar modo offline',
      details: error.message 
    });
  }
});

// Get current configuration
router.get('/config', requireAuth, async (req, res) => {
  try {
    res.json({
      success: true,
      config: {
        offlineMode: materialManager.isOfflineMode(),
        allowExternalDownloads: materialManager.canDownloadExternally(),
        initialized: materialManager.initialized
      }
    });
  } catch (error) {
    console.error('❌ Erro ao obter configuração:', error);
    res.status(500).json({ 
      error: 'Erro ao obter configuração',
      details: error.message 
    });
  }
});

// =====================================================
// ROTAS DE TESTE (desenvolvimento)
// =====================================================

// Testar download de material
router.post('/test/download', requireAuth, async (req, res) => {
  try {
    const { url } = req.body;
    
    if (!url) {
      return res.status(400).json({ error: 'URL é obrigatória' });
    }

    // Check if downloads are allowed
    const status = jwDownloader.getStatus();
    if (!status.canDownload) {
      return res.status(403).json({
        success: false,
        error: `Downloads não permitidos: ${status.downloadReason}`,
        status: status
      });
    }

    console.log('🧪 Testando download...');
    const result = await jwDownloader.downloadByUrl(url, 'pt-BR', true); // true = explicit request
    
    res.json({
      success: true,
      message: 'Teste de download concluído',
      result
    });
  } catch (error) {
    console.error('❌ Erro no teste de download:', error);
    res.status(500).json({ 
      error: 'Erro no teste de download',
      details: error.message 
    });
  }
});

// Testar backup
router.post('/test/backup', requireAuth, async (req, res) => {
  try {
    console.log('🧪 Testando backup...');
    
    const backup = await materialManager.backupMaterials();
    
    res.json({
      success: true,
      message: 'Teste de backup concluído',
      backup
    });
  } catch (error) {
    console.error('❌ Erro no teste de backup:', error);
    res.status(500).json({ 
      error: 'Erro no teste de backup',
      details: error.message 
    });
  }
});

module.exports = {
  router,
  initializeServices
};

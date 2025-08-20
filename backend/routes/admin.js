const express = require('express');
const router = express.Router();

// Services are now resolved from the container instead of being instantiated here

// Middleware de autenticação (simplificado para desenvolvimento)
const requireAuth = (req, res, next) => {
  // Em produção, implementar JWT validation
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ error: 'Token de autenticação necessário' });
  }
  next();
};

// =====================================================
// ROTAS DE STATUS E SISTEMA
// =====================================================

// Status geral do sistema
router.get('/status', requireAuth, async (req, res) => {
  try {
    const status = {
      system: 'online',
      timestamp: new Date().toISOString(),
      services: {
        jwDownloader: req.container.resolve('jwDownloader').getStatus(),
        programGenerator: 'active',
        materialManager: 'active'
      },
      storage: await materialManager.getStorageInfo(),
      lastSync: await materialManager.getLastSyncInfo()
    };

    res.json(status);
  } catch (error) {
    console.error('❌ Erro ao obter status:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// =====================================================
// ROTAS DE DOWNLOAD DE MATERIAIS
// =====================================================

// Verificar atualizações disponíveis
router.post('/check-updates', requireAuth, async (req, res) => {
  try {
    // Check if downloads are allowed
    const jwDownloader = req.container.resolve('jwDownloader');
    const status = jwDownloader.getStatus();
    if (!status.canDownload) {
      return res.status(403).json({
        success: false,
        error: `Downloads não permitidos: ${status.downloadReason}`,
        status: status
      });
    }

    console.log('🔍 Verificando atualizações...');
    
    const results = await jwDownloader.checkAndDownloadAll(true); // true = explicit request
    
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

// Baixar material específico por URL
router.post('/download-material', requireAuth, async (req, res) => {
  try {
    const { url, language } = req.body;
    
    if (!url) {
      return res.status(400).json({ error: 'URL é obrigatória' });
    }

    // Check if downloads are allowed
    const jwDownloader = req.container.resolve('jwDownloader');
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

// Listar materiais baixados
router.get('/materials', requireAuth, async (req, res) => {
  try {
    const jwDownloader = req.container.resolve('jwDownloader');
    const materials = await jwDownloader.listDownloadedMaterials();
    
    res.json({
      success: true,
      materials,
      total: materials.length
    });
  } catch (error) {
    console.error('❌ Erro ao listar materiais:', error);
    res.status(500).json({ 
      error: 'Erro ao listar materiais',
      details: error.message 
    });
  }
});

// =====================================================
// ROTAS DE GERAÇÃO DE PROGRAMAS
// =====================================================

// Gerar programa baseado em material
router.post('/generate-program', requireAuth, async (req, res) => {
  try {
    const { materialId, materialInfo } = req.body;
    
    if (!materialInfo && !materialId) {
      return res.status(400).json({ error: 'Informações do material são obrigatórias' });
    }

    let material;
    if (materialId) {
      // Buscar material por ID
      const jwDownloader = req.container.resolve('jwDownloader');
      const materials = await jwDownloader.listDownloadedMaterials();
      material = materials.find(m => m.filename === materialId);
      if (!material) {
        return res.status(404).json({ error: 'Material não encontrado' });
      }
    } else {
      material = materialInfo;
    }

    const programGenerator = req.container.resolve('programGenerator');
    console.log(`📋 Gerando programa para: ${material.filename}`);
    const program = await programGenerator.generateWeeklyProgram(material);
    
    res.json({
      success: true,
      message: 'Programa gerado com sucesso',
      program
    });
  } catch (error) {
    console.error('❌ Erro ao gerar programa:', error);
    res.status(500).json({ 
      error: 'Erro ao gerar programa',
      details: error.message 
    });
  }
});

// Publicar programa
router.post('/publish-program/:id', requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    
    console.log(`📢 Publicando programa: ${id}`);
    const program = await programGenerator.publishProgram(id);
    
    res.json({
      success: true,
      message: 'Programa publicado com sucesso',
      program
    });
  } catch (error) {
    console.error('❌ Erro ao publicar programa:', error);
    res.status(500).json({ 
      error: 'Erro ao publicar programa',
      details: error.message 
    });
  }
});

// Listar programas
router.get('/programs', requireAuth, async (req, res) => {
  try {
    const { status } = req.query;
    const programs = await programGenerator.listPrograms(status);
    
    res.json({
      success: true,
      programs,
      total: programs.length
    });
  } catch (error) {
    console.error('❌ Erro ao listar programas:', error);
    res.status(500).json({ 
      error: 'Erro ao listar programas',
      details: error.message 
    });
  }
});

// =====================================================
// ROTAS DE CONFIGURAÇÃO
// =====================================================

// Obter configurações de download
router.get('/download-config', requireAuth, async (req, res) => {
  try {
    const mwbSources = require('../config/mwbSources.json');
    
    res.json({
      success: true,
      config: mwbSources
    });
  } catch (error) {
    console.error('❌ Erro ao obter configurações:', error);
    res.status(500).json({ 
      error: 'Erro ao obter configurações',
      details: error.message 
    });
  }
});

// Atualizar configurações de download
router.put('/download-config', requireAuth, async (req, res) => {
  try {
    const { config } = req.body;
    
    if (!config) {
      return res.status(400).json({ error: 'Configuração é obrigatória' });
    }

    // Em produção, validar e salvar no banco
    console.log('⚙️ Atualizando configurações de download');
    
    res.json({
      success: true,
      message: 'Configurações atualizadas com sucesso'
    });
  } catch (error) {
    console.error('❌ Erro ao atualizar configurações:', error);
    res.status(500).json({ 
      error: 'Erro ao atualizar configurações',
      details: error.message 
    });
  }
});

// =====================================================
// ROTAS DE MANUTENÇÃO
// =====================================================

// Limpar materiais antigos
router.post('/cleanup-materials', requireAuth, async (req, res) => {
  try {
    const { daysToKeep } = req.body;
    
    const jwDownloader = req.container.resolve('jwDownloader');
    console.log(`🗑️ Limpando materiais antigos (mais de ${daysToKeep || 90} dias)`);
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

// =====================================================
// ROTAS DE TESTE (desenvolvimento)
// =====================================================

// Rota para obter status do JWDownloader
router.get('/jwdownloader/status', requireAuth, async (req, res) => {
  try {
    const jwDownloader = req.container.resolve('jwDownloader');
    const status = jwDownloader.getStatus();
    
    res.json({
      success: true,
      status: status
    });
  } catch (error) {
    console.error('❌ Erro ao obter status do JWDownloader:', error);
    res.status(500).json({
      success: false,
      error: 'Erro ao obter status do JWDownloader',
      details: error.message
    });
  }
});

// Gerar programa de teste
router.post('/test/generate-program', requireAuth, async (req, res) => {
  try {
    console.log('🧪 Gerando programa de teste...');
    const program = await programGenerator.generateTestProgram();
    
    res.json({
      success: true,
      message: 'Programa de teste gerado com sucesso',
      program
    });
  } catch (error) {
    console.error('❌ Erro ao gerar programa de teste:', error);
    res.status(500).json({ 
      error: 'Erro ao gerar programa de teste',
      details: error.message 
    });
  }
});

// Testar download de material
router.post('/test/download', requireAuth, async (req, res) => {
  try {
    const { url } = req.body;
    
    if (!url) {
      return res.status(400).json({ error: 'URL é obrigatória' });
    }

    // Check if downloads are allowed
    const jwDownloader = req.container.resolve('jwDownloader');
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

module.exports = router;

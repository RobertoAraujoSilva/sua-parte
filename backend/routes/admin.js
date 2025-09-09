const express = require('express');
const router = express.Router();
const JWDownloader = require('../services/jwDownloader');
const ProgramGenerator = require('../services/programGenerator');
const MaterialManager = require('../services/materialManager');
const PDFParser = require('../services/pdfParser');

// Instanciar serviços
const jwDownloader = new JWDownloader();
const programGenerator = new ProgramGenerator();
const materialManager = new MaterialManager();
const pdfParser = new PDFParser();

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
        jwDownloader: 'active',
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
    console.log('🔍 Verificando atualizações...');
    
    const results = await jwDownloader.checkAndDownloadAll();
    
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

    console.log(`📥 Baixando material: ${url}`);
    const result = await jwDownloader.downloadByUrl(url, language || 'pt-BR');
    
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
      const materials = await jwDownloader.listDownloadedMaterials();
      material = materials.find(m => m.filename === materialId);
      if (!material) {
        return res.status(404).json({ error: 'Material não encontrado' });
      }
    } else {
      material = materialInfo;
    }

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

    console.log('🧪 Testando download...');
    const result = await jwDownloader.downloadByUrl(url, 'pt-BR');
    
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

// =====================================================
// ROTAS DE PDF PARSING
// =====================================================

// Escanear PDFs na pasta oficial
router.get('/scan-pdfs', requireAuth, async (req, res) => {
  try {
    console.log('🔍 Escaneando PDFs na pasta oficial...');
    const pdfs = await pdfParser.scanOfficialDirectory();
    
    res.json({
      success: true,
      message: 'PDFs escaneados com sucesso',
      pdfs,
      total: pdfs.length
    });
  } catch (error) {
    console.error('❌ Erro ao escanear PDFs:', error);
    res.status(500).json({ 
      error: 'Erro ao escanear PDFs',
      details: error.message 
    });
  }
});

// Extrair programação de um PDF específico
router.post('/parse-pdf', requireAuth, async (req, res) => {
  try {
    const { filePath } = req.body;
    
    if (!filePath) {
      return res.status(400).json({ error: 'Caminho do arquivo é obrigatório' });
    }

    console.log('📖 Extraindo programação do PDF:', filePath);
    const programming = await pdfParser.parsePDFContent(filePath);
    
    res.json({
      success: true,
      message: 'Programação extraída com sucesso',
      programming
    });
  } catch (error) {
    console.error('❌ Erro ao extrair programação:', error);
    res.status(500).json({ 
      error: 'Erro ao extrair programação',
      details: error.message 
    });
  }
});

// Validar PDF específico
router.post('/validate-pdf', requireAuth, async (req, res) => {
  try {
    const { filePath } = req.body;
    
    if (!filePath) {
      return res.status(400).json({ error: 'Caminho do arquivo é obrigatório' });
    }

    console.log('✅ Validando PDF:', filePath);
    const isValid = await pdfParser.validatePDF(filePath);
    
    res.json({
      success: true,
      message: 'PDF validado com sucesso',
      isValid,
      filePath
    });
  } catch (error) {
    console.error('❌ Erro ao validar PDF:', error);
    res.status(500).json({ 
      error: 'Erro ao validar PDF',
      details: error.message 
    });
  }
});

// Salvar programação extraída
router.post('/save-programming', requireAuth, async (req, res) => {
  try {
    const { programming } = req.body;
    
    if (!programming) {
      return res.status(400).json({ error: 'Dados de programação são obrigatórios' });
    }

    console.log('💾 Salvando programação extraída...');
    
    // TODO: Implementar salvamento no banco de dados
    // Por enquanto, apenas simular salvamento
    const savedProgramming = {
      ...programming,
      id: `prog_${Date.now()}`,
      savedAt: new Date().toISOString(),
      status: 'draft'
    };
    
    res.json({
      success: true,
      message: 'Programação salva com sucesso',
      programming: savedProgramming
    });
  } catch (error) {
    console.error('❌ Erro ao salvar programação:', error);
    res.status(500).json({ 
      error: 'Erro ao salvar programação',
      details: error.message 
    });
  }
});

// Listar programações salvas
router.get('/programmings', requireAuth, async (req, res) => {
  try {
    const { status } = req.query;
    
    console.log('📋 Listando programações salvas...');
    
    // TODO: Implementar busca no banco de dados
    // Por enquanto, retornar lista vazia
    const programmings = [];
    
    res.json({
      success: true,
      message: 'Programações listadas com sucesso',
      programmings,
      total: programmings.length
    });
  } catch (error) {
    console.error('❌ Erro ao listar programações:', error);
    res.status(500).json({ 
      error: 'Erro ao listar programações',
      details: error.message 
    });
  }
});

module.exports = router;

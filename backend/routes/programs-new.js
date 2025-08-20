const express = require('express');
const router = express.Router();

// Middleware de autenticação (simplificado para desenvolvimento)
const requireAuth = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ error: 'Token de autenticação necessário' });
  }
  next();
};

// =====================================================
// ROTAS DE PROGRAMAS
// =====================================================

// Listar todos os programas
router.get('/', requireAuth, async (req, res) => {
  try {
    const dataStore = req.container.resolve('dataStore');
    const { status, congregacaoId, startDate, endDate } = req.query;
    
    const filters = {};
    if (status) filters.status = status;
    if (congregacaoId) filters.congregacaoId = congregacaoId;
    if (startDate) filters.startDate = startDate;
    if (endDate) filters.endDate = endDate;
    
    const programs = await dataStore.getProgramas(filters);
    
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

// Obter programa específico
router.get('/:id', requireAuth, async (req, res) => {
  try {
    const dataStore = req.container.resolve('dataStore');
    const { id } = req.params;
    
    const program = await dataStore.getPrograma(id);
    
    if (!program) {
      return res.status(404).json({ error: 'Programa não encontrado' });
    }
    
    res.json({
      success: true,
      program
    });
  } catch (error) {
    console.error('❌ Erro ao obter programa:', error);
    res.status(500).json({ 
      error: 'Erro ao obter programa',
      details: error.message 
    });
  }
});

// Gerar novo programa
router.post('/', requireAuth, async (req, res) => {
  try {
    const dataStore = req.container.resolve('dataStore');
    const programGenerator = req.container.resolve('programGenerator');
    const { materialId, materialInfo, programData } = req.body;
    
    let program;
    
    if (programData) {
      // Create program directly from provided data
      program = await dataStore.createPrograma(programData);
    } else {
      // Generate program from material
      if (!materialInfo && !materialId) {
        return res.status(400).json({ error: 'Informações do material ou dados do programa são obrigatórios' });
      }

      let material;
      if (materialId) {
        // This would need to be implemented in the data store
        // For now, assume materialInfo is provided
        return res.status(400).json({ error: 'Busca por materialId não implementada ainda' });
      } else {
        material = materialInfo;
      }

      console.log(`📋 Gerando programa para: ${material.filename || 'material'}`);
      program = await programGenerator.generateWeeklyProgram(material);
    }
    
    res.json({
      success: true,
      message: 'Programa criado com sucesso',
      program
    });
  } catch (error) {
    console.error('❌ Erro ao criar programa:', error);
    res.status(500).json({ 
      error: 'Erro ao criar programa',
      details: error.message 
    });
  }
});

// Publicar programa
router.post('/:id/publish', requireAuth, async (req, res) => {
  try {
    const dataStore = req.container.resolve('dataStore');
    const { id } = req.params;
    
    console.log(`📢 Publicando programa: ${id}`);
    
    const program = await dataStore.updatePrograma(id, {
      status: 'ativo',
      publicado_em: new Date().toISOString()
    });
    
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

// Atualizar programa
router.put('/:id', requireAuth, async (req, res) => {
  try {
    const dataStore = req.container.resolve('dataStore');
    const { id } = req.params;
    const updates = req.body;
    
    console.log(`✏️ Atualizando programa: ${id}`);
    
    const program = await dataStore.updatePrograma(id, updates);
    
    res.json({
      success: true,
      message: 'Programa atualizado com sucesso',
      program
    });
  } catch (error) {
    console.error('❌ Erro ao atualizar programa:', error);
    res.status(500).json({ 
      error: 'Erro ao atualizar programa',
      details: error.message 
    });
  }
});

// Deletar programa
router.delete('/:id', requireAuth, async (req, res) => {
  try {
    const dataStore = req.container.resolve('dataStore');
    const { id } = req.params;
    
    console.log(`🗑️ Deletando programa: ${id}`);
    
    await dataStore.deletePrograma(id);
    
    res.json({
      success: true,
      message: 'Programa deletado com sucesso'
    });
  } catch (error) {
    console.error('❌ Erro ao deletar programa:', error);
    res.status(500).json({ 
      error: 'Erro ao deletar programa',
      details: error.message 
    });
  }
});

// =====================================================
// ROTAS DE DESIGNAÇÕES
// =====================================================

// Listar designações de um programa
router.get('/:id/assignments', requireAuth, async (req, res) => {
  try {
    const dataStore = req.container.resolve('dataStore');
    const { id } = req.params;
    
    const assignments = await dataStore.getDesignacoes({ programaId: id });
    
    res.json({
      success: true,
      assignments,
      total: assignments.length
    });
  } catch (error) {
    console.error('❌ Erro ao listar designações:', error);
    res.status(500).json({ 
      error: 'Erro ao listar designações',
      details: error.message 
    });
  }
});

// Criar designação para um programa
router.post('/:id/assignments', requireAuth, async (req, res) => {
  try {
    const dataStore = req.container.resolve('dataStore');
    const { id } = req.params;
    const assignmentData = req.body;
    
    console.log(`➕ Criando designação para programa: ${id}`);
    
    const assignment = await dataStore.createDesignacao({
      ...assignmentData,
      programa_id: id
    });
    
    res.json({
      success: true,
      message: 'Designação criada com sucesso',
      assignment
    });
  } catch (error) {
    console.error('❌ Erro ao criar designação:', error);
    res.status(500).json({ 
      error: 'Erro ao criar designação',
      details: error.message 
    });
  }
});

// =====================================================
// ROTAS DE ESTATÍSTICAS
// =====================================================

// Obter estatísticas dos programas
router.get('/stats/overview', requireAuth, async (req, res) => {
  try {
    const dataStore = req.container.resolve('dataStore');
    const { congregacaoId } = req.query;
    
    const filters = {};
    if (congregacaoId) filters.congregacaoId = congregacaoId;
    
    const programs = await dataStore.getProgramas(filters);

    const stats = {
      total: programs.length,
      porStatus: {
        rascunho: programs.filter(p => p.status === 'rascunho').length,
        ativo: programs.filter(p => p.status === 'ativo').length,
        arquivado: programs.filter(p => p.status === 'arquivado').length
      },
      ultimosCriados: programs
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
        .slice(0, 5)
    };
    
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

// Obter programas por período
router.get('/stats/by-period', requireAuth, async (req, res) => {
  try {
    const dataStore = req.container.resolve('dataStore');
    const { startDate, endDate, congregacaoId } = req.query;
    
    const filters = {};
    if (congregacaoId) filters.congregacaoId = congregacaoId;
    if (startDate) filters.startDate = startDate;
    if (endDate) filters.endDate = endDate;

    const programs = await dataStore.getProgramas(filters);

    const stats = {
      periodo: { startDate, endDate },
      total: programs.length,
      programas: programs
    };
    
    res.json({
      success: true,
      stats
    });
  } catch (error) {
    console.error('❌ Erro ao obter estatísticas por período:', error);
    res.status(500).json({ 
      error: 'Erro ao obter estatísticas por período',
      details: error.message 
    });
  }
});

// =====================================================
// ROTAS DE MANUTENÇÃO
// =====================================================

// Arquivar programas antigos
router.post('/archive-old', requireAuth, async (req, res) => {
  try {
    const dataStore = req.container.resolve('dataStore');
    const { daysOld = 90, congregacaoId } = req.body;
    
    console.log(`📦 Arquivando programas com mais de ${daysOld} dias...`);
    
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysOld);
    
    const filters = {
      status: 'ativo'
    };
    if (congregacaoId) filters.congregacaoId = congregacaoId;
    
    const programs = await dataStore.getProgramas(filters);
    const oldPrograms = programs.filter(p => new Date(p.created_at) < cutoffDate);
    
    const archivedPrograms = [];
    for (const program of oldPrograms) {
      const archived = await dataStore.updatePrograma(program.id, {
        status: 'arquivado',
        arquivado_em: new Date().toISOString()
      });
      archivedPrograms.push(archived);
    }
    
    res.json({
      success: true,
      message: `${archivedPrograms.length} programas arquivados`,
      archived: archivedPrograms
    });
  } catch (error) {
    console.error('❌ Erro ao arquivar programas:', error);
    res.status(500).json({ 
      error: 'Erro ao arquivar programas',
      details: error.message 
    });
  }
});

// Limpar programas arquivados
router.post('/cleanup-archived', requireAuth, async (req, res) => {
  try {
    const dataStore = req.container.resolve('dataStore');
    const { daysToKeep = 365, congregacaoId } = req.body;
    
    console.log(`🗑️ Limpando programas arquivados com mais de ${daysToKeep} dias...`);
    
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);
    
    const filters = {
      status: 'arquivado'
    };
    if (congregacaoId) filters.congregacaoId = congregacaoId;
    
    const programs = await dataStore.getProgramas(filters);
    const oldArchivedPrograms = programs.filter(p => 
      p.arquivado_em && new Date(p.arquivado_em) < cutoffDate
    );
    
    const removedPrograms = [];
    for (const program of oldArchivedPrograms) {
      await dataStore.deletePrograma(program.id);
      removedPrograms.push(program);
    }
    
    res.json({
      success: true,
      message: `${removedPrograms.length} programas arquivados removidos`,
      removed: removedPrograms
    });
  } catch (error) {
    console.error('❌ Erro ao limpar programas arquivados:', error);
    res.status(500).json({ 
      error: 'Erro ao limpar programas arquivados',
      details: error.message 
    });
  }
});

// =====================================================
// ROTAS DE TESTE (desenvolvimento)
// =====================================================

// Gerar programa de teste
router.post('/test/generate', requireAuth, async (req, res) => {
  try {
    const programGenerator = req.container.resolve('programGenerator');
    
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

// Testar publicação
router.post('/test/publish/:id', requireAuth, async (req, res) => {
  try {
    const dataStore = req.container.resolve('dataStore');
    const { id } = req.params;
    
    console.log('🧪 Testando publicação...');
    
    const program = await dataStore.updatePrograma(id, {
      status: 'ativo',
      publicado_em: new Date().toISOString()
    });
    
    res.json({
      success: true,
      message: 'Teste de publicação concluído',
      program
    });
  } catch (error) {
    console.error('❌ Erro no teste de publicação:', error);
    res.status(500).json({ 
      error: 'Erro no teste de publicação',
      details: error.message 
    });
  }
});

module.exports = router;
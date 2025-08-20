const express = require('express');
const router = express.Router();

// Note: This route file is deprecated. Use programs-new.js instead.
// Keeping for backward compatibility but updating to use ServiceContainer.

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
    const programGenerator = req.container.resolve('programGenerator');
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

// Obter programa específico
router.get('/:id', requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    
    const { data: program, error } = await supabase
      .from('programas')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
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
    const { materialId, materialInfo } = req.body;
    
    if (!materialInfo && !materialId) {
      return res.status(400).json({ error: 'Informações do material são obrigatórias' });
    }

    let material;
    if (materialId) {
      // Buscar material por ID
      const { data: materials, error } = await supabase
        .from('mwb_materials')
        .select('*')
        .eq('id', materialId)
        .single();

      if (error) {
        return res.status(404).json({ error: 'Material não encontrado' });
      }
      
      material = materials;
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
router.post('/:id/publish', requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    
    const programGenerator = req.container.resolve('programGenerator');
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

// Atualizar programa
router.put('/:id', requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    
    console.log(`✏️ Atualizando programa: ${id}`);
    
    const { data: program, error } = await supabase
      .from('programas')
      .update({
        ...updates,
        atualizado_em: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw error;
    }
    
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
    const { id } = req.params;
    
    console.log(`🗑️ Deletando programa: ${id}`);
    
    const { error } = await supabase
      .from('programas')
      .delete()
      .eq('id', id);

    if (error) {
      throw error;
    }
    
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
// ROTAS DE PARTES DO PROGRAMA
// =====================================================

// Listar partes de um programa
router.get('/:id/parts', requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    
    const { data: program, error } = await supabase
      .from('programas')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      return res.status(404).json({ error: 'Programa não encontrado' });
    }

    // Por enquanto, retornar partes simuladas
    // Em produção, isso viria de uma tabela específica
    const parts = [
      {
        id: `part_${id}_1`,
        tipo: 'abertura',
        titulo: 'Abertura e Cântico',
        duracao: 3,
        ordem: 1
      },
      {
        id: `part_${id}_2`,
        tipo: 'estudo',
        titulo: 'Estudo Bíblico da Congregação',
        duracao: 30,
        ordem: 2
      },
      {
        id: `part_${id}_3`,
        tipo: 'vida',
        titulo: 'Vida e Ministério Cristão',
        duracao: 30,
        ordem: 3
      },
      {
        id: `part_${id}_4`,
        tipo: 'fechamento',
        titulo: 'Cântico e Oração',
        duracao: 2,
        ordem: 4
      }
    ];
    
    res.json({
      success: true,
      program,
      parts,
      total: parts.length
    });
  } catch (error) {
    console.error('❌ Erro ao listar partes:', error);
    res.status(500).json({ 
      error: 'Erro ao listar partes',
      details: error.message 
    });
  }
});

// Adicionar parte ao programa
router.post('/:id/parts', requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const partData = req.body;
    
    console.log(`➕ Adicionando parte ao programa: ${id}`);
    
    // Em produção, salvar em uma tabela de partes
    const part = {
      id: `part_${id}_${Date.now()}`,
      programa_id: id,
      ...partData,
      criado_em: new Date().toISOString()
    };
    
    res.json({
      success: true,
      message: 'Parte adicionada com sucesso',
      part
    });
  } catch (error) {
    console.error('❌ Erro ao adicionar parte:', error);
    res.status(500).json({ 
      error: 'Erro ao adicionar parte',
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
    const { data: programs, error } = await supabase
      .from('programas')
      .select('*');

    if (error) {
      throw error;
    }

    const stats = {
      total: programs.length,
      porStatus: {
        rascunho: programs.filter(p => p.status === 'rascunho').length,
        ativo: programs.filter(p => p.status === 'ativo').length,
        arquivado: programs.filter(p => p.status === 'arquivado').length
      },
      porIdioma: {},
      ultimosCriados: programs
        .sort((a, b) => new Date(b.criado_em) - new Date(a.criado_em))
        .slice(0, 5)
    };

    // Contar por idioma
    programs.forEach(program => {
      const idioma = program.idioma || 'desconhecido';
      stats.porIdioma[idioma] = (stats.porIdioma[idioma] || 0) + 1;
    });
    
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
    const { startDate, endDate } = req.query;
    
    let query = supabase
      .from('programas')
      .select('*');

    if (startDate) {
      query = query.gte('criado_em', startDate);
    }
    if (endDate) {
      query = query.lte('criado_em', endDate);
    }

    const { data: programs, error } = await query;

    if (error) {
      throw error;
    }

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
    const { daysOld = 90 } = req.body;
    
    console.log(`📦 Arquivando programas com mais de ${daysOld} dias...`);
    
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysOld);
    
    const { data: programs, error } = await supabase
      .from('programas')
      .update({ 
        status: 'arquivado',
        arquivado_em: new Date().toISOString(),
        atualizado_em: new Date().toISOString()
      })
      .lt('criado_em', cutoffDate.toISOString())
      .eq('status', 'ativo')
      .select();

    if (error) {
      throw error;
    }
    
    res.json({
      success: true,
      message: `${programs.length} programas arquivados`,
      archived: programs
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
    const { daysToKeep = 365 } = req.body;
    
    console.log(`🗑️ Limpando programas arquivados com mais de ${daysToKeep} dias...`);
    
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);
    
    const { data: programs, error } = await supabase
      .from('programas')
      .delete()
      .lt('arquivado_em', cutoffDate.toISOString())
      .eq('status', 'arquivado')
      .select();

    if (error) {
      throw error;
    }
    
    res.json({
      success: true,
      message: `${programs.length} programas arquivados removidos`,
      removed: programs
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
    const { id } = req.params;
    
    const programGenerator = req.container.resolve('programGenerator');
    console.log('🧪 Testando publicação...');
    
    const program = await programGenerator.publishProgram(id);
    
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

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
// ROTAS DE ESTUDANTES
// =====================================================

// Listar todos os estudantes
router.get('/', requireAuth, async (req, res) => {
  try {
    const dataStore = req.container.resolve('dataStore');
    const { congregacaoId } = req.query;
    
    const students = await dataStore.getEstudantes(congregacaoId);
    
    res.json({
      success: true,
      students,
      total: students.length
    });
  } catch (error) {
    console.error('❌ Erro ao listar estudantes:', error);
    res.status(500).json({ 
      error: 'Erro ao listar estudantes',
      details: error.message 
    });
  }
});

// Obter estudante específico
router.get('/:id', requireAuth, async (req, res) => {
  try {
    const dataStore = req.container.resolve('dataStore');
    const { id } = req.params;
    
    const student = await dataStore.getEstudante(id);
    
    if (!student) {
      return res.status(404).json({ error: 'Estudante não encontrado' });
    }
    
    res.json({
      success: true,
      student
    });
  } catch (error) {
    console.error('❌ Erro ao obter estudante:', error);
    res.status(500).json({ 
      error: 'Erro ao obter estudante',
      details: error.message 
    });
  }
});

// Criar novo estudante
router.post('/', requireAuth, async (req, res) => {
  try {
    const dataStore = req.container.resolve('dataStore');
    const studentData = req.body;
    
    console.log(`➕ Criando estudante: ${studentData.nome}`);
    
    const student = await dataStore.createEstudante(studentData);
    
    res.json({
      success: true,
      message: 'Estudante criado com sucesso',
      student
    });
  } catch (error) {
    console.error('❌ Erro ao criar estudante:', error);
    res.status(500).json({ 
      error: 'Erro ao criar estudante',
      details: error.message 
    });
  }
});

// Atualizar estudante
router.put('/:id', requireAuth, async (req, res) => {
  try {
    const dataStore = req.container.resolve('dataStore');
    const { id } = req.params;
    const updates = req.body;
    
    console.log(`✏️ Atualizando estudante: ${id}`);
    
    const student = await dataStore.updateEstudante(id, updates);
    
    res.json({
      success: true,
      message: 'Estudante atualizado com sucesso',
      student
    });
  } catch (error) {
    console.error('❌ Erro ao atualizar estudante:', error);
    res.status(500).json({ 
      error: 'Erro ao atualizar estudante',
      details: error.message 
    });
  }
});

// Deletar estudante
router.delete('/:id', requireAuth, async (req, res) => {
  try {
    const dataStore = req.container.resolve('dataStore');
    const { id } = req.params;
    
    console.log(`🗑️ Deletando estudante: ${id}`);
    
    await dataStore.deleteEstudante(id);
    
    res.json({
      success: true,
      message: 'Estudante deletado com sucesso'
    });
  } catch (error) {
    console.error('❌ Erro ao deletar estudante:', error);
    res.status(500).json({ 
      error: 'Erro ao deletar estudante',
      details: error.message 
    });
  }
});

// =====================================================
// ROTAS DE HISTÓRICO DE DESIGNAÇÕES
// =====================================================

// Obter histórico de designações de um estudante
router.get('/:id/assignments', requireAuth, async (req, res) => {
  try {
    const dataStore = req.container.resolve('dataStore');
    const { id } = req.params;
    const { weeks = 12 } = req.query;
    
    const history = await dataStore.getHistoricoDesignacoes(id, parseInt(weeks));
    
    res.json({
      success: true,
      history,
      total: history.length,
      weeks: parseInt(weeks)
    });
  } catch (error) {
    console.error('❌ Erro ao obter histórico de designações:', error);
    res.status(500).json({ 
      error: 'Erro ao obter histórico de designações',
      details: error.message 
    });
  }
});

// Obter designações atuais de um estudante
router.get('/:id/current-assignments', requireAuth, async (req, res) => {
  try {
    const dataStore = req.container.resolve('dataStore');
    const { id } = req.params;
    
    const assignments = await dataStore.getDesignacoes({ 
      estudanteId: id,
      status: 'agendada'
    });
    
    res.json({
      success: true,
      assignments,
      total: assignments.length
    });
  } catch (error) {
    console.error('❌ Erro ao obter designações atuais:', error);
    res.status(500).json({ 
      error: 'Erro ao obter designações atuais',
      details: error.message 
    });
  }
});

// =====================================================
// ROTAS DE ESTATÍSTICAS
// =====================================================

// Obter estatísticas dos estudantes
router.get('/stats/overview', requireAuth, async (req, res) => {
  try {
    const dataStore = req.container.resolve('dataStore');
    const { congregacaoId } = req.query;
    
    const students = await dataStore.getEstudantes(congregacaoId);

    const stats = {
      total: students.length,
      porCargo: {},
      porGenero: {},
      ativos: students.filter(s => s.ativo).length,
      inativos: students.filter(s => !s.ativo).length
    };

    // Contar por cargo
    students.forEach(student => {
      const cargo = student.cargo || 'desconhecido';
      stats.porCargo[cargo] = (stats.porCargo[cargo] || 0) + 1;
    });

    // Contar por gênero
    students.forEach(student => {
      const genero = student.genero || 'desconhecido';
      stats.porGenero[genero] = (stats.porGenero[genero] || 0) + 1;
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

// Obter estudantes por cargo
router.get('/stats/by-cargo', requireAuth, async (req, res) => {
  try {
    const dataStore = req.container.resolve('dataStore');
    const { cargo, congregacaoId } = req.query;
    
    const allStudents = await dataStore.getEstudantes(congregacaoId);
    const students = cargo ? 
      allStudents.filter(s => s.cargo === cargo) : 
      allStudents;

    const stats = {
      cargo: cargo || 'todos',
      total: students.length,
      estudantes: students
    };
    
    res.json({
      success: true,
      stats
    });
  } catch (error) {
    console.error('❌ Erro ao obter estudantes por cargo:', error);
    res.status(500).json({ 
      error: 'Erro ao obter estudantes por cargo',
      details: error.message 
    });
  }
});

// =====================================================
// ROTAS DE BUSCA E FILTROS
// =====================================================

// Buscar estudantes
router.get('/search/:term', requireAuth, async (req, res) => {
  try {
    const dataStore = req.container.resolve('dataStore');
    const { term } = req.params;
    const { congregacaoId } = req.query;
    
    const allStudents = await dataStore.getEstudantes(congregacaoId);
    
    // Simple search implementation
    const searchTerm = term.toLowerCase();
    const results = allStudents.filter(student => 
      student.nome?.toLowerCase().includes(searchTerm) ||
      student.sobrenome?.toLowerCase().includes(searchTerm) ||
      student.email?.toLowerCase().includes(searchTerm) ||
      student.telefone?.includes(term)
    );
    
    res.json({
      success: true,
      results,
      total: results.length,
      searchTerm: term
    });
  } catch (error) {
    console.error('❌ Erro na busca de estudantes:', error);
    res.status(500).json({ 
      error: 'Erro na busca de estudantes',
      details: error.message 
    });
  }
});

// Filtrar estudantes por múltiplos critérios
router.post('/filter', requireAuth, async (req, res) => {
  try {
    const dataStore = req.container.resolve('dataStore');
    const { filters } = req.body;
    const { congregacaoId } = req.query;
    
    let students = await dataStore.getEstudantes(congregacaoId);
    
    // Apply filters
    if (filters.cargo && filters.cargo.length > 0) {
      students = students.filter(s => filters.cargo.includes(s.cargo));
    }
    
    if (filters.genero && filters.genero.length > 0) {
      students = students.filter(s => filters.genero.includes(s.genero));
    }
    
    if (filters.ativo !== undefined) {
      students = students.filter(s => s.ativo === filters.ativo);
    }
    
    if (filters.idadeMin) {
      students = students.filter(s => {
        if (!s.data_nascimento) return false;
        const age = new Date().getFullYear() - new Date(s.data_nascimento).getFullYear();
        return age >= filters.idadeMin;
      });
    }
    
    if (filters.idadeMax) {
      students = students.filter(s => {
        if (!s.data_nascimento) return false;
        const age = new Date().getFullYear() - new Date(s.data_nascimento).getFullYear();
        return age <= filters.idadeMax;
      });
    }
    
    res.json({
      success: true,
      students,
      total: students.length,
      filters
    });
  } catch (error) {
    console.error('❌ Erro ao filtrar estudantes:', error);
    res.status(500).json({ 
      error: 'Erro ao filtrar estudantes',
      details: error.message 
    });
  }
});

// =====================================================
// ROTAS DE IMPORTAÇÃO/EXPORTAÇÃO
// =====================================================

// Exportar estudantes
router.get('/export', requireAuth, async (req, res) => {
  try {
    const dataStore = req.container.resolve('dataStore');
    const { congregacaoId, format = 'json' } = req.query;
    
    const students = await dataStore.getEstudantes(congregacaoId);
    
    if (format === 'csv') {
      // Simple CSV export
      const headers = ['ID', 'Nome', 'Sobrenome', 'Email', 'Telefone', 'Cargo', 'Gênero', 'Ativo'];
      const csvData = [
        headers.join(','),
        ...students.map(s => [
          s.id,
          s.nome || '',
          s.sobrenome || '',
          s.email || '',
          s.telefone || '',
          s.cargo || '',
          s.genero || '',
          s.ativo ? 'Sim' : 'Não'
        ].join(','))
      ].join('\n');
      
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename=estudantes.csv');
      res.send(csvData);
    } else {
      res.json({
        success: true,
        students,
        total: students.length,
        exportedAt: new Date().toISOString()
      });
    }
  } catch (error) {
    console.error('❌ Erro ao exportar estudantes:', error);
    res.status(500).json({ 
      error: 'Erro ao exportar estudantes',
      details: error.message 
    });
  }
});

// Importar estudantes (bulk create)
router.post('/import', requireAuth, async (req, res) => {
  try {
    const dataStore = req.container.resolve('dataStore');
    const { students } = req.body;
    
    if (!Array.isArray(students)) {
      return res.status(400).json({ error: 'Lista de estudantes é obrigatória' });
    }
    
    console.log(`📥 Importando ${students.length} estudantes...`);
    
    const results = {
      success: [],
      errors: []
    };
    
    for (const studentData of students) {
      try {
        const student = await dataStore.createEstudante(studentData);
        results.success.push(student);
      } catch (error) {
        results.errors.push({
          data: studentData,
          error: error.message
        });
      }
    }
    
    res.json({
      success: true,
      message: `Importação concluída: ${results.success.length} sucessos, ${results.errors.length} erros`,
      results
    });
  } catch (error) {
    console.error('❌ Erro ao importar estudantes:', error);
    res.status(500).json({ 
      error: 'Erro ao importar estudantes',
      details: error.message 
    });
  }
});

// =====================================================
// ROTAS DE TESTE (desenvolvimento)
// =====================================================

// Criar estudante de teste
router.post('/test/create', requireAuth, async (req, res) => {
  try {
    const dataStore = req.container.resolve('dataStore');
    
    console.log('🧪 Criando estudante de teste...');
    
    const testStudent = {
      nome: 'João',
      sobrenome: 'Silva',
      email: 'joao.silva@test.com',
      telefone: '(11) 99999-9999',
      cargo: 'publicador_batizado',
      genero: 'masculino',
      congregacao_id: 'test-congregacao',
      ativo: true
    };
    
    const student = await dataStore.createEstudante(testStudent);
    
    res.json({
      success: true,
      message: 'Estudante de teste criado com sucesso',
      student
    });
  } catch (error) {
    console.error('❌ Erro ao criar estudante de teste:', error);
    res.status(500).json({ 
      error: 'Erro ao criar estudante de teste',
      details: error.message 
    });
  }
});

module.exports = router;
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const path = require('path');
const fse = require('fs-extra');

// Importar rotas essenciais
const programacoesRoutes = require('./routes/programacoes');
const designacoesRoutes = require('./routes/designacoes');

const app = express();
// Porta do servidor: usa variável de ambiente quando definida (>0); caso contrário, 3000
const envPort = parseInt(process.env.PORT || '', 10);
const PORT = Number.isFinite(envPort) && envPort > 0 ? envPort : 3000;

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Servir arquivos estáticos da pasta docs/Oficial (para PDFs mockados)
app.use('/materials', express.static(path.join(__dirname, '../docs/Oficial')));

// Rotas essenciais
app.use('/api/programacoes', programacoesRoutes);
app.use('/api/designacoes', designacoesRoutes);

// Rota para programações mockadas a partir de JSON local
// GET /api/programacoes/mock?mes=YYYY-MM
// GET /api/programacoes/mock?semana=YYYY-MM-DD
app.get('/api/programacoes/mock', async (req, res) => {
  try {
    const { mes, semana } = req.query;
    if (!mes && !semana) {
      return res.status(400).json({ error: 'informe ?mes=YYYY-MM ou ?semana=YYYY-MM-DD' });
    }

    const fileMonth = mes || (semana ? String(semana).slice(0, 7) : null);
    if (!fileMonth) {
      return res.status(400).json({ error: 'parâmetros inválidos' });
    }

    const baseDir = path.join(__dirname, '../docs/Oficial/programacoes-json');
    const filePath = path.join(baseDir, `${fileMonth}.json`);

    const exists = await fse.pathExists(filePath);
    if (!exists) {
      return res.status(404).json({ error: `programação não encontrada para ${fileMonth} (arquivo ausente)` });
    }

    const data = await fse.readJSON(filePath);

    if (semana) {
      const week = Array.isArray(data) ? data.find(w => w.idSemana === semana) : null;
      if (!week) return res.status(404).json({ error: 'semana não encontrada' });
      return res.json(week);
    }

    return res.json(data);
  } catch (error) {
    console.error('❌ Erro ao ler programação mock:', error);
    return res.status(500).json({ error: error.message });
  }
});

// Rota de status simplificada
app.get('/api/status', (req, res) => {
  res.json({
    status: 'online',
    timestamp: new Date().toISOString(),
    version: '2.0.0-simplified',
    mode: 'mock-programming',
    description: 'Sistema Ministerial Simplificado - Programação Mockada'
  });
});

// Inicializar sistema simplificado
async function initializeSystem() {
  try {
    console.log('🚀 Inicializando Sistema Ministerial Backend Simplificado...');
    
    // Verificar/criar pastas necessárias
    const docsPath = path.join(__dirname, '../docs/Oficial');
    await fse.ensureDir(docsPath);
    console.log('✅ Pasta docs/Oficial verificada');
    
    console.log('✅ Sistema simplificado inicializado');
    
    // Iniciar servidor
    const server = app.listen(PORT, () => {
      const actualPort = server.address().port;
      console.log(`🎯 Sistema Ministerial Backend Simplificado rodando na porta ${actualPort}`);
      console.log(`📁 PDFs mockados disponíveis em: ${docsPath}`);
      console.log(`🌐 API disponível em: http://localhost:${actualPort}/api`);
      console.log(`🧪 Para testar: curl http://localhost:${actualPort}/api/status`);
      console.log(`📋 Modo: Programação Mockada (sem scraping JW.org)`);
    });
    
  } catch (error) {
    console.error('❌ Erro na inicialização:', error);
    process.exit(1);
  }
}

// Tratamento de erros não capturados
process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
});

process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught Exception:', error);
  process.exit(1);
});

// Inicializar sistema
initializeSystem();

module.exports = app;

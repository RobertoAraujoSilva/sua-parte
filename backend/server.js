require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const cron = require('node-cron');
const path = require('path');
const fs = require('fs-extra');

// Importar serviços
const JWDownloader = require('./services/jwDownloader');
const ProgramGenerator = require('./services/programGenerator');
const MaterialManager = require('./services/materialManager');
const NotificationService = require('./services/notificationService');

// Importar rotas
const adminRoutes = require('./routes/admin');
const materialsRoutes = require('./routes/materials');
const programsRoutes = require('./routes/programs');
const programacoesRoutes = require('./routes/programacoes');
const programacoesRoutes = require('./routes/programacoes');
const designacoesRoutes = require('./routes/designacoes');

const app = express();
const PORT = process.env.PORT || 0; // 0 = porta dinâmica

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Servir arquivos estáticos da pasta docs/Oficial
app.use('/materials', express.static(path.join(__dirname, '../docs/Oficial')));

// Rotas
app.use('/api/admin', adminRoutes);
app.use('/api/materials', materialsRoutes);
app.use('/api/programs', programsRoutes);
app.use('/api/programacoes', programacoesRoutes);
app.use('/api/programacoes', programacoesRoutes);
app.use('/api/designacoes', designacoesRoutes);

// Rota de status
app.get('/api/status', (req, res) => {
  res.json({
    status: 'online',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    services: {
      jwDownloader: 'active',
      programGenerator: 'active',
      materialManager: 'active',
      notificationService: 'active'
    }
  });
});

// Inicializar serviços
const jwDownloader = new JWDownloader();
const programGenerator = new ProgramGenerator();
const materialManager = new MaterialManager();
const notificationService = new NotificationService();

// Agendamento automático de downloads
cron.schedule('0 3 * * *', async () => {
  console.log('🕐 Executando download automático diário...');
  try {
    const results = await jwDownloader.checkAndDownloadAll();
    console.log('✅ Download automático concluído:', results);
    
    // Notificar admins sobre novos materiais
    if (results.newMaterials.length > 0) {
      await notificationService.notifyAdmins('Novos materiais disponíveis', results.newMaterials);
    }
  } catch (error) {
    console.error('❌ Erro no download automático:', error);
  }
}, {
  timezone: 'America/Sao_Paulo'
});

// Verificação de saúde do sistema a cada 5 minutos
cron.schedule('*/5 * * * *', async () => {
  try {
    const health = await materialManager.checkSystemHealth();
    console.log('🏥 Health check:', health);
  } catch (error) {
    console.error('❌ Health check failed:', error);
  }
});

// Inicializar sistema
async function initializeSystem() {
  try {
    console.log('🚀 Inicializando Sistema Ministerial Backend...');
    
    // Verificar/criar pastas necessárias
    const docsPath = path.join(__dirname, '../docs/Oficial');
    await fs.ensureDir(docsPath);
    console.log('✅ Pasta docs/Oficial verificada');
    
    // Inicializar serviços
    await materialManager.initialize();
    await jwDownloader.initialize();
    await programGenerator.initialize();
    
    console.log('✅ Todos os serviços inicializados');
    
    // Iniciar servidor
    const server = app.listen(PORT, () => {
      const actualPort = server.address().port;
      console.log(`🎯 Sistema Ministerial Backend rodando na porta ${actualPort}`);
      console.log(`📁 Materiais disponíveis em: ${docsPath}`);
      console.log(`🌐 API disponível em: http://localhost:${actualPort}/api`);
      console.log(`🧪 Para testar: curl http://localhost:${actualPort}/api/status`);
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

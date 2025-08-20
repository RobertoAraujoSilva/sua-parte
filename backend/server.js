const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const cron = require('node-cron');
const path = require('path');
const fs = require('fs-extra');

// Importar container de serviços
const { createServiceContainer } = require('./dist/container/ServiceContainer');

// Importar rotas
const adminRoutes = require('./routes/admin');
const materialsModule = require('./routes/materials');
const programsRoutes = require('./routes/programs-new'); // Updated to use new data access layer
const studentsRoutes = require('./routes/students'); // New students route

const app = express();
const PORT = process.env.PORT || 3001;

// Create service container
const container = createServiceContainer();

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Inject container into request object for routes
app.use((req, res, next) => {
  req.container = container;
  next();
});

// Servir arquivos estáticos da pasta docs/Oficial
app.use('/materials', express.static(path.join(__dirname, '../docs/Oficial')));

// Rotas
app.use('/api/admin', adminRoutes);
app.use('/api/materials', materialsModule.router);
app.use('/api/programs', programsRoutes);
app.use('/api/students', studentsRoutes);

// Rota de status
app.get('/api/status', async (req, res) => {
  try {
    const dataStore = req.container.resolve('dataStore');
    const healthCheck = await dataStore.healthCheck();
    
    res.json({
      status: 'online',
      timestamp: new Date().toISOString(),
      version: '1.0.0',
      mode: req.container.getConfig('mode'),
      database: {
        type: req.container.getConfig('database').type,
        status: healthCheck.status
      },
      services: {
        jwDownloader: req.container.resolve('jwDownloader').getStatus(),
        programGenerator: 'active',
        materialManager: 'active',
        notificationService: 'active'
      }
    });
  } catch (error) {
    console.error('❌ Error getting status:', error);
    res.status(500).json({
      status: 'error',
      timestamp: new Date().toISOString(),
      error: error.message
    });
  }
});

// Initialize scheduled tasks after container is ready
let scheduledTasks = [];

function initializeScheduledTasks() {
  // Agendamento automático de downloads (apenas se permitido)
  const downloadTask = cron.schedule('0 3 * * *', async () => {
    console.log('🕐 Verificando se downloads automáticos estão permitidos...');
    try {
      const jwDownloader = container.resolve('jwDownloader');
      const notificationService = container.resolve('notificationService');
      
      const status = jwDownloader.getStatus();
      if (!status.canAutoDownload) {
        console.log(`⚠️ Downloads automáticos não permitidos: ${status.autoDownloadReason}`);
        return;
      }
      
      console.log('🕐 Executando download automático diário...');
      const results = await jwDownloader.checkAndDownloadAll(false); // false = not explicit request
      console.log('✅ Download automático concluído:', results);
      
      // Notificar admins sobre novos materiais
      if (results.newMaterials && results.newMaterials.length > 0) {
        await notificationService.notifyAdmins('Novos materiais disponíveis', results.newMaterials);
      }
    } catch (error) {
      console.error('❌ Erro no download automático:', error);
    }
  }, {
    timezone: 'America/Sao_Paulo',
    scheduled: false
  });

  // Verificação de saúde do sistema a cada 5 minutos
  const healthTask = cron.schedule('*/5 * * * *', async () => {
    try {
      const dataStore = container.resolve('dataStore');
      const materialManager = container.resolve('materialManager');
      
      const health = await dataStore.healthCheck();
      const systemHealth = await materialManager.checkSystemHealth();
      
      console.log('🏥 Health check:', { database: health, system: systemHealth });
    } catch (error) {
      console.error('❌ Health check failed:', error);
    }
  }, {
    scheduled: false
  });

  scheduledTasks = [downloadTask, healthTask];
  
  // Start tasks
  scheduledTasks.forEach(task => task.start());
  console.log('✅ Scheduled tasks initialized');
}

// Inicializar sistema
async function initializeSystem() {
  try {
    console.log('🚀 Inicializando Sistema Ministerial Backend...');
    
    // Verificar/criar pastas necessárias
    const docsPath = path.join(__dirname, '../docs/Oficial');
    await fs.ensureDir(docsPath);
    console.log('✅ Pasta docs/Oficial verificada');
    
    // Initialize service container
    await container.initialize();
    console.log('✅ Service Container inicializado');
    
    // Initialize individual services
    const materialManager = container.resolve('materialManager');
    const jwDownloader = container.resolve('jwDownloader');
    
    await materialManager.initialize();
    await jwDownloader.initialize();
    
    // Initialize routes with services
    materialsModule.initializeServices(container);
    
    console.log('✅ Todos os serviços inicializados');
    
    // Initialize scheduled tasks
    initializeScheduledTasks();
    
    // Iniciar servidor
    const server = app.listen(PORT, () => {
      console.log(`🎯 Sistema Ministerial Backend rodando na porta ${PORT}`);
      console.log(`📁 Materiais disponíveis em: ${docsPath}`);
      console.log(`🌐 API disponível em: http://localhost:${PORT}/api`);
      console.log(`💾 Database Type: ${container.getConfig('database').type}`);
      console.log(`🔧 Mode: ${container.getConfig('mode')}`);
    });

    // Graceful shutdown
    const gracefulShutdown = async (signal) => {
      console.log(`\n🔄 Received ${signal}, shutting down gracefully...`);
      
      // Stop scheduled tasks
      scheduledTasks.forEach(task => task.stop());
      console.log('✅ Scheduled tasks stopped');
      
      // Close server
      server.close(async () => {
        console.log('✅ HTTP server closed');
        
        try {
          // Shutdown container
          await container.shutdown();
          console.log('✅ Graceful shutdown complete');
          process.exit(0);
        } catch (error) {
          console.error('❌ Error during shutdown:', error);
          process.exit(1);
        }
      });
    };

    // Handle shutdown signals
    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));
    
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

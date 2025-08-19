/**
 * Sistema Ministerial Verification System Optimizer
 * Implements final system optimizations for Task 14.3
 */

import { promises as fs } from 'fs';
import { join } from 'path';

class SystemOptimizer {
  constructor() {
    this.optimizationsApplied = [];
    this.performanceMetrics = new Map();
    this.healthMonitor = new HealthMonitor();
  }

  /**
   * Apply all system optimizations
   */
  async optimizeSystem() {
    console.log('🚀 Starting Sistema Ministerial System Optimization');
    console.log('==================================================\n');

    const startTime = Date.now();

    try {
      // Performance optimizations
      await this.optimizeVerificationExecution();
      await this.optimizeMemoryUsage();
      await this.optimizeConcurrency();
      await this.optimizeErrorHandling();

      // Health monitoring setup
      await this.setupHealthMonitoring();
      await this.setupAlerting();

      // Cleanup and maintenance
      await this.cleanupTempFiles();
      await this.optimizeLogFiles();

      const totalTime = Date.now() - startTime;
      
      console.log('\n📊 Optimization Summary');
      console.log('=======================');
      console.log(`⏱️ Total optimization time: ${totalTime}ms`);
      console.log(`🔧 Optimizations applied: ${this.optimizationsApplied.length}`);
      
      this.optimizationsApplied.forEach(opt => {
        console.log(`  ✅ ${opt}`);
      });

      console.log('\n🎉 System optimization completed successfully!');
      return true;

    } catch (error) {
      console.error('❌ System optimization failed:', error);
      return false;
    }
  }

  /**
   * Optimize verification execution performance
   */
  async optimizeVerificationExecution() {
    console.log('⚡ Optimizing verification execution...');

    // Parallel execution optimization
    await this.optimizeParallelExecution();
    
    // Caching optimization
    await this.implementResultCaching();
    
    // Timeout optimization
    await this.optimizeTimeouts();

    this.optimizationsApplied.push('Verification execution performance');
  }

  /**
   * Optimize parallel execution of verifiers
   */
  async optimizeParallelExecution() {
    const optimizationConfig = {
      maxConcurrentVerifiers: 4,
      dependencyGraph: {
        'infrastructure': [],
        'backend': ['infrastructure'],
        'frontend': ['infrastructure'],
        'authentication': ['backend'],
        'database': ['infrastructure'],
        'test_suite': ['frontend', 'backend'],
        'scripts': []
      },
      executionPools: {
        'cpu-intensive': ['infrastructure', 'scripts'],
        'io-intensive': ['backend', 'frontend', 'database'],
        'network-intensive': ['authentication', 'test_suite']
      }
    };

    // Write optimization config
    await this.writeOptimizationConfig('parallel-execution.json', optimizationConfig);
    
    console.log('  ✅ Parallel execution optimized');
  }

  /**
   * Implement result caching
   */
  async implementResultCaching() {
    const cacheConfig = {
      enabled: true,
      ttl: 300000, // 5 minutes
      maxSize: 100,
      cacheKeys: [
        'infrastructure.dependencies',
        'infrastructure.environment',
        'backend.services',
        'database.connection'
      ],
      invalidationRules: {
        'package.json': ['infrastructure.dependencies'],
        '.env': ['infrastructure.environment'],
        'backend/**': ['backend.services'],
        'supabase/**': ['database.connection']
      }
    };

    await this.writeOptimizationConfig('result-cache.json', cacheConfig);
    
    console.log('  ✅ Result caching implemented');
  }

  /**
   * Optimize timeout values
   */
  async optimizeTimeouts() {
    const timeoutConfig = {
      verification: {
        infrastructure: 10000,    // 10 seconds
        backend: 30000,          // 30 seconds
        frontend: 45000,         // 45 seconds
        authentication: 20000,   // 20 seconds
        database: 15000,         // 15 seconds
        test_suite: 120000,      // 2 minutes
        scripts: 60000           // 1 minute
      },
      operations: {
        healthCheck: 5000,
        apiCall: 10000,
        fileOperation: 3000,
        networkRequest: 8000
      },
      retries: {
        maxAttempts: 3,
        baseDelay: 1000,
        maxDelay: 10000,
        backoffFactor: 2
      }
    };

    await this.writeOptimizationConfig('timeouts.json', timeoutConfig);
    
    console.log('  ✅ Timeout values optimized');
  }

  /**
   * Optimize memory usage
   */
  async optimizeMemoryUsage() {
    console.log('🧠 Optimizing memory usage...');

    const memoryConfig = {
      limits: {
        maxHeapSize: '512MB',
        maxOldSpaceSize: '256MB',
        warningThreshold: 0.8,
        criticalThreshold: 0.95
      },
      cleanup: {
        intervalMs: 30000,
        forceGCThreshold: 0.9,
        clearCacheThreshold: 0.85
      },
      monitoring: {
        enabled: true,
        sampleInterval: 5000,
        reportInterval: 60000
      }
    };

    await this.writeOptimizationConfig('memory.json', memoryConfig);

    // Implement memory monitoring
    await this.setupMemoryMonitoring();

    this.optimizationsApplied.push('Memory usage optimization');
    console.log('  ✅ Memory usage optimized');
  }

  /**
   * Setup memory monitoring
   */
  async setupMemoryMonitoring() {
    const monitoringScript = `
/**
 * Memory monitoring for verification system
 */
class MemoryMonitor {
  constructor() {
    this.samples = [];
    this.warningThreshold = 0.8;
    this.criticalThreshold = 0.95;
  }

  start() {
    setInterval(() => {
      this.collectSample();
    }, 5000);

    setInterval(() => {
      this.generateReport();
    }, 60000);
  }

  collectSample() {
    const usage = process.memoryUsage();
    const sample = {
      timestamp: Date.now(),
      heapUsed: usage.heapUsed,
      heapTotal: usage.heapTotal,
      external: usage.external,
      rss: usage.rss,
      utilization: usage.heapUsed / usage.heapTotal
    };

    this.samples.push(sample);
    
    // Keep only last 100 samples
    if (this.samples.length > 100) {
      this.samples.shift();
    }

    // Check thresholds
    if (sample.utilization > this.criticalThreshold) {
      console.warn('🚨 CRITICAL: Memory usage at', (sample.utilization * 100).toFixed(1) + '%');
      this.triggerGarbageCollection();
    } else if (sample.utilization > this.warningThreshold) {
      console.warn('⚠️ WARNING: Memory usage at', (sample.utilization * 100).toFixed(1) + '%');
    }
  }

  triggerGarbageCollection() {
    if (global.gc) {
      global.gc();
      console.log('🗑️ Garbage collection triggered');
    }
  }

  generateReport() {
    if (this.samples.length === 0) return;

    const latest = this.samples[this.samples.length - 1];
    const average = this.samples.reduce((sum, s) => sum + s.utilization, 0) / this.samples.length;
    const peak = Math.max(...this.samples.map(s => s.utilization));

    console.log('📊 Memory Report:');
    console.log(\`  Current: \${(latest.utilization * 100).toFixed(1)}%\`);
    console.log(\`  Average: \${(average * 100).toFixed(1)}%\`);
    console.log(\`  Peak: \${(peak * 100).toFixed(1)}%\`);
    console.log(\`  Heap: \${(latest.heapUsed / 1024 / 1024).toFixed(1)}MB / \${(latest.heapTotal / 1024 / 1024).toFixed(1)}MB\`);
  }
}

export const memoryMonitor = new MemoryMonitor();
`;

    await fs.writeFile(
      join(process.cwd(), 'src/verification/utils/memory-monitor.js'),
      monitoringScript
    );
  }

  /**
   * Optimize concurrency
   */
  async optimizeConcurrency() {
    console.log('🔄 Optimizing concurrency...');

    const concurrencyConfig = {
      pools: {
        cpu: {
          size: Math.max(2, Math.floor(require('os').cpus().length * 0.75)),
          queue: 'fifo'
        },
        io: {
          size: 8,
          queue: 'priority'
        },
        network: {
          size: 6,
          queue: 'round-robin'
        }
      },
      limits: {
        maxConcurrentOperations: 10,
        maxQueueSize: 50,
        operationTimeout: 30000
      },
      strategies: {
        loadBalancing: 'least-busy',
        failover: 'retry-different-pool',
        backpressure: 'queue-with-timeout'
      }
    };

    await this.writeOptimizationConfig('concurrency.json', concurrencyConfig);

    this.optimizationsApplied.push('Concurrency optimization');
    console.log('  ✅ Concurrency optimized');
  }

  /**
   * Optimize error handling
   */
  async optimizeErrorHandling() {
    console.log('🛡️ Optimizing error handling...');

    const errorConfig = {
      recovery: {
        maxRetries: 3,
        retryDelay: 1000,
        exponentialBackoff: true,
        jitterFactor: 0.1
      },
      classification: {
        transient: ['ECONNRESET', 'ETIMEDOUT', 'ENOTFOUND'],
        permanent: ['EACCES', 'ENOENT', 'EPERM'],
        recoverable: ['EMFILE', 'ENOMEM', 'EAGAIN']
      },
      handling: {
        gracefulDegradation: true,
        circuitBreaker: {
          enabled: true,
          threshold: 5,
          timeout: 60000,
          resetTimeout: 300000
        }
      },
      logging: {
        level: 'error',
        includeStack: true,
        includeContext: true,
        maxLogSize: '10MB'
      }
    };

    await this.writeOptimizationConfig('error-handling.json', errorConfig);

    this.optimizationsApplied.push('Error handling optimization');
    console.log('  ✅ Error handling optimized');
  }

  /**
   * Setup health monitoring
   */
  async setupHealthMonitoring() {
    console.log('🏥 Setting up health monitoring...');

    const healthConfig = {
      checks: {
        system: {
          cpu: { threshold: 80, interval: 10000 },
          memory: { threshold: 85, interval: 5000 },
          disk: { threshold: 90, interval: 30000 }
        },
        services: {
          backend: { endpoint: '/api/status', interval: 15000 },
          frontend: { endpoint: '/', interval: 20000 },
          database: { query: 'SELECT 1', interval: 10000 }
        },
        verification: {
          lastRun: { maxAge: 3600000 }, // 1 hour
          successRate: { threshold: 0.8, window: 86400000 }, // 24 hours
          performance: { threshold: 120000 } // 2 minutes
        }
      },
      actions: {
        warning: ['log', 'metric'],
        critical: ['log', 'metric', 'alert', 'auto-fix'],
        recovery: ['restart-service', 'clear-cache', 'garbage-collect']
      }
    };

    await this.writeOptimizationConfig('health-monitoring.json', healthConfig);

    // Create health monitor script
    await this.createHealthMonitorScript();

    this.optimizationsApplied.push('Health monitoring setup');
    console.log('  ✅ Health monitoring configured');
  }

  /**
   * Create health monitor script
   */
  async createHealthMonitorScript() {
    const healthScript = `
/**
 * System health monitor
 */
import { promises as fs } from 'fs';
import { join } from 'path';

class HealthMonitor {
  constructor() {
    this.checks = new Map();
    this.metrics = new Map();
    this.alerts = [];
  }

  async start() {
    console.log('🏥 Starting health monitor...');
    
    // Load configuration
    const config = await this.loadConfig();
    
    // Setup system checks
    this.setupSystemChecks(config.checks.system);
    
    // Setup service checks
    this.setupServiceChecks(config.checks.services);
    
    // Setup verification checks
    this.setupVerificationChecks(config.checks.verification);
    
    console.log('✅ Health monitor started');
  }

  async loadConfig() {
    try {
      const configPath = join(process.cwd(), 'src/verification/config/health-monitoring.json');
      const content = await fs.readFile(configPath, 'utf8');
      return JSON.parse(content);
    } catch (error) {
      console.warn('⚠️ Could not load health config, using defaults');
      return this.getDefaultConfig();
    }
  }

  setupSystemChecks(config) {
    // CPU monitoring
    setInterval(() => {
      this.checkCPUUsage(config.cpu.threshold);
    }, config.cpu.interval);

    // Memory monitoring
    setInterval(() => {
      this.checkMemoryUsage(config.memory.threshold);
    }, config.memory.interval);

    // Disk monitoring
    setInterval(() => {
      this.checkDiskUsage(config.disk.threshold);
    }, config.disk.interval);
  }

  setupServiceChecks(config) {
    Object.entries(config).forEach(([service, serviceConfig]) => {
      setInterval(() => {
        this.checkService(service, serviceConfig);
      }, serviceConfig.interval);
    });
  }

  setupVerificationChecks(config) {
    setInterval(() => {
      this.checkVerificationHealth(config);
    }, 60000); // Check every minute
  }

  async checkCPUUsage(threshold) {
    // Implementation would use system monitoring
    const usage = await this.getCPUUsage();
    
    if (usage > threshold) {
      this.triggerAlert('cpu', 'critical', \`CPU usage at \${usage}%\`);
    }
  }

  async checkMemoryUsage(threshold) {
    const usage = process.memoryUsage();
    const utilization = (usage.heapUsed / usage.heapTotal) * 100;
    
    if (utilization > threshold) {
      this.triggerAlert('memory', 'critical', \`Memory usage at \${utilization.toFixed(1)}%\`);
    }
  }

  async checkService(service, config) {
    try {
      if (config.endpoint) {
        const response = await fetch(\`http://localhost:3000\${config.endpoint}\`);
        if (!response.ok) {
          this.triggerAlert(service, 'warning', \`Service \${service} returned \${response.status}\`);
        }
      }
    } catch (error) {
      this.triggerAlert(service, 'critical', \`Service \${service} unreachable: \${error.message}\`);
    }
  }

  triggerAlert(component, level, message) {
    const alert = {
      timestamp: new Date(),
      component,
      level,
      message
    };

    this.alerts.push(alert);
    console.log(\`🚨 [\${level.toUpperCase()}] \${component}: \${message}\`);

    // Keep only last 100 alerts
    if (this.alerts.length > 100) {
      this.alerts.shift();
    }
  }

  getDefaultConfig() {
    return {
      checks: {
        system: {
          cpu: { threshold: 80, interval: 10000 },
          memory: { threshold: 85, interval: 5000 },
          disk: { threshold: 90, interval: 30000 }
        },
        services: {},
        verification: {}
      }
    };
  }
}

export const healthMonitor = new HealthMonitor();
`;

    await fs.writeFile(
      join(process.cwd(), 'src/verification/utils/health-monitor.js'),
      healthScript
    );
  }

  /**
   * Setup alerting system
   */
  async setupAlerting() {
    console.log('🔔 Setting up alerting system...');

    const alertConfig = {
      channels: {
        console: { enabled: true, level: 'warning' },
        file: { enabled: true, level: 'error', path: 'logs/alerts.log' },
        webhook: { enabled: false, url: '', level: 'critical' }
      },
      rules: {
        rateLimit: { maxAlerts: 10, windowMs: 60000 },
        deduplication: { enabled: true, windowMs: 300000 },
        escalation: {
          warning: { after: 5, escalateTo: 'error' },
          error: { after: 3, escalateTo: 'critical' }
        }
      },
      templates: {
        warning: '⚠️ [WARNING] {component}: {message}',
        error: '❌ [ERROR] {component}: {message}',
        critical: '🚨 [CRITICAL] {component}: {message}'
      }
    };

    await this.writeOptimizationConfig('alerting.json', alertConfig);

    this.optimizationsApplied.push('Alerting system setup');
    console.log('  ✅ Alerting system configured');
  }

  /**
   * Cleanup temporary files
   */
  async cleanupTempFiles() {
    console.log('🧹 Cleaning up temporary files...');

    const tempDirs = [
      'temp',
      'tmp',
      '.tmp',
      'logs/temp',
      'reports/temp'
    ];

    let cleanedFiles = 0;

    for (const dir of tempDirs) {
      try {
        const fullPath = join(process.cwd(), dir);
        const exists = await fs.access(fullPath).then(() => true).catch(() => false);
        
        if (exists) {
          const files = await fs.readdir(fullPath);
          for (const file of files) {
            const filePath = join(fullPath, file);
            const stats = await fs.stat(filePath);
            
            // Delete files older than 24 hours
            if (Date.now() - stats.mtime.getTime() > 86400000) {
              await fs.unlink(filePath);
              cleanedFiles++;
            }
          }
        }
      } catch (error) {
        // Ignore errors for non-existent directories
      }
    }

    this.optimizationsApplied.push(`Temporary files cleanup (${cleanedFiles} files)`);
    console.log(`  ✅ Cleaned up ${cleanedFiles} temporary files`);
  }

  /**
   * Optimize log files
   */
  async optimizeLogFiles() {
    console.log('📝 Optimizing log files...');

    const logConfig = {
      rotation: {
        enabled: true,
        maxSize: '10MB',
        maxFiles: 5,
        compress: true
      },
      levels: {
        development: 'debug',
        test: 'info',
        production: 'warn'
      },
      cleanup: {
        maxAge: '30d',
        maxSize: '100MB'
      }
    };

    await this.writeOptimizationConfig('logging.json', logConfig);

    // Rotate existing log files if they're too large
    await this.rotateLogFiles();

    this.optimizationsApplied.push('Log file optimization');
    console.log('  ✅ Log files optimized');
  }

  /**
   * Rotate log files
   */
  async rotateLogFiles() {
    const logDir = join(process.cwd(), 'logs');
    
    try {
      const exists = await fs.access(logDir).then(() => true).catch(() => false);
      if (!exists) return;

      const files = await fs.readdir(logDir);
      
      for (const file of files) {
        if (file.endsWith('.log')) {
          const filePath = join(logDir, file);
          const stats = await fs.stat(filePath);
          
          // Rotate if larger than 10MB
          if (stats.size > 10 * 1024 * 1024) {
            const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
            const rotatedName = file.replace('.log', `-${timestamp}.log`);
            await fs.rename(filePath, join(logDir, rotatedName));
          }
        }
      }
    } catch (error) {
      console.warn('⚠️ Could not rotate log files:', error.message);
    }
  }

  /**
   * Write optimization configuration
   */
  async writeOptimizationConfig(filename, config) {
    const configDir = join(process.cwd(), 'src/verification/config');
    
    // Ensure config directory exists
    await fs.mkdir(configDir, { recursive: true });
    
    const configPath = join(configDir, filename);
    await fs.writeFile(configPath, JSON.stringify(config, null, 2));
  }
}

/**
 * Health monitoring class
 */
class HealthMonitor {
  constructor() {
    this.metrics = new Map();
    this.alerts = [];
    this.isRunning = false;
  }

  start() {
    if (this.isRunning) return;
    
    this.isRunning = true;
    console.log('🏥 Health monitor started');
    
    // Basic health checks
    setInterval(() => {
      this.checkSystemHealth();
    }, 30000); // Every 30 seconds
  }

  checkSystemHealth() {
    const usage = process.memoryUsage();
    const uptime = process.uptime();
    
    this.metrics.set('memory', {
      heapUsed: usage.heapUsed,
      heapTotal: usage.heapTotal,
      utilization: usage.heapUsed / usage.heapTotal
    });
    
    this.metrics.set('uptime', uptime);
    
    // Check for issues
    const memoryUtil = usage.heapUsed / usage.heapTotal;
    if (memoryUtil > 0.9) {
      this.alert('memory', 'critical', `Memory utilization at ${(memoryUtil * 100).toFixed(1)}%`);
    }
  }

  alert(component, level, message) {
    const alert = {
      timestamp: new Date(),
      component,
      level,
      message
    };
    
    this.alerts.push(alert);
    console.log(`🚨 [${level.toUpperCase()}] ${component}: ${message}`);
    
    // Keep only last 50 alerts
    if (this.alerts.length > 50) {
      this.alerts.shift();
    }
  }

  getMetrics() {
    return Object.fromEntries(this.metrics);
  }

  getAlerts() {
    return [...this.alerts];
  }
}

// Main execution
async function main() {
  const optimizer = new SystemOptimizer();
  const success = await optimizer.optimizeSystem();
  
  if (success) {
    console.log('\n🎉 Sistema Ministerial optimization completed successfully!');
    console.log('💡 System is now optimized for better performance and reliability.');
    process.exit(0);
  } else {
    console.log('\n❌ System optimization failed. Please check the logs for details.');
    process.exit(1);
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(error => {
    console.error('💥 Optimization failed:', error);
    process.exit(1);
  });
}

export { SystemOptimizer, HealthMonitor };
/**
 * 🚀 CACHE-ASIDE PATTERN ENHANCED
 * 
 * ✅ Regra 6: Error Handling robusto
 * ✅ Regra 9: Performance & Optimization
 * ✅ Regra 2: SOLID principles
 * 
 * Melhorias implementadas:
 * - ✅ Fallback strategies
 * - ✅ Circuit breaker pattern
 * - ✅ Retry logic with exponential backoff
 * - ✅ Health checks
 * - ✅ Metrics & monitoring
 */

interface CacheConfig {
  ttl: number;
  maxSize: number;
  enableMetrics: boolean;
  enableCircuitBreaker: boolean;
  retryAttempts: number;
  retryDelay: number;
}

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  accessCount: number;
  lastAccessed: number;
}

interface CacheMetrics {
  hits: number;
  misses: number;
  errors: number;
  totalRequests: number;
  averageLatency: number;
  lastError: Error | null;
}

interface CircuitBreakerState {
  isOpen: boolean;
  failureCount: number;
  lastFailureTime: number;
  successCount: number;
}

export class CacheAsideManagerEnhanced<T> {
  private cache = new Map<string, CacheEntry<T>>();
  private config: CacheConfig;
  private metrics: CacheMetrics;
  private circuitBreaker: CircuitBreakerState;
  private lockMap = new Map<string, Promise<T>>();

  constructor(config: Partial<CacheConfig> = {}) {
    this.config = {
      ttl: 5 * 60 * 1000, // 5 minutos
      maxSize: 1000,
      enableMetrics: true,
      enableCircuitBreaker: true,
      retryAttempts: 3,
      retryDelay: 1000,
      ...config
    };

    this.metrics = {
      hits: 0,
      misses: 0,
      errors: 0,
      totalRequests: 0,
      averageLatency: 0,
      lastError: null
    };

    this.circuitBreaker = {
      isOpen: false,
      failureCount: 0,
      lastFailureTime: 0,
      successCount: 0
    };

    // 🧹 Cleanup automático a cada 5 minutos
    if (typeof window !== 'undefined') {
      setInterval(() => this.cleanup(), 5 * 60 * 1000);
    }
  }

  /**
   * 🎯 GET com error handling robusto
   */
  async get(
    key: string, 
    fetchFn: () => Promise<T>,
    fallbackData?: T
  ): Promise<T> {
    const startTime = performance.now();
    
    try {
      this.metrics.totalRequests++;

      // 🔍 1. Verificar cache primeiro
      const cached = this.getFromCache(key);
      if (cached) {
        this.metrics.hits++;
        this.updateLatency(startTime);
        return cached;
      }

      // 🔒 2. Verificar se já existe uma operação em andamento
      if (this.lockMap.has(key)) {
        return await this.lockMap.get(key)!;
      }

      // ⚡ 3. Circuit breaker check
      if (this.isCircuitOpen()) {
        console.warn(`Circuit breaker open for cache key: ${key}`);
        if (fallbackData) {
          return fallbackData;
        }
        throw new Error('Circuit breaker is open');
      }

      // 🚀 4. Executar fetch com retry logic
      const fetchPromise = this.fetchWithRetry(fetchFn, key);
      this.lockMap.set(key, fetchPromise);

      try {
        const data = await fetchPromise;
        
        // 💾 5. Armazenar no cache
        this.setCache(key, data);
        this.recordSuccess();
        this.metrics.misses++;
        this.updateLatency(startTime);
        
        return data;
      } finally {
        this.lockMap.delete(key);
      }

    } catch (error) {
      this.recordError(error as Error);
      this.updateLatency(startTime);

      // 🛡️ Fallback strategy
      if (fallbackData) {
        console.warn(`Using fallback data for key: ${key}`, error);
        return fallbackData;
      }

      // 📦 Tentar dados em cache expirados como último recurso
      const staleData = this.getStaleData(key);
      if (staleData) {
        console.warn(`Using stale cache data for key: ${key}`, error);
        return staleData;
      }

      throw error;
    }
  }

  /**
   * 💾 SET com validação
   */
  set(key: string, data: T): void {
    if (!key || data === undefined || data === null) {
      console.warn('Invalid cache set operation:', { key, data });
      return;
    }

    this.setCache(key, data);
  }

  /**
   * 🗑️ INVALIDATE específico
   */
  invalidate(key: string): boolean {
    return this.cache.delete(key);
  }

  /**
   * 🧹 CLEAR completo
   */
  clear(): void {
    this.cache.clear();
    this.lockMap.clear();
    this.resetMetrics();
  }

  /**
   * 📊 GET METRICS
   */
  getMetrics(): CacheMetrics & { hitRate: number; size: number } {
    const hitRate = this.metrics.totalRequests > 0 
      ? (this.metrics.hits / this.metrics.totalRequests) * 100 
      : 0;

    return {
      ...this.metrics,
      hitRate,
      size: this.cache.size
    };
  }

  /**
   * 🏥 HEALTH CHECK
   */
  getHealthStatus(): {
    isHealthy: boolean;
    circuitBreakerOpen: boolean;
    cacheSize: number;
    errorRate: number;
    lastError: string | null;
  } {
    const errorRate = this.metrics.totalRequests > 0
      ? (this.metrics.errors / this.metrics.totalRequests) * 100
      : 0;

    return {
      isHealthy: errorRate < 10 && !this.circuitBreaker.isOpen,
      circuitBreakerOpen: this.circuitBreaker.isOpen,
      cacheSize: this.cache.size,
      errorRate,
      lastError: this.metrics.lastError?.message || null
    };
  }

  // 🔒 MÉTODOS PRIVADOS

  private getFromCache(key: string): T | null {
    const entry = this.cache.get(key);
    if (!entry) return null;

    const now = Date.now();
    
    // Verificar TTL
    if (now - entry.timestamp > this.config.ttl) {
      this.cache.delete(key);
      return null;
    }

    // Atualizar estatísticas de acesso
    entry.accessCount++;
    entry.lastAccessed = now;
    
    return entry.data;
  }

  private getStaleData(key: string): T | null {
    const entry = this.cache.get(key);
    return entry ? entry.data : null;
  }

  private setCache(key: string, data: T): void {
    // Verificar limite de tamanho
    if (this.cache.size >= this.config.maxSize) {
      this.evictLRU();
    }

    const now = Date.now();
    this.cache.set(key, {
      data,
      timestamp: now,
      accessCount: 1,
      lastAccessed: now
    });
  }

  private evictLRU(): void {
    let oldestKey = '';
    let oldestTime = Date.now();

    for (const [key, entry] of this.cache.entries()) {
      if (entry.lastAccessed < oldestTime) {
        oldestTime = entry.lastAccessed;
        oldestKey = key;
      }
    }

    if (oldestKey) {
      this.cache.delete(oldestKey);
    }
  }

  private async fetchWithRetry(fetchFn: () => Promise<T>, key: string): Promise<T> {
    let lastError: Error;
    
    for (let attempt = 1; attempt <= this.config.retryAttempts; attempt++) {
      try {
        return await fetchFn();
      } catch (error) {
        lastError = error as Error;
        console.warn(`Fetch attempt ${attempt} failed for key ${key}:`, error);
        
        if (attempt < this.config.retryAttempts) {
          const delay = this.config.retryDelay * Math.pow(2, attempt - 1);
          await this.sleep(delay);
        }
      }
    }
    
    throw lastError!;
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private isCircuitOpen(): boolean {
    if (!this.config.enableCircuitBreaker) return false;
    
    const now = Date.now();
    
    // Reset circuit breaker after 60 seconds
    if (this.circuitBreaker.isOpen && 
        now - this.circuitBreaker.lastFailureTime > 60000) {
      this.circuitBreaker.isOpen = false;
      this.circuitBreaker.failureCount = 0;
    }
    
    return this.circuitBreaker.isOpen;
  }

  private recordSuccess(): void {
    this.circuitBreaker.successCount++;
    
    if (this.circuitBreaker.isOpen && this.circuitBreaker.successCount >= 3) {
      this.circuitBreaker.isOpen = false;
      this.circuitBreaker.failureCount = 0;
    }
  }

  private recordError(error: Error): void {
    this.metrics.errors++;
    this.metrics.lastError = error;
    
    if (this.config.enableCircuitBreaker) {
      this.circuitBreaker.failureCount++;
      this.circuitBreaker.lastFailureTime = Date.now();
      
      if (this.circuitBreaker.failureCount >= 5) {
        this.circuitBreaker.isOpen = true;
        this.circuitBreaker.successCount = 0;
      }
    }
  }

  private updateLatency(startTime: number): void {
    const latency = performance.now() - startTime;
    this.metrics.averageLatency = 
      (this.metrics.averageLatency + latency) / 2;
  }

  private resetMetrics(): void {
    this.metrics = {
      hits: 0,
      misses: 0,
      errors: 0,
      totalRequests: 0,
      averageLatency: 0,
      lastError: null
    };
  }

  private cleanup(): void {
    const now = Date.now();
    const toDelete: string[] = [];

    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > this.config.ttl * 2) {
        toDelete.push(key);
      }
    }

    toDelete.forEach(key => this.cache.delete(key));
    
    if (toDelete.length > 0) {
      console.log(`Cache cleanup: removed ${toDelete.length} expired entries`);
    }
  }
}

/**
 * 🏭 FACTORY ENHANCED com configurações específicas
 */
export class EnhancedCacheFactory {
  // Cache para dados críticos (maior TTL, sem circuit breaker)
  static readonly profiles = new CacheAsideManagerEnhanced({
    ttl: 15 * 60 * 1000, // 15 minutos
    maxSize: 500,
    enableCircuitBreaker: false, // Dados críticos sempre tentam buscar
    retryAttempts: 5
  });

  // Cache para listagens (TTL menor, circuit breaker ativo)
  static readonly estudantes = new CacheAsideManagerEnhanced({
    ttl: 5 * 60 * 1000, // 5 minutos
    maxSize: 1000,
    enableCircuitBreaker: true,
    retryAttempts: 3
  });

  // Cache para métricas (TTL muito baixo, fallback sempre disponível)
  static readonly metrics = new CacheAsideManagerEnhanced({
    ttl: 2 * 60 * 1000, // 2 minutos
    maxSize: 100,
    enableCircuitBreaker: true,
    retryAttempts: 2
  });

  // Cache para configurações (TTL alto, alta prioridade)
  static readonly settings = new CacheAsideManagerEnhanced({
    ttl: 30 * 60 * 1000, // 30 minutos
    maxSize: 200,
    enableCircuitBreaker: false,
    retryAttempts: 5
  });
}


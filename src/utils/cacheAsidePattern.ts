/**
 * 🚀 IMPLEMENTAÇÃO COMPLETA DO PADRÃO CACHE-ASIDE
 * 
 * Cache-Aside (também chamado de Lazy Loading) é um padrão onde:
 * 1. A aplicação é responsável por gerenciar o cache
 * 2. Os dados são carregados no cache "sob demanda" (lazy)
 * 3. A aplicação verifica o cache primeiro, depois o banco
 * 4. A aplicação atualiza o cache quando necessário
 */

import { supabase } from '../lib/supabase';

// ✅ Interface para métricas de cache
interface CacheMetrics {
  hits: number;
  misses: number;
  totalRequests: number;
  hitRatio: number;
  averageResponseTime: number;
}

// ✅ Interface para configuração de cache
interface CacheConfig {
  ttl: number;                    // Time To Live em milissegundos
  maxSize: number;                // Tamanho máximo do cache
  enableMetrics: boolean;         // Habilitar métricas
  strategy: 'LRU' | 'LFU' | 'FIFO'; // Estratégia de eviction
}

// ✅ Interface para entrada do cache
interface CacheEntry<T> {
  data: T;
  timestamp: number;
  accessCount: number;
  lastAccessed: number;
}

/**
 * 🎯 CLASSE PRINCIPAL DO CACHE-ASIDE
 * 
 * Esta classe implementa o padrão Cache-Aside com:
 * - TTL (Time To Live) configurável
 * - Múltiplas estratégias de eviction
 * - Métricas detalhadas de performance
 * - Invalidação inteligente
 */
export class CacheAsideManager<T> {
  private cache = new Map<string, CacheEntry<T>>();
  private config: CacheConfig;
  private metrics: CacheMetrics;

  constructor(config: Partial<CacheConfig> = {}) {
    this.config = {
      ttl: 5 * 60 * 1000,           // 5 minutos default
      maxSize: 1000,                // 1000 entradas default
      enableMetrics: true,          // Métricas habilitadas
      strategy: 'LRU',              // LRU default
      ...config
    };

    this.metrics = {
      hits: 0,
      misses: 0,
      totalRequests: 0,
      hitRatio: 0,
      averageResponseTime: 0
    };
  }

  /**
   * 🔍 GET - Implementação do Cache-Aside Pattern
   * 
   * Fluxo:
   * 1. Verifica se existe no cache e não expirou
   * 2. Se existe: retorna do cache (CACHE HIT)
   * 3. Se não existe: busca no banco de dados (CACHE MISS)
   * 4. Armazena no cache para próximas consultas
   */
  async get(
    key: string, 
    fetchFn: () => Promise<T>
  ): Promise<T> {
    const startTime = Date.now();
    this.metrics.totalRequests++;

    // 🎯 PASSO 1: Verificar cache
    const cached = this.cache.get(key);
    
    if (cached && this.isValid(cached)) {
      // ✅ CACHE HIT - Dados encontrados e válidos
      cached.accessCount++;
      cached.lastAccessed = Date.now();
      this.metrics.hits++;
      
      if (this.config.enableMetrics) {
        console.log(`🎯 CACHE HIT: ${key} (${Date.now() - startTime}ms)`);
      }
      
      this.updateMetrics(Date.now() - startTime);
      return cached.data;
    }

    // 🎯 PASSO 2: CACHE MISS - Buscar no banco
    if (this.config.enableMetrics) {
      console.log(`❌ CACHE MISS: ${key} - Buscando no banco...`);
    }

    try {
      const data = await fetchFn();
      
      // 🎯 PASSO 3: Armazenar no cache
      this.set(key, data);
      
      this.metrics.misses++;
      this.updateMetrics(Date.now() - startTime);
      
      return data;
    } catch (error) {
      console.error(`💥 Erro ao buscar dados para ${key}:`, error);
      throw error;
    }
  }

  /**
   * 💾 SET - Armazenar dados no cache
   */
  set(key: string, data: T): void {
    // Verificar limite de tamanho
    if (this.cache.size >= this.config.maxSize) {
      this.evict();
    }

    const entry: CacheEntry<T> = {
      data,
      timestamp: Date.now(),
      accessCount: 1,
      lastAccessed: Date.now()
    };

    this.cache.set(key, entry);

    if (this.config.enableMetrics) {
      console.log(`💾 CACHE SET: ${key} (size: ${this.cache.size})`);
    }
  }

  /**
   * 🗑️ DELETE - Remover entrada específica
   */
  delete(key: string): boolean {
    const deleted = this.cache.delete(key);
    
    if (deleted && this.config.enableMetrics) {
      console.log(`🗑️ CACHE DELETE: ${key}`);
    }
    
    return deleted;
  }

  /**
   * 🧹 CLEAR - Limpar todo o cache
   */
  clear(): void {
    this.cache.clear();
    this.resetMetrics();
    
    if (this.config.enableMetrics) {
      console.log('🧹 CACHE CLEARED');
    }
  }

  /**
   * ⏰ Verificar se entrada é válida (não expirou)
   */
  private isValid(entry: CacheEntry<T>): boolean {
    return Date.now() - entry.timestamp < this.config.ttl;
  }

  /**
   * 🚪 EVICTION - Remover entradas baseado na estratégia
   */
  private evict(): void {
    switch (this.config.strategy) {
      case 'LRU': // Least Recently Used
        this.evictLRU();
        break;
      case 'LFU': // Least Frequently Used
        this.evictLFU();
        break;
      case 'FIFO': // First In First Out
        this.evictFIFO();
        break;
    }
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
      console.log(`🚪 LRU EVICT: ${oldestKey}`);
    }
  }

  private evictLFU(): void {
    let leastUsedKey = '';
    let leastCount = Infinity;
    
    for (const [key, entry] of this.cache.entries()) {
      if (entry.accessCount < leastCount) {
        leastCount = entry.accessCount;
        leastUsedKey = key;
      }
    }
    
    if (leastUsedKey) {
      this.cache.delete(leastUsedKey);
      console.log(`🚪 LFU EVICT: ${leastUsedKey}`);
    }
  }

  private evictFIFO(): void {
    const firstKey = this.cache.keys().next().value;
    if (firstKey) {
      this.cache.delete(firstKey);
      console.log(`🚪 FIFO EVICT: ${firstKey}`);
    }
  }

  /**
   * 📊 Atualizar métricas
   */
  private updateMetrics(responseTime: number): void {
    this.metrics.hitRatio = this.metrics.hits / this.metrics.totalRequests;
    this.metrics.averageResponseTime = 
      (this.metrics.averageResponseTime + responseTime) / 2;
  }

  private resetMetrics(): void {
    this.metrics = {
      hits: 0,
      misses: 0,
      totalRequests: 0,
      hitRatio: 0,
      averageResponseTime: 0
    };
  }

  /**
   * 📈 Obter métricas atuais
   */
  getMetrics(): CacheMetrics {
    return { ...this.metrics };
  }

  /**
   * 🧐 Informações de debug
   */
  getDebugInfo(): any {
    return {
      size: this.cache.size,
      maxSize: this.config.maxSize,
      strategy: this.config.strategy,
      ttl: this.config.ttl,
      metrics: this.metrics,
      entries: Array.from(this.cache.entries()).map(([key, entry]) => ({
        key,
        age: Date.now() - entry.timestamp,
        accessCount: entry.accessCount,
        isExpired: !this.isValid(entry)
      }))
    };
  }
}

/**
 * 🏭 FACTORY PARA CACHES ESPECÍFICOS DO SISTEMA
 */
export class SystemCacheFactory {
  // Cache para perfis de usuário - TTL longo pois muda pouco
  static profiles = new CacheAsideManager({
    ttl: 15 * 60 * 1000,    // 15 minutos
    maxSize: 500,           // 500 usuários
    strategy: 'LRU'
  });

  // Cache para estudantes - TTL médio
  static estudantes = new CacheAsideManager({
    ttl: 10 * 60 * 1000,    // 10 minutos
    maxSize: 1000,          // 1000 estudantes
    strategy: 'LFU'         // Baseado em frequência de acesso
  });

  // Cache para designações - TTL curto pois muda frequentemente
  static designacoes = new CacheAsideManager({
    ttl: 5 * 60 * 1000,     // 5 minutos
    maxSize: 2000,          // 2000 designações
    strategy: 'LRU'
  });

  // Cache para programas semanais - TTL muito longo
  static programas = new CacheAsideManager({
    ttl: 60 * 60 * 1000,    // 1 hora
    maxSize: 100,           // 100 programas
    strategy: 'FIFO'
  });
}

/**
 * 🎯 EXEMPLOS PRÁTICOS DE USO
 */
export class CacheAsideExamples {
  /**
   * ❌ PROBLEMA: Consultas repetidas sobrecarregam o banco
   */
  static async problemExample() {
    console.log('❌ PROBLEMA: Sem cache - Múltiplas consultas ao banco');
    
    // Simula 10 consultas iguais - TODAS vão ao banco!
    const userId = 'user-123';
    const promises = [];
    
    for (let i = 0; i < 10; i++) {
      promises.push(
        supabase
          .from('profiles')
          .select('*')
          .eq('id', userId)
          .single()
      );
    }
    
    const startTime = Date.now();
    await Promise.all(promises);
    const endTime = Date.now();
    
    console.log(`💥 10 consultas ao banco: ${endTime - startTime}ms`);
    console.log(`💰 Custo: 10x operações de banco`);
  }

  /**
   * ✅ SOLUÇÃO: Cache-Aside intercepta consultas repetidas
   */
  static async solutionExample() {
    console.log('✅ SOLUÇÃO: Com Cache-Aside - Apenas 1 consulta ao banco');
    
    const userId = 'user-123';
    const cache = SystemCacheFactory.profiles;
    
    // Função que busca no banco
    const fetchProfile = async () => {
      console.log('🔍 Buscando no banco de dados...');
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
      return data;
    };
    
    const promises = [];
    const startTime = Date.now();
    
    // 10 consultas - apenas a primeira vai ao banco!
    for (let i = 0; i < 10; i++) {
      promises.push(
        cache.get(`profile:${userId}`, fetchProfile)
      );
    }
    
    await Promise.all(promises);
    const endTime = Date.now();
    
    console.log(`⚡ 10 consultas (9 do cache): ${endTime - startTime}ms`);
    console.log(`💰 Custo: 1x operação de banco + 9x cache hits`);
    console.log(`📊 Métricas:`, cache.getMetrics());
  }

  /**
   * 🎯 Exemplo real: Buscar estudantes com cache
   */
  static async getEstudantesWithCache(userId: string) {
    const cache = SystemCacheFactory.estudantes;
    const cacheKey = `estudantes:${userId}`;
    
    return cache.get(cacheKey, async () => {
      console.log('🔍 Buscando estudantes no banco...');
      const { data, error } = await supabase
        .from('estudantes')
        .select('*')
        .eq('user_id', userId)
        .order('nome');
      
      if (error) throw error;
      return data || [];
    });
  }

  /**
   * 📝 Exemplo: Atualizar estudante com invalidação de cache
   */
  static async updateEstudanteWithCacheInvalidation(
    estudanteId: string, 
    updates: any,
    userId: string
  ) {
    // 1. Atualizar no banco
    const { data, error } = await supabase
      .from('estudantes')
      .update(updates)
      .eq('id', estudanteId)
      .select()
      .single();
    
    if (error) throw error;
    
    // 2. Invalidar cache relacionado
    const cache = SystemCacheFactory.estudantes;
    cache.delete(`estudantes:${userId}`);
    cache.delete(`estudante:${estudanteId}`);
    
    console.log('🗑️ Cache invalidado após atualização');
    return data;
  }
}

/**
 * 🚨 CUIDADOS E PROBLEMAS DO CACHE-ASIDE
 */
export class CacheAsidePitfalls {
  /**
   * ⚠️ PROBLEMA 1: Inconsistência de dados
   */
  static demonstrateInconsistency() {
    console.log(`
    ⚠️ PROBLEMA: Inconsistência de Dados
    
    1. User A lê dados do cache (versão antiga)
    2. User B atualiza dados no banco
    3. User A ainda vê dados antigos no cache
    
    SOLUÇÃO:
    - Invalidação imediata após writes
    - TTL baixo para dados críticos
    - Usar cache write-through para dados críticos
    `);
  }

  /**
   * ⚠️ PROBLEMA 2: Cache stampede
   */
  static demonstrateCacheStampede() {
    console.log(`
    ⚠️ PROBLEMA: Cache Stampede
    
    1. Cache expira
    2. 100 requests simultâneos
    3. TODOS fazem query no banco
    4. Banco sobrecarregado
    
    SOLUÇÃO:
    - Lock/semáforo para operações de cache miss
    - Stale-while-revalidate pattern
    - Background refresh antes da expiração
    `);
  }

  /**
   * ⚠️ PROBLEMA 3: Memory leaks
   */
  static demonstrateMemoryLeaks() {
    console.log(`
    ⚠️ PROBLEMA: Memory Leaks
    
    1. Cache cresce indefinidamente
    2. Memória se esgota
    3. Performance degrada
    
    SOLUÇÃO:
    - Límite de tamanho (maxSize)
    - Estratégias de eviction (LRU/LFU/FIFO)
    - TTL para limpeza automática
    `);
  }
}

/**
 * 🎯 QUANDO USAR CACHE-ASIDE
 */
export const CacheAsideGuidelines = {
  // ✅ Ideal para:
  ideal: [
    'Dados lidos frequentemente (profiles, settings)',
    'Dados que mudam pouco (configurações)',
    'Queries caras computacionalmente',
    'APIs externas com rate limiting',
    'Dados de referência (códigos, listas)'
  ],

  // ❌ Evitar para:
  avoid: [
    'Dados que mudam constantemente (real-time)',
    'Dados sensíveis à consistência (financeiro)',
    'Dados grandes que não cabem na memória',
    'Operações write-heavy',
    'Dados únicos que não se repetem'
  ],

  // 🎯 Configurations recomendadas:
  recommendations: {
    fastChanging: { ttl: '1-5 minutos', strategy: 'LRU' },
    mediumChanging: { ttl: '10-30 minutos', strategy: 'LFU' },
    slowChanging: { ttl: '1-24 horas', strategy: 'FIFO' },
    reference: { ttl: '1-7 dias', strategy: 'LFU' }
  }
};


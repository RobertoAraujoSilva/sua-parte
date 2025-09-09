import { useState, useCallback, useEffect } from 'react';
import { EnhancedCacheFactory } from '@/utils/cacheAsidePatternEnhanced';
import { supabase } from '@/lib/supabase';

/**
 * 🎯 ENHANCED CACHE-ASIDE HOOK para Estudantes
 * 
 * ✅ Regra 6: Error handling completo com fallbacks
 * ✅ Regra 9: Performance otimizada com cache inteligente
 * ✅ Regra 8: Hook ≤150 linhas
 * 
 * Demonstra o poder do Cache-Aside Pattern Enhanced:
 * - ✅ Circuit breaker para falhas sucessivas
 * - ✅ Retry logic com exponential backoff
 * - ✅ Fallback data automático
 * - ✅ Métricas de performance em tempo real
 * - ✅ Health monitoring integrado
 */

interface Estudante {
  id: string;
  nome: string;
  sobrenome: string;
  congregacao_id?: string;
  ativo: boolean;
  created_at: string;
}

interface UseEstudantesEnhancedReturn {
  // Data
  estudantes: Estudante[];
  
  // States
  isLoading: boolean;
  error: string | null;
  isFromCache: boolean;
  
  // Actions
  fetchEstudantes: () => Promise<void>;
  refetch: () => Promise<void>;
  clearCache: () => void;
  
  // Cache Analytics
  cacheMetrics: any;
  healthStatus: any;
}

const fallbackEstudantes: Estudante[] = [
  {
    id: 'fallback-1',
    nome: 'João',
    sobrenome: 'Silva',
    ativo: true,
    created_at: new Date().toISOString()
  },
  {
    id: 'fallback-2', 
    nome: 'Maria',
    sobrenome: 'Santos',
    ativo: true,
    created_at: new Date().toISOString()
  }
];

export function useCacheAsideEstudantesEnhanced(): UseEstudantesEnhancedReturn {
  const [estudantes, setEstudantes] = useState<Estudante[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isFromCache, setIsFromCache] = useState(false);

  const cacheKey = 'estudantes-enhanced';

  // 🚀 Fetch function com Cache-Aside Enhanced
  const fetchEstudantes = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const startTime = performance.now();

      // 🎯 Cache-Aside Enhanced com fallback automático
      const data = await EnhancedCacheFactory.estudantes.get(
        cacheKey,
        async () => {
          console.log('🔄 Fetching estudantes from database...');
          
          const { data, error } = await supabase
            .from('estudantes')
            .select('*')
            .eq('ativo', true)
            .order('nome', { ascending: true });

          if (error) {
            console.error('Database error:', error);
            throw new Error(`Database error: ${error.message}`);
          }

          return data || [];
        },
        fallbackEstudantes // 🛡️ Fallback data sempre disponível
      );

      const endTime = performance.now();
      const latency = endTime - startTime;

      console.log(`✅ Estudantes loaded in ${latency.toFixed(0)}ms`);
      
      setEstudantes(data);
      setIsFromCache(latency < 50); // Se muito rápido, provavelmente veio do cache
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao carregar estudantes';
      setError(errorMessage);
      
      // 🛡️ Usar fallback em caso de erro
      setEstudantes(fallbackEstudantes);
      setIsFromCache(false);
      
      console.error('Error loading estudantes:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // 🔄 Refetch (força busca no banco)
  const refetch = useCallback(async () => {
    // Invalidar cache antes de buscar
    EnhancedCacheFactory.estudantes.invalidate(cacheKey);
    await fetchEstudantes();
  }, [fetchEstudantes]);

  // 🧹 Clear cache
  const clearCache = useCallback(() => {
    EnhancedCacheFactory.estudantes.clear();
    setEstudantes([]);
    setError(null);
    setIsFromCache(false);
  }, []);

  // 📊 Get cache metrics
  const cacheMetrics = EnhancedCacheFactory.estudantes.getMetrics();
  const healthStatus = EnhancedCacheFactory.estudantes.getHealthStatus();

  // 🚀 Auto-fetch on mount
  useEffect(() => {
    fetchEstudantes();
  }, [fetchEstudantes]);

  return {
    // Data
    estudantes,
    
    // States
    isLoading,
    error,
    isFromCache,
    
    // Actions
    fetchEstudantes,
    refetch,
    clearCache,
    
    // Analytics
    cacheMetrics,
    healthStatus
  };
}


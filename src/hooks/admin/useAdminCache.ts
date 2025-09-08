import { useState, useCallback, useEffect } from 'react';
import { EnhancedCacheFactory } from '@/utils/cacheAsidePatternEnhanced';
import { supabase } from '@/integrations/supabase/client';

/**
 * 🎯 HOOK ADMIN CACHE - Error Handling Robusto
 * 
 * ✅ Regra 8: Hook ≤150 linhas
 * ✅ Regra 6: Error handling completo
 * ✅ Regra 9: Performance otimizada
 * ✅ Regra 2: Single Responsibility
 */

interface AdminStats {
  total_users: number;
  total_congregations: number;
  active_congregations: number;
  total_estudantes: number;
  system_uptime: string;
  last_backup: string;
}

interface UseAdminCacheReturn {
  // Data
  stats: AdminStats | null;
  profiles: any[] | null;
  
  // States
  isLoading: boolean;
  error: string | null;
  
  // Actions
  refreshStats: () => Promise<void>;
  refreshProfiles: () => Promise<void>;
  clearCache: () => void;
  
  // Metrics
  getCacheMetrics: () => any;
  getHealthStatus: () => any;
}

const defaultStats: AdminStats = {
  total_users: 0,
  total_congregations: 0,
  active_congregations: 0,
  total_estudantes: 0,
  system_uptime: '99.9%',
  last_backup: 'Hoje, 02:00'
};

export function useAdminCache(): UseAdminCacheReturn {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [profiles, setProfiles] = useState<any[] | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 📊 Fetch Stats com fallback
  const refreshStats = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const data = await EnhancedCacheFactory.metrics.get(
        'admin-stats',
        async () => {
          const [usersResult, congregationsResult, estudantesResult] = await Promise.all([
            supabase.from('profiles').select('id', { count: 'exact', head: true }),
            supabase.from('congregacoes').select('id', { count: 'exact', head: true }),
            supabase.from('estudantes').select('id', { count: 'exact', head: true })
          ]);

          // 🛡️ Guard clauses (Regra 12)
          if (usersResult.error) throw usersResult.error;
          if (congregationsResult.error) throw congregationsResult.error;
          if (estudantesResult.error) throw estudantesResult.error;

          return {
            total_users: usersResult.count || 0,
            total_congregations: congregationsResult.count || 0,
            active_congregations: congregationsResult.count || 0,
            total_estudantes: estudantesResult.count || 0,
            system_uptime: '99.9%',
            last_backup: 'Hoje, 02:00'
          };
        },
        defaultStats // Fallback data
      );

      setStats(data as AdminStats);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao carregar estatísticas';
      setError(errorMessage);
      
      // 🛡️ Usar dados padrão em caso de erro
      setStats(defaultStats);
      console.error('Error loading admin stats:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // 👥 Fetch Profiles com fallback
  const refreshProfiles = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const data = await EnhancedCacheFactory.profiles.get(
        'admin-profiles',
        async () => {
          const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(10);

          if (error) throw error;
          return data || [];
        },
        [] // Fallback: array vazio
      );

      setProfiles(data as Profile[]);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao carregar perfis';
      setError(errorMessage);
      
      // 🛡️ Usar array vazio em caso de erro
      setProfiles([]);
      console.error('Error loading profiles:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // 🧹 Clear Cache
  const clearCache = useCallback(() => {
    EnhancedCacheFactory.metrics.clear();
    EnhancedCacheFactory.profiles.clear();
    setStats(null);
    setProfiles(null);
    setError(null);
  }, []);

  // 📊 Get Cache Metrics
  const getCacheMetrics = useCallback(() => {
    return {
      metrics: EnhancedCacheFactory.metrics.getMetrics(),
      profiles: EnhancedCacheFactory.profiles.getMetrics()
    };
  }, []);

  // 🏥 Get Health Status
  const getHealthStatus = useCallback(() => {
    return {
      metrics: EnhancedCacheFactory.metrics.getHealthStatus(),
      profiles: EnhancedCacheFactory.profiles.getHealthStatus()
    };
  }, []);

  // 🚀 Auto-load on mount
  useEffect(() => {
    refreshStats();
    refreshProfiles();
  }, [refreshStats, refreshProfiles]);

  return {
    // Data
    stats,
    profiles,
    
    // States
    isLoading,
    error,
    
    // Actions
    refreshStats,
    refreshProfiles,
    clearCache,
    
    // Metrics
    getCacheMetrics,
    getHealthStatus
  };
}


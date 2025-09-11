import { useState, useEffect, useCallback } from 'react';
import supabase from '@/integrations/supabase/client';

const API_BASE_URL = '/api';

interface SystemStatus {
  status: string;
  timestamp: string;
  version: string;
  services: {
    jwDownloader: string;
    programGenerator: string;
    materialManager: string;
    notificationService: string;
  };
}

interface AdminStats {
  total_congregations: number;
  total_instructors: number;
  total_students: number;
  total_programs: number;
  total_assignments: number;
}

interface Material {
  name: string;
  size: number;
  lastModified: string;
  type: string;
  language: string;
}

export function useBackendApi() {
  const [isConnected, setIsConnected] = useState(false);
  const [systemStatus, setSystemStatus] = useState<SystemStatus | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getAuthHeader = useCallback(async () => {
    const { data } = await supabase.auth.getSession();
    const token = data.session?.access_token;
    return token ? { Authorization: `Bearer ${token}` } : {};
  }, []);

  const checkConnection = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`${API_BASE_URL}/status`);
      if (!response.ok) throw new Error(`Status ${response.status}`);
      const status = await response.json();
      setSystemStatus(status);
      setIsConnected(true);
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro de conexão');
      setIsConnected(false);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const checkUpdates = useCallback(async () => {
    try {
      setLoading(true);
      const headers = await getAuthHeader();
      const response = await fetch(`${API_BASE_URL}/admin/check-updates`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...headers }
      });
      if (!response.ok) throw new Error(`Status ${response.status}`);
      const result = await response.json();
      return result;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao verificar atualizações');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const getMaterials = useCallback(async (): Promise<Material[]> => {
    try {
      const headers = await getAuthHeader();
      const response = await fetch(`${API_BASE_URL}/admin/materials`, { headers });
      if (!response.ok) throw new Error(`Status ${response.status}`);
      const json = await response.json();
      return json.materials || [];
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao buscar materiais');
      return [];
    }
  }, [getAuthHeader]);

  const getAdminStats = useCallback(async (): Promise<AdminStats | null> => {
    try {
      const headers = await getAuthHeader();
      // Reaproveita status como base para estatísticas enquanto não há endpoint dedicado
      const response = await fetch(`${API_BASE_URL}/admin/status`, { headers });
      if (!response.ok) throw new Error(`Status ${response.status}`);
      const status = await response.json();
      return {
        total_congregations: status?.storage?.total_congregations ?? 0,
        total_instructors: status?.storage?.total_instructors ?? 0,
        total_students: status?.storage?.total_students ?? 0,
        total_programs: status?.storage?.total_programs ?? 0,
        total_assignments: status?.storage?.total_assignments ?? 0,
      } as AdminStats;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao buscar estatísticas');
      return null;
    }
  }, [getAuthHeader]);

  // Auto-check connection on mount
  useEffect(() => {
    checkConnection();
  }, [checkConnection]);

  return {
    isConnected,
    systemStatus,
    loading,
    error,
    checkConnection,
    checkUpdates,
    getMaterials,
    getAdminStats,
  };
}
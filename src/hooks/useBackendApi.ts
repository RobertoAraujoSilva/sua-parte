import { useState, useEffect, useCallback } from 'react';

const API_BASE_URL = 'http://localhost:3001/api';

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
      const response = await fetch(`${API_BASE_URL}/admin/check-updates`, {
        method: 'POST',
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
      const response = await fetch(`${API_BASE_URL}/materials`);
      if (!response.ok) throw new Error(`Status ${response.status}`);
      const materials = await response.json();
      return materials;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao buscar materiais');
      return [];
    }
  }, []);

  const getAdminStats = useCallback(async (): Promise<AdminStats | null> => {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/stats`);
      if (!response.ok) throw new Error(`Status ${response.status}`);
      const stats = await response.json();
      return stats;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao buscar estatísticas');
      return null;
    }
  }, []);

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
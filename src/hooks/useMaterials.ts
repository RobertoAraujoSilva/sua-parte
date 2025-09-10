import { useState, useCallback } from 'react';
import { supabase } from '../integrations/supabase/client';

const BACKEND_URL = 'http://localhost:3001';

export interface Material {
  filename: string;
  size: number;
  sizeFormatted: string;
  modifiedAt: string;
  path: string;
}

interface UseMaterials {
  materials: Material[];
  isLoading: boolean;
  error: string | null;
  listMaterials: () => Promise<void>;
  syncAllMaterials: () => Promise<void>;
}

export const useMaterials = (): UseMaterials => {
  const [materials, setMaterials] = useState<Material[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getAuthToken = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    return session?.access_token;
  };

  const listMaterials = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const token = await getAuthToken();
      if (!token) throw new Error('Not authenticated');

      const response = await fetch(`${BACKEND_URL}/api/materials`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch materials: ${response.statusText}`);
      }

      const data = await response.json();
      setMaterials(data.materials);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
      console.error('Error listing materials:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const syncAllMaterials = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const token = await getAuthToken();
      if (!token) throw new Error('Not authenticated');

      const response = await fetch(`${BACKEND_URL}/api/materials/sync-all`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to sync materials: ${response.statusText}`);
      }

      // After syncing, refresh the list of materials
      await listMaterials();
      alert('Sincronização de materiais concluída!');

    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
      console.error('Error syncing materials:', err);
      alert(`Erro ao sincronizar materiais: ${err instanceof Error ? err.message : 'Erro desconhecido'}`);
    } finally {
      setIsLoading(false);
    }
  }, [listMaterials]);

  return {
    materials,
    isLoading,
    error,
    listMaterials,
    syncAllMaterials
  };
};

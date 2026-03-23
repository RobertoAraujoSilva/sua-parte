import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

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

const formatSize = (bytes: number): string => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

export const useMaterials = (): UseMaterials => {
  const [materials, setMaterials] = useState<Material[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const listMaterials = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const { data, error: storageError } = await supabase.storage
        .from('programas')
        .list('', { limit: 100 });

      if (storageError) throw storageError;

      const mapped: Material[] = (data || []).map(file => ({
        filename: file.name,
        size: file.metadata?.size || 0,
        sizeFormatted: formatSize(file.metadata?.size || 0),
        modifiedAt: file.updated_at || file.created_at || '',
        path: file.name,
      }));

      setMaterials(mapped);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar materiais');
      console.error('Error listing materials:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const syncAllMaterials = useCallback(async () => {
    // In production, materials are managed via storage bucket directly
    // No backend sync needed
    await listMaterials();
  }, [listMaterials]);

  return { materials, isLoading, error, listMaterials, syncAllMaterials };
};

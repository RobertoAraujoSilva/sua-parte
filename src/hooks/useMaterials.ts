import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';

export interface Material {
  filename: string;
  size: number;
  sizeFormatted: string;
  modifiedAt: string;
  path: string;
  signedUrl?: string;
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
  const { user } = useAuth();
  const [materials, setMaterials] = useState<Material[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const listMaterials = useCallback(async () => {
    if (!user) return;
    setIsLoading(true);
    setError(null);
    try {
      // List files inside the user's own folder
      const userFolder = user.id;
      const { data, error: storageError } = await supabase.storage
        .from('programas')
        .list(userFolder, { limit: 100 });

      if (storageError) throw storageError;

      const files = data || [];
      const mapped: Material[] = [];

      for (const file of files) {
        const filePath = `${userFolder}/${file.name}`;
        // Generate a signed URL (valid for 1 hour)
        const { data: urlData } = await supabase.storage
          .from('programas')
          .createSignedUrl(filePath, 3600);

        mapped.push({
          filename: file.name,
          size: file.metadata?.size || 0,
          sizeFormatted: formatSize(file.metadata?.size || 0),
          modifiedAt: file.updated_at || file.created_at || '',
          path: filePath,
          signedUrl: urlData?.signedUrl,
        });
      }

      setMaterials(mapped);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar materiais');
      console.error('Error listing materials:', err);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  const syncAllMaterials = useCallback(async () => {
    await listMaterials();
  }, [listMaterials]);

  return { materials, isLoading, error, listMaterials, syncAllMaterials };
};

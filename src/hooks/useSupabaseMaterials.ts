import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface MaterialFile {
  name: string;
  size: number;
  url: string;
  type: 'PDF' | 'JWPub' | 'RTF';
  language: string;
  downloadDate: string;
}

export const useSupabaseMaterials = () => {
  const [materials, setMaterials] = useState<MaterialFile[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadMaterials = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase.storage
        .from('data')
        .list('', { limit: 100 });

      if (error) throw error;

      const transformedMaterials: MaterialFile[] = (data || [])
        .filter(file => file.name.includes('mwb_') || file.name.includes('S-38'))
        .map(file => {
          const extension = file.name.split('.').pop()?.toLowerCase();
          let type: 'PDF' | 'JWPub' | 'RTF' = 'PDF';
          
          if (extension === 'jwpub') type = 'JWPub';
          else if (extension === 'rtf') type = 'RTF';
          
          const language = file.name.includes('_E_') ? 'en' : 'pt-BR';
          
          const { data: { publicUrl } } = supabase.storage
            .from('data')
            .getPublicUrl(file.name);

          return {
            name: file.name,
            size: file.metadata?.size || 0,
            url: publicUrl,
            type,
            language,
            downloadDate: file.updated_at || file.created_at || ''
          };
        });

      setMaterials(transformedMaterials);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar materiais');
    } finally {
      setLoading(false);
    }
  }, []);

  return { materials, loading, error, loadMaterials };
};
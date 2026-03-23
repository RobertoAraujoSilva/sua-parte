import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

// Tipos para PDF e programação
export interface PDFFile {
  fileName: string;
  filePath: string;
  size: number;
  lastModified: Date | string;
  language: 'pt' | 'en';
  year: number;
  month: number;
  isValid: boolean;
  reason?: string;
  dateCode?: string;
}

export interface PartDetails {
  title: string;
  type: string;
  duration: number;
  requirements: Record<string, boolean>;
  notes: string;
  order: number;
}

export interface WeekStructure {
  weekNumber: number;
  startDate: string;
  endDate: string;
  bibleReading: string;
  sections: {
    name: string;
    parts: PartDetails[];
  }[];
}

export interface ProgrammingData {
  id?: string;
  fileName: string;
  language: string;
  year: number;
  month: number;
  weeks: WeekStructure[];
  extractedAt: string;
  status?: string;
}

export interface LoadingState {
  scanning: boolean;
  parsing: boolean;
  saving: boolean;
}

/**
 * Hook para gerenciar PDFs de programação via Supabase Storage
 */
export function usePDFProgramming() {
  const [availablePDFs, setAvailablePDFs] = useState<PDFFile[]>([]);
  const [extractedProgramming, setExtractedProgramming] = useState<ProgrammingData | null>(null);
  const [loading, setLoading] = useState<LoadingState>({
    scanning: false,
    parsing: false,
    saving: false
  });
  const [error, setError] = useState<string | null>(null);

  const scanPDFs = useCallback(async () => {
    setLoading(prev => ({ ...prev, scanning: true }));
    setError(null);
    
    try {
      const { data, error: storageError } = await supabase.storage
        .from('programas')
        .list('', { limit: 100 });

      if (storageError) throw storageError;

      const pdfs: PDFFile[] = (data || [])
        .filter(f => f.name.endsWith('.pdf'))
        .map(f => {
          const match = f.name.match(/mwb_([A-Z])_(\d{4})(\d{2})/);
          const lang = match?.[1] === 'T' ? 'pt' : 'en';
          const year = match ? parseInt(match[2]) : 0;
          const month = match ? parseInt(match[3]) : 0;
          return {
            fileName: f.name,
            filePath: f.name,
            size: f.metadata?.size || 0,
            lastModified: f.updated_at || f.created_at || '',
            language: lang as 'pt' | 'en',
            year, month,
            isValid: !!match,
          };
        });

      setAvailablePDFs(pdfs);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao escanear PDFs');
    } finally {
      setLoading(prev => ({ ...prev, scanning: false }));
    }
  }, []);

  const parsePDF = useCallback(async (_pdf: PDFFile) => {
    setError('Parsing de PDF requer Edge Function. Use os dados mockados da programação.');
  }, []);

  const validatePDF = useCallback(async (_pdf: PDFFile): Promise<boolean> => {
    return _pdf.isValid;
  }, []);

  const saveProgramming = useCallback(async (programming: ProgrammingData): Promise<ProgrammingData | null> => {
    setLoading(prev => ({ ...prev, saving: true }));
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Não autenticado');

      const { error: dbError } = await supabase.from('programas').insert({
        titulo: `Programação ${programming.year}-${String(programming.month).padStart(2, '0')}`,
        data: `${programming.year}-${String(programming.month).padStart(2, '0')}-01`,
        conteudo: programming as any,
        user_id: user.id,
        status: 'published',
      });

      if (dbError) throw dbError;
      return programming;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao salvar');
      return null;
    } finally {
      setLoading(prev => ({ ...prev, saving: false }));
    }
  }, []);

  const listProgrammings = useCallback(async (status?: string): Promise<ProgrammingData[]> => {
    const query = supabase.from('programas').select('*').order('data', { ascending: false });
    if (status) query.eq('status', status);
    const { data } = await query;
    return (data || []).map(p => p.conteudo as unknown as ProgrammingData);
  }, []);

  const clearExtractedData = useCallback(() => {
    setExtractedProgramming(null);
    setError(null);
  }, []);

  const formatFileSize = useCallback((bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }, []);

  const formatDate = useCallback((date: Date | string): string => {
    try {
      const d = typeof date === 'string' ? new Date(date) : date;
      if (isNaN(d.getTime())) return 'Data inválida';
      return new Intl.DateTimeFormat('pt-BR', {
        year: 'numeric', month: '2-digit', day: '2-digit',
        hour: '2-digit', minute: '2-digit'
      }).format(d);
    } catch { return 'Data inválida'; }
  }, []);

  const getLanguageIcon = useCallback((language: string): string => {
    return language === 'pt' ? '🇧🇷' : '🇺🇸';
  }, []);

  const getLanguageName = useCallback((language: string): string => {
    return language === 'pt' ? 'Português' : 'English';
  }, []);

  return {
    availablePDFs, extractedProgramming, loading, error,
    scanPDFs, parsePDF, validatePDF, saveProgramming, listProgrammings, clearExtractedData,
    formatFileSize, formatDate, getLanguageIcon, getLanguageName
  };
}

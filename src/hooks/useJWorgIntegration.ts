import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { saveJWorgPrograms } from '@/utils/jworgProgramSaver';
import { fetchJWorgContent } from '@/lib/api/firecrawl-jworg';
import { useToast } from '@/hooks/use-toast';

interface JWorgMeeting {
  week: string;
  date: string;
  book: string;
  chapter: string;
  parts: MeetingPart[];
}

interface MeetingPart {
  id: number;
  title: string;
  duration: number;
  type: 'treasures' | 'gems' | 'reading' | 'starting' | 'following' | 'making' | 'explaining' | 'talk' | 'discussion' | 'study';
  description: string;
  references: string[];
  notes?: string;
}

interface JWorgIntegration {
  currentLanguage: 'pt' | 'en';
  availableWorkbooks: string[];
  currentWeek: JWorgMeeting | null;
  nextWeeks: JWorgMeeting[];
  isLoading: boolean;
  error: string | null;
  downloadWorkbook: (language: 'pt' | 'en', month: string, year: string) => Promise<void>;
  fetchCurrentWeek: () => Promise<void>;
  fetchNextWeeks: () => Promise<void>;
  setLanguage: (lang: 'pt' | 'en') => void;
  saveToDatabase: () => Promise<void>;
  isSaving: boolean;
  dataSource: string | null;
}

/** Convert DB program row back to JWorgMeeting */
function mapProgramToMeeting(program: any): JWorgMeeting {
  const conteudo = program.conteudo || {};
  return {
    week: program.semana || '',
    date: program.data || '',
    book: conteudo.leitura_biblica?.split(' ')[0] || '',
    chapter: conteudo.leitura_biblica?.split(' ')[1] || '',
    parts: (conteudo.partes || []).map((p: any) => ({
      id: p.numero,
      title: p.titulo,
      duration: p.duracao_min,
      type: p.tipo,
      description: p.descricao || '',
      references: p.referencias || [],
      notes: '',
    })),
  };
}

/** Convert API week data to JWorgMeeting format */
function mapWeekToMeeting(week: any): JWorgMeeting {
  return {
    week: week.week || week.dateRange || '',
    date: new Date().toISOString().split('T')[0],
    book: week.bibleReading?.split(' ')[0] || 'BIBLE',
    chapter: week.bibleReading?.split(' ')[1] || '1',
    parts: (week.parts || []).map((part: any) => ({
      ...part,
      notes: Array.isArray(part.references) ? part.references.join('; ') : '',
    })),
  };
}

// Cache TTL: 24 hours
const CACHE_TTL_MS = 24 * 60 * 60 * 1000;

export const useJWorgIntegration = (): JWorgIntegration => {
  const { toast } = useToast();
  const [currentLanguage, setCurrentLanguage] = useState<'pt' | 'en'>('pt');
  const [availableWorkbooks, setAvailableWorkbooks] = useState<string[]>(['mwb25.07-T', 'mwb25.09-T', 'mwb25.11-T']);
  const [currentWeek, setCurrentWeek] = useState<JWorgMeeting | null>(null);
  const [nextWeeks, setNextWeeks] = useState<JWorgMeeting[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [rawWeeksData, setRawWeeksData] = useState<any[]>([]);
  const [dataSource, setDataSource] = useState<string | null>(null);

  /** Try loading from the programas table first (cache) */
  const loadFromCache = useCallback(async (): Promise<boolean> => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return false;

      const cutoff = new Date(Date.now() - CACHE_TTL_MS).toISOString();

      const { data: programs, error: dbError } = await supabase
        .from('programas')
        .select('*')
        .eq('user_id', user.id)
        .gte('updated_at', cutoff)
        .order('data_inicio_semana', { ascending: true })
        .limit(10);

      if (dbError || !programs || programs.length === 0) return false;

      console.log(`📦 Cache hit: ${programs.length} programs from DB`);
      const meetings = programs.map(mapProgramToMeeting);
      setCurrentWeek(meetings[0]);
      setNextWeeks(meetings.slice(1, 4));
      setDataSource('cache');
      return true;
    } catch {
      return false;
    }
  }, []);

  /** Auto-save fetched weeks to DB */
  const autoSaveToDb = useCallback(async (weeks: any[]) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const result = await saveJWorgPrograms(weeks, user.id);
      if (result.saved > 0) {
        console.log(`💾 Auto-cached ${result.saved} programs to DB`);
      }
    } catch (err) {
      console.warn('⚠️ Auto-cache failed:', err);
    }
  }, []);

  /** Fetch all weeks: Cache → Firecrawl → Cheerio → Mock */
  const fetchAllWeeks = useCallback(async (): Promise<void> => {
    setIsLoading(true);
    setError(null);

    try {
      // Step 1: Try cache
      const cached = await loadFromCache();
      if (cached) {
        setIsLoading(false);
        return;
      }

      // Step 2: Fetch from API
      console.log('📡 Cache miss — fetching from JW.org...');
      const result = await fetchJWorgContent(currentLanguage);

      if (result.success && result.weeks && result.weeks.length > 0) {
        setRawWeeksData(result.weeks);
        setDataSource(result.source || 'firecrawl');
        setCurrentWeek(mapWeekToMeeting(result.weeks[0]));
        if (result.weeks.length > 1) {
          setNextWeeks(result.weeks.slice(1, 4).map(mapWeekToMeeting));
        }
        console.log(`✅ Loaded ${result.weeks.length} weeks from ${result.source || 'firecrawl'}`);

        // Auto-save to DB for next time
        autoSaveToDb(result.weeks);
      } else {
        console.log('⚠️ No data from API, no cache available');
        setDataSource('empty');
      }
    } catch (err) {
      console.error('❌ All fetch methods failed:', err);
      setError(`Erro ao carregar: ${err instanceof Error ? err.message : 'Erro desconhecido'}`);
    } finally {
      setIsLoading(false);
    }
  }, [currentLanguage, loadFromCache, autoSaveToDb]);

  const fetchCurrentWeek = async (): Promise<void> => fetchAllWeeks();
  const fetchNextWeeks = async (): Promise<void> => fetchAllWeeks();

  const downloadWorkbook = async (language: 'pt' | 'en', month: string, year: string): Promise<void> => {
    setIsLoading(true);
    setError(null);
    try {
      console.log(`📥 Downloading MWB workbook ${language.toUpperCase()} - ${month} ${year}`);
      const result = await fetchJWorgContent(language);

      if (result.success && result.weeks && result.weeks.length > 0) {
        setAvailableWorkbooks(prev => [...prev, `mwb${year.slice(-2)}.${month}-${language.toUpperCase()}`]);
        setRawWeeksData(result.weeks);
        setCurrentWeek(mapWeekToMeeting(result.weeks[0]));
        if (result.weeks.length > 1) {
          setNextWeeks(result.weeks.slice(1, 4).map(mapWeekToMeeting));
        }
        autoSaveToDb(result.weeks);
        console.log(`✅ Workbook downloaded: ${result.weeks.length} weeks`);
      } else {
        throw new Error('No weeks found');
      }
    } catch (err) {
      setError(`Erro ao baixar apostila: ${err instanceof Error ? err.message : 'Erro desconhecido'}`);
      console.error('❌ Error downloading workbook:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const setLanguage = (lang: 'pt' | 'en'): void => {
    setCurrentLanguage(lang);
    console.log(`🌐 Idioma alterado para: ${lang === 'pt' ? 'Português' : 'English'}`);
  };

  const saveToDatabase = async (): Promise<void> => {
    if (rawWeeksData.length === 0) {
      toast({ title: 'Sem dados para salvar', description: 'Busque os programas do JW.org primeiro', variant: 'destructive' });
      return;
    }

    setIsSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      const result = await saveJWorgPrograms(rawWeeksData, user.id);

      if (result.success && result.saved > 0) {
        toast({ title: 'Programas salvos!', description: `${result.saved} programa(s) salvo(s). ${result.skipped > 0 ? `${result.skipped} já existiam.` : ''}` });
      } else if (result.skipped > 0 && result.saved === 0) {
        toast({ title: 'Programas já existem', description: `${result.skipped} programa(s) já estão no banco` });
      } else {
        toast({ title: 'Erro ao salvar', description: result.errors.join('; '), variant: 'destructive' });
      }
    } catch (err) {
      console.error('❌ Error saving:', err);
      toast({ title: 'Falha ao salvar', description: err instanceof Error ? err.message : 'Erro desconhecido', variant: 'destructive' });
    } finally {
      setIsSaving(false);
    }
  };

  useEffect(() => {
    fetchAllWeeks();
  }, [currentLanguage]);

  return {
    currentLanguage, availableWorkbooks, currentWeek, nextWeeks,
    isLoading, isSaving, error, dataSource,
    downloadWorkbook, fetchCurrentWeek, fetchNextWeeks, setLanguage, saveToDatabase,
  };
};

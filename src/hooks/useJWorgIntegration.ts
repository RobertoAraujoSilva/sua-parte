import { useState, useEffect } from 'react';
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

// Mock data as final fallback
const mockCurrentWeek: JWorgMeeting = {
  week: '18-24 de agosto',
  date: '2025-08-18',
  book: 'PROVÉRBIOS 27',
  chapter: '27',
  parts: [
    { id: 1, title: 'Ter amigos de verdade faz bem', duration: 10, type: 'treasures', description: 'Amigos de verdade têm coragem de nos dar conselhos quando precisamos', references: ['Pro. 27:5, 6', 'Pro. 27:10', 'Pro. 27:17'] },
    { id: 2, title: 'Joias espirituais', duration: 10, type: 'gems', description: 'Pro. 27:21 — Por que um elogio pode ser um teste para nós?', references: ['w06 15/9 19 § 12'] },
    { id: 3, title: 'Leitura da Bíblia', duration: 4, type: 'reading', description: 'Pro. 27:1-17', references: ['th lição 5'] },
    { id: 4, title: 'Iniciando conversas', duration: 3, type: 'starting', description: 'DE CASA EM CASA', references: ['lmd lição 6 ponto 5'] },
    { id: 5, title: 'Cultivando o interesse', duration: 4, type: 'following', description: 'TESTEMUNHO INFORMAL', references: ['lmd lição 8 ponto 3'] },
    { id: 6, title: 'Discurso', duration: 5, type: 'talk', description: 'O que fazer se meu amigo me deixou chateado?', references: ['ijwyp artigo 75'] },
    { id: 7, title: '"Um irmão em tempos de aflição"', duration: 15, type: 'discussion', description: 'Discussão sobre amizades cristãs', references: [] },
    { id: 8, title: 'Estudo bíblico de congregação', duration: 30, type: 'study', description: 'lfb histórias 10-11', references: [] },
  ],
};

const mockNextWeeks: JWorgMeeting[] = [
  { week: '25-31 de agosto', date: '2025-08-25', book: 'PROVÉRBIOS 28', chapter: '28', parts: [{ id: 1, title: 'Diferenças entre os maus e os justos', duration: 10, type: 'treasures', description: 'Contrastes entre pessoas más e justas', references: ['Pro. 28:1'] }] },
  { week: '1-7 de setembro', date: '2025-09-01', book: 'PROVÉRBIOS 29', chapter: '29', parts: [{ id: 1, title: 'Rejeite crenças e costumes que não são baseados na Bíblia', duration: 10, type: 'treasures', description: 'Obedeça a Jeová e seja feliz de verdade', references: ['Pro. 29:18'] }] },
  { week: '8-14 de setembro', date: '2025-09-08', book: 'PROVÉRBIOS 30', chapter: '30', parts: [{ id: 1, title: '"Não me dês nem pobreza nem riquezas"', duration: 10, type: 'treasures', description: 'A verdadeira felicidade vem de confiar em Deus', references: ['Pro. 30:8, 9'] }] },
];

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

  /** Fetch all weeks using fallback chain: Firecrawl → Cheerio → Mock */
  const fetchAllWeeks = async (): Promise<void> => {
    setIsLoading(true);
    setError(null);

    try {
      console.log('📡 Fetching JW.org content (Firecrawl → Cheerio → Mock)...');
      const result = await fetchJWorgContent(currentLanguage);

      if (result.success && result.weeks && result.weeks.length > 0) {
        setRawWeeksData(result.weeks);
        setDataSource(result.source || 'firecrawl');

        setCurrentWeek(mapWeekToMeeting(result.weeks[0]));
        if (result.weeks.length > 1) {
          setNextWeeks(result.weeks.slice(1, 4).map(mapWeekToMeeting));
        }
        console.log(`✅ Loaded ${result.weeks.length} weeks from ${result.source || 'firecrawl'}`);
      } else {
        // Final fallback: mock data
        console.log('⚠️ Using mock data as final fallback');
        setCurrentWeek(mockCurrentWeek);
        setNextWeeks(mockNextWeeks);
        setRawWeeksData([]);
        setDataSource('mock');
      }
    } catch (err) {
      console.error('❌ All fetch methods failed:', err);
      setError(`Erro ao carregar: ${err instanceof Error ? err.message : 'Erro desconhecido'}`);
      setCurrentWeek(mockCurrentWeek);
      setNextWeeks(mockNextWeeks);
      setDataSource('mock');
    } finally {
      setIsLoading(false);
    }
  };

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

      console.log(`💾 Saving ${rawWeeksData.length} programs...`);
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

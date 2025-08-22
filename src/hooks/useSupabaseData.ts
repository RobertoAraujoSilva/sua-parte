import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { realDataFetcher, RealDashboardStats, RealWorkbookData, RealProgrammingData } from '@/utils/fetchRealDashboardData';

export interface DashboardStats {
  totalStudents: number;
  totalWorkbooks: number;
  totalAssignments: number;
  totalCongregations: number;
  totalWeeks: number;
  totalPrograms: number;
  totalDesignacoes: number;
  lastSync: string;
}

export interface WorkbookData {
  id: string;
  title: string;
  version_code: string;
  language_code: string;
  period_start: string;
  period_end: string;
  parsing_status: string;
  created_at: string;
}

export interface ProgrammingData {
  id: string;
  week_start_date: string;
  week_end_date: string;
  week_number: number;
  meeting_type: 'midweek' | 'weekend';
  section_name: string;
  part_number: number;
  part_title: string;
  part_duration: number;
  part_type: string;
  status: string;
  created_at: string;
}

export function useSupabaseData() {
  const [stats, setStats] = useState<DashboardStats>({
    totalStudents: 0,
    totalWorkbooks: 0,
    totalAssignments: 0,
    totalCongregations: 0,
    totalWeeks: 0,
    totalPrograms: 0,
    totalDesignacoes: 0,
    lastSync: new Date().toLocaleString('pt-BR')
  });

  const [workbooks, setWorkbooks] = useState<WorkbookData[]>([]);
  const [programming, setProgramming] = useState<ProgrammingData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = async () => {
    try {
      console.log('📊 Buscando estatísticas reais do dashboard...');

      const realStats = await realDataFetcher.fetchDashboardStats();
      
      setStats({
        totalStudents: realStats.totalStudents,
        totalWorkbooks: realStats.totalWorkbooks,
        totalAssignments: realStats.totalAssignments,
        totalCongregations: realStats.totalCongregations,
        totalWeeks: realStats.totalWeeks,
        totalPrograms: realStats.totalPrograms,
        totalDesignacoes: realStats.totalDesignacoes,
        lastSync: realStats.lastSync
      });

      console.log('✅ Estatísticas reais carregadas:', realStats);

    } catch (err) {
      console.error('❌ Erro ao buscar estatísticas reais:', err);
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
    }
  };

  const fetchWorkbooks = async () => {
    try {
      console.log('📚 Buscando apostilas reais...');

      const realWorkbooks = await realDataFetcher.fetchWorkbooks(10);
      
      // Transform to match interface
      const transformedWorkbooks: WorkbookData[] = realWorkbooks.map(wb => ({
        id: wb.id,
        title: wb.title,
        version_code: wb.version_code,
        language_code: wb.language_code,
        period_start: wb.period_start,
        period_end: wb.period_end,
        parsing_status: wb.parsing_status,
        created_at: wb.created_at
      }));

      setWorkbooks(transformedWorkbooks);
      console.log('✅ Apostilas reais carregadas:', transformedWorkbooks.length);

    } catch (err) {
      console.error('❌ Erro ao buscar apostilas reais:', err);
      setError(err instanceof Error ? err.message : 'Erro ao carregar apostilas');
    }
  };

  const fetchProgramming = async () => {
    try {
      console.log('📅 Buscando programação real...');

      const realProgramming = await realDataFetcher.fetchProgramming(20);
      
      // Transform to match interface
      const transformedProgramming: ProgrammingData[] = realProgramming.map(prog => ({
        id: prog.id,
        week_start_date: prog.week_start_date,
        week_end_date: prog.week_end_date,
        week_number: prog.week_number,
        meeting_type: prog.meeting_type,
        section_name: prog.section_name,
        part_number: prog.part_number,
        part_title: prog.part_title,
        part_duration: prog.part_duration,
        part_type: prog.part_type,
        status: prog.status,
        created_at: prog.created_at
      }));

      setProgramming(transformedProgramming);
      console.log('✅ Programação real carregada:', transformedProgramming.length);

    } catch (err) {
      console.error('❌ Erro ao buscar programação real:', err);
      setError(err instanceof Error ? err.message : 'Erro ao carregar programação');
    }
  };

  const refreshData = async () => {
    setLoading(true);
    setError(null);

    try {
      await Promise.all([
        fetchStats(),
        fetchWorkbooks(),
        fetchProgramming()
      ]);
    } catch (err) {
      console.error('❌ Erro ao atualizar dados reais:', err);
    } finally {
      setLoading(false);
    }
  };

  const refreshAllData = async () => {
    setLoading(true);
    setError(null);

    try {
      console.log('🔄 Atualizando todos os dados reais...');
      await realDataFetcher.refreshAllData();
      await refreshData();
    } catch (err) {
      console.error('❌ Erro ao atualizar todos os dados:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshData();
  }, []);

  return {
    stats,
    workbooks,
    programming,
    loading,
    error,
    refreshData,
    refreshAllData
  };
}

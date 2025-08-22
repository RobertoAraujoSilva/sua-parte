/**
 * Fetch Real Dashboard Data from Supabase
 * This utility fetches real data from the database to replace mock data
 */

import { supabase } from '@/integrations/supabase/client';

export interface RealDashboardStats {
  totalStudents: number;
  totalWorkbooks: number;
  totalAssignments: number;
  totalCongregations: number;
  totalWeeks: number;
  totalPrograms: number;
  totalDesignacoes: number;
  lastSync: string;
}

export interface RealStudentData {
  id: string;
  nome: string;
  familia: string;
  idade: number;
  genero: 'masculino' | 'feminino';
  email: string;
  telefone: string;
  data_batismo: string | null;
  cargo: string;
  ativo: boolean;
  congregacao_id?: string;
  created_at: string;
  updated_at: string;
}

export interface RealWorkbookData {
  id: string;
  version_code: string;
  title: string;
  language_code: string;
  period_start: string;
  period_end: string;
  parsing_status: string;
  created_at: string;
  updated_at: string;
}

export interface RealProgrammingData {
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
  updated_at: string;
}

export interface RealCongregationData {
  id: string;
  nome: string;
  pais: string;
  cidade: string;
  ativa: boolean;
  created_at: string;
  updated_at: string;
}

export interface RealDesignacaoData {
  id: string;
  estudante_id: string;
  programa_id: string;
  tipo_designacao: string;
  data_designacao: string;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface RealProgramaData {
  id: string;
  user_id: string;
  semana_inicio: string;
  semana_fim: string;
  ano: number;
  mes: number;
  numero_semana: number;
  tema_semanal: string;
  status: string;
  created_at: string;
  updated_at: string;
}

export class RealDashboardDataFetcher {
  private static instance: RealDashboardDataFetcher;
  private cache: Map<string, any> = new Map();
  private cacheExpiry: Map<string, number> = new Map();
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

  static getInstance(): RealDashboardDataFetcher {
    if (!RealDashboardDataFetcher.instance) {
      RealDashboardDataFetcher.instance = new RealDashboardDataFetcher();
    }
    return RealDashboardDataFetcher.instance;
  }

  private isCacheValid(key: string): boolean {
    const expiry = this.cacheExpiry.get(key);
    return expiry ? Date.now() < expiry : false;
  }

  private setCache(key: string, data: any): void {
    this.cache.set(key, data);
    this.cacheExpiry.set(key, Date.now() + this.CACHE_DURATION);
  }

  private getCache(key: string): any {
    return this.isCacheValid(key) ? this.cache.get(key) : null;
  }

  async fetchDashboardStats(): Promise<RealDashboardStats> {
    const cacheKey = 'dashboard_stats';
    const cached = this.getCache(cacheKey);
    if (cached) return cached;

    try {
      console.log('📊 Fetching real dashboard statistics...');

      // Fetch all counts in parallel
      const [
        studentsResult,
        workbooksResult,
        assignmentsResult,
        congregationsResult,
        weeksResult,
        programsResult,
        designacoesResult
      ] = await Promise.all([
        supabase.from('estudantes').select('*', { count: 'exact', head: true }),
        supabase.from('workbook_versions').select('*', { count: 'exact', head: true }),
        supabase.from('designacoes').select('*', { count: 'exact', head: true }),
        supabase.from('congregacoes').select('*', { count: 'exact', head: true }),
        supabase.from('global_programming').select('*', { count: 'exact', head: true }),
        supabase.from('programas').select('*', { count: 'exact', head: true }),
        supabase.from('designacoes').select('*', { count: 'exact', head: true })
      ]);

      const stats: RealDashboardStats = {
        totalStudents: studentsResult.count || 0,
        totalWorkbooks: workbooksResult.count || 0,
        totalAssignments: assignmentsResult.count || 0,
        totalCongregations: congregationsResult.count || 0,
        totalWeeks: weeksResult.count || 0,
        totalPrograms: programsResult.count || 0,
        totalDesignacoes: designacoesResult.count || 0,
        lastSync: new Date().toLocaleString('pt-BR')
      };

      this.setCache(cacheKey, stats);
      console.log('✅ Real dashboard stats fetched:', stats);
      return stats;

    } catch (error) {
      console.error('❌ Error fetching dashboard stats:', error);
      throw error;
    }
  }

  async fetchStudents(limit: number = 50): Promise<RealStudentData[]> {
    const cacheKey = `students_${limit}`;
    const cached = this.getCache(cacheKey);
    if (cached) return cached;

    try {
      console.log(`👥 Fetching ${limit} real students...`);

      const { data, error } = await supabase
        .from('estudantes')
        .select('*')
        .eq('ativo', true)
        .order('nome')
        .limit(limit);

      if (error) throw error;

      this.setCache(cacheKey, data || []);
      console.log(`✅ ${data?.length || 0} real students fetched`);
      return data || [];

    } catch (error) {
      console.error('❌ Error fetching students:', error);
      throw error;
    }
  }

  async fetchWorkbooks(limit: number = 10): Promise<RealWorkbookData[]> {
    const cacheKey = `workbooks_${limit}`;
    const cached = this.getCache(cacheKey);
    if (cached) return cached;

    try {
      console.log(`📚 Fetching ${limit} real workbooks...`);

      const { data, error } = await supabase
        .from('workbook_versions')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;

      this.setCache(cacheKey, data || []);
      console.log(`✅ ${data?.length || 0} real workbooks fetched`);
      return data || [];

    } catch (error) {
      console.error('❌ Error fetching workbooks:', error);
      throw error;
    }
  }

  async fetchProgramming(limit: number = 20): Promise<RealProgrammingData[]> {
    const cacheKey = `programming_${limit}`;
    const cached = this.getCache(cacheKey);
    if (cached) return cached;

    try {
      console.log(`📅 Fetching ${limit} real programming entries...`);

      const { data, error } = await supabase
        .from('global_programming')
        .select('*')
        .order('week_start_date', { ascending: true })
        .limit(limit);

      if (error) throw error;

      this.setCache(cacheKey, data || []);
      console.log(`✅ ${data?.length || 0} real programming entries fetched`);
      return data || [];

    } catch (error) {
      console.error('❌ Error fetching programming:', error);
      throw error;
    }
  }

  async fetchCongregations(): Promise<RealCongregationData[]> {
    const cacheKey = 'congregations';
    const cached = this.getCache(cacheKey);
    if (cached) return cached;

    try {
      console.log('🏛️ Fetching real congregations...');

      const { data, error } = await supabase
        .from('congregacoes')
        .select('*')
        .eq('ativa', true)
        .order('nome');

      if (error) throw error;

      this.setCache(cacheKey, data || []);
      console.log(`✅ ${data?.length || 0} real congregations fetched`);
      return data || [];

    } catch (error) {
      console.error('❌ Error fetching congregations:', error);
      throw error;
    }
  }

  async fetchDesignacoes(limit: number = 20): Promise<RealDesignacaoData[]> {
    const cacheKey = `designacoes_${limit}`;
    const cached = this.getCache(cacheKey);
    if (cached) return cached;

    try {
      console.log(`📋 Fetching ${limit} real designacoes...`);

      const { data, error } = await supabase
        .from('designacoes')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;

      this.setCache(cacheKey, data || []);
      console.log(`✅ ${data?.length || 0} real designacoes fetched`);
      return data || [];

    } catch (error) {
      console.error('❌ Error fetching designacoes:', error);
      throw error;
    }
  }

  async fetchProgramas(limit: number = 20): Promise<RealProgramaData[]> {
    const cacheKey = `programas_${limit}`;
    const cached = this.getCache(cacheKey);
    if (cached) return cached;

    try {
      console.log(`📊 Fetching ${limit} real programas...`);

      const { data, error } = await supabase
        .from('programas')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;

      this.setCache(cacheKey, data || []);
      console.log(`✅ ${data?.length || 0} real programas fetched`);
      return data || [];

    } catch (error) {
      console.error('❌ Error fetching programas:', error);
      throw error;
    }
  }

  async fetchStudentsByProgress(): Promise<{
    beginning: RealStudentData[];
    developing: RealStudentData[];
    qualified: RealStudentData[];
    advanced: RealStudentData[];
  }> {
    const cacheKey = 'students_by_progress';
    const cached = this.getCache(cacheKey);
    if (cached) return cached;

    try {
      console.log('📈 Fetching students by progress level...');

      const students = await this.fetchStudents(100);

      const categorized = {
        beginning: students.filter(s => 
          s.cargo === 'estudante_novo' || s.cargo === 'publicador_nao_batizado'
        ),
        developing: students.filter(s => 
          s.cargo === 'publicador_batizado'
        ),
        qualified: students.filter(s => 
          s.cargo === 'pioneiro_regular' || s.cargo === 'servo_ministerial'
        ),
        advanced: students.filter(s => 
          s.cargo === 'anciao'
        )
      };

      this.setCache(cacheKey, categorized);
      console.log('✅ Students categorized by progress level');
      return categorized;

    } catch (error) {
      console.error('❌ Error categorizing students:', error);
      throw error;
    }
  }

  async fetchRecentActivity(limit: number = 10): Promise<any[]> {
    const cacheKey = `recent_activity_${limit}`;
    const cached = this.getCache(cacheKey);
    if (cached) return cached;

    try {
      console.log(`🕒 Fetching ${limit} recent activities...`);

      // Fetch recent designacoes and programs
      const [designacoes, programas] = await Promise.all([
        this.fetchDesignacoes(limit),
        this.fetchProgramas(limit)
      ]);

      // Combine and sort by date
      const activities = [
        ...designacoes.map(d => ({ ...d, type: 'designacao' })),
        ...programas.map(p => ({ ...p, type: 'programa' }))
      ].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
       .slice(0, limit);

      this.setCache(cacheKey, activities);
      console.log(`✅ ${activities.length} recent activities fetched`);
      return activities;

    } catch (error) {
      console.error('❌ Error fetching recent activity:', error);
      throw error;
    }
  }

  clearCache(): void {
    this.cache.clear();
    this.cacheExpiry.clear();
    console.log('🗑️ Cache cleared');
  }

  async refreshAllData(): Promise<void> {
    console.log('🔄 Refreshing all dashboard data...');
    this.clearCache();
    
    await Promise.all([
      this.fetchDashboardStats(),
      this.fetchStudents(),
      this.fetchWorkbooks(),
      this.fetchProgramming(),
      this.fetchCongregations(),
      this.fetchDesignacoes(),
      this.fetchProgramas()
    ]);

    console.log('✅ All dashboard data refreshed');
  }
}

// Export singleton instance
export const realDataFetcher = RealDashboardDataFetcher.getInstance();

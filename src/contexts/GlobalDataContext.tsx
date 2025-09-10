import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';

// ==============================================================================
// 🎯 GLOBAL DATA CONTEXT - Sistema Unificado dos Dashboards
// ==============================================================================

interface GlobalStats {
  // Admin Stats (Global)
  totalCongregations: number;
  totalInstructors: number;
  totalStudents: number;
  totalPrograms: number;
  totalAssignments: number;
  systemHealth: 'healthy' | 'warning' | 'error';
  
  // Instructor Stats (Local) 
  localStudents: number;
  localAssignments: number;
  pendingConfirmations: number;
  completedAssignments: number;
  activePrograms: number;
  
  // Student Stats (Individual)
  personalAssignments: number;
  personalPending: number;
  personalConfirmed: number;
  confirmationRate: number;
  
  lastSync: string;
}

interface Student {
  id: string;
  user_id: string;
  nome: string;
  cargo: string;
  ativo: boolean;
  genero: string;
  idade?: number;
  email?: string;
  telefone?: string;
  created_at: string;
}

interface Program {
  id: string;
  user_id: string;
  semana: string;
  data_inicio_semana: string;
  mes_apostila: string;
  arquivo: string;
  partes: any;
  status: string;
  assignment_status: string;
  created_at: string;
}

interface Assignment {
  id: string;
  user_id: string;
  id_programa: string;
  id_estudante: string;
  id_ajudante?: string;
  tipo_parte: string;
  titulo_parte: string;
  numero_parte: number;
  tempo_minutos?: number;
  confirmado: boolean;
  created_at: string;
}

interface GlobalDataState {
  // Data
  stats: GlobalStats;
  students: Student[];
  programs: Program[];
  assignments: Assignment[];
  
  // Loading states
  isLoading: boolean;
  isRefreshing: boolean;
  
  // Cache info
  lastCacheUpdate: string;
  cacheExpiry: number;
  
  // Error handling
  error: string | null;
}

type GlobalDataAction = 
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_REFRESHING'; payload: boolean }
  | { type: 'SET_STATS'; payload: GlobalStats }
  | { type: 'SET_STUDENTS'; payload: Student[] }
  | { type: 'SET_PROGRAMS'; payload: Program[] }
  | { type: 'SET_ASSIGNMENTS'; payload: Assignment[] }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'UPDATE_CACHE_INFO'; payload: { lastUpdate: string; expiry: number } }
  | { type: 'RESET_STATE' };

const initialState: GlobalDataState = {
  stats: {
    totalCongregations: 0,
    totalInstructors: 0,
    totalStudents: 0,
    totalPrograms: 0,
    totalAssignments: 0,
    systemHealth: 'healthy',
    localStudents: 0,
    localAssignments: 0,
    pendingConfirmations: 0,
    completedAssignments: 0,
    activePrograms: 0,
    personalAssignments: 0,
    personalPending: 0,
    personalConfirmed: 0,
    confirmationRate: 0,
    lastSync: new Date().toISOString()
  },
  students: [],
  programs: [],
  assignments: [],
  isLoading: false,
  isRefreshing: false,
  lastCacheUpdate: '',
  cacheExpiry: 0,
  error: null
};

function globalDataReducer(state: GlobalDataState, action: GlobalDataAction): GlobalDataState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'SET_REFRESHING':
      return { ...state, isRefreshing: action.payload };
    case 'SET_STATS':
      return { ...state, stats: action.payload };
    case 'SET_STUDENTS':
      return { ...state, students: action.payload };
    case 'SET_PROGRAMS':
      return { ...state, programs: action.payload };
    case 'SET_ASSIGNMENTS':
      return { ...state, assignments: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    case 'UPDATE_CACHE_INFO':
      return { 
        ...state, 
        lastCacheUpdate: action.payload.lastUpdate,
        cacheExpiry: action.payload.expiry
      };
    case 'RESET_STATE':
      return initialState;
    default:
      return state;
  }
}

interface GlobalDataContextType {
  state: GlobalDataState;
  
  // Actions
  loadAllData: () => Promise<void>;
  loadStudents: () => Promise<void>;
  loadPrograms: () => Promise<void>;
  loadAssignments: () => Promise<void>;
  refreshStats: () => Promise<void>;
  
  // Cache utilities
  invalidateCache: () => void;
  isDataStale: () => boolean;
  
  // Role-specific getters
  getAdminData: () => any;
  getInstructorData: () => any;
  getStudentData: () => any;
}

const GlobalDataContext = createContext<GlobalDataContextType | undefined>(undefined);

// Cache TTL baseado no role (em milissegundos)
const CACHE_TTL = {
  admin: 5 * 60 * 1000,     // 5 minutos - dados globais mudam menos
  instrutor: 2 * 60 * 1000,  // 2 minutos - dados locais mudam mais
  estudante: 1 * 60 * 1000   // 1 minuto - dados pessoais mudam mais
};

export function GlobalDataProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(globalDataReducer, initialState);
  const { user, profile } = useAuth();

  // Cache management
  const invalidateCache = () => {
    dispatch({ type: 'UPDATE_CACHE_INFO', payload: { lastUpdate: '', expiry: 0 } });
  };

  const isDataStale = (): boolean => {
    if (!state.lastCacheUpdate) return true;
    const now = Date.now();
    return now > state.cacheExpiry;
  };

  const updateCacheInfo = (role: string) => {
    const ttl = CACHE_TTL[role as keyof typeof CACHE_TTL] || CACHE_TTL.instrutor;
    const now = Date.now();
    dispatch({ 
      type: 'UPDATE_CACHE_INFO', 
      payload: { 
        lastUpdate: new Date().toISOString(),
        expiry: now + ttl
      }
    });
  };

  // Load functions with error handling
  const loadStudents = async () => {
    if (!user?.id) return;
    
    try {
      const { data, error } = await supabase
        .from('estudantes')
        .select('*')
        .eq('user_id', user.id)
        .eq('ativo', true)
        .order('nome', { ascending: true });

      if (error) throw error;
      dispatch({ type: 'SET_STUDENTS', payload: data || [] });
    } catch (error) {
      console.error('Error loading students:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Erro ao carregar estudantes' });
    }
  };

  const loadPrograms = async () => {
    if (!user?.id) return;
    
    try {
      const { data, error } = await supabase
        .from('programas')
        .select('*')
        .eq('user_id', user.id)
        .order('data_inicio_semana', { ascending: false })
        .limit(10);

      if (error) throw error;
      dispatch({ type: 'SET_PROGRAMS', payload: data || [] });
    } catch (error) {
      console.error('Error loading programs:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Erro ao carregar programas' });
    }
  };

  const loadAssignments = async () => {
    if (!user?.id) return;
    
    try {
      const { data, error } = await supabase
        .from('designacoes')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      dispatch({ type: 'SET_ASSIGNMENTS', payload: data || [] });
    } catch (error) {
      console.error('Error loading assignments:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Erro ao carregar designações' });
    }
  };

  const calculateStats = (students: Student[], programs: Program[], assignments: Assignment[]): GlobalStats => {
    const now = new Date().toISOString();
    
    // Calcular estatísticas baseadas nos dados carregados
    const pendingAssignments = assignments.filter(a => !a.confirmado);
    const confirmedAssignments = assignments.filter(a => a.confirmado);
    const activePrograms = programs.filter(p => p.status === 'ativo');
    
    return {
      // Global stats (para admin)
      totalCongregations: 1, // Seria calculado de congregações
      totalInstructors: 1,   // Seria calculado de perfis
      totalStudents: students.length,
      totalPrograms: programs.length,
      totalAssignments: assignments.length,
      systemHealth: 'healthy',
      
      // Local stats (para instrutor)
      localStudents: students.length,
      localAssignments: assignments.length,
      pendingConfirmations: pendingAssignments.length,
      completedAssignments: confirmedAssignments.length,
      activePrograms: activePrograms.length,
      
      // Personal stats (para estudante)
      personalAssignments: assignments.filter(a => a.id_estudante === user?.id).length,
      personalPending: assignments.filter(a => a.id_estudante === user?.id && !a.confirmado).length,
      personalConfirmed: assignments.filter(a => a.id_estudante === user?.id && a.confirmado).length,
      confirmationRate: 95, // Seria calculado do histórico
      
      lastSync: now
    };
  };

  const refreshStats = async () => {
    const stats = calculateStats(state.students, state.programs, state.assignments);
    dispatch({ type: 'SET_STATS', payload: stats });
  };

  const loadAllData = async () => {
    if (!user?.id || !profile?.role) return;
    
    dispatch({ type: 'SET_LOADING', payload: true });
    dispatch({ type: 'SET_ERROR', payload: null });
    
    try {
      // Carregar dados em paralelo para melhor performance
      await Promise.all([
        loadStudents(),
        loadPrograms(), 
        loadAssignments()
      ]);
      
      // Calcular estatísticas depois que os dados foram carregados
      await refreshStats();
      
      // Atualizar cache
      updateCacheInfo(profile.role);
      
    } catch (error) {
      console.error('Error loading all data:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Erro ao carregar dados do sistema' });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  // Role-specific data getters
  const getAdminData = () => ({
    stats: {
      totalCongregations: state.stats.totalCongregations,
      totalInstructors: state.stats.totalInstructors,
      totalStudents: state.stats.totalStudents,
      totalPrograms: state.stats.totalPrograms,
      totalAssignments: state.stats.totalAssignments,
      systemHealth: state.stats.systemHealth,
      lastSync: state.stats.lastSync
    },
    allPrograms: state.programs,
    systemHealth: state.stats.systemHealth
  });

  const getInstructorData = () => ({
    stats: {
      totalStudents: state.stats.localStudents,
      totalAssignments: state.stats.localAssignments,
      pendingConfirmations: state.stats.pendingConfirmations,
      completedAssignments: state.stats.completedAssignments,
      activePrograms: state.stats.activePrograms,
      lastSync: state.stats.lastSync
    },
    students: state.students,
    programs: state.programs,
    assignments: state.assignments
  });

  const getStudentData = () => ({
    stats: {
      totalAssignments: state.stats.personalAssignments,
      pendingAssignments: state.stats.personalPending,
      confirmedAssignments: state.stats.personalConfirmed,
      confirmationRate: state.stats.confirmationRate,
      lastSync: state.stats.lastSync
    },
    myAssignments: state.assignments.filter(a => a.id_estudante === user?.id),
    availablePrograms: state.programs.filter(p => p.status === 'ativo')
  });

  // Auto-load data when user changes
  useEffect(() => {
    if (user?.id && profile?.role) {
      // Verificar se os dados estão stale antes de recarregar
      if (isDataStale()) {
        loadAllData();
      }
    } else {
      dispatch({ type: 'RESET_STATE' });
    }
  }, [user?.id, profile?.role]);

  const contextValue: GlobalDataContextType = {
    state,
    loadAllData,
    loadStudents,
    loadPrograms,
    loadAssignments,
    refreshStats,
    invalidateCache,
    isDataStale,
    getAdminData,
    getInstructorData,
    getStudentData
  };

  return (
    <GlobalDataContext.Provider value={contextValue}>
      {children}
    </GlobalDataContext.Provider>
  );
}

export function useGlobalData() {
  const context = useContext(GlobalDataContext);
  if (context === undefined) {
    throw new Error('useGlobalData must be used within a GlobalDataProvider');
  }
  return context;
}
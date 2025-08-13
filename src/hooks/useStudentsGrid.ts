/**
 * Students Grid Hook
 * 
 * Hook for managing students in Excel-like grid mode with inline editing,
 * filtering, sorting, and pagination
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface StudentGridRow {
  id: string;
  user_id: string;
  familia?: string;
  nome: string;
  idade: number;
  genero: 'masculino' | 'feminino';
  email?: string;
  telefone?: string;
  data_batismo?: string;
  cargo: string;
  ativo: boolean;
  observacoes?: string;
  data_nascimento?: string;
  estado_civil: string;
  papel_familiar?: string;
  id_pai?: string;
  pai_nome?: string;
  id_mae?: string;
  mae_nome?: string;
  id_conjuge?: string;
  conjuge_nome?: string;
  coabitacao: boolean;
  menor?: boolean;
  responsavel_primario?: string;
  responsavel_primario_nome?: string;
  responsavel_secundario?: string;
  responsavel_secundario_nome?: string;
  // S-38-T qualifications
  chairman: boolean;
  pray: boolean;
  tresures: boolean;
  gems: boolean;
  reading: boolean;
  starting: boolean;
  following: boolean;
  making: boolean;
  explaining: boolean;
  talk: boolean;
  created_at: string;
  updated_at: string;
}

export interface GridFilters {
  search: string;
  cargo?: string;
  genero?: string;
  ativo?: boolean;
  estado_civil?: string;
  papel_familiar?: string;
  familia?: string;
  menor?: boolean;
}

export interface GridSort {
  field: string;
  direction: 'asc' | 'desc';
}

export interface UseStudentsGridReturn {
  // Data
  rows: StudentGridRow[];
  totalCount: number;
  
  // Loading states
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  
  // Pagination
  page: number;
  pageSize: number;
  totalPages: number;
  setPage: (page: number) => void;
  setPageSize: (size: number) => void;
  
  // Filtering & Sorting
  filters: GridFilters;
  setFilters: (filters: Partial<GridFilters>) => void;
  clearFilters: () => void;
  sort: GridSort | null;
  setSort: (sort: GridSort | null) => void;
  
  // Editing
  updateCell: (rowId: string, field: string, value: any) => Promise<boolean>;
  isUpdating: boolean;
  
  // Actions
  refetch: () => Promise<void>;
  exportData: () => StudentGridRow[];
}

const DEFAULT_FILTERS: GridFilters = {
  search: '',
  cargo: undefined,
  genero: undefined,
  ativo: undefined,
  estado_civil: undefined,
  papel_familiar: undefined,
  familia: undefined,
  menor: undefined
};

const PAGE_SIZE_OPTIONS = [25, 50, 100, 200];
const DEFAULT_PAGE_SIZE = 50;

export function useStudentsGrid(): UseStudentsGridReturn {
  const { user } = useAuth();
  
  // State
  const [rows, setRows] = useState<StudentGridRow[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  
  // Pagination
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
  
  // Filtering & Sorting
  const [filters, setFiltersState] = useState<GridFilters>(DEFAULT_FILTERS);
  const [sort, setSort] = useState<GridSort | null>({ field: 'nome', direction: 'asc' });
  
  // Computed values
  const totalPages = Math.ceil(totalCount / pageSize);
  
  // Load data function
  const loadData = useCallback(async () => {
    if (!user?.id) {
      setRows([]);
      setTotalCount(0);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setIsError(false);
      setError(null);

      // Build query
      let query = (supabase as any)
        .from('vw_estudantes_grid')
        .select('*', { count: 'exact' })
        .eq('user_id', user.id);

      // Apply filters
      if (filters.search) {
        query = query.or(`nome.ilike.%${filters.search}%,email.ilike.%${filters.search}%,familia.ilike.%${filters.search}%`);
      }
      
      if (filters.cargo) {
        query = query.eq('cargo', filters.cargo);
      }
      
      if (filters.genero) {
        query = query.eq('genero', filters.genero);
      }
      
      if (filters.ativo !== undefined) {
        query = query.eq('ativo', filters.ativo);
      }
      
      if (filters.estado_civil) {
        query = query.eq('estado_civil', filters.estado_civil);
      }
      
      if (filters.papel_familiar) {
        query = query.eq('papel_familiar', filters.papel_familiar);
      }
      
      if (filters.familia) {
        query = query.ilike('familia', `%${filters.familia}%`);
      }
      
      if (filters.menor !== undefined) {
        query = query.eq('menor', filters.menor);
      }

      // Apply sorting
      if (sort) {
        query = query.order(sort.field, { ascending: sort.direction === 'asc' });
      }

      // Apply pagination
      const from = page * pageSize;
      const to = from + pageSize - 1;
      query = query.range(from, to);

      const { data, error: queryError, count } = await query;

      if (queryError) {
        throw queryError;
      }

      setRows((data as StudentGridRow[]) || []);
      setTotalCount(count || 0);
      
    } catch (err) {
      console.error('Error loading grid data:', err);
      setIsError(true);
      setError(err instanceof Error ? err : new Error('Failed to load data'));
      toast.error('Erro ao carregar dados da planilha');
    } finally {
      setIsLoading(false);
    }
  }, [user?.id, filters, sort, page, pageSize]);

  // Load data when dependencies change
  useEffect(() => {
    loadData();
  }, [loadData]);

  // Reset page when filters change
  useEffect(() => {
    setPage(0);
  }, [filters, sort]);

  // Filter management
  const setFilters = useCallback((newFilters: Partial<GridFilters>) => {
    setFiltersState(prev => ({ ...prev, ...newFilters }));
  }, []);

  const clearFilters = useCallback(() => {
    setFiltersState(DEFAULT_FILTERS);
  }, []);

  // Cell update function
  const updateCell = useCallback(async (rowId: string, field: string, value: any): Promise<boolean> => {
    if (!user?.id) return false;

    setIsUpdating(true);

    try {
      let updateData: any = {};

      // Handle family relationship name fields (convert names to IDs)
      if (field === 'pai_nome') {
        if (value && value.trim()) {
          const { data: pai } = await (supabase as any).rpc('find_student_by_name', {
            search_name: value.trim(),
            current_user_id: user.id
          });
          updateData.id_pai = pai;
        } else {
          updateData.id_pai = null;
        }
      } else if (field === 'mae_nome') {
        if (value && value.trim()) {
          const { data: mae } = await (supabase as any).rpc('find_student_by_name', {
            search_name: value.trim(),
            current_user_id: user.id
          });
          updateData.id_mae = mae;
        } else {
          updateData.id_mae = null;
        }
      } else if (field === 'conjuge_nome') {
        if (value && value.trim()) {
          const { data: conjuge } = await (supabase as any).rpc('find_student_by_name', {
            search_name: value.trim(),
            current_user_id: user.id
          });
          updateData.id_conjuge = conjuge;
        } else {
          updateData.id_conjuge = null;
        }
      } else {
        // Direct field update
        updateData[field] = value;
      }

      // Update in database
      const { error } = await (supabase as any)
        .from('estudantes')
        .update(updateData)
        .eq('id', rowId)
        .eq('user_id', user.id);

      if (error) {
        throw error;
      }

      // Update local state
      setRows(prev => prev.map(row => {
        if (row.id === rowId) {
          const updatedRow = { ...row };
          
          // Update the field that was changed
          if (field === 'pai_nome') {
            updatedRow.pai_nome = value;
            updatedRow.id_pai = updateData.id_pai;
          } else if (field === 'mae_nome') {
            updatedRow.mae_nome = value;
            updatedRow.id_mae = updateData.id_mae;
          } else if (field === 'conjuge_nome') {
            updatedRow.conjuge_nome = value;
            updatedRow.id_conjuge = updateData.id_conjuge;
          } else {
            (updatedRow as any)[field] = value;
          }
          
          updatedRow.updated_at = new Date().toISOString();
          return updatedRow;
        }
        return row;
      }));

      toast.success('Campo atualizado com sucesso');
      return true;

    } catch (err) {
      console.error('Error updating cell:', err);
      toast.error('Erro ao atualizar campo');
      return false;
    } finally {
      setIsUpdating(false);
    }
  }, [user?.id]);

  // Export data function
  const exportData = useCallback(() => {
    return rows;
  }, [rows]);

  return {
    // Data
    rows,
    totalCount,
    
    // Loading states
    isLoading,
    isError,
    error,
    
    // Pagination
    page,
    pageSize,
    totalPages,
    setPage,
    setPageSize,
    
    // Filtering & Sorting
    filters,
    setFilters,
    clearFilters,
    sort,
    setSort,
    
    // Editing
    updateCell,
    isUpdating,
    
    // Actions
    refetch: loadData,
    exportData
  };
}
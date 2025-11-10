/**
 * Admin hook for managing programs with filters, selection, and bulk operations
 */

import { useState, useMemo } from 'react';
import { useSupabaseQuery } from './useSupabaseQuery';
import { useSupabaseCRUD } from './useSupabaseCRUD';
import { useAuth } from '@/contexts/AuthContext';

export interface ProgramFilters {
  dateFrom: string | null;
  dateTo: string | null;
  month: string | null;
  status: string[];
  assignmentStatus: string[];
  searchTerm: string;
}

export function useProgramasAdmin() {
  const { user } = useAuth();
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [filters, setFilters] = useState<ProgramFilters>({
    dateFrom: null,
    dateTo: null,
    month: null,
    status: [],
    assignmentStatus: [],
    searchTerm: '',
  });

  // Build dynamic filters object for query
  const queryFilters = useMemo(() => {
    const f: Record<string, any> = { user_id: user?.id };
    if (filters.status.length > 0) {
      // Note: useSupabaseQuery doesn't support 'in' operator directly
      // We'll filter client-side for status
    }
    if (filters.assignmentStatus.length > 0) {
      // Filter client-side for assignment_status
    }
    return f;
  }, [user?.id, filters.status, filters.assignmentStatus]);

  // Fetch programs
  const { data: rawPrograms = [], isLoading, error, refetch } = useSupabaseQuery({
    table: 'programas',
    select: '*',
    filters: queryFilters,
    orderBy: { column: 'data_inicio_semana', ascending: false },
    enabled: !!user?.id,
  });

  // Client-side filtering for complex filters
  const programs = useMemo(() => {
    let filtered = rawPrograms;

    // Filter by date range
    if (filters.dateFrom) {
      filtered = filtered.filter(p => p.data_inicio_semana >= filters.dateFrom!);
    }
    if (filters.dateTo) {
      filtered = filtered.filter(p => p.data_inicio_semana <= filters.dateTo!);
    }

    // Filter by month
    if (filters.month) {
      filtered = filtered.filter(p => p.mes_apostila === filters.month);
    }

    // Filter by status
    if (filters.status.length > 0) {
      filtered = filtered.filter(p => filters.status.includes(p.status));
    }

    // Filter by assignment status
    if (filters.assignmentStatus.length > 0) {
      filtered = filtered.filter(p => filters.assignmentStatus.includes(p.assignment_status));
    }

    // Filter by search term
    if (filters.searchTerm) {
      const searchLower = filters.searchTerm.toLowerCase();
      filtered = filtered.filter(p =>
        p.titulo?.toLowerCase().includes(searchLower) ||
        p.semana?.toLowerCase().includes(searchLower)
      );
    }

    return filtered;
  }, [rawPrograms, filters]);

  // CRUD operations
  const { remove, isDeleting } = useSupabaseCRUD({
    table: 'programas',
    invalidateKeys: ['programas'],
    deleteSuccessMessage: 'Programa removido com sucesso',
  });

  // Selection handlers
  const toggleSelection = (id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === programs.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(programs.map(p => p.id)));
    }
  };

  const clearSelection = () => setSelectedIds(new Set());

  // Bulk delete
  const bulkDelete = async (ids: string[]) => {
    for (const id of ids) {
      await remove(id);
    }
    clearSelection();
    refetch();
  };

  // Stats
  const stats = useMemo(() => {
    const total = programs.length;
    const byStatus = {
      draft: programs.filter(p => p.status === 'draft').length,
      active: programs.filter(p => p.status === 'active').length,
      publicada: programs.filter(p => p.status === 'publicada').length,
    };
    const pendingAssignments = programs.filter(p => p.assignment_status === 'pending').length;
    
    // Count programs for current month
    const now = new Date();
    const currentMonth = now.toLocaleString('pt-BR', { month: 'long', year: 'numeric' });
    const thisMonth = programs.filter(p => p.mes_apostila?.toLowerCase() === currentMonth.toLowerCase()).length;

    return {
      total,
      byStatus,
      pendingAssignments,
      thisMonth,
    };
  }, [programs]);

  return {
    programs,
    isLoading,
    error,
    refetch,
    filters,
    setFilters,
    selectedIds,
    toggleSelection,
    toggleSelectAll,
    clearSelection,
    bulkDelete,
    isDeleting,
    stats,
  };
}

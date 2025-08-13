/**
 * Enhanced Students Hook
 * 
 * This hook provides a unified interface for working with both legacy and enhanced
 * student data, handling migration status and providing backward compatibility.
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

import type { EstudanteRow } from '@/types/estudantes';
import type {
  EstudanteEnhanced,
  EstudanteWithFamily,
  EstudanteFilters,
  EstudanteStatistics,
  CreateEstudanteInput,
  UpdateEstudanteInput
} from '@/types/enhanced-estudantes';

import {
  convertToEnhanced,
  convertToLegacy,
  hasEnhancedData,
  TypeCompatibilityWrapper,
  MigrationStatusHelper
} from '@/utils/typeCompatibility';

export interface UseEnhancedEstudantesOptions {
  enableEnhancedFeatures?: boolean;
  autoMigrate?: boolean;
  includeInactive?: boolean;
}

export interface UseEnhancedEstudantesReturn {
  // Data
  students: EstudanteEnhanced[];
  studentsWithFamily: EstudanteWithFamily[];
  filteredStudents: EstudanteEnhanced[];
  statistics: EstudanteStatistics;

  // Loading states
  isLoading: boolean;
  isError: boolean;
  error: Error | null;

  // Migration status
  migrationStatus: {
    progress: number;
    migrated: number;
    total: number;
    needsMigration: EstudanteEnhanced[];
    isFullyMigrated: boolean;
  };

  // Filtering
  filters: EstudanteFilters;
  setFilters: (filters: Partial<EstudanteFilters>) => void;
  clearFilters: () => void;

  // CRUD operations
  createStudent: (student: CreateEstudanteInput) => Promise<EstudanteEnhanced>;
  updateStudent: (id: string, updates: UpdateEstudanteInput) => Promise<EstudanteEnhanced>;
  deleteStudent: (id: string) => Promise<void>;

  // Bulk operations
  bulkUpdate: (updates: Array<{ id: string; data: UpdateEstudanteInput }>) => Promise<void>;
  bulkDelete: (ids: string[]) => Promise<void>;

  // Family operations
  linkFamily: (studentId: string, relativeId: string, relationship: string) => Promise<void>;
  unlinkFamily: (studentId: string, relativeId: string) => Promise<void>;

  // Utility functions
  getStudentById: (id: string) => EstudanteEnhanced | undefined;
  getStudentsByFamily: (familia: string) => EstudanteEnhanced[];
  canStudentsBePaired: (student1Id: string, student2Id: string) => Promise<boolean>;

  // Refresh
  refetch: () => Promise<void>;
}

const DEFAULT_FILTERS: EstudanteFilters = {
  searchTerm: '',
  cargo: 'todos',
  genero: 'todos',
  ativo: 'todos',
  estado_civil: 'todos',
  papel_familiar: 'todos',
  menor: 'todos',
  familia: '',
  has_family_relationships: false
};

export function useEnhancedEstudantes(
  options: UseEnhancedEstudantesOptions = {}
): UseEnhancedEstudantesReturn {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const {
    enableEnhancedFeatures = true,
    autoMigrate = false,
    includeInactive = true
  } = options;

  const [filters, setFiltersState] = useState<EstudanteFilters>(DEFAULT_FILTERS);

  // Query for students data
  const {
    data: rawStudents = [],
    isLoading,
    isError,
    error,
    refetch
  } = useQuery({
    queryKey: ['enhanced-estudantes', user?.id, includeInactive],
    queryFn: async () => {
      if (!user?.id) return [];

      console.log('🔄 Loading students with enhanced features...');

      // Load students with enhanced fields if available
      const query = supabase
        .from('estudantes')
        .select(`
          *,
          pai:id_pai(*),
          mae:id_mae(*),
          conjuge:id_conjuge(*),
          responsavel_primario_info:responsavel_primario(*),
          responsavel_secundario_info:responsavel_secundario(*)
        `)
        .eq('user_id', user.id);

      if (!includeInactive) {
        query.eq('ativo', true);
      }

      const { data, error } = await query.order('nome');

      if (error) {
        console.error('❌ Error loading students:', error);
        throw error;
      }

      console.log(`✅ Loaded ${data?.length || 0} students`);
      return data || [];
    },
    enabled: !!user?.id,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });

  // Convert raw data to enhanced format
  const students = useMemo(() => {
    return rawStudents.map(student => {
      if (hasEnhancedData(student)) {
        // For students with enhanced data, ensure all required fields are present
        const enhanced: EstudanteEnhanced = {
          // Core fields
          id: student.id,
          user_id: student.user_id,
          nome: student.nome,
          idade: student.idade || 0,
          genero: student.genero,
          email: student.email || undefined,
          telefone: student.telefone || undefined,
          data_batismo: student.data_batismo || undefined,
          cargo: student.cargo,
          id_pai_mae: student.id_pai_mae || undefined,
          ativo: student.ativo ?? true,
          observacoes: student.observacoes || undefined,
          created_at: student.created_at || new Date().toISOString(),
          updated_at: student.updated_at || new Date().toISOString(),

          // Enhanced fields with defaults
          familia: (student as any).familia || student.nome?.split(' ').pop() || '',
          data_nascimento: (student as any).data_nascimento || undefined,
          estado_civil: (student as any).estado_civil || 'desconhecido',
          papel_familiar: (student as any).papel_familiar || undefined,
          id_pai: (student as any).id_pai || undefined,
          id_mae: (student as any).id_mae || undefined,
          id_conjuge: (student as any).id_conjuge || undefined,
          coabitacao: (student as any).coabitacao ?? true,
          menor: (student as any).menor ?? ((student.idade || 0) < 18),
          responsavel_primario: (student as any).responsavel_primario || undefined,
          responsavel_secundario: (student as any).responsavel_secundario || undefined,

          // Qualification fields with defaults
          chairman: (student as any).chairman ?? false,
          pray: (student as any).pray ?? false,
          tresures: (student as any).tresures ?? false,
          gems: (student as any).gems ?? false,
          reading: (student as any).reading ?? false,
          starting: (student as any).starting ?? false,
          following: (student as any).following ?? false,
          making: (student as any).making ?? false,
          explaining: (student as any).explaining ?? false,
          talk: (student as any).talk ?? false
        };
        return enhanced;
      } else {
        return convertToEnhanced(student as EstudanteRow);
      }
    });
  }, [rawStudents]);

  // Create students with family relationships
  const studentsWithFamily = useMemo(() => {
    return students.map(student => {
      // Find family members
      const family_members = students.filter(s =>
        s.id !== student.id && s.familia === student.familia
      );

      // Calculate family relationships
      const pai = students.find(s => s.id === student.id_pai);
      const mae = students.find(s => s.id === student.id_mae);
      const conjuge = students.find(s => s.id === student.id_conjuge);
      const filhos = students.filter(s => s.id_pai === student.id || s.id_mae === student.id);

      const withFamily: EstudanteWithFamily = {
        ...student,
        pai,
        mae,
        conjuge,
        filhos,
        responsavel_primario_info: students.find(s => s.id === student.responsavel_primario),
        responsavel_secundario_info: students.find(s => s.id === student.responsavel_secundario),

        // Computed flags
        is_adult_child: student.papel_familiar === 'filho_adulto' || student.papel_familiar === 'filha_adulta',
        has_dependents: filhos.length > 0 || students.some(s => s.responsavel_primario === student.id),
        is_family_head: (student.papel_familiar === 'pai' || student.papel_familiar === 'mae') && filhos.length > 0,
        can_be_paired_with_opposite_gender: !!(pai || mae || conjuge || family_members.some(fm => fm.genero !== student.genero)),

        // Family tree information
        family_members,
        family_conflicts: [], // Would be computed by validation
        nuclear_family_size: 1 + (pai ? 1 : 0) + (mae ? 1 : 0) + (conjuge ? 1 : 0) + filhos.length,

        // S-38-T compliance information
        pairing_restrictions: {
          can_pair_with_males: student.genero === 'masculino' || family_members.some(fm => fm.genero === 'masculino'),
          can_pair_with_females: student.genero === 'feminino' || family_members.some(fm => fm.genero === 'feminino'),
          requires_family_relationship: student.genero !== student.genero, // Mixed gender requires family
          family_member_ids: family_members.map(fm => fm.id)
        }
      };

      return withFamily;
    });
  }, [students]);

  // Apply filters
  const filteredStudents = useMemo(() => {
    let filtered = students;

    // Search term
    if (filters.searchTerm) {
      const searchLower = filters.searchTerm.toLowerCase();
      filtered = filtered.filter(student =>
        student.nome.toLowerCase().includes(searchLower) ||
        student.email?.toLowerCase().includes(searchLower) ||
        student.familia?.toLowerCase().includes(searchLower)
      );
    }

    // Cargo filter
    if (filters.cargo && filters.cargo !== 'todos') {
      filtered = filtered.filter(student => student.cargo === filters.cargo);
    }

    // Gender filter
    if (filters.genero && filters.genero !== 'todos') {
      filtered = filtered.filter(student => student.genero === filters.genero);
    }

    // Active status filter
    if (filters.ativo !== 'todos') {
      filtered = filtered.filter(student => student.ativo === filters.ativo);
    }

    // Estado civil filter
    if (filters.estado_civil && filters.estado_civil !== 'todos') {
      filtered = filtered.filter(student => student.estado_civil === filters.estado_civil);
    }

    // Papel familiar filter
    if (filters.papel_familiar && filters.papel_familiar !== 'todos') {
      filtered = filtered.filter(student => student.papel_familiar === filters.papel_familiar);
    }

    // Minor status filter
    if (filters.menor !== 'todos') {
      filtered = filtered.filter(student => student.menor === filters.menor);
    }

    // Family filter
    if (filters.familia) {
      filtered = filtered.filter(student =>
        student.familia?.toLowerCase().includes(filters.familia.toLowerCase())
      );
    }

    // Age range filters
    if (filters.idade_min !== undefined) {
      filtered = filtered.filter(student => student.idade >= filters.idade_min!);
    }

    if (filters.idade_max !== undefined) {
      filtered = filtered.filter(student => student.idade <= filters.idade_max!);
    }

    // Family relationships filter
    if (filters.has_family_relationships) {
      filtered = filtered.filter(student =>
        student.id_pai || student.id_mae || student.id_conjuge ||
        students.some(s => s.id_pai === student.id || s.id_mae === student.id)
      );
    }

    // Qualifications filter
    if (filters.qualifications) {
      const quals = filters.qualifications;
      filtered = filtered.filter(student => {
        return Object.entries(quals).every(([qual, required]) => {
          if (required === undefined) return true;
          return student[qual as keyof EstudanteEnhanced] === required;
        });
      });
    }

    return filtered;
  }, [students, filters]);

  // Calculate statistics
  const statistics = useMemo((): EstudanteStatistics => {
    const total = students.length;
    const ativos = students.filter(s => s.ativo).length;
    const inativos = total - ativos;
    const menores = students.filter(s => s.menor).length;
    const homens = students.filter(s => s.genero === 'masculino').length;
    const mulheres = students.filter(s => s.genero === 'feminino').length;

    // Enhanced statistics
    const familyNames = new Set(students.map(s => s.familia).filter(Boolean));
    const families = familyNames.size;

    const nuclearFamilies = new Set();
    students.forEach(s => {
      if (s.id_pai || s.id_mae) {
        const familyKey = `${s.id_pai || 'none'}-${s.id_mae || 'none'}`;
        nuclearFamilies.add(familyKey);
      }
    });

    const single_parents = students.filter(s =>
      (s.papel_familiar === 'pai' || s.papel_familiar === 'mae') &&
      !s.id_conjuge &&
      students.some(child => child.id_pai === s.id || child.id_mae === s.id)
    ).length;

    const married_couples = students.filter(s => s.id_conjuge).length / 2; // Divide by 2 since each couple is counted twice

    const adult_children = students.filter(s =>
      s.papel_familiar === 'filho_adulto' || s.papel_familiar === 'filha_adulta'
    ).length;

    // Cargo statistics
    const cargoStats = students.reduce((acc, student) => {
      acc[student.cargo] = (acc[student.cargo] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Estado civil statistics
    const estadoCivilStats = students.reduce((acc, student) => {
      acc[student.estado_civil] = (acc[student.estado_civil] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Papel familiar statistics
    const papelFamiliarStats = students.reduce((acc, student) => {
      if (student.papel_familiar) {
        acc[student.papel_familiar] = (acc[student.papel_familiar] || 0) + 1;
      }
      return acc;
    }, {} as Record<string, number>);

    // Family relationship statistics
    const parent_child = students.filter(s => s.id_pai || s.id_mae).length;
    const spouse = students.filter(s => s.id_conjuge).length;
    const guardian = students.filter(s => s.responsavel_primario).length;
    const total_links = parent_child + spouse + guardian;

    // S-38-T compliance statistics
    const can_read_bible = students.filter(s => s.reading && s.genero === 'masculino').length;
    const can_give_talks = students.filter(s => s.talk && s.genero === 'masculino').length;
    const can_do_demonstrations = students.filter(s => s.ativo).length; // All active students can do demonstrations
    const can_be_paired_mixed_gender = studentsWithFamily.filter(s => s.can_be_paired_with_opposite_gender).length;

    return {
      total,
      ativos,
      inativos,
      menores,
      homens,
      mulheres,
      families,
      nuclear_families: nuclearFamilies.size,
      single_parents,
      married_couples,
      adult_children,
      cargoStats: cargoStats as any,
      estadoCivilStats: estadoCivilStats as any,
      papelFamiliarStats: papelFamiliarStats as any,
      family_relationships: {
        parent_child,
        spouse,
        guardian,
        total_links
      },
      s38t_compliance: {
        can_read_bible,
        can_give_talks,
        can_do_demonstrations,
        can_be_paired_mixed_gender
      }
    };
  }, [students, studentsWithFamily]);

  // Migration status
  const migrationStatus = useMemo(() => {
    const status = MigrationStatusHelper.calculateMigrationProgress(rawStudents);
    return {
      ...status,
      needsMigration: status.needsMigration.map(convertToEnhanced),
      isFullyMigrated: status.progress >= 95 // Consider 95%+ as fully migrated
    };
  }, [rawStudents]);

  // Filter management
  const setFilters = useCallback((newFilters: Partial<EstudanteFilters>) => {
    setFiltersState(prev => ({ ...prev, ...newFilters }));
  }, []);

  const clearFilters = useCallback(() => {
    setFiltersState(DEFAULT_FILTERS);
  }, []);

  // CRUD operations
  const createStudentMutation = useMutation({
    mutationFn: async (studentData: CreateEstudanteInput): Promise<EstudanteEnhanced> => {
      if (!user?.id) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('estudantes')
        .insert({
          ...studentData,
          user_id: user.id
        })
        .select()
        .single();

      if (error) throw error;
      return convertToEnhanced(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['enhanced-estudantes'] });
      toast.success('Estudante criado com sucesso');
    },
    onError: (error) => {
      console.error('Error creating student:', error);
      toast.error('Erro ao criar estudante');
    }
  });

  const updateStudentMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: UpdateEstudanteInput }): Promise<EstudanteEnhanced> => {
      const { data, error } = await supabase
        .from('estudantes')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return convertToEnhanced(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['enhanced-estudantes'] });
      toast.success('Estudante atualizado com sucesso');
    },
    onError: (error) => {
      console.error('Error updating student:', error);
      toast.error('Erro ao atualizar estudante');
    }
  });

  const deleteStudentMutation = useMutation({
    mutationFn: async (id: string): Promise<void> => {
      const { error } = await supabase
        .from('estudantes')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['enhanced-estudantes'] });
      toast.success('Estudante removido com sucesso');
    },
    onError: (error) => {
      console.error('Error deleting student:', error);
      toast.error('Erro ao remover estudante');
    }
  });

  // Utility functions
  const getStudentById = useCallback((id: string) => {
    return students.find(s => s.id === id);
  }, [students]);

  const getStudentsByFamily = useCallback((familia: string) => {
    return students.filter(s => s.familia === familia);
  }, [students]);

  const canStudentsBePaired = useCallback(async (student1Id: string, student2Id: string): Promise<boolean> => {
    try {
      const { data, error } = await (supabase as any).rpc('can_students_be_paired', {
        student1_id: student1Id,
        student2_id: student2Id
      });

      if (error) {
        console.error('Error checking student pairing:', error);
        return false;
      }

      return data;
    } catch (error) {
      console.error('Exception checking student pairing:', error);
      return false;
    }
  }, []);

  // Family operations
  const linkFamily = useCallback(async (studentId: string, relativeId: string, relationship: string) => {
    try {
      const { error } = await (supabase as any)
        .from('family_links')
        .insert({
          user_id: user?.id,
          source_id: studentId,
          target_id: relativeId,
          relacao: relationship as any
        });

      if (error) throw error;

      queryClient.invalidateQueries({ queryKey: ['enhanced-estudantes'] });
      toast.success('Relacionamento familiar criado');
    } catch (error) {
      console.error('Error linking family:', error);
      toast.error('Erro ao criar relacionamento familiar');
    }
  }, [user?.id, queryClient]);

  const unlinkFamily = useCallback(async (studentId: string, relativeId: string) => {
    try {
      const { error } = await (supabase as any)
        .from('family_links')
        .delete()
        .eq('source_id', studentId)
        .eq('target_id', relativeId);

      if (error) throw error;

      queryClient.invalidateQueries({ queryKey: ['enhanced-estudantes'] });
      toast.success('Relacionamento familiar removido');
    } catch (error) {
      console.error('Error unlinking family:', error);
      toast.error('Erro ao remover relacionamento familiar');
    }
  }, [queryClient]);

  // Bulk operations
  const bulkUpdate = useCallback(async (updates: Array<{ id: string; data: UpdateEstudanteInput }>) => {
    try {
      const promises = updates.map(({ id, data }) =>
        supabase.from('estudantes').update(data).eq('id', id)
      );

      await Promise.all(promises);

      queryClient.invalidateQueries({ queryKey: ['enhanced-estudantes'] });
      toast.success(`${updates.length} estudantes atualizados`);
    } catch (error) {
      console.error('Error bulk updating students:', error);
      toast.error('Erro na atualização em lote');
    }
  }, [queryClient]);

  const bulkDelete = useCallback(async (ids: string[]) => {
    try {
      const { error } = await supabase
        .from('estudantes')
        .delete()
        .in('id', ids);

      if (error) throw error;

      queryClient.invalidateQueries({ queryKey: ['enhanced-estudantes'] });
      toast.success(`${ids.length} estudantes removidos`);
    } catch (error) {
      console.error('Error bulk deleting students:', error);
      toast.error('Erro na remoção em lote');
    }
  }, [queryClient]);

  return {
    // Data
    students,
    studentsWithFamily,
    filteredStudents,
    statistics,

    // Loading states
    isLoading,
    isError,
    error: error as Error | null,

    // Migration status
    migrationStatus,

    // Filtering
    filters,
    setFilters,
    clearFilters,

    // CRUD operations
    createStudent: createStudentMutation.mutateAsync,
    updateStudent: (id: string, updates: UpdateEstudanteInput) =>
      updateStudentMutation.mutateAsync({ id, updates }),
    deleteStudent: deleteStudentMutation.mutateAsync,

    // Bulk operations
    bulkUpdate,
    bulkDelete,

    // Family operations
    linkFamily,
    unlinkFamily,

    // Utility functions
    getStudentById,
    getStudentsByFamily,
    canStudentsBePaired,

    // Refresh
    refetch: async () => {
      await refetch();
    }
  };
}
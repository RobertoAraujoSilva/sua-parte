import { useState, useCallback, useEffect, useMemo } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';

export interface EstudanteWithParent {
  id: string;
  nome: string;
  idade?: number;
  genero: 'masculino' | 'feminino';
  email?: string;
  telefone?: string;
  data_batismo?: string;
  cargo: 'anciao' | 'servo_ministerial' | 'pioneiro_regular' | 'publicador_batizado' | 'publicador_nao_batizado' | 'estudante_novo';
  pai_id?: string;
  mae_id?: string;
  ativo: boolean;
  user_id: string;
  congregacao?: string;
  created_at: string;
  updated_at: string;
}

export interface EstudanteFilters {
  searchTerm: string;
  cargo: string;
  genero: string;
  ativo: string;
}

export interface EstudanteStatistics {
  total: number;
  ativos: number;
  inativos: number;
  menores: number;
  homens: number;
  mulheres: number;
  qualificados: number;
}

export function useEstudantes(activeTab?: string) {
  const { user } = useAuth();
  const [estudantes, setEstudantes] = useState<EstudanteWithParent[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchEstudantes = useCallback(async () => {
    if (!user?.id) return;

    setIsLoading(true);
    setError(null);

    try {
      const { data, error: fetchError } = await supabase
        .from('estudantes')
        .select(`
          id,
          nome,
          idade,
          genero,
          email,
          telefone,
          data_batismo,
          cargo,
          ativo,
          user_id,
          created_at,
          updated_at
        `)
        .eq('user_id', user.id)
        .order('nome');

      if (fetchError) {
        throw new Error(`Erro ao buscar estudantes: ${fetchError.message}`);
      }

      setEstudantes(data || []);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
      setError(errorMessage);
      console.error('Erro ao buscar estudantes:', err);
    } finally {
      setIsLoading(false);
    }
  }, [user?.id]);

  const createEstudante = useCallback(async (estudanteData: Partial<EstudanteWithParent>) => {
    if (!user?.id) throw new Error('Usuário não autenticado');

    try {
      // Garantir que campos obrigatórios estejam presentes
      const dataToInsert = {
        nome: estudanteData.nome || '',
        genero: estudanteData.genero || 'masculino',
        cargo: estudanteData.cargo || 'estudante_novo',
        ...estudanteData,
        user_id: user.id,
        ativo: true
      };

      const { data, error } = await supabase
        .from('estudantes')
        .insert(dataToInsert)
        .select()
        .single();

      if (error) throw error;

      await fetchEstudantes();
      return data;
    } catch (err) {
      console.error('Erro ao criar estudante:', err);
      throw err;
    }
  }, [user?.id, fetchEstudantes]);

  const updateEstudante = useCallback(async ({ id, data }: { id: string; data: Partial<EstudanteWithParent> }) => {
    try {
      const { data: updatedData, error } = await supabase
        .from('estudantes')
        .update(data)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      await fetchEstudantes();
      return updatedData;
    } catch (err) {
      console.error('Erro ao atualizar estudante:', err);
      throw err;
    }
  }, [fetchEstudantes]);

  const deleteEstudante = useCallback(async (estudanteId: string) => {
    try {
      const { error } = await supabase
        .from('estudantes')
        .update({ ativo: false })
        .eq('id', estudanteId);

      if (error) throw error;

      await fetchEstudantes();
    } catch (err) {
      console.error('Erro ao excluir estudante:', err);
      throw err;
    }
  }, [fetchEstudantes]);

  const filterEstudantes = useCallback((filters: EstudanteFilters) => {
    return estudantes.filter(estudante => {
      const matchesSearch = !filters.searchTerm || 
        estudante.nome.toLowerCase().includes(filters.searchTerm.toLowerCase());
      
      const matchesCargo = filters.cargo === 'todos' || estudante.cargo === filters.cargo;
      
      const matchesGenero = filters.genero === 'todos' || estudante.genero === filters.genero;
      
      const matchesAtivo = filters.ativo === 'todos' || 
        (filters.ativo === 'ativo' && estudante.ativo) ||
        (filters.ativo === 'inativo' && !estudante.ativo);

      return matchesSearch && matchesCargo && matchesGenero && matchesAtivo;
    });
  }, [estudantes]);

  const getStatistics = useCallback((): EstudanteStatistics => {
    const total = estudantes.length;
    const ativos = estudantes.filter(e => e.ativo).length;
    const inativos = total - ativos;
    const menores = estudantes.filter(e => e.idade && e.idade < 18).length;
    const homens = estudantes.filter(e => e.genero === 'masculino').length;
    const mulheres = estudantes.filter(e => e.genero === 'feminino').length;
    const qualificados = estudantes.filter(e => 
      ['anciao', 'servo_ministerial', 'publicador_batizado'].includes(e.cargo)
    ).length;

    return {
      total,
      ativos,
      inativos,
      menores,
      homens,
      mulheres,
      qualificados
    };
  }, [estudantes]);

  const refetch = useCallback(() => {
    return fetchEstudantes();
  }, [fetchEstudantes]);

  useEffect(() => {
    if (user?.id) {
      fetchEstudantes();
    }
  }, [user?.id, fetchEstudantes]);

  return {
    estudantes,
    isLoading,
    error,
    refetch,
    createEstudante,
    updateEstudante,
    deleteEstudante,
    filterEstudantes,
    getStatistics,
  };
}

// Constantes para labels
export const CARGO_LABELS = {
  anciao: 'Ancião',
  servo_ministerial: 'Servo Ministerial',
  pioneiro_regular: 'Pioneiro Regular',
  publicador_batizado: 'Publicador Batizado',
  publicador_nao_batizado: 'Publicador Não Batizado',
  estudante_novo: 'Estudante Novo'
};

export const GENERO_LABELS = {
  masculino: 'Masculino',
  feminino: 'Feminino'
};

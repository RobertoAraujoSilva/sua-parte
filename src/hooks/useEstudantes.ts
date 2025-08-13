import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";
import {
  EstudanteRow,
  EstudanteInsert,
  EstudanteUpdate,
  EstudanteWithParent,
  EstudanteFilters,
  EstudanteFormData,
  validateEstudante,
} from "@/types/estudantes";

export const useEstudantes = () => {
  const { user } = useAuth();
  const [estudantes, setEstudantes] = useState<EstudanteWithParent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch all students for the current user (own students + same congregation)
  const fetchEstudantes = async () => {
    if (!user) return;

    try {
      setLoading(true);
      setError(null);

      // Get user's congregation from profiles
      const { data: userProfile } = await supabase
        .from('profiles')
        .select('congregacao')
        .eq('id', user.id)
        .single();
      
      const userCongregacao = userProfile?.congregacao || user.user_metadata?.congregacao || 'Market Harborough';
      
      console.log('🔍 Fetching students for congregation:', userCongregacao);
      
      const { data, error } = await supabase
        .from("estudantes")
        .select('*')
        .order("nome");
      
      if (error) {
        console.error('❌ Error fetching students:', error);
        throw error;
      }
      
      console.log('📊 Raw data from database:', data?.length || 0, 'total students');
      console.log('🔍 All congregations found:', [...new Set(data?.map(s => s.congregacao))]);
      
      // TEMPORARY: Show all students for debugging
      const filteredData = data || [];
      
      console.log('⚠️ TEMPORARY: Showing all students for debugging');
      
      // Original filter (commented for debug)
      // const filteredData = data?.filter(student => {
      //   const match = student.congregacao === userCongregacao ||
      //                student.congregacao?.toLowerCase() === userCongregacao?.toLowerCase() ||
      //                student.congregacao?.includes(userCongregacao) ||
      //                userCongregacao?.includes(student.congregacao || '');
      //   
      //   if (match) {
      //     console.log('✅ Student matched:', student.nome, 'from', student.congregacao);
      //   }
      //   return match;
      // }) || [];
      
      console.log('✅ Students fetched and filtered:', filteredData.length, 'students found for', userCongregacao);

      // Simple mapping for now
      const estudantesWithRelations = filteredData.map((estudante) => ({
        ...estudante,
        pai_mae: null,
        filhos: [],
      }));

      setEstudantes(estudantesWithRelations);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Erro ao carregar estudantes";
      setError(errorMessage);
      toast({
        title: "Erro",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Create a new student
  const createEstudante = async (data: EstudanteFormData): Promise<boolean> => {
    if (!user) return false;

    // Validate data
    const errors = validateEstudante(data);
    if (Object.keys(errors).length > 0) {
      const firstError = Object.values(errors)[0];
      toast({
        title: "Erro de validação",
        description: firstError,
        variant: "destructive",
      });
      return false;
    }

    try {
      const insertData: EstudanteInsert = {
        ...data,
        user_id: user.id,
        congregacao: user.user_metadata?.congregacao || 'Market Harborough',
        congregacao_id: null, // Will be set by trigger
        data_batismo: data.data_batismo || null,
        email: data.email || null,
        telefone: data.telefone || null,
        id_pai_mae: data.id_pai_mae || null,
        observacoes: data.observacoes || null,
      };

      const { error } = await supabase
        .from("estudantes")
        .insert(insertData);

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Estudante cadastrado com sucesso!",
      });

      await fetchEstudantes();
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Erro ao cadastrar estudante";
      toast({
        title: "Erro",
        description: errorMessage,
        variant: "destructive",
      });
      return false;
    }
  };

  // Update an existing student
  const updateEstudante = async (id: string, data: Partial<EstudanteFormData>): Promise<boolean> => {
    if (!user) return false;

    try {
      const updateData: EstudanteUpdate = {
        ...data,
        updated_at: new Date().toISOString(),
      };

      const { error } = await supabase
        .from("estudantes")
        .update(updateData)
        .eq("id", id)
        .eq("user_id", user.id);

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Estudante atualizado com sucesso!",
      });

      await fetchEstudantes();
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Erro ao atualizar estudante";
      toast({
        title: "Erro",
        description: errorMessage,
        variant: "destructive",
      });
      return false;
    }
  };

  // Delete a student
  const deleteEstudante = async (id: string): Promise<boolean> => {
    if (!user) return false;

    try {
      // Check if student has children
      const hasChildren = estudantes.some(e => e.id_pai_mae === id);
      if (hasChildren) {
        toast({
          title: "Erro",
          description: "Não é possível excluir um estudante que é responsável por menores",
          variant: "destructive",
        });
        return false;
      }

      const { error } = await supabase
        .from("estudantes")
        .delete()
        .eq("id", id)
        .eq("user_id", user.id);

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Estudante removido com sucesso!",
      });

      await fetchEstudantes();
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Erro ao remover estudante";
      toast({
        title: "Erro",
        description: errorMessage,
        variant: "destructive",
      });
      return false;
    }
  };

  // Filter students based on criteria
  const filterEstudantes = (filters: EstudanteFilters): EstudanteWithParent[] => {
    return estudantes.filter((estudante) => {
      // Search term filter
      if (filters.searchTerm) {
        const searchLower = filters.searchTerm.toLowerCase();
        if (!estudante.nome.toLowerCase().includes(searchLower)) {
          return false;
        }
      }

      // Cargo filter
      if (filters.cargo && filters.cargo !== "todos") {
        if (estudante.cargo !== filters.cargo) {
          return false;
        }
      }

      // Genero filter
      if (filters.genero && filters.genero !== "todos") {
        if (estudante.genero !== filters.genero) {
          return false;
        }
      }

      // Ativo filter
      if (filters.ativo !== undefined && filters.ativo !== "todos") {
        if (estudante.ativo !== filters.ativo) {
          return false;
        }
      }

      // Age range filter
      if (filters.idade_min !== undefined && estudante.idade && estudante.idade < filters.idade_min) {
        return false;
      }
      if (filters.idade_max !== undefined && estudante.idade && estudante.idade > filters.idade_max) {
        return false;
      }

      return true;
    });
  };

  // Get students that can be parents (adults)
  const getPotentialParents = (): EstudanteWithParent[] => {
    return estudantes.filter(e => e.idade && e.idade >= 18 && e.ativo);
  };

  // Get statistics
  const getStatistics = () => {
    const total = estudantes.length;
    const ativos = estudantes.filter(e => e.ativo).length;
    const menores = estudantes.filter(e => e.idade && e.idade < 18).length;
    const homens = estudantes.filter(e => e.genero === "masculino").length;
    const mulheres = estudantes.filter(e => e.genero === "feminino").length;

    const cargoStats = estudantes.reduce((acc, e) => {
      acc[e.cargo] = (acc[e.cargo] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      total,
      ativos,
      inativos: total - ativos,
      menores,
      homens,
      mulheres,
      cargoStats,
    };
  };

  // Load data on mount and when user changes
  useEffect(() => {
    if (user) {
      fetchEstudantes();
    }
  }, [user]);

  // Bulk import students
  const bulkImportEstudantes = async (estudantesData: EstudanteInsert[]): Promise<boolean> => {
    if (!user) {
      toast({
        title: "Erro",
        description: "Usuário não autenticado",
        variant: "destructive",
      });
      return false;
    }

    try {
      const { error } = await supabase
        .from("estudantes")
        .insert(estudantesData);

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: `${estudantesData.length} estudantes importados com sucesso!`,
      });

      await fetchEstudantes();
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Erro na importação em massa";
      toast({
        title: "Erro",
        description: errorMessage,
        variant: "destructive",
      });
      return false;
    }
  };

  return {
    estudantes,
    loading,
    error,
    fetchEstudantes,
    createEstudante,
    updateEstudante,
    deleteEstudante,
    filterEstudantes,
    getPotentialParents,
    getStatistics,
    bulkImportEstudantes,
  };
};

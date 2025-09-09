import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import {
  EstudanteInsert,
  EstudanteUpdate,
  EstudanteWithParent,
  EstudanteFilters,
  EstudanteFormData,
  validateEstudante,
} from "@/types/estudantes";
import { useAuth } from "@/contexts/AuthContext";

function withTimeout<T>(p: Promise<T>, ms = 10000) {
  return Promise.race([p, new Promise<never>((_, r) => setTimeout(() => r(new Error("timeout")), ms))]);
}

export function useEstudantes(scope: string) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const queryKey = ["estudantes", scope];

  const { data: estudantes, isLoading, error, refetch } = useQuery({
    queryKey: queryKey,
    queryFn: async () => {
      const { data, error } = await withTimeout(
        supabase.from("estudantes").select("*").limit(200)
      );
      if (error) throw error;
      return data || [];
    },
    retry: 2,
    staleTime: 5 * 60_000,
  });

  const createEstudanteMutation = useMutation({
    mutationFn: async (data: EstudanteFormData) => {
      if (!user) throw new Error("User not authenticated");
      const errors = validateEstudante(data);
      if (Object.keys(errors).length > 0) throw new Error(Object.values(errors)[0]);

      const insertData: EstudanteInsert = {
        ...data,
        user_id: user.id,
        congregacao: user.user_metadata?.congregacao || 'Default',
      };
      const { error } = await supabase.from("estudantes").insert(insertData);
      if (error) throw error;
    },
    onSuccess: () => {
      toast({ title: "Sucesso", description: "Estudante cadastrado." });
      queryClient.invalidateQueries({ queryKey });
    },
    onError: (err) => {
      toast({ title: "Erro", description: err.message, variant: "destructive" });
    },
  });

  const updateEstudanteMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string, data: Partial<EstudanteFormData> }) => {
      if (!user) throw new Error("User not authenticated");
      const updateData: EstudanteUpdate = { ...data, updated_at: new Date().toISOString() };
      const { error } = await supabase.from("estudantes").update(updateData).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast({ title: "Sucesso", description: "Estudante atualizado." });
      queryClient.invalidateQueries({ queryKey });
    },
    onError: (err) => {
      toast({ title: "Erro", description: err.message, variant: "destructive" });
    },
  });

  const deleteEstudanteMutation = useMutation({
    mutationFn: async (id: string) => {
      if (!user) throw new Error("User not authenticated");
      const { error } = await supabase.from("estudantes").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast({ title: "Sucesso", description: "Estudante removido." });
      queryClient.invalidateQueries({ queryKey });
    },
    onError: (err) => {
      toast({ title: "Erro", description: err.message, variant: "destructive" });
    },
  });

  const filterEstudantes = (filters: EstudanteFilters): EstudanteWithParent[] => {
    if (!estudantes) return [];
    return estudantes.filter((estudante) => {
      if (filters.searchTerm && !estudante.nome.toLowerCase().includes(filters.searchTerm.toLowerCase())) return false;
      if (filters.cargo && filters.cargo !== "todos" && estudante.cargo !== filters.cargo) return false;
      if (filters.genero && filters.genero !== "todos" && estudante.genero !== filters.genero) return false;
      if (filters.ativo !== undefined && filters.ativo !== "todos" && estudante.ativo !== filters.ativo) return false;
      return true;
    });
  };

  const getStatistics = () => {
    if (!estudantes) return { total: 0, ativos: 0, inativos: 0, menores: 0, homens: 0, mulheres: 0, cargoStats: {} };
    const total = estudantes.length;
    const ativos = estudantes.filter(e => e.ativo).length;
    const menores = estudantes.filter(e => e.idade && e.idade < 18).length;
    const homens = estudantes.filter(e => e.genero === "masculino").length;
    const mulheres = estudantes.filter(e => e.genero === "feminino").length;
    const cargoStats = estudantes.reduce((acc, e) => {
      acc[e.cargo] = (acc[e.cargo] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    return { total, ativos, inativos: total - ativos, menores, homens, mulheres, cargoStats };
  };

  return {
    estudantes,
    isLoading,
    error,
    refetch,
    createEstudante: createEstudanteMutation.mutateAsync,
    updateEstudante: updateEstudanteMutation.mutateAsync,
    deleteEstudante: deleteEstudanteMutation.mutateAsync,
    filterEstudantes,
    getStatistics,
  };
}

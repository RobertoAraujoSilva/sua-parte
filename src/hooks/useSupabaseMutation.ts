/**
 * Generic Supabase Mutation Hook
 * Eliminates redundant mutation patterns (create, update, delete)
 */

import { useMutation, useQueryClient, UseMutationOptions } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface MutationConfig {
  table: string;
  invalidateKeys?: string[];
  successMessage?: string;
  errorMessage?: string;
}

// Create mutation
export function useSupabaseCreate<T = any>(
  config: MutationConfig,
  options?: Omit<UseMutationOptions<T, Error, Partial<T>>, 'mutationFn'>
) {
  const queryClient = useQueryClient();
  const { table, invalidateKeys, successMessage, errorMessage } = config;

  return useMutation<T, Error, Partial<T>>({
    mutationFn: async (data: Partial<T>) => {
      const { data: result, error } = await (supabase as any)
        .from(table)
        .insert(data as any)
        .select()
        .single();

      if (error) throw error;
      return result as T;
    },
    onSuccess: (data) => {
      // Invalidate queries
      if (invalidateKeys) {
        invalidateKeys.forEach((key) => {
          queryClient.invalidateQueries({ queryKey: [key] });
        });
      } else {
        queryClient.invalidateQueries({ queryKey: [table] });
      }

      if (successMessage) {
        toast.success(successMessage);
      }
    },
    onError: (error) => {
      console.error(`Error creating ${table}:`, error);
      toast.error(errorMessage || `Erro ao criar registro em ${table}`);
    },
    ...options,
  });
}

// Update mutation
export function useSupabaseUpdate<T = any>(
  config: MutationConfig,
  options?: Omit<UseMutationOptions<T, Error, { id: string; data: Partial<T> }>, 'mutationFn'>
) {
  const queryClient = useQueryClient();
  const { table, invalidateKeys, successMessage, errorMessage } = config;

  return useMutation<T, Error, { id: string; data: Partial<T> }>({
    mutationFn: async ({ id, data }) => {
      const { data: result, error } = await (supabase as any)
        .from(table)
        .update(data as any)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return result as T;
    },
    onSuccess: () => {
      if (invalidateKeys) {
        invalidateKeys.forEach((key) => {
          queryClient.invalidateQueries({ queryKey: [key] });
        });
      } else {
        queryClient.invalidateQueries({ queryKey: [table] });
      }

      if (successMessage) {
        toast.success(successMessage);
      }
    },
    onError: (error) => {
      console.error(`Error updating ${table}:`, error);
      toast.error(errorMessage || `Erro ao atualizar registro em ${table}`);
    },
    ...options,
  });
}

// Delete/soft delete mutation
export function useSupabaseDelete(
  config: MutationConfig & { softDelete?: boolean },
  options?: Omit<UseMutationOptions<void, Error, string>, 'mutationFn'>
) {
  const queryClient = useQueryClient();
  const { table, invalidateKeys, successMessage, errorMessage, softDelete } = config;

  return useMutation<void, Error, string>({
    mutationFn: async (id: string) => {
      if (softDelete) {
        const { error } = await (supabase as any)
          .from(table)
          .update({ ativo: false } as any)
          .eq('id', id);

        if (error) throw error;
      } else {
        const { error } = await (supabase as any).from(table).delete().eq('id', id);

        if (error) throw error;
      }
    },
    onSuccess: () => {
      if (invalidateKeys) {
        invalidateKeys.forEach((key) => {
          queryClient.invalidateQueries({ queryKey: [key] });
        });
      } else {
        queryClient.invalidateQueries({ queryKey: [table] });
      }

      if (successMessage) {
        toast.success(successMessage);
      }
    },
    onError: (error) => {
      console.error(`Error deleting ${table}:`, error);
      toast.error(errorMessage || `Erro ao deletar registro em ${table}`);
    },
    ...options,
  });
}

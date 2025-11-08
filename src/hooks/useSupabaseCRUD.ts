/**
 * Generic Supabase CRUD Hook
 * Combines create, update, and delete operations for a table
 */

import { MutationConfig, useSupabaseCreate, useSupabaseUpdate, useSupabaseDelete } from './useSupabaseMutation';

export interface CRUDConfig extends MutationConfig {
  softDelete?: boolean;
  createSuccessMessage?: string;
  updateSuccessMessage?: string;
  deleteSuccessMessage?: string;
}

export function useSupabaseCRUD<T = any>(config: CRUDConfig) {
  const {
    table,
    invalidateKeys,
    softDelete = true,
    createSuccessMessage = 'Registro criado com sucesso',
    updateSuccessMessage = 'Registro atualizado com sucesso',
    deleteSuccessMessage = 'Registro removido com sucesso',
  } = config;

  const create = useSupabaseCreate<T>({
    table,
    invalidateKeys,
    successMessage: createSuccessMessage,
  });

  const update = useSupabaseUpdate<T>({
    table,
    invalidateKeys,
    successMessage: updateSuccessMessage,
  });

  const remove = useSupabaseDelete({
    table,
    invalidateKeys,
    softDelete,
    successMessage: deleteSuccessMessage,
  });

  return {
    create: create.mutateAsync,
    update: update.mutateAsync,
    remove: remove.mutateAsync,
    isCreating: create.isPending,
    isUpdating: update.isPending,
    isDeleting: remove.isPending,
    createError: create.error,
    updateError: update.error,
    deleteError: remove.error,
  };
}

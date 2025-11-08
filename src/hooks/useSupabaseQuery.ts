/**
 * Generic Supabase Query Hook
 * Eliminates redundant query patterns across the app
 */

import { useQuery, UseQueryOptions } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface SupabaseQueryOptions<T> {
  table: string;
  select?: string;
  filters?: Record<string, any>;
  orderBy?: { column: string; ascending?: boolean };
  limit?: number;
  enabled?: boolean;
  staleTime?: number;
}

export function useSupabaseQuery<T = any>(
  options: SupabaseQueryOptions<T>,
  queryOptions?: Omit<UseQueryOptions<T[], Error>, 'queryKey' | 'queryFn'>
) {
  const { table, select = '*', filters, orderBy, limit, enabled = true, staleTime } = options;

  return useQuery<T[], Error>({
    queryKey: [table, filters, orderBy, limit],
    queryFn: async () => {
      // Start with any to avoid type issues with Supabase's complex types
      let query: any = (supabase as any).from(table).select(select);

      // Apply filters
      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            query = query.eq(key as any, value);
          }
        });
      }

      // Apply ordering
      if (orderBy) {
        query = query.order(orderBy.column as any, {
          ascending: orderBy.ascending ?? true,
        });
      }

      // Apply limit
      if (limit) {
        query = query.limit(limit);
      }

      const { data, error } = await query;

      if (error) {
        console.error(`Error fetching from ${table}:`, error);
        throw error;
      }

      return (data || []) as T[];
    },
    enabled,
    staleTime,
    ...queryOptions,
  });
}

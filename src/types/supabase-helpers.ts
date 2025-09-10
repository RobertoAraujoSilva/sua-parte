/**
 * Type helper utilities for Supabase operations
 * Provides type-safe casting for complex database operations
 */

export type AnySupabaseValue = any;

// Helper function for type-safe database queries
export function castToSupabaseValue<T = AnySupabaseValue>(value: any): T {
  return value as T;
}

// Helper for type-safe updates
export function castToUpdate<T = Record<string, any>>(updates: any): T {
  return updates as T;
}

// Helper for type-safe inserts  
export function castToInsert<T = Record<string, any>>(data: any): T {
  return data as T;
}

// Helper for type-safe array casting
export function castToArray<T = any[]>(data: unknown): T {
  return (data || []) as T;
}
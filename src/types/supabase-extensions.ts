// Simple type extensions to avoid conflicts
export interface BaseExtensions {
  id: string;
  created_at?: string;
  updated_at?: string;
}

export type SupabaseExtensions = BaseExtensions;
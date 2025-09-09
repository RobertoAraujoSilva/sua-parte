// Centralize Supabase client to avoid multiple GoTrue instances.
// Re-export the singleton from '@/lib/supabase'.
import type { Database } from './types';
import supabaseSingleton from '@/lib/supabase';

// Maintain named export for existing imports across the codebase
export const supabase = supabaseSingleton as unknown as import('@supabase/supabase-js').SupabaseClient<Database>;

export default supabase;

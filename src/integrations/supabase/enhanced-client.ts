/**
 * Enhanced Supabase Client (typed alias of the singleton)
 * 
 * Reuses the single browser Supabase instance to avoid multiple
 * GoTrue clients in the same context. Only extends the TypeScript
 * surface with DatabaseExtended.
 */

import type { SupabaseClient } from '@supabase/supabase-js';
import type { DatabaseExtended } from '@/types/supabase-extensions';
import baseClient from '@/lib/supabase';

export const enhancedSupabase = baseClient as SupabaseClient<DatabaseExtended>;
export default enhancedSupabase;

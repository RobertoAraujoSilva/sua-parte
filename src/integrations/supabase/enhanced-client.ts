/**
 * Enhanced Supabase Client with Extended Types
 * 
 * This client includes the new family_links table and enhanced types
 * that are not yet in the auto-generated types.
 */

import { createClient } from '@supabase/supabase-js';
import type { DatabaseExtended } from '@/types/supabase-extensions';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

// Create enhanced client with extended types
export const enhancedSupabase = createClient<DatabaseExtended>(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
});

// Export the enhanced client as default
export default enhancedSupabase;
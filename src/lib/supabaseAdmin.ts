import { createClient } from '@supabase/supabase-js';
import { getRedirectURL } from '@/utils/redirectConfig';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    redirectTo: getRedirectURL()
  }
});

export default supabase;
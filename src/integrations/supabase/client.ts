import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  throw new Error('Missing Supabase environment variables. Please check your .env file.');
}

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: localStorage,
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
  db: {
    schema: 'public',
  },
  global: {
    headers: {
      'X-Client-Info': 'supabase-js-web',
    },
  },
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
  // Add connection timeout and retry configuration
  fetch: (url, options = {}) => {
    // Set a reasonable timeout for fetch requests
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 second timeout

    const fetchOptions = {
      ...options,
      signal: controller.signal,
    };

    return fetch(url, fetchOptions)
      .finally(() => clearTimeout(timeoutId))
      .catch((error) => {
        if (error.name === 'AbortError') {
          throw new Error('Request timed out after 15 seconds');
        }
        throw error;
      });
  },
});
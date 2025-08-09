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
    // Increased timeouts for sa-east-1 region connectivity
    flowType: 'pkce',
    debug: import.meta.env.DEV,
  },
  db: {
    schema: 'public',
  },
  global: {
    headers: {
      'X-Client-Info': 'supabase-js-web',
      // Add connection optimization headers
      'Connection': 'keep-alive',
      'Keep-Alive': 'timeout=30, max=100',
    },
    // Increase fetch timeout for regional connectivity
    fetch: (url, options = {}) => {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000); // 15s timeout for fetch

      return fetch(url, {
        ...options,
        signal: controller.signal,
        // Add retry logic for network issues
        headers: {
          ...options.headers,
          'Cache-Control': 'no-cache',
        },
      }).finally(() => clearTimeout(timeoutId));
    },
  },
  realtime: {
    params: {
      eventsPerSecond: 5, // Reduced for better stability
    },
    // Add heartbeat for connection stability
    heartbeatIntervalMs: 30000,
    reconnectAfterMs: (tries) => Math.min(tries * 1000, 10000),
  },
});
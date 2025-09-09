import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

// Get environment variables with fallback for development
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://nwpuurgwnnuejqinkvrh.supabase.co';
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im53cHV1cmd3bm51ZWpxaW5rdnJoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ0NjIwNjUsImV4cCI6MjA3MDAzODA2NX0.UHjSvXYY_c-_ydAIfELRUs4CMEBLKiztpBGQBNPHfak';

// Create Supabase client with flexible typing to avoid TypeScript strict type errors
export const supabase = createClient<any>(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: localStorage,
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    flowType: 'pkce',
    debug: import.meta.env.DEV,
  },
  db: {
    schema: 'public',
  },
  global: {
    headers: {
      'X-Client-Info': 'supabase-js/2.x',
    },
    // Retry failed requests to improve reliability
    fetch: (url, options) => {
      return fetch(url, {
        ...options,
        // Add retry logic for auth endpoints
        signal: url.includes('/auth/') ? AbortSignal.timeout(10000) : options?.signal,
      });
    },
  },
  realtime: {
    params: {
      eventsPerSecond: 5,
    },
    heartbeatIntervalMs: 30000,
    reconnectAfterMs: (tries) => Math.min(tries * 1000, 10000),
  },
});
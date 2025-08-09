import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

// Get environment variables with fallback for development
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://nwpuurgwnnuejqinkvrh.supabase.co';
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im53cHV1cmd3bm51ZWpxaW5rdnJoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ0NjIwNjUsImV4cCI6MjA3MDAzODA2NX0.UHjSvXYY_c-_ydAIfELRUs4CMEBLKiztpBGQBNPHfak';

// Debug environment variables in development
if (import.meta.env.DEV) {
  console.log('🔍 Supabase Environment Debug:', {
    url: SUPABASE_URL ? `${SUPABASE_URL.substring(0, 30)}...` : 'MISSING',
    key: SUPABASE_ANON_KEY ? `${SUPABASE_ANON_KEY.substring(0, 20)}...` : 'MISSING',
    env: import.meta.env,
    mode: import.meta.env.MODE,
    dev: import.meta.env.DEV,
    envFromImportMeta: {
      url: import.meta.env.VITE_SUPABASE_URL ? 'LOADED' : 'MISSING',
      key: import.meta.env.VITE_SUPABASE_ANON_KEY ? 'LOADED' : 'MISSING'
    },
    usingFallback: {
      url: !import.meta.env.VITE_SUPABASE_URL,
      key: !import.meta.env.VITE_SUPABASE_ANON_KEY
    }
  });
}

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  const errorMsg = `Missing Supabase environment variables:
    VITE_SUPABASE_URL: ${SUPABASE_URL ? 'OK' : 'MISSING'}
    VITE_SUPABASE_ANON_KEY: ${SUPABASE_ANON_KEY ? 'OK' : 'MISSING'}

    Please check your .env file and restart the dev server.`;
  console.error('❌ Supabase Configuration Error:', errorMsg);
  throw new Error(errorMsg);
}

// Verify the client will be created with valid values
console.log('✅ Supabase Client Configuration:', {
  url: SUPABASE_URL,
  keyLength: SUPABASE_ANON_KEY.length,
  keyPrefix: SUPABASE_ANON_KEY.substring(0, 20) + '...'
});

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

// Create Supabase client with standard configuration
export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY, {
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
  realtime: {
    params: {
      eventsPerSecond: 5,
    },
    heartbeatIntervalMs: 30000,
    reconnectAfterMs: (tries) => Math.min(tries * 1000, 10000),
  },
});
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

// Get environment variables with fallback for development
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://nwpuurgwnnuejqinkvrh.supabase.co';
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im53cHV1cmd3bm51ZWpxaW5rdnJoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ0NjIwNjUsImV4cCI6MjA3MDAzODA2NX0.UHjSvXYY_c-_ydAIfELRUs4CMEBLKiztpBGQBNPHfak';

// Detect current environment and URL
const getCurrentUrl = () => {
  if (typeof window !== 'undefined') {
    return window.location.origin;
  }
  return 'http://localhost:5173'; // Fallback for SSR
};

const currentUrl = getCurrentUrl();
const isProduction = currentUrl.includes('https://');
const isRenderDeployment = currentUrl.includes('onrender.com');
const isLovableDeployment = currentUrl.includes('lovable.app');

// Conditional debug logging - only in development or when explicitly enabled
const isDev = import.meta.env.DEV;
const isDebugEnabled = typeof window !== 'undefined' && localStorage.getItem('debug-supabase') === 'true';
const shouldLog = isDev || isDebugEnabled;

if (shouldLog) {
  console.log('🔍 Supabase Environment Debug:', {
    currentUrl,
    isProduction,
    isRenderDeployment,
    isLovableDeployment,
    url: SUPABASE_URL ? `${SUPABASE_URL.substring(0, 30)}...` : 'MISSING',
    key: SUPABASE_ANON_KEY ? `${SUPABASE_ANON_KEY.substring(0, 20)}...` : 'MISSING',
    env: import.meta.env,
    mode: import.meta.env.MODE,
    dev: import.meta.env.DEV,
    prod: import.meta.env.PROD,
    envFromImportMeta: {
      url: import.meta.env.VITE_SUPABASE_URL ? 'LOADED' : 'MISSING',
      key: import.meta.env.VITE_SUPABASE_ANON_KEY ? 'LOADED' : 'MISSING'
    },
    usingFallback: {
      url: !import.meta.env.VITE_SUPABASE_URL,
      key: !import.meta.env.VITE_SUPABASE_ANON_KEY
    }
  });
} else {
  // Minimal logging in production - only critical information
  console.log('🔗 Supabase client initialized for production');
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
    debug: false, // Disable Supabase internal debug logging to reduce console pollution
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

// Add global error handler for network requests to help debug 404s
if (typeof window !== 'undefined' && shouldLog) {
  const originalFetch = window.fetch;
  window.fetch = async (...args) => {
    const response = await originalFetch(...args);
    if (!response.ok && (response.status === 404 || response.status === 409)) {
      console.warn(`🌐 Network ${response.status} Error:`, {
        url: args[0],
        status: response.status,
        statusText: response.statusText,
        timestamp: new Date().toISOString()
      });
    }
    return response;
  };
}
/**
 * Supabase Connection Test Utility
 * Quick connectivity test for debugging authentication issues
 */

import { supabase } from '@/integrations/supabase/client';

export interface ConnectionTestResult {
  success: boolean;
  latency: number;
  error?: string;
  details: {
    canConnect: boolean;
    canAuth: boolean;
    canQuery: boolean;
  };
}

export const testSupabaseConnection = async (): Promise<ConnectionTestResult> => {
  const startTime = Date.now();
  const result: ConnectionTestResult = {
    success: false,
    latency: 0,
    details: {
      canConnect: false,
      canAuth: false,
      canQuery: false
    }
  };

  try {
    console.log('🔍 Testing Supabase connection...');

    // Test 1: Basic connection with timeout
    const connectionTimeout = new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error('Connection timeout')), 5000);
    });

    try {
      const { error: healthError } = await Promise.race([
        supabase.from('profiles').select('count').limit(0),
        connectionTimeout
      ]);

      if (!healthError) {
        result.details.canConnect = true;
        console.log('✅ Basic connection: OK');
      } else {
        console.log('❌ Basic connection failed:', healthError.message);
        result.error = `Connection failed: ${healthError.message}`;
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.log('❌ Connection test failed:', errorMessage);
      result.error = `Connection test failed: ${errorMessage}`;
    }

    // Test 2: Auth service
    if (result.details.canConnect) {
      try {
        const authTimeout = new Promise<never>((_, reject) => {
          setTimeout(() => reject(new Error('Auth timeout')), 3000);
        });

        const { error: authError } = await Promise.race([
          supabase.auth.getSession(),
          authTimeout
        ]);

        if (!authError) {
          result.details.canAuth = true;
          console.log('✅ Auth service: OK');
        } else {
          console.log('❌ Auth service failed:', authError.message);
          result.error = `Auth failed: ${authError.message}`;
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        console.log('❌ Auth test failed:', errorMessage);
        result.error = `Auth test failed: ${errorMessage}`;
      }
    }

    // Test 3: Database query
    if (result.details.canConnect) {
      try {
        const queryTimeout = new Promise<never>((_, reject) => {
          setTimeout(() => reject(new Error('Query timeout')), 3000);
        });

        const { error: queryError } = await Promise.race([
          supabase.from('profiles').select('id').limit(1),
          queryTimeout
        ]);

        if (!queryError) {
          result.details.canQuery = true;
          console.log('✅ Database query: OK');
        } else {
          console.log('❌ Database query failed:', queryError.message);
          if (!result.error) {
            result.error = `Query failed: ${queryError.message}`;
          }
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        console.log('❌ Query test failed:', errorMessage);
        if (!result.error) {
          result.error = `Query test failed: ${errorMessage}`;
        }
      }
    }

    result.latency = Date.now() - startTime;
    result.success = result.details.canConnect && result.details.canAuth;

    console.log('🔍 Connection test completed:', {
      success: result.success,
      latency: `${result.latency}ms`,
      details: result.details,
      error: result.error
    });

    return result;

  } catch (error) {
    result.latency = Date.now() - startTime;
    result.error = error instanceof Error ? error.message : 'Unknown error';
    console.error('❌ Connection test failed completely:', result.error);
    return result;
  }
};

export const runConnectionDiagnostics = async (): Promise<void> => {
  console.log('🏥 Running Supabase connection diagnostics...');
  
  const result = await testSupabaseConnection();
  
  if (result.success) {
    console.log('✅ Supabase connection is healthy');
  } else {
    console.error('❌ Supabase connection issues detected:', result.error);
    console.log('🔧 Troubleshooting suggestions:');
    console.log('1. Check internet connection');
    console.log('2. Verify Supabase project status');
    console.log('3. Check environment variables');
    console.log('4. Try refreshing the page');
  }
  
  return;
};

// Auto-run diagnostics in development
if (import.meta.env.DEV) {
  // Run diagnostics after a short delay to avoid blocking app initialization
  setTimeout(() => {
    runConnectionDiagnostics();
  }, 2000);
}

/**
 * Supabase Connection Test Utility
 * Quick connectivity test for debugging authentication issues
 * Optimized for sa-east-1 region with adaptive timeouts
 */

import { supabase } from '@/integrations/supabase/client';
import { getTimeoutConfig, executeWithRetry, adaptiveTimeouts, logTimeoutConfig } from './supabaseTimeoutConfig';

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
  const timeouts = getTimeoutConfig();

  // Log timeout configuration for debugging
  logTimeoutConfig();

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
    console.log('🔍 Testing Supabase connection with optimized timeouts...');

    // Test 1: Basic connection with adaptive timeout
    try {
      const connectionStartTime = Date.now();

      const { error: healthError } = await executeWithRetry(
        () => supabase.from('profiles').select('count').limit(0),
        adaptiveTimeouts.databaseQuery.getAdaptiveTimeout(),
        'Connection test',
        timeouts.maxRetries,
        timeouts.retryDelay
      );

      const connectionDuration = Date.now() - connectionStartTime;
      adaptiveTimeouts.databaseQuery.recordSuccess(connectionDuration);

      if (!healthError) {
        result.details.canConnect = true;
        console.log(`✅ Basic connection: OK (${connectionDuration}ms)`);
      } else {
        console.log('❌ Basic connection failed:', healthError.message);
        result.error = `Connection failed: ${healthError.message}`;
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.log('❌ Connection test failed:', errorMessage);
      result.error = `Connection test failed: ${errorMessage}`;
    }

    // Test 2: Auth service with adaptive timeout
    if (result.details.canConnect) {
      try {
        const authStartTime = Date.now();

        const { error: authError } = await executeWithRetry(
          () => supabase.auth.getSession(),
          adaptiveTimeouts.authOperation.getAdaptiveTimeout(),
          'Auth service test',
          timeouts.maxRetries,
          timeouts.retryDelay
        );

        const authDuration = Date.now() - authStartTime;
        adaptiveTimeouts.authOperation.recordSuccess(authDuration);

        if (!authError) {
          result.details.canAuth = true;
          console.log(`✅ Auth service: OK (${authDuration}ms)`);
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

/**
 * Supabase Health Check Utility
 * Tests connectivity and service status
 */

import { supabase } from '@/integrations/supabase/client';

export interface HealthCheckResult {
  isHealthy: boolean;
  checks: {
    connection: boolean;
    auth: boolean;
    database: boolean;
  };
  errors: string[];
  latency: number;
}

export const performHealthCheck = async (): Promise<HealthCheckResult> => {
  const startTime = Date.now();
  const result: HealthCheckResult = {
    isHealthy: false,
    checks: {
      connection: false,
      auth: false,
      database: false
    },
    errors: [],
    latency: 0
  };

  console.log('🏥 Starting Supabase health check...');

  try {
    // Test 1: Basic connection
    console.log('🔗 Testing basic connection...');
    const { data: connectionTest, error: connectionError } = await supabase
      .from('profiles')
      .select('count')
      .limit(1)
      .single();
    
    if (!connectionError) {
      result.checks.connection = true;
      console.log('✅ Connection test passed');
    } else {
      result.errors.push(`Connection failed: ${connectionError.message}`);
      console.error('❌ Connection test failed:', connectionError);
    }

    // Test 2: Auth service
    console.log('🔐 Testing auth service...');
    try {
      const { data: authTest, error: authError } = await supabase.auth.getSession();
      if (!authError) {
        result.checks.auth = true;
        console.log('✅ Auth service test passed');
      } else {
        result.errors.push(`Auth service failed: ${authError.message}`);
        console.error('❌ Auth service test failed:', authError);
      }
    } catch (authException) {
      result.errors.push(`Auth service exception: ${authException}`);
      console.error('❌ Auth service exception:', authException);
    }

    // Test 3: Database query
    console.log('🗄️ Testing database query...');
    const { data: dbTest, error: dbError } = await supabase
      .from('profiles')
      .select('id')
      .limit(1);
    
    if (!dbError) {
      result.checks.database = true;
      console.log('✅ Database test passed');
    } else {
      result.errors.push(`Database failed: ${dbError.message}`);
      console.error('❌ Database test failed:', dbError);
    }

  } catch (globalError) {
    result.errors.push(`Global error: ${globalError}`);
    console.error('❌ Global health check error:', globalError);
  }

  // Calculate results
  result.latency = Date.now() - startTime;
  result.isHealthy = result.checks.connection && result.checks.auth && result.checks.database;

  console.log('🏥 Health check completed:', {
    isHealthy: result.isHealthy,
    latency: `${result.latency}ms`,
    checks: result.checks,
    errorCount: result.errors.length
  });

  return result;
};

// Test specific auth operations
export const testAuthOperations = async () => {
  console.log('🔐 Testing specific auth operations...');
  
  const tests = {
    getSession: false,
    getUser: false,
    refreshSession: false
  };

  try {
    // Test getSession
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
    tests.getSession = !sessionError;
    console.log('🔍 getSession test:', tests.getSession ? '✅' : '❌', sessionError?.message || 'OK');

    // Test getUser
    const { data: userData, error: userError } = await supabase.auth.getUser();
    tests.getUser = !userError;
    console.log('🔍 getUser test:', tests.getUser ? '✅' : '❌', userError?.message || 'OK');

    // Test refresh (only if we have a session)
    if (sessionData?.session) {
      const { data: refreshData, error: refreshError } = await supabase.auth.refreshSession();
      tests.refreshSession = !refreshError;
      console.log('🔍 refreshSession test:', tests.refreshSession ? '✅' : '❌', refreshError?.message || 'OK');
    } else {
      console.log('🔍 refreshSession test: ⏭️ Skipped (no session)');
    }

  } catch (error) {
    console.error('❌ Auth operations test failed:', error);
  }

  return tests;
};

// Add to window for console access
if (typeof window !== 'undefined') {
  (window as any).supabaseHealth = {
    check: performHealthCheck,
    testAuth: testAuthOperations,
    quickCheck: async () => {
      const result = await performHealthCheck();
      console.log(`🏥 Quick Health Check: ${result.isHealthy ? '✅ HEALTHY' : '❌ UNHEALTHY'} (${result.latency}ms)`);
      if (!result.isHealthy) {
        console.log('❌ Errors:', result.errors);
      }
      return result;
    }
  };
  
  console.log('🔧 Supabase health check tools available:');
  console.log('  window.supabaseHealth.check() - Full health check');
  console.log('  window.supabaseHealth.testAuth() - Test auth operations');
  console.log('  window.supabaseHealth.quickCheck() - Quick status check');
}

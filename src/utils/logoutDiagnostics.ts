/**
 * Comprehensive Logout Diagnostics Utility
 * Tests and diagnoses logout functionality across all pages
 */

import { supabase } from '@/integrations/supabase/client';

export interface LogoutDiagnosticResult {
  testName: string;
  success: boolean;
  error?: any;
  details: any;
  timestamp: string;
}

export interface ComprehensiveDiagnostic {
  overall: {
    success: boolean;
    totalTests: number;
    passedTests: number;
    failedTests: number;
  };
  tests: LogoutDiagnosticResult[];
  recommendations: string[];
}

export const runLogoutDiagnostics = async (): Promise<ComprehensiveDiagnostic> => {
  console.log('🔍 Starting comprehensive logout diagnostics...');
  
  const results: LogoutDiagnosticResult[] = [];
  const recommendations: string[] = [];

  // Test 1: Check current auth state
  console.log('🔍 Test 1: Current auth state');
  try {
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
    results.push({
      testName: 'Current Auth State',
      success: !sessionError,
      error: sessionError,
      details: {
        hasSession: !!sessionData?.session,
        userId: sessionData?.session?.user?.id,
        userEmail: sessionData?.session?.user?.email,
        expiresAt: sessionData?.session?.expires_at,
        tokenType: sessionData?.session?.token_type
      },
      timestamp: new Date().toISOString()
    });
    
    if (!sessionData?.session) {
      recommendations.push('User is not logged in - logout test not applicable');
    }
  } catch (error) {
    results.push({
      testName: 'Current Auth State',
      success: false,
      error,
      details: { exception: true },
      timestamp: new Date().toISOString()
    });
  }

  // Test 2: Test auth service connectivity
  console.log('🔍 Test 2: Auth service connectivity');
  try {
    const { data: userData, error: userError } = await supabase.auth.getUser();
    results.push({
      testName: 'Auth Service Connectivity',
      success: !userError,
      error: userError,
      details: {
        hasUser: !!userData?.user,
        userMetadata: userData?.user?.user_metadata
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    results.push({
      testName: 'Auth Service Connectivity',
      success: false,
      error,
      details: { exception: true },
      timestamp: new Date().toISOString()
    });
    recommendations.push('Auth service connectivity issue detected');
  }

  // Test 3: Test signOut with timeout
  console.log('🔍 Test 3: SignOut with timeout');
  try {
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('SignOut timeout after 5 seconds')), 5000)
    );
    
    const signOutPromise = supabase.auth.signOut();
    
    const result = await Promise.race([signOutPromise, timeoutPromise]);
    
    results.push({
      testName: 'SignOut with Timeout',
      success: !result.error,
      error: result.error,
      details: {
        completedWithinTimeout: true,
        result
      },
      timestamp: new Date().toISOString()
    });
    
    if (result.error) {
      recommendations.push(`SignOut error: ${result.error.message}`);
    }
  } catch (error) {
    results.push({
      testName: 'SignOut with Timeout',
      success: false,
      error,
      details: {
        timedOut: error.message.includes('timeout'),
        exception: true
      },
      timestamp: new Date().toISOString()
    });
    
    if (error.message.includes('timeout')) {
      recommendations.push('SignOut is timing out - possible network or service issue');
    }
  }

  // Test 4: Test network connectivity to Supabase
  console.log('🔍 Test 4: Network connectivity');
  try {
    const startTime = Date.now();
    const { data, error } = await supabase.from('profiles').select('count').limit(1);
    const latency = Date.now() - startTime;
    
    results.push({
      testName: 'Network Connectivity',
      success: !error,
      error,
      details: {
        latency,
        canReachDatabase: !error
      },
      timestamp: new Date().toISOString()
    });
    
    if (latency > 3000) {
      recommendations.push('High network latency detected - may cause timeouts');
    }
  } catch (error) {
    results.push({
      testName: 'Network Connectivity',
      success: false,
      error,
      details: { exception: true },
      timestamp: new Date().toISOString()
    });
    recommendations.push('Network connectivity issue detected');
  }

  // Test 5: Check local storage state
  console.log('🔍 Test 5: Local storage state');
  try {
    const localStorageKeys = Object.keys(localStorage);
    const sessionStorageKeys = Object.keys(sessionStorage);
    const supabaseKeys = localStorageKeys.filter(key => key.includes('supabase') || key.includes('sb-'));
    
    results.push({
      testName: 'Local Storage State',
      success: true,
      details: {
        localStorageKeys: localStorageKeys.length,
        sessionStorageKeys: sessionStorageKeys.length,
        supabaseKeys,
        hasAuthTokens: supabaseKeys.length > 0
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    results.push({
      testName: 'Local Storage State',
      success: false,
      error,
      details: { exception: true },
      timestamp: new Date().toISOString()
    });
  }

  // Calculate overall results
  const passedTests = results.filter(r => r.success).length;
  const failedTests = results.filter(r => !r.success).length;
  
  // Add general recommendations
  if (failedTests > 0) {
    recommendations.push('Use force logout as fallback if normal logout fails');
    recommendations.push('Check browser console for detailed error messages');
  }

  const diagnostic: ComprehensiveDiagnostic = {
    overall: {
      success: failedTests === 0,
      totalTests: results.length,
      passedTests,
      failedTests
    },
    tests: results,
    recommendations
  };

  console.log('🔍 Logout diagnostics completed:', diagnostic);
  return diagnostic;
};

// Add to window for console access
if (typeof window !== 'undefined') {
  (window as any).logoutDiagnostics = {
    run: runLogoutDiagnostics,
    quickTest: async () => {
      console.log('🔍 Running quick logout diagnostic...');
      const result = await runLogoutDiagnostics();
      console.log(`🔍 Quick Diagnostic: ${result.overall.success ? '✅ PASSED' : '❌ FAILED'} (${result.overall.passedTests}/${result.overall.totalTests})`);
      if (!result.overall.success) {
        console.log('❌ Failed tests:', result.tests.filter(t => !t.success).map(t => t.testName));
        console.log('💡 Recommendations:', result.recommendations);
      }
      return result;
    }
  };
  
  console.log('🔧 Logout diagnostics tools available:');
  console.log('  window.logoutDiagnostics.run() - Full diagnostic');
  console.log('  window.logoutDiagnostics.quickTest() - Quick test');
}

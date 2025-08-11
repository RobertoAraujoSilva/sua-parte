/**
 * Authentication Timeout Diagnostics Utility
 * Comprehensive testing and analysis for authentication timeout issues
 */

import { supabase } from '@/integrations/supabase/client';

export interface TimeoutTestResult {
  operation: string;
  success: boolean;
  duration: number;
  error?: string;
  recommendedTimeout: number;
}

export interface AuthDiagnosticsResult {
  overall: {
    success: boolean;
    totalDuration: number;
    criticalIssues: string[];
    recommendations: string[];
  };
  tests: TimeoutTestResult[];
  sessionAnalysis: {
    hasValidSession: boolean;
    sessionAge?: number;
    tokenExpiry?: number;
    needsRefresh: boolean;
  };
  networkAnalysis: {
    latency: number;
    stability: 'good' | 'poor' | 'unstable';
    recommendedTimeouts: {
      session: number;
      profile: number;
      user: number;
      initial: number;
    };
  };
}

/**
 * Test authentication operation with multiple timeout scenarios
 */
const testOperationTimeouts = async (
  operation: string,
  operationFn: () => Promise<any>,
  timeouts: number[]
): Promise<TimeoutTestResult> => {
  console.log(`🔍 Testing ${operation} with multiple timeout scenarios...`);
  
  for (const timeoutMs of timeouts) {
    const startTime = Date.now();
    
    try {
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error(`${operation} timeout after ${timeoutMs}ms`)), timeoutMs);
      });

      await Promise.race([operationFn(), timeoutPromise]);
      
      const duration = Date.now() - startTime;
      console.log(`✅ ${operation} successful in ${duration}ms (timeout: ${timeoutMs}ms)`);
      
      return {
        operation,
        success: true,
        duration,
        recommendedTimeout: Math.max(timeoutMs, duration + 2000) // Add 2s buffer
      };
    } catch (error) {
      const duration = Date.now() - startTime;
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      
      if (duration >= timeoutMs - 100) {
        // This was a timeout, try next timeout value
        console.log(`⏰ ${operation} timed out in ${duration}ms (timeout: ${timeoutMs}ms)`);
        continue;
      } else {
        // This was an actual error, not a timeout
        console.log(`❌ ${operation} failed with error: ${errorMessage}`);
        return {
          operation,
          success: false,
          duration,
          error: errorMessage,
          recommendedTimeout: timeoutMs + 2000
        };
      }
    }
  }
  
  // All timeouts failed
  const maxTimeout = Math.max(...timeouts);
  return {
    operation,
    success: false,
    duration: maxTimeout,
    error: `Operation failed even with ${maxTimeout}ms timeout`,
    recommendedTimeout: maxTimeout + 5000
  };
};

/**
 * Analyze current session state
 */
const analyzeSession = async (): Promise<AuthDiagnosticsResult['sessionAnalysis']> => {
  try {
    const { data: { session }, error } = await supabase.auth.getSession();
    
    if (error) {
      console.log('❌ Session analysis error:', error.message);
      return {
        hasValidSession: false,
        needsRefresh: true
      };
    }
    
    if (!session) {
      return {
        hasValidSession: false,
        needsRefresh: false
      };
    }
    
    const now = Date.now() / 1000;
    const sessionAge = now - (session.user.created_at ? new Date(session.user.created_at).getTime() / 1000 : now);
    const tokenExpiry = session.expires_at || 0;
    const needsRefresh = tokenExpiry < now + 300; // Expires in less than 5 minutes
    
    return {
      hasValidSession: true,
      sessionAge,
      tokenExpiry,
      needsRefresh
    };
  } catch (error) {
    console.error('❌ Session analysis failed:', error);
    return {
      hasValidSession: false,
      needsRefresh: true
    };
  }
};

/**
 * Analyze network performance
 */
const analyzeNetwork = async (): Promise<AuthDiagnosticsResult['networkAnalysis']> => {
  const startTime = Date.now();
  
  try {
    // Simple ping test
    await supabase.from('profiles').select('count').limit(0);
    const latency = Date.now() - startTime;
    
    let stability: 'good' | 'poor' | 'unstable' = 'good';
    if (latency > 2000) {
      stability = 'poor';
    } else if (latency > 1000) {
      stability = 'unstable';
    }
    
    // Calculate recommended timeouts based on latency
    const baseTimeout = Math.max(3000, latency * 3);
    
    return {
      latency,
      stability,
      recommendedTimeouts: {
        session: baseTimeout * 2, // Session operations need more time
        profile: baseTimeout * 1.5,
        user: baseTimeout,
        initial: baseTimeout * 3 // Initial load needs most time
      }
    };
  } catch (error) {
    console.error('❌ Network analysis failed:', error);
    return {
      latency: 5000,
      stability: 'poor',
      recommendedTimeouts: {
        session: 12000,
        profile: 8000,
        user: 6000,
        initial: 15000
      }
    };
  }
};

/**
 * Run comprehensive authentication diagnostics
 */
export const runAuthTimeoutDiagnostics = async (): Promise<AuthDiagnosticsResult> => {
  console.log('🔬 Starting comprehensive authentication timeout diagnostics...');
  
  const startTime = Date.now();
  const result: AuthDiagnosticsResult = {
    overall: {
      success: false,
      totalDuration: 0,
      criticalIssues: [],
      recommendations: []
    },
    tests: [],
    sessionAnalysis: {
      hasValidSession: false,
      needsRefresh: false
    },
    networkAnalysis: {
      latency: 0,
      stability: 'good',
      recommendedTimeouts: {
        session: 8000,
        profile: 6000,
        user: 4000,
        initial: 12000
      }
    }
  };

  try {
    // Step 1: Analyze network performance
    console.log('1️⃣ Analyzing network performance...');
    result.networkAnalysis = await analyzeNetwork();
    
    // Step 2: Analyze current session
    console.log('2️⃣ Analyzing current session state...');
    result.sessionAnalysis = await analyzeSession();
    
    // Step 3: Test session retrieval with multiple timeouts
    console.log('3️⃣ Testing session retrieval timeouts...');
    const sessionTest = await testOperationTimeouts(
      'Session Retrieval',
      () => supabase.auth.getSession(),
      [2000, 5000, 8000, 12000]
    );
    result.tests.push(sessionTest);
    
    // Step 4: Test user retrieval (if session exists)
    if (result.sessionAnalysis.hasValidSession) {
      console.log('4️⃣ Testing user retrieval timeouts...');
      const userTest = await testOperationTimeouts(
        'User Retrieval',
        () => supabase.auth.getUser(),
        [3000, 6000, 9000]
      );
      result.tests.push(userTest);
      
      // Step 5: Test profile query
      console.log('5️⃣ Testing profile query timeouts...');
      const profileTest = await testOperationTimeouts(
        'Profile Query',
        async () => await supabase.from('profiles').select('id').limit(1),
        [4000, 6000, 8000]
      );
      result.tests.push(profileTest);
    }
    
    // Analyze results and generate recommendations
    const failedTests = result.tests.filter(test => !test.success);
    const successfulTests = result.tests.filter(test => test.success);
    
    result.overall.success = failedTests.length === 0;
    result.overall.totalDuration = Date.now() - startTime;
    
    // Generate critical issues
    if (result.networkAnalysis.latency > 3000) {
      result.overall.criticalIssues.push('High network latency detected');
    }
    
    if (result.sessionAnalysis.needsRefresh) {
      result.overall.criticalIssues.push('Session token needs refresh');
    }
    
    if (failedTests.some(test => test.error?.includes('403'))) {
      result.overall.criticalIssues.push('HTTP 403 Forbidden errors detected');
    }
    
    // Generate recommendations
    if (result.networkAnalysis.stability === 'poor') {
      result.overall.recommendations.push('Increase all timeouts by 50% due to poor network stability');
    }
    
    if (successfulTests.length > 0) {
      const maxRecommendedTimeout = Math.max(...successfulTests.map(test => test.recommendedTimeout));
      result.overall.recommendations.push(`Use minimum ${maxRecommendedTimeout}ms timeout for reliable operations`);
    }
    
    if (result.sessionAnalysis.needsRefresh) {
      result.overall.recommendations.push('Implement session refresh before making auth calls');
    }
    
    if (failedTests.length > 0) {
      result.overall.recommendations.push('Implement retry logic with exponential backoff for failed operations');
    }
    
    // Log summary
    console.log('🔬 Authentication timeout diagnostics completed:', {
      success: result.overall.success,
      duration: `${result.overall.totalDuration}ms`,
      criticalIssues: result.overall.criticalIssues.length,
      recommendations: result.overall.recommendations.length,
      networkLatency: `${result.networkAnalysis.latency}ms`,
      networkStability: result.networkAnalysis.stability
    });
    
    return result;
    
  } catch (error) {
    console.error('❌ Authentication diagnostics failed:', error);
    result.overall.criticalIssues.push('Diagnostics failed to complete');
    result.overall.recommendations.push('Check console for detailed error information');
    return result;
  }
};

// Auto-run diagnostics in development
if (import.meta.env.DEV) {
  // Run diagnostics after a delay to avoid blocking app initialization
  setTimeout(() => {
    runAuthTimeoutDiagnostics().then(result => {
      if (!result.overall.success) {
        console.warn('⚠️ Authentication timeout issues detected. Run window.runAuthDiagnostics() for details.');
      }
    });
  }, 5000);
}

// Export for manual testing
if (typeof window !== 'undefined') {
  (window as any).runAuthTimeoutDiagnostics = runAuthTimeoutDiagnostics;
}

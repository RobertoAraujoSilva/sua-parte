/**
 * Authentication Flow Test Utility
 * Comprehensive testing for the authentication system
 */

import { supabase } from '@/integrations/supabase/client';
import { testSupabaseConnection } from './supabaseConnectionTest';

export interface AuthFlowTestResult {
  success: boolean;
  steps: {
    connection: boolean;
    session: boolean;
    profile: boolean;
    metadata: boolean;
  };
  errors: string[];
  timings: {
    connection: number;
    session: number;
    profile: number;
    total: number;
  };
  recommendations: string[];
}

export const testAuthenticationFlow = async (): Promise<AuthFlowTestResult> => {
  const startTime = Date.now();
  const result: AuthFlowTestResult = {
    success: false,
    steps: {
      connection: false,
      session: false,
      profile: false,
      metadata: false
    },
    errors: [],
    timings: {
      connection: 0,
      session: 0,
      profile: 0,
      total: 0
    },
    recommendations: []
  };

  console.log('🧪 Starting comprehensive authentication flow test with timeout analysis...');

  try {
    // Step 1: Test Supabase connection
    console.log('1️⃣ Testing Supabase connection...');
    const connectionStart = Date.now();

    const connectionResult = await testSupabaseConnection();
    result.timings.connection = Date.now() - connectionStart;

    if (connectionResult.success) {
      result.steps.connection = true;
      console.log('✅ Connection test passed');
    } else {
      result.errors.push(`Connection failed: ${connectionResult.error}`);
      result.recommendations.push('Check internet connection and Supabase project status');
      console.log('❌ Connection test failed');
    }

    // Step 2: Test session retrieval with timeout analysis
    console.log('2️⃣ Testing session retrieval with timeout analysis...');
    const sessionStart = Date.now();

    try {
      const timeouts = [2000, 5000, 8000];
      let sessionSuccess = false;
      let sessionError: any = null;
      let optimalTimeout = 0;
      let retrievedSession: any = null;

      for (const timeoutMs of timeouts) {
        console.log(`🔍 Testing session retrieval with ${timeoutMs}ms timeout...`);
        const testStart = Date.now();

        try {
          const sessionTimeout = new Promise<never>((_, reject) => {
            setTimeout(() => reject(new Error(`Session test timeout after ${timeoutMs}ms`)), timeoutMs);
          });

          const raceResult = await Promise.race([
            supabase.auth.getSession(),
            sessionTimeout
          ]) as any;

          const session = raceResult?.data?.session ?? null;
          const error = raceResult?.error ?? null;

          const testDuration = Date.now() - testStart;
          console.log(`✅ Session retrieval successful in ${testDuration}ms (timeout: ${timeoutMs}ms)`);

          sessionSuccess = true;
          optimalTimeout = timeoutMs;
          sessionError = error;
          retrievedSession = session;

          if (error) {
            result.errors.push(`Session error: ${error.message}`);
            if (String(error.message || '').includes('403')) {
              result.recommendations.push('Session token expired - implement retry logic with exponential backoff');
            } else {
              result.recommendations.push('Try refreshing the page or clearing browser storage');
            }
          }
          break;
        } catch (err) {
          const testDuration = Date.now() - testStart;
          console.log(`❌ Session retrieval failed in ${testDuration}ms (timeout: ${timeoutMs}ms)`);
          sessionError = err;

          if (timeoutMs === timeouts[timeouts.length - 1]) {
            result.errors.push(`Session timeout even with ${timeoutMs}ms - network or server issues`);
            result.recommendations.push('Increase session timeout to 10-12 seconds for initial load');
          }
        }
      }

      result.timings.session = Date.now() - sessionStart;

      if (sessionSuccess) {
        result.steps.session = true;
        console.log(`✅ Session retrieval successful with optimal timeout: ${optimalTimeout}ms`);
        if (optimalTimeout > 5000) {
          result.recommendations.push(`Consider increasing session timeout to ${optimalTimeout + 2000}ms for better reliability`);
        }
      } else {
        console.log('❌ Session retrieval failed with all timeout scenarios');
        result.recommendations.push('Check Supabase authentication service status and network connectivity');
      }

      if (retrievedSession?.user) {
        console.log('👤 User found in session:', retrievedSession.user.email);

        // Step 3: Test profile loading
        console.log('3️⃣ Testing profile loading...');
        const profileStart = Date.now();

        try {
          const profileTimeout = new Promise<never>((_, reject) => {
            setTimeout(() => reject(new Error('Profile test timeout')), 4000);
          });

          const { data: profileData, error: profileError } = await Promise.race([
            supabase
              .from('profiles')
              .select('*')
              .eq('id', retrievedSession.user.id)
              .single(),
            profileTimeout
          ]) as any;

          result.timings.profile = Date.now() - profileStart;

          if (profileError) {
            if ((profileError as any).code === 'PGRST116') {
              console.log('📝 Profile not found in database (expected for new users)');
              result.recommendations.push('Profile will be created from user metadata');
            } else {
              result.errors.push(`Profile error: ${profileError.message}`);
              result.recommendations.push('Check database permissions and profile table structure');
            }
          } else {
            result.steps.profile = true;
            console.log('✅ Profile loading successful');
          }

          // Step 4: Test metadata fallback
          console.log('4️⃣ Testing metadata fallback...');
          const metadata = retrievedSession.user.user_metadata || {};

          if (metadata.role) {
            result.steps.metadata = true;
            console.log('✅ User metadata available:', { role: metadata.role });
          } else {
            result.errors.push('No role found in user metadata');
            result.recommendations.push('Ensure user registration includes role metadata');
          }

        } catch (profileError: any) {
          result.timings.profile = Date.now() - profileStart;
          const errorMessage = profileError instanceof Error ? profileError.message : 'Unknown error';
          result.errors.push(`Profile test failed: ${errorMessage}`);
          result.recommendations.push('Check database connectivity and permissions');
        }
      } else {
        console.log('ℹ️ No user in session (not logged in)');
        result.recommendations.push('User needs to log in to test full authentication flow');
      }
    } catch (sessionError: any) {
      result.timings.session = Date.now() - sessionStart;
      const errorMessage = sessionError instanceof Error ? sessionError.message : 'Unknown error';
      result.errors.push(`Session test failed: ${errorMessage}`);
      result.recommendations.push('Check Supabase authentication service status');
    }

    // Calculate overall success
    result.success = result.steps.connection && result.steps.session && 
                    (result.steps.profile || result.steps.metadata);

    result.timings.total = Date.now() - startTime;

    // Generate final recommendations
    if (result.success) {
      console.log('✅ Authentication flow test completed successfully');
      result.recommendations.push('Authentication system is working correctly');
    } else {
      console.log('❌ Authentication flow test failed');
      if (result.errors.length === 0) {
        result.recommendations.push('Unknown issue - check browser console for more details');
      }
    }

    // Performance recommendations
    if (result.timings.total > 10000) {
      result.recommendations.push('Authentication is slow - consider optimizing network or database queries');
    }
    if (result.timings.connection > 3000) {
      result.recommendations.push('Slow connection to Supabase - check network or server status');
    }
    if (result.timings.profile > 2000) {
      result.recommendations.push('Profile loading is slow - consider database optimization');
    }

    console.log('🧪 Authentication flow test results:', {
      success: result.success,
      steps: result.steps,
      timings: result.timings,
      errorCount: result.errors.length,
      recommendationCount: result.recommendations.length
    });

    return result;

  } catch (error) {
    result.timings.total = Date.now() - startTime;
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    result.errors.push(`Test failed: ${errorMessage}`);
    result.recommendations.push('Check browser console for detailed error information');
    
    console.error('❌ Authentication flow test failed completely:', errorMessage);
    return result;
  }
};

export const runAuthFlowDiagnostics = async (): Promise<void> => {
  console.log('🔬 Running authentication flow diagnostics...');
  
  const result = await testAuthenticationFlow();
  
  if (result.success) {
    console.log('✅ Authentication flow is healthy');
    console.log(`⚡ Total time: ${result.timings.total}ms`);
  } else {
    console.error('❌ Authentication flow issues detected');
    console.log('🔧 Issues found:');
    result.errors.forEach((error, index) => {
      console.log(`   ${index + 1}. ${error}`);
    });
    console.log('💡 Recommendations:');
    result.recommendations.forEach((rec, index) => {
      console.log(`   ${index + 1}. ${rec}`);
    });
  }
};

// Export for manual testing
if (typeof window !== 'undefined') {
  (window as any).testAuthFlow = testAuthenticationFlow;
  (window as any).runAuthDiagnostics = runAuthFlowDiagnostics;
}

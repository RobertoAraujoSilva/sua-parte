/**
 * Regional Connectivity Test for Supabase sa-east-1
 * Comprehensive testing for South America region connectivity issues
 */

import { supabase } from '@/integrations/supabase/client';

export interface RegionalConnectivityResult {
  region: string;
  overall: {
    success: boolean;
    averageLatency: number;
    stability: 'excellent' | 'good' | 'poor' | 'critical';
    recommendations: string[];
  };
  tests: {
    basicPing: { success: boolean; latency: number; error?: string };
    authEndpoint: { success: boolean; latency: number; error?: string };
    databaseQuery: { success: boolean; latency: number; error?: string };
    sessionRecovery: { success: boolean; latency: number; error?: string };
  };
  networkAnalysis: {
    packetLoss: number;
    jitter: number;
    recommendedTimeouts: {
      session: number;
      profile: number;
      user: number;
      initial: number;
    };
  };
}

/**
 * Test basic connectivity to Supabase
 */
const testBasicConnectivity = async (): Promise<{ success: boolean; latency: number; error?: string }> => {
  const startTime = Date.now();
  
  try {
    // Simple health check
    const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/rest/v1/`, {
      method: 'HEAD',
      headers: {
        'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY,
      },
    });
    
    const latency = Date.now() - startTime;
    
    if (response.ok) {
      return { success: true, latency };
    } else {
      return { success: false, latency, error: `HTTP ${response.status}` };
    }
  } catch (error) {
    const latency = Date.now() - startTime;
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return { success: false, latency, error: errorMessage };
  }
};

/**
 * Test auth endpoint specifically
 */
const testAuthEndpoint = async (): Promise<{ success: boolean; latency: number; error?: string }> => {
  const startTime = Date.now();
  
  try {
    const { error } = await supabase.auth.getSession();
    const latency = Date.now() - startTime;
    
    if (!error) {
      return { success: true, latency };
    } else {
      return { success: false, latency, error: error.message };
    }
  } catch (error) {
    const latency = Date.now() - startTime;
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return { success: false, latency, error: errorMessage };
  }
};

/**
 * Test database query performance
 */
const testDatabaseQuery = async (): Promise<{ success: boolean; latency: number; error?: string }> => {
  const startTime = Date.now();
  
  try {
    const { error } = await supabase.from('profiles').select('count').limit(0);
    const latency = Date.now() - startTime;
    
    if (!error) {
      return { success: true, latency };
    } else {
      return { success: false, latency, error: error.message };
    }
  } catch (error) {
    const latency = Date.now() - startTime;
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return { success: false, latency, error: errorMessage };
  }
};

/**
 * Test session recovery (simulates page refresh)
 */
const testSessionRecovery = async (): Promise<{ success: boolean; latency: number; error?: string }> => {
  const startTime = Date.now();
  
  try {
    // Simulate what happens on page refresh
    const { data: { session }, error } = await supabase.auth.getSession();
    
    if (session) {
      // Test getting user data
      const { error: userError } = await supabase.auth.getUser();
      const latency = Date.now() - startTime;
      
      if (!userError) {
        return { success: true, latency };
      } else {
        return { success: false, latency, error: userError.message };
      }
    } else {
      const latency = Date.now() - startTime;
      return { success: true, latency }; // No session is valid
    }
  } catch (error) {
    const latency = Date.now() - startTime;
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return { success: false, latency, error: errorMessage };
  }
};

/**
 * Analyze network stability with multiple samples
 */
const analyzeNetworkStability = async (samples: number = 5): Promise<{
  packetLoss: number;
  jitter: number;
  averageLatency: number;
}> => {
  const latencies: number[] = [];
  let failures = 0;
  
  console.log(`🔍 Testing network stability with ${samples} samples...`);
  
  for (let i = 0; i < samples; i++) {
    try {
      const result = await testBasicConnectivity();
      if (result.success) {
        latencies.push(result.latency);
      } else {
        failures++;
      }
      
      // Wait between tests
      await new Promise(resolve => setTimeout(resolve, 1000));
    } catch (error) {
      failures++;
    }
  }
  
  const packetLoss = (failures / samples) * 100;
  const averageLatency = latencies.length > 0 ? latencies.reduce((a, b) => a + b, 0) / latencies.length : 0;
  
  // Calculate jitter (variation in latency)
  let jitter = 0;
  if (latencies.length > 1) {
    const variance = latencies.reduce((acc, latency) => acc + Math.pow(latency - averageLatency, 2), 0) / latencies.length;
    jitter = Math.sqrt(variance);
  }
  
  return { packetLoss, jitter, averageLatency };
};

/**
 * Run comprehensive regional connectivity test
 */
export const runRegionalConnectivityTest = async (): Promise<RegionalConnectivityResult> => {
  console.log('🌎 Starting regional connectivity test for sa-east-1...');
  
  const result: RegionalConnectivityResult = {
    region: 'sa-east-1 (São Paulo)',
    overall: {
      success: false,
      averageLatency: 0,
      stability: 'critical',
      recommendations: []
    },
    tests: {
      basicPing: { success: false, latency: 0 },
      authEndpoint: { success: false, latency: 0 },
      databaseQuery: { success: false, latency: 0 },
      sessionRecovery: { success: false, latency: 0 }
    },
    networkAnalysis: {
      packetLoss: 0,
      jitter: 0,
      recommendedTimeouts: {
        session: 15000,
        profile: 10000,
        user: 10000,
        initial: 20000
      }
    }
  };

  try {
    // Test 1: Basic connectivity
    console.log('1️⃣ Testing basic connectivity...');
    result.tests.basicPing = await testBasicConnectivity();
    
    // Test 2: Auth endpoint
    console.log('2️⃣ Testing auth endpoint...');
    result.tests.authEndpoint = await testAuthEndpoint();
    
    // Test 3: Database query
    console.log('3️⃣ Testing database query...');
    result.tests.databaseQuery = await testDatabaseQuery();
    
    // Test 4: Session recovery
    console.log('4️⃣ Testing session recovery...');
    result.tests.sessionRecovery = await testSessionRecovery();
    
    // Test 5: Network stability analysis
    console.log('5️⃣ Analyzing network stability...');
    result.networkAnalysis = {
      ...result.networkAnalysis,
      ...(await analyzeNetworkStability())
    };
    
    // Calculate overall metrics
    const latencies = [
      result.tests.basicPing.latency,
      result.tests.authEndpoint.latency,
      result.tests.databaseQuery.latency,
      result.tests.sessionRecovery.latency
    ].filter(l => l > 0);
    
    result.overall.averageLatency = latencies.length > 0 ? 
      latencies.reduce((a, b) => a + b, 0) / latencies.length : 0;
    
    const successCount = Object.values(result.tests).filter(test => test.success).length;
    result.overall.success = successCount >= 3; // At least 3/4 tests must pass
    
    // Determine stability
    if (result.networkAnalysis.packetLoss > 20) {
      result.overall.stability = 'critical';
    } else if (result.networkAnalysis.packetLoss > 10 || result.overall.averageLatency > 3000) {
      result.overall.stability = 'poor';
    } else if (result.networkAnalysis.packetLoss > 5 || result.overall.averageLatency > 1500) {
      result.overall.stability = 'good';
    } else {
      result.overall.stability = 'excellent';
    }
    
    // Generate recommendations
    if (result.overall.averageLatency > 2000) {
      result.overall.recommendations.push('High latency detected - increase all timeouts by 100%');
      result.networkAnalysis.recommendedTimeouts = {
        session: 20000,
        profile: 15000,
        user: 15000,
        initial: 30000
      };
    } else if (result.overall.averageLatency > 1000) {
      result.overall.recommendations.push('Moderate latency - increase timeouts by 50%');
      result.networkAnalysis.recommendedTimeouts = {
        session: 18000,
        profile: 12000,
        user: 12000,
        initial: 25000
      };
    }
    
    if (result.networkAnalysis.packetLoss > 5) {
      result.overall.recommendations.push('Packet loss detected - implement aggressive retry logic');
    }
    
    if (result.networkAnalysis.jitter > 500) {
      result.overall.recommendations.push('High jitter detected - use adaptive timeouts');
    }
    
    if (!result.tests.sessionRecovery.success) {
      result.overall.recommendations.push('Session recovery failing - implement page refresh optimization');
    }
    
    console.log('🌎 Regional connectivity test completed:', {
      region: result.region,
      success: result.overall.success,
      averageLatency: `${result.overall.averageLatency}ms`,
      stability: result.overall.stability,
      packetLoss: `${result.networkAnalysis.packetLoss}%`,
      recommendations: result.overall.recommendations.length
    });
    
    return result;
    
  } catch (error) {
    console.error('❌ Regional connectivity test failed:', error);
    result.overall.recommendations.push('Test failed to complete - check network connectivity');
    return result;
  }
};

// Auto-run test in development
if (import.meta.env.DEV) {
  setTimeout(() => {
    runRegionalConnectivityTest().then(result => {
      if (result.overall.stability === 'poor' || result.overall.stability === 'critical') {
        console.warn('⚠️ Regional connectivity issues detected. Run window.testRegionalConnectivity() for details.');
      }
    });
  }, 3000);
}

// Export for manual testing
if (typeof window !== 'undefined') {
  (window as any).testRegionalConnectivity = runRegionalConnectivityTest;
}

/**
 * Supabase Timeout Configuration for sa-east-1 Region
 * Optimized timeout values based on regional network performance
 */

export interface TimeoutConfig {
  sessionCheck: number;
  profileFetch: number;
  authOperation: number;
  databaseQuery: number;
  connectionTest: number;
  retryDelay: number;
  maxRetries: number;
}

/**
 * Regional timeout configuration for sa-east-1 (São Paulo)
 * Based on typical latency patterns and connection reliability
 */
export const REGIONAL_TIMEOUTS: TimeoutConfig = {
  // Session check - critical for auth flow
  sessionCheck: 8000, // Increased from 5000ms for sa-east-1 reliability
  
  // Profile fetch - database query with RLS
  profileFetch: 6000, // Increased from 4000ms for database operations
  
  // Auth operations - authentication service calls
  authOperation: 7000, // Generous timeout for auth service
  
  // Database queries - general database operations
  databaseQuery: 5000, // Standard database query timeout
  
  // Connection test - basic connectivity check
  connectionTest: 4000, // Quick connectivity verification
  
  // Retry configuration
  retryDelay: 1500, // Base delay between retries (1.5s)
  maxRetries: 3 // Maximum number of retry attempts
};

/**
 * Development timeout configuration (more lenient for debugging)
 */
export const DEVELOPMENT_TIMEOUTS: TimeoutConfig = {
  sessionCheck: 12000, // Extra time for debugging
  profileFetch: 10000, // Extra time for debugging
  authOperation: 10000, // Extra time for debugging
  databaseQuery: 8000, // Extra time for debugging
  connectionTest: 6000, // Extra time for debugging
  retryDelay: 2000, // Longer delay for debugging
  maxRetries: 2 // Fewer retries in development
};

/**
 * Production timeout configuration (optimized for performance)
 */
export const PRODUCTION_TIMEOUTS: TimeoutConfig = {
  sessionCheck: 6000, // Balanced for production
  profileFetch: 5000, // Balanced for production
  authOperation: 6000, // Balanced for production
  databaseQuery: 4000, // Faster for production
  connectionTest: 3000, // Quick for production
  retryDelay: 1000, // Faster retries
  maxRetries: 3 // Standard retries
};

/**
 * Get timeout configuration based on environment
 */
export function getTimeoutConfig(): TimeoutConfig {
  if (import.meta.env.DEV) {
    return DEVELOPMENT_TIMEOUTS;
  }
  
  if (import.meta.env.PROD) {
    return PRODUCTION_TIMEOUTS;
  }
  
  // Default to regional timeouts
  return REGIONAL_TIMEOUTS;
}

/**
 * Create a timeout promise with operation name
 */
export function createTimeout(ms: number, operation: string): Promise<never> {
  return new Promise<never>((_, reject) => {
    setTimeout(() => {
      reject(new Error(`${operation} timeout after ${ms}ms`));
    }, ms);
  });
}

/**
 * Execute operation with timeout and retry logic
 */
export async function executeWithRetry<T>(
  operation: () => Promise<T>,
  timeoutMs: number,
  operationName: string,
  maxRetries: number = REGIONAL_TIMEOUTS.maxRetries,
  retryDelay: number = REGIONAL_TIMEOUTS.retryDelay
): Promise<T> {
  let lastError: Error | null = null;
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const timeoutPromise = createTimeout(timeoutMs, operationName);
      const result = await Promise.race([operation(), timeoutPromise]);
      
      // Success - return result
      return result;
      
    } catch (error) {
      lastError = error instanceof Error ? error : new Error('Unknown error');
      
      // If this is the last attempt, throw the error
      if (attempt === maxRetries) {
        console.error(`❌ ${operationName} failed after ${attempt + 1} attempts:`, lastError.message);
        throw lastError;
      }
      
      // Calculate exponential backoff delay
      const delay = retryDelay * Math.pow(1.5, attempt);
      
      console.log(`🔄 ${operationName} failed (attempt ${attempt + 1}/${maxRetries + 1}), retrying in ${delay}ms...`);
      console.log(`   Error: ${lastError.message}`);
      
      // Wait before retry
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  // This should never be reached, but TypeScript requires it
  throw lastError || new Error(`${operationName} failed after all retries`);
}

/**
 * Adaptive timeout based on previous performance
 */
export class AdaptiveTimeout {
  private performanceHistory: number[] = [];
  private readonly maxHistorySize = 10;
  
  constructor(private baseTimeout: number) {}
  
  /**
   * Record a successful operation time
   */
  recordSuccess(duration: number): void {
    this.performanceHistory.push(duration);
    
    // Keep only recent history
    if (this.performanceHistory.length > this.maxHistorySize) {
      this.performanceHistory.shift();
    }
  }
  
  /**
   * Get adaptive timeout based on performance history
   */
  getAdaptiveTimeout(): number {
    if (this.performanceHistory.length === 0) {
      return this.baseTimeout;
    }
    
    // Calculate 95th percentile of recent performance
    const sorted = [...this.performanceHistory].sort((a, b) => a - b);
    const p95Index = Math.floor(sorted.length * 0.95);
    const p95Duration = sorted[p95Index];
    
    // Set timeout to 2x the 95th percentile, with minimum of base timeout
    const adaptiveTimeout = Math.max(p95Duration * 2, this.baseTimeout);
    
    console.log(`📊 Adaptive timeout: ${adaptiveTimeout}ms (based on ${this.performanceHistory.length} samples, p95: ${p95Duration}ms)`);
    
    return adaptiveTimeout;
  }
  
  /**
   * Reset performance history
   */
  reset(): void {
    this.performanceHistory = [];
  }
}

/**
 * Global adaptive timeout instances
 */
export const adaptiveTimeouts = {
  sessionCheck: new AdaptiveTimeout(REGIONAL_TIMEOUTS.sessionCheck),
  profileFetch: new AdaptiveTimeout(REGIONAL_TIMEOUTS.profileFetch),
  authOperation: new AdaptiveTimeout(REGIONAL_TIMEOUTS.authOperation),
  databaseQuery: new AdaptiveTimeout(REGIONAL_TIMEOUTS.databaseQuery)
};

/**
 * Log timeout configuration for debugging
 */
export function logTimeoutConfig(): void {
  const config = getTimeoutConfig();
  
  console.log('⏰ Supabase Timeout Configuration:', {
    environment: import.meta.env.DEV ? 'development' : 'production',
    region: 'sa-east-1',
    timeouts: {
      sessionCheck: `${config.sessionCheck}ms`,
      profileFetch: `${config.profileFetch}ms`,
      authOperation: `${config.authOperation}ms`,
      databaseQuery: `${config.databaseQuery}ms`,
      connectionTest: `${config.connectionTest}ms`
    },
    retry: {
      maxRetries: config.maxRetries,
      retryDelay: `${config.retryDelay}ms`
    }
  });
}

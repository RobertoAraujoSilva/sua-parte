/**
 * Authentication Logger Utility
 * Provides controlled logging for authentication flows
 */

const isDevelopment = import.meta.env.DEV;

export const authLogger = {
  info: (message: string, data?: any) => {
    if (isDevelopment) {
      console.log(`ℹ️ ${message}`, data || '');
    }
  },
  
  success: (message: string, data?: any) => {
    if (isDevelopment) {
      console.log(`✅ ${message}`, data || '');
    }
  },
  
  warning: (message: string, data?: any) => {
    if (isDevelopment) {
      console.warn(`⚠️ ${message}`, data || '');
    }
  },
  
  error: (message: string, error?: any) => {
    // Always log errors, even in production
    console.error(`❌ ${message}`, error || '');
  },
  
  debug: (message: string, data?: any) => {
    if (isDevelopment) {
      console.debug(`🔍 ${message}`, data || '');
    }
  },
  
  timer: (message: string) => {
    if (isDevelopment) {
      console.time(`⏱️ ${message}`);
    }
  },
  
  timerEnd: (message: string) => {
    if (isDevelopment) {
      console.timeEnd(`⏱️ ${message}`);
    }
  }
};

export const createAuthMetrics = () => {
  const metrics = {
    profileLoadTime: 0,
    profileLoadAttempts: 0,
    fallbackUsed: false,
    lastError: null as string | null
  };

  return {
    startProfileLoad: () => {
      metrics.profileLoadAttempts++;
      authLogger.timer('Profile Load');
    },
    
    endProfileLoad: (success: boolean, error?: string) => {
      authLogger.timerEnd('Profile Load');
      if (!success) {
        metrics.lastError = error || 'Unknown error';
        metrics.fallbackUsed = true;
      }
    },
    
    getMetrics: () => ({ ...metrics }),
    
    logSummary: () => {
      if (isDevelopment) {
        authLogger.info('Auth Metrics Summary:', metrics);
      }
    }
  };
};

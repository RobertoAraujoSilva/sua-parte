/**
 * Page Refresh Optimization for Authentication
 * Handles F5 refresh scenarios with improved session recovery
 */

import { supabase } from '@/integrations/supabase/client';

export interface RefreshOptimizationConfig {
  enableSessionCache: boolean;
  cacheTimeout: number;
  enablePreemptiveRefresh: boolean;
  enableConnectionWarmup: boolean;
  maxRetries: number;
  retryDelay: number;
}

export interface SessionCacheEntry {
  session: any;
  timestamp: number;
  expiresAt: number;
}

class PageRefreshOptimizer {
  private config: RefreshOptimizationConfig;
  private sessionCache: SessionCacheEntry | null = null;
  private connectionWarmedUp = false;

  constructor(config: Partial<RefreshOptimizationConfig> = {}) {
    this.config = {
      enableSessionCache: true,
      cacheTimeout: 30000, // 30 seconds
      enablePreemptiveRefresh: true,
      enableConnectionWarmup: true,
      maxRetries: 3,
      retryDelay: 2000,
      ...config
    };
  }

  /**
   * Warm up connection to Supabase
   */
  async warmupConnection(): Promise<void> {
    if (this.connectionWarmedUp) return;

    try {
      console.log('🔥 Warming up Supabase connection...');
      
      // Make a lightweight request to establish connection
      await Promise.race([
        fetch(`${import.meta.env.VITE_SUPABASE_URL}/rest/v1/`, {
          method: 'HEAD',
          headers: {
            'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY,
          },
        }),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Warmup timeout')), 5000)
        )
      ]);
      
      this.connectionWarmedUp = true;
      console.log('✅ Connection warmed up successfully');
    } catch (error) {
      console.warn('⚠️ Connection warmup failed:', error);
    }
  }

  /**
   * Cache session for quick recovery
   */
  cacheSession(session: any): void {
    if (!this.config.enableSessionCache || !session) return;

    const now = Date.now();
    const expiresAt = session.expires_at ? new Date(session.expires_at).getTime() : now + this.config.cacheTimeout;

    this.sessionCache = {
      session,
      timestamp: now,
      expiresAt
    };

    console.log('💾 Session cached for quick recovery');
  }

  /**
   * Get cached session if valid
   */
  getCachedSession(): any | null {
    if (!this.config.enableSessionCache || !this.sessionCache) return null;

    const now = Date.now();
    
    // Check if cache is expired
    if (now > this.sessionCache.expiresAt || 
        now - this.sessionCache.timestamp > this.config.cacheTimeout) {
      this.sessionCache = null;
      return null;
    }

    console.log('⚡ Using cached session for quick recovery');
    return this.sessionCache.session;
  }

  /**
   * Optimized session recovery for page refresh
   */
  async optimizedSessionRecovery(): Promise<{ session: any; fromCache: boolean; duration: number }> {
    const startTime = Date.now();

    try {
      // Step 1: Try cached session first
      const cachedSession = this.getCachedSession();
      if (cachedSession) {
        return {
          session: cachedSession,
          fromCache: true,
          duration: Date.now() - startTime
        };
      }

      // Step 2: Warm up connection if needed
      if (this.config.enableConnectionWarmup && !this.connectionWarmedUp) {
        await this.warmupConnection();
      }

      // Step 3: Get session with retry logic
      let session = null;
      let lastError = null;

      for (let attempt = 1; attempt <= this.config.maxRetries; attempt++) {
        try {
          console.log(`🔄 Session recovery attempt ${attempt}/${this.config.maxRetries}...`);
          
          const timeout = new Promise<never>((_, reject) => {
            setTimeout(() => reject(new Error('Session recovery timeout')), 15000 + (attempt * 5000));
          });

          const { data, error } = await Promise.race([
            supabase.auth.getSession(),
            timeout
          ]);

          if (error) {
            lastError = error;
            if (error.message.includes('403') && attempt < this.config.maxRetries) {
              console.log(`⚠️ 403 error on attempt ${attempt}, retrying...`);
              await new Promise(resolve => setTimeout(resolve, this.config.retryDelay * attempt));
              continue;
            }
            throw error;
          }

          session = data.session;
          
          // Cache the session for future use
          if (session) {
            this.cacheSession(session);
          }

          console.log(`✅ Session recovered successfully on attempt ${attempt}`);
          break;

        } catch (error) {
          lastError = error;
          
          if (attempt < this.config.maxRetries) {
            console.log(`❌ Attempt ${attempt} failed, retrying in ${this.config.retryDelay * attempt}ms...`);
            await new Promise(resolve => setTimeout(resolve, this.config.retryDelay * attempt));
          }
        }
      }

      if (!session && lastError) {
        throw lastError;
      }

      return {
        session,
        fromCache: false,
        duration: Date.now() - startTime
      };

    } catch (error) {
      console.error('❌ Optimized session recovery failed:', error);
      return {
        session: null,
        fromCache: false,
        duration: Date.now() - startTime
      };
    }
  }

  /**
   * Preemptive token refresh
   */
  async preemptiveRefresh(): Promise<boolean> {
    if (!this.config.enablePreemptiveRefresh) return false;

    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) return false;

      const now = Date.now() / 1000;
      const expiresAt = session.expires_at || 0;
      const timeUntilExpiry = expiresAt - now;

      // Refresh if token expires in less than 5 minutes
      if (timeUntilExpiry < 300) {
        console.log('🔄 Preemptively refreshing token...');
        
        const { error } = await supabase.auth.refreshSession();
        
        if (error) {
          console.warn('⚠️ Preemptive refresh failed:', error);
          return false;
        }

        console.log('✅ Token refreshed preemptively');
        return true;
      }

      return false;
    } catch (error) {
      console.warn('⚠️ Preemptive refresh check failed:', error);
      return false;
    }
  }

  /**
   * Handle page visibility change (tab focus/blur)
   */
  handleVisibilityChange(): void {
    if (document.visibilityState === 'visible') {
      console.log('👁️ Page became visible, checking session...');
      
      // Check if we need to refresh session
      setTimeout(() => {
        this.preemptiveRefresh();
      }, 1000);
    }
  }

  /**
   * Initialize page refresh optimization
   */
  initialize(): void {
    console.log('🚀 Initializing page refresh optimization...');

    // Warm up connection immediately
    if (this.config.enableConnectionWarmup) {
      this.warmupConnection();
    }

    // Listen for page visibility changes
    document.addEventListener('visibilitychange', () => {
      this.handleVisibilityChange();
    });

    // Preemptive refresh check every 2 minutes
    if (this.config.enablePreemptiveRefresh) {
      setInterval(() => {
        this.preemptiveRefresh();
      }, 120000);
    }

    console.log('✅ Page refresh optimization initialized');
  }

  /**
   * Clear cached session
   */
  clearCache(): void {
    this.sessionCache = null;
    console.log('🗑️ Session cache cleared');
  }
}

// Create global instance
export const pageRefreshOptimizer = new PageRefreshOptimizer({
  enableSessionCache: true,
  cacheTimeout: 30000,
  enablePreemptiveRefresh: true,
  enableConnectionWarmup: true,
  maxRetries: 3,
  retryDelay: 2000
});

/**
 * Enhanced session recovery function for AuthContext
 */
export const enhancedSessionRecovery = async () => {
  return await pageRefreshOptimizer.optimizedSessionRecovery();
};

/**
 * Initialize optimization on app start
 */
export const initializePageRefreshOptimization = () => {
  pageRefreshOptimizer.initialize();
};

// Auto-initialize in browser environment
if (typeof window !== 'undefined') {
  // Initialize after a short delay
  setTimeout(() => {
    initializePageRefreshOptimization();
  }, 1000);

  // Export for manual testing
  (window as any).pageRefreshOptimizer = pageRefreshOptimizer;
  (window as any).testSessionRecovery = () => pageRefreshOptimizer.optimizedSessionRecovery();
}

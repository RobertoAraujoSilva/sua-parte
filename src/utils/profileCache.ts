/**
 * Profile Cache System
 * Reduces redundant database calls for user profiles
 */

interface CachedProfile {
  profile: any;
  timestamp: number;
  userId: string;
}

class ProfileCache {
  private cache: Map<string, CachedProfile> = new Map();
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
  private readonly MAX_CACHE_SIZE = 50; // Maximum cached profiles

  /**
   * Get profile from cache if valid
   */
  get(userId: string): any | null {
    const cached = this.cache.get(userId);
    
    if (!cached) {
      return null;
    }
    
    // Check if cache is still valid
    const now = Date.now();
    if (now - cached.timestamp > this.CACHE_DURATION) {
      this.cache.delete(userId);
      return null;
    }
    
    console.log(`📋 Profile cache hit for user: ${userId}`);
    return cached.profile;
  }

  /**
   * Store profile in cache
   */
  set(userId: string, profile: any): void {
    // Prevent cache from growing too large
    if (this.cache.size >= this.MAX_CACHE_SIZE) {
      // Remove oldest entry
      const oldestKey = this.cache.keys().next().value;
      if (oldestKey) {
        this.cache.delete(oldestKey);
      }
    }

    this.cache.set(userId, {
      profile,
      timestamp: Date.now(),
      userId
    });

    console.log(`📋 Profile cached for user: ${userId}`);
  }

  /**
   * Invalidate cache for specific user
   */
  invalidate(userId: string): void {
    this.cache.delete(userId);
    console.log(`🗑️ Profile cache invalidated for user: ${userId}`);
  }

  /**
   * Clear all cached profiles
   */
  clear(): void {
    this.cache.clear();
    console.log('🗑️ All profile cache cleared');
  }

  /**
   * Get cache statistics
   */
  getStats(): {
    size: number;
    entries: Array<{ userId: string; age: number; valid: boolean }>;
  } {
    const now = Date.now();
    const entries = Array.from(this.cache.entries()).map(([userId, cached]) => ({
      userId,
      age: now - cached.timestamp,
      valid: (now - cached.timestamp) <= this.CACHE_DURATION
    }));

    return {
      size: this.cache.size,
      entries
    };
  }

  /**
   * Cleanup expired entries
   */
  cleanup(): void {
    const now = Date.now();
    const expiredKeys: string[] = [];

    this.cache.forEach((cached, userId) => {
      if (now - cached.timestamp > this.CACHE_DURATION) {
        expiredKeys.push(userId);
      }
    });

    expiredKeys.forEach(key => this.cache.delete(key));

    if (expiredKeys.length > 0) {
      console.log(`🧹 Cleaned up ${expiredKeys.length} expired profile cache entries`);
    }
  }
}

// Global instance
export const profileCache = new ProfileCache();

// Utility functions
export const getCachedProfile = (userId: string) => profileCache.get(userId);
export const setCachedProfile = (userId: string, profile: any) => profileCache.set(userId, profile);
export const invalidateProfileCache = (userId: string) => profileCache.invalidate(userId);

// Auto-cleanup every 10 minutes
if (typeof window !== 'undefined') {
  setInterval(() => {
    profileCache.cleanup();
  }, 10 * 60 * 1000);

  // Add to window for debugging
  if (import.meta.env.DEV) {
    (window as any).profileCache = {
      stats: () => profileCache.getStats(),
      clear: () => profileCache.clear(),
      cleanup: () => profileCache.cleanup()
    };
    
    console.log('🔧 Profile cache available: window.profileCache');
  }
}

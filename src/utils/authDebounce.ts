/**
 * Authentication Debounce Utility
 * Prevents redundant auth operations and reduces console pollution
 */

interface DebouncedOperation {
  lastCall: number;
  timeout?: NodeJS.Timeout;
  inProgress: boolean;
}

class AuthDebouncer {
  private operations: Map<string, DebouncedOperation> = new Map();
  private readonly DEBOUNCE_DELAY = 100; // 100ms debounce
  private readonly MIN_INTERVAL = 500; // Minimum 500ms between same operations

  /**
   * Debounce an authentication operation to prevent redundant calls
   */
  debounce<T>(
    operationKey: string,
    operation: () => Promise<T>,
    options: {
      delay?: number;
      minInterval?: number;
      skipIfInProgress?: boolean;
    } = {}
  ): Promise<T> {
    const {
      delay = this.DEBOUNCE_DELAY,
      minInterval = this.MIN_INTERVAL,
      skipIfInProgress = true
    } = options;

    return new Promise((resolve, reject) => {
      const now = Date.now();
      const existing = this.operations.get(operationKey);

      // Skip if operation is already in progress
      if (existing?.inProgress && skipIfInProgress) {
        console.log(`⏭️ Skipping ${operationKey} - already in progress`);
        reject(new Error(`Operation ${operationKey} already in progress`));
        return;
      }

      // Check minimum interval
      if (existing?.lastCall && (now - existing.lastCall) < minInterval) {
        console.log(`⏭️ Skipping ${operationKey} - too soon (${now - existing.lastCall}ms < ${minInterval}ms)`);
        reject(new Error(`Operation ${operationKey} called too frequently`));
        return;
      }

      // Clear existing timeout
      if (existing?.timeout) {
        clearTimeout(existing.timeout);
      }

      // Set up debounced operation
      const timeout = setTimeout(async () => {
        const opData = this.operations.get(operationKey);
        if (opData) {
          opData.inProgress = true;
          opData.lastCall = now;
        }

        try {
          const result = await operation();
          resolve(result);
        } catch (error) {
          reject(error);
        } finally {
          const opData = this.operations.get(operationKey);
          if (opData) {
            opData.inProgress = false;
          }
        }
      }, delay);

      // Store operation data
      this.operations.set(operationKey, {
        lastCall: existing?.lastCall || 0,
        timeout,
        inProgress: existing?.inProgress || false
      });
    });
  }

  /**
   * Check if an operation is currently in progress
   */
  isInProgress(operationKey: string): boolean {
    return this.operations.get(operationKey)?.inProgress || false;
  }

  /**
   * Get time since last operation
   */
  getTimeSinceLastCall(operationKey: string): number {
    const existing = this.operations.get(operationKey);
    return existing?.lastCall ? Date.now() - existing.lastCall : Infinity;
  }

  /**
   * Clear all pending operations
   */
  clearAll(): void {
    this.operations.forEach(op => {
      if (op.timeout) {
        clearTimeout(op.timeout);
      }
    });
    this.operations.clear();
  }

  /**
   * Get statistics about operations
   */
  getStats(): Record<string, { lastCall: number; inProgress: boolean; timeSince: number }> {
    const stats: Record<string, any> = {};
    const now = Date.now();

    this.operations.forEach((op, key) => {
      stats[key] = {
        lastCall: op.lastCall,
        inProgress: op.inProgress,
        timeSince: op.lastCall ? now - op.lastCall : -1
      };
    });

    return stats;
  }
}

// Global instance
export const authDebouncer = new AuthDebouncer();

// Utility functions
export const debouncedAuthOperation = <T>(
  key: string,
  operation: () => Promise<T>,
  options?: { delay?: number; minInterval?: number }
): Promise<T> => {
  return authDebouncer.debounce(key, operation, options);
};

export const isAuthOperationInProgress = (key: string): boolean => {
  return authDebouncer.isInProgress(key);
};

// Add to window for debugging
if (typeof window !== 'undefined' && import.meta.env.DEV) {
  (window as any).authDebouncer = {
    stats: () => authDebouncer.getStats(),
    clear: () => authDebouncer.clearAll(),
    isInProgress: (key: string) => authDebouncer.isInProgress(key)
  };
  
  console.log('🔧 Auth debouncer available: window.authDebouncer');
}

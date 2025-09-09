/**
 * Database Error Handler Utility
 * Handles common Supabase database errors and provides fallback strategies
 */

export interface DatabaseError {
  code: string;
  message: string;
  details?: any;
  hint?: string;
}

export interface ErrorHandlerResult<T> {
  success: boolean;
  data?: T;
  error?: string;
  shouldRetry: boolean;
  fallbackData?: T;
}

/**
 * Handles common database errors and provides appropriate responses
 */
export function handleDatabaseError<T>(
  error: any,
  fallbackData?: T,
  context?: string
): ErrorHandlerResult<T> {
  const dbError = error as DatabaseError;
  
  console.error(`Database error in ${context || 'unknown context'}:`, dbError);

  // Handle specific error codes
  switch (dbError.code) {
    case 'PGRST201':
      // Relationship ambiguity error
      return {
        success: false,
        error: 'Erro de relacionamento no banco de dados. Usando dados simplificados.',
        shouldRetry: false,
        fallbackData
      };

    case '42703':
      // Column does not exist
      return {
        success: false,
        error: 'Estrutura do banco de dados incompatível. Usando dados padrão.',
        shouldRetry: false,
        fallbackData
      };

    case '42P01':
      // Table does not exist
      return {
        success: false,
        error: 'Tabela não encontrada no banco de dados.',
        shouldRetry: false,
        fallbackData
      };

    case 'PGRST116':
      // No rows returned
      return {
        success: true,
        data: fallbackData || ([] as unknown as T),
        shouldRetry: false
      };

    default:
      // Generic database error
      return {
        success: false,
        error: `Erro no banco de dados: ${dbError.message || 'Erro desconhecido'}`,
        shouldRetry: true,
        fallbackData
      };
  }
}

/**
 * Creates a safe database query wrapper that handles errors gracefully
 */
export function createSafeQuery<T>(
  queryFn: () => Promise<{ data: T | null; error: any }>,
  fallbackData: T,
  context?: string
) {
  return async (): Promise<ErrorHandlerResult<T>> => {
    try {
      const result = await queryFn();
      
      if (result.error) {
        return handleDatabaseError(result.error, fallbackData, context);
      }

      return {
        success: true,
        data: result.data || fallbackData,
        shouldRetry: false
      };
    } catch (error) {
      return handleDatabaseError(error, fallbackData, context);
    }
  };
}

/**
 * Debounce utility to prevent excessive API calls
 */
export function createDebouncer(delay: number = 1000) {
  let timeoutId: NodeJS.Timeout | null = null;
  let lastCallTime = 0;

  return function<T extends (...args: any[]) => any>(fn: T): T {
    return ((...args: any[]) => {
      const now = Date.now();
      
      // If called too frequently, ignore
      if (now - lastCallTime < delay) {
        console.log('Debounced: Call ignored due to frequency limit');
        return Promise.resolve();
      }

      lastCallTime = now;

      if (timeoutId) {
        clearTimeout(timeoutId);
      }

      return new Promise((resolve) => {
        timeoutId = setTimeout(() => {
          resolve(fn(...args));
        }, 100);
      });
    }) as T;
  };
}

/**
 * Circuit breaker pattern for database operations
 */
export class DatabaseCircuitBreaker {
  private failureCount = 0;
  private lastFailureTime = 0;
  private readonly maxFailures: number;
  private readonly resetTimeout: number;

  constructor(maxFailures = 5, resetTimeout = 30000) {
    this.maxFailures = maxFailures;
    this.resetTimeout = resetTimeout;
  }

  async execute<T>(
    operation: () => Promise<T>,
    fallback: T,
    context?: string
  ): Promise<T> {
    // Check if circuit is open
    if (this.isOpen()) {
      console.warn(`Circuit breaker open for ${context}. Using fallback.`);
      return fallback;
    }

    try {
      const result = await operation();
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure();
      console.error(`Circuit breaker failure in ${context}:`, error);
      return fallback;
    }
  }

  private isOpen(): boolean {
    return (
      this.failureCount >= this.maxFailures &&
      Date.now() - this.lastFailureTime < this.resetTimeout
    );
  }

  private onSuccess(): void {
    this.failureCount = 0;
  }

  private onFailure(): void {
    this.failureCount++;
    this.lastFailureTime = Date.now();
  }

  reset(): void {
    this.failureCount = 0;
    this.lastFailureTime = 0;
  }
}

// Global circuit breaker instance
export const globalCircuitBreaker = new DatabaseCircuitBreaker();
import { useState, useCallback } from 'react';

interface TimeoutFetchState<T> {
  data: T | null;
  loading: boolean;
  error: boolean;
  refetch: () => Promise<void>;
}

export function useTimeoutFetch<T>(
  fetchFn: () => Promise<T>,
  timeout: number = 10000
): TimeoutFetchState<T> {
  const [state, setState] = useState<{
    data: T | null;
    loading: boolean;
    error: boolean;
  }>({
    data: null,
    loading: true,
    error: false
  });

  const withTimeout = useCallback(<T>(promise: Promise<T>, ms: number): Promise<T> => {
    return Promise.race([
      promise,
      new Promise<never>((_, reject) => 
        setTimeout(() => reject(new Error('timeout')), ms)
      )
    ]);
  }, []);

  const refetch = useCallback(async () => {
    setState(prev => ({ ...prev, loading: true, error: false }));
    try {
      const data = await withTimeout(fetchFn(), timeout);
      setState({ data, loading: false, error: false });
    } catch (error) {
      console.error('Fetch error:', error);
      setState(prev => ({ ...prev, loading: false, error: true }));
    }
  }, [fetchFn, timeout, withTimeout]);

  return { ...state, refetch };
}
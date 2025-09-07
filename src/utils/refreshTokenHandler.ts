/**
 * Refresh Token Error Handler - Sistema Ministerial
 * Handles invalid refresh token errors gracefully
 */

import { supabase } from '@/integrations/supabase/client';
import { forceLogout } from './forceLogout';

export interface RefreshTokenError {
  message: string;
  code?: string;
  isRefreshTokenError: boolean;
}

/**
 * Checks if an error is related to refresh token issues
 */
export function isRefreshTokenError(error: any): boolean {
  if (!error) return false;
  
  const message = error.message || error.toString() || '';
  const code = error.code || '';
  
  return (
    message.includes('Invalid Refresh Token') ||
    message.includes('Refresh Token Not Found') ||
    message.includes('refresh_token') ||
    code === 'invalid_grant' ||
    code === 'refresh_token_not_found' ||
    code === 'auth/invalid-refresh-token'
  );
}

/**
 * Handles refresh token errors by clearing invalid tokens and forcing logout
 */
export function handleRefreshTokenError(error: any): void {
  console.warn('🔄 Refresh token error detected:', error);
  
  // Clear all authentication data
  try {
    // Clear Supabase session
    supabase.auth.signOut({ scope: 'local' }).catch(e => {
      console.error('❌ Error during signOut:', e);
    });
    
    // Clear localStorage tokens
    localStorage.removeItem('supabase.auth.token');
    localStorage.removeItem('sb-refresh-token');
    localStorage.removeItem('sb-access-token');
    sessionStorage.clear();
    
    // Clear all Supabase-specific storage
    const keys = Object.keys(localStorage);
    keys.forEach(key => {
      if (key.includes('supabase') || key.includes('sb-')) {
        localStorage.removeItem(key);
      }
    });
    
    console.log('🧹 Cleared invalid authentication data');
  } catch (clearError) {
    console.error('❌ Error clearing auth data:', clearError);
  }
  
  // Force logout to reset authentication state
  console.log('🚪 Forcing logout due to invalid refresh token');
  forceLogout();
}

/**
 * Wraps Supabase auth operations with refresh token error handling
 */
export async function withRefreshTokenErrorHandling<T>(
  operation: () => Promise<T>
): Promise<T> {
  try {
    return await operation();
  } catch (error) {
    if (isRefreshTokenError(error)) {
      handleRefreshTokenError(error);
      // Return a rejected promise to prevent further execution
      throw new Error('Authentication session expired. Please log in again.');
    }
    throw error;
  }
}

/**
 * Enhanced session recovery that handles refresh token errors
 */
export async function recoverSessionWithErrorHandling(): Promise<{
  session: any;
  error: any;
  recovered: boolean;
}> {
  try {
    const { data: { session }, error } = await supabase.auth.getSession();
    
    if (error && isRefreshTokenError(error)) {
      console.warn('🔄 Session recovery failed due to refresh token error');
      handleRefreshTokenError(error);
      return { session: null, error, recovered: false };
    }
    
    return { session, error, recovered: true };
  } catch (error) {
    if (isRefreshTokenError(error)) {
      console.warn('🔄 Session recovery exception due to refresh token error');
      handleRefreshTokenError(error);
      return { session: null, error, recovered: false };
    }
    
    console.error('❌ Session recovery failed:', error);
    return { session: null, error, recovered: false };
  }
}

/**
 * Global error handler for unhandled refresh token errors
 */
export function setupGlobalRefreshTokenErrorHandler(): void {
  if (typeof window === 'undefined') return;
  
  // Handle unhandled promise rejections
  window.addEventListener('unhandledrejection', (event) => {
    if (isRefreshTokenError(event.reason)) {
      console.warn('🔄 Unhandled refresh token error caught globally');
      handleRefreshTokenError(event.reason);
      event.preventDefault(); // Prevent the error from being logged to console
    }
  });
  
  // Handle general errors
  window.addEventListener('error', (event) => {
    if (isRefreshTokenError(event.error)) {
      console.warn('🔄 Refresh token error caught globally');
      handleRefreshTokenError(event.error);
      event.preventDefault();
    }
  });
}

/**
 * Preemptively refresh the token before it expires
 */
export async function preemptiveTokenRefresh(): Promise<boolean> {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) return false;

    const now = Date.now() / 1000;
    const expiresAt = session.expires_at || 0;
    const timeUntilExpiry = expiresAt - now;

    // Refresh if token expires in less than 5 minutes
    if (timeUntilExpiry < 300) {
      console.log('🔄 Preemptively refreshing token...');
      
      const { data, error } = await supabase.auth.refreshSession();
      
      if (error) {
        console.warn('⚠️ Preemptive refresh failed:', error);
        
        // If it's a refresh token error, handle it
        if (isRefreshTokenError(error)) {
          handleRefreshTokenError(error);
        }
        
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
 * Setup periodic token refresh
 */
export function setupPeriodicTokenRefresh(intervalMinutes: number = 4): void {
  if (typeof window === 'undefined') return;
  
  // Check token every 4 minutes by default
  const interval = setInterval(() => {
    preemptiveTokenRefresh().catch(error => {
      console.error('❌ Periodic token refresh error:', error);
    });
  }, intervalMinutes * 60 * 1000);
  
  // Clean up on page unload
  window.addEventListener('beforeunload', () => {
    clearInterval(interval);
  });
}

// Auto-setup global handler and periodic refresh
if (typeof window !== 'undefined') {
  setupGlobalRefreshTokenErrorHandler();
  setupPeriodicTokenRefresh();
}


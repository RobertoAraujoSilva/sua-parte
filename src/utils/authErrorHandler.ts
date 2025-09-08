/**
 * Authentication Error Handler
 * Handles Supabase authentication errors and provides recovery mechanisms
 */

import { supabase } from '@/integrations/supabase/client';

// Error types
type AuthErrorType = 'invalid_refresh_token' | 'session_expired' | 'network_error' | 'unknown';

// Error handler options
interface ErrorHandlerOptions {
  redirectToLogin?: boolean;
  clearLocalStorage?: boolean;
  retryAuthentication?: boolean;
  showNotification?: boolean;
}

/**
 * Handle authentication errors
 * @param error The error object from Supabase
 * @param options Options for handling the error
 */
export async function handleAuthError(error: any, options: ErrorHandlerOptions = {}) {
  const {
    redirectToLogin = true,
    clearLocalStorage = true,
    retryAuthentication = true,
    showNotification = true
  } = options;

  // Determine error type
  const errorType = getAuthErrorType(error);
  console.error(`🔐 Auth Error (${errorType}):`, error);

  // Handle based on error type
  switch (errorType) {
    case 'invalid_refresh_token':
      if (clearLocalStorage) {
        // Clear only auth-related items from localStorage
        clearAuthStorage();
      }
      
      if (retryAuthentication) {
        // Try to get a new session
        await refreshSession();
      }
      
      if (redirectToLogin) {
        // Redirect to login page
        window.location.href = '/auth';
      }
      break;
      
    case 'session_expired':
      if (clearLocalStorage) {
        clearAuthStorage();
      }
      
      if (redirectToLogin) {
        window.location.href = '/auth';
      }
      break;
      
    case 'network_error':
      // For network errors, we don't want to clear storage or redirect
      // Just show a notification
      if (showNotification) {
        console.warn('Network error during authentication. Please check your connection.');
      }
      break;
      
    default:
      if (clearLocalStorage) {
        clearAuthStorage();
      }
      
      if (redirectToLogin) {
        window.location.href = '/auth';
      }
  }
}

/**
 * Determine the type of authentication error
 */
function getAuthErrorType(error: any): AuthErrorType {
  if (!error) return 'unknown';
  
  const errorMessage = typeof error === 'string' ? error : 
                      error.message || 
                      (error.error && error.error.message) || 
                      JSON.stringify(error);
  
  if (errorMessage.includes('Invalid Refresh Token') || 
      errorMessage.includes('Refresh Token Not Found')) {
    return 'invalid_refresh_token';
  }
  
  if (errorMessage.includes('session expired') || 
      errorMessage.includes('JWT expired')) {
    return 'session_expired';
  }
  
  if (errorMessage.includes('network') || 
      errorMessage.includes('Failed to fetch')) {
    return 'network_error';
  }
  
  return 'unknown';
}

/**
 * Clear authentication-related items from localStorage
 */
function clearAuthStorage() {
  // Clear only Supabase auth items
  const keysToRemove = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && (key.includes('supabase') || key.includes('sb-'))) {
      keysToRemove.push(key);
    }
  }
  
  // Remove the keys
  keysToRemove.forEach(key => localStorage.removeItem(key));
  console.log(`🧹 Cleared ${keysToRemove.length} auth-related items from localStorage`);
}

/**
 * Try to refresh the session
 */
async function refreshSession() {
  try {
    const { data, error } = await supabase.auth.refreshSession();
    if (error) throw error;
    if (data.session) {
      console.log('✅ Session refreshed successfully');
      return true;
    }
  } catch (error) {
    console.error('❌ Failed to refresh session:', error);
  }
  return false;
}

/**
 * Setup global error handler for auth errors
 */
export function setupGlobalAuthErrorHandler() {
  // Listen for auth state changes
  supabase.auth.onAuthStateChange((event, session) => {
    if (event === 'TOKEN_REFRESHED') {
      console.log('✅ Token refreshed successfully');
    } else if (event === 'SIGNED_OUT') {
      console.log('⚠️ User signed out');
    }
  });
  
  // Add global error handler
  window.addEventListener('unhandledrejection', (event) => {
    const error = event.reason;
    if (error && typeof error === 'object') {
      const errorMsg = error.message || JSON.stringify(error);
      if (errorMsg.includes('Invalid Refresh Token') || 
          errorMsg.includes('Refresh Token Not Found') ||
          errorMsg.includes('JWT expired')) {
        // This is an auth error, handle it
        handleAuthError(error, {
          redirectToLogin: true,
          clearLocalStorage: true,
          retryAuthentication: false
        });
        // Prevent the default handler
        event.preventDefault();
      }
    }
  });
}
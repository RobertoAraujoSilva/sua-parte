import { supabase } from '@/lib/supabase';

export const handleAuthError = async (error: any) => {
  if (error?.message?.includes('Invalid Refresh Token') || 
      error?.message?.includes('Refresh Token Not Found') ||
      error?.message?.includes('Authentication session expired')) {
    
    // Clear all auth data
    await supabase.auth.signOut();
    localStorage.clear();
    sessionStorage.clear();
    
    // Redirect to auth page
    window.location.href = '/auth';
  }
};

export const setupGlobalAuthErrorHandler = () => {
  // Handle unhandled promise rejections
  window.addEventListener('unhandledrejection', (event) => {
    if (event.reason?.message?.includes('Invalid Refresh Token')) {
      event.preventDefault();
      handleAuthError(event.reason);
    }
  });
};
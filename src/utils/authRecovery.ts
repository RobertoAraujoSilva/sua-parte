/**
 * Authentication Recovery System
 * Automatically detects and recovers from corrupted authentication states
 */

import { supabase } from '@/integrations/supabase/client';

interface AuthRecoveryOptions {
  maxRetries?: number;
  timeoutMs?: number;
  clearStorageOnFailure?: boolean;
}

interface AuthRecoveryResult {
  success: boolean;
  action: 'recovered' | 'cleared' | 'failed';
  error?: string;
  details?: any;
}

// Track recovery attempts to prevent infinite loops
let recoveryAttempts = 0;
const MAX_RECOVERY_ATTEMPTS = 3;
const RECOVERY_COOLDOWN = 30000; // 30 seconds
let lastRecoveryAttempt = 0;

/**
 * Detects if authentication state is corrupted
 */
export async function detectAuthCorruption(): Promise<boolean> {
  try {
    console.log('🔍 Detecting authentication corruption...');
    
    // Check if we have a session but can't load basic data
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError) {
      console.log('❌ Session error detected:', sessionError);
      return true;
    }
    
    if (!session) {
      console.log('ℹ️ No session found - not corrupted, just not authenticated');
      return false;
    }
    
    console.log('✅ Session exists, testing basic functionality...');
    
    // Test basic database connectivity with a simple query
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Database query timeout')), 5000);
    });
    
    const queryPromise = supabase
      .from('profiles')
      .select('id')
      .limit(1);
    
    try {
      await Promise.race([queryPromise, timeoutPromise]);
      console.log('✅ Basic database connectivity working');
      return false;
    } catch (error) {
      console.log('❌ Database query failed or timed out:', error);
      return true;
    }
    
  } catch (error) {
    console.error('❌ Error detecting auth corruption:', error);
    return true;
  }
}

/**
 * Attempts to recover from authentication corruption
 */
export async function recoverAuthentication(options: AuthRecoveryOptions = {}): Promise<AuthRecoveryResult> {
  const {
    maxRetries = 2,
    timeoutMs = 10000,
    clearStorageOnFailure = true
  } = options;
  
  const now = Date.now();
  
  // Prevent too frequent recovery attempts
  if (now - lastRecoveryAttempt < RECOVERY_COOLDOWN) {
    console.log('⏰ Recovery cooldown active, skipping...');
    return {
      success: false,
      action: 'failed',
      error: 'Recovery cooldown active'
    };
  }
  
  // Prevent infinite recovery loops
  if (recoveryAttempts >= MAX_RECOVERY_ATTEMPTS) {
    console.log('🛑 Max recovery attempts reached, clearing storage...');
    await clearAuthStorage();
    return {
      success: true,
      action: 'cleared',
      details: 'Max attempts reached, storage cleared'
    };
  }
  
  lastRecoveryAttempt = now;
  recoveryAttempts++;
  
  console.log(`🔄 Starting authentication recovery (attempt ${recoveryAttempts}/${MAX_RECOVERY_ATTEMPTS})...`);
  
  try {
    // Step 1: Try to refresh the session
    console.log('🔄 Attempting session refresh...');
    const { data: refreshData, error: refreshError } = await supabase.auth.refreshSession();
    
    if (refreshError) {
      console.log('❌ Session refresh failed:', refreshError);
      
      if (clearStorageOnFailure) {
        console.log('🧹 Clearing corrupted auth storage...');
        await clearAuthStorage();
        return {
          success: true,
          action: 'cleared',
          error: refreshError.message
        };
      }
      
      return {
        success: false,
        action: 'failed',
        error: refreshError.message
      };
    }
    
    if (refreshData.session) {
      console.log('✅ Session refreshed successfully');
      
      // Test if the refreshed session works
      const isStillCorrupted = await detectAuthCorruption();
      
      if (!isStillCorrupted) {
        console.log('🎉 Authentication recovery successful!');
        recoveryAttempts = 0; // Reset counter on success
        return {
          success: true,
          action: 'recovered',
          details: 'Session refreshed successfully'
        };
      }
    }
    
    // If we get here, refresh didn't help
    console.log('⚠️ Session refresh didn\'t resolve corruption');
    
    if (clearStorageOnFailure) {
      console.log('🧹 Clearing auth storage as fallback...');
      await clearAuthStorage();
      return {
        success: true,
        action: 'cleared',
        details: 'Session refresh failed, storage cleared'
      };
    }
    
    return {
      success: false,
      action: 'failed',
      error: 'Session refresh did not resolve corruption'
    };
    
  } catch (error: any) {
    console.error('❌ Error during authentication recovery:', error);
    
    if (clearStorageOnFailure) {
      console.log('🧹 Clearing auth storage due to recovery error...');
      await clearAuthStorage();
      return {
        success: true,
        action: 'cleared',
        error: error.message
      };
    }
    
    return {
      success: false,
      action: 'failed',
      error: error.message
    };
  }
}

/**
 * Clears all authentication-related storage
 */
export async function clearAuthStorage(): Promise<void> {
  console.log('🧹 Clearing authentication storage...');
  
  try {
    // Sign out from Supabase (with timeout)
    const signOutPromise = supabase.auth.signOut();
    const timeoutPromise = new Promise((resolve) => {
      setTimeout(resolve, 3000); // 3 second timeout
    });
    
    await Promise.race([signOutPromise, timeoutPromise]);
    console.log('✅ Supabase signOut completed (or timed out)');
  } catch (error) {
    console.log('⚠️ Supabase signOut failed, proceeding with manual cleanup:', error);
  }
  
  // Clear localStorage
  const authKeys = [
    'supabase.auth.token',
    'sb-nwpuurgwnnuejqinkvrh-auth-token',
    'sb-auth-token',
    'supabase-auth-token',
    'supabase.session',
    'sb-session'
  ];
  
  authKeys.forEach(key => {
    try {
      localStorage.removeItem(key);
      sessionStorage.removeItem(key);
    } catch (error) {
      console.log(`⚠️ Could not remove ${key}:`, error);
    }
  });
  
  // Clear auth cookies
  document.cookie.split(";").forEach((c) => {
    const eqPos = c.indexOf("=");
    const name = eqPos > -1 ? c.substr(0, eqPos).trim() : c.trim();
    if (name.includes('supabase') || name.includes('sb-') || name.includes('auth')) {
      document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;domain=" + window.location.hostname;
      document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/";
    }
  });
  
  console.log('✅ Authentication storage cleared');
}

/**
 * Automatic recovery system that runs on app initialization
 */
export async function initializeAuthRecovery(): Promise<void> {
  console.log('🚀 Initializing authentication recovery system...');
  
  // Wait a bit for initial auth to settle
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  const isCorrupted = await detectAuthCorruption();
  
  if (isCorrupted) {
    console.log('⚠️ Authentication corruption detected, attempting recovery...');
    const result = await recoverAuthentication();
    
    if (result.success && result.action === 'cleared') {
      console.log('🔄 Authentication cleared, redirecting to login...');
      // Redirect to login page after clearing
      window.location.href = '/auth';
    }
  } else {
    console.log('✅ Authentication state is healthy');
  }
}

// Expose functions on window for manual testing
if (typeof window !== 'undefined') {
  (window as any).authRecovery = {
    detect: detectAuthCorruption,
    recover: recoverAuthentication,
    clear: clearAuthStorage,
    initialize: initializeAuthRecovery
  };
  console.log('🔧 Auth recovery tools available: window.authRecovery');
}

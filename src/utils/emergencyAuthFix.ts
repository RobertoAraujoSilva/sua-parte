/**
 * Emergency Authentication Fix
 * Immediate solution for stuck loading states
 */

import { supabase } from '@/integrations/supabase/client';

/**
 * Emergency fix for authentication issues
 * This function immediately clears all auth data and redirects to login
 */
export async function emergencyAuthFix(): Promise<void> {
  console.log('🚨 EMERGENCY AUTH FIX INITIATED');
  console.log('🚨 This will immediately clear all authentication data and redirect to login');
  
  try {
    // Step 1: Try to sign out from Supabase (with very short timeout)
    console.log('🔄 Attempting Supabase signOut...');
    const signOutPromise = supabase.auth.signOut();
    const timeoutPromise = new Promise((resolve) => {
      setTimeout(resolve, 1000); // Only 1 second timeout
    });
    
    await Promise.race([signOutPromise, timeoutPromise]);
    console.log('✅ Supabase signOut completed (or timed out)');
  } catch (error) {
    console.log('⚠️ Supabase signOut failed, proceeding with manual cleanup:', error);
  }
  
  // Step 2: Clear all storage immediately
  console.log('🧹 Clearing all authentication storage...');
  
  try {
    // Clear localStorage
    localStorage.clear();
    console.log('✅ localStorage cleared');
  } catch (error) {
    console.log('⚠️ Could not clear localStorage:', error);
  }
  
  try {
    // Clear sessionStorage
    sessionStorage.clear();
    console.log('✅ sessionStorage cleared');
  } catch (error) {
    console.log('⚠️ Could not clear sessionStorage:', error);
  }
  
  // Step 3: Clear specific Supabase keys (backup)
  const supabaseKeys = [
    'supabase.auth.token',
    'sb-nwpuurgwnnuejqinkvrh-auth-token',
    'sb-auth-token',
    'supabase-auth-token',
    'supabase.session',
    'sb-session'
  ];
  
  supabaseKeys.forEach(key => {
    try {
      localStorage.removeItem(key);
      sessionStorage.removeItem(key);
    } catch (error) {
      console.log(`⚠️ Could not remove ${key}:`, error);
    }
  });
  
  // Step 4: Clear cookies
  console.log('🧹 Clearing auth cookies...');
  try {
    document.cookie.split(";").forEach((c) => {
      const eqPos = c.indexOf("=");
      const name = eqPos > -1 ? c.substr(0, eqPos).trim() : c.trim();
      if (name.includes('supabase') || name.includes('sb-') || name.includes('auth')) {
        document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;domain=" + window.location.hostname;
        document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/";
      }
    });
    console.log('✅ Auth cookies cleared');
  } catch (error) {
    console.log('⚠️ Could not clear cookies:', error);
  }
  
  // Step 5: Clear IndexedDB (if any Supabase data is stored there)
  try {
    if ('indexedDB' in window) {
      const databases = await indexedDB.databases();
      for (const db of databases) {
        if (db.name && (db.name.includes('supabase') || db.name.includes('sb-'))) {
          console.log(`🧹 Clearing IndexedDB: ${db.name}`);
          indexedDB.deleteDatabase(db.name);
        }
      }
    }
  } catch (error) {
    console.log('⚠️ Could not clear IndexedDB:', error);
  }
  
  console.log('✅ Emergency auth fix completed');
  
  // Step 6: Show user feedback and redirect
  const userConfirmed = confirm(
    '🔄 Autenticação limpa com sucesso!\n\n' +
    'Você será redirecionado para a página de login.\n\n' +
    'Clique OK para continuar.'
  );
  
  if (userConfirmed || true) { // Always redirect
    console.log('🔄 Redirecting to auth page...');
    window.location.href = '/auth';
  }
}

/**
 * Quick check if emergency fix is needed
 */
export async function needsEmergencyFix(): Promise<boolean> {
  try {
    // Quick test: try to get session with very short timeout
    const sessionPromise = supabase.auth.getSession();
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Quick check timeout')), 2000);
    });
    
    const { data: { session }, error } = await Promise.race([
      sessionPromise,
      timeoutPromise
    ]) as any;
    
    if (error) {
      console.log('🚨 Session error detected, emergency fix needed:', error);
      return true;
    }
    
    if (!session) {
      console.log('ℹ️ No session found, but this is normal for logged out users');
      return false;
    }
    
    // If we have a session, test basic database connectivity
    const dbPromise = supabase.from('profiles').select('count').limit(1);
    const dbTimeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('DB check timeout')), 3000);
    });
    
    await Promise.race([dbPromise, dbTimeoutPromise]);
    
    console.log('✅ Quick check passed, no emergency fix needed');
    return false;
    
  } catch (error) {
    console.log('🚨 Quick check failed, emergency fix needed:', error);
    return true;
  }
}

/**
 * Auto-trigger emergency fix if needed
 */
export async function autoEmergencyFix(): Promise<boolean> {
  const needsFix = await needsEmergencyFix();
  
  if (needsFix) {
    console.log('🚨 Auto-triggering emergency fix...');
    await emergencyAuthFix();
    return true;
  }
  
  return false;
}

// Expose emergency fix on window for immediate access
if (typeof window !== 'undefined') {
  (window as any).emergencyAuthFix = emergencyAuthFix;
  (window as any).needsEmergencyFix = needsEmergencyFix;
  (window as any).autoEmergencyFix = autoEmergencyFix;
  
  console.log('🚨 Emergency auth fix available: window.emergencyAuthFix()');
  console.log('🔍 Check if fix needed: window.needsEmergencyFix()');
  console.log('🤖 Auto emergency fix: window.autoEmergencyFix()');
}

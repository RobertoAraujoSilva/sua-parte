/**
 * Emergency Logout Utility
 * Immediate logout when Supabase auth.signOut() is hanging
 */

export const emergencyLogout = () => {
  console.log('🚨 EMERGENCY LOGOUT INITIATED');
  console.log('🚨 Bypassing Supabase - clearing all local state immediately');
  
  try {
    // 1. Clear all localStorage
    console.log('🧹 Clearing localStorage...');
    localStorage.clear();
    
    // 2. Clear all sessionStorage
    console.log('🧹 Clearing sessionStorage...');
    sessionStorage.clear();
    
    // 3. Clear specific Supabase keys (in case clear() doesn't work)
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
      } catch (e) {
        console.log(`⚠️ Could not remove ${key}:`, e);
      }
    });
    
    // 4. Clear cookies
    console.log('🧹 Clearing auth cookies...');
    document.cookie.split(";").forEach((c) => {
      const eqPos = c.indexOf("=");
      const name = eqPos > -1 ? c.substr(0, eqPos).trim() : c.trim();
      if (name.includes('supabase') || name.includes('sb-') || name.includes('auth')) {
        document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;domain=" + window.location.hostname;
        document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/";
      }
    });
    
    // 5. Force React state reset by reloading
    console.log('🔄 Emergency logout completed - redirecting to auth page');
    
    // Small delay to ensure cleanup completes
    setTimeout(() => {
      window.location.href = '/auth';
    }, 100);
    
  } catch (error) {
    console.error('❌ Emergency logout error:', error);
    // Last resort - hard reload
    console.log('🚨 Last resort - hard page reload');
    window.location.reload();
  }
};

// Immediate logout for hanging situations
export const immediateLogout = () => {
  console.log('⚡ IMMEDIATE LOGOUT - No delays, no Supabase calls');
  
  // Clear everything immediately
  try {
    localStorage.clear();
    sessionStorage.clear();
  } catch (e) {
    console.log('⚠️ Storage clear error:', e);
  }
  
  // Immediate redirect
  window.location.href = '/auth';
};

// Smart logout that tries Supabase first, then falls back
export const smartLogout = async (supabaseSignOut: () => Promise<any>) => {
  console.log('🧠 Smart logout initiated');
  
  try {
    // Try Supabase with very short timeout
    const timeoutPromise = new Promise((resolve) => 
      setTimeout(() => {
        console.log('⏰ Smart logout timeout - switching to emergency');
        resolve({ error: { message: 'Smart logout timeout', code: 'SMART_TIMEOUT' } });
      }, 1000) // Only 1 second timeout
    );
    
    const result = await Promise.race([supabaseSignOut(), timeoutPromise]) as any;
    
    if (result?.error) {
      console.log('⚠️ Supabase signOut failed or timed out, using emergency logout');
      emergencyLogout();
    } else {
      console.log('✅ Supabase signOut successful');
      // Still clear local state to be sure
      localStorage.clear();
      sessionStorage.clear();
      setTimeout(() => {
        window.location.href = '/auth';
      }, 500);
    }
  } catch (error) {
    console.error('❌ Smart logout error, falling back to emergency:', error);
    emergencyLogout();
  }
};

// Add to window for console access
if (typeof window !== 'undefined') {
  (window as any).emergencyLogout = emergencyLogout;
  (window as any).immediateLogout = immediateLogout;
  (window as any).smartLogout = smartLogout;
  
  console.log('🚨 Emergency logout tools available:');
  console.log('  window.emergencyLogout() - Full emergency logout');
  console.log('  window.immediateLogout() - Instant logout, no delays');
  console.log('  window.smartLogout(signOutFn) - Try Supabase first, fallback to emergency');
}

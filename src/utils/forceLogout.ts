/**
 * Force Logout Utility
 * Provides emergency logout functionality when Supabase auth fails
 */

export const forceLogout = () => {
  console.log('🚨 Force logout initiated');
  
  try {
    // Clear all possible authentication storage
    localStorage.clear();
    sessionStorage.clear();
    
    // Clear specific Supabase keys that might exist
    const supabaseKeys = [
      'supabase.auth.token',
      'sb-nwpuurgwnnuejqinkvrh-auth-token',
      'sb-auth-token',
      'supabase-auth-token'
    ];
    
    supabaseKeys.forEach(key => {
      localStorage.removeItem(key);
      sessionStorage.removeItem(key);
    });
    
    // Clear any cookies related to auth
    document.cookie.split(";").forEach((c) => {
      const eqPos = c.indexOf("=");
      const name = eqPos > -1 ? c.substr(0, eqPos) : c;
      document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/";
    });
    
    console.log('✅ Force logout completed - all storage cleared');
    
    // Force page reload to reset application state
    setTimeout(() => {
      window.location.href = '/auth';
    }, 100);
    
  } catch (error) {
    console.error('❌ Force logout error:', error);
    // Last resort - hard reload
    window.location.reload();
  }
};

// Emergency logout function that can be called from console
(window as any).emergencyLogout = forceLogout;

// Add to debug logger if available
if (typeof window !== 'undefined') {
  (window as any).debugLogout = {
    force: forceLogout,
    clearStorage: () => {
      localStorage.clear();
      sessionStorage.clear();
      console.log('🧹 All storage cleared');
    },
    checkAuth: () => {
      console.log('🔍 Auth storage check:');
      console.log('localStorage:', Object.keys(localStorage));
      console.log('sessionStorage:', Object.keys(sessionStorage));
      console.log('cookies:', document.cookie);
    }
  };
  
  console.log('🔧 Debug logout tools available:');
  console.log('  window.emergencyLogout() - Force logout');
  console.log('  window.debugLogout.force() - Force logout');
  console.log('  window.debugLogout.clearStorage() - Clear all storage');
  console.log('  window.debugLogout.checkAuth() - Check auth storage');
}

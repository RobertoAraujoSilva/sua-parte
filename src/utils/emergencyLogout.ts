/**
 * Emergency Logout Utility
 * Immediate logout when auth.signOut() is hanging
 */

const getSupabaseStorageKey = (): string => {
  const projectId = import.meta.env.VITE_SUPABASE_PROJECT_ID || '';
  return `sb-${projectId}-auth-token`;
};

export const emergencyLogout = () => {
  console.log('🚨 EMERGENCY LOGOUT INITIATED');
  
  try {
    localStorage.clear();
    sessionStorage.clear();
    
    // Clear specific Supabase keys
    const supabaseKey = getSupabaseStorageKey();
    [supabaseKey, 'supabase.auth.token', 'sb-auth-token', 'supabase-auth-token'].forEach(key => {
      try { localStorage.removeItem(key); sessionStorage.removeItem(key); } catch {}
    });
    
    // Clear cookies
    document.cookie.split(";").forEach((c) => {
      const name = c.split("=")[0].trim();
      if (name.includes('supabase') || name.includes('sb-') || name.includes('auth')) {
        document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`;
        document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;domain=${window.location.hostname}`;
      }
    });
    
    setTimeout(() => { window.location.href = '/auth'; }, 100);
  } catch (error) {
    console.error('❌ Emergency logout error:', error);
    window.location.reload();
  }
};

export const immediateLogout = () => {
  try { localStorage.clear(); sessionStorage.clear(); } catch {}
  window.location.href = '/auth';
};

export const smartLogout = async (supabaseSignOut: () => Promise<any>) => {
  try {
    const timeoutPromise = new Promise((resolve) => 
      setTimeout(() => resolve({ error: { message: 'timeout' } }), 1000)
    );
    const result = await Promise.race([supabaseSignOut(), timeoutPromise]) as any;
    if (result?.error) {
      emergencyLogout();
    } else {
      localStorage.clear();
      sessionStorage.clear();
      setTimeout(() => { window.location.href = '/auth'; }, 500);
    }
  } catch {
    emergencyLogout();
  }
};

if (typeof window !== 'undefined') {
  (window as any).emergencyLogout = emergencyLogout;
  (window as any).immediateLogout = immediateLogout;
}

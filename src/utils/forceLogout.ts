/**
 * Force Logout Utility - Sistema Ministerial
 */

const getSupabaseStorageKey = (): string => {
  const projectId = import.meta.env.VITE_SUPABASE_PROJECT_ID || '';
  return `sb-${projectId}-auth-token`;
};

export const forceLogout = () => {
  console.log('🚨 FORCE LOGOUT INITIATED');
  
  try {
    localStorage.clear();
    sessionStorage.clear();
    
    const supabaseKey = getSupabaseStorageKey();
    [supabaseKey, 'supabase.auth.token', 'sb-auth-token'].forEach(key => {
      try { localStorage.removeItem(key); sessionStorage.removeItem(key); } catch {}
    });
    
    document.cookie.split(";").forEach(cookie => {
      const name = cookie.split("=")[0].trim();
      if (name.includes('supabase') || name.includes('sb-') || name.includes('auth')) {
        document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`;
        document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;domain=${window.location.hostname}`;
      }
    });
    
    setTimeout(() => { window.location.href = '/'; }, 100);
  } catch {
    window.location.reload();
  }
};

export const immediateLogout = () => {
  try { localStorage.clear(); sessionStorage.clear(); } catch {}
  window.location.href = '/';
};

export const smartLogout = async (supabaseSignOut: () => Promise<any>) => {
  try {
    const result = await Promise.race([
      supabaseSignOut(),
      new Promise((resolve) => setTimeout(() => resolve({ error: true }), 800))
    ]) as any;
    if (result?.error) { forceLogout(); } else {
      localStorage.clear(); sessionStorage.clear();
      setTimeout(() => { window.location.href = '/'; }, 300);
    }
  } catch { forceLogout(); }
};

if (typeof window !== 'undefined') {
  (window as any).forceLogout = forceLogout;
  (window as any).immediateLogout = immediateLogout;
}

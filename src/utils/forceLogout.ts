/**
 * Force Logout Utility - Sistema Ministerial
 * Logout forçado quando o Supabase não responde
 */

export const forceLogout = () => {
  console.log('🚨 FORCE LOGOUT INITIATED - Sistema Ministerial');
  
  try {
    // 1. Limpar localStorage
    console.log('🧹 Clearing localStorage...');
    localStorage.clear();
    
    // 2. Limpar sessionStorage
    console.log('🧹 Clearing sessionStorage...');
    sessionStorage.clear();
    
    // 3. Limpar cookies específicos do Supabase
    console.log('🧹 Clearing Supabase cookies...');
    const cookies = document.cookie.split(";");
    cookies.forEach(cookie => {
      const eqPos = cookie.indexOf("=");
      const name = eqPos > -1 ? cookie.substr(0, eqPos).trim() : cookie.trim();
      
      if (name.includes('supabase') || name.includes('sb-') || name.includes('auth')) {
        document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`;
        document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;domain=${window.location.hostname}`;
      }
    });
    
    // 4. Limpar tokens específicos
    const tokenKeys = [
      'supabase.auth.token',
      'sb-nwpuurgwnnuejqinkvrh-auth-token',
      'sb-auth-token',
      'supabase-auth-token',
      'supabase.session',
      'sb-session',
      'auth-token',
      'session-token'
    ];
    
    tokenKeys.forEach(key => {
      try {
        localStorage.removeItem(key);
        sessionStorage.removeItem(key);
      } catch (e) {
        console.log(`⚠️ Could not remove ${key}:`, e);
      }
    });
    
    // 5. Forçar limpeza do estado do React
    console.log('🔄 Force logout completed - redirecting to home');
    
    // Redirecionar para home page
    setTimeout(() => {
      window.location.href = '/';
    }, 100);
    
  } catch (error) {
    console.error('❌ Force logout error:', error);
    // Último recurso - reload da página
    console.log('🚨 Last resort - hard page reload');
    window.location.reload();
  }
};

// Logout imediato para situações críticas
export const immediateLogout = () => {
  console.log('⚡ IMMEDIATE LOGOUT - Sistema Ministerial');
  
  // Limpeza imediata
  localStorage.clear();
  sessionStorage.clear();
  
  // Redirecionamento imediato
  window.location.href = '/';
};

// Logout inteligente que tenta Supabase primeiro, depois força
export const smartLogout = async (supabaseSignOut: () => Promise<any>) => {
  console.log('🧠 SMART LOGOUT - Sistema Ministerial');
  
  try {
    // Tentar Supabase com timeout muito curto
    const timeoutPromise = new Promise((resolve) => 
      setTimeout(() => {
        console.log('⏰ Smart logout timeout - switching to force logout');
        resolve({ error: { message: 'Smart logout timeout', code: 'SMART_TIMEOUT' } });
      }, 800) // Apenas 800ms timeout
    );
    
    const result = await Promise.race([supabaseSignOut(), timeoutPromise]) as any;
    
    if (result?.error) {
      console.log('⚠️ Supabase signOut failed or timed out, using force logout');
      forceLogout();
    } else {
      console.log('✅ Supabase signOut successful');
      // Ainda limpar estado local para garantir
      localStorage.clear();
      sessionStorage.clear();
      setTimeout(() => {
        window.location.href = '/';
      }, 300);
    }
  } catch (error) {
    console.error('❌ Smart logout error, falling back to force logout:', error);
    forceLogout();
  }
};

// Adicionar ao window para acesso via console
if (typeof window !== 'undefined') {
  (window as any).forceLogout = forceLogout;
  (window as any).immediateLogout = immediateLogout;
  (window as any).smartLogout = smartLogout;
}

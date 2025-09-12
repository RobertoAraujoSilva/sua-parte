/**
 * Utilitário para recuperação de problemas de autenticação
 * 
 * Este arquivo contém funções para lidar com tokens inválidos,
 * sessões corrompidas e outros problemas de autenticação.
 */

import { supabase } from '@/integrations/supabase/client';

/**
 * Limpa todos os dados de autenticação armazenados localmente
 */
export const clearAuthStorage = () => {
  try {
    console.log('🧹 Clearing authentication storage...');
    
    // Limpar localStorage
    const keysToRemove = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && (key.includes('supabase') || key.includes('auth'))) {
        keysToRemove.push(key);
      }
    }
    
    keysToRemove.forEach(key => {
      localStorage.removeItem(key);
      console.log(`🗑️ Removed localStorage key: ${key}`);
    });
    
    // Limpar sessionStorage
    sessionStorage.clear();
    console.log('🗑️ Cleared sessionStorage');
    
    // Limpar cookies relacionados à autenticação
    document.cookie.split(";").forEach(cookie => {
      const eqPos = cookie.indexOf("=");
      const name = eqPos > -1 ? cookie.substr(0, eqPos).trim() : cookie.trim();
      if (name.includes('supabase') || name.includes('auth')) {
        document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`;
        console.log(`🍪 Cleared cookie: ${name}`);
      }
    });
    
    console.log('✅ Authentication storage cleared successfully');
    return true;
  } catch (error) {
    console.error('❌ Error clearing auth storage:', error);
    return false;
  }
};

/**
 * Força um logout completo e limpa todos os dados de autenticação
 */
export const forceSignOut = async () => {
  try {
    console.log('🚪 Forcing complete sign out...');
    
    // Tentar logout normal primeiro
    try {
      await supabase.auth.signOut();
      console.log('✅ Normal sign out completed');
    } catch (error) {
      console.log('⚠️ Normal sign out failed, continuing with force clear:', error);
    }
    
    // Limpar storage independentemente do resultado do logout
    clearAuthStorage();
    
    // Recarregar a página para garantir estado limpo
    setTimeout(() => {
      window.location.reload();
    }, 100);
    
    return true;
  } catch (error) {
    console.error('❌ Error during force sign out:', error);
    return false;
  }
};

/**
 * Verifica se há tokens inválidos e os limpa se necessário
 */
export const checkAndClearInvalidTokens = async () => {
  try {
    console.log('🔍 Checking for invalid tokens...');
    
    // Tentar obter sessão atual
    const { data: { session }, error } = await supabase.auth.getSession();
    
    if (error) {
      console.log('❌ Session error detected:', error.message);
      
      // Verificar se é erro de token inválido
      if (error.message.includes('Invalid Refresh Token') || 
          error.message.includes('Refresh Token Not Found') ||
          error.message.includes('JWT expired') ||
          error.message.includes('refresh_token_not_found')) {
        
        console.log('🔄 Invalid refresh token detected, clearing auth data...');
        await forceSignOut();
        return { cleared: true, reason: 'invalid_refresh_token' };
      }
      
      return { cleared: false, error: error.message };
    }
    
    if (!session) {
      console.log('ℹ️ No active session found');
      return { cleared: false, reason: 'no_session' };
    }
    
    console.log('✅ Valid session found');
    return { cleared: false, reason: 'valid_session' };
    
  } catch (error) {
    console.error('❌ Error checking tokens:', error);
    
    // Se houver erro inesperado, limpar por segurança
    console.log('🔄 Unexpected error, clearing auth data as precaution...');
    await forceSignOut();
    return { cleared: true, reason: 'unexpected_error' };
  }
};

/**
 * Recupera de erros de autenticação específicos
 */
export const recoverFromAuthError = async (error: any) => {
  console.log('🔧 Attempting to recover from auth error:', error);
  
  const errorMessage = error?.message || error?.toString() || '';
  
  // Erros que requerem limpeza completa
  const criticalErrors = [
    'Invalid Refresh Token',
    'Refresh Token Not Found',
    'JWT expired',
    'refresh_token_not_found',
    'invalid_grant',
    'Token has expired'
  ];
  
  const isCriticalError = criticalErrors.some(criticalError => 
    errorMessage.includes(criticalError)
  );
  
  if (isCriticalError) {
    console.log('🚨 Critical auth error detected, forcing sign out...');
    await forceSignOut();
    return { recovered: true, action: 'force_signout' };
  }
  
  // Erros que podem ser resolvidos com refresh
  const refreshableErrors = [
    'Network error',
    'Failed to fetch',
    'Connection timeout'
  ];
  
  const isRefreshableError = refreshableErrors.some(refreshableError => 
    errorMessage.includes(refreshableError)
  );
  
  if (isRefreshableError) {
    console.log('🔄 Network error detected, attempting session refresh...');
    try {
      const { data: { session } } = await supabase.auth.refreshSession();
      if (session) {
        console.log('✅ Session refreshed successfully');
        return { recovered: true, action: 'session_refreshed' };
      }
    } catch (refreshError) {
      console.log('❌ Session refresh failed, forcing sign out...');
      await forceSignOut();
      return { recovered: true, action: 'force_signout_after_refresh_fail' };
    }
  }
  
  console.log('⚠️ Unknown auth error, no recovery action taken');
  return { recovered: false, action: 'none' };
};

/**
 * Inicializa verificação de saúde da autenticação
 */
export const initAuthHealthCheck = () => {
  console.log('🏥 Initializing auth health check...');
  
  // Verificar tokens na inicialização
  setTimeout(async () => {
    await checkAndClearInvalidTokens();
  }, 1000);
  
  // Configurar listener para erros de rede
  window.addEventListener('online', async () => {
    console.log('🌐 Network connection restored, checking auth state...');
    await checkAndClearInvalidTokens();
  });
  
  // Configurar listener para mudanças de visibilidade (quando usuário volta à aba)
  document.addEventListener('visibilitychange', async () => {
    if (!document.hidden) {
      console.log('👁️ Tab became visible, checking auth state...');
      await checkAndClearInvalidTokens();
    }
  });
};

/**
 * Utilitário para debug de problemas de autenticação
 */
export const debugAuthState = async () => {
  console.group('🔍 Auth Debug Information');
  
  try {
    // Informações da sessão
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    console.log('Session:', session);
    console.log('Session Error:', sessionError);
    
    // Informações do usuário
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    console.log('User:', user);
    console.log('User Error:', userError);
    
    // Informações do localStorage
    const authKeys = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && (key.includes('supabase') || key.includes('auth'))) {
        authKeys.push({
          key,
          value: localStorage.getItem(key)?.substring(0, 100) + '...' // Truncar para segurança
        });
      }
    }
    console.log('Auth LocalStorage Keys:', authKeys);
    
    // Informações do ambiente
    console.log('Supabase URL:', import.meta.env.VITE_SUPABASE_URL);
    console.log('Has Anon Key:', !!import.meta.env.VITE_SUPABASE_ANON_KEY);
    
  } catch (error) {
    console.error('Error during debug:', error);
  }
  
  console.groupEnd();
};
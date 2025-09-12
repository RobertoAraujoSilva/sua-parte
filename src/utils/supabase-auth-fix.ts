/**
 * Utilitário para corrigir problemas de autenticação do Supabase
 * 
 * Este arquivo contém funções para diagnosticar e corrigir problemas
 * de autenticação que causam erros 401 nas requisições da API.
 */

import { supabase } from '@/integrations/supabase/client';

/**
 * Verifica o estado atual da autenticação
 */
export const checkAuthState = async () => {
  try {
    console.log('🔍 Checking current auth state...');
    
    // Verificar sessão atual
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    console.log('Session:', session);
    console.log('Session Error:', sessionError);
    
    if (sessionError) {
      console.error('❌ Session error:', sessionError);
      return { authenticated: false, error: sessionError.message };
    }
    
    if (!session) {
      console.log('⚠️ No active session found');
      return { authenticated: false, error: 'No active session' };
    }
    
    // Verificar usuário atual
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    console.log('User:', user);
    console.log('User Error:', userError);
    
    if (userError) {
      console.error('❌ User error:', userError);
      return { authenticated: false, error: userError.message };
    }
    
    if (!user) {
      console.log('⚠️ No user found');
      return { authenticated: false, error: 'No user found' };
    }
    
    // Testar uma requisição simples para verificar se a autenticação está funcionando
    const { data: testData, error: testError } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', user.id)
      .limit(1);
    
    if (testError) {
      console.error('❌ Test query error:', testError);
      return { authenticated: false, error: `API test failed: ${testError.message}` };
    }
    
    console.log('✅ Authentication is working properly');
    return { 
      authenticated: true, 
      session, 
      user,
      testResult: testData 
    };
    
  } catch (error) {
    console.error('❌ Exception checking auth state:', error);
    return { authenticated: false, error: 'Unexpected error checking auth state' };
  }
};

/**
 * Força uma atualização da sessão de autenticação
 */
export const refreshAuthSession = async () => {
  try {
    console.log('🔄 Refreshing auth session...');
    
    const { data, error } = await supabase.auth.refreshSession();
    
    if (error) {
      console.error('❌ Error refreshing session:', error);
      return { success: false, error: error.message };
    }
    
    if (data.session) {
      console.log('✅ Session refreshed successfully');
      return { success: true, session: data.session };
    }
    
    console.log('⚠️ No session returned from refresh');
    return { success: false, error: 'No session returned from refresh' };
    
  } catch (error) {
    console.error('❌ Exception refreshing session:', error);
    return { success: false, error: 'Unexpected error refreshing session' };
  }
};

/**
 * Cria um cliente Supabase com headers de autenticação explícitos
 */
export const createAuthenticatedSupabaseCall = async (operation: () => Promise<any>) => {
  try {
    // Verificar se há uma sessão ativa
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      throw new Error('No active session found');
    }
    
    // Verificar se o token não expirou
    const now = Math.floor(Date.now() / 1000);
    if (session.expires_at && session.expires_at < now) {
      console.log('🔄 Token expired, refreshing...');
      const refreshResult = await refreshAuthSession();
      if (!refreshResult.success) {
        throw new Error(`Token refresh failed: ${refreshResult.error}`);
      }
    }
    
    // Executar a operação
    return await operation();
    
  } catch (error) {
    console.error('❌ Authenticated operation failed:', error);
    throw error;
  }
};

/**
 * Wrapper para operações do Supabase com retry automático
 */
export const supabaseWithRetry = async (operation: () => Promise<any>, maxRetries = 2) => {
  let lastError;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`🔄 Attempt ${attempt}/${maxRetries}`);
      
      // Verificar autenticação antes de cada tentativa
      const authCheck = await checkAuthState();
      if (!authCheck.authenticated) {
        // Tentar refresh se não estiver autenticado
        const refreshResult = await refreshAuthSession();
        if (!refreshResult.success) {
          throw new Error(`Authentication failed: ${authCheck.error}`);
        }
      }
      
      // Executar operação
      const result = await operation();
      console.log(`✅ Operation succeeded on attempt ${attempt}`);
      return result;
      
    } catch (error: any) {
      console.error(`❌ Attempt ${attempt} failed:`, error);
      lastError = error;
      
      // Se for erro 401 e ainda temos tentativas, tentar refresh
      if (error.code === 'PGRST301' || error.message?.includes('401') || error.message?.includes('JWT')) {
        if (attempt < maxRetries) {
          console.log('🔄 Auth error detected, refreshing session...');
          await refreshAuthSession();
          continue;
        }
      }
      
      // Se não for erro de auth ou não temos mais tentativas, falhar
      if (attempt === maxRetries) {
        break;
      }
    }
  }
  
  throw lastError;
};

/**
 * Diagnóstico completo de problemas de autenticação
 */
export const diagnoseAuthIssues = async () => {
  console.group('🔍 DIAGNÓSTICO DE AUTENTICAÇÃO');
  
  try {
    // 1. Verificar variáveis de ambiente
    console.log('1. Verificando variáveis de ambiente...');
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
    
    console.log('VITE_SUPABASE_URL:', supabaseUrl ? '✅ Definida' : '❌ Não definida');
    console.log('VITE_SUPABASE_ANON_KEY:', supabaseKey ? '✅ Definida' : '❌ Não definida');
    
    // 2. Verificar estado da sessão
    console.log('2. Verificando estado da sessão...');
    const authState = await checkAuthState();
    console.log('Estado da autenticação:', authState.authenticated ? '✅ Autenticado' : '❌ Não autenticado');
    if (!authState.authenticated) {
      console.log('Erro:', authState.error);
    }
    
    // 3. Verificar localStorage
    console.log('3. Verificando localStorage...');
    const authKeys = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && (key.includes('supabase') || key.includes('auth'))) {
        authKeys.push(key);
      }
    }
    console.log('Chaves de auth no localStorage:', authKeys.length > 0 ? authKeys : 'Nenhuma encontrada');
    
    // 4. Testar conectividade
    console.log('4. Testando conectividade...');
    try {
      const response = await fetch(`${supabaseUrl}/rest/v1/`, {
        headers: {
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`
        }
      });
      console.log('Conectividade com Supabase:', response.ok ? '✅ OK' : `❌ Erro ${response.status}`);
    } catch (error) {
      console.log('Conectividade com Supabase: ❌ Erro de rede');
    }
    
    return {
      environmentOk: !!(supabaseUrl && supabaseKey),
      authenticationOk: authState.authenticated,
      hasStoredAuth: authKeys.length > 0,
      recommendations: generateRecommendations(authState, authKeys.length > 0)
    };
    
  } catch (error) {
    console.error('Erro durante diagnóstico:', error);
    return {
      environmentOk: false,
      authenticationOk: false,
      hasStoredAuth: false,
      error: error
    };
  } finally {
    console.groupEnd();
  }
};

/**
 * Gera recomendações baseadas no diagnóstico
 */
const generateRecommendations = (authState: any, hasStoredAuth: boolean) => {
  const recommendations = [];
  
  if (!authState.authenticated) {
    if (!hasStoredAuth) {
      recommendations.push('Faça login novamente - não há dados de autenticação armazenados');
    } else {
      recommendations.push('Limpe os dados de autenticação e faça login novamente');
    }
  }
  
  if (authState.error?.includes('JWT')) {
    recommendations.push('Token JWT inválido - execute a limpeza de tokens');
  }
  
  if (authState.error?.includes('401')) {
    recommendations.push('Erro de autorização - verifique as permissões do usuário');
  }
  
  return recommendations;
};
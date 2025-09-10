/**
 * Configuração Central do Supabase
 * 
 * Este arquivo centraliza a configuração do cliente Supabase para todo o projeto,
 * garantindo consistência e facilitando manutenção.
 */

import { createClient } from '@supabase/supabase-js';

// Validação de variáveis de ambiente
const validateEnvironment = () => {
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

  if (!supabaseUrl) {
    throw new Error(
      '❌ VITE_SUPABASE_URL não está definida. Verifique seu arquivo .env'
    );
  }

  if (!supabaseAnonKey) {
    throw new Error(
      '❌ VITE_SUPABASE_ANON_KEY não está definida. Verifique seu arquivo .env'
    );
  }

  // Validação básica do formato da URL
  if (!supabaseUrl.startsWith('https://') || !supabaseUrl.includes('.supabase.co')) {
    throw new Error(
      '❌ VITE_SUPABASE_URL parece estar em formato incorreto. Deve ser https://[projeto].supabase.co'
    );
  }

  // Validação básica do formato da chave
  if (!supabaseAnonKey.startsWith('eyJ')) {
    throw new Error(
      '❌ VITE_SUPABASE_ANON_KEY parece estar em formato incorreto. Deve ser um JWT válido'
    );
  }

  return { supabaseUrl, supabaseAnonKey };
};

// Criar cliente Supabase com validação em modo singleton (HMR-safe)
let supabase: ReturnType<typeof createClient>;

try {
  const { supabaseUrl, supabaseAnonKey } = validateEnvironment();

  const globalKey = '__SUPABASE_SINGLETON__';
  const g = globalThis as unknown as Record<string, any>;

  if (!g[globalKey]) {
    g[globalKey] = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        // Evita processar o fragmento de URL em cada reload, reduz callbacks duplicados
        detectSessionInUrl: false,
      },
      // Adiciona headers explícitos para resolver o problema "No API key found"
      global: {
        headers: {
          'X-Client-Info': 'supabase-js-web',
          // For PostgREST, supabase-js will automatically attach the user's access token
          // We keep only the public anon apikey here.
          'apikey': supabaseAnonKey,
        }
      },
      // Configuração de fetch personalizada para garantir que os headers sejam enviados
      fetch: (url, options = {}) => {
        const urlStr = typeof url === 'string' ? url : String(url);
        // Não injeta headers customizados nos endpoints de Auth para evitar conflitos
        if (urlStr.includes('/auth/v1/')) {
          if (import.meta.env.DEV) {
            console.log('🔄 Fetch (auth) para URL:', urlStr);
          }
          return fetch(url, options);
        }

        const headers = new Headers(options.headers || {});
        
        // Garantir que os headers essenciais estejam presentes
        if (!headers.has('apikey')) {
          headers.set('apikey', supabaseAnonKey);
          if (import.meta.env.DEV) console.log('🔑 Adicionando header apikey manualmente');
        }
        // Important: do NOT override Authorization here; supabase-js will set the
        // correct user access token for PostgREST calls. Overriding with anon key
        // would drop user context and cause 401/denied RLS.
        
        // Adicionar Content-Type se não estiver presente
        if (!headers.has('Content-Type') && !['GET', 'HEAD'].includes((options.method || 'GET').toUpperCase())) {
          headers.set('Content-Type', 'application/json');
          if (import.meta.env.DEV) console.log('📄 Adicionando header Content-Type: application/json');
        }
        
        // Log em desenvolvimento para depuração
        if (import.meta.env.DEV) {
          console.log('🔄 Fetch para URL:', urlStr);
          console.log('🔑 Headers:', Object.fromEntries(headers.entries()));
        }
        
        return fetch(url, { ...options, headers });
      },
      // Mantém defaults estáveis; ajuste de realtime/db se necessário
    });

    if (import.meta.env.DEV) {
      console.log('✅ Supabase client criado (singleton)');
    }
  } else if (import.meta.env.DEV) {
    console.log('♻️ Reutilizando Supabase client existente (singleton)');
  }

  supabase = g[globalKey];
} catch (error) {
  console.error('❌ Erro ao configurar Supabase:', error);
  throw error;
}

// Listener de mudanças de autenticação (apenas em desenvolvimento)
if (typeof window !== 'undefined' && (import.meta as any).env?.DEV) {
  try {
    supabase.auth.onAuthStateChange((event, session) => {
      const info = {
        event,
        user: session?.user?.id,
        expires_at: session?.expires_at,
        has_refresh_token: Boolean((session as any)?.refresh_token),
      };
      // Logs enxutos para diagnóstico em dev
      if (event === 'TOKEN_REFRESHED') console.log('🔐 [Supabase] Token refreshed', info);
      else if (event === 'TOKEN_REFRESH_TIMEOUT') console.warn('⏱️ [Supabase] Token refresh timeout', info);
      else if (event === 'SIGNED_IN') console.log('✅ [Supabase] Signed in', info);
      else if (event === 'SIGNED_OUT') console.log('👋 [Supabase] Signed out');
      else if (event === 'USER_UPDATED') console.log('👤 [Supabase] User updated', info);
      else if (event === 'PASSWORD_RECOVERY') console.log('🔑 [Supabase] Password recovery');
      else console.log('ℹ️ [Supabase] Auth state change', info);
    });
  } catch (e) {
    console.warn('⚠️ Não foi possível registrar listener de auth do Supabase:', e);
  }
}

// Ação Dev: resetar autenticação completamente (logout + limpar storage/cache)
export const resetAuthDev = async () => {
  try {
    console.log('🧹 Resetando sessão Supabase (signOut + limpar caches storages)...');
    // 1) Sign out via SDK
    try { await supabase.auth.signOut(); } catch {}

    // 2) Limpar LocalStorage chaves sb-* e supabase*
    if (typeof window !== 'undefined') {
      try {
        const keys: string[] = [];
        for (let i = 0; i < localStorage.length; i++) {
          const k = localStorage.key(i);
          if (!k) continue;
          if (k.startsWith('sb-') || k.startsWith('supabase')) keys.push(k);
        }
        keys.forEach(k => localStorage.removeItem(k));
        console.log(`🧼 LocalStorage limpo (${keys.length} chaves)`);
      } catch {}
    }

    // 3) Limpar IndexedDB do supabase (nomes comuns)
    try {
      const dbs = ['supabase-auth', 'supabase-js-auth', 'localforage'];
      dbs.forEach(name => {
        try { (indexedDB as any)?.deleteDatabase?.(name); } catch {}
      });
      console.log('🗄️ IndexedDB: requisitado delete das bases supabase');
    } catch {}

    // 4) Opcional: Unregister service workers (pode cachear páginas de auth)
    try {
      if ('serviceWorker' in navigator) {
        const regs = await navigator.serviceWorker.getRegistrations();
        await Promise.all(regs.map(r => r.unregister()));
        console.log(`🧻 ServiceWorkers desregistrados (${regs.length})`);
      }
    } catch {}

    // 5) Limpar Cache Storage (PWA)
    try {
      if ('caches' in window) {
        const names = await caches.keys();
        await Promise.all(names.map(n => caches.delete(n)));
        console.log(`🗑️ Caches removidos (${names.length})`);
      }
    } catch {}

    console.log('✅ Reset concluído. Recarregando página...');
    try { window.location.reload(); } catch {}
  } catch (e) {
    console.error('❌ Falha ao resetar autenticação:', e);
  }
};

// Expor utilitário no window em DEV para fácil acesso via console
if (typeof window !== 'undefined' && (import.meta as any).env?.DEV) {
  (window as any).resetSupabaseAuth = resetAuthDev;
  console.log('🧰 Dica Dev: chame resetSupabaseAuth() no console para limpar sessão/cache do Supabase.');
}

// Função utilitária para testar credenciais
export const testCredentials = async (email: string, password: string) => {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    
    if (error) {
      return { 
        success: false, 
        error: error.message,
        details: error 
      };
    }
    
    return { 
      success: true, 
      data,
      user: data.user 
    };
  } catch (error) {
    return { 
      success: false, 
      error: 'Erro inesperado durante autenticação',
      details: error 
    };
  }
};

// Função utilitária para tratamento de erros de autenticação
export const handleAuthError = (error: any): { 
  message: string; 
  type: 'error' | 'warning' | 'info';
  action?: string;
} => {
  if (!error) return { message: 'Erro desconhecido', type: 'error' };
  
  const message = error.message || error.toString();
  
  if (message.includes('Invalid login credentials')) {
    return { 
      message: 'Email ou senha incorretos. Verifique suas credenciais e tente novamente.', 
      type: 'error',
      action: 'check_credentials'
    };
  }
  
  if (message.includes('Email not confirmed')) {
    return { 
      message: 'Email não confirmado. Verifique sua caixa de entrada e clique no link de confirmação.', 
      type: 'warning',
      action: 'check_email'
    };
  }
  
  if (message.includes('Too many requests')) {
    return { 
      message: 'Muitas tentativas de login. Aguarde alguns minutos antes de tentar novamente.', 
      type: 'warning',
      action: 'wait'
    };
  }
  
  if (message.includes('User not found')) {
    return { 
      message: 'Usuário não encontrado. Entre em contato com o administrador para criar sua conta.', 
      type: 'info',
      action: 'contact_admin'
    };
  }
  
  if (message.includes('Invalid email')) {
    return { 
      message: 'Email em formato inválido. Verifique se digitou corretamente.', 
      type: 'error',
      action: 'fix_email'
    };
  }
  
  if (message.includes('Network')) {
    return { 
      message: 'Erro de conexão. Verifique sua internet e tente novamente.', 
      type: 'error',
      action: 'check_connection'
    };
  }
  
  // Log do erro original para debugging
  if (import.meta.env.DEV) {
    console.group('🔐 Auth Error Details');
    console.error('Error:', error);
    console.log('Message:', message);
    console.log('Timestamp:', new Date().toISOString());
    console.log('User Agent:', navigator.userAgent);
    console.groupEnd();
  }
  
  return { 
    message: 'Erro de autenticação. Tente novamente.', 
    type: 'error',
    action: 'retry'
  };
};

// Função para validar email
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Função para validar formulário de login
export const validateLoginForm = (email: string, password: string): string[] => {
  const errors: string[] = [];

  if (!email.trim()) {
    errors.push('Email é obrigatório');
  } else if (!isValidEmail(email)) {
    errors.push('Email em formato inválido');
  }
  
  if (!password.trim()) {
    errors.push('Senha é obrigatória');
  } else if (password.length < 6) {
    errors.push('Senha deve ter pelo menos 6 caracteres');
  }

  return errors;
};

// Função para verificar saúde da conexão
export const checkSupabaseHealth = async () => {
  try {
    const { data, error } = await supabase.from('_health_check').select('*').limit(1);
    
    return {
      healthy: !error,
      error: error?.message,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    return {
      healthy: false,
      error: 'Não foi possível conectar ao Supabase',
      details: error,
      timestamp: new Date().toISOString()
    };
  }
};

export { supabase };
export default supabase;

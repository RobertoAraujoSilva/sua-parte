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

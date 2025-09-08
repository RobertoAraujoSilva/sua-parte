import { supabase } from '@/integrations/supabase/client';

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
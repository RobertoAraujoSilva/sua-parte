import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { supabase } from '../integrations/supabase/client';
import { User, Session, AuthError } from '@supabase/supabase-js';

interface Profile {
  id: string;
  email: string;
  role: string;
  nome_completo?: string;
  congregacao?: string;
  cargo?: string;
  created_at: string;
  updated_at: string;
}

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  isAdmin: boolean;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: AuthError | null }>;
  signUp: (email: string, password: string, profileData: Partial<Profile>) => Promise<{ error: AuthError | null }>;
  signOut: () => Promise<void>;
  refreshAuth: () => Promise<void>;
  clearAuthError: () => void;
  authError: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);

  // 🔄 Função para recuperar autenticação
  const refreshAuth = useCallback(async () => {
    try {
      console.log('🔄 Attempting to refresh authentication...');
      
      // Tentar obter sessão atual
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) {
        console.error('❌ Session error:', sessionError);
        setAuthError(`Erro de sessão: ${sessionError.message}`);
        return;
      }

      if (session) {
        console.log('✅ Valid session found, updating user state');
        setUser(session.user);
        await loadProfile(session.user.id);
      } else {
        console.log('⚠️ No valid session found, clearing auth state');
        setUser(null);
        setProfile(null);
      }
    } catch (error) {
      console.error('❌ Error refreshing auth:', error);
      setAuthError('Erro ao atualizar autenticação');
      
      // Limpar estado em caso de erro crítico
      setUser(null);
      setProfile(null);
    } finally {
      setLoading(false);
    }
  }, []);

  // 🔄 Função para carregar perfil do usuário
  const loadProfile = useCallback(async (userId: string) => {
    try {
      console.log('🔍 Loading profile for user:', userId);
      
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (profileError) {
        console.error('❌ Error loading profile:', profileError);
        setAuthError(`Erro ao carregar perfil: ${profileError.message}`);
        return;
      }

      if (profileData) {
        console.log('✅ Profile loaded successfully:', profileData);
        setProfile(profileData);
      } else {
        console.log('⚠️ No profile found for user');
        setProfile(null);
      }
    } catch (error) {
      console.error('❌ Error in loadProfile:', error);
      setAuthError('Erro interno ao carregar perfil');
    }
  }, []);

  // 🔄 Função para lidar com mudanças de autenticação
  const handleAuthStateChange = useCallback(async (event: string, session: Session | null) => {
    console.log('🔄 Auth state change:', event, session?.user?.id);
    
    try {
      if (event === 'SIGNED_IN' && session) {
        console.log('✅ User signed in:', session.user.id);
        setUser(session.user);
        await loadProfile(session.user.id);
        setAuthError(null); // Limpar erros anteriores
      } else if (event === 'SIGNED_OUT') {
        console.log('🚪 User signed out');
        setUser(null);
        setProfile(null);
        setAuthError(null);
      } else if (event === 'TOKEN_REFRESHED' && session) {
        console.log('🔄 Token refreshed for user:', session.user.id);
        setUser(session.user);
        await loadProfile(session.user.id);
        setAuthError(null);
      } else if (event === 'USER_UPDATED' && session) {
        console.log('👤 User updated:', session.user.id);
        setUser(session.user);
        await loadProfile(session.user.id);
      }
    } catch (error) {
      console.error('❌ Error handling auth state change:', error);
      setAuthError('Erro ao processar mudança de autenticação');
    } finally {
      setLoading(false);
    }
  }, [loadProfile]);

  // 🔄 Função para lidar com erros de autenticação
  const handleAuthError = useCallback((error: AuthError) => {
    console.error('❌ Auth error detected:', error);
    
    if (error.message.includes('Invalid Refresh Token') || 
        error.message.includes('Refresh Token Not Found') ||
        error.message.includes('JWT expired')) {
      
      console.log('🔄 Invalid refresh token detected, clearing auth state');
      setUser(null);
      setProfile(null);
      setAuthError('Sessão expirada. Por favor, faça login novamente.');
      
      // Limpar tokens inválidos
      supabase.auth.signOut();
    } else {
      setAuthError(`Erro de autenticação: ${error.message}`);
    }
  }, []);

  // 🔄 Função de login com tratamento de erro robusto
  const signIn = useCallback(async (email: string, password: string) => {
    try {
      console.log('🔐 Attempting sign in for:', email);
      setLoading(true);
      setAuthError(null);

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error('❌ Sign in error:', error);
        setAuthError(`Erro no login: ${error.message}`);
        return { error };
      }

      if (data.user) {
        console.log('✅ Sign in successful for:', data.user.id);
        setUser(data.user);
        await loadProfile(data.user.id);
        setAuthError(null);
      }

      return { error: null };
    } catch (error) {
      console.error('❌ Unexpected error during sign in:', error);
      setAuthError('Erro inesperado durante o login');
      return { error: error as AuthError };
    } finally {
      setLoading(false);
    }
  }, [loadProfile]);

  // 🔄 Função de cadastro com tratamento de erro robusto
  const signUp = useCallback(async (email: string, password: string, profileData: Partial<Profile>) => {
    try {
      console.log('📝 Attempting sign up for:', email);
      setLoading(true);
      setAuthError(null);

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: profileData,
        },
      });

      if (error) {
        console.error('❌ Sign up error:', error);
        setAuthError(`Erro no cadastro: ${error.message}`);
        return { error };
      }

      if (data.user) {
        console.log('✅ Sign up successful for:', data.user.id);
        setUser(data.user);
        setAuthError(null);
      }

      return { error: null };
    } catch (error) {
      console.error('❌ Unexpected error during sign up:', error);
      setAuthError('Erro inesperado durante o cadastro');
      return { error: error as AuthError };
    } finally {
      setLoading(false);
    }
  }, []);

  // 🔄 Função de logout com limpeza completa
  const signOut = useCallback(async () => {
    try {
      console.log('🚪 Signing out user');
      setLoading(true);
      
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error('❌ Sign out error:', error);
        setAuthError(`Erro no logout: ${error.message}`);
      } else {
        console.log('✅ Sign out successful');
        setUser(null);
        setProfile(null);
        setAuthError(null);
      }
    } catch (error) {
      console.error('❌ Unexpected error during sign out:', error);
      setAuthError('Erro inesperado durante o logout');
    } finally {
      setLoading(false);
    }
  }, []);

  // 🔄 Função para limpar erros de autenticação
  const clearAuthError = useCallback(() => {
    setAuthError(null);
  }, []);

  // 🔄 Efeito para inicializar autenticação
  useEffect(() => {
    console.log('🚀 Initializing authentication...');
    
    // Configurar listeners de autenticação
    const { data: { subscription } } = supabase.auth.onAuthStateChange(handleAuthStateChange);

    // Tentar recuperar sessão inicial
    refreshAuth();

    // Cleanup
    return () => {
      console.log('🧹 Cleaning up auth listeners');
      subscription.unsubscribe();
    };
  }, [handleAuthStateChange, refreshAuth]);

  // 🔄 Efeito para monitorar erros de autenticação
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'TOKEN_REFRESHED' && !session) {
        console.log('🔄 Token refresh failed, clearing auth state');
        setUser(null);
        setProfile(null);
        setAuthError('Sessão expirada. Por favor, faça login novamente.');
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // 🔄 Computar se o usuário é admin
  const isAdmin = profile?.role === 'admin';

  const value: AuthContextType = {
    user,
    profile,
    isAdmin,
    loading,
    signIn,
    signUp,
    signOut,
    refreshAuth,
    clearAuthError,
    authError,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
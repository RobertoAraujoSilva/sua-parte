import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import { supabase } from '../integrations/supabase/client';
import { User, Session, AuthError } from '@supabase/supabase-js';
import { checkAndClearInvalidTokens, recoverFromAuthError, clearAuthStorage } from '@/utils/auth-recovery';

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
  signOut: () => Promise<{ error: AuthError | null }>;
  refreshAuth: () => Promise<void>;
  clearAuthError: () => void;
  forceClearInvalidTokens: () => Promise<void>;
  authError: string | null;
  updateProfile: (updates: Partial<Profile>) => Promise<{ data: any; error: any }>;
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
      
      // Primeiro, verificar e limpar tokens inválidos
      const tokenCheck = await checkAndClearInvalidTokens();
      if (tokenCheck.cleared) {
        console.log('🧹 Invalid tokens were cleared, auth state reset');
        setUser(null);
        setProfile(null);
        setAuthError('Sessão expirada. Por favor, faça login novamente.');
        setLoading(false);
        return;
      }
      
      // Tentar obter sessão atual
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) {
        console.error('❌ Session error:', sessionError);
        
        // Tentar recuperar do erro
        const recovery = await recoverFromAuthError(sessionError);
        if (recovery.recovered) {
          console.log('✅ Recovered from session error:', recovery.action);
          if (recovery.action === 'force_signout') {
            setUser(null);
            setProfile(null);
            setAuthError('Sessão expirada. Por favor, faça login novamente.');
            setLoading(false);
            return;
          }
        }
        
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
      
      // Tentar recuperar do erro
      const recovery = await recoverFromAuthError(error);
      if (recovery.recovered) {
        console.log('✅ Recovered from refresh error:', recovery.action);
        if (recovery.action === 'force_signout') {
          setUser(null);
          setProfile(null);
          setAuthError('Sessão expirada. Por favor, faça login novamente.');
        }
      } else {
        setAuthError('Erro ao atualizar autenticação');
        // Limpar estado em caso de erro crítico
        setUser(null);
        setProfile(null);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  // 🔄 Função para carregar perfil do usuário
  const loadProfile = useCallback(async (userId: string) => {
    try {
      console.log('🔍 Loading profile for user:', userId);
      
      // Verificar se o cliente Supabase está configurado corretamente
      if (!supabase) {
        console.error('❌ Cliente Supabase não inicializado');
        setAuthError('Erro de configuração do Supabase: cliente não inicializado');
        return;
      }
      
      console.log('🔄 Tentando carregar perfil do Supabase...');
      
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();
        
      // Verificar se houve erro na requisição
      if (profileError) {
        console.error('❌ Error loading profile:', profileError);
        setAuthError(`Erro ao carregar perfil: ${profileError.message}`);
        return;
      }
      
      // Verificar se o perfil foi encontrado
      if (!profileData) {
        console.warn('⚠️ No profile found in profiles table, creating from user metadata');
        
        // Se não encontrou na tabela profiles, criar a partir dos metadados do usuário
        const { data: userData } = await supabase.auth.getUser();
        if (userData.user) {
          const metadata = userData.user.user_metadata;
          
          // Criar perfil a partir dos metadados
          const profileFromMetadata = {
            id: userId,
            nome_completo: metadata.nome_completo || userData.user.email?.split('@')[0] || 'Usuário',
            congregacao: metadata.congregacao || 'Não informado',
            cargo: metadata.cargo || 'instrutor',
            role: metadata.role || 'instrutor',
            email: userData.user.email || '',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          };
          
          console.log('✅ Profile created from metadata:', profileFromMetadata);
          setProfile(profileFromMetadata);
          return;
        }
        
        setAuthError('Perfil não encontrado. Entre em contato com o administrador.');
        return;
      }
        
      // Verificar se houve erro de API key
      if (profileError && profileError.message?.includes('No API key found')) {
        console.error('❌ Erro de API key no Supabase:', profileError);
        setAuthError('Erro de configuração do Supabase: API key não encontrada');
        return;
      }

      // Verificar erro 406 Not Acceptable
      if (profileError && (profileError as any).code === 'PGRST116') {
        console.log('ℹ️ Erro PGRST116 (0 rows): Perfil não encontrado, criando a partir dos metadados');
        console.log('ℹ️ Detalhes do erro:', profileError);
        
        // Criar perfil a partir dos metadados do usuário
        const { data: userData } = await supabase.auth.getUser();
        if (userData.user) {
          const metadata = userData.user.user_metadata;
          
          const profileFromMetadata = {
            id: userId,
            nome_completo: metadata.nome_completo || userData.user.email?.split('@')[0] || 'Usuário',
            congregacao: metadata.congregacao || 'Não informado',
            cargo: metadata.cargo || 'instrutor',
            role: metadata.role || 'instrutor',
            email: userData.user.email || '',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          };
          
          console.log('✅ Profile created from metadata (PGRST116):', profileFromMetadata);
          setProfile(profileFromMetadata);
          setAuthError(null);
          return;
        }
        
        setProfile(null);
        return;
      }

      if (profileError) {
        console.error('❌ Error loading profile:', profileError);
        // Tratar outros erros relacionados a 0 rows
        if (profileError.message?.includes('0 rows')) {
          console.log('ℹ️ Nenhum perfil encontrado; continuando sem erro');
          setProfile(null);
          return;
        }
        setAuthError(`Erro ao carregar perfil: ${profileError.message}`);
        return;
      }

      if (profileData) {
        console.log('✅ Profile loaded successfully:', profileData);
        
        // Garantir que o perfil tenha o campo role
        const profileWithRole = {
          ...profileData,
          role: profileData.role || 'instrutor', // Fallback se role não existir
          email: profileData.email || user?.email || ''
        };
        
        setProfile(profileWithRole);
        setAuthError(null);
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

  // Update profile (used by onboarding/setup screens)
  const updateProfile = useCallback(async (updates: Partial<Profile>) => {
    try {
      if (!user) {
        return { data: null, error: { message: 'No user logged in' } };
      }
      const { data, error } = await supabase
        .from('profiles')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id)
        .select('*')
        .single();

      if (!error && data) {
        // Refresh local state with latest profile
        setProfile((prev) => ({ ...(prev || {} as Profile), ...data }));
      }
      return { data, error };
    } catch (error) {
      return { data: null, error };
    }
  }, [user]);

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
  const signOut = useCallback(async (): Promise<{ error: AuthError | null }> => {
    try {
      console.log('🚪 Signing out user');
      setLoading(true);

      // Verificar se há uma sessão ativa antes de tentar logout
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        console.log('⚠️ No active session found, clearing local state only');
        setUser(null);
        setProfile(null);
        setAuthError(null);
        return { error: null };
      }

      const { error } = await supabase.auth.signOut();

      if (error) {
        console.error('❌ Sign out error:', error);
        // Mesmo com erro, limpar estado local
        setUser(null);
        setProfile(null);
        setAuthError(null);
        return { error };
      }

      console.log('✅ Sign out successful');
      setUser(null);
      setProfile(null);
      setAuthError(null);
      return { error: null };
    } catch (err) {
      console.error('❌ Unexpected error during sign out:', err);
      // Mesmo com erro, limpar estado local
      setUser(null);
      setProfile(null);
      setAuthError(null);
      return { error: err as AuthError };
    } finally {
      setLoading(false);
    }
  }, []);

  // 🔄 Função para limpar erros de autenticação
  const clearAuthError = useCallback(() => {
    setAuthError(null);
  }, []);

  // 🔄 Função para forçar limpeza de tokens inválidos
  const forceClearInvalidTokens = useCallback(async () => {
    try {
      console.log('🧹 Force clearing invalid tokens...');
      
      // Usar utilitário de recuperação
      clearAuthStorage();
      
      // Limpar estado local
      setUser(null);
      setProfile(null);
      setAuthError(null);
      
      // Forçar logout no Supabase
      await supabase.auth.signOut();
      
      console.log('✅ Invalid tokens cleared successfully');
    } catch (error) {
      console.error('❌ Error clearing invalid tokens:', error);
    }
  }, []);

  // 🔄 Efeito para inicializar autenticação (singleton subscription)
  const subscribedRef = useRef(false);
  useEffect(() => {
    if (subscribedRef.current) {
      if (import.meta.env.DEV) console.log('👀 Auth listener already subscribed, skipping');
      return;
    }
    subscribedRef.current = true;

    console.log('🚀 Initializing authentication...');

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      // Encaminhar para o handler principal
      void handleAuthStateChange(event, session);

      // Tratamento específico para falha de refresh
      if (event === 'TOKEN_REFRESHED' && !session) {
        console.log('🔄 Token refresh failed, clearing auth state');
        setUser(null);
        setProfile(null);
        setAuthError('Sessão expirada. Por favor, faça login novamente.');
      }
    });

    // Tentar recuperar sessão inicial
    void refreshAuth();

    // Cleanup
    return () => {
      console.log('🧹 Cleaning up auth listeners');
      subscription.unsubscribe();
    };
  }, [handleAuthStateChange, refreshAuth]);

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
    forceClearInvalidTokens,
    authError,
    updateProfile,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

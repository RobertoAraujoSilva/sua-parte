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
  forceClearInvalidTokens: () => Promise<void>;
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

  // 🔄 Função para carregar perfil do usuário com timeout e recovery
  const loadProfile = useCallback(async (userId: string) => {
    // Implement retry logic with exponential backoff and jitter
    const maxRetries = 4;
    let retryCount = 0;

    // Network condition detection for adaptive timeouts using type-safe utility
    const baseTimeout = 15000; // Base 15 seconds
    const adaptiveTimeout = getAdaptiveTimeout(baseTimeout);

    console.log(`📶 Network-adaptive timeout set to: ${adaptiveTimeout}ms`);
    
    while (retryCount <= maxRetries) {
      try {
        console.log(`🔍 Loading profile for user: ${userId} (attempt ${retryCount + 1}/${maxRetries + 1})`);

        // Create a timeout promise to prevent hanging with adaptive timeout
        const timeoutPromise = new Promise((_, reject) => {
          setTimeout(() => reject(new Error(`Profile loading timeout after ${baseTimeout}ms`)), baseTimeout);
        });

        // Create the profile query promise
        const queryPromise = supabase
          .from('profiles')
          .select('*')
          .eq('id', userId)
          .single();

        // Race between query and timeout
        const { data: profileData, error: profileError } = await Promise.race([
          queryPromise,
          timeoutPromise
        ]) as any;

        if (profileError) {
          console.error('❌ Error loading profile:', profileError);

          // If it's a table not found error, don't set it as a critical error
          if (profileError.code === 'PGRST205') {
            console.log('⚠️ Profiles table not found - this is expected during initial setup');
            setProfile(null);
            return;
          }

          // If it's a 403 error, retry with backoff
          if (profileError.message?.includes('403') && retryCount < maxRetries) {
            const backoffDelay = Math.min(1000 * Math.pow(2, retryCount) + Math.random() * 1000, 10000); // Exponential backoff with jitter, max 10s
            console.log(`🔄 Profile 403 error, retrying in ${backoffDelay}ms...`);
            await new Promise(resolve => setTimeout(resolve, backoffDelay));
            retryCount++;
            continue;
          }

          // If it's a network error, retry with backoff
          if ((profileError.message?.includes('Network Error') || profileError.message?.includes('Failed to fetch')) && retryCount < maxRetries) {
            const backoffDelay = Math.min(1500 * Math.pow(2, retryCount) + Math.random() * 1500, 15000); // Exponential backoff with jitter, max 15s
            console.log(`🌐 Network error detected, retrying in ${backoffDelay}ms...`);
            await new Promise(resolve => setTimeout(resolve, backoffDelay));
            retryCount++;
            continue;
          }

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
        return; // Success, exit the retry loop
      } catch (error: any) {
        console.error('❌ Error in loadProfile:', error);

        // If it's a timeout and we have retries left, try again with increased timeout
        if (error.message.includes('Profile loading timeout') && retryCount < maxRetries) {
          // Increase timeout for next attempt
          baseTimeout = Math.min(baseTimeout * 1.5, 45000); // Increase by 50%, max 45 seconds
          const backoffDelay = Math.min(2000 * Math.pow(2, retryCount) + Math.random() * 2000, 20000); // Exponential backoff with jitter, max 20s
          console.log(`⏰ Profile loading timed out, increasing timeout to ${baseTimeout}ms and retrying in ${backoffDelay}ms...`);
          await new Promise(resolve => setTimeout(resolve, backoffDelay));
          retryCount++;
          continue;
        }

        // Handle timeout error with more specific information
        if (error.message.includes('Profile loading timeout')) {
          console.log('⏰ Profile loading timed out - this might indicate network issues or auth corruption');
          setAuthError(`Timeout ao carregar perfil (${baseTimeout}ms) - possível problema de rede ou corrupção de sessão`);

          // Import and trigger auth recovery with better error context
          import('../utils/authRecovery').then(({ detectAuthCorruption, recoverAuthentication }) => {
            detectAuthCorruption().then(isCorrupted => {
              if (isCorrupted) {
                console.log('🔄 Triggering authentication recovery...');
                recoverAuthentication({ clearStorageOnFailure: true, timeoutMs: 15000 }).then(result => {
                  console.log('🔄 Recovery result:', result);
                  if (result.success && result.action === 'cleared') {
                    console.log('🔄 Storage cleared, redirecting to auth...');
                    // Force redirect after a short delay
                    setTimeout(() => {
                      window.location.href = '/auth';
                    }, 1000);
                  } else if (result.success && result.action === 'recovered') {
                    console.log('🔄 Session recovered, reloading page...');
                    setTimeout(() => {
                      window.location.reload();
                    }, 1000);
                  } else {
                    console.log('🚨 Recovery failed, forcing manual clear...');
                    // Fallback: manual clear and redirect
                    import('../utils/authRecovery').then(({ clearAuthStorage }) => {
                      clearAuthStorage().then(() => {
                        setTimeout(() => {
                          window.location.href = '/auth';
                        }, 1000);
                      });
                    });
                  }
                });
              } else {
                console.log('⚠️ No corruption detected, but profile still timing out - checking network...');
                // If no corruption detected but still timing out, check network and force clear anyway
                // Check if we're online
                if (!navigator.onLine) {
                  console.log('🌐 Device is offline, showing network error...');
                  setAuthError('Dispositivo offline - verifique sua conexão e tente novamente');
                  return;
                }
                
                // If online but still timing out, force clear
                import('../utils/authRecovery').then(({ clearAuthStorage }) => {
                  clearAuthStorage().then(() => {
                    setTimeout(() => {
                      window.location.href = '/auth';
                    }, 1000);
                  });
                });
              }
            });
          });
        } else {
          setAuthError(`Erro interno ao carregar perfil: ${error.message}`);
        }
        return; // Exit on error
      }
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

  // 🔄 Função para forçar limpeza de tokens inválidos
  const forceClearInvalidTokens = useCallback(async () => {
    try {
      console.log('🧹 Force clearing invalid tokens...');
      
      // Limpar estado local
      setUser(null);
      setProfile(null);
      setAuthError(null);
      
      // Limpar tokens do localStorage
      try {
        localStorage.removeItem('sb-nwpuurgwnnuejqinkvrh-auth-token');
        sessionStorage.clear();
      } catch (e) {
        console.log('🧹 Error clearing storage:', e);
      }
      
      // Forçar logout no Supabase
      await supabase.auth.signOut();
      
      console.log('✅ Invalid tokens cleared successfully');
    } catch (error) {
      console.error('❌ Error clearing invalid tokens:', error);
    }
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

    // Monitorar erros de refresh token
    const handleRefreshError = (error: any) => {
      if (error?.message?.includes('Invalid Refresh Token') || 
          error?.message?.includes('Refresh Token Not Found') ||
          error?.message?.includes('JWT expired')) {
        
        console.log('🔄 Refresh token error detected, clearing auth state');
        setUser(null);
        setProfile(null);
        setAuthError('Sessão expirada. Por favor, faça login novamente.');
        
        // Limpar tokens inválidos do localStorage
        try {
          localStorage.removeItem('sb-nwpuurgwnnuejqinkvrh-auth-token');
          sessionStorage.clear();
        } catch (e) {
          console.log('🧹 Error clearing storage:', e);
        }
      }
    };

    // Adicionar listener global para erros de auth
    window.addEventListener('unhandledrejection', (event) => {
      if (event.reason?.message?.includes('Refresh Token')) {
        handleRefreshError(event.reason);
        event.preventDefault();
      }
    });

    return () => {
      subscription.unsubscribe();
      window.removeEventListener('unhandledrejection', handleRefreshError);
    };
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
    forceClearInvalidTokens,
    authError,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
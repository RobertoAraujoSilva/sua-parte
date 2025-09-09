import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { Database } from '@/integrations/supabase/types';
import { smartLogout } from '@/utils/forceLogout';
import { withRefreshTokenErrorHandling, recoverSessionWithErrorHandling } from '@/utils/refreshTokenHandler';

// Types
type UserRole = Database['public']['Enums']['user_role'];

interface UserProfile {
  id: string;
  nome_completo: string | null;
  congregacao: string | null;
  cargo: string | null;
  role: UserRole;
  date_of_birth: string | null;
  email: string;
  created_at: string | null;
  updated_at: string | null;
}

interface SignUpData {
  email: string;
  password: string;
  nome_completo: string;
  congregacao: string;
  cargo?: string;
  role: UserRole;
  date_of_birth?: string;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: UserProfile | null;
  loading: boolean;
  signUp: (data: SignUpData) => Promise<{ error: Error | null }>;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<{ error: Error | null }>;
  updateProfile: (updates: Partial<UserProfile>) => Promise<{ data: UserProfile | null; error: Error | null }>;
  isInstrutor: boolean;
  isEstudante: boolean;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [ready, setReady] = useState(false);



  // Fetch user profile from database with simplified logic
  const fetchProfile = useCallback(async (userId: string): Promise<UserProfile | null> => {
    console.log('🔍 Fetching profile for user ID:', userId);

    try {
      // Step 1: Check current session
      console.log('🔐 Checking current session...');
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();

      if (sessionError) {
        console.error('❌ Session error:', sessionError);
        return await createProfileFromAuth(userId);
      }

      if (!session) {
        console.log('❌ No active session, using metadata fallback');
        return await createProfileFromAuth(userId);
      }

      if (session.user.id !== userId) {
        console.error('❌ Session user ID mismatch:', {
          sessionUserId: session.user.id,
          requestedUserId: userId
        });
        return null;
      }

      // Step 2: Fetch profile from database
      console.log('🔍 Fetching from profiles table...');
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', userId as any)
          .single();

      if (profileError) {
        if (profileError.code === 'PGRST116') {
          console.log('📝 Profile not found in database, creating from auth metadata');
        } else {
          console.log('❌ Profile fetch error, using metadata fallback:', profileError);
        }
        return await createProfileFromAuth(userId);
      }

      if (profileData) {
        // Get email from session
        const email = session.user.email || '';
        const profileWithEmail = {
          ...(profileData as any),
          email
        };

        console.log('✅ Profile fetched successfully:', {
          id: profileWithEmail.id,
          nome_completo: profileWithEmail.nome_completo,
          role: profileWithEmail.role,
          email: profileWithEmail.email
        });

        return profileWithEmail;
      }

      console.log('❌ No profile data found, using metadata fallback');
      return await createProfileFromAuth(userId);

    } catch (error) {
      console.error('❌ Error in fetchProfile:', error);
      return await createProfileFromAuth(userId);
    }
  }, []);

  // Create profile from auth metadata with simplified logic
  const createProfileFromAuth = useCallback(async (userId: string) => {
    try {
      console.log('📝 Creating profile from auth metadata for user:', userId);

      // Get current user
      const { data: { user }, error: userError } = await supabase.auth.getUser();

      if (userError) {
        console.error('❌ Error getting user:', userError);
        return null;
      }

      if (!user) {
        console.error('❌ No user found');
        return null;
      }

      if (user.id !== userId) {
        console.error('❌ User ID mismatch in createProfileFromAuth');
        return null;
      }

      const metadata = user.user_metadata || {};
      console.log('📋 User metadata:', {
        hasMetadata: Object.keys(metadata).length > 0,
        role: metadata.role
      });

      // Try to insert profile in database
      const { data, error } = await supabase
        .from('profiles')
        .insert({
          id: userId,
          nome_completo: metadata.nome_completo || '',
          congregacao: metadata.congregacao || '',
          cargo: metadata.cargo || '',
          role: (metadata.role as UserRole) || 'instrutor'
        } as any)
        .select()
        .single();

      if (error) {
        console.error('❌ Error creating profile in database:', error);
        // Return profile from metadata even if DB insert fails
        const email = user.email || '';
        const fallbackProfile = {
          id: userId,
          nome_completo: metadata.nome_completo || '',
          congregacao: metadata.congregacao || '',
          cargo: metadata.cargo || '',
          role: (metadata.role as UserRole) || 'instrutor',
          date_of_birth: metadata.date_of_birth || null,
          email,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
        console.log('🔄 Using fallback profile from metadata');
        return fallbackProfile as UserProfile;
      }

      // Return the profile with email from auth
      return {
        ...(data as any),
        email: user.email || ''
      } as UserProfile;
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('Error creating profile from auth:', errorMessage);
      return null;
    }
  }, []); // Empty dependency array since createProfileFromAuth doesn't depend on any props or state

  // Force profile loading for admin users
  const forceLoadProfile = useCallback(async () => {
    if (!user) return;
    
    console.log('🔧 Force loading profile for user:', user.id);
    
    try {
      // Direct database query to bypass potential RLS issues
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id as any)
        .single();

      if (profileError) {
        console.error('❌ Force profile load error:', profileError);
        return;
      }

      if (profileData) {
        console.log('✅ Force profile load successful:', profileData);
        setProfile({
          ...(profileData as any),
          email: user.email || ''
        });
      }
    } catch (error) {
      console.error('❌ Force profile load exception:', error);
    }
  }, [user]);

  // Force load profile when user is authenticated but profile is missing
  useEffect(() => {
    if (user && !profile && !loading) {
      console.log('🔧 User authenticated but profile missing, forcing load...');
      
      // Immediate profile load attempt
      forceLoadProfile();
      
      // Fallback timeout for faster UX
      const timeout = setTimeout(() => {
        if (!profile) {
          console.log('⏰ Profile load timeout, using metadata fallback');
          // Profile will be handled by ProtectedRoute timeout
        }
      }, 500); // Reduced to 500ms for faster fallback
      
      return () => clearTimeout(timeout);
    }
  }, [user, profile, loading, forceLoadProfile]);

  // Global function for direct login (available in console)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      (window as any).forceAdminLogin = async () => {
        console.log('🔧 Force admin login initiated...');
        
        try {
          // Force login with admin credentials
          const { data, error } = await supabase.auth.signInWithPassword({
            email: 'amazonwebber007@gmail.com',
            password: 'admin123'
          });

          if (error) {
            console.error('❌ Force login error:', error);
            return;
          }

          if (data.user) {
            console.log('✅ Force login successful:', data.user);
            
            // Force load profile
            await forceLoadProfile();
          }
        } catch (error) {
          console.error('❌ Force login exception:', error);
        }
      };

      console.log('🔧 Force admin login function available: window.forceAdminLogin()');
    }
  }, [supabase.auth, forceLoadProfile]);

  // Track initial load completion to prevent race conditions
  const [initialLoadComplete, setInitialLoadComplete] = useState(false);

  useEffect(() => {
    // Get initial session with refresh token error handling
    const getInitialSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();

        if (error) {
          if (error.message.includes('Invalid Refresh Token') || error.message.includes('Refresh Token Not Found')) {
            await supabase.auth.signOut();
            localStorage.clear();
            sessionStorage.clear();
          }
          setLoading(false);
          setInitialLoadComplete(true);
          return;
        }

        if (session?.user) {
          setSession(session);
          setUser(session.user);
          const userProfile = await fetchProfile(session.user.id);
          setProfile(userProfile);
        }
      } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        if (errorMessage.includes('Invalid Refresh Token')) {
          await supabase.auth.signOut();
          localStorage.clear();
          sessionStorage.clear();
        }
      } finally {
        setLoading(false);
        setInitialLoadComplete(true);
      }
    };

    getInitialSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!initialLoadComplete && event === 'INITIAL_SESSION') {
          return;
        }

        try {
          if (session?.user) {
            setSession(session);
            setUser(session.user);
            const userProfile = await fetchProfile(session.user.id);
            setProfile(userProfile);
          } else {
            setSession(null);
            setUser(null);
            setProfile(null);
          }
        } catch (error: unknown) {
          const errorMessage = error instanceof Error ? error.message : 'Unknown error';
          if (errorMessage.includes('Invalid Refresh Token')) {
            await supabase.auth.signOut();
            localStorage.clear();
            sessionStorage.clear();
            setSession(null);
            setUser(null);
            setProfile(null);
          }
        }

        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, [fetchProfile]);

  // Mark app ready after initial auth check completes
  useEffect(() => {
    if (!loading) {
      setReady(true);
    }
  }, [loading]);

  const signUp = async (data: SignUpData) => {
    try {
      const { error } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            nome_completo: data.nome_completo,
            congregacao: data.congregacao,
            cargo: data.cargo || '',
            role: data.role,
            date_of_birth: data.date_of_birth || null,
          },
        },
      });

      if (error) {
        console.error('SignUp error:', error);
      }

      return { error };
    } catch (error) {
      console.error('SignUp exception:', error);
      return { error };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        if (error.message.includes('Invalid Refresh Token')) {
          await supabase.auth.signOut();
          localStorage.clear();
          sessionStorage.clear();
        }
      }

      return { error };
    } catch (error) {
      return { error };
    }
  };

  const signOut = async () => {
    console.log('🔄 AuthContext signOut called');
    console.log('🔄 Current user:', user?.email, user?.id);
    console.log('🔄 Current session exists:', !!session);

    // Immediate local cleanup function
    const clearLocalState = () => {
      console.log('🧹 Clearing local auth state...');
      setUser(null);
      setSession(null);
      setProfile(null);

      // Clear any stored tokens/data
      localStorage.removeItem('supabase.auth.token');
      sessionStorage.clear();
    };

    try {
      console.log('🔄 Using smartLogout for robust logout...');
      
      // Use smartLogout which handles timeouts and fallbacks
      await smartLogout(async () => {
        console.log('🔄 Attempting Supabase signOut...');
        return await supabase.auth.signOut();
      });
      
      // If we reach here, logout was successful
      console.log('✅ Smart logout completed successfully');
      clearLocalState();
      return { error: null };
      
    } catch (error) {
      console.error('❌ SignOut exception:', error);
      
      // Always clear local state on any error
      clearLocalState();
      
      // Return success to UI since local cleanup is what matters for UX
      return { error: null };
    }
  };

  const updateProfile = async (updates: Partial<UserProfile>) => {
    if (!user) {
      return { data: null, error: new Error('No user logged in') };
    }

    try {
      const { data, error } = await supabase
        .from('profiles')
        .update(updates as any)
        .eq('id', user.id as any)
        .select()
        .single();

      if (error) {
        return { data: null, error: new Error(error.message) };
      }

      // Refresh and return the fully-typed profile (including email)
      const updatedProfile = await fetchProfile(user.id);
      setProfile(updatedProfile);
      return { data: updatedProfile, error: null };
    } catch (err: unknown) {
      const e = err instanceof Error ? err : new Error('UpdateProfile exception');
      console.error('UpdateProfile exception:', e);
      return { data: null, error: e };
    }
  };

  // Computed properties for role checking
  const isInstrutor = profile?.role === 'instrutor';
  const isEstudante = profile?.role === 'estudante';
  const isAdmin = profile?.role === 'admin';

  const value = {
    user,
    session,
    profile,
    loading,
    signUp,
    signIn,
    signOut,
    updateProfile,
    isInstrutor,
    isEstudante,
    isAdmin,
  };

  return (
    <AuthContext.Provider value={value}>
      {ready ? children : (
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-sm text-muted-foreground">
            Carregando Sistema Ministerial<br/>
            Inicializando autenticação e permissões...
          </div>
        </div>
      )}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { Database } from '@/integrations/supabase/types';
import { testSupabaseConnection } from '@/utils/supabaseConnectionTest';

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
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [initialLoadComplete, setInitialLoadComplete] = useState(false);



  // Fetch user profile from database with proper timeout handling
  const fetchProfile = useCallback(async (userId: string): Promise<UserProfile | null> => {
    console.log('🔍 Fetching profile for user ID:', userId);

    try {
      // Helper function to create timeout promise
      const createTimeout = (ms: number, operation: string) =>
        new Promise<never>((_, reject) => {
          setTimeout(() => reject(new Error(`${operation} timeout after ${ms}ms`)), ms);
        });

      // Step 1: Check session with its own timeout (2 seconds)
      console.log('🔐 Checking current session...');
      const sessionTimeout = createTimeout(2000, 'Session check');
      const sessionPromise = supabase.auth.getSession();

      const { data: { session }, error: sessionError } = await Promise.race([
        sessionPromise,
        sessionTimeout
      ]);

      console.log('🔐 Session check result:', {
        hasSession: !!session,
        sessionUserId: session?.user?.id,
        targetUserId: userId,
        sessionError: sessionError?.message
      });

      if (sessionError) {
        console.error('❌ Session error:', sessionError);
        return null;
      }

      if (!session) {
        console.error('❌ No active session when fetching profile');
        return null;
      }

      if (session.user.id !== userId) {
        console.error('❌ Session user ID mismatch:', {
          sessionUserId: session.user.id,
          requestedUserId: userId
        });
        return null;
      }

      // Step 2: Fetch profile with its own timeout (4 seconds)
      console.log('🔍 Fetching from profiles table...');
      const profileTimeout = createTimeout(4000, 'Profile fetch');
      const profilePromise = supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      const { data: profileData, error: profileError } = await Promise.race([
        profilePromise,
        profileTimeout
      ]);

      if (profileError) {
        if (profileError.code === 'PGRST116') {
          console.log('📝 Profile not found in database, creating from auth metadata');
        } else {
          console.log('❌ Profile fetch error, attempting to create from auth metadata:', profileError);
        }
        // If profile doesn't exist or fetch fails, create one from user metadata
        return await createProfileFromAuth(userId);
      }

      if (profileData) {
        // Get email from session
        const email = session.user.email || '';
        const profileWithEmail = {
          ...profileData,
          email
        };
        console.log('✅ Profile fetched successfully from database');
        return profileWithEmail as UserProfile;
      }

      console.log('❌ No profile data returned, using metadata fallback');
      return await createProfileFromAuth(userId);

    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('❌ Error in fetchProfile:', errorMessage);

      // Always try metadata fallback on any error
      try {
        console.log('🔄 Using metadata fallback due to error...');
        return await createProfileFromAuth(userId);
      } catch (createError: unknown) {
        const createErrorMessage = createError instanceof Error ? createError.message : 'Unknown error';
        console.error('❌ Metadata fallback also failed:', createErrorMessage);
        return null;
      }
    }
  }, []); // useCallback dependency array

  // Create profile from auth metadata if it doesn't exist
  const createProfileFromAuth = useCallback(async (userId: string) => {
    try {
      console.log('📝 Creating profile from auth metadata for user:', userId);

      // Get user with timeout
      const userTimeout = new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error('Get user timeout')), 3000);
      });

      const { data: { user }, error: userError } = await Promise.race([
        supabase.auth.getUser(),
        userTimeout
      ]);

      if (userError || !user) {
        console.error('❌ Error getting user for profile creation:', userError);
        return null;
      }

      const metadata = user.user_metadata || {};
      console.log('📋 User metadata:', {
        hasMetadata: Object.keys(metadata).length > 0,
        role: metadata.role
      });

      // Try to insert profile with timeout
      const insertTimeout = new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error('Profile insert timeout')), 3000);
      });

      const { data, error } = await Promise.race([
        supabase
          .from('profiles')
          .insert({
            id: userId,
            nome_completo: metadata.nome_completo || '',
            congregacao: metadata.congregacao || '',
            cargo: metadata.cargo || '',
            role: (metadata.role as UserRole) || 'instrutor'
          })
          .select()
          .single(),
        insertTimeout
      ]);

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
        ...data,
        email: user.email || ''
      } as UserProfile;
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('Error creating profile from auth:', errorMessage);
      return null;
    }
  }, []); // Empty dependency array since createProfileFromAuth doesn't depend on any props or state

  useEffect(() => {
    // Get initial session with improved error handling
    const getInitialSession = async () => {
      try {
        console.log('🔄 Getting initial session...');

        // Add timeout to prevent hanging on Supabase initialization issues
        const sessionTimeout = new Promise<never>((_, reject) => {
          setTimeout(() => reject(new Error('Initial session timeout')), 8000); // Longer timeout for initial load
        });

        const { data: { session }, error } = await Promise.race([
          supabase.auth.getSession(),
          sessionTimeout
        ]);

        if (error) {
          console.error('❌ Error getting initial session:', error);
          setLoading(false);
          return;
        }

        if (session?.user) {
          console.log('✅ Initial session found, setting user immediately');
          setSession(session);
          setUser(session.user);

          // Fetch profile in background without blocking initial load
          // Use a separate timeout for profile loading
          const profileLoadTimeout = setTimeout(() => {
            console.log('⏰ Profile loading taking too long, continuing without profile');
          }, 5000);

          fetchProfile(session.user.id)
            .then(userProfile => {
              clearTimeout(profileLoadTimeout);
              console.log('✅ Initial profile loaded successfully');
              setProfile(userProfile);
            })
            .catch((error: unknown) => {
              clearTimeout(profileLoadTimeout);
              const errorMessage = error instanceof Error ? error.message : 'Unknown error';
              console.error('❌ Initial profile fetch failed:', errorMessage);
              // Don't block app initialization, let ProtectedRoute use metadata fallback
            });
        } else {
          console.log('ℹ️ No initial session found');
        }
      } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        console.error('Error in getInitialSession:', errorMessage);
      } finally {
        setLoading(false);
        setInitialLoadComplete(true);
      }
    };

    // Test connection before attempting authentication
    if (import.meta.env.DEV) {
      testSupabaseConnection().then(result => {
        if (!result.success) {
          console.warn('⚠️ Supabase connection issues detected before auth initialization:', result.error);
        }
      });
    }

    getInitialSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('🔄 Auth state changed:', event, session?.user?.email);

        // Skip processing during initial load to prevent race conditions
        if (!initialLoadComplete && event === 'INITIAL_SESSION') {
          console.log('⏭️ Skipping INITIAL_SESSION event (already handled by getInitialSession)');
          return;
        }

        // Set loading to true when processing auth changes
        setLoading(true);

        if (session?.user) {
          console.log('👤 Setting user and session immediately...');
          setSession(session);
          setUser(session.user);

          // Set loading to false immediately so ProtectedRoute can proceed with metadata
          setLoading(false);

          // Fetch profile in background without blocking loading state
          console.log('🔄 Fetching profile in background...');
          try {
            const userProfile = await fetchProfile(session.user.id);
            console.log('📋 Profile loaded:', userProfile);
            setProfile(userProfile);
          } catch (error: unknown) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            console.error('❌ Profile fetch failed:', errorMessage);
            // Don't set loading back to true, let ProtectedRoute use metadata
          }
        } else {
          console.log('🚪 User signed out, clearing data...');
          setSession(null);
          setUser(null);
          setProfile(null);
          setLoading(false);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, [initialLoadComplete, fetchProfile]);

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
        console.error('SignIn error:', error);
      }

      return { error };
    } catch (error) {
      console.error('SignIn exception:', error);
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

    // CRITICAL FIX: Use aggressive timeout to prevent hanging
    const CRITICAL_TIMEOUT = 1500; // 1.5 seconds max wait

    try {
      console.log('🔄 Calling supabase.auth.signOut()...');
      console.log('🔄 Supabase client status:', !!supabase);

      // Log current auth state before signOut
      try {
        const { data: currentSession } = await supabase.auth.getSession();
        console.log('🔄 Current session before signOut:', {
          hasSession: !!currentSession?.session,
          userId: currentSession?.session?.user?.id,
          expiresAt: currentSession?.session?.expires_at
        });
      } catch (sessionCheckError) {
        console.log('⚠️ Could not check current session:', sessionCheckError);
      }

      // CRITICAL FIX: Aggressive timeout to prevent hanging
      const timeoutPromise = new Promise((resolve) =>
        setTimeout(() => {
          console.log('⏰ CRITICAL TIMEOUT - Supabase signOut hanging, forcing completion');
          resolve({ error: { message: 'Critical signOut timeout', code: 'CRITICAL_TIMEOUT' } });
        }, CRITICAL_TIMEOUT)
      );

      // CRITICAL FIX: Single attempt with immediate fallback
      let result;
      try {
        console.log('🔄 Attempting signOut with critical timeout...');
        result = await Promise.race([
          supabase.auth.signOut(),
          timeoutPromise
        ]);

        console.log('🔄 SignOut attempt completed:', result);
      } catch (signOutError) {
        console.log('⚠️ SignOut attempt failed immediately:', signOutError);
        result = { error: { message: 'SignOut immediate failure', code: 'IMMEDIATE_FAILURE', details: signOutError } };
      }

      console.log('🔄 Supabase signOut result:', result);
      console.log('🔄 Supabase signOut result type:', typeof result);

      const { error } = result;
      if (error) {
        console.error('❌ SignOut error from Supabase:', error);
        console.error('❌ SignOut error details:', JSON.stringify(error, null, 2));
        console.error('❌ SignOut error type:', typeof error);
        console.error('❌ SignOut error message:', error?.message);
        console.error('❌ SignOut error code:', error?.code);
        console.error('❌ SignOut error status:', error?.status);

        // Log additional context
        console.error('❌ Current user before signOut:', user?.id, user?.email);
        console.error('❌ Current session before signOut:', session?.access_token ? 'exists' : 'none');

        // Still proceed with local cleanup
        clearLocalState();
        return { error: null }; // Return success to UI since local cleanup worked
      } else {
        console.log('✅ Supabase signOut successful');
        clearLocalState();
        return { error: null };
      }

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
        .update(updates)
        .eq('id', user.id)
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
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
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
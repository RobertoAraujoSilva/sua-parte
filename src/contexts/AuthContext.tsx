import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { Database } from '@/integrations/supabase/types';

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

  // Helper function to create a timeout promise
  const createTimeout = (ms: number) => {
    return new Promise((_, reject) => {
      setTimeout(() => reject(new Error(`Query timeout after ${ms}ms`)), ms);
    });
  };

  // Fetch user profile from database with multiple fallback strategies
  const fetchProfile = useCallback(async (userId: string): Promise<UserProfile | null> => {
    console.log('🔍 Fetching profile for user ID:', userId);

    // First, let's check the current session to ensure we're authenticated
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    console.log('🔐 Current session check:', {
      hasSession: !!session,
      sessionUserId: session?.user?.id,
      targetUserId: userId,
      sessionError: sessionError?.message
    });

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

    // Strategy 1: Try user_profiles view with timeout
    try {
      console.log('🔍 Strategy 1: Fetching from user_profiles view with timeout...');

      const viewQuery = supabase
        .from('user_profiles')
        .select('*')
        .eq('id', userId)
        .single();

      const result = await Promise.race([
        viewQuery,
        createTimeout(10000) // 10 second timeout
      ]);

      if (result === 'timeout') {
        console.error('❌ Strategy 1 timeout - user_profiles view took too long');
        throw new Error('Profile fetch timeout');
      }

      const { data, error } = result;

      if (error) {
        console.error('❌ Strategy 1 failed - user_profiles view error:', {
          code: error.code,
          message: error.message,
          details: error.details,
          hint: error.hint
        });
      } else if (data) {
        console.log('✅ Strategy 1 success - Profile fetched from view:', data);
        return data as UserProfile;
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('❌ Strategy 1 exception:', errorMessage);
    }

    // Strategy 2: Try secure function
    try {
      console.log('🔄 Strategy 2: Trying secure function...');
      const result = await Promise.race([
        supabase.rpc('get_user_profile', { user_id: userId }),
        createTimeout(10000)
      ]);

      if (result === 'timeout') {
        console.error('❌ Strategy 2 timeout - Secure function took too long');
        throw new Error('Secure function timeout');
      }

      const { data: functionData, error: functionError } = result;

      if (functionError) {
        console.error('❌ Strategy 2 failed - Secure function error:', functionError);
      } else if (functionData && functionData.length > 0) {
        console.log('✅ Strategy 2 success - Profile fetched via secure function:', functionData[0]);
        return functionData[0] as UserProfile;
      }
    } catch (funcError: unknown) {
      const errorMessage = funcError instanceof Error ? funcError.message : 'Unknown error';
      console.error('❌ Strategy 2 exception:', errorMessage);
    }

    // Strategy 3: Try direct profiles table access
    try {
      console.log('🔄 Strategy 3: Trying direct profiles table access...');
      const result = await Promise.race([
        supabase.from('profiles').select('*').eq('id', userId).single(),
        createTimeout(10000)
      ]);

      if (result === 'timeout') {
        console.error('❌ Strategy 3 timeout - Direct profiles access took too long');
        throw new Error('Direct profiles timeout');
      }

      const { data: profileData, error: profileError } = result;

      if (profileError) {
        console.error('❌ Strategy 3 failed - Direct profiles error:', profileError);
      } else if (profileData) {
        // Get email from auth.users separately
        const email = session?.user?.email || '';
        const profileWithEmail = {
          ...profileData,
          email
        };
        console.log('✅ Strategy 3 success - Profile fetched from profiles table:', profileWithEmail);
        return profileWithEmail as UserProfile;
      }
    } catch (directError: unknown) {
      const errorMessage = directError instanceof Error ? directError.message : 'Unknown error';
      console.error('❌ Strategy 3 exception:', errorMessage);
    }

    // Strategy 4: Create profile from auth metadata if none exists
    console.log('🔄 Strategy 4: Attempting to create profile from auth metadata...');
    try {
      return await createProfileFromAuth(userId);
    } catch (createError: unknown) {
      const errorMessage = createError instanceof Error ? createError.message : 'Unknown error';
      console.error('❌ Strategy 4 failed:', errorMessage);
    }

    console.error('❌ All strategies failed - unable to fetch profile');
    return null;
  }, []); // useCallback dependency array

  // Create profile from auth metadata if it doesn't exist
  const createProfileFromAuth = useCallback(async (userId: string) => {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();

      if (userError || !user) {
        console.error('Error getting user for profile creation:', userError);
        return null;
      }

      const metadata = user.user_metadata || {};

      const { data, error } = await supabase
        .from('profiles')
        .insert({
          id: userId,
          nome_completo: metadata.nome_completo || '',
          congregacao: metadata.congregacao || '',
          cargo: metadata.cargo || '',
          role: (metadata.role as UserRole) || 'instrutor'
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating profile:', error);
        return null;
      }

      // Return the profile with email from auth
      return {
        ...data,
        email: user.email || ''
      } as UserProfile;
    } catch (error) {
      console.error('Error creating profile from auth:', error);
      return null;
    }
  }, []); // Empty dependency array since createProfileFromAuth doesn't depend on any props or state

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();

        if (error) {
          console.error('Error getting session:', error);
          setLoading(false);
          return;
        }

        if (session?.user) {
          console.log('🔄 Initial session found, setting user immediately');
          setSession(session);
          setUser(session.user);

          // Fetch profile in background without blocking initial load
          fetchProfile(session.user.id).then(userProfile => {
            console.log('📋 Initial profile loaded:', userProfile);
            setProfile(userProfile);
          }).catch(error => {
            console.error('❌ Initial profile fetch failed:', error);
            // Don't block, let ProtectedRoute use metadata
          });
        }
      } catch (error) {
        console.error('Error in getInitialSession:', error);
      } finally {
        setLoading(false);
        setInitialLoadComplete(true);
      }
    };

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
          } catch (error) {
            console.error('❌ Profile fetch failed:', error);
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
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('SignOut error:', error);
      }
      setUser(null);
      setSession(null);
      setProfile(null);
      return { error };
    } catch (error) {
      console.error('SignOut exception:', error);
      return { error };
    }
  };

  const updateProfile = async (updates: Partial<UserProfile>) => {
    if (!user) {
      return { data: null, error: { message: 'No user logged in' } };
    }

    try {
      const { data, error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', user.id)
        .select()
        .single();

      if (!error && data) {
        // Refresh profile
        const updatedProfile = await fetchProfile(user.id);
        setProfile(updatedProfile);
      }

      return { data, error };
    } catch (error) {
      console.error('UpdateProfile exception:', error);
      return { data: null, error };
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
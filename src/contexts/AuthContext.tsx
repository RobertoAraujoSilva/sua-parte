import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { Database } from '@/integrations/supabase/types';
import { getCachedProfile, setCachedProfile, invalidateProfileCache } from '@/utils/profileCache';

// Conditional logging utility for authentication events
const logAuthEvent = (message: string, data?: any) => {
  const isDev = import.meta.env.DEV;
  const isDebugEnabled = typeof window !== 'undefined' && localStorage.getItem('debug-auth') === 'true';

  if (isDev || isDebugEnabled) {
    console.log(message, data);
  }
};

// Debug function for testing profile fetch
const testProfileFetch = async (userId: string) => {
  console.log('🧪 Testing direct profile fetch for:', userId);
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    console.log('🧪 Direct fetch result:', { data, error });
    return { data, error };
  } catch (err) {
    console.log('🧪 Direct fetch exception:', err);
    return { data: null, error: err };
  }
};

// Make test function available globally in development (moved to avoid Fast Refresh issues)
const initializeDebugTools = () => {
  if (typeof window !== 'undefined' && import.meta.env.DEV) {
    (window as any).testProfileFetch = testProfileFetch;
  }
};

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

  // Initialize debug tools in development
  useEffect(() => {
    initializeDebugTools();
  }, []);

  // Create profile from auth metadata - DEFINED FIRST to avoid hoisting issues
  const createProfileFromAuth = useCallback(async (userId: string) => {
    try {
      logAuthEvent('📝 Creating profile from auth metadata for user:', userId);

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
      logAuthEvent('📋 User metadata:', {
        hasMetadata: Object.keys(metadata).length > 0,
        role: metadata.role,
        email: user.email
      });

      // Ensure we always have a valid name
      const nome_completo = metadata.nome_completo ||
                           user.email?.split('@')[0] ||
                           'Instrutor';

      // Ensure we always have a valid role
      const role = (metadata.role as UserRole) || 'instrutor';

      // Try to insert profile in database with validated data using UPSERT to avoid conflicts
      const { data, error } = await supabase
        .from('profiles')
        .upsert({
          id: userId,
          nome_completo,
          congregacao: metadata.congregacao || '',
          cargo: metadata.cargo || 'instrutor',
          role
        }, {
          onConflict: 'id',
          ignoreDuplicates: false
        })
        .select()
        .single();

      if (error) {
        console.error('❌ Error upserting profile in database:', error);
        // If upsert fails, try to fetch existing profile first
        const { data: existingProfile, error: fetchError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', userId)
          .single();

        if (!fetchError && existingProfile) {
          logAuthEvent('✅ Found existing profile after upsert failure');
          return {
            ...existingProfile,
            email: user.email || ''
          } as UserProfile;
        }

        // Return profile from metadata as last resort
        const email = user.email || '';
        const fallbackProfile = {
          id: userId,
          nome_completo,
          congregacao: metadata.congregacao || '',
          cargo: metadata.cargo || 'instrutor',
          role,
          date_of_birth: metadata.date_of_birth || null,
          email,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
        logAuthEvent('🔄 Using fallback profile from metadata with validated data');
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

  // Fetch user profile from database - SIMPLIFIED without debouncing to fix hanging issue
  const fetchProfile = useCallback(async (userId: string): Promise<UserProfile | null> => {
    try {
      // Check cache first
      const cachedProfile = getCachedProfile(userId);
      if (cachedProfile) {
        logAuthEvent('📋 Using cached profile for user:', userId);
        return cachedProfile;
      }

      logAuthEvent('🔍 Fetching profile from database for user ID:', userId);

      // Directly fetch profile from database
      logAuthEvent('🔄 Querying profiles table...');
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      logAuthEvent('📊 Profile query result:', {
        hasData: !!profileData,
        hasError: !!profileError,
        errorCode: profileError?.code,
        errorMessage: profileError?.message
      });

      if (profileError) {
        if (profileError.code === 'PGRST116') {
          logAuthEvent('📝 Profile not found in database, creating from auth metadata');
        } else {
          logAuthEvent('❌ Profile fetch error, using metadata fallback:', profileError);
        }
        return await createProfileFromAuth(userId);
      }

      if (profileData) {
        // Get email from current user
        const { data: { user: currentUser } } = await supabase.auth.getUser();
        const email = currentUser?.email || '';

        const profileWithEmail = {
          ...profileData,
          email
        } as UserProfile;

        logAuthEvent('✅ Profile fetched successfully:', {
          id: profileWithEmail.id,
          nome_completo: profileWithEmail.nome_completo,
          role: profileWithEmail.role,
          email: profileWithEmail.email
        });

        // Cache the profile for future use
        setCachedProfile(userId, profileWithEmail);

        return profileWithEmail;
      }

      logAuthEvent('❌ No profile data found, using metadata fallback');
      return await createProfileFromAuth(userId);

    } catch (error) {
      logAuthEvent('❌ Error in fetchProfile:', error);
      return await createProfileFromAuth(userId);
    }
  }, [createProfileFromAuth]); // Removed debouncing dependency

  // Authentication functions
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
    logAuthEvent('🔄 AuthContext signOut called');
    logAuthEvent('🔄 Current user:', { email: user?.email, id: user?.id });
    logAuthEvent('🔄 Current session exists:', !!session);

    // Immediate local cleanup function
    const clearLocalState = () => {
      logAuthEvent('🧹 Clearing local auth state...');
      setUser(null);
      setSession(null);
      setProfile(null);
      invalidateProfileCache(user?.id || '');

      // Clear any stored tokens/data
      localStorage.removeItem('supabase.auth.token');
      sessionStorage.clear();
    };

    try {
      logAuthEvent('🔄 Calling supabase.auth.signOut()...');
      
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error('❌ SignOut error from Supabase:', error);
      } else {
        logAuthEvent('✅ Supabase signOut successful');
      }
      
      clearLocalState();
      return { error: null };

    } catch (error) {
      console.error('❌ SignOut exception:', error);
      clearLocalState();
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

      // Invalidate cache and refresh profile
      invalidateProfileCache(user.id);
      const updatedProfile = await fetchProfile(user.id);
      setProfile(updatedProfile);
      return { data: updatedProfile, error: null };
    } catch (err: unknown) {
      const e = err instanceof Error ? err : new Error('UpdateProfile exception');
      console.error('UpdateProfile exception:', e);
      return { data: null, error: e };
    }
  };

  // Initialize auth state on mount
  useEffect(() => {
    const getInitialSession = async () => {
      try {
        logAuthEvent('🔄 Getting initial session...');

        const { data: { session }, error } = await supabase.auth.getSession();

        if (error) {
          console.error('❌ Error getting initial session:', error);
          // Don't fail completely on session error, continue with null session
          setSession(null);
          setUser(null);
          setProfile(null);
          setLoading(false);
          return;
        }

        if (session) {
          logAuthEvent('✅ Initial session found');
          setSession(session);
          setUser(session.user);

          // Fetch profile for the user with timeout and fallback
          try {
            logAuthEvent('🔄 Starting initial profile fetch...');

            // Set a timeout for profile fetch to prevent hanging (synchronized to 3 seconds)
            const profilePromise = fetchProfile(session.user.id);
            const timeoutPromise = new Promise<UserProfile | null>((_, reject) => {
              setTimeout(() => reject(new Error('Profile fetch timeout')), 3000);
            });

            const userProfile = await Promise.race([profilePromise, timeoutPromise]);

            if (userProfile) {
              logAuthEvent('✅ Initial profile loaded successfully:', userProfile.nome_completo);
              setProfile(userProfile);
            } else {
              logAuthEvent('❌ Initial profile fetch returned null, using metadata fallback');
              // Create profile from metadata as fallback
              const fallbackProfile = await createProfileFromAuth(session.user.id);
              setProfile(fallbackProfile);
            }
          } catch (error) {
            logAuthEvent('❌ Initial profile fetch error/timeout, using metadata fallback:', error);
            // Create profile from metadata as fallback
            try {
              const fallbackProfile = await createProfileFromAuth(session.user.id);
              setProfile(fallbackProfile);
            } catch (fallbackError) {
              logAuthEvent('❌ Fallback profile creation failed:', fallbackError);
              setProfile(null);
            }
          }
        } else {
          logAuthEvent('ℹ️ No initial session found');
        }

        setLoading(false);
      } catch (error) {
        console.error('❌ Exception getting initial session:', error);
        setLoading(false);
      }
    };

    getInitialSession();

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        logAuthEvent('🔄 Auth state change:', { event, hasSession: !!session });

        if (event === 'SIGNED_IN' && session) {
          setSession(session);
          setUser(session.user);

          // Fetch profile for the user with timeout and fallback
          try {
            logAuthEvent('🔄 Starting profile fetch in auth state change...');

            // Set a timeout for profile fetch to prevent hanging (synchronized to 3 seconds)
            const profilePromise = fetchProfile(session.user.id);
            const timeoutPromise = new Promise<UserProfile | null>((_, reject) => {
              setTimeout(() => reject(new Error('Profile fetch timeout')), 3000);
            });

            const userProfile = await Promise.race([profilePromise, timeoutPromise]);

            if (userProfile) {
              logAuthEvent('✅ Profile loaded in auth state change:', userProfile.nome_completo);
              setProfile(userProfile);
            } else {
              logAuthEvent('❌ Profile fetch returned null in auth state change, using metadata fallback');
              const fallbackProfile = await createProfileFromAuth(session.user.id);
              setProfile(fallbackProfile);
            }
          } catch (error) {
            logAuthEvent('❌ Profile fetch error/timeout in auth state change, using metadata fallback:', error);
            try {
              const fallbackProfile = await createProfileFromAuth(session.user.id);
              setProfile(fallbackProfile);
            } catch (fallbackError) {
              logAuthEvent('❌ Fallback profile creation failed in auth state change:', fallbackError);
              setProfile(null);
            }
          }
        } else if (event === 'SIGNED_OUT') {
          setSession(null);
          setUser(null);
          setProfile(null);
          invalidateProfileCache('');
        }

        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, [fetchProfile]);

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

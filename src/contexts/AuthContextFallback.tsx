import { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

// Fallback types for when role system is not yet implemented
interface UserProfile {
  id: string;
  nome_completo: string | null;
  congregacao: string | null;
  cargo: string | null;
  role?: 'instrutor' | 'estudante'; // Optional until migration is applied
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
  role?: 'instrutor' | 'estudante';
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: UserProfile | null;
  loading: boolean;
  signUp: (data: SignUpData) => Promise<{ error: any }>;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<{ error: any }>;
  updateProfile: (updates: Partial<UserProfile>) => Promise<{ data: any; error: any }>;
  isInstrutor: boolean;
  isEstudante: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  // Fetch user profile from database (fallback version)
  const fetchProfile = async (userId: string) => {
    try {
      // Try to get from profiles table first
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId as any)
        .single();

      if (profileError) {
        console.log('Profile not found in profiles table, creating from user metadata');
        
        // If profile doesn't exist, create one from user metadata
        const { data: userData } = await supabase.auth.getUser();
        if (userData.user) {
          const metadata = userData.user.user_metadata;
          
          // Create profile in database
          const newProfile = {
            id: userId,
            nome_completo: metadata.nome_completo || '',
            congregacao: metadata.congregacao || '',
            cargo: metadata.cargo || '',
          };

          const { data: insertData, error: insertError } = await supabase
            .from('profiles')
            .insert({
              id: userId,
              nome_completo: metadata.nome_completo || '',
              congregacao: metadata.congregacao || '',
              cargo: metadata.cargo || '',
            } as any)
            .select()
            .single();

          if (!insertError && insertData) {
            return {
              ...(insertData as any),
              email: userData.user.email || '',
              role: metadata.role || 'instrutor', // Default fallback
            } as UserProfile;
          }
        }
        return null;
      }

      // Add email from auth user
      const { data: userData } = await supabase.auth.getUser();
      return {
        ...(profileData as any),
        email: userData.user?.email || '',
        role: (profileData as any)?.role || 'instrutor', // Fallback if role column doesn't exist
      } as UserProfile;

    } catch (error) {
      console.error('Error fetching profile:', error);
      return null;
    }
  };

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
          setSession(session);
          setUser(session.user);
          const userProfile = await fetchProfile(session.user.id);
          setProfile(userProfile);
        }
      } catch (error) {
        console.error('Error in getInitialSession:', error);
      } finally {
        setLoading(false);
      }
    };

    getInitialSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session?.user?.email);
        
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
        
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

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
            role: data.role || 'instrutor',
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
        .update(updates as any)
        .eq('id', user.id as any)
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

  // Computed properties for role checking (with fallbacks)
  const isInstrutor = profile?.role === 'instrutor' || !profile?.role; // Default to instrutor if no role
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

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

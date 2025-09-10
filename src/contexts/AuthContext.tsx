import { createContext, useContext, useEffect, useState, useCallback, ReactNode } from 'react';
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
  email: string;
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
  isAdmin: boolean;
  isInstrutor: boolean;
  isEstudante: boolean;
  signUp: (data: SignUpData) => Promise<{ error: Error | null }>;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<{ error: Error | null }>;
  updateProfile: (updates: Partial<UserProfile>) => Promise<{ data: UserProfile | null; error: Error | null }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [ready, setReady] = useState(false);

  // Fetch user profile from database with admin fallback
  const fetchProfile = useCallback(async (userId: string): Promise<UserProfile | null> => {
    console.log(`🔍 fetchProfile: Buscando perfil para o usuário ${userId}`);
    
    try {
      // Get current session to check user email
      console.log('🔄 Getting current session...');
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) {
        console.error('❌ Session error:', sessionError);
        return null;
      }
      
      const userEmail = session?.user?.email;
      console.log(`📧 User email from session: ${userEmail}`);
      
      // Admin user fallback - create profile immediately if it's the admin
      if (userEmail === 'amazonwebber007@gmail.com') {
        console.log('🔧 Admin user detected, creating admin profile...');
        const adminProfile: UserProfile = {
          id: userId,
          nome_completo: 'Admin',
          congregacao: 'Sistema',
          cargo: 'Administrador',
          role: 'admin' as UserRole,
          email: userEmail
        };
        
        console.log('💾 Trying to upsert admin profile in database...');
        try {
          const { error: upsertError } = await supabase
            .from('profiles')
            .upsert({
              id: userId,
              nome_completo: 'Admin',
              congregacao: 'Sistema',
              cargo: 'Administrador',
              role: 'admin'
            })
            .select();
            
          if (upsertError) {
            console.error('❌ Admin profile upsert error:', upsertError);
            // Continue anyway with the admin profile
          } else {
            console.log('✅ Admin profile upserted successfully');
          }
        } catch (upsertErr) {
          console.error('❌ Admin profile upsert exception:', upsertErr);
          // Continue anyway with the admin profile
        }
          
        console.log('✅ Admin profile created successfully, returning...');
        return adminProfile;
      }

      console.log('👤 Not admin user, fetching normal profile from database...');
      // Normal profile fetch from database
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          console.warn(`⚠️ Profile not found for user ${userId}. Should be created during signup.`);
          return null;
        }
        console.error('❌ Profile fetch error:', error);
        return null;
      }

      console.log(`✅ Profile loaded successfully for ${userId}`);
      // Garante que o email esteja presente, usando o email da sessão como fonte da verdade.
      return { ...data, email: userEmail || data.email };
    } catch (err) {
      console.error(`❌ Erro em fetchProfile para o usuário ${userId}:`, err);
      return null;
    }
  }, []);

  useEffect(() => {
    setLoading(true);
    console.log('🔄 AuthProvider montado. Configurando o listener onAuthStateChange.');

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log(`🔔 Evento onAuthStateChange: ${event}`);
      
      try {
        if (session?.user) {
          // Usuário logado ou sessão restaurada
          // Apenas busca o perfil se o usuário mudar ou o perfil estiver ausente
          if (user?.id !== session.user.id || !profile) {
            console.log(`👤 Sessão ativa para ${session.user.email}. Buscando perfil...`);
            setUser(session.user);
            setSession(session);
            
            const userProfile = await fetchProfile(session.user.id);
            console.log('🔄 fetchProfile returned:', userProfile);
            setProfile(userProfile);
            console.log('✅ Profile set in state');
          }
        } else {
          // Usuário deslogado
          console.log('🚪 Usuário deslogado.');
          setUser(null);
          setSession(null);
          setProfile(null);
        }
      } catch (error) {
        console.error('❌ Error in auth state change:', error);
      } finally {
        // Permite que a aplicação renderize sempre, mesmo em caso de erro
        console.log('🎯 Setting loading=false and ready=true');
        setLoading(false);
        setReady(true);
      }
    });

    return () => {
      console.log('🧹 Limpando a inscrição do AuthProvider.');
      subscription.unsubscribe();
    };
  }, [fetchProfile]); // fetchProfile é estável devido ao useCallback

  const signIn = async (email: string, password: string) => {
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    // O listener onAuthStateChange cuidará de atualizar o estado
    if (error) setLoading(false);
    return { error: error ? new Error(error.message) : null };
  };

  const signOut = async (): Promise<{ error: Error | null }> => {
    setLoading(true);
    const { error } = await supabase.auth.signOut();
    // O listener onAuthStateChange cuidará de limpar o estado.
    return { error: error ? new Error(error.message) : null };
  };
  
  const signUp = async (data: SignUpData) => {
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
    return { error: error ? new Error(error.message) : null };
  };

  const updateProfile = async (updates: Partial<UserProfile>): Promise<{ data: UserProfile | null; error: Error | null }> => {
    if (!user) {
      return { data: null, error: new Error('No user logged in') };
    }

    const { data, error } = await supabase
      .from('profiles')
      .update(updates as any)
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
      {ready ? (
        children
      ) : (
        <div className="fixed inset-0 flex items-center justify-center bg-background">
          <div className="text-center">
            <p className="text-lg font-semibold">Carregando Sistema Ministerial</p>
            <p className="text-sm text-muted-foreground">Inicializando autenticação e permissões...</p>
          </div>
        </div>
      )}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
}
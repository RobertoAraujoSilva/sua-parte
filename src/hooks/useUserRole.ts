import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User } from '@supabase/supabase-js';

export type UserRole = 'admin' | 'instrutor' | 'estudante' | 'developer' | null;

export interface UserProfile {
  id: string;
  nome_completo?: string;
  congregacao?: string;
  cargo?: string;
  role: UserRole;
  created_at: string;
  updated_at: string;
}

export interface UseUserRoleReturn {
  user: User | null;
  profile: UserProfile | null;
  role: UserRole;
  isAdmin: boolean;
  isInstrutor: boolean;
  isEstudante: boolean;
  isDeveloper: boolean;
  loading: boolean;
  error: string | null;
  refreshProfile: () => Promise<void>;
}

export function useUserRole(): UseUserRoleReturn {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUserProfile = async (currentUser: User | null) => {
    if (!currentUser) {
      setProfile(null);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const { data, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', currentUser.id)
        .single();

      if (profileError) {
        console.error('Error fetching user profile:', profileError);
        setError(profileError.message);
        setProfile(null);
      } else {
        setProfile(data);
      }
    } catch (err: any) {
      console.error('Error in fetchUserProfile:', err);
      setError(err.message);
      setProfile(null);
    } finally {
      setLoading(false);
    }
  };

  const refreshProfile = async () => {
    await fetchUserProfile(user);
  };

  useEffect(() => {
    // Get initial user
    const getInitialUser = async () => {
      const { data: { user: initialUser } } = await supabase.auth.getUser();
      setUser(initialUser);
      await fetchUserProfile(initialUser);
    };

    getInitialUser();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        const currentUser = session?.user || null;
        setUser(currentUser);
        await fetchUserProfile(currentUser);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  // Derived values with temporary fallback for admin setup
  const role: UserRole = profile?.role || (user?.email === 'amazonwebber007@gmail.com' ? 'admin' : null);
  const isAdmin = role === 'admin';
  const isInstrutor = role === 'instrutor';
  const isEstudante = role === 'estudante';
  const isDeveloper = role === 'developer';

  return {
    user,
    profile,
    role,
    isAdmin,
    isInstrutor,
    isEstudante,
    isDeveloper,
    loading,
    error,
    refreshProfile
  };
}

// Helper function to check if user has admin privileges
export function hasAdminAccess(role: UserRole): boolean {
  return role === 'admin' || role === 'developer';
}

// Helper function to check if user can manage local assignments
export function canManageAssignments(role: UserRole): boolean {
  return role === 'admin' || role === 'instrutor' || role === 'developer';
}

// Helper function to check if user can view global programming
export function canViewGlobalProgramming(role: UserRole): boolean {
  return role === 'admin' || role === 'instrutor' || role === 'developer';
}

// Helper function to check if user can create global programming
export function canCreateGlobalProgramming(role: UserRole): boolean {
  return role === 'admin' || role === 'developer';
}

// Helper function to get role display name
export function getRoleDisplayName(role: UserRole): string {
  switch (role) {
    case 'admin':
      return 'Administrador';
    case 'instrutor':
      return 'Instrutor';
    case 'estudante':
      return 'Estudante';
    case 'developer':
      return 'Desenvolvedor';
    default:
      return 'Usuário';
  }
}

// Helper function to get role color theme
export function getRoleColorTheme(role: UserRole): {
  primary: string;
  secondary: string;
  accent: string;
  text: string;
} {
  switch (role) {
    case 'admin':
      return {
        primary: 'bg-blue-600',
        secondary: 'bg-blue-100',
        accent: 'border-blue-300',
        text: 'text-blue-800'
      };
    case 'instrutor':
      return {
        primary: 'bg-green-600',
        secondary: 'bg-green-100',
        accent: 'border-green-300',
        text: 'text-green-800'
      };
    case 'estudante':
      return {
        primary: 'bg-purple-600',
        secondary: 'bg-purple-100',
        accent: 'border-purple-300',
        text: 'text-purple-800'
      };
    case 'developer':
      return {
        primary: 'bg-orange-600',
        secondary: 'bg-orange-100',
        accent: 'border-orange-300',
        text: 'text-orange-800'
      };
    default:
      return {
        primary: 'bg-gray-600',
        secondary: 'bg-gray-100',
        accent: 'border-gray-300',
        text: 'text-gray-800'
      };
  }
}

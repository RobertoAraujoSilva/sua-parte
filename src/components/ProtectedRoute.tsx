import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Database } from '@/integrations/supabase/types';

type UserRole = Database['public']['Enums']['user_role'];

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
  requireAuth?: boolean;
  redirectTo?: string;
}

const ProtectedRoute = ({ 
  children, 
  allowedRoles = ['instrutor', 'estudante'], 
  requireAuth = true,
  redirectTo 
}: ProtectedRouteProps) => {
  const { user, profile, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (loading) return; // Wait for auth to load

    // If authentication is required but user is not logged in
    if (requireAuth && !user) {
      navigate('/auth');
      return;
    }

    // If user is logged in but profile is not loaded yet
    if (user && !profile) {
      return; // Wait for profile to load
    }

    // If user is logged in and profile is loaded
    if (user && profile) {
      // Check if user's role is allowed
      if (!allowedRoles.includes(profile.role)) {
        // Redirect based on user role
        if (redirectTo) {
          navigate(redirectTo);
        } else if (profile.role === 'instrutor') {
          navigate('/dashboard');
        } else if (profile.role === 'estudante') {
          navigate(`/estudante/${user.id}`);
        } else {
          navigate('/auth');
        }
        return;
      }
    }
  }, [user, profile, loading, allowedRoles, requireAuth, redirectTo, navigate]);

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-jw-blue mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando...</p>
        </div>
      </div>
    );
  }

  // If authentication is required but user is not logged in
  if (requireAuth && !user) {
    return null; // Will redirect in useEffect
  }

  // If user is logged in but profile is not loaded yet
  if (user && !profile) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-jw-blue mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando perfil...</p>
        </div>
      </div>
    );
  }

  // If user is logged in and profile is loaded
  if (user && profile) {
    // Check if user's role is allowed
    if (!allowedRoles.includes(profile.role)) {
      return null; // Will redirect in useEffect
    }
  }

  // Render children if all checks pass
  return <>{children}</>;
};

export default ProtectedRoute;

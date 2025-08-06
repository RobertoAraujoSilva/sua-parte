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
    console.log('🛡️ ProtectedRoute check:', {
      loading,
      hasUser: !!user,
      hasProfile: !!profile,
      userRole: profile?.role,
      allowedRoles,
      requireAuth,
      redirectTo
    });

    if (loading) {
      console.log('⏳ ProtectedRoute waiting for auth to load...');
      return; // Wait for auth to load
    }

    // If authentication is required but user is not logged in
    if (requireAuth && !user) {
      console.log('🚫 ProtectedRoute: No user, redirecting to auth');
      navigate('/auth');
      return;
    }

    // If user is logged in, check access
    if (user) {
      let userRole: UserRole | undefined;

      // Get role from profile if available, otherwise from user metadata
      if (profile) {
        userRole = profile.role;
        console.log('✅ ProtectedRoute: Using profile role:', userRole);
      } else {
        userRole = user.user_metadata?.role as UserRole;
        console.log('⚠️ ProtectedRoute: Using metadata role:', userRole, '(profile not loaded)');
      }

      if (userRole) {
        // Check if user's role is allowed
        if (!allowedRoles.includes(userRole)) {
          console.log('🚫 ProtectedRoute: Role not allowed, redirecting...', {
            userRole,
            allowedRoles
          });
          // Redirect based on user role
          if (redirectTo) {
            navigate(redirectTo);
          } else if (userRole === 'instrutor') {
            navigate('/dashboard');
          } else if (userRole === 'estudante') {
            navigate(`/estudante/${user.id}`);
          } else {
            navigate('/auth');
          }
          return;
        } else {
          console.log('✅ ProtectedRoute: Access granted for role:', userRole);
        }
      } else {
        console.log('⏳ ProtectedRoute: No role found, waiting for profile...');
        return; // Wait for profile to load
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

  // If user is logged in, check access based on available data
  if (user) {
    let userRole: UserRole | undefined;

    // Get role from profile if available, otherwise from user metadata
    if (profile) {
      userRole = profile.role;
    } else {
      userRole = user.user_metadata?.role as UserRole;
    }

    if (!userRole) {
      // No role available, show loading
      return (
        <div className="min-h-screen bg-background flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-jw-blue mx-auto mb-4"></div>
            <p className="text-gray-600">Carregando perfil...</p>
          </div>
        </div>
      );
    }

    // Check if user's role is allowed
    if (!allowedRoles.includes(userRole)) {
      return null; // Will redirect in useEffect
    }
  }

  // Render children if all checks pass
  return <>{children}</>;
};

export default ProtectedRoute;

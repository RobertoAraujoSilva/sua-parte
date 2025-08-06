import { useEffect, useState } from 'react';
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
  const [profileTimeout, setProfileTimeout] = useState(false);

  // Set up profile timeout to prevent infinite loading
  useEffect(() => {
    if (user && !profile && !loading) {
      console.log('⏰ Setting profile timeout - will fallback to metadata in 5 seconds');
      const timeout = setTimeout(() => {
        console.log('⏰ Profile timeout reached, using metadata fallback');
        setProfileTimeout(true);
      }, 5000); // 5 second timeout

      return () => clearTimeout(timeout);
    }
  }, [user, profile, loading]);

  useEffect(() => {
    console.log('🛡️ ProtectedRoute check:', {
      loading,
      hasUser: !!user,
      hasProfile: !!profile,
      userRole: profile?.role,
      metadataRole: user?.user_metadata?.role,
      profileTimeout,
      allowedRoles,
      requireAuth,
      redirectTo
    });

    if (loading) {
      console.log('⏳ ProtectedRoute waiting for auth to load...');
      return; // Just return, don't render JSX in useEffect
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
        // No role found - check if we should wait or timeout
        if (!profileTimeout) {
          console.log('⏳ ProtectedRoute: No role found, waiting for profile...');
          return; // Just return, don't render JSX in useEffect
        } else {
          console.log('❌ ProtectedRoute: Profile timeout reached, no role available, redirecting to auth');
          navigate('/auth');
          return; // Just return, don't render JSX in useEffect
        }
      }
    }
  }, [user, profile, loading, allowedRoles, requireAuth, redirectTo, navigate, profileTimeout]);

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
      console.log('✅ ProtectedRoute: Using profile role:', userRole);
    } else {
      userRole = user.user_metadata?.role as UserRole;
      console.log('⚠️ ProtectedRoute: Using metadata role:', userRole, '(profile not loaded yet)');
    }

    if (!userRole) {
      // No role available - check if we should wait or timeout
      if (!profileTimeout) {
        // Still waiting for profile, show loading
        return (
          <div className="min-h-screen bg-background flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-jw-blue mx-auto mb-4"></div>
              <p className="text-gray-600">Carregando perfil...</p>
            </div>
          </div>
        );
      } else {
        // Timeout reached, show redirect message
        return (
          <div className="min-h-screen bg-background flex items-center justify-center">
            <div className="text-center">
              <p className="text-gray-600">Redirecionando...</p>
            </div>
          </div>
        );
      }
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

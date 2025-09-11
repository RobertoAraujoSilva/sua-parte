import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Database } from '@/integrations/supabase/types';
import { supabase } from '@/integrations/supabase/client';

type UserRole = Database['public']['Enums']['user_role'];

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
  requireAuth?: boolean;
  redirectTo?: string;
}

// Elegant loading component
const LoadingScreen = ({ 
  message, 
  subMessage, 
  spinnerSize = "h-12 w-12" 
}: { 
  message: string; 
  subMessage?: string; 
  spinnerSize?: string;
}) => (
  <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
    <div className="text-center bg-white p-8 rounded-2xl shadow-lg border border-gray-200">
      <div className={`animate-spin rounded-full ${spinnerSize} border-4 border-blue-200 border-t-blue-600 mx-auto mb-6`}></div>
      <h2 className="text-xl font-semibold text-gray-800 mb-2">{message}</h2>
      {subMessage && (
        <p className="text-gray-600 text-sm">{subMessage}</p>
      )}
      <div className="mt-4 flex justify-center space-x-2">
        <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"></div>
        <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
        <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
      </div>
    </div>
  </div>
);

const ProtectedRoute = ({
  children,
  allowedRoles = ['instrutor', 'estudante'],
  requireAuth = true,
  redirectTo
}: ProtectedRouteProps) => {
  const { user, profile, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [profileTimeout, setProfileTimeout] = useState(false);
  const [accessCheckComplete, setAccessCheckComplete] = useState(false);
  const [didRedirect, setDidRedirect] = useState(false);

  // Set up profile timeout - reduced to 1 second for better UX
  useEffect(() => {
    if (user && !profile && !loading) {
      console.log('⏰ Setting profile timeout - will fallback to metadata in 1 second');
      const timeout = setTimeout(() => {
        console.log('⏰ Profile timeout reached, using metadata fallback');
        setProfileTimeout(true);
      }, 1000); // Reduced to 1 second for faster fallback

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
      redirectTo,
      userMetadata: user?.user_metadata
    });

    if (loading) {
      console.log('⏳ ProtectedRoute waiting for auth to load...');
      return;
    }

    // If authentication is required but user is not logged in
    if (requireAuth && !user) {
      console.log('🚫 ProtectedRoute: No user, redirecting to auth');
      if (!didRedirect && location.pathname !== '/auth') {
        setDidRedirect(true);
        navigate('/auth', { replace: true });
      }
      return;
    }

    // If user is logged in, check access
    if (user) {
      let userRole: UserRole | undefined;

      // Get role from profile if available, otherwise from user metadata
      if (profile) {
        userRole = profile.role as UserRole;
        console.log('✅ ProtectedRoute: Using profile role:', userRole);
      } else if (user.user_metadata?.role) {
        userRole = user.user_metadata?.role as UserRole;
        if (profileTimeout) {
          console.log('⚠️ ProtectedRoute: Using metadata role fallback:', userRole, '(profile loading timed out)');
        } else {
          console.log('🔄 ProtectedRoute: Using metadata role temporarily:', userRole, '(profile still loading)');
        }
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
            if (!didRedirect && location.pathname !== redirectTo) {
              setDidRedirect(true);
              navigate(redirectTo, { replace: true });
            }
          } else if (userRole === 'instrutor') {
            const onboardingCompleted = localStorage.getItem('onboarding_completed');
            const currentPath = location.pathname;
            const isOnboardingRoute = ['/bem-vindo', '/configuracao-inicial', '/primeiro-programa'].includes(currentPath);

            if (!onboardingCompleted && !isOnboardingRoute) {
              if (!didRedirect && currentPath !== '/bem-vindo') {
                setDidRedirect(true);
                navigate('/bem-vindo', { replace: true });
              }
            } else {
              if (!didRedirect && currentPath !== '/dashboard') {
                setDidRedirect(true);
                navigate('/dashboard', { replace: true });
              }
            }
          } else if (userRole === 'estudante') {
            const target = `/estudante/${user.id}`;
            if (!didRedirect && location.pathname !== target) {
              setDidRedirect(true);
              navigate(target, { replace: true });
            }
          } else if (userRole === 'family_member') {
            if (!didRedirect && location.pathname !== '/portal-familiar') {
              setDidRedirect(true);
              navigate('/portal-familiar', { replace: true });
            }
          } else {
            // Default fallback: admins -> /admin, others -> /auth
            const fallback = userRole === 'admin' ? '/admin' : '/auth';
            if (!didRedirect && location.pathname !== fallback) {
              setDidRedirect(true);
              navigate(fallback, { replace: true });
            }
          }
          return;
        } else {
          console.log('✅ ProtectedRoute: Access granted for role:', userRole);
          setAccessCheckComplete(true);

          // Additional check for instructors accessing main app without onboarding
          if (userRole === 'instrutor' && allowedRoles.includes('instrutor')) {
            const onboardingCompleted = localStorage.getItem('onboarding_completed');
            const currentPath = location.pathname;
            const isOnboardingRoute = ['/bem-vindo', '/configuracao-inicial', '/primeiro-programa'].includes(currentPath);
            const isMainAppRoute = ['/dashboard', '/estudantes', '/programas', '/designacoes'].includes(currentPath);

            if (!onboardingCompleted && isMainAppRoute) {
              console.log('🔄 Redirecting to onboarding for first-time user');
              if (!didRedirect && currentPath !== '/bem-vindo') {
                setDidRedirect(true);
                navigate('/bem-vindo', { replace: true });
              }
              return;
            }
          }
        }
      } else {
        // No role found - check if we should wait or timeout
        if (!profileTimeout) {
          console.log('⏳ ProtectedRoute: No role found, waiting for profile...');
          return;
        } else {
          console.log('❌ ProtectedRoute: Profile timeout reached, no role available, redirecting to auth');
          if (!didRedirect && location.pathname !== '/auth') {
            setDidRedirect(true);
            navigate('/auth', { replace: true });
          }
          return;
        }
      }
    }
  }, [user?.id, profile?.role, loading, allowedRoles, requireAuth, redirectTo, navigate, profileTimeout, location.pathname, didRedirect]);

  // Show loading state while auth is loading
  if (loading) {
    console.log('🔄 ProtectedRoute: Showing loading state');
    return (
      <LoadingScreen 
        message="Carregando Sistema Ministerial" 
        subMessage="Inicializando autenticação e permissões..."
      />
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
      userRole = profile.role as UserRole;
      console.log('✅ ProtectedRoute: Using profile role:', userRole);
    } else if (user.user_metadata?.role) {
      userRole = user.user_metadata?.role as UserRole;
      if (profileTimeout) {
        console.log('⚠️ ProtectedRoute: Using metadata role fallback:', userRole, '(profile loading timed out)');
      } else {
        console.log('🔄 ProtectedRoute: Using metadata role temporarily:', userRole, '(profile still loading)');
      }
    }

    if (!userRole) {
      // No role available - show appropriate loading state
      if (!profileTimeout) {
        // Still waiting for profile, show profile loading
        return (
          <LoadingScreen 
            message="Verificando Permissões" 
            subMessage="Carregando perfil do usuário..."
          />
        );
      } else {
        // Timeout reached, show redirect message
        return (
          <LoadingScreen 
            message="Redirecionando" 
            subMessage="Configurando acesso ao sistema..."
            spinnerSize="h-8 w-8"
          />
        );
      }
    }

    // Check if user's role is allowed
    if (!allowedRoles.includes(userRole)) {
      // Show loading while redirecting instead of "Acesso Negado"
      return (
        <LoadingScreen 
          message="Redirecionando" 
          subMessage="Direcionando para área apropriada..."
          spinnerSize="h-8 w-8"
        />
      );
    }
  }

  // Render children if all checks pass
  console.log('✅ ProtectedRoute: Rendering children - all checks passed');
  return <>{children}</>;
};

export default ProtectedRoute;

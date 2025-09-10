import React, { Suspense } from 'react';
import { useAuth } from "@/contexts/AuthContext";
import { GlobalDataProvider } from '@/contexts/GlobalDataContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, Users, UserCheck, Loader2 } from 'lucide-react';

// ==============================================================================
// 🎯 UNIFIED DASHBOARD - Dashboard Unificado que se Adapta ao Role
// ==============================================================================

// Lazy load dos dashboards específicos
const AdminDashboard = React.lazy(() => import('./dashboards/AdminDashboard'));
const InstructorDashboard = React.lazy(() => import('./dashboards/InstructorDashboard'));
const StudentDashboard = React.lazy(() => import('./dashboards/StudentDashboard'));

// Loading component com role-specific styling
const DashboardLoading = ({ role }: { role?: string }) => {
  const getIcon = () => {
    switch (role) {
      case 'admin':
        return <Shield className="h-8 w-8 text-primary animate-pulse" />;
      case 'instrutor':
        return <Users className="h-8 w-8 text-primary animate-pulse" />;
      case 'estudante':
        return <UserCheck className="h-8 w-8 text-primary animate-pulse" />;
      default:
        return <Loader2 className="h-8 w-8 text-primary animate-spin" />;
    }
  };

  const getMessage = () => {
    switch (role) {
      case 'admin':
        return 'Carregando Dashboard Administrativo...';
      case 'instrutor':
        return 'Carregando Dashboard do Instrutor...';
      case 'estudante':
        return 'Carregando Portal do Estudante...';
      default:
        return 'Carregando Sistema Ministerial...';
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <Card className="w-96">
        <CardContent className="flex flex-col items-center justify-center p-8">
          {getIcon()}
          <p className="text-muted-foreground mt-4 text-center">{getMessage()}</p>
          <div className="mt-4 flex gap-1">
            <div className="w-2 h-2 bg-primary rounded-full animate-bounce [animation-delay:-0.3s]"></div>
            <div className="w-2 h-2 bg-primary rounded-full animate-bounce [animation-delay:-0.15s]"></div>
            <div className="w-2 h-2 bg-primary rounded-full animate-bounce"></div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// Error boundary component
class DashboardErrorBoundary extends React.Component<
  { children: React.ReactNode; role?: string },
  { hasError: boolean; error?: Error }
> {
  constructor(props: { children: React.ReactNode; role?: string }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Dashboard error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-background">
          <Card className="w-96">
            <CardHeader>
              <CardTitle className="text-destructive flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Erro no Dashboard
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                Ocorreu um erro ao carregar o dashboard para o role: {this.props.role}
              </p>
              <p className="text-sm text-muted-foreground">
                {this.state.error?.message}
              </p>
              <button 
                className="mt-4 px-4 py-2 bg-primary text-primary-foreground rounded-md"
                onClick={() => window.location.reload()}
              >
                Recarregar Página
              </button>
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}

const UnifiedDashboard = () => {
  const { user, profile, loading } = useAuth();

  // Show loading state while authentication is being resolved
  if (loading || !user) {
    return <DashboardLoading />;
  }

  // Show loading state while profile is being resolved
  if (!profile) {
    return <DashboardLoading />;
  }

  // Render appropriate dashboard based on user role within GlobalDataProvider
  const renderDashboard = () => {
    switch (profile.role) {
      case 'admin':
        return (
          <DashboardErrorBoundary role="admin">
            <Suspense fallback={<DashboardLoading role="admin" />}>
              <AdminDashboard />
            </Suspense>
          </DashboardErrorBoundary>
        );
      
      case 'instrutor':
        return (
          <DashboardErrorBoundary role="instrutor">
            <Suspense fallback={<DashboardLoading role="instrutor" />}>
              <InstructorDashboard />
            </Suspense>
          </DashboardErrorBoundary>
        );
      
      case 'estudante':
        return (
          <DashboardErrorBoundary role="estudante">
            <Suspense fallback={<DashboardLoading role="estudante" />}>
              <StudentDashboard />
            </Suspense>
          </DashboardErrorBoundary>
        );
      
      default:
        return (
          <div className="min-h-screen flex items-center justify-center bg-background">
            <Card className="w-96">
              <CardHeader>
                <CardTitle className="text-destructive flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Role Não Reconhecido
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  Seu perfil possui um role que não é suportado pelo sistema: {profile.role}
                </p>
                <p className="text-sm text-muted-foreground">
                  Entre em contato com o administrador para resolver este problema.
                </p>
              </CardContent>
            </Card>
          </div>
        );
    }
  };

  return (
    <GlobalDataProvider>
      {renderDashboard()}
    </GlobalDataProvider>
  );
};

export default UnifiedDashboard;
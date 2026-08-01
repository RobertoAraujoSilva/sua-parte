import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/contexts/AuthContext';
import { useConnectProfile } from '@/hooks/useConnectProfile';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Link } from 'react-router-dom';

const CenteredCard: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <div className="min-h-[60vh] flex items-center justify-center px-4">
    <Card className="max-w-md w-full">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 text-sm text-muted-foreground">{children}</CardContent>
    </Card>
  </div>
);

interface ConnectRouteProps {
  children: React.ReactNode;
  requireModerator?: boolean;
}

const ConnectRoute: React.FC<ConnectRouteProps> = ({ children, requireModerator = false }) => {
  const { t } = useTranslation('connect');
  const { user, loading: authLoading } = useAuth();
  const { profile, isModerator, loading } = useConnectProfile();
  const location = useLocation();

  if (authLoading || loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="h-10 w-10 mx-auto rounded-full border-4 border-muted border-t-primary animate-spin" />
          <p className="text-sm text-muted-foreground">{t('guard.loading')}</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to={`/auth?next=${encodeURIComponent(location.pathname)}`} replace />;
  }

  if (requireModerator) {
    if (!isModerator) {
      return (
        <CenteredCard title={t('guard.notModerator')}>
          <Button asChild variant="outline">
            <Link to="/connect">{t('guard.backHome')}</Link>
          </Button>
        </CenteredCard>
      );
    }
    return <>{children}</>;
  }

  if (!profile || profile.status !== 'approved') {
    return <Navigate to="/connect" replace />;
  }

  return <>{children}</>;
};

export default ConnectRoute;

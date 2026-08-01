import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Heart, ShieldCheck, Clock, XCircle, Ban, CheckCircle2 } from 'lucide-react';
import ConnectLayout from '@/components/connect/ConnectLayout';
import { useConnectProfile } from '@/hooks/useConnectProfile';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';

const ConnectHome: React.FC = () => {
  const { t } = useTranslation('connect');
  const { profile, loading } = useConnectProfile();

  const statusBlock = () => {
    if (loading || !profile) return null;
    const map = {
      pending: { icon: Clock, text: t('home.statusPending') },
      rejected: { icon: XCircle, text: t('home.statusRejected') },
      suspended: { icon: Ban, text: t('home.statusSuspended') },
      approved: { icon: CheckCircle2, text: t('home.statusApproved') },
    } as const;
    const { icon: Icon, text } = map[profile.status];
    return (
      <Alert>
        <Icon className="h-4 w-4" />
        <AlertDescription className="space-y-2">
          <span className="block">{text}</span>
          {profile.status === 'rejected' && profile.rejection_reason && (
            <span className="block text-muted-foreground">{profile.rejection_reason}</span>
          )}
          {profile.status === 'approved' && (
            <Button asChild size="sm">
              <Link to="/connect/descobrir">{t('home.enter')}</Link>
            </Button>
          )}
        </AlertDescription>
      </Alert>
    );
  };

  return (
    <ConnectLayout>
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="text-center space-y-2">
          <Heart className="h-10 w-10 mx-auto text-primary" />
          <h1 className="text-3xl font-bold">{t('home.title')}</h1>
          <p className="text-muted-foreground">{t('home.subtitle')}</p>
        </div>

        {statusBlock()}

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">{t('home.purposeTitle')}</CardTitle>
            <CardDescription>{t('home.purpose')}</CardDescription>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-primary" />
              {t('home.conductTitle')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="list-disc pl-5 space-y-1.5 text-sm text-muted-foreground">
              <li>{t('home.conduct1')}</li>
              <li>{t('home.conduct2')}</li>
              <li>{t('home.conduct3')}</li>
              <li>{t('home.conduct4')}</li>
            </ul>
          </CardContent>
        </Card>

        {!loading && !profile && (
          <div className="text-center">
            <Button asChild size="lg">
              <Link to="/connect/solicitar">{t('home.cta')}</Link>
            </Button>
          </div>
        )}
      </div>
    </ConnectLayout>
  );
};

export default ConnectHome;

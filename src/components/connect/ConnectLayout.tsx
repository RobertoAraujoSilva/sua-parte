import React from 'react';
import { NavLink, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Heart, Compass, MessageCircle, UserRound, ShieldCheck, ArrowLeft } from 'lucide-react';
import LanguageSwitch from '@/components/LanguageSwitch';
import { useConnectProfile } from '@/hooks/useConnectProfile';
import { cn } from '@/lib/utils';

const ConnectLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { t } = useTranslation('connect');
  const { profile, isModerator } = useConnectProfile();
  const approved = profile?.status === 'approved';

  const links = [
    { to: '/connect', label: t('nav.home'), icon: Heart, show: true, end: true },
    { to: '/connect/descobrir', label: t('nav.discover'), icon: Compass, show: approved },
    { to: '/connect/matches', label: t('nav.matches'), icon: MessageCircle, show: approved },
    { to: '/connect/perfil', label: t('nav.profile'), icon: UserRound, show: approved },
    { to: '/connect/moderacao', label: t('nav.moderation'), icon: ShieldCheck, show: isModerator },
  ].filter((l) => l.show);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="border-b bg-card/60 backdrop-blur sticky top-0 z-40">
        <div className="container mx-auto px-4 h-14 flex items-center justify-between gap-4">
          <Link to="/connect" className="flex items-center gap-2 font-semibold">
            <Heart className="h-5 w-5 text-primary" />
            <span>{t('brand')}</span>
          </Link>
          <div className="flex items-center gap-1">
            <LanguageSwitch />
            <Link
              to="/dashboard"
              className="hidden sm:flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground px-2"
            >
              <ArrowLeft className="h-3 w-3" />
              Sistema Ministerial
            </Link>
          </div>
        </div>
        <nav className="container mx-auto px-2 pb-2 flex gap-1 overflow-x-auto">
          {links.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm whitespace-nowrap transition-colors',
                  isActive
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                )
              }
            >
              <Icon className="h-4 w-4" />
              {label}
            </NavLink>
          ))}
        </nav>
      </header>

      <main className="flex-1 container mx-auto px-4 py-6">{children}</main>

      <footer className="border-t py-4">
        <p className="container mx-auto px-4 text-xs text-muted-foreground text-center">
          {t('disclaimer')}
        </p>
      </footer>
    </div>
  );
};

export default ConnectLayout;

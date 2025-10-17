import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { 
  Home, 
  Users, 
  BookOpen, 
  Calendar, 
  BarChart3, 
  UserCheck,
  FileText
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import UnifiedNotifications from './UnifiedNotifications';

// 🎯 NAVEGAÇÃO UNIFICADA QUE ADAPTA AO ROLE
export default function UnifiedNavigation() {
  const { profile } = useAuth();
  const location = useLocation();

  // 🚨 SEM PERFIL = SEM NAVEGAÇÃO
  if (!profile) return null;

  // 👨‍🏫 NAVEGAÇÃO INSTRUTOR - GESTÃO LOCAL
  if (profile.role === 'instrutor') {
    const instructorNavItems = [
      { href: '/dashboard', label: 'Dashboard', icon: Home, exact: true },
      { href: '/estudantes', label: 'Estudantes', icon: Users },
      { href: '/designacoes', label: 'Designações', icon: Calendar },
      { href: '/relatorios', label: 'Relatórios', icon: BarChart3 },
      { href: '/reunioes', label: 'Reuniões', icon: Calendar }
    ];

    return (
      <nav className="flex items-center justify-between p-4 bg-background border-b">
        <div className="flex space-x-2">
          {instructorNavItems.map((item) => {
            const isActive = item.exact 
              ? location.pathname === item.href
              : location.pathname.startsWith(item.href);
            
            return (
              <Link key={item.href} to={item.href}>
                <Button
                  variant={isActive ? "default" : "ghost"}
                  size="sm"
                  className="flex items-center gap-2"
                >
                  <item.icon className="h-4 w-4" />
                  {item.label}
                </Button>
              </Link>
            );
          })}
        </div>
        <UnifiedNotifications />
      </nav>
    );
  }

  // 👨‍🎓 NAVEGAÇÃO ESTUDANTE - VISÃO INDIVIDUAL
  if (profile.role === 'estudante') {
    const studentNavItems = [
      { href: '/portal', label: 'Portal', icon: UserCheck, exact: true },
      { href: '/estudante/:id/familia', label: 'Família', icon: Users }
    ];

    return (
      <nav className="flex items-center justify-between p-4 bg-background border-b">
        <div className="flex space-x-2">
          {studentNavItems.map((item) => {
            const isActive = item.exact 
              ? location.pathname === item.href
              : location.pathname.startsWith(item.href);
            
            return (
              <Link key={item.href} to={item.href}>
                <Button
                  variant={isActive ? "default" : "ghost"}
                  size="sm"
                  className="flex items-center gap-2"
                >
                  <item.icon className="h-4 w-4" />
                  {item.label}
                </Button>
              </Link>
            );
          })}
        </div>
        <UnifiedNotifications />
      </nav>
    );
  }

  // 🚨 ROLE NÃO RECONHECIDO
  return (
    <nav className="flex space-x-2 p-4 bg-background border-b">
      <div className="text-sm text-muted-foreground">
        Role não reconhecido: {profile.role}
      </div>
    </nav>
  );
}

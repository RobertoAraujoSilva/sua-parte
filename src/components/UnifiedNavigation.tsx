import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import {
  Home,
  Users,
  BookOpen,
  Calendar,
  BarChart3,
  Settings,
  Shield,
  UserCheck,
  Globe,
  FileText,
  Activity,
  Cog,
  Database,
  Upload
} from 'lucide-react';
import { useUserRole } from '@/hooks/useUserRole';
import UnifiedNotifications from './UnifiedNotifications';

// 🎯 NAVEGAÇÃO UNIFICADA QUE ADAPTA AO ROLE
export default function UnifiedNavigation() {
  const { role, profile } = useUserRole();
  const location = useLocation();

  // 🚨 SEM PERFIL = SEM NAVEGAÇÃO
  if (!profile) return null;

  // 🏠 NAVEGAÇÃO ADMIN - CONTROLE GLOBAL
  if (role === 'admin') {
    const adminNavItems = [
      { href: '/admin', label: 'Dashboard', icon: Shield, exact: true },
      { href: '/admin/global', label: 'Programação Global', icon: Globe, exact: true },
      { href: '/admin/workbooks', label: 'Apostilas', icon: Upload },
      { href: '/admin/users', label: 'Usuários', icon: Users },
      { href: '/admin/congregations', label: 'Congregações', icon: Database },
      { href: '/admin/system', label: 'Sistema', icon: Cog },
      { href: '/admin/monitoring', label: 'Monitoramento', icon: Activity },
      { href: '/admin/developer', label: 'Developer', icon: Settings }
    ];

    return (
      <nav className="flex items-center justify-between p-4 bg-background border-b">
        <div className="flex space-x-2">
          {adminNavItems.map((item) => {
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

  // 👨‍🏫 NAVEGAÇÃO INSTRUTOR - GESTÃO LOCAL
  if (role === 'instrutor') {
    const instructorNavItems = [
      { href: '/dashboard', label: 'Dashboard', icon: Home, exact: true },
      { href: '/global-programming', label: 'Programação Global', icon: Globe },
      { href: '/estudantes', label: 'Estudantes', icon: Users },
      { href: '/programas', label: 'Programas', icon: BookOpen },
      { href: '/designacoes', label: 'Designações', icon: Calendar },
      { href: '/relatorios', label: 'Relatórios', icon: BarChart3 },
      { href: '/reunioes', label: 'Reuniões', icon: Calendar },
      { href: '/equidade', label: 'Equidade', icon: Activity }
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
  if (role === 'estudante') {
    const studentNavItems = [
      { href: `/estudante/${profile.id}`, label: 'Meu Dashboard', icon: UserCheck, exact: true },
      { href: `/estudante/${profile.id}/designacoes`, label: 'Minhas Designações', icon: Calendar },
      { href: `/estudante/${profile.id}/materiais`, label: 'Materiais', icon: BookOpen },
      { href: `/estudante/${profile.id}/familia`, label: 'Família', icon: Users },
      { href: `/estudante/${profile.id}/historico`, label: 'Histórico', icon: BarChart3 }
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
        Role não reconhecido: {role}
      </div>
    </nav>
  );
}

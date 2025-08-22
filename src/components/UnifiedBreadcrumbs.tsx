import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ChevronRight, Home, Shield, Users, UserCheck } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

// 🎯 BREADCRUMBS INTELIGENTES QUE ADAPTAM AO ROLE
export default function UnifiedBreadcrumbs() {
  const { profile } = useAuth();
  const location = useLocation();

  // 🚨 SEM PERFIL = SEM BREADCRUMBS
  if (!profile) return null;

  // 🏠 BREADCRUMBS ADMIN
  if (profile.role === 'admin') {
    const pathSegments = location.pathname.split('/').filter(Boolean);
    
    if (pathSegments.length === 0) return null;

    const breadcrumbItems = [
      { href: '/admin', label: 'Admin', icon: Shield }
    ];

    // Adicionar segmentos específicos do admin
    if (pathSegments[1]) {
      const segment = pathSegments[1];
      const label = segment.charAt(0).toUpperCase() + segment.slice(1);
      breadcrumbItems.push({ href: `/admin/${segment}`, label, icon: null });
    }

    return (
      <nav className="flex items-center space-x-1 text-sm text-muted-foreground mb-4">
        {breadcrumbItems.map((item, index) => (
          <React.Fragment key={item.href}>
            {index > 0 && <ChevronRight className="h-4 w-4" />}
            <Link
              to={item.href}
              className="flex items-center gap-1 hover:text-foreground transition-colors"
            >
              {item.icon && <item.icon className="h-4 w-4" />}
              {item.label}
            </Link>
          </React.Fragment>
        ))}
      </nav>
    );
  }

  // 👨‍🏫 BREADCRUMBS INSTRUTOR
  if (profile.role === 'instrutor') {
    const pathSegments = location.pathname.split('/').filter(Boolean);
    
    if (pathSegments.length === 0) return null;

    const breadcrumbItems = [
      { href: '/dashboard', label: 'Dashboard', icon: Home }
    ];

    // Adicionar segmentos específicos do instrutor
    if (pathSegments[1]) {
      const segment = pathSegments[1];
      const label = segment.charAt(0).toUpperCase() + segment.slice(1);
      breadcrumbItems.push({ href: `/${segment}`, label, icon: null });
    }

    return (
      <nav className="flex items-center space-x-1 text-sm text-muted-foreground mb-4">
        {breadcrumbItems.map((item, index) => (
          <React.Fragment key={item.href}>
            {index > 0 && <ChevronRight className="h-4 w-4" />}
            <Link
              to={item.href}
              className="flex items-center gap-1 hover:text-foreground transition-colors"
            >
              {item.icon && <item.icon className="h-4 w-4" />}
              {item.label}
            </Link>
          </React.Fragment>
        ))}
      </nav>
    );
  }

  // 👨‍🎓 BREADCRUMBS ESTUDANTE
  if (profile.role === 'estudante') {
    const pathSegments = location.pathname.split('/').filter(Boolean);
    
    if (pathSegments.length === 0) return null;

    const breadcrumbItems = [
      { href: `/estudante/${profile.id}`, label: 'Meu Dashboard', icon: UserCheck }
    ];

    // Adicionar segmentos específicos do estudante
    if (pathSegments[2]) {
      const segment = pathSegments[2];
      const label = segment.charAt(0).toUpperCase() + segment.slice(1);
      breadcrumbItems.push({ href: `/estudante/${profile.id}/${segment}`, label, icon: null });
    }

    return (
      <nav className="flex items-center space-x-1 text-sm text-muted-foreground mb-4">
        {breadcrumbItems.map((item, index) => (
          <React.Fragment key={item.href}>
            {index > 0 && <ChevronRight className="h-4 w-4" />}
            <Link
              to={item.href}
              className="flex items-center gap-1 hover:text-foreground transition-colors"
            >
              {item.icon && <item.icon className="h-4 w-4" />}
              {item.label}
            </Link>
          </React.Fragment>
        ))}
      </nav>
    );
  }

  // 🚨 ROLE NÃO RECONHECIDO
  return null;
}

import React, { ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import {
  Home,
  LayoutDashboard,
  Users,
  BookOpen,
  ClipboardList,
  BarChart2,
} from 'lucide-react';

// Sidebar navigation item type
interface NavItem {
  to: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

const NAV_ITEMS: NavItem[] = [
  { to: '/bem-vindo', label: 'Bem-vindo', icon: Home },
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/estudantes', label: 'Estudantes', icon: Users },
  { to: '/programas', label: 'Programas', icon: BookOpen },
  { to: '/designacoes', label: 'Designações', icon: ClipboardList },
  { to: '/relatorios', label: 'Relatórios', icon: BarChart2 },
];

export function SidebarNav() {
  const location = useLocation();
  const path = location.pathname;

  return (
    <aside className="hidden md:flex md:flex-col w-64 border-r bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/60">
      <div className="px-5 py-4 border-b">
        <div className="flex items-center gap-2 text-jw-blue-600">
          <ClipboardList className="h-5 w-5" />
          <span className="font-semibold">Sistema Ministerial</span>
        </div>
      </div>
      <nav className="flex-1 p-3 space-y-1">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const active = path === item.to;
          return (
            <Link
              key={item.to}
              to={item.to}
              className={cn(
                'flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors',
                active
                  ? 'bg-blue-50 text-blue-700 border border-blue-200'
                  : 'text-gray-700 hover:bg-gray-50'
              )}
            >
              <Icon className={cn('h-4 w-4', active ? 'text-blue-700' : 'text-gray-500')} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
      <div className="p-4 border-t text-xs text-gray-500">
        <div>JW-style UI • S-38-T</div>
        <div>v2 • Unified Shell</div>
      </div>
    </aside>
  );
}

interface LayoutShellProps {
  children: ReactNode;
}

/**
 * LayoutShell: fixed sidebar + scrollable content area.
 * Apply this shell to keep consistent layout across all pages.
 */
export default function LayoutShell({ children }: LayoutShellProps) {
  return (
    <div className="min-h-screen w-full bg-gray-50 text-gray-900">
      <div className="flex w-full min-h-screen">
        <SidebarNav />
        <main className="flex-1 min-w-0">
          {/* Content container */}
          <div className="max-w-7xl mx-auto p-4 md:p-6 lg:p-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}

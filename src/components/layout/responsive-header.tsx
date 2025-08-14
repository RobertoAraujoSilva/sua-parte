import React from 'react';
import { Button } from '@/components/ui/button';
import { useResponsive } from '@/hooks/use-responsive';
import { useDensity as useContextDensity } from '@/contexts/DensityContext';
import { useDensity, useResponsiveText } from '@/components/ui/density-provider';
import { ResponsiveContainer } from './responsive-container';
import { Menu, User } from 'lucide-react';

interface ResponsiveHeaderProps {
  title?: string;
  user?: {
    name: string;
    role: string;
  };
  onMenuClick?: () => void;
  className?: string;
}

export function ResponsiveHeader({ 
  title = "Sistema Ministerial",
  user,
  onMenuClick,
  className = ''
}: ResponsiveHeaderProps) {
  const { isMobile, isTablet } = useResponsive();
  
  // Try to use new density context first, fallback to old provider
  let densityConfig;
  try {
    densityConfig = useContextDensity();
  } catch {
    densityConfig = useDensity();
  }
  
  const { headerHeight, buttonSize, spacing } = densityConfig;
  const textClasses = useResponsiveText();

  const spacingClass = spacing === 'tight' ? 'gap-2' : spacing === 'normal' ? 'gap-4' : 'gap-6';

  return (
    <header className={`
      sticky top-0 z-50 bg-background border-b
      ${headerHeight}
      ${className}
    `.trim()}>
      <ResponsiveContainer maxWidth="full" padding="sm">
        <div className={`
          flex items-center justify-between h-full
          ${spacingClass}
        `}>
          {/* Left section - Logo/Brand + Mobile Menu */}
          <div className="flex items-center gap-3">
            {isMobile && (
              <Button
                variant="ghost"
                size={buttonSize}
                onClick={onMenuClick}
                className="p-2"
              >
                <Menu className="h-4 w-4" />
              </Button>
            )}
            
            <div className="flex items-center gap-2">
              <h1 className={`
                font-bold text-jw-navy
                ${textClasses.heading}
              `}>
                {isMobile ? 'SM' : title}
              </h1>
            </div>
          </div>

          {/* Center section - Navigation (hidden on mobile) */}
          {!isMobile && (
            <nav className={`
              flex items-center
              ${spacingClass}
            `}>
              <Button variant="ghost" size={buttonSize}>
                Dashboard
              </Button>
              <Button variant="ghost" size={buttonSize}>
                Estudantes
              </Button>
              <Button variant="ghost" size={buttonSize}>
                Programas
              </Button>
              <Button variant="ghost" size={buttonSize}>
                Designações
              </Button>
              {!isTablet && (
                <Button variant="ghost" size={buttonSize}>
                  Relatórios
                </Button>
              )}
            </nav>
          )}

          {/* Right section - User Menu */}
          <div className="flex items-center gap-2">
            {user && !isMobile && (
              <div className="text-right mr-2">
                <div className={textClasses.caption}>
                  {user.name}
                </div>
                <div className={`${textClasses.caption} text-xs`}>
                  {user.role}
                </div>
              </div>
            )}
            
            <Button variant="outline" size={buttonSize}>
              {isMobile ? (
                <User className="h-4 w-4" />
              ) : (
                user ? user.name.split(' ')[0] : 'Usuário'
              )}
            </Button>
          </div>
        </div>
      </ResponsiveContainer>
    </header>
  );
}

// Specialized header for different page types
export function PageHeader({ 
  title, 
  subtitle, 
  actions,
  breadcrumbs,
  className = ''
}: {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
  breadcrumbs?: React.ReactNode;
  className?: string;
}) {
  const { isMobile } = useResponsive();
  
  // Try to use new density context first, fallback to old provider
  let densityConfig;
  try {
    densityConfig = useContextDensity();
  } catch {
    densityConfig = useDensity();
  }
  
  const { spacing } = densityConfig;
  const textClasses = useResponsiveText();

  return (
    <div className={`
      bg-gradient-to-br from-jw-navy via-jw-blue to-jw-blue-dark
      py-6 md:py-8 lg:py-12
      ${className}
    `.trim()}>
      <ResponsiveContainer maxWidth="2xl">
        <div className={`
          flex flex-col gap-4
          ${spacing === 'tight' ? 'gap-2' : spacing === 'normal' ? 'gap-4' : 'gap-6'}
        `}>
          {breadcrumbs && !isMobile && (
            <div className="text-white/80">
              {breadcrumbs}
            </div>
          )}
          
          <div className="text-white">
            <h1 className={`
              font-bold mb-2 text-white
              ${isMobile ? 'text-2xl' : 'text-3xl lg:text-4xl'}
            `}>
              {title}
            </h1>
            {subtitle && (
              <p className={`
                opacity-90 max-w-3xl
                ${textClasses.body}
              `}>
                {subtitle}
              </p>
            )}
          </div>

          {actions && (
            <div className="flex flex-wrap gap-2">
              {actions}
            </div>
          )}
        </div>
      </ResponsiveContainer>
    </div>
  );
}
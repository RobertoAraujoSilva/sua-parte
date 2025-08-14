import React from 'react';
import { useResponsive } from '@/hooks/use-responsive';
import { useDensity } from '@/contexts/DensityContext';
import { ResponsiveContainer } from './responsive-container';
import PageShell from './PageShell';

/**
 * Integration layer between PageShell and existing responsive components
 * Ensures backward compatibility while leveraging new layout system
 */

interface ResponsivePageShellProps {
  title?: string;
  hero?: boolean;
  toolbar?: React.ReactNode;
  actions?: React.ReactNode; // Legacy support
  children: React.ReactNode;
  className?: string;
  // Responsive container options
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | 'full';
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

/**
 * Enhanced PageShell that integrates with existing responsive system
 * Automatically wraps content in ResponsiveContainer when needed
 */
export function ResponsivePageShell({
  title,
  hero = false,
  toolbar,
  actions,
  children,
  className,
  maxWidth = '2xl',
  padding = 'md'
}: ResponsivePageShellProps) {
  const { currentBreakpoint } = useResponsive();
  const { density } = useDensity();

  // Apply density data attribute to PageShell
  React.useEffect(() => {
    document.documentElement.setAttribute('data-density', density);
  }, [density]);

  return (
    <PageShell
      title={title}
      hero={hero}
      toolbar={toolbar}
      actions={actions}
      className={className}
    >
      <ResponsiveContainer 
        maxWidth={maxWidth} 
        padding={padding}
        className="h-full"
      >
        {children}
      </ResponsiveContainer>
    </PageShell>
  );
}

/**
 * Enhanced responsive table wrapper that integrates with PageShell
 * Uses CSS variables from page-shell.css for height calculations
 */
interface ResponsiveTableShellProps {
  children: React.ReactNode;
  className?: string;
  density?: 'compact' | 'comfortable';
}

export function ResponsiveTableShell({
  children,
  className = '',
  density
}: ResponsiveTableShellProps) {
  const { density: contextDensity } = useDensity();
  const finalDensity = density || contextDensity;

  return (
    <div 
      className={`responsive-table-container ${className}`}
      data-density={finalDensity}
    >
      {children}
    </div>
  );
}

/**
 * Adaptive grid that works with PageShell layout system
 * Integrates with CSS variables for consistent spacing
 */
interface AdaptiveGridShellProps {
  children: React.ReactNode;
  minItemWidth?: number;
  maxColumns?: number;
  className?: string;
}

export function AdaptiveGridShell({
  children,
  minItemWidth = 300,
  maxColumns,
  className = ''
}: AdaptiveGridShellProps) {
  const { currentBreakpoint } = useResponsive();
  const { density } = useDensity();

  // Calculate columns based on breakpoint and density
  const getColumns = () => {
    const baseColumns = {
      mobile: 1,
      tablet: 2,
      desktop: 3,
      large: 4
    }[currentBreakpoint];

    // Adjust for density
    const densityMultiplier = density === 'compact' ? 1.2 : density === 'comfortable' ? 1 : 0.8;
    const adjustedColumns = Math.floor(baseColumns * densityMultiplier);
    
    return maxColumns ? Math.min(adjustedColumns, maxColumns) : adjustedColumns;
  };

  const columns = getColumns();

  return (
    <div 
      className={`adaptive-grid ${className}`}
      style={{
        '--min-item-width': `${minItemWidth}px`,
        gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`,
        gap: 'var(--content-gap)'
      } as React.CSSProperties}
    >
      {children}
    </div>
  );
}

/**
 * Responsive header that integrates with PageShell
 * Uses CSS variables for consistent heights and spacing
 */
interface ResponsiveHeaderShellProps {
  title?: string;
  subtitle?: string;
  actions?: React.ReactNode;
  breadcrumbs?: React.ReactNode;
  className?: string;
}

export function ResponsiveHeaderShell({
  title,
  subtitle,
  actions,
  breadcrumbs,
  className = ''
}: ResponsiveHeaderShellProps) {
  const { isMobile } = useResponsive();
  const { density } = useDensity();

  return (
    <div 
      className={`
        bg-gradient-to-br from-jw-navy via-jw-blue to-jw-blue-dark
        text-white
        ${className}
      `.trim()}
      style={{
        height: 'var(--hero-h)',
        padding: '0 var(--shell-gutter)'
      }}
    >
      <div className="h-full flex flex-col justify-center gap-2">
        {breadcrumbs && !isMobile && (
          <div className="text-white/80 text-sm">
            {breadcrumbs}
          </div>
        )}
        
        {title && (
          <h1 className={`
            font-bold text-white
            ${isMobile ? 'text-xl' : 'text-2xl lg:text-3xl'}
          `}>
            {title}
          </h1>
        )}
        
        {subtitle && (
          <p className="text-white/90 text-sm lg:text-base max-w-3xl">
            {subtitle}
          </p>
        )}

        {actions && (
          <div className="flex flex-wrap gap-2 mt-2">
            {actions}
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * Hook for getting integrated responsive classes
 * Combines PageShell CSS variables with responsive breakpoints
 */
export function useResponsiveShell() {
  const { currentBreakpoint, isMobile, isTablet, isDesktop, isLarge } = useResponsive();
  const { density } = useDensity();

  const getContainerClasses = (maxWidth: string = '2xl') => {
    if (maxWidth === 'full') {
      return 'w-full';
    }
    
    return `fluid-width max-w-${maxWidth}`;
  };

  const getTableClasses = () => {
    return `responsive-table-container density-table`;
  };

  const getToolbarClasses = () => {
    return `intelligent-toolbar__grid`;
  };

  const getGridClasses = (columns?: number) => {
    const baseClass = 'adaptive-grid';
    const columnClass = columns ? `grid-cols-${columns}` : 'grid-responsive-auto';
    return `${baseClass} ${columnClass}`;
  };

  return {
    currentBreakpoint,
    isMobile,
    isTablet,
    isDesktop,
    isLarge,
    density,
    getContainerClasses,
    getTableClasses,
    getToolbarClasses,
    getGridClasses
  };
}

/**
 * Compatibility wrapper for existing responsive components
 * Ensures they work with PageShell without breaking changes
 */
export function withResponsiveShell<T extends object>(
  Component: React.ComponentType<T>
) {
  return React.forwardRef<any, T>((props, ref) => {
    const { density } = useDensity();
    
    // Apply density context to component
    React.useEffect(() => {
      if (ref && typeof ref === 'object' && ref.current) {
        ref.current.setAttribute('data-density', density);
      }
    }, [density, ref]);

    return <Component {...props} ref={ref} />;
  });
}
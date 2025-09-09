import { PropsWithChildren, useEffect } from "react";
import clsx from "clsx";
import { useResponsive } from "@/hooks/use-responsive";
import { useDensity } from "@/contexts/DensityContext";

interface PageShellProps {
  title?: string;
  hero?: boolean;           // true = hero normal, false = compacto
  actions?: React.ReactNode; // toolbar content (legacy support)
  toolbar?: React.ReactNode; // new intelligent toolbar content
  idToolbar?: string;       // para cálculos de altura
  className?: string;
  // Integration with existing responsive system
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | 'full';
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

export function PageShell({
  title,
  hero = false,
  actions,
  toolbar,
  idToolbar = "page-toolbar",
  className,
  maxWidth = '2xl',
  padding = 'md',
  children
}: PropsWithChildren<PageShellProps>) {
  const { currentBreakpoint } = useResponsive();
  const { density } = useDensity();

  // Apply density data attribute to document root for CSS variables
  useEffect(() => {
    document.documentElement.setAttribute('data-density', density);
  }, [density]);

  // Get responsive container classes
  const getContainerClasses = () => {
    if (maxWidth === 'full') {
      return 'w-full';
    }

    const widthMap = {
      mobile: 'w-full px-4',
      tablet: `w-[85%] max-w-screen-${maxWidth} mx-auto`,
      desktop: `w-[92%] max-w-screen-${maxWidth} mx-auto`,
      large: `w-[95%] max-w-screen-${maxWidth} mx-auto`
    };

    return widthMap[currentBreakpoint] || `w-[95%] max-w-screen-${maxWidth} mx-auto`;
  };

  const getPaddingClasses = () => {
    if (padding === 'none') return '';

    const paddingMap = {
      mobile: {
        'sm': 'px-3 py-2',
        'md': 'px-4 py-3',
        'lg': 'px-6 py-4'
      },
      tablet: {
        'sm': 'px-4 py-3',
        'md': 'px-6 py-4',
        'lg': 'px-8 py-6'
      },
      desktop: {
        'sm': 'px-6 py-4',
        'md': 'px-8 py-6',
        'lg': 'px-12 py-8'
      },
      large: {
        'sm': 'px-8 py-6',
        'md': 'px-12 py-8',
        'lg': 'px-16 py-10'
      }
    };

    return paddingMap[currentBreakpoint]?.[padding] || paddingMap.desktop[padding];
  };
  return (
    <div className="page-shell">
      {/* Header with conditional hero height */}
      <header 
        className={clsx(
          "page-shell__header",
          hero ? "page-shell__header--normal" : "page-shell__header--compact",
          "bg-gradient-to-r from-jw-navy to-jw-blue text-white flex items-center"
        )}
      >
        <div className="fluid-width" style={{ padding: "0 var(--shell-gutter)" }}>
          {title && (
            <h1 className={clsx(
              hero ? "text-3xl md:text-4xl" : "text-xl md:text-2xl", 
              "font-bold text-white"
            )}>
              {title}
            </h1>
          )}
        </div>
      </header>

      {/* Sticky toolbar with backdrop-blur and z-index management */}
      {(toolbar || actions) && (
        <div
          id={idToolbar}
          className="page-shell__toolbar"
        >
          {toolbar ? (
            // New intelligent toolbar content
            <div className="intelligent-toolbar__grid">
              {toolbar}
            </div>
          ) : (
            // Legacy toolbar grid support
            <div className="toolbar-grid">
              {actions}
            </div>
          )}
        </div>
      )}

      {/* Main area with flex-1 to occupy remaining viewport height */}
      <main className={clsx("page-shell__main", className)}>
        <div className={clsx(getContainerClasses(), getPaddingClasses())}>
          {children}
        </div>
      </main>

      {/* Non-sticky footer positioned after content area */}
      <footer className="page-shell__footer border-t bg-muted/30 flex items-center justify-center">
        <div className="fluid-width text-center text-sm text-muted-foreground">
          © 2024 Sistema Ministerial. Desenvolvido para servir às congregações.
        </div>
      </footer>
    </div>
  );
}


// Default export for backward compatibility
export default PageShell;
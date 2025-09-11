/**
 * Responsive Integration Components
 * 
 * Components and utilities for handling responsive design integration,
 * device detection, and adaptive layout management.
 */

import React from 'react';
import { useDensity } from '@/contexts/DensityContext';

// Device type detection utilities
export const getDeviceType = (): 'mobile' | 'tablet' | 'desktop' => {
  if (typeof window === 'undefined') return 'desktop';
  
  const width = window.innerWidth;
  
  if (width < 768) return 'mobile';
  if (width < 1024) return 'tablet';
  return 'desktop';
};

// Breakpoint utilities
export const breakpoints = {
  mobile: '(max-width: 767px)',
  tablet: '(min-width: 768px) and (max-width: 1023px)',
  desktop: '(min-width: 1024px)',
  touch: '(pointer: coarse)',
  hover: '(hover: hover)',
} as const;

// Media query hook
export const useMediaQuery = (query: string): boolean => {
  const [matches, setMatches] = React.useState(false);

  React.useEffect(() => {
    const mediaQuery = window.matchMedia(query);
    setMatches(mediaQuery.matches);

    const handler = (event: MediaQueryListEvent) => {
      setMatches(event.matches);
    };

    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, [query]);

  return matches;
};

// Device detection hooks
export const useIsMobile = () => useMediaQuery(breakpoints.mobile);
export const useIsTablet = () => useMediaQuery(breakpoints.tablet);
export const useIsDesktop = () => useMediaQuery(breakpoints.desktop);
export const useTouchDevice = () => useMediaQuery(breakpoints.touch);
export const useHoverCapable = () => useMediaQuery(breakpoints.hover);

// Container query component
interface ResponsiveContainerProps {
  children: React.ReactNode;
  className?: string;
  breakpoint?: keyof typeof breakpoints;
}

export const ResponsiveContainer: React.FC<ResponsiveContainerProps> = ({
  children,
  className = '',
  breakpoint = 'mobile'
}) => {
  const matches = useMediaQuery(breakpoints[breakpoint]);
  
  return (
    <div 
      className={`responsive-container ${className}`}
      data-breakpoint={breakpoint}
      data-matches={matches}
    >
      {children}
    </div>
  );
};

// Adaptive component wrapper
interface AdaptiveWrapperProps {
  mobile?: React.ReactNode;
  tablet?: React.ReactNode;
  desktop?: React.ReactNode;
  fallback?: React.ReactNode;
}

export const AdaptiveWrapper: React.FC<AdaptiveWrapperProps> = ({
  mobile,
  tablet,
  desktop,
  fallback
}) => {
  const isMobile = useIsMobile();
  const isTablet = useIsTablet();
  const isDesktop = useIsDesktop();

  if (isMobile && mobile) return <>{mobile}</>;
  if (isTablet && tablet) return <>{tablet}</>;
  if (isDesktop && desktop) return <>{desktop}</>;
  
  return <>{fallback}</>;
};

// Layout shift detection
export const useLayoutShift = () => {
  const [shifts, setShifts] = React.useState<number>(0);
  const [totalShift, setTotalShift] = React.useState<number>(0);

  React.useEffect(() => {
    if (!('PerformanceObserver' in window)) return;

    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.entryType === 'layout-shift' && !(entry as any).hadRecentInput) {
          setShifts(prev => prev + 1);
          setTotalShift(prev => prev + (entry as any).value);
        }
      }
    });

    observer.observe({ entryTypes: ['layout-shift'] });
    
    return () => observer.disconnect();
  }, []);

  return { shifts, totalShift };
};

// Intersection observer hook
export const useIntersection = (
  ref: React.RefObject<HTMLElement>,
  options?: IntersectionObserverInit
) => {
  const [isIntersecting, setIntersecting] = React.useState(false);

  React.useEffect(() => {
    if (!ref.current) return;

    const observer = new IntersectionObserver(
      ([entry]) => setIntersecting(entry.isIntersecting),
      options
    );

    observer.observe(ref.current);
    
    return () => observer.disconnect();
  }, [ref, options]);

  return isIntersecting;
};

// Responsive image component
interface ResponsiveImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  mobileSrc?: string;
  tabletSrc?: string;
  desktopSrc?: string;
  fallbackSrc: string;
}

export const ResponsiveImage: React.FC<ResponsiveImageProps> = ({
  mobileSrc,
  tabletSrc, 
  desktopSrc,
  fallbackSrc,
  ...props
}) => {
  const isMobile = useIsMobile();
  const isTablet = useIsTablet();
  
  const getSrc = () => {
    if (isMobile && mobileSrc) return mobileSrc;
    if (isTablet && tabletSrc) return tabletSrc;
    if (desktopSrc) return desktopSrc;
    return fallbackSrc;
  };

  return <img {...props} src={getSrc()} />;
};

// Viewport size hook
export const useViewportSize = () => {
  const [size, setSize] = React.useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 0,
    height: typeof window !== 'undefined' ? window.innerHeight : 0,
  });

  React.useEffect(() => {
    const updateSize = () => {
      setSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    window.addEventListener('resize', updateSize);
    updateSize();
    
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  return size;
};

// Safe area detection (for mobile notches, etc.)
export const useSafeArea = () => {
  const [safeArea, setSafeArea] = React.useState({
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
  });

  React.useEffect(() => {
    const updateSafeArea = () => {
      const root = document.documentElement;
      setSafeArea({
        top: parseInt(getComputedStyle(root).getPropertyValue('--safe-area-inset-top') || '0'),
        right: parseInt(getComputedStyle(root).getPropertyValue('--safe-area-inset-right') || '0'),
        bottom: parseInt(getComputedStyle(root).getPropertyValue('--safe-area-inset-bottom') || '0'),
        left: parseInt(getComputedStyle(root).getPropertyValue('--safe-area-inset-left') || '0'),
      });
    };

    updateSafeArea();
    window.addEventListener('resize', updateSafeArea);
    
    return () => window.removeEventListener('resize', updateSafeArea);
  }, []);

  return safeArea;
};

// Orientation detection
export const useOrientation = () => {
  const [orientation, setOrientation] = React.useState<'portrait' | 'landscape'>('portrait');

  React.useEffect(() => {
    const updateOrientation = () => {
      setOrientation(window.innerHeight > window.innerWidth ? 'portrait' : 'landscape');
    };

    updateOrientation();
    window.addEventListener('resize', updateOrientation);
    
    return () => window.removeEventListener('resize', updateOrientation);
  }, []);

  return orientation;
};

// Network status detection
export const useNetworkStatus = () => {
  const [isOnline, setIsOnline] = React.useState(navigator.onLine);
  const [connection, setConnection] = React.useState<any>(null);

  React.useEffect(() => {
    const updateOnlineStatus = () => setIsOnline(navigator.onLine);
    
    window.addEventListener('online', updateOnlineStatus);
    window.addEventListener('offline', updateOnlineStatus);

    // Network Information API (experimental)
    if ('connection' in navigator) {
      const conn = (navigator as any).connection;
      setConnection({
        effectiveType: conn.effectiveType,
        downlink: conn.downlink,
        rtt: conn.rtt,
        saveData: conn.saveData,
      });

      const updateConnection = () => {
        setConnection({
          effectiveType: conn.effectiveType,
          downlink: conn.downlink,
          rtt: conn.rtt,
          saveData: conn.saveData,
        });
      };

      conn.addEventListener('change', updateConnection);
      
      return () => {
        window.removeEventListener('online', updateOnlineStatus);
        window.removeEventListener('offline', updateOnlineStatus);
        conn.removeEventListener('change', updateConnection);
      };
    }

    return () => {
      window.removeEventListener('online', updateOnlineStatus);
      window.removeEventListener('offline', updateOnlineStatus);
    };
  }, []);

  return { isOnline, connection };
};

// Density-aware component wrapper
export function withDensity<T extends object>(
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

    return React.createElement(Component, { ...(props as any), ref });
  });
}
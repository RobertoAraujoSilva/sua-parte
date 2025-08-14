import { useState, useEffect, useCallback } from 'react';

interface BreakpointState {
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  isLarge: boolean;
  currentBreakpoint: 'mobile' | 'tablet' | 'desktop' | 'large';
  width: number;
  height: number;
}

const BREAKPOINTS = {
  mobile: 768,
  tablet: 1024,
  desktop: 1536,
  large: 1920
} as const;

export function useResponsive(): BreakpointState {
  const [state, setState] = useState<BreakpointState>(() => {
    // Initialize with safe defaults for SSR
    if (typeof window === 'undefined') {
      return {
        isMobile: false,
        isTablet: false,
        isDesktop: true,
        isLarge: false,
        currentBreakpoint: 'desktop',
        width: 1024,
        height: 768
      };
    }

    const width = window.innerWidth;
    const height = window.innerHeight;
    
    const isMobile = width < BREAKPOINTS.mobile;
    const isTablet = width >= BREAKPOINTS.mobile && width < BREAKPOINTS.tablet;
    const isDesktop = width >= BREAKPOINTS.tablet && width < BREAKPOINTS.desktop;
    const isLarge = width >= BREAKPOINTS.desktop;
    
    const currentBreakpoint = 
      isMobile ? 'mobile' :
      isTablet ? 'tablet' :
      isDesktop ? 'desktop' : 'large';

    return {
      isMobile,
      isTablet,
      isDesktop,
      isLarge,
      currentBreakpoint,
      width,
      height
    };
  });

  const updateState = useCallback(() => {
    if (typeof window === 'undefined') return;

    const width = window.innerWidth;
    const height = window.innerHeight;
    
    const isMobile = width < BREAKPOINTS.mobile;
    const isTablet = width >= BREAKPOINTS.mobile && width < BREAKPOINTS.tablet;
    const isDesktop = width >= BREAKPOINTS.tablet && width < BREAKPOINTS.desktop;
    const isLarge = width >= BREAKPOINTS.desktop;
    
    const currentBreakpoint = 
      isMobile ? 'mobile' :
      isTablet ? 'tablet' :
      isDesktop ? 'desktop' : 'large';

    setState(prev => {
      // Only update if values actually changed to prevent unnecessary re-renders
      if (
        prev.width === width &&
        prev.height === height &&
        prev.currentBreakpoint === currentBreakpoint
      ) {
        return prev;
      }

      return {
        isMobile,
        isTablet,
        isDesktop,
        isLarge,
        currentBreakpoint,
        width,
        height
      };
    });
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Debounce resize events to improve performance
    let timeoutId: NodeJS.Timeout;
    
    const debouncedUpdate = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(updateState, 150);
    };

    // Initial update
    updateState();

    window.addEventListener('resize', debouncedUpdate);
    
    return () => {
      window.removeEventListener('resize', debouncedUpdate);
      clearTimeout(timeoutId);
    };
  }, [updateState]);

  return state;
}

// Hook for getting container width based on breakpoint
export function useContainerWidth(): string {
  const { currentBreakpoint } = useResponsive();
  
  const widthMap = {
    mobile: 'w-full px-4',
    tablet: 'w-[85%] mx-auto',
    desktop: 'w-[92%] mx-auto',
    large: 'w-[95%] mx-auto'
  };

  return widthMap[currentBreakpoint];
}

// Hook for getting grid columns based on breakpoint
export function useGridColumns(minItemWidth: number = 300): number {
  const { width, currentBreakpoint } = useResponsive();
  
  if (currentBreakpoint === 'mobile') return Math.max(1, Math.floor(width / minItemWidth));
  if (currentBreakpoint === 'tablet') return Math.max(2, Math.floor(width * 0.85 / minItemWidth));
  if (currentBreakpoint === 'desktop') return Math.max(3, Math.floor(width * 0.92 / minItemWidth));
  return Math.max(4, Math.floor(width * 0.95 / minItemWidth));
}
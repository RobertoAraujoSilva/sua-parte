import { useState, useEffect } from 'react';

interface ScreenInfo {
  width: number;
  height: number;
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  isPortrait: boolean;
  isLandscape: boolean;
  isTabletPortrait: boolean;
}

export const useResponsive = (): ScreenInfo => {
  const [screenInfo, setScreenInfo] = useState<ScreenInfo>(() => {
    if (typeof window === 'undefined') {
      return {
        width: 0,
        height: 0,
        isMobile: false,
        isTablet: false,
        isDesktop: false,
        isPortrait: false,
        isLandscape: false,
        isTabletPortrait: false,
      };
    }

    const width = window.innerWidth;
    const height = window.innerHeight;
    const isPortrait = height > width;
    const isLandscape = width > height;
    const isMobile = width < 768;
    const isTablet = width >= 768 && width < 1024;
    const isDesktop = width >= 1024;
    const isTabletPortrait = isTablet && isPortrait;

    return {
      width,
      height,
      isMobile,
      isTablet,
      isDesktop,
      isPortrait,
      isLandscape,
      isTabletPortrait,
    };
  });

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      const isPortrait = height > width;
      const isLandscape = width > height;
      const isMobile = width < 768;
      const isTablet = width >= 768 && width < 1024;
      const isDesktop = width >= 1024;
      const isTabletPortrait = isTablet && isPortrait;

      setScreenInfo({
        width,
        height,
        isMobile,
        isTablet,
        isDesktop,
        isPortrait,
        isLandscape,
        isTabletPortrait,
      });
    };

    // Debounce resize events
    let timeoutId: NodeJS.Timeout;
    const debouncedHandleResize = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(handleResize, 150);
    };

    window.addEventListener('resize', debouncedHandleResize);
    window.addEventListener('orientationchange', debouncedHandleResize);

    return () => {
      window.removeEventListener('resize', debouncedHandleResize);
      window.removeEventListener('orientationchange', debouncedHandleResize);
      clearTimeout(timeoutId);
    };
  }, []);

  return screenInfo;
};
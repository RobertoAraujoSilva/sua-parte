import { useState, useEffect, useCallback, useMemo } from 'react';
import { useResponsive } from '@/hooks/use-responsive';

export type DensityMode = 'compact' | 'comfortable';

interface UseResponsiveTableOptions {
  defaultDensity?: DensityMode;
  persistDensity?: boolean;
  storageKey?: string;
}

interface UseResponsiveTableReturn {
  density: DensityMode;
  setDensity: (density: DensityMode) => void;
  toggleDensity: () => void;
  tableHeight: string;
  isCompact: boolean;
  isComfortable: boolean;
  getRowHeight: () => string;
  getCellPadding: () => string;
  getTableStyles: () => React.CSSProperties;
}

/**
 * Hook for managing responsive table state and calculations
 * 
 * Features:
 * - Density mode management (compact/comfortable)
 * - Height calculations using CSS variables
 * - Responsive breakpoint awareness
 * - Local storage persistence
 * - CSS variable integration
 */
export function useResponsiveTable(options: UseResponsiveTableOptions = {}): UseResponsiveTableReturn {
  const {
    defaultDensity = 'comfortable',
    persistDensity = true,
    storageKey = 'responsive-table-density'
  } = options;

  const { isMobile, isTablet, isDesktop } = useResponsive();

  // Initialize density state
  const [density, setDensityState] = useState<DensityMode>(() => {
    if (persistDensity && typeof window !== 'undefined') {
      const stored = localStorage.getItem(storageKey);
      return (stored as DensityMode) || defaultDensity;
    }
    return defaultDensity;
  });

  // Persist density changes
  useEffect(() => {
    if (persistDensity && typeof window !== 'undefined') {
      localStorage.setItem(storageKey, density);
    }
  }, [density, persistDensity, storageKey]);

  // Set density with persistence
  const setDensity = useCallback((newDensity: DensityMode) => {
    setDensityState(newDensity);
    
    // Apply to document root for CSS variable access
    if (typeof document !== 'undefined') {
      document.documentElement.setAttribute('data-density', newDensity);
    }
  }, []);

  // Toggle between density modes
  const toggleDensity = useCallback(() => {
    setDensity(density === 'compact' ? 'comfortable' : 'compact');
  }, [density, setDensity]);

  // Calculate table height based on breakpoint and density
  const tableHeight = useMemo(() => {
    let baseHeight = 'calc(100svh - var(--toolbar-h) - var(--footer-h) - (var(--shell-gutter) * 2) - var(--content-gap))';
    
    if (isMobile) {
      baseHeight = 'calc(100svh - var(--toolbar-h) - var(--footer-h) - (var(--shell-gutter) * 1.5) - var(--content-gap))';
    } else if (isTablet) {
      baseHeight = 'calc(100svh - var(--toolbar-h) - var(--footer-h) - (var(--shell-gutter) * 1.8) - var(--content-gap))';
    }
    
    // Adjust for density
    if (density === 'compact') {
      baseHeight = baseHeight.replace('* 2)', '* 1.8)').replace('* 1.5)', '* 1.3)').replace('* 1.8)', '* 1.6)');
    } else if (density === 'comfortable') {
      baseHeight = baseHeight.replace('* 2)', '* 2.2)').replace('* 1.5)', '* 1.7)').replace('* 1.8)', '* 2.0)');
    }
    
    return baseHeight;
  }, [isMobile, isTablet, density]);

  // Computed values
  const isCompact = density === 'compact';
  const isComfortable = density === 'comfortable';

  // Get row height CSS variable value
  const getRowHeight = useCallback(() => {
    return density === 'compact' ? '36px' : '44px';
  }, [density]);

  // Get cell padding CSS variable value
  const getCellPadding = useCallback(() => {
    if (density === 'compact') {
      return isMobile ? '6px 8px' : '6px 8px';
    }
    return isMobile ? '8px 10px' : '8px 12px';
  }, [density, isMobile]);

  // Get complete table styles object
  const getTableStyles = useCallback((): React.CSSProperties => {
    return {
      '--row-h': getRowHeight(),
      '--cell-px': density === 'compact' ? '8px' : '12px',
      '--cell-py': density === 'compact' ? '6px' : '8px',
      height: tableHeight,
    } as React.CSSProperties;
  }, [density, getRowHeight, tableHeight]);

  // Apply density to document root on mount and changes
  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.setAttribute('data-density', density);
    }
  }, [density]);

  return {
    density,
    setDensity,
    toggleDensity,
    tableHeight,
    isCompact,
    isComfortable,
    getRowHeight,
    getCellPadding,
    getTableStyles,
  };
}

/**
 * Utility function to calculate table container height
 * 
 * @param options Configuration options for height calculation
 * @returns CSS calc() string for table height
 */
export function calculateTableHeight(options: {
  density?: DensityMode;
  isMobile?: boolean;
  isTablet?: boolean;
  customOffset?: string;
} = {}): string {
  const { density = 'comfortable', isMobile = false, isTablet = false, customOffset } = options;
  
  let gutterMultiplier = 2;
  if (isMobile) {
    gutterMultiplier = 1.5;
  } else if (isTablet) {
    gutterMultiplier = 1.8;
  }
  
  // Adjust for density
  if (density === 'compact') {
    gutterMultiplier *= 0.9;
  } else if (density === 'comfortable') {
    gutterMultiplier *= 1.1;
  }
  
  const baseCalc = `calc(100svh - var(--toolbar-h) - var(--footer-h) - (var(--shell-gutter) * ${gutterMultiplier}) - var(--content-gap)`;
  
  if (customOffset) {
    return `${baseCalc} - ${customOffset})`;
  }
  
  return `${baseCalc})`;
}

export type { UseResponsiveTableOptions, UseResponsiveTableReturn };
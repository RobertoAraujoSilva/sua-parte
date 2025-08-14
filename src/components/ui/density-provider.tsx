import React, { createContext, useContext } from 'react';
import { useResponsive } from '@/hooks/use-responsive';

interface DensityContextType {
  density: 'compact' | 'comfortable' | 'spacious';
  textSize: 'xs' | 'sm' | 'base' | 'lg';
  spacing: 'tight' | 'normal' | 'loose';
  cardPadding: string;
  buttonSize: 'sm' | 'default' | 'lg';
  headerHeight: string;
  gridGap: string;
}

const DensityContext = createContext<DensityContextType | null>(null);

export function DensityProvider({ children }: { children: React.ReactNode }) {
  const { currentBreakpoint } = useResponsive();
  
  const densityConfig = {
    mobile: {
      density: 'spacious' as const,
      textSize: 'base' as const,
      spacing: 'loose' as const,
      cardPadding: 'p-4 sm:p-6',
      buttonSize: 'default' as const,
      headerHeight: 'h-14',
      gridGap: 'gap-4'
    },
    tablet: {
      density: 'comfortable' as const,
      textSize: 'base' as const,
      spacing: 'normal' as const,
      cardPadding: 'p-3 sm:p-4',
      buttonSize: 'default' as const,
      headerHeight: 'h-12',
      gridGap: 'gap-3'
    },
    desktop: {
      density: 'comfortable' as const,
      textSize: 'sm' as const,
      spacing: 'normal' as const,
      cardPadding: 'p-3 sm:p-4',
      buttonSize: 'sm' as const,
      headerHeight: 'h-11',
      gridGap: 'gap-4'
    },
    large: {
      density: 'compact' as const,
      textSize: 'sm' as const,
      spacing: 'tight' as const,
      cardPadding: 'p-2 sm:p-3',
      buttonSize: 'sm' as const,
      headerHeight: 'h-10',
      gridGap: 'gap-3'
    }
  };

  const config = densityConfig[currentBreakpoint];

  return (
    <DensityContext.Provider value={config}>
      {children}
    </DensityContext.Provider>
  );
}

export const useDensity = () => {
  const context = useContext(DensityContext);
  if (!context) {
    throw new Error('useDensity must be used within DensityProvider');
  }
  return context;
};

// Hook for getting responsive text classes
export const useResponsiveText = () => {
  const { textSize } = useDensity();
  
  const textClasses = {
    xs: {
      body: 'text-xs',
      heading: 'text-sm font-semibold',
      subheading: 'text-xs font-medium',
      caption: 'text-xs text-muted-foreground'
    },
    sm: {
      body: 'text-sm',
      heading: 'text-base font-semibold',
      subheading: 'text-sm font-medium',
      caption: 'text-xs text-muted-foreground'
    },
    base: {
      body: 'text-base',
      heading: 'text-lg font-semibold',
      subheading: 'text-base font-medium',
      caption: 'text-sm text-muted-foreground'
    },
    lg: {
      body: 'text-lg',
      heading: 'text-xl font-semibold',
      subheading: 'text-lg font-medium',
      caption: 'text-base text-muted-foreground'
    }
  };

  return textClasses[textSize];
};

// Hook for getting responsive spacing
export const useResponsiveSpacing = () => {
  const { spacing } = useDensity();
  
  const spacingClasses = {
    tight: {
      section: 'space-y-2',
      stack: 'space-y-1',
      inline: 'space-x-1',
      grid: 'gap-2',
      padding: 'p-2'
    },
    normal: {
      section: 'space-y-4',
      stack: 'space-y-2',
      inline: 'space-x-2',
      grid: 'gap-4',
      padding: 'p-4'
    },
    loose: {
      section: 'space-y-6',
      stack: 'space-y-3',
      inline: 'space-x-3',
      grid: 'gap-6',
      padding: 'p-6'
    }
  };

  return spacingClasses[spacing];
};
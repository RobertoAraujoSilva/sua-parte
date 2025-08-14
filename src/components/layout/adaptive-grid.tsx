import React from 'react';
import { useResponsive, useGridColumns } from '@/hooks/use-responsive';
import { useDensity } from '@/components/ui/density-provider';

interface AdaptiveGridProps {
  children: React.ReactNode;
  minItemWidth?: number; // em pixels
  maxColumns?: number;
  gap?: 'sm' | 'md' | 'lg' | 'auto';
  className?: string;
}

export function AdaptiveGrid({ 
  children, 
  minItemWidth = 300,
  maxColumns,
  gap = 'auto',
  className = ''
}: AdaptiveGridProps) {
  const { currentBreakpoint } = useResponsive();
  const { gridGap } = useDensity();
  const calculatedColumns = useGridColumns(minItemWidth);

  // Use provided gap or auto-detect from density
  const getGapClass = () => {
    if (gap === 'auto') return gridGap;
    
    const gapMap = {
      sm: 'gap-2',
      md: 'gap-4',
      lg: 'gap-6'
    };
    
    return gapMap[gap];
  };

  // Calculate final column count
  const finalColumns = maxColumns ? Math.min(calculatedColumns, maxColumns) : calculatedColumns;

  // Generate grid template columns style
  const gridStyle = {
    gridTemplateColumns: `repeat(${finalColumns}, minmax(0, 1fr))`
  };

  // For very small screens or when items are too narrow, use CSS Grid auto-fit
  const useAutoFit = currentBreakpoint === 'mobile' || minItemWidth < 200;

  return (
    <div 
      className={`
        grid
        ${getGapClass()}
        ${className}
      `.trim()}
      style={useAutoFit ? {
        gridTemplateColumns: `repeat(auto-fit, minmax(${minItemWidth}px, 1fr))`
      } : gridStyle}
    >
      {children}
    </div>
  );
}

// Specialized grids for common use cases
export function StudentsGrid({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <AdaptiveGrid 
      minItemWidth={280} 
      maxColumns={6}
      className={className}
    >
      {children}
    </AdaptiveGrid>
  );
}

export function ProgramsGrid({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <AdaptiveGrid 
      minItemWidth={350} 
      maxColumns={4}
      className={className}
    >
      {children}
    </AdaptiveGrid>
  );
}

export function StatsGrid({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <AdaptiveGrid 
      minItemWidth={200} 
      maxColumns={8}
      gap="sm"
      className={className}
    >
      {children}
    </AdaptiveGrid>
  );
}

// Hook for getting responsive grid classes
export function useResponsiveGrid(minItemWidth: number = 300) {
  const { currentBreakpoint } = useResponsive();
  const { gridGap } = useDensity();
  
  const gridClasses = {
    mobile: `grid grid-cols-1 ${gridGap}`,
    tablet: `grid grid-cols-2 ${gridGap}`,
    desktop: `grid grid-cols-3 ${gridGap}`,
    large: `grid grid-cols-4 ${gridGap}`
  };

  // For very narrow items, allow more columns
  if (minItemWidth < 250) {
    return {
      mobile: `grid grid-cols-2 ${gridGap}`,
      tablet: `grid grid-cols-3 ${gridGap}`,
      desktop: `grid grid-cols-4 ${gridGap}`,
      large: `grid grid-cols-6 ${gridGap}`
    }[currentBreakpoint];
  }

  return gridClasses[currentBreakpoint];
}
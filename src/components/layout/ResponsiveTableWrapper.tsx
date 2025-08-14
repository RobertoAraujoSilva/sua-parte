import React, { forwardRef } from 'react';
import { cn } from '@/lib/utils';

interface ResponsiveTableWrapperProps {
  children: React.ReactNode;
  className?: string;
  height?: string;
  density?: 'compact' | 'comfortable';
  id?: string;
  style?: React.CSSProperties;
}

/**
 * ResponsiveTableWrapper - Container for tables with calculated height using CSS variables
 * 
 * Features:
 * - Height calculation: calc(100svh - var(--toolbar-h) - var(--footer-h) - gutters)
 * - Overflow handling: vertical auto, horizontal as needed
 * - Density system integration for row heights and cell padding
 * - Responsive height adjustments for different breakpoints
 * - Zoom stability through viewport units and CSS variables
 */
export const ResponsiveTableWrapper = forwardRef<HTMLDivElement, ResponsiveTableWrapperProps>(
  ({ children, className, height, density, id, style, ...props }, ref) => {
    // Default height calculation using CSS variables
    const defaultHeight = 'calc(100svh - var(--toolbar-h) - var(--footer-h) - (var(--shell-gutter) * 2) - var(--content-gap))';
    
    return (
      <div
        ref={ref}
        id={id}
        className={cn(
          // Base container styles
          'responsive-table-container',
          // Overflow handling
          'overflow-y-auto overflow-x-auto',
          // Visual styling
          'border border-border/20 rounded-lg',
          // Smooth scrolling
          'scroll-smooth',
          // Density transition support
          'density-transition',
          // Custom className
          className
        )}
        style={{
          height: height || defaultHeight,
          // Ensure smooth scrolling on touch devices
          WebkitOverflowScrolling: 'touch',
          // Custom styles
          ...style
        }}
        data-density={density}
        {...props}
      >
        {children}
      </div>
    );
  }
);

ResponsiveTableWrapper.displayName = 'ResponsiveTableWrapper';

interface ResponsiveTableContentProps {
  children: React.ReactNode;
  className?: string;
  density?: 'compact' | 'comfortable';
}

/**
 * ResponsiveTableContent - Inner content wrapper that applies density styles
 */
export function ResponsiveTableContent({ 
  children, 
  className, 
  density 
}: ResponsiveTableContentProps) {
  return (
    <div
      className={cn(
        // Full width and height
        'w-full h-full',
        // Density-aware table container
        'density-table',
        className
      )}
      data-density={density}
    >
      {children}
    </div>
  );
}

interface ResponsiveTableProps extends ResponsiveTableWrapperProps {
  tableClassName?: string;
  contentClassName?: string;
}

/**
 * ResponsiveTable - Complete table wrapper with content container
 * 
 * Combines ResponsiveTableWrapper and ResponsiveTableContent for convenience
 */
export function ResponsiveTable({ 
  children, 
  className, 
  tableClassName,
  contentClassName,
  height, 
  density, 
  id, 
  style,
  ...props 
}: ResponsiveTableProps) {
  return (
    <ResponsiveTableWrapper
      className={className}
      height={height}
      density={density}
      id={id}
      style={style}
      {...props}
    >
      <ResponsiveTableContent
        className={contentClassName}
        density={density}
      >
        <div className={cn('w-full', tableClassName)}>
          {children}
        </div>
      </ResponsiveTableContent>
    </ResponsiveTableWrapper>
  );
}

// Export types for external use
export type { ResponsiveTableWrapperProps, ResponsiveTableContentProps, ResponsiveTableProps };
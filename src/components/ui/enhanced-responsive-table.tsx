import React, { useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { ResponsiveTableWrapper, ResponsiveTableContent } from '@/components/layout/ResponsiveTableWrapper';
import { useResponsiveTable } from '@/hooks/use-responsive-table';
import { useResponsive } from '@/hooks/use-responsive';

interface ResponsiveTableColumn {
  key: string;
  label: string;
  width?: number;
  minWidth?: number;
  sticky?: boolean;
  sortable?: boolean;
  render?: (value: any, row: any) => React.ReactNode;
  className?: string;
}

interface EnhancedResponsiveTableProps {
  data: any[];
  columns: ResponsiveTableColumn[];
  onRowClick?: (row: any) => void;
  onSort?: (column: string, direction: 'asc' | 'desc') => void;
  loading?: boolean;
  className?: string;
  tableClassName?: string;
  height?: string;
  density?: 'compact' | 'comfortable';
  showDensityToggle?: boolean;
  emptyMessage?: string;
  id?: string;
}

/**
 * Enhanced Responsive Table with integrated wrapper and density support
 * 
 * Features:
 * - Calculated height using CSS variables
 * - Density system integration (compact/comfortable)
 * - Responsive breakpoint handling
 * - Sticky headers and columns
 * - Smooth scrolling and touch optimization
 * - Loading states and empty states
 */
export function EnhancedResponsiveTable({
  data,
  columns,
  onRowClick,
  onSort,
  loading = false,
  className,
  tableClassName,
  height,
  density: propDensity,
  showDensityToggle = false,
  emptyMessage = 'Nenhum dado encontrado',
  id,
}: EnhancedResponsiveTableProps) {
  const { isMobile, isTablet, isDesktop } = useResponsive();
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Use responsive table hook for density management
  const {
    density,
    setDensity,
    toggleDensity,
    tableHeight,
    getTableStyles,
    getCellPadding,
  } = useResponsiveTable({
    defaultDensity: propDensity || 'comfortable',
    persistDensity: !propDensity, // Only persist if not controlled
  });

  // Use prop density if provided, otherwise use hook density
  const activeDensity = propDensity || density;

  // Auto-scroll hint for mobile
  useEffect(() => {
    if (isMobile && containerRef.current && data.length > 0) {
      const container = containerRef.current;
      const scrollWidth = container.scrollWidth;
      const clientWidth = container.clientWidth;
      
      if (scrollWidth > clientWidth) {
        // Gently scroll to show there's more content
        container.scrollLeft = 50;
        setTimeout(() => {
          container.scrollLeft = 0;
        }, 1000);
      }
    }
  }, [isMobile, data]);

  // Get responsive cell padding
  const cellPadding = getCellPadding();
  const cellPaddingClass = activeDensity === 'compact' 
    ? 'px-2 py-1.5' 
    : 'px-3 py-2';

  // Get responsive text size
  const getTextSize = () => {
    if (isMobile) return 'text-xs';
    if (activeDensity === 'compact') return 'text-sm';
    return 'text-sm';
  };

  const getHeaderTextSize = () => {
    if (isMobile) return 'text-xs';
    return 'text-xs';
  };

  // Loading state
  if (loading) {
    return (
      <ResponsiveTableWrapper
        className={className}
        height={height}
        density={activeDensity}
        id={id}
      >
        <div className="animate-pulse p-4">
          <div className="h-10 bg-muted rounded mb-2"></div>
          {[...Array(8)].map((_, i) => (
            <div key={i} className="h-8 bg-muted/50 rounded mb-1"></div>
          ))}
        </div>
      </ResponsiveTableWrapper>
    );
  }

  return (
    <div className="space-y-2">
      {/* Density Toggle (optional) */}
      {showDensityToggle && !propDensity && (
        <div className="flex justify-end">
          <button
            onClick={toggleDensity}
            className="px-3 py-1 text-xs bg-muted hover:bg-muted/80 rounded-md transition-colors"
          >
            {density === 'compact' ? 'Confortável' : 'Compacto'}
          </button>
        </div>
      )}

      {/* Table Container */}
      <ResponsiveTableWrapper
        ref={containerRef}
        className={className}
        height={height || tableHeight}
        density={activeDensity}
        id={id}
        style={getTableStyles()}
      >
        <ResponsiveTableContent density={activeDensity}>
          <table className={cn(
            'w-full min-w-full border-collapse density-table',
            tableClassName
          )}>
            {/* Table Header */}
            <thead className="sticky top-0 z-10">
              <tr>
                {columns.map((column) => (
                  <th
                    key={column.key}
                    className={cn(
                      cellPaddingClass,
                      'text-left font-semibold uppercase tracking-wider',
                      'bg-muted/50 backdrop-blur-sm',
                      'border-b border-border/20',
                      getHeaderTextSize(),
                      column.sticky && 'sticky left-0 z-20 border-r border-border/20',
                      column.sortable && 'cursor-pointer hover:bg-muted/70 transition-colors',
                      column.className
                    )}
                    style={{
                      minWidth: column.minWidth || (isMobile ? 100 : 120),
                      width: column.width,
                    }}
                    onClick={() => {
                      if (column.sortable && onSort) {
                        onSort(column.key, 'asc'); // Toggle logic handled by parent
                      }
                    }}
                  >
                    <div className="flex items-center gap-1">
                      {column.label}
                      {column.sortable && (
                        <span className="text-muted-foreground">↕</span>
                      )}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>

            {/* Table Body */}
            <tbody>
              {data.map((row, index) => (
                <tr
                  key={index}
                  className={cn(
                    'hover:bg-muted/30 transition-colors',
                    'border-b border-border/10',
                    onRowClick && 'cursor-pointer'
                  )}
                  onClick={() => onRowClick?.(row)}
                >
                  {columns.map((column) => (
                    <td
                      key={column.key}
                      className={cn(
                        cellPaddingClass,
                        getTextSize(),
                        'align-middle',
                        column.sticky && 'sticky left-0 bg-background border-r border-border/20',
                        column.className
                      )}
                      style={{
                        minWidth: column.minWidth || (isMobile ? 100 : 120),
                        width: column.width,
                      }}
                    >
                      {column.render
                        ? column.render(row[column.key], row)
                        : row[column.key] || '-'}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>

          {/* Empty State */}
          {data.length === 0 && (
            <div className="flex items-center justify-center h-32">
              <div className="text-center">
                <p className="text-muted-foreground text-sm">{emptyMessage}</p>
              </div>
            </div>
          )}
        </ResponsiveTableContent>
      </ResponsiveTableWrapper>

      {/* Mobile Scroll Indicator */}
      {isMobile && data.length > 0 && (
        <div className="flex justify-center">
          <div className="text-xs text-muted-foreground px-3 py-1 bg-muted/50 rounded-full">
            ← Deslize para ver mais colunas →
          </div>
        </div>
      )}
    </div>
  );
}

// Export the column interface for external use
export type { ResponsiveTableColumn, EnhancedResponsiveTableProps };
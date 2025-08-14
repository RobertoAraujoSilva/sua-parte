import React, { useRef, useEffect } from 'react';
import { useResponsive } from '@/hooks/use-responsive';
import { useDensity, useResponsiveText } from '@/components/ui/density-provider';
import { FullWidthContainer } from '@/components/layout/responsive-container';

interface ResponsiveTableColumn {
  key: string;
  label: string;
  width?: number;
  minWidth?: number;
  sticky?: boolean;
  sortable?: boolean;
  render?: (value: any, row: any) => React.ReactNode;
}

interface ResponsiveTableProps {
  data: any[];
  columns: ResponsiveTableColumn[];
  onRowClick?: (row: any) => void;
  onSort?: (column: string, direction: 'asc' | 'desc') => void;
  loading?: boolean;
  className?: string;
}

export function ResponsiveTable({ 
  data, 
  columns, 
  onRowClick,
  onSort,
  loading = false,
  className = ''
}: ResponsiveTableProps) {
  const { isDesktop, isLarge, isMobile } = useResponsive();
  const { textSize, spacing } = useDensity();
  const textClasses = useResponsiveText();
  const containerRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to show more content on mobile
  useEffect(() => {
    if (isMobile && containerRef.current) {
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

  const getCellPadding = () => {
    if (spacing === 'tight') return 'px-2 py-1';
    if (spacing === 'normal') return 'px-3 py-2';
    return 'px-4 py-3';
  };

  const getTextSize = () => {
    if (textSize === 'xs') return 'text-xs';
    if (textSize === 'sm') return 'text-sm';
    return 'text-base';
  };

  if (loading) {
    return (
      <FullWidthContainer>
        <div className="animate-pulse">
          <div className="h-10 bg-gray-200 rounded mb-2"></div>
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-8 bg-gray-100 rounded mb-1"></div>
          ))}
        </div>
      </FullWidthContainer>
    );
  }

  return (
    <FullWidthContainer>
      <div 
        ref={containerRef}
        className={`
          w-full overflow-x-auto
          ${isDesktop ? 'scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100' : 'scrollbar-none'}
          ${className}
        `.trim()}
        style={{
          // Ensure smooth scrolling on touch devices
          WebkitOverflowScrolling: 'touch',
          scrollBehavior: 'smooth'
        }}
      >
        <table className="w-full min-w-full border-collapse">
          <thead className="sticky top-0 bg-background z-10 border-b">
            <tr>
              {columns.map((column) => (
                <th
                  key={column.key}
                  className={`
                    ${getCellPadding()}
                    text-left font-medium uppercase tracking-wider
                    ${textClasses.caption}
                    ${column.sticky ? 'sticky left-0 bg-background z-20 border-r' : ''}
                    ${column.sortable ? 'cursor-pointer hover:bg-muted/50' : ''}
                  `.trim()}
                  style={{
                    minWidth: column.minWidth || (isMobile ? 100 : 120),
                    width: column.width
                  }}
                  onClick={() => {
                    if (column.sortable && onSort) {
                      onSort(column.key, 'asc'); // Toggle logic would be handled by parent
                    }
                  }}
                >
                  {column.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((row, index) => (
              <tr 
                key={index} 
                className={`
                  hover:bg-muted/50 border-b border-border/50
                  ${onRowClick ? 'cursor-pointer' : ''}
                `.trim()}
                onClick={() => onRowClick?.(row)}
              >
                {columns.map((column) => (
                  <td
                    key={column.key}
                    className={`
                      ${getCellPadding()}
                      ${getTextSize()}
                      ${column.sticky ? 'sticky left-0 bg-background border-r' : ''}
                    `.trim()}
                    style={{
                      minWidth: column.minWidth || (isMobile ? 100 : 120),
                      width: column.width
                    }}
                  >
                    {column.render ? 
                      column.render(row[column.key], row) : 
                      row[column.key] || '-'
                    }
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>

        {data.length === 0 && (
          <div className="text-center py-8">
            <p className={textClasses.body}>Nenhum dado encontrado</p>
          </div>
        )}
      </div>

      {/* Mobile scroll indicator */}
      {isMobile && (
        <div className="flex justify-center mt-2">
          <div className="text-xs text-muted-foreground">
            ← Deslize para ver mais colunas →
          </div>
        </div>
      )}
    </FullWidthContainer>
  );
}

// Specialized table for students spreadsheet
export function StudentsSpreadsheetTable({ 
  students, 
  onStudentClick,
  className = ''
}: {
  students: any[];
  onStudentClick?: (student: any) => void;
  className?: string;
}) {
  const columns: ResponsiveTableColumn[] = [
    {
      key: 'nome',
      label: 'Nome',
      minWidth: 200,
      sticky: true,
      sortable: true
    },
    {
      key: 'idade',
      label: 'Idade',
      minWidth: 80,
      sortable: true
    },
    {
      key: 'genero',
      label: 'Gênero',
      minWidth: 100,
      render: (value) => value === 'masculino' ? 'M' : 'F'
    },
    {
      key: 'cargo',
      label: 'Cargo',
      minWidth: 150,
      sortable: true
    },
    {
      key: 'email',
      label: 'Email',
      minWidth: 200
    },
    {
      key: 'telefone',
      label: 'Telefone',
      minWidth: 130
    },
    {
      key: 'data_batismo',
      label: 'Batismo',
      minWidth: 120,
      render: (value) => value ? new Date(value).toLocaleDateString('pt-BR') : '-'
    },
    {
      key: 'ativo',
      label: 'Status',
      minWidth: 100,
      render: (value) => (
        <span className={`px-2 py-1 rounded-full text-xs ${
          value ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
        }`}>
          {value ? 'Ativo' : 'Inativo'}
        </span>
      )
    }
  ];

  return (
    <ResponsiveTable
      data={students}
      columns={columns}
      onRowClick={onStudentClick}
      className={className}
    />
  );
}
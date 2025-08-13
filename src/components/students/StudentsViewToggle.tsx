/**
 * Students View Toggle
 * 
 * Component for switching between different view modes (List, Grid, Stats)
 */

import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { List, Grid3X3, BarChart3 } from 'lucide-react';

export type ViewMode = 'list' | 'grid' | 'stats';

interface StudentsViewToggleProps {
  currentView: ViewMode;
  onViewChange: (view: ViewMode) => void;
  totalCount?: number;
}

export function StudentsViewToggle({ 
  currentView, 
  onViewChange, 
  totalCount 
}: StudentsViewToggleProps) {
  const views = [
    {
      key: 'list' as ViewMode,
      label: 'Lista',
      icon: List,
      description: 'Visualização em cards'
    },
    {
      key: 'grid' as ViewMode,
      label: 'Planilha',
      icon: Grid3X3,
      description: 'Visualização tipo Excel'
    },
    {
      key: 'stats' as ViewMode,
      label: 'Estatísticas',
      icon: BarChart3,
      description: 'Gráficos e relatórios'
    }
  ];

  return (
    <div className="flex items-center gap-1 p-1 bg-muted rounded-lg">
      {views.map(view => {
        const Icon = view.icon;
        const isActive = currentView === view.key;
        
        return (
          <Button
            key={view.key}
            variant={isActive ? 'default' : 'ghost'}
            size="sm"
            onClick={() => onViewChange(view.key)}
            className={`flex items-center gap-2 ${isActive ? '' : 'text-muted-foreground hover:text-foreground'}`}
            title={view.description}
          >
            <Icon className="h-4 w-4" />
            {view.label}
            {isActive && totalCount !== undefined && (
              <Badge variant="secondary" className="ml-1">
                {totalCount}
              </Badge>
            )}
          </Button>
        );
      })}
    </div>
  );
}
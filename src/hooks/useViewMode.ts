/**
 * View Mode Hook
 * 
 * Hook for managing view mode state with localStorage persistence
 */

import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';

export type ViewMode = 'list' | 'grid' | 'stats';

interface UseViewModeOptions {
  defaultView?: ViewMode;
  storageKey?: string;
}

export function useViewMode(options: UseViewModeOptions = {}) {
  const { defaultView = 'list', storageKey = 'estudantesView' } = options;
  const [searchParams] = useSearchParams();
  
  // Get initial view from URL params or localStorage
  const getInitialView = (): ViewMode => {
    // Check URL parameter first
    const urlView = searchParams?.get('view') as ViewMode;
    if (urlView && ['list', 'grid', 'stats'].includes(urlView)) {
      return urlView;
    }
    
    // Check localStorage
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(storageKey) as ViewMode;
      if (stored && ['list', 'grid', 'stats'].includes(stored)) {
        return stored;
      }
    }
    
    return defaultView;
  };

  const [viewMode, setViewModeState] = useState<ViewMode>(getInitialView);

  // Update localStorage when view changes
  const setViewMode = (mode: ViewMode) => {
    setViewModeState(mode);
    if (typeof window !== 'undefined') {
      localStorage.setItem(storageKey, mode);
    }
  };

  // Sync with URL params on mount
  useEffect(() => {
    const urlView = searchParams?.get('view') as ViewMode;
    if (urlView && ['list', 'grid', 'stats'].includes(urlView) && urlView !== viewMode) {
      setViewModeState(urlView);
    }
  }, [searchParams, viewMode]);

  return {
    viewMode,
    setViewMode,
    isListView: viewMode === 'list',
    isGridView: viewMode === 'grid',
    isStatsView: viewMode === 'stats'
  };
}
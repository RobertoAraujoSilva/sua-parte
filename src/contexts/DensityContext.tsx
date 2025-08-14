import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type DensityMode = 'compact' | 'comfortable';

interface DensityContextType {
  density: DensityMode;
  setDensity: (density: DensityMode) => void;
  toggleDensity: () => void;
}

const DensityContext = createContext<DensityContextType | undefined>(undefined);

interface DensityProviderProps {
  children: ReactNode;
}

export function DensityProvider({ children }: DensityProviderProps) {
  // Initialize from localStorage or default to comfortable
  const [density, setDensityState] = useState<DensityMode>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('density-mode');
      return (saved as DensityMode) || 'comfortable';
    }
    return 'comfortable';
  });

  // Update document root data attribute and localStorage when density changes
  useEffect(() => {
    document.documentElement.setAttribute('data-density', density);
    localStorage.setItem('density-mode', density);
  }, [density]);

  const setDensity = (newDensity: DensityMode) => {
    setDensityState(newDensity);
  };

  const toggleDensity = () => {
    setDensityState(prev => prev === 'compact' ? 'comfortable' : 'compact');
  };

  return (
    <DensityContext.Provider value={{ density, setDensity, toggleDensity }}>
      {children}
    </DensityContext.Provider>
  );
}

export function useDensity() {
  const context = useContext(DensityContext);
  if (context === undefined) {
    throw new Error('useDensity must be used within a DensityProvider');
  }
  return context;
}
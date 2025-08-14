import React from 'react';
import { Button } from '@/components/ui/button';
import { LayoutGrid, Rows3 } from 'lucide-react';
import { useDensity } from '@/contexts/DensityContext';
import { cn } from '@/lib/utils';

interface DensityToggleProps {
  className?: string;
  showLabel?: boolean;
  size?: 'sm' | 'default' | 'lg';
}

export function DensityToggle({ 
  className, 
  showLabel = false, 
  size = 'default' 
}: DensityToggleProps) {
  const { density, toggleDensity } = useDensity();
  
  const isCompact = density === 'compact';
  const Icon = isCompact ? Rows3 : LayoutGrid;
  
  return (
    <Button
      variant="outline"
      size={size}
      onClick={toggleDensity}
      className={cn(
        "transition-all duration-200 hover:scale-105",
        className
      )}
      title={`Alternar para modo ${isCompact ? 'confortável' : 'compacto'}`}
    >
      <Icon className={cn(
        "transition-transform duration-200",
        size === 'sm' ? 'h-3 w-3' : 'h-4 w-4',
        showLabel && 'mr-2'
      )} />
      {showLabel && (
        <span className="text-sm">
          {isCompact ? 'Compacto' : 'Confortável'}
        </span>
      )}
    </Button>
  );
}

// Alternative compact version for toolbars
export function DensityToggleCompact({ className }: { className?: string }) {
  return (
    <DensityToggle 
      className={cn("h-8 w-8 p-0", className)}
      size="sm"
      showLabel={false}
    />
  );
}

// Version with label for settings areas
export function DensityToggleWithLabel({ className }: { className?: string }) {
  return (
    <DensityToggle 
      className={className}
      showLabel={true}
    />
  );
}
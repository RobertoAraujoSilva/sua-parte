import React from 'react';
import { useResponsive } from '@/hooks/use-responsive';

interface ResponsiveContainerProps {
  children: React.ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | 'full';
  padding?: 'none' | 'sm' | 'md' | 'lg';
  className?: string;
}

export function ResponsiveContainer({ 
  children, 
  maxWidth = '2xl', 
  padding = 'md',
  className = ''
}: ResponsiveContainerProps) {
  const { currentBreakpoint } = useResponsive();

  // Container width classes based on breakpoint and maxWidth
  const getContainerClasses = () => {
    if (maxWidth === 'full') {
      return 'w-full';
    }

    const widthMap = {
      mobile: {
        'sm': 'w-full',
        'md': 'w-full',
        'lg': 'w-full',
        'xl': 'w-full',
        '2xl': 'w-full',
        '3xl': 'w-full'
      },
      tablet: {
        'sm': 'w-[85%] max-w-screen-sm',
        'md': 'w-[85%] max-w-screen-md',
        'lg': 'w-[85%] max-w-screen-lg',
        'xl': 'w-[85%] max-w-screen-xl',
        '2xl': 'w-[85%] max-w-screen-2xl',
        '3xl': 'w-[85%]'
      },
      desktop: {
        'sm': 'w-[92%] max-w-screen-sm',
        'md': 'w-[92%] max-w-screen-md',
        'lg': 'w-[92%] max-w-screen-lg',
        'xl': 'w-[92%] max-w-screen-xl',
        '2xl': 'w-[92%] max-w-screen-2xl',
        '3xl': 'w-[92%]'
      },
      large: {
        'sm': 'w-[95%] max-w-screen-sm',
        'md': 'w-[95%] max-w-screen-md',
        'lg': 'w-[95%] max-w-screen-lg',
        'xl': 'w-[95%] max-w-screen-xl',
        '2xl': 'w-[95%] max-w-screen-2xl',
        '3xl': 'w-[95%]'
      }
    };

    return `${widthMap[currentBreakpoint][maxWidth]} mx-auto`;
  };

  // Padding classes based on breakpoint and padding prop
  const getPaddingClasses = () => {
    if (padding === 'none') return '';

    const paddingMap = {
      mobile: {
        'sm': 'px-3 py-2',
        'md': 'px-4 py-3',
        'lg': 'px-6 py-4'
      },
      tablet: {
        'sm': 'px-4 py-3',
        'md': 'px-6 py-4',
        'lg': 'px-8 py-6'
      },
      desktop: {
        'sm': 'px-6 py-4',
        'md': 'px-8 py-6',
        'lg': 'px-12 py-8'
      },
      large: {
        'sm': 'px-8 py-6',
        'md': 'px-12 py-8',
        'lg': 'px-16 py-10'
      }
    };

    return paddingMap[currentBreakpoint][padding];
  };

  const containerClasses = `
    ${getContainerClasses()}
    ${getPaddingClasses()}
    ${className}
  `.trim();

  return (
    <div className={containerClasses}>
      {children}
    </div>
  );
}

// Specialized containers for common use cases
export function FullWidthContainer({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <ResponsiveContainer maxWidth="full" padding="none" className={className}>
      {children}
    </ResponsiveContainer>
  );
}

export function ContentContainer({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <ResponsiveContainer maxWidth="2xl" padding="md" className={className}>
      {children}
    </ResponsiveContainer>
  );
}

export function WideContainer({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <ResponsiveContainer maxWidth="3xl" padding="md" className={className}>
      {children}
    </ResponsiveContainer>
  );
}
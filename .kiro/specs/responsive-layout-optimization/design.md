# Design Document - Responsive Layout Optimization

## Overview

Este documento detalha a arquitetura técnica para otimizar o uso do espaço em telas grandes e melhorar a experiência em tablets, com foco especial na planilha de estudantes e layouts adaptativos.

## Architecture

### Breakpoint System
```typescript
// Tailwind breakpoints customizados
const breakpoints = {
  'xs': '480px',   // Mobile large
  'sm': '640px',   // Tablet portrait
  'md': '768px',   // Tablet landscape
  'lg': '1024px',  // Desktop small
  'xl': '1280px',  // Desktop medium
  '2xl': '1536px', // Desktop large
  '3xl': '1920px'  // Desktop extra large
}

// Container widths por breakpoint
const containerWidths = {
  'xs': '100%',     // Mobile: full width com padding
  'sm': '85%',      // Tablet portrait: 85%
  'md': '90%',      // Tablet landscape: 90%
  'lg': '92%',      // Desktop small: 92%
  'xl': '94%',      // Desktop medium: 94%
  '2xl': '95%',     // Desktop large: 95%
  '3xl': '96%'      // Desktop XL: 96%
}
```

### Component Structure
```
src/
├── components/
│   ├── layout/
│   │   ├── responsive-container.tsx    # Container adaptativo
│   │   ├── adaptive-grid.tsx          # Grid system responsivo
│   │   ├── responsive-header.tsx      # Header otimizado
│   │   └── sidebar-manager.tsx        # Gerenciador de sidebars
│   ├── ui/
│   │   ├── responsive-table.tsx       # Tabela/planilha responsiva
│   │   ├── adaptive-card.tsx          # Cards adaptativos
│   │   └── density-provider.tsx       # Provider de densidade
│   └── students/
│       ├── students-grid-responsive.tsx  # Grid otimizado
│       └── students-spreadsheet-full.tsx # Planilha full-width
├── hooks/
│   ├── use-responsive.ts              # Hook para breakpoints
│   ├── use-container-width.ts         # Hook para largura
│   └── use-density.ts                 # Hook para densidade
└── styles/
    ├── responsive.css                 # Classes responsivas
    └── density.css                    # Classes de densidade
```

## Components and Interfaces

### 1. Responsive Container (`src/components/layout/responsive-container.tsx`)

```typescript
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
  className 
}: ResponsiveContainerProps) {
  const containerClasses = {
    'sm': 'max-w-screen-sm mx-auto w-[85%]',
    'md': 'max-w-screen-md mx-auto w-[90%]',
    'lg': 'max-w-screen-lg mx-auto w-[92%]',
    'xl': 'max-w-screen-xl mx-auto w-[94%]',
    '2xl': 'max-w-screen-2xl mx-auto w-[95%]',
    '3xl': 'max-w-screen-3xl mx-auto w-[96%]',
    'full': 'w-full'
  };

  const paddingClasses = {
    'none': '',
    'sm': 'px-2 sm:px-4',
    'md': 'px-4 sm:px-6 lg:px-8',
    'lg': 'px-6 sm:px-8 lg:px-12'
  };

  return (
    <div className={`
      ${containerClasses[maxWidth]}
      ${paddingClasses[padding]}
      ${className || ''}
    `}>
      {children}
    </div>
  );
}
```

### 2. Adaptive Grid (`src/components/layout/adaptive-grid.tsx`)

```typescript
interface AdaptiveGridProps {
  children: React.ReactNode;
  minItemWidth?: number; // em pixels
  gap?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function AdaptiveGrid({ 
  children, 
  minItemWidth = 300,
  gap = 'md',
  className 
}: AdaptiveGridProps) {
  const gapClasses = {
    'sm': 'gap-2 sm:gap-3',
    'md': 'gap-3 sm:gap-4 lg:gap-6',
    'lg': 'gap-4 sm:gap-6 lg:gap-8'
  };

  return (
    <div 
      className={`
        grid
        ${gapClasses[gap]}
        ${className || ''}
      `}
      style={{
        gridTemplateColumns: `repeat(auto-fit, minmax(${minItemWidth}px, 1fr))`
      }}
    >
      {children}
    </div>
  );
}
```

### 3. Responsive Hook (`src/hooks/use-responsive.ts`)

```typescript
import { useState, useEffect } from 'react';

interface BreakpointState {
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  isLarge: boolean;
  currentBreakpoint: 'mobile' | 'tablet' | 'desktop' | 'large';
  width: number;
  height: number;
}

export function useResponsive(): BreakpointState {
  const [state, setState] = useState<BreakpointState>({
    isMobile: false,
    isTablet: false,
    isDesktop: false,
    isLarge: false,
    currentBreakpoint: 'mobile',
    width: 0,
    height: 0
  });

  useEffect(() => {
    const updateState = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      
      const isMobile = width < 768;
      const isTablet = width >= 768 && width < 1024;
      const isDesktop = width >= 1024 && width < 1536;
      const isLarge = width >= 1536;
      
      const currentBreakpoint = 
        isMobile ? 'mobile' :
        isTablet ? 'tablet' :
        isDesktop ? 'desktop' : 'large';

      setState({
        isMobile,
        isTablet,
        isDesktop,
        isLarge,
        currentBreakpoint,
        width,
        height
      });
    };

    updateState();
    window.addEventListener('resize', updateState);
    return () => window.removeEventListener('resize', updateState);
  }, []);

  return state;
}
```

### 4. Density Provider (`src/components/ui/density-provider.tsx`)

```typescript
interface DensityContextType {
  density: 'compact' | 'comfortable' | 'spacious';
  textSize: 'sm' | 'base' | 'lg';
  spacing: 'tight' | 'normal' | 'loose';
  cardPadding: string;
  buttonSize: 'sm' | 'default' | 'lg';
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
      buttonSize: 'default' as const
    },
    tablet: {
      density: 'comfortable' as const,
      textSize: 'base' as const,
      spacing: 'normal' as const,
      cardPadding: 'p-3 sm:p-4',
      buttonSize: 'default' as const
    },
    desktop: {
      density: 'comfortable' as const,
      textSize: 'sm' as const,
      spacing: 'normal' as const,
      cardPadding: 'p-3 sm:p-4',
      buttonSize: 'sm' as const
    },
    large: {
      density: 'compact' as const,
      textSize: 'sm' as const,
      spacing: 'tight' as const,
      cardPadding: 'p-2 sm:p-3',
      buttonSize: 'sm' as const
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
  if (!context) throw new Error('useDensity must be used within DensityProvider');
  return context;
};
```

### 5. Responsive Table/Spreadsheet (`src/components/ui/responsive-table.tsx`)

```typescript
interface ResponsiveTableProps {
  data: any[];
  columns: Array<{
    key: string;
    label: string;
    width?: number;
    minWidth?: number;
    sticky?: boolean;
  }>;
  className?: string;
}

export function ResponsiveTable({ data, columns, className }: ResponsiveTableProps) {
  const { isDesktop, isLarge } = useResponsive();
  const containerRef = useRef<HTMLDivElement>(null);

  return (
    <ResponsiveContainer maxWidth="full" padding="none">
      <div 
        ref={containerRef}
        className={`
          w-full overflow-x-auto
          ${isDesktop ? 'scrollbar-thin' : 'scrollbar-none'}
          ${className || ''}
        `}
      >
        <table className="w-full min-w-full">
          <thead className="sticky top-0 bg-background z-10">
            <tr>
              {columns.map((column) => (
                <th
                  key={column.key}
                  className={`
                    px-2 py-3 text-left text-xs font-medium uppercase tracking-wider
                    ${column.sticky ? 'sticky left-0 bg-background z-20' : ''}
                    ${isLarge ? 'px-3 py-2' : 'px-2 py-3'}
                  `}
                  style={{
                    minWidth: column.minWidth || 120,
                    width: column.width
                  }}
                >
                  {column.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((row, index) => (
              <tr key={index} className="hover:bg-muted/50">
                {columns.map((column) => (
                  <td
                    key={column.key}
                    className={`
                      px-2 py-3 text-sm
                      ${column.sticky ? 'sticky left-0 bg-background' : ''}
                      ${isLarge ? 'px-3 py-2 text-xs' : 'px-2 py-3 text-sm'}
                    `}
                  >
                    {row[column.key]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </ResponsiveContainer>
  );
}
```

### 6. Responsive Header (`src/components/layout/responsive-header.tsx`)

```typescript
export function ResponsiveHeader() {
  const { isMobile, isTablet } = useResponsive();
  const { spacing, buttonSize } = useDensity();

  return (
    <header className={`
      sticky top-0 z-50 bg-background border-b
      ${isMobile ? 'h-14' : isTablet ? 'h-12' : 'h-10'}
    `}>
      <ResponsiveContainer maxWidth="full" padding="sm">
        <div className={`
          flex items-center justify-between h-full
          ${spacing === 'tight' ? 'gap-2' : spacing === 'normal' ? 'gap-4' : 'gap-6'}
        `}>
          {/* Logo/Brand */}
          <div className="flex items-center gap-2">
            <h1 className={`
              font-bold text-jw-navy
              ${isMobile ? 'text-lg' : isTablet ? 'text-base' : 'text-sm'}
            `}>
              Sistema Ministerial
            </h1>
          </div>

          {/* Navigation */}
          <nav className={`
            hidden md:flex items-center
            ${spacing === 'tight' ? 'gap-1' : spacing === 'normal' ? 'gap-2' : 'gap-4'}
          `}>
            <Button variant="ghost" size={buttonSize}>Dashboard</Button>
            <Button variant="ghost" size={buttonSize}>Estudantes</Button>
            <Button variant="ghost" size={buttonSize}>Programas</Button>
            <Button variant="ghost" size={buttonSize}>Designações</Button>
          </nav>

          {/* User Menu */}
          <div className="flex items-center gap-2">
            <Button variant="outline" size={buttonSize}>
              {isMobile ? 'ML' : 'Mauro Lima'}
            </Button>
          </div>
        </div>
      </ResponsiveContainer>
    </header>
  );
}
```

## Data Models

### Responsive Configuration

```typescript
interface ResponsiveConfig {
  breakpoints: {
    mobile: number;
    tablet: number;
    desktop: number;
    large: number;
  };
  containers: {
    [key: string]: {
      width: string;
      padding: string;
    };
  };
  grids: {
    [key: string]: {
      columns: {
        mobile: number;
        tablet: number;
        desktop: number;
        large: number;
      };
      gap: string;
    };
  };
}
```

### Density Settings

```typescript
interface DensitySettings {
  compact: {
    textSize: string;
    spacing: string;
    padding: string;
    buttonSize: string;
  };
  comfortable: {
    textSize: string;
    spacing: string;
    padding: string;
    buttonSize: string;
  };
  spacious: {
    textSize: string;
    spacing: string;
    padding: string;
    buttonSize: string;
  };
}
```

## Implementation Strategy

### Phase 1: Core Infrastructure
1. **Responsive Hook** - Implementar `useResponsive` para detecção de breakpoints
2. **Container System** - Criar `ResponsiveContainer` com larguras adaptativas
3. **Density Provider** - Implementar sistema de densidade adaptativa
4. **Grid System** - Criar `AdaptiveGrid` para layouts flexíveis

### Phase 2: Component Updates
5. **Header Optimization** - Tornar header mais compacto e responsivo
6. **Students Grid** - Otimizar grid de estudantes para mais colunas
7. **Spreadsheet Full-Width** - Fazer planilha usar 100% da largura
8. **Cards Responsive** - Adaptar cards para diferentes densidades

### Phase 3: Page-Specific Optimizations
9. **Estudantes Page** - Aplicar otimizações específicas
10. **Programas Page** - Melhorar layout de programas
11. **Dashboard** - Otimizar dashboard para telas grandes
12. **Forms** - Criar layouts multi-coluna para formulários

### Phase 4: Polish & Testing
13. **Sidebar Management** - Implementar sidebars inteligentes
14. **Typography Scale** - Ajustar escalas de texto
15. **Touch Optimization** - Garantir usabilidade touch em tablets
16. **Performance** - Otimizar re-renders e cálculos

## CSS Architecture

### Tailwind Configuration Updates

```javascript
// tailwind.config.ts
module.exports = {
  theme: {
    extend: {
      screens: {
        'xs': '480px',
        '3xl': '1920px',
      },
      maxWidth: {
        'screen-3xl': '1920px',
      },
      spacing: {
        'safe-bottom': 'env(safe-area-inset-bottom)',
      }
    }
  },
  plugins: [
    // Plugin para classes de densidade
    function({ addUtilities }) {
      addUtilities({
        '.density-compact': {
          '--spacing': '0.5rem',
          '--text-size': '0.875rem',
          '--padding': '0.5rem',
        },
        '.density-comfortable': {
          '--spacing': '1rem',
          '--text-size': '1rem',
          '--padding': '1rem',
        },
        '.density-spacious': {
          '--spacing': '1.5rem',
          '--text-size': '1.125rem',
          '--padding': '1.5rem',
        }
      })
    }
  ]
}
```

### Custom CSS Classes

```css
/* src/styles/responsive.css */
.responsive-container {
  @apply mx-auto;
  width: min(95%, 1920px);
}

@screen xs {
  .responsive-container { width: min(100%, calc(100vw - 2rem)); }
}

@screen sm {
  .responsive-container { width: min(85%, calc(100vw - 2rem)); }
}

@screen md {
  .responsive-container { width: min(90%, calc(100vw - 2rem)); }
}

@screen lg {
  .responsive-container { width: min(92%, calc(100vw - 2rem)); }
}

@screen xl {
  .responsive-container { width: min(94%, calc(100vw - 2rem)); }
}

@screen 2xl {
  .responsive-container { width: min(95%, calc(100vw - 2rem)); }
}

@screen 3xl {
  .responsive-container { width: min(96%, calc(100vw - 2rem)); }
}

/* Adaptive Grid */
.adaptive-grid {
  display: grid;
  gap: 1rem;
  grid-template-columns: repeat(auto-fit, minmax(var(--min-item-width, 300px), 1fr));
}

/* Responsive Table */
.responsive-table {
  @apply w-full overflow-x-auto;
}

.responsive-table table {
  @apply min-w-full;
  min-width: max-content;
}

/* Density Classes */
.density-compact {
  --spacing: 0.5rem;
  --text-size: 0.875rem;
  --padding: 0.5rem;
}

.density-comfortable {
  --spacing: 1rem;
  --text-size: 1rem;
  --padding: 1rem;
}

.density-spacious {
  --spacing: 1.5rem;
  --text-size: 1.125rem;
  --padding: 1.5rem;
}
```

## Testing Strategy

### Responsive Testing Checklist

#### Desktop (1920px+)
- [ ] Container usa 96% da largura
- [ ] Grid mostra 6 colunas de estudantes
- [ ] Header é compacto (altura reduzida)
- [ ] Planilha usa largura total
- [ ] Densidade compacta aplicada

#### Desktop Medium (1280-1536px)
- [ ] Container usa 94-95% da largura
- [ ] Grid mostra 4-5 colunas
- [ ] Sidebar pode ser fixa
- [ ] Formulários em multi-coluna

#### Tablet Landscape (768-1024px)
- [ ] Container usa 90% da largura
- [ ] Grid mostra 3 colunas
- [ ] Navegação acessível
- [ ] Touch targets adequados

#### Tablet Portrait (600-768px)
- [ ] Container usa 85% da largura
- [ ] Grid mostra 2 colunas
- [ ] Sidebar colapsável
- [ ] Densidade confortável

#### Mobile (<600px)
- [ ] Padding mínimo mantido
- [ ] Grid mostra 1-2 colunas
- [ ] Navegação drawer
- [ ] Densidade espaçosa

### Performance Considerations

- **Lazy Loading** - Componentes pesados carregados sob demanda
- **Virtualization** - Listas grandes virtualizadas
- **Memoization** - Cálculos de layout memoizados
- **Debounced Resize** - Handlers de resize com debounce
- **CSS-in-JS Optimization** - Estilos calculados apenas quando necessário
# Design Document

## Overview

Esta implementação cria um sistema de layout desktop otimizado usando CSS Variables, componente PageShell reutilizável, e cálculos de viewport para máximo aproveitamento de espaço. A solução elimina "engargalamento" de conteúdo, implementa toolbars sticky, e garante estabilidade em qualquer zoom através de unidades fluidas.

## Architecture

### CSS Variables System
- Variáveis globais para dimensões fluidas usando clamp()
- Sistema de densidade com compact/comfortable modes
- Unidades viewport (svh) para cálculos de altura
- Responsividade baseada em CSS custom properties

### Component Structure
```
PageShell (wrapper principal)
├── Header (hero compacto/normal)
├── Toolbar (sticky com backdrop-blur)
├── Main (conteúdo flex-1)
└── Footer (não-sticky)
```

### Layout Calculation Strategy
- Largura: `min(1600px, 95vw)` para aproveitamento máximo
- Altura: `calc(100svh - var(--toolbar-h) - var(--footer-h) - gutters)`
- Gutters: `clamp(12px, 1.6vw, 24px)` para adaptação fluida

## Components and Interfaces

### 1. CSS Variables (src/styles/page-shell.css)

```css
:root {
  /* Layout dimensions */
  --shell-max-w: min(1600px, 95vw);
  --shell-gutter: clamp(12px, 1.6vw, 24px);
  --hero-h: clamp(56px, 8svh, 120px);
  --toolbar-h: clamp(44px, 6svh, 64px);
  --footer-h: clamp(56px, 7svh, 96px);
  
  /* Density system */
  --row-h: 44px;     /* comfortable */
  --cell-px: 12px;
}

[data-density="compact"] {
  --row-h: 36px;
  --cell-px: 8px;
}
```

### 2. PageShell Component Interface

```typescript
interface PageShellProps {
  title?: string;
  hero?: boolean;           // true = hero normal, false = compacto
  actions?: React.ReactNode; // toolbar content
  idToolbar?: string;       // para cálculos de altura
  className?: string;
  children: React.ReactNode;
}
```

### 3. Responsive Table Interface

```typescript
interface ResponsiveTableProps {
  height?: string; // default: calc(100svh - var(--toolbar-h) - var(--footer-h) - 80px)
  density?: 'compact' | 'comfortable';
  children: React.ReactNode;
}
```

## Data Models

### Layout Configuration
```typescript
type LayoutConfig = {
  maxWidth: string;        // var(--shell-max-w)
  gutter: string;          // var(--shell-gutter)
  heroHeight: string;      // var(--hero-h)
  toolbarHeight: string;   // var(--toolbar-h)
  footerHeight: string;    // var(--footer-h)
};

type DensityMode = 'compact' | 'comfortable';

type PageConfig = {
  title: string;
  heroMode: boolean;
  density: DensityMode;
  toolbarId: string;
};
```

## Implementation Strategy

### Phase 1: CSS Foundation
1. Criar `src/styles/page-shell.css` com variáveis globais
2. Importar CSS no `src/main.tsx`
3. Configurar sistema de densidade via data attributes

### Phase 2: PageShell Component
1. Implementar componente base com layout flex
2. Hero adaptável (compacto vs normal)
3. Toolbar sticky com backdrop-blur
4. Main area com flex-1 para ocupar espaço restante
5. Footer não-sticky

### Phase 3: Table/Grid Integration
1. Wrapper para tabelas com altura calculada
2. Integração com CSS variables para densidade
3. Overflow handling (vertical auto, horizontal conforme necessário)

### Phase 4: Page Migration
1. Migrar páginas Estudantes, Programas, Designações
2. Configurar hero={false} para páginas internas
3. Implementar toolbars específicas de cada página
4. Manter Dashboard com hero={true}

## Responsive Behavior

### Breakpoints Strategy
- Usar clamp() ao invés de breakpoints fixos
- Adaptação fluida baseada em viewport units
- Grid toolbar que se reorganiza naturalmente

### Zoom Stability
- Evitar px fixos em dimensões críticas
- Usar calc() com viewport units
- CSS variables permitem ajustes centralizados

### Mobile Compatibility
- PageShell mantém responsividade existente
- Gutters se adaptam via clamp()
- Toolbar permanece funcional em telas pequenas

## Error Handling

### Layout Fallbacks
- Valores padrão para CSS variables não suportadas
- Fallback para altura mínima se calc() falhar
- Graceful degradation para navegadores antigos

### Content Overflow
- Scroll vertical automático em tabelas
- Horizontal scroll apenas quando necessário
- Prevent body scroll quando grid tem scroll interno

## Testing Strategy

### Visual Regression Tests
- Screenshots em diferentes zooms (80%, 100%, 125%, 150%)
- Teste em resoluções 1366x768, 1920x1080, 2560x1440
- Verificação de sticky toolbar em scroll

### Functional Tests
- Densidade toggle funcional
- Toolbar actions acessíveis durante scroll
- Layout não quebra com conteúdo dinâmico

### Performance Tests
- CSS variables não impactam rendering
- Smooth scroll com sticky elements
- Memory usage com tabelas grandes

## Migration Plan

### Existing Components
- Manter componentes responsive existentes
- PageShell como wrapper adicional
- Gradual migration sem breaking changes

### CSS Integration
- page-shell.css complementa responsive.css existente
- Não conflita com Tailwind utilities
- CSS variables têm precedência sobre utilities quando necessário

## Browser Support

### Modern Features Used
- CSS Custom Properties (variables)
- clamp() function
- Viewport units (svh)
- backdrop-filter
- Sticky positioning

### Fallback Strategy
- Progressive enhancement approach
- Graceful degradation para IE11+ (se necessário)
- Feature detection via CSS @supports
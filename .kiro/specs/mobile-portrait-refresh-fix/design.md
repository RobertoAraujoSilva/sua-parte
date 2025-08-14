# Design Document - Mobile Portrait & SPA Refresh Fix

## Overview

Este documento detalha a arquitetura técnica para resolver problemas críticos de UX em dispositivos móveis e implementar refresh resiliente para SPA. O foco é em correções pontuais e eficazes que melhorem imediatamente a experiência do usuário.

## Architecture

### Component Structure
```
src/
├── sw-register.ts          # Service Worker registration with cache cleanup
├── app/
│   ├── estudantes/page.tsx # Fixed title and responsive tabs
│   └── programas/page.tsx  # Hide dev tools in production
├── components/
│   ├── ui/
│   │   ├── skeleton-list.tsx    # Loading skeleton component
│   │   └── empty-state.tsx      # Error state with retry
│   └── layout/
│       ├── quick-actions.tsx    # Responsive action bar
│       └── mobile-tabs.tsx      # Horizontal scrolling tabs
└── hooks/
    └── use-timeout-fetch.ts     # Fetch with timeout and error handling
```

### File Changes Required
```
public/
├── 404.html               # SPA fallback (copy of index.html)
└── static.json           # Render.com routing config

src/
├── main.tsx              # Import SW register
├── sw-register.ts        # New: SW registration + cache cleanup
└── app/
    ├── estudantes/page.tsx   # Fix title + responsive tabs
    └── programas/page.tsx    # Hide dev fields
```

## Components and Interfaces

### 1. Service Worker Registration (`src/sw-register.ts`)

```typescript
// Service Worker with cache cleanup on chunk errors
interface SWRegister {
  register(): void;
  handleChunkError(event: ErrorEvent): Promise<void>;
  clearCaches(): Promise<void>;
}

const swRegister: SWRegister = {
  register() {
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js').catch(() => {});
      });
    }
  },

  async handleChunkError(event: ErrorEvent) {
    const msg = String(event?.message || '');
    if (/ChunkLoadError|Loading chunk \d+ failed/i.test(msg)) {
      await this.clearCaches();
      location.reload();
    }
  },

  async clearCaches() {
    if ('caches' in window) {
      for (const cacheName of await caches.keys()) {
        await caches.delete(cacheName);
      }
    }
  }
};
```

### 2. Timeout Fetch Hook (`src/hooks/use-timeout-fetch.ts`)

```typescript
interface TimeoutFetchState<T> {
  data: T | null;
  loading: boolean;
  error: boolean;
  refetch: () => Promise<void>;
}

function useTimeoutFetch<T>(
  fetchFn: () => Promise<T>,
  timeout: number = 10000
): TimeoutFetchState<T> {
  const [state, setState] = useState({
    data: null,
    loading: true,
    error: false
  });

  const withTimeout = <T>(promise: Promise<T>, ms: number): Promise<T> => {
    return Promise.race([
      promise,
      new Promise<never>((_, reject) => 
        setTimeout(() => reject(new Error('timeout')), ms)
      )
    ]);
  };

  const refetch = async () => {
    setState(prev => ({ ...prev, loading: true, error: false }));
    try {
      const data = await withTimeout(fetchFn(), timeout);
      setState({ data, loading: false, error: false });
    } catch (error) {
      setState(prev => ({ ...prev, loading: false, error: true }));
    }
  };

  return { ...state, refetch };
}
```

### 3. Responsive Quick Actions (`src/components/layout/quick-actions.tsx`)

```typescript
interface QuickActionsProps {
  onGenerate: () => void;
  onRegenerate: () => void;
  onExportPDF: () => void;
  loading?: boolean;
}

export function QuickActions({ onGenerate, onRegenerate, onExportPDF, loading }: QuickActionsProps) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <Button 
        className="order-1" 
        onClick={onGenerate}
        disabled={loading}
      >
        Gerar Designações Automáticas
      </Button>
      <Button 
        variant="secondary" 
        className="order-2"
        onClick={onRegenerate}
        disabled={loading}
      >
        Regenerar Semana
      </Button>
      <Button 
        variant="outline" 
        className="order-3"
        onClick={onExportPDF}
        disabled={loading}
      >
        Exportar PDF
      </Button>
    </div>
  );
}
```

### 4. Mobile Tabs (`src/components/layout/mobile-tabs.tsx`)

```typescript
interface MobileTabsProps {
  tabs: Array<{
    id: string;
    label: string;
    active?: boolean;
    onClick: () => void;
  }>;
}

export function MobileTabs({ tabs }: MobileTabsProps) {
  return (
    <nav className="flex gap-2 overflow-x-auto scrollbar-none snap-x px-4">
      {tabs.map((tab) => (
        <Button
          key={tab.id}
          variant={tab.active ? "default" : "ghost"}
          className="shrink-0 snap-start"
          onClick={tab.onClick}
        >
          {tab.label}
        </Button>
      ))}
    </nav>
  );
}
```

### 5. Skeleton List (`src/components/ui/skeleton-list.tsx`)

```typescript
export function SkeletonList({ count = 5 }: { count?: number }) {
  return (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="flex items-center space-x-4">
          <Skeleton className="h-12 w-12 rounded-full" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-[250px]" />
            <Skeleton className="h-4 w-[200px]" />
          </div>
        </div>
      ))}
    </div>
  );
}
```

### 6. Empty State (`src/components/ui/empty-state.tsx`)

```typescript
interface EmptyStateProps {
  title: string;
  description?: string;
  action?: React.ReactNode;
  icon?: React.ReactNode;
}

export function EmptyState({ title, description, action, icon }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      {icon && <div className="mb-4 text-muted-foreground">{icon}</div>}
      <h3 className="text-lg font-semibold">{title}</h3>
      {description && (
        <p className="mt-2 text-sm text-muted-foreground max-w-sm">
          {description}
        </p>
      )}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
```

## Data Models

### SPA Routing Configuration

```json
// public/static.json (for Render.com)
{
  "routes": [
    { "src": "/(.*)", "dest": "/index.html" }
  ]
}
```

### Safe Area CSS Variables

```css
/* Applied to main layout and FAB positioning */
:root {
  --safe-area-bottom: env(safe-area-inset-bottom, 0px);
  --fab-bottom: calc(16px + var(--safe-area-bottom));
  --content-bottom: calc(80px + var(--safe-area-bottom));
}
```

## Error Handling

### 1. Chunk Loading Errors
- **Detection**: Listen for `ChunkLoadError` and `Loading chunk failed` messages
- **Recovery**: Clear all caches and reload page
- **Prevention**: Service worker handles cache invalidation

### 2. Network Timeouts
- **Timeout**: 10 seconds for data fetching
- **Fallback**: Show error state with retry button
- **UX**: Skeleton loading → Error state → Retry

### 3. SPA Routing Failures
- **Fallback**: `404.html` serves the main app
- **Recovery**: React Router handles client-side routing
- **Backup**: Static routing configuration for hosting

## Testing Strategy

### Manual Testing Checklist

#### Portrait Mode (768×1024)
- [ ] `/dashboard` - Quick actions wrap properly
- [ ] `/designacoes` - Action bar maintains order
- [ ] `/programas` - No dev fields in production
- [ ] `/estudantes` - Title correct, tabs scroll horizontally

#### SPA Refresh
- [ ] F5 on `/estudantes` loads app
- [ ] F5 on `/programas` loads app  
- [ ] F5 on `/designacoes` loads app
- [ ] Direct URL access works

#### Loading & Error States
- [ ] Network off → skeleton → error with retry
- [ ] Timeout (>10s) → error state
- [ ] Retry button refetches data
- [ ] Chunk error → cache clear → reload

#### Safe Area
- [ ] FAB respects bottom safe area
- [ ] Content doesn't touch dock
- [ ] Scrolling works with safe area

### Automated Tests

```typescript
// cypress/e2e/mobile-portrait.cy.ts
describe('Mobile Portrait Fixes', () => {
  beforeEach(() => {
    cy.viewport(768, 1024); // Portrait tablet
  });

  it('should show correct title in estudantes', () => {
    cy.visit('/estudantes');
    cy.contains('Gestão de Estudantes').should('be.visible');
    cy.contains('Gestão de Estudantes de Estudantes').should('not.exist');
  });

  it('should hide dev fields in production', () => {
    cy.visit('/programas');
    // Assuming production build
    cy.get('[data-testid="dev-edit-field"]').should('not.exist');
  });

  it('should handle horizontal tab scrolling', () => {
    cy.visit('/estudantes');
    cy.get('[data-testid="mobile-tabs"]').should('have.css', 'overflow-x', 'auto');
  });
});
```

## Implementation Priority

### Phase 1: Critical Fixes (Day 1)
1. **Resolve vite.config.ts conflict** ✅
2. **Create 404.html fallback** - Copy index.html
3. **Fix estudantes title** - Remove duplication
4. **Hide dev fields in programas** - Use import.meta.env.DEV

### Phase 2: UX Improvements (Day 1)
5. **Implement timeout fetch hook** - 10s timeout + retry
6. **Add skeleton loading states** - Replace infinite spinners
7. **Create responsive quick actions** - Proper wrapping
8. **Implement horizontal tabs** - Smooth scrolling

### Phase 3: Polish (Day 1)
9. **Add safe area support** - FAB and content positioning
10. **Register service worker** - Cache cleanup on errors
11. **Create static.json** - Render.com routing
12. **Manual testing** - All viewports and scenarios

## Deployment Considerations

### Render.com Configuration
- Ensure `public/404.html` is deployed
- Add `static.json` for SPA routing
- Verify service worker registration

### Cache Strategy
- Service worker clears cache on chunk errors
- Manual cache invalidation on deployment
- Graceful fallback for offline scenarios

### Performance Impact
- Minimal bundle size increase
- Improved perceived performance with skeletons
- Better error recovery reduces support requests
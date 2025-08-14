# Implementation Plan - Mobile Portrait & SPA Refresh Fix

## Phase 1: Critical Fixes (Immediate)

- [ ] 1.1 Resolve vite.config.ts merge conflict
  - Clean up merge conflict markers in vite.config.ts
  - Keep the complete configuration with jspdf optimization
  - Test that `npm run dev` and `npm run build` work
  - _Requirements: Development environment stability_

- [ ] 1.2 Create SPA fallback for refresh
  - Copy `public/index.html` to `public/404.html` for SPA routing fallback
  - Create `public/static.json` with route configuration for Render.com
  - Test F5 refresh on `/estudantes`, `/programas`, `/designacoes` routes
  - _Requirements: 2.1, 2.3_

- [ ] 1.3 Fix estudantes page title duplication
  - Update `src/app/estudantes/page.tsx` Hero component title
  - Change from "Gestão de Estudantes de Estudantes" to "Gestão de Estudantes"
  - Verify title appears correctly in all viewports
  - _Requirements: 1.1_

- [ ] 1.4 Hide development fields in production
  - Update `src/app/programas/page.tsx` to wrap dev tools with `import.meta.env.DEV`
  - Ensure edit fields only appear in development environment
  - Test in both dev and production builds
  - _Requirements: 1.2, 5.1, 5.2_

## Phase 2: UX Improvements

- [ ] 2.1 Implement timeout fetch hook
  - Create `src/hooks/use-timeout-fetch.ts` with 10-second timeout
  - Add Promise.race implementation for timeout handling
  - Include error state management and refetch functionality
  - _Requirements: 3.1, 3.2_

- [ ] 2.2 Create skeleton loading components
  - Create `src/components/ui/skeleton-list.tsx` for list loading states
  - Replace infinite spinners with skeleton components in estudantes page
  - Add configurable skeleton count and styling
  - _Requirements: 3.1_

- [ ] 2.3 Create error state with retry
  - Create `src/components/ui/empty-state.tsx` for error handling
  - Add "Tentar novamente" button functionality
  - Include clear error messages and recovery actions
  - _Requirements: 3.2, 3.3_

- [ ] 2.4 Implement responsive quick actions
  - Create `src/components/layout/quick-actions.tsx` component
  - Add flex-wrap with proper order (Gerar → Regenerar → Exportar)
  - Apply to dashboard and designacoes pages
  - _Requirements: 1.3, 4.2_

- [ ] 2.5 Create horizontal scrolling tabs
  - Create `src/components/layout/mobile-tabs.tsx` component
  - Add overflow-x-auto with snap scrolling
  - Apply shrink-0 to prevent tab text wrapping
  - Update estudantes page to use new tab component
  - _Requirements: 1.4, 4.3_

## Phase 3: Polish & Safety

- [ ] 3.1 Add safe area support
  - Update main layout with `pb-[calc(80px+env(safe-area-inset-bottom))]`
  - Position FAB with `bottom-[calc(16px+env(safe-area-inset-bottom))]`
  - Test on Android devices with navigation dock
  - _Requirements: 4.1, 4.4_

- [ ] 3.2 Implement service worker registration
  - Create `src/sw-register.ts` with cache cleanup on chunk errors
  - Add error event listener for ChunkLoadError detection
  - Import service worker registration in `src/main.tsx`
  - _Requirements: 2.2_

- [ ] 3.3 Update estudantes page with new hooks
  - Replace existing loading logic with `use-timeout-fetch` hook
  - Implement skeleton loading state
  - Add error state with retry functionality
  - _Requirements: 3.1, 3.2, 3.3_

- [ ] 3.4 Apply mobile responsive fixes
  - Update estudantes page with mobile tabs component
  - Apply quick actions to dashboard and designacoes pages
  - Ensure all responsive breakpoints work correctly
  - _Requirements: 1.3, 1.4, 4.2, 4.3_

## Phase 4: Testing & Validation

- [ ] 4.1 Manual testing - Portrait mode (768×1024)
  - Test `/dashboard` quick actions wrapping
  - Test `/designacoes` action bar order
  - Test `/programas` no dev fields in production
  - Test `/estudantes` correct title and horizontal tabs
  - _Requirements: All mobile requirements_

- [ ] 4.2 Manual testing - SPA refresh
  - Test F5 refresh on `/estudantes` loads app correctly
  - Test F5 refresh on `/programas` loads app correctly
  - Test F5 refresh on `/designacoes` loads app correctly
  - Test direct URL access works for all routes
  - _Requirements: 2.1, 2.3_

- [ ] 4.3 Manual testing - Loading & error states
  - Test network offline → skeleton → error with retry
  - Test timeout (>10s) → error state appears
  - Test retry button refetches data successfully
  - Test chunk error triggers cache clear and reload
  - _Requirements: 3.1, 3.2, 3.3_

- [ ] 4.4 Manual testing - Safe area
  - Test FAB respects bottom safe area on Android
  - Test content doesn't touch navigation dock
  - Test scrolling works properly with safe area padding
  - _Requirements: 4.1, 4.4_

## Commit Strategy

### Commit 1: Critical Infrastructure
```bash
git add vite.config.ts public/404.html public/static.json
git commit -m "fix(spa): resolve vite config conflict + refresh fallback (404.html + static.json)"
```

### Commit 2: Mobile Layout Fixes
```bash
git add src/app/estudantes/page.tsx src/app/programas/page.tsx
git commit -m "fix(mobile): correct estudantes title + hide dev fields in production"
```

### Commit 3: Loading & Error Handling
```bash
git add src/hooks/use-timeout-fetch.ts src/components/ui/skeleton-list.tsx src/components/ui/empty-state.tsx
git commit -m "feat(ux): timeout fetch hook + skeleton loading + error retry states"
```

### Commit 4: Responsive Components
```bash
git add src/components/layout/quick-actions.tsx src/components/layout/mobile-tabs.tsx
git commit -m "feat(mobile): responsive quick actions + horizontal scrolling tabs"
```

### Commit 5: Service Worker & Safe Area
```bash
git add src/sw-register.ts src/main.tsx
git commit -m "feat(pwa): service worker registration + cache cleanup + safe area support"
```

### Commit 6: Integration & Polish
```bash
git add src/app/estudantes/page.tsx src/pages/Dashboard.tsx src/pages/Designacoes.tsx
git commit -m "feat(integration): apply mobile fixes to all pages + timeout fetch integration"
```

## Testing Checklist

### Pre-commit Testing
- [ ] `npm run dev` starts without errors
- [ ] `npm run build` completes successfully
- [ ] `npm run preview` serves the built app
- [ ] All TypeScript errors resolved

### Mobile Testing (Portrait 768×1024)
- [ ] Dashboard quick actions wrap properly
- [ ] Designacoes action bar maintains order
- [ ] Programas hides dev fields in production
- [ ] Estudantes shows correct title and scrollable tabs

### SPA Refresh Testing
- [ ] F5 on each route loads the app
- [ ] Direct URL access works
- [ ] Service worker registers successfully
- [ ] Cache cleanup works on chunk errors

### Error Handling Testing
- [ ] Network offline shows skeleton then error
- [ ] Timeout shows error with retry
- [ ] Retry button works
- [ ] Loading states are smooth

## Success Criteria

### Performance
- [ ] No increase in bundle size >5%
- [ ] Loading states improve perceived performance
- [ ] Error recovery reduces user frustration

### UX
- [ ] All mobile viewports work correctly
- [ ] No white screen on refresh
- [ ] Clear feedback for all loading/error states
- [ ] Intuitive navigation and actions

### Technical
- [ ] No TypeScript errors
- [ ] All tests pass
- [ ] Service worker registers correctly
- [ ] Safe area respected on all devices
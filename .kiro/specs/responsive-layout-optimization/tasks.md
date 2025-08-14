# Implementation Plan - Responsive Layout Optimization

## Phase 1: Core Infrastructure

- [ ] 1.1 Create responsive hook system
  - Create `src/hooks/use-responsive.ts` with breakpoint detection
  - Add window resize listener with debounce
  - Export breakpoint states (isMobile, isTablet, isDesktop, isLarge)
  - Include current width/height values
  - _Requirements: 1.1, 1.2, 1.3, 1.4_

- [ ] 1.2 Implement responsive container system
  - Create `src/components/layout/responsive-container.tsx`
  - Add adaptive width classes (85% → 96% based on screen size)
  - Support maxWidth props (sm, md, lg, xl, 2xl, 3xl, full)
  - Include configurable padding options
  - _Requirements: 1.1, 1.2, 1.3, 1.4_

- [ ] 1.3 Create density provider system
  - Create `src/components/ui/density-provider.tsx`
  - Implement density context (compact, comfortable, spacious)
  - Auto-adapt density based on screen size
  - Export useDensity hook for components
  - _Requirements: 4.1, 4.2, 4.3, 7.1, 7.2, 7.3_

- [ ] 1.4 Build adaptive grid system
  - Create `src/components/layout/adaptive-grid.tsx`
  - Use CSS Grid with auto-fit and minmax
  - Support configurable minimum item width
  - Add responsive gap classes
  - _Requirements: 2.1, 2.2, 2.3_

## Phase 2: Component Updates

- [ ] 2.1 Optimize header for different screen sizes
  - Create `src/components/layout/responsive-header.tsx`
  - Reduce header height on desktop (h-10 vs h-14)
  - Implement compact navigation for large screens
  - Add responsive logo/brand sizing
  - _Requirements: 3.1, 3.2, 3.4, 7.4_

- [ ] 2.2 Update students grid for more columns
  - Update `src/components/students/StudentsGridAG.tsx`
  - Use AdaptiveGrid with minItemWidth=280px
  - Show 2 cols mobile → 3 tablet → 4-6 desktop
  - Maintain card readability at all sizes
  - _Requirements: 2.1, 2.2_

- [ ] 2.3 Create full-width responsive table
  - Create `src/components/ui/responsive-table.tsx`
  - Use ResponsiveContainer with maxWidth="full"
  - Add horizontal scroll with smooth scrollbars
  - Implement sticky columns for important data
  - Support dynamic column sizing
  - _Requirements: 5.1, 5.2, 5.3, 5.4_

- [ ] 2.4 Implement responsive cards
  - Create `src/components/ui/adaptive-card.tsx`
  - Use density provider for padding and text sizes
  - Adapt card content density by screen size
  - Maintain touch targets on mobile/tablet
  - _Requirements: 4.1, 4.2, 4.3, 7.5_

## Phase 3: Page-Specific Optimizations

- [ ] 3.1 Optimize estudantes page layout
  - Update `src/pages/Estudantes.tsx` to use ResponsiveContainer
  - Apply AdaptiveGrid to student cards
  - Use responsive header component
  - Implement full-width spreadsheet tab
  - _Requirements: 1.1, 2.1, 5.1_

- [ ] 3.2 Update estudantes spreadsheet tab
  - Update spreadsheet component in estudantes page
  - Use ResponsiveTable with full width
  - Ensure proper column sizing and scroll
  - Optimize for tablet touch interaction
  - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5_

- [ ] 3.3 Optimize programas page
  - Update `src/pages/Programas.tsx` with responsive containers
  - Use AdaptiveGrid for program cards
  - Implement responsive quick actions
  - Optimize upload section layout
  - _Requirements: 2.3, 3.4_

- [ ] 3.4 Enhance dashboard layout
  - Update dashboard to use responsive containers
  - Implement adaptive statistics grid
  - Optimize widget sizing for different screens
  - Use density-aware spacing
  - _Requirements: 2.4, 4.1, 4.2_

- [ ] 3.5 Create responsive forms
  - Create `src/components/forms/responsive-form.tsx`
  - Use multi-column layout on desktop (2-3 cols)
  - Single column on mobile/tablet portrait
  - Adaptive field sizing and spacing
  - _Requirements: 4.4_

## Phase 4: Polish & Advanced Features

- [ ] 4.1 Implement sidebar management
  - Create `src/components/layout/sidebar-manager.tsx`
  - Fixed sidebar on desktop, collapsible on tablet
  - Overlay/drawer on mobile
  - Smart width calculation based on content
  - _Requirements: 6.1, 6.2, 6.3, 6.4_

- [ ] 4.2 Add typography scaling
  - Update base typography classes
  - Implement responsive text sizing
  - Ensure minimum touch targets (44px)
  - Scale headings proportionally
  - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5_

- [ ] 4.3 Optimize debug panel for responsive
  - Update debug panel positioning
  - Adapt size based on screen real estate
  - Ensure doesn't interfere with main content
  - Add responsive toggle behavior
  - _Requirements: 6.5_

- [ ] 4.4 Update Tailwind configuration
  - Add custom breakpoints (xs: 480px, 3xl: 1920px)
  - Create responsive container utilities
  - Add density utility classes
  - Configure custom spacing scale
  - _Requirements: All requirements_

- [ ] 4.5 Create responsive CSS utilities
  - Create `src/styles/responsive.css`
  - Add container width utilities
  - Create adaptive grid classes
  - Add density-based spacing classes
  - _Requirements: All requirements_

## Phase 5: Testing & Validation

- [ ] 5.1 Test desktop layouts (1920px+)
  - Verify 96% container width usage
  - Check 6-column student grid
  - Validate compact header height
  - Test full-width spreadsheet
  - _Requirements: 1.1, 2.1, 3.1, 5.1_

- [ ] 5.2 Test tablet landscape (768-1024px)
  - Verify 90% container width
  - Check 3-column student grid
  - Test touch-friendly interactions
  - Validate sidebar behavior
  - _Requirements: 1.2, 2.1, 3.2, 6.2_

- [ ] 5.3 Test tablet portrait (600-768px)
  - Verify 85% container width
  - Check 2-column student grid
  - Test comfortable density
  - Validate navigation accessibility
  - _Requirements: 1.3, 2.1, 4.2, 3.2_

- [ ] 5.4 Test mobile layouts (<600px)
  - Verify proper padding maintenance
  - Check 1-2 column grids
  - Test spacious density
  - Validate touch targets (min 44px)
  - _Requirements: 1.4, 2.1, 4.3, 7.5_

- [ ] 5.5 Performance testing
  - Test resize performance with debouncing
  - Validate smooth scrolling on tables
  - Check memory usage with responsive hooks
  - Test render performance on grid changes
  - _Requirements: All requirements_

## Implementation Notes

### Priority Order
1. **High Priority**: Container system, responsive hook, students spreadsheet
2. **Medium Priority**: Grid system, header optimization, cards
3. **Low Priority**: Sidebar management, typography scaling, debug panel

### Technical Considerations
- Use CSS Grid and Flexbox for layouts
- Implement proper debouncing for resize events
- Ensure accessibility at all screen sizes
- Maintain performance with efficient re-renders
- Test on real devices, not just browser dev tools

### Breakpoint Strategy
```typescript
// Mobile-first approach
const breakpoints = {
  xs: 480,   // Large mobile
  sm: 640,   // Tablet portrait
  md: 768,   // Tablet landscape
  lg: 1024,  // Desktop small
  xl: 1280,  // Desktop medium
  '2xl': 1536, // Desktop large
  '3xl': 1920  // Desktop extra large
}
```

### Container Width Strategy
```css
/* Progressive width increase */
mobile: 100% (with min padding)
tablet-portrait: 85%
tablet-landscape: 90%
desktop-small: 92%
desktop-medium: 94%
desktop-large: 95%
desktop-xl: 96%
```

### Grid Column Strategy
```typescript
// Adaptive columns based on screen size
const gridColumns = {
  mobile: 1-2,
  tablet: 2-3,
  desktop: 3-4,
  large: 4-6
}
```

## Success Criteria

### Functional Requirements
- [ ] Spreadsheet uses 100% available width
- [ ] Student grid shows appropriate columns per screen size
- [ ] Header is optimized for each breakpoint
- [ ] Touch targets are minimum 44px on mobile/tablet
- [ ] Content density adapts appropriately

### Performance Requirements
- [ ] Resize events debounced to 150ms
- [ ] No layout thrashing during resize
- [ ] Smooth scrolling on all table/grid components
- [ ] Memory usage stable during responsive changes

### UX Requirements
- [ ] No horizontal scroll on any screen size (except tables)
- [ ] All interactive elements accessible on touch devices
- [ ] Visual hierarchy maintained at all densities
- [ ] Loading states work at all screen sizes
- [ ] Navigation remains accessible on all devices

## Commit Strategy

### Commit 1: Core Infrastructure
```bash
git add src/hooks/use-responsive.ts src/components/layout/responsive-container.tsx
git commit -m "feat(responsive): core infrastructure - responsive hook + adaptive containers"
```

### Commit 2: Grid and Density Systems
```bash
git add src/components/layout/adaptive-grid.tsx src/components/ui/density-provider.tsx
git commit -m "feat(responsive): adaptive grid system + density provider"
```

### Commit 3: Component Updates
```bash
git add src/components/layout/responsive-header.tsx src/components/ui/responsive-table.tsx
git commit -m "feat(responsive): optimized header + full-width table component"
```

### Commit 4: Page Optimizations
```bash
git add src/pages/Estudantes.tsx src/pages/Programas.tsx
git commit -m "feat(responsive): optimize estudantes + programas pages for large screens"
```

### Commit 5: Styles and Configuration
```bash
git add tailwind.config.ts src/styles/responsive.css
git commit -m "feat(responsive): tailwind config + responsive utilities"
```
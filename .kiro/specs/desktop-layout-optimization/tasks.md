# Implementation Plan

- [x] 1. Create CSS foundation with layout variables





  - Create `src/styles/page-shell.css` with CSS custom properties for layout dimensions
  - Implement density system with compact/comfortable modes using data attributes
  - Add clamp() functions for responsive dimensions (shell-max-w, gutters, heights)
  - Import CSS in `src/main.tsx` for global availability
  - _Requirements: 1.1, 1.2, 5.1, 5.2, 6.1_

- [x] 2. Implement PageShell component





  - Create `src/components/layout/PageShell.tsx` with TypeScript interface
  - Implement flex layout structure (header, toolbar, main, footer)
  - Add hero section with conditional height (normal vs compact mode)
  - Implement sticky toolbar with backdrop-blur and z-index management
  - Configure main area with flex-1 to occupy remaining viewport height
  - Add non-sticky footer positioned after content area
  - _Requirements: 2.1, 2.2, 3.1, 4.1, 4.2, 8.1, 8.2, 8.3_

- [x] 3. Create responsive table wrapper component





  - Implement table container with calculated height using CSS variables
  - Add height calculation: `calc(100svh - var(--toolbar-h) - var(--footer-h) - gutters)`
  - Configure overflow handling (vertical auto, horizontal as needed)
  - Integrate density system for row heights and cell padding
  - Add support for different breakpoints with responsive height adjustments
  - _Requirements: 2.1, 2.2, 5.1, 5.2, 6.2_

- [x] 4. Implement intelligent toolbar with grid layout





  - Create toolbar component with CSS Grid layout using "1fr auto auto auto" columns
  - Position filters/tabs on the left, action buttons on the right
  - Ensure natural wrapping behavior on smaller screens
  - Integrate with PageShell sticky toolbar system
  - Add proper spacing and alignment for different button types
  - _Requirements: 4.1, 4.3, 7.1, 7.2, 7.3_

- [x] 5. Migrate Estudantes page to PageShell





  - Update Estudantes page component to use PageShell wrapper
  - Configure hero={false} for compact header layout
  - Implement EstudantesToolbar component with grid layout
  - Integrate StudentSpreadsheet with responsive table wrapper
  - Remove existing container constraints and use fluid width system
  - Test layout at different zoom levels and screen sizes
  - _Requirements: 1.1, 2.1, 3.1, 4.1, 8.1, 8.2_

- [x] 6. Migrate Programas page to PageShell





  - Update Programas page component to use PageShell wrapper
  - Configure hero={false} for compact header layout
  - Implement ProgramasToolbar component with action buttons
  - Integrate programs data grid with responsive table wrapper
  - Ensure proper height calculation and sticky toolbar functionality
  - _Requirements: 1.1, 2.1, 3.1, 4.1, 8.1, 8.2_

- [x] 7. Migrate Designações page to PageShell





  - Update Designações page component to use PageShell wrapper
  - Configure hero={false} for compact header layout
  - Implement DesignacoesToolbar component with relevant actions
  - Integrate designations data display with responsive container
  - Test full viewport height utilization and toolbar stickiness
  - _Requirements: 1.1, 2.1, 3.1, 4.1, 8.1, 8.2_

- [x] 8. Update Tailwind configuration for large screens





  - Add 3xl breakpoint (1920px) to Tailwind config if not present
  - Ensure no conflicts between Tailwind utilities and CSS variables
  - Verify container utility is not interfering with fluid width system
  - Test responsive behavior across all breakpoints
  - _Requirements: 1.2, 6.1, 6.3_

- [x] 9. Implement density toggle functionality (optional)





  - Create density context or state management for compact/comfortable modes
  - Add toggle button in toolbar or settings area
  - Implement data-density attribute switching on document root
  - Ensure smooth transition between density modes
  - Test density changes with different table sizes and content
  - _Requirements: 5.1, 5.2, 5.3_

- [x] 10. Add comprehensive zoom and responsiveness testing





  - Test layout stability at 80%, 100%, 125%, and 150% zoom levels
  - Verify sticky toolbar behavior during scroll at different zooms
  - Test fluid width adaptation on 1366x768, 1920x1080, and 2560x1440 resolutions
  - Ensure no horizontal scrollbars appear unless intended
  - Validate calc() height calculations work correctly across all scenarios
  - _Requirements: 6.1, 6.2, 6.3_

- [ ] 11. Optimize existing responsive components integration




  - Ensure PageShell works with existing responsive-header component
  - Integrate with adaptive-grid system where applicable
  - Verify compatibility with responsive-table component
  - Test interaction with use-responsive hook
  - Maintain backward compatibility with existing responsive system
  - _Requirements: 1.3, 2.3, 8.1_

- [ ] 12. Create commit with all page migrations and CSS updates
  - Commit changes to all three pages (Estudantes, Programas, Designações)
  - Include page-shell.css and PageShell.tsx component
  - Update main.tsx with CSS import
  - Include any Tailwind config updates
  - Write descriptive commit message covering layout optimization improvements
  - _Requirements: All requirements integrated_
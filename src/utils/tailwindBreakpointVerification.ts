/**
 * Utility functions to verify Tailwind configuration and CSS variables compatibility
 * Tests for task 8: Update Tailwind configuration for large screens
 */

export interface BreakpointTest {
  name: string;
  minWidth: number;
  maxWidth?: number;
  expected: string;
}

export const breakpointTests: BreakpointTest[] = [
  { name: 'xs', minWidth: 480, maxWidth: 639, expected: 'xs breakpoint active' },
  { name: 'sm', minWidth: 640, maxWidth: 767, expected: 'sm breakpoint active' },
  { name: 'md', minWidth: 768, maxWidth: 1023, expected: 'md breakpoint active' },
  { name: 'lg', minWidth: 1024, maxWidth: 1279, expected: 'lg breakpoint active' },
  { name: 'xl', minWidth: 1280, maxWidth: 1535, expected: 'xl breakpoint active' },
  { name: '2xl', minWidth: 1536, maxWidth: 1919, expected: '2xl breakpoint active' },
  { name: '3xl', minWidth: 1920, expected: '3xl breakpoint active' },
];

/**
 * Check if CSS variables are properly defined
 */
export function verifyCSSVariables(): Record<string, string | null> {
  const root = document.documentElement;
  const computedStyle = getComputedStyle(root);
  
  const variables = [
    '--shell-max-w',
    '--shell-gutter', 
    '--hero-h',
    '--toolbar-h',
    '--footer-h',
    '--row-h',
    '--cell-px',
    '--cell-py'
  ];

  const results: Record<string, string | null> = {};
  
  variables.forEach(variable => {
    results[variable] = computedStyle.getPropertyValue(variable).trim() || null;
  });

  return results;
}

/**
 * Test if container utility conflicts with CSS variables
 */
export function testContainerConflicts(): {
  containerWidth: string;
  shellMaxWidth: string;
  hasConflict: boolean;
} {
  // Create test elements
  const containerEl = document.createElement('div');
  containerEl.className = 'container mx-auto';
  containerEl.style.visibility = 'hidden';
  containerEl.style.position = 'absolute';
  
  const shellEl = document.createElement('div');
  shellEl.className = 'fluid-width';
  shellEl.style.visibility = 'hidden';
  shellEl.style.position = 'absolute';
  
  document.body.appendChild(containerEl);
  document.body.appendChild(shellEl);
  
  const containerStyle = getComputedStyle(containerEl);
  const shellStyle = getComputedStyle(shellEl);
  
  const containerWidth = containerStyle.maxWidth;
  const shellMaxWidth = shellStyle.maxWidth;
  
  // Clean up
  document.body.removeChild(containerEl);
  document.body.removeChild(shellEl);
  
  // Check for conflicts (they should be different systems)
  const hasConflict = containerWidth === shellMaxWidth && containerWidth !== 'none';
  
  return {
    containerWidth,
    shellMaxWidth,
    hasConflict
  };
}

/**
 * Test responsive behavior at different viewport widths
 */
export function testResponsiveBehavior(): {
  currentBreakpoint: string;
  viewportWidth: number;
  cssVariableValues: Record<string, string>;
} {
  const viewportWidth = window.innerWidth;
  let currentBreakpoint = 'base';
  
  // Determine current breakpoint
  for (const test of breakpointTests) {
    if (viewportWidth >= test.minWidth && (!test.maxWidth || viewportWidth <= test.maxWidth)) {
      currentBreakpoint = test.name;
      break;
    }
  }
  
  // Get current CSS variable values
  const cssVariableValues = verifyCSSVariables();
  
  return {
    currentBreakpoint,
    viewportWidth,
    cssVariableValues: cssVariableValues as Record<string, string>
  };
}

/**
 * Test zoom stability by checking if layout breaks at different zoom levels
 */
export function testZoomStability(): {
  devicePixelRatio: number;
  viewportDimensions: { width: number; height: number };
  cssVariablesStable: boolean;
} {
  const devicePixelRatio = window.devicePixelRatio;
  const viewportDimensions = {
    width: window.innerWidth,
    height: window.innerHeight
  };
  
  // Check if CSS variables are still properly calculated
  const variables = verifyCSSVariables();
  const cssVariablesStable = Object.values(variables).every(value => 
    value !== null && value !== '' && !value.includes('NaN')
  );
  
  return {
    devicePixelRatio,
    viewportDimensions,
    cssVariablesStable
  };
}

/**
 * Comprehensive test suite for Tailwind configuration
 */
export function runTailwindConfigTests(): {
  breakpointTests: Record<string, boolean>;
  cssVariables: Record<string, string | null>;
  containerConflicts: ReturnType<typeof testContainerConflicts>;
  responsiveBehavior: ReturnType<typeof testResponsiveBehavior>;
  zoomStability: ReturnType<typeof testZoomStability>;
  overallStatus: 'pass' | 'fail';
} {
  // Test breakpoints
  const breakpointResults: Record<string, boolean> = {};
  const currentWidth = window.innerWidth;
  
  breakpointTests.forEach(test => {
    const isInRange = currentWidth >= test.minWidth && 
      (!test.maxWidth || currentWidth <= test.maxWidth);
    breakpointResults[test.name] = isInRange;
  });
  
  // Run all tests
  const cssVariables = verifyCSSVariables();
  const containerConflicts = testContainerConflicts();
  const responsiveBehavior = testResponsiveBehavior();
  const zoomStability = testZoomStability();
  
  // Determine overall status
  const hasValidCSSVariables = Object.values(cssVariables).every(value => value !== null);
  const noContainerConflicts = !containerConflicts.hasConflict;
  const zoomIsStable = zoomStability.cssVariablesStable;
  
  const overallStatus = hasValidCSSVariables && noContainerConflicts && zoomIsStable ? 'pass' : 'fail';
  
  return {
    breakpointTests: breakpointResults,
    cssVariables,
    containerConflicts,
    responsiveBehavior,
    zoomStability,
    overallStatus
  };
}

/**
 * Log test results to console for debugging
 */
export function logTestResults(): void {
  const results = runTailwindConfigTests();
  
  console.group('🔧 Tailwind Configuration Tests');
  
  console.group('📱 Breakpoint Tests');
  Object.entries(results.breakpointTests).forEach(([breakpoint, active]) => {
    console.log(`${breakpoint}: ${active ? '✅ Active' : '❌ Inactive'}`);
  });
  console.groupEnd();
  
  console.group('🎨 CSS Variables');
  Object.entries(results.cssVariables).forEach(([variable, value]) => {
    console.log(`${variable}: ${value || '❌ Not defined'}`);
  });
  console.groupEnd();
  
  console.group('📦 Container Conflicts');
  console.log(`Container max-width: ${results.containerConflicts.containerWidth}`);
  console.log(`Shell max-width: ${results.containerConflicts.shellMaxWidth}`);
  console.log(`Has conflict: ${results.containerConflicts.hasConflict ? '❌ Yes' : '✅ No'}`);
  console.groupEnd();
  
  console.group('📐 Responsive Behavior');
  console.log(`Current breakpoint: ${results.responsiveBehavior.currentBreakpoint}`);
  console.log(`Viewport width: ${results.responsiveBehavior.viewportWidth}px`);
  console.groupEnd();
  
  console.group('🔍 Zoom Stability');
  console.log(`Device pixel ratio: ${results.zoomStability.devicePixelRatio}`);
  console.log(`Viewport: ${results.zoomStability.viewportDimensions.width}x${results.zoomStability.viewportDimensions.height}`);
  console.log(`CSS variables stable: ${results.zoomStability.cssVariablesStable ? '✅ Yes' : '❌ No'}`);
  console.groupEnd();
  
  console.log(`\n🎯 Overall Status: ${results.overallStatus === 'pass' ? '✅ PASS' : '❌ FAIL'}`);
  console.groupEnd();
}
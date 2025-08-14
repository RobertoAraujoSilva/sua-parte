/**
 * Utility functions for zoom and responsiveness testing
 */

export interface ZoomTestResult {
  zoomLevel: string;
  viewportWidth: number;
  viewportHeight: number;
  layoutStable: boolean;
  stickyToolbar: boolean;
  fluidWidth: boolean;
  noHorizontalScroll: boolean;
  calcHeightValid: boolean;
  details: Record<string, any>;
}

export interface ResolutionTestResult {
  resolution: string;
  width: number;
  height: number;
  optimalLayout: boolean;
  widthUtilization: number;
  details: Record<string, any>;
}

/**
 * Test layout stability at current zoom level
 */
export const testLayoutStability = (): boolean => {
  const pageShell = document.querySelector('[data-testid="page-shell"]') as HTMLElement;
  const toolbar = document.querySelector('[data-testid="toolbar"]') as HTMLElement;
  const mainContent = document.querySelector('[data-testid="main-content"]') as HTMLElement;
  
  if (!pageShell || !toolbar || !mainContent) {
    console.warn('Required layout elements not found for stability test');
    return false;
  }

  const shellRect = pageShell.getBoundingClientRect();
  const toolbarRect = toolbar.getBoundingClientRect();
  const mainRect = mainContent.getBoundingClientRect();

  // Check if elements are properly positioned and sized
  const isStable = shellRect.width > 0 && 
                  toolbarRect.width > 0 && 
                  mainRect.width > 0 &&
                  shellRect.width <= window.innerWidth &&
                  !isNaN(shellRect.width) &&
                  !isNaN(toolbarRect.width) &&
                  !isNaN(mainRect.width);

  return isStable;
};

/**
 * Test sticky toolbar behavior
 */
export const testStickyToolbar = (): boolean => {
  const toolbar = document.querySelector('[data-testid="toolbar"]') as HTMLElement;
  if (!toolbar) {
    console.warn('Toolbar element not found for sticky test');
    return false;
  }

  const computedStyle = window.getComputedStyle(toolbar);
  const isSticky = computedStyle.position === 'sticky' || computedStyle.position === 'fixed';
  const hasBackdrop = computedStyle.backdropFilter !== 'none' || 
                     computedStyle.webkitBackdropFilter !== 'none' ||
                     computedStyle.backdropFilter?.includes('blur') ||
                     computedStyle.webkitBackdropFilter?.includes('blur');

  return isSticky && hasBackdrop;
};

/**
 * Test fluid width adaptation
 */
export const testFluidWidth = (): { isFluid: boolean; utilization: number } => {
  const pageShell = document.querySelector('[data-testid="page-shell"]') as HTMLElement;
  if (!pageShell) {
    console.warn('PageShell element not found for fluid width test');
    return { isFluid: false, utilization: 0 };
  }

  const shellRect = pageShell.getBoundingClientRect();
  const maxExpectedWidth = Math.min(1600, window.innerWidth * 0.95);
  const utilization = (shellRect.width / window.innerWidth) * 100;
  
  const isFluid = shellRect.width <= maxExpectedWidth && 
                 shellRect.width > window.innerWidth * 0.7; // At least 70% utilization

  return { isFluid, utilization };
};

/**
 * Test for horizontal scrollbars
 */
export const testHorizontalScroll = (): boolean => {
  const hasHorizontalScroll = document.documentElement.scrollWidth > document.documentElement.clientWidth;
  return !hasHorizontalScroll; // Return true if NO horizontal scroll (which is good)
};

/**
 * Test CSS calc() height calculations
 */
export const testCalcHeights = (): boolean => {
  const mainContent = document.querySelector('[data-testid="main-content"]') as HTMLElement;
  if (!mainContent) {
    console.warn('Main content element not found for calc height test');
    return false;
  }

  const mainRect = mainContent.getBoundingClientRect();
  const expectedMinHeight = window.innerHeight * 0.3; // Should be at least 30% of viewport
  
  return mainRect.height >= expectedMinHeight && mainRect.height > 0;
};

/**
 * Test CSS variables availability
 */
export const testCSSVariables = (): boolean => {
  const rootStyles = getComputedStyle(document.documentElement);
  const shellMaxW = rootStyles.getPropertyValue('--shell-max-w').trim();
  const toolbarH = rootStyles.getPropertyValue('--toolbar-h').trim();
  const heroH = rootStyles.getPropertyValue('--hero-h').trim();
  const shellGutter = rootStyles.getPropertyValue('--shell-gutter').trim();

  return !!(shellMaxW && toolbarH && heroH && shellGutter);
};

/**
 * Get current zoom level (approximation)
 */
export const getCurrentZoomLevel = (): number => {
  return Math.round((window.outerWidth / window.innerWidth) * 100) / 100;
};

/**
 * Get resolution category
 */
export const getResolutionCategory = (width: number, height: number): string => {
  if (width <= 1366 && height <= 768) {
    return '1366x768 (HD)';
  } else if (width <= 1920 && height <= 1080) {
    return '1920x1080 (FHD)';
  } else if (width >= 2560) {
    return '2560x1440+ (QHD+)';
  }
  return `${width}x${height} (Custom)`;
};

/**
 * Run comprehensive zoom test
 */
export const runZoomTest = (): ZoomTestResult => {
  const zoomLevel = getCurrentZoomLevel();
  const fluidWidthResult = testFluidWidth();
  
  return {
    zoomLevel: `${Math.round(zoomLevel * 100)}%`,
    viewportWidth: window.innerWidth,
    viewportHeight: window.innerHeight,
    layoutStable: testLayoutStability(),
    stickyToolbar: testStickyToolbar(),
    fluidWidth: fluidWidthResult.isFluid,
    noHorizontalScroll: testHorizontalScroll(),
    calcHeightValid: testCalcHeights(),
    details: {
      zoomRatio: zoomLevel,
      widthUtilization: fluidWidthResult.utilization,
      cssVariablesAvailable: testCSSVariables(),
      devicePixelRatio: window.devicePixelRatio
    }
  };
};

/**
 * Run comprehensive resolution test
 */
export const runResolutionTest = (): ResolutionTestResult => {
  const { width, height } = { width: window.innerWidth, height: window.innerHeight };
  const fluidWidthResult = testFluidWidth();
  
  return {
    resolution: getResolutionCategory(width, height),
    width,
    height,
    optimalLayout: testLayoutStability() && fluidWidthResult.isFluid,
    widthUtilization: fluidWidthResult.utilization,
    details: {
      layoutStable: testLayoutStability(),
      stickyToolbar: testStickyToolbar(),
      fluidWidth: fluidWidthResult.isFluid,
      noHorizontalScroll: testHorizontalScroll(),
      calcHeightValid: testCalcHeights(),
      cssVariablesAvailable: testCSSVariables()
    }
  };
};

/**
 * Console testing helper - run this in browser console
 */
export const runConsoleTests = (): void => {
  console.group('🔍 Zoom & Responsiveness Test Results');
  
  const zoomResult = runZoomTest();
  console.group(`📏 Zoom Test (${zoomResult.zoomLevel})`);
  console.log('Layout Stable:', zoomResult.layoutStable ? '✅' : '❌');
  console.log('Sticky Toolbar:', zoomResult.stickyToolbar ? '✅' : '❌');
  console.log('Fluid Width:', zoomResult.fluidWidth ? '✅' : '❌');
  console.log('No H-Scroll:', zoomResult.noHorizontalScroll ? '✅' : '❌');
  console.log('Calc Heights:', zoomResult.calcHeightValid ? '✅' : '❌');
  console.log('Details:', zoomResult.details);
  console.groupEnd();
  
  const resolutionResult = runResolutionTest();
  console.group(`🖥️ Resolution Test (${resolutionResult.resolution})`);
  console.log('Optimal Layout:', resolutionResult.optimalLayout ? '✅' : '❌');
  console.log('Width Utilization:', `${resolutionResult.widthUtilization.toFixed(1)}%`);
  console.log('Details:', resolutionResult.details);
  console.groupEnd();
  
  console.groupEnd();
};

// Make functions available globally for console testing
if (typeof window !== 'undefined') {
  (window as any).zoomResponsivenessUtils = {
    runZoomTest,
    runResolutionTest,
    runConsoleTests,
    testLayoutStability,
    testStickyToolbar,
    testFluidWidth,
    testHorizontalScroll,
    testCalcHeights,
    testCSSVariables,
    getCurrentZoomLevel,
    getResolutionCategory
  };
}
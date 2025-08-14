/**
 * Comprehensive Zoom and Responsiveness Testing Script
 * 
 * This script can be run in the browser console to test layout behavior
 * at different zoom levels and resolutions.
 * 
 * Usage:
 * 1. Open the application in browser
 * 2. Navigate to a page with PageShell (e.g., /estudantes, /programas, /designacoes)
 * 3. Open browser console (F12)
 * 4. Copy and paste this script
 * 5. Run: testZoomResponsiveness()
 */

// Test configuration
const ZOOM_LEVELS = [0.8, 1.0, 1.25, 1.5]; // 80%, 100%, 125%, 150%
const RESOLUTIONS = [
  { width: 1366, height: 768, name: 'HD (1366x768)' },
  { width: 1920, height: 1080, name: 'FHD (1920x1080)' },
  { width: 2560, height: 1440, name: 'QHD (2560x1440)' }
];

/**
 * Test layout stability
 */
function testLayoutStability() {
  const pageShell = document.querySelector('[data-testid="page-shell"]');
  const toolbar = document.querySelector('[data-testid="toolbar"]') || 
                 document.querySelector('.sticky') ||
                 document.querySelector('[class*="toolbar"]');
  const mainContent = document.querySelector('[data-testid="main-content"]') ||
                     document.querySelector('main') ||
                     document.querySelector('[class*="main"]');
  
  if (!pageShell && !toolbar && !mainContent) {
    console.warn('⚠️ Layout elements not found. Make sure you are on a page with PageShell component.');
    return false;
  }

  const results = {
    pageShell: pageShell ? pageShell.getBoundingClientRect() : null,
    toolbar: toolbar ? toolbar.getBoundingClientRect() : null,
    mainContent: mainContent ? mainContent.getBoundingClientRect() : null
  };

  const isStable = Object.values(results).some(rect => 
    rect && rect.width > 0 && rect.width <= window.innerWidth
  );

  return { isStable, elements: results };
}

/**
 * Test sticky toolbar behavior
 */
function testStickyToolbar() {
  const toolbar = document.querySelector('[data-testid="toolbar"]') || 
                 document.querySelector('.sticky') ||
                 document.querySelector('[class*="toolbar"]') ||
                 document.querySelector('[style*="sticky"]');
  
  if (!toolbar) {
    return { hasSticky: false, details: 'No toolbar found' };
  }

  const computedStyle = window.getComputedStyle(toolbar);
  const isSticky = computedStyle.position === 'sticky' || computedStyle.position === 'fixed';
  const hasBackdrop = computedStyle.backdropFilter !== 'none' || 
                     computedStyle.webkitBackdropFilter !== 'none' ||
                     computedStyle.backdropFilter?.includes('blur') ||
                     computedStyle.webkitBackdropFilter?.includes('blur');

  return {
    hasSticky: isSticky,
    hasBackdrop,
    position: computedStyle.position,
    backdropFilter: computedStyle.backdropFilter || computedStyle.webkitBackdropFilter,
    zIndex: computedStyle.zIndex
  };
}

/**
 * Test fluid width adaptation
 */
function testFluidWidth() {
  const container = document.querySelector('[data-testid="page-shell"]') ||
                   document.querySelector('.container') ||
                   document.querySelector('main') ||
                   document.body;
  
  if (!container) {
    return { isFluid: false, details: 'No container found' };
  }

  const rect = container.getBoundingClientRect();
  const maxExpectedWidth = Math.min(1600, window.innerWidth * 0.95);
  const utilization = (rect.width / window.innerWidth) * 100;
  
  const isFluid = rect.width <= maxExpectedWidth && rect.width > window.innerWidth * 0.6;

  return {
    isFluid,
    currentWidth: Math.round(rect.width),
    maxExpected: Math.round(maxExpectedWidth),
    utilization: Math.round(utilization * 10) / 10,
    viewportWidth: window.innerWidth
  };
}

/**
 * Test for horizontal scrollbars
 */
function testHorizontalScroll() {
  const hasHorizontalScroll = document.documentElement.scrollWidth > document.documentElement.clientWidth;
  
  return {
    hasHorizontalScroll,
    scrollWidth: document.documentElement.scrollWidth,
    clientWidth: document.documentElement.clientWidth,
    difference: document.documentElement.scrollWidth - document.documentElement.clientWidth
  };
}

/**
 * Test CSS calc() height calculations
 */
function testCalcHeights() {
  const elements = [
    document.querySelector('[data-testid="main-content"]'),
    document.querySelector('main'),
    document.querySelector('[class*="main"]'),
    document.querySelector('.h-\\[calc\\(')
  ].filter(Boolean);

  if (elements.length === 0) {
    return { hasCalcHeights: false, details: 'No elements with calc heights found' };
  }

  const results = elements.map(el => {
    const rect = el.getBoundingClientRect();
    const computedStyle = window.getComputedStyle(el);
    return {
      height: Math.round(rect.height),
      minHeight: computedStyle.minHeight,
      maxHeight: computedStyle.maxHeight,
      hasCalc: computedStyle.height?.includes('calc') || 
               computedStyle.minHeight?.includes('calc') ||
               computedStyle.maxHeight?.includes('calc')
    };
  });

  const hasValidHeights = results.some(r => r.height > window.innerHeight * 0.2);

  return {
    hasCalcHeights: results.some(r => r.hasCalc),
    hasValidHeights,
    elements: results
  };
}

/**
 * Test CSS variables availability
 */
function testCSSVariables() {
  const rootStyles = getComputedStyle(document.documentElement);
  const variables = [
    '--shell-max-w',
    '--shell-gutter', 
    '--hero-h',
    '--toolbar-h',
    '--footer-h',
    '--row-h',
    '--cell-px'
  ];

  const results = {};
  variables.forEach(varName => {
    const value = rootStyles.getPropertyValue(varName).trim();
    results[varName] = value || 'not found';
  });

  const availableCount = Object.values(results).filter(v => v !== 'not found').length;

  return {
    availableVariables: availableCount,
    totalVariables: variables.length,
    variables: results,
    hasCore: !!(results['--shell-max-w'] && results['--toolbar-h'])
  };
}

/**
 * Get current zoom level (approximation)
 */
function getCurrentZoomLevel() {
  // Method 1: Using outer/inner width ratio
  const zoomRatio1 = window.outerWidth / window.innerWidth;
  
  // Method 2: Using device pixel ratio (less reliable for zoom)
  const zoomRatio2 = window.devicePixelRatio;
  
  // Method 3: Using screen width comparison
  const zoomRatio3 = screen.width / window.innerWidth;

  return {
    estimated: Math.round(zoomRatio1 * 100),
    methods: {
      outerInnerRatio: Math.round(zoomRatio1 * 100),
      devicePixelRatio: Math.round(zoomRatio2 * 100),
      screenRatio: Math.round(zoomRatio3 * 100)
    }
  };
}

/**
 * Run comprehensive test suite
 */
function runComprehensiveTest() {
  const zoomInfo = getCurrentZoomLevel();
  const layoutTest = testLayoutStability();
  const stickyTest = testStickyToolbar();
  const fluidTest = testFluidWidth();
  const scrollTest = testHorizontalScroll();
  const heightTest = testCalcHeights();
  const variablesTest = testCSSVariables();

  return {
    timestamp: new Date().toISOString(),
    viewport: {
      width: window.innerWidth,
      height: window.innerHeight,
      zoom: zoomInfo
    },
    tests: {
      layoutStability: layoutTest,
      stickyToolbar: stickyTest,
      fluidWidth: fluidTest,
      horizontalScroll: scrollTest,
      calcHeights: heightTest,
      cssVariables: variablesTest
    }
  };
}

/**
 * Main testing function
 */
function testZoomResponsiveness() {
  console.clear();
  console.log('🔍 Starting Zoom & Responsiveness Testing...\n');

  const results = runComprehensiveTest();
  
  console.group('📊 Test Results Summary');
  
  // Viewport Info
  console.group('🖥️ Viewport Information');
  console.log(`Width: ${results.viewport.width}px`);
  console.log(`Height: ${results.viewport.height}px`);
  console.log(`Estimated Zoom: ${results.viewport.zoom.estimated}%`);
  console.log('Zoom Detection Methods:', results.viewport.zoom.methods);
  console.groupEnd();

  // Layout Stability
  console.group('🏗️ Layout Stability');
  const layout = results.tests.layoutStability;
  console.log(`Status: ${layout.isStable ? '✅ PASS' : '❌ FAIL'}`);
  if (layout.elements.pageShell) {
    console.log(`PageShell Width: ${Math.round(layout.elements.pageShell.width)}px`);
  }
  if (layout.elements.toolbar) {
    console.log(`Toolbar Width: ${Math.round(layout.elements.toolbar.width)}px`);
  }
  if (layout.elements.mainContent) {
    console.log(`Main Content Width: ${Math.round(layout.elements.mainContent.width)}px`);
  }
  console.groupEnd();

  // Sticky Toolbar
  console.group('📌 Sticky Toolbar');
  const sticky = results.tests.stickyToolbar;
  console.log(`Status: ${sticky.hasSticky ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`Position: ${sticky.position}`);
  console.log(`Backdrop Filter: ${sticky.hasBackdrop ? '✅ Yes' : '❌ No'}`);
  console.log(`Z-Index: ${sticky.zIndex}`);
  console.groupEnd();

  // Fluid Width
  console.group('📏 Fluid Width Adaptation');
  const fluid = results.tests.fluidWidth;
  console.log(`Status: ${fluid.isFluid ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`Current Width: ${fluid.currentWidth}px`);
  console.log(`Max Expected: ${fluid.maxExpected}px`);
  console.log(`Utilization: ${fluid.utilization}%`);
  console.groupEnd();

  // Horizontal Scroll
  console.group('↔️ Horizontal Scroll');
  const scroll = results.tests.horizontalScroll;
  console.log(`Status: ${!scroll.hasHorizontalScroll ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`Scroll Width: ${scroll.scrollWidth}px`);
  console.log(`Client Width: ${scroll.clientWidth}px`);
  if (scroll.hasHorizontalScroll) {
    console.log(`Overflow: ${scroll.difference}px`);
  }
  console.groupEnd();

  // Calc Heights
  console.group('📐 CSS Calc Heights');
  const heights = results.tests.calcHeights;
  console.log(`Has Calc: ${heights.hasCalcHeights ? '✅ Yes' : '❌ No'}`);
  console.log(`Valid Heights: ${heights.hasValidHeights ? '✅ Yes' : '❌ No'}`);
  if (heights.elements && heights.elements.length > 0) {
    console.log('Elements:', heights.elements);
  }
  console.groupEnd();

  // CSS Variables
  console.group('🎨 CSS Variables');
  const vars = results.tests.cssVariables;
  console.log(`Status: ${vars.hasCore ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`Available: ${vars.availableVariables}/${vars.totalVariables}`);
  console.log('Variables:', vars.variables);
  console.groupEnd();

  console.groupEnd();

  // Overall Assessment
  const passCount = [
    layout.isStable,
    sticky.hasSticky,
    fluid.isFluid,
    !scroll.hasHorizontalScroll,
    heights.hasValidHeights,
    vars.hasCore
  ].filter(Boolean).length;

  console.log(`\n🎯 Overall Score: ${passCount}/6 tests passed`);
  
  if (passCount === 6) {
    console.log('🎉 All tests passed! Layout is optimized for current zoom/resolution.');
  } else if (passCount >= 4) {
    console.log('⚠️ Most tests passed. Minor issues detected.');
  } else {
    console.log('❌ Multiple issues detected. Layout needs optimization.');
  }

  console.log('\n📋 Testing Instructions:');
  console.log('1. Test at different zoom levels: 80%, 100%, 125%, 150%');
  console.log('2. Test at different resolutions: 1366x768, 1920x1080, 2560x1440');
  console.log('3. Scroll the page to test sticky toolbar behavior');
  console.log('4. Resize browser window to test fluid width adaptation');
  console.log('5. Re-run this test: testZoomResponsiveness()');

  return results;
}

// Make function available globally
window.testZoomResponsiveness = testZoomResponsiveness;

console.log('🔍 Zoom & Responsiveness Testing Script Loaded!');
console.log('Run: testZoomResponsiveness()');
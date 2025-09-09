/**
 * Test utility for verifying density toggle functionality
 */

export function testDensityToggle() {
  console.log('🧪 Testing Density Toggle Functionality');
  
  // Test 1: Check if data-density attribute exists on document root
  const rootElement = document.documentElement;
  const currentDensity = rootElement.getAttribute('data-density');
  console.log('✅ Current density mode:', currentDensity || 'not set');
  
  // Test 2: Check if CSS variables are properly set
  const computedStyle = getComputedStyle(rootElement);
  const rowHeight = computedStyle.getPropertyValue('--row-h');
  const cellPadding = computedStyle.getPropertyValue('--cell-px');
  
  console.log('✅ CSS Variables:');
  console.log('  --row-h:', rowHeight);
  console.log('  --cell-px:', cellPadding);
  
  // Test 3: Check localStorage persistence
  const savedDensity = localStorage.getItem('density-mode');
  console.log('✅ Saved density in localStorage:', savedDensity);
  
  // Test 4: Verify expected values based on current mode
  const expectedValues = {
    compact: { rowHeight: '36px', cellPadding: '8px' },
    comfortable: { rowHeight: '44px', cellPadding: '12px' }
  };
  
  const currentMode = currentDensity as 'compact' | 'comfortable' || 'comfortable';
  const expected = expectedValues[currentMode];
  
  const rowHeightMatch = rowHeight.trim() === expected.rowHeight;
  const cellPaddingMatch = cellPadding.trim() === expected.cellPadding;
  
  console.log('✅ Value verification:');
  console.log('  Row height matches expected:', rowHeightMatch, `(${rowHeight} vs ${expected.rowHeight})`);
  console.log('  Cell padding matches expected:', cellPaddingMatch, `(${cellPadding} vs ${expected.cellPadding})`);
  
  // Test 5: Check if density tables exist and have correct attributes
  const densityTables = document.querySelectorAll('.density-table');
  console.log('✅ Found density tables:', densityTables.length);
  
  densityTables.forEach((table, index) => {
    const tableDensity = table.getAttribute('data-density');
    console.log(`  Table ${index + 1} density:`, tableDensity);
  });
  
  // Test 6: Check if responsive table containers exist
  const containers = document.querySelectorAll('.responsive-table-container');
  console.log('✅ Found responsive table containers:', containers.length);
  
  containers.forEach((container, index) => {
    const containerDensity = container.getAttribute('data-density');
    console.log(`  Container ${index + 1} density:`, containerDensity);
  });
  
  // Summary
  const allTestsPassed = rowHeightMatch && cellPaddingMatch && currentDensity !== null;
  console.log(allTestsPassed ? '🎉 All density tests passed!' : '❌ Some density tests failed');
  
  return {
    currentDensity,
    cssVariables: { rowHeight, cellPadding },
    savedDensity,
    valuesMatch: { rowHeightMatch, cellPaddingMatch },
    tablesFound: densityTables.length,
    containersFound: containers.length,
    allTestsPassed
  };
}

// Auto-run test in development when this module is imported
if (import.meta.env.DEV) {
  // Wait for DOM to be ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      setTimeout(testDensityToggle, 1000); // Wait a bit for React to render
    });
  } else {
    setTimeout(testDensityToggle, 1000);
  }
}

// Make it available globally for manual testing
if (typeof window !== 'undefined') {
  (window as any).testDensityToggle = testDensityToggle;
}
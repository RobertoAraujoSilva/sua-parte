import React, { useEffect, useState } from 'react';
import PageShell from '@/components/layout/PageShell';
import { Button } from '@/components/ui/button';
import { runTailwindConfigTests, logTestResults } from '@/utils/tailwindBreakpointVerification';

/**
 * Test component to verify Tailwind breakpoints work correctly with CSS variables
 * and that there are no conflicts between container utility and fluid width system
 */
export default function TailwindBreakpointTest() {
  const [testResults, setTestResults] = useState<any>(null);

  useEffect(() => {
    // Run tests on mount and window resize
    const runTests = () => {
      const results = runTailwindConfigTests();
      setTestResults(results);
    };

    runTests();
    window.addEventListener('resize', runTests);
    
    return () => window.removeEventListener('resize', runTests);
  }, []);

  const handleRunTests = () => {
    logTestResults();
    const results = runTailwindConfigTests();
    setTestResults(results);
  };

  return (
    <PageShell title="Tailwind Breakpoint Test" hero={false}>
      <div className="space-y-8">
        {/* Test 1: Breakpoint indicators */}
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h2 className="text-xl font-semibold mb-4">Current Breakpoint</h2>
          <div className="space-y-2">
            <div className="block xs:hidden bg-red-100 p-2 rounded">
              &lt; 480px (Below xs)
            </div>
            <div className="hidden xs:block sm:hidden bg-orange-100 p-2 rounded">
              480px - 639px (xs)
            </div>
            <div className="hidden sm:block md:hidden bg-yellow-100 p-2 rounded">
              640px - 767px (sm)
            </div>
            <div className="hidden md:block lg:hidden bg-green-100 p-2 rounded">
              768px - 1023px (md)
            </div>
            <div className="hidden lg:block xl:hidden bg-blue-100 p-2 rounded">
              1024px - 1279px (lg)
            </div>
            <div className="hidden xl:block 2xl:hidden bg-indigo-100 p-2 rounded">
              1280px - 1535px (xl)
            </div>
            <div className="hidden 2xl:block 3xl:hidden bg-purple-100 p-2 rounded">
              1536px - 1919px (2xl)
            </div>
            <div className="hidden 3xl:block bg-pink-100 p-2 rounded">
              ≥ 1920px (3xl)
            </div>
          </div>
        </div>

        {/* Test 2: Container utility vs CSS variables */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Container vs CSS Variables Test</h2>
          
          {/* Tailwind container */}
          <div className="container mx-auto bg-blue-50 p-4 rounded">
            <h3 className="font-medium mb-2">Tailwind Container</h3>
            <p className="text-sm text-gray-600">
              This uses Tailwind's container utility with max-width constraints.
              Should not interfere with PageShell's fluid width system.
            </p>
          </div>

          {/* CSS Variables fluid width */}
          <div className="fluid-width bg-green-50 p-4 rounded">
            <h3 className="font-medium mb-2">CSS Variables Fluid Width</h3>
            <p className="text-sm text-gray-600">
              This uses CSS variables (--shell-max-w) for fluid width up to 1600px.
              Should work independently of Tailwind container.
            </p>
          </div>

          {/* Shell container utility */}
          <div className="shell-container bg-purple-50 p-4 rounded">
            <h3 className="font-medium mb-2">Shell Container</h3>
            <p className="text-sm text-gray-600">
              This uses the shell-container utility class with CSS variables.
              Should provide consistent spacing with the PageShell system.
            </p>
          </div>
        </div>

        {/* Test 3: Responsive grid with different breakpoints */}
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h2 className="text-xl font-semibold mb-4">Responsive Grid Test</h2>
          <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7 3xl:grid-cols-8 gap-4">
            {Array.from({ length: 8 }, (_, i) => (
              <div key={i} className="bg-gray-100 p-3 rounded text-center text-sm">
                Item {i + 1}
              </div>
            ))}
          </div>
        </div>

        {/* Test 4: CSS Variables display */}
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h2 className="text-xl font-semibold mb-4">CSS Variables Values</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <strong>Layout Variables:</strong>
              <ul className="mt-2 space-y-1 text-gray-600">
                <li>--shell-max-w: <span className="font-mono">min(1600px, 95vw)</span></li>
                <li>--shell-gutter: <span className="font-mono">clamp(12px, 1.6vw, 24px)</span></li>
                <li>--hero-h: <span className="font-mono">clamp(56px, 8svh, 120px)</span></li>
                <li>--toolbar-h: <span className="font-mono">clamp(44px, 6svh, 64px)</span></li>
              </ul>
            </div>
            <div>
              <strong>Density Variables:</strong>
              <ul className="mt-2 space-y-1 text-gray-600">
                <li>--row-h: <span className="font-mono">44px</span> (comfortable)</li>
                <li>--cell-px: <span className="font-mono">12px</span></li>
                <li>--cell-py: <span className="font-mono">8px</span></li>
                <li>--content-gap: <span className="font-mono">12px</span></li>
              </ul>
            </div>
          </div>
        </div>

        {/* Test 5: Automated test results */}
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Automated Test Results</h2>
            <Button onClick={handleRunTests} variant="outline" size="sm">
              Run Tests
            </Button>
          </div>
          
          {testResults && (
            <div className="space-y-4">
              <div className={`p-4 rounded-lg ${testResults.overallStatus === 'pass' ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
                <div className="flex items-center gap-2">
                  <span className={`text-lg ${testResults.overallStatus === 'pass' ? 'text-green-600' : 'text-red-600'}`}>
                    {testResults.overallStatus === 'pass' ? '✅' : '❌'}
                  </span>
                  <span className="font-semibold">
                    Overall Status: {testResults.overallStatus.toUpperCase()}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h3 className="font-medium mb-2">Current Breakpoint</h3>
                  <p className="text-sm bg-blue-50 p-2 rounded">
                    {testResults.responsiveBehavior.currentBreakpoint} ({testResults.responsiveBehavior.viewportWidth}px)
                  </p>
                </div>
                
                <div>
                  <h3 className="font-medium mb-2">Container Conflicts</h3>
                  <p className={`text-sm p-2 rounded ${testResults.containerConflicts.hasConflict ? 'bg-red-50' : 'bg-green-50'}`}>
                    {testResults.containerConflicts.hasConflict ? '❌ Conflict detected' : '✅ No conflicts'}
                  </p>
                </div>
                
                <div>
                  <h3 className="font-medium mb-2">Zoom Stability</h3>
                  <p className={`text-sm p-2 rounded ${testResults.zoomStability.cssVariablesStable ? 'bg-green-50' : 'bg-red-50'}`}>
                    Ratio: {testResults.zoomStability.devicePixelRatio} - {testResults.zoomStability.cssVariablesStable ? '✅ Stable' : '❌ Unstable'}
                  </p>
                </div>
                
                <div>
                  <h3 className="font-medium mb-2">CSS Variables</h3>
                  <p className={`text-sm p-2 rounded ${Object.values(testResults.cssVariables).every(v => v) ? 'bg-green-50' : 'bg-red-50'}`}>
                    {Object.values(testResults.cssVariables).filter(v => v).length}/{Object.keys(testResults.cssVariables).length} defined
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Test 6: Zoom stability test */}
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h2 className="text-xl font-semibold mb-4">Zoom Stability Test</h2>
          <p className="text-sm text-gray-600 mb-4">
            Test this page at different zoom levels (80%, 100%, 125%, 150%) to verify layout stability.
          </p>
          <div className="space-y-2">
            <div className="h-12 bg-gradient-to-r from-blue-100 to-blue-200 rounded flex items-center px-4">
              <span className="text-sm">Fixed height element (48px)</span>
            </div>
            <div 
              className="bg-gradient-to-r from-green-100 to-green-200 rounded flex items-center px-4"
              style={{ height: 'var(--toolbar-h)' }}
            >
              <span className="text-sm">CSS variable height (--toolbar-h)</span>
            </div>
            <div 
              className="bg-gradient-to-r from-purple-100 to-purple-200 rounded flex items-center px-4"
              style={{ height: 'clamp(32px, 5svh, 64px)' }}
            >
              <span className="text-sm">Clamp height (clamp(32px, 5svh, 64px))</span>
            </div>
          </div>
        </div>
      </div>
    </PageShell>
  );
}
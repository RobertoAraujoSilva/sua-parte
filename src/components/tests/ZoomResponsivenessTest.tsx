import React, { useState, useEffect } from 'react';
import PageShell from '../layout/PageShell';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';

interface TestResult {
  test: string;
  status: 'pass' | 'fail' | 'warning';
  details: string;
}

interface ViewportInfo {
  width: number;
  height: number;
  zoom: number;
  devicePixelRatio: number;
}

export const ZoomResponsivenessTest: React.FC = () => {
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [viewportInfo, setViewportInfo] = useState<ViewportInfo>({
    width: 0,
    height: 0,
    zoom: 1,
    devicePixelRatio: 1
  });
  const [isRunning, setIsRunning] = useState(false);

  // Update viewport info
  useEffect(() => {
    const updateViewportInfo = () => {
      const zoom = Math.round((window.outerWidth / window.innerWidth) * 100) / 100;
      setViewportInfo({
        width: window.innerWidth,
        height: window.innerHeight,
        zoom: zoom,
        devicePixelRatio: window.devicePixelRatio
      });
    };

    updateViewportInfo();
    window.addEventListener('resize', updateViewportInfo);
    return () => window.removeEventListener('resize', updateViewportInfo);
  }, []);

  const runTests = async () => {
    setIsRunning(true);
    const results: TestResult[] = [];

    // Test 1: Layout stability at current zoom
    const layoutStabilityTest = () => {
      const pageShell = document.querySelector('[data-testid="page-shell"]');
      const toolbar = document.querySelector('[data-testid="toolbar"]');
      const mainContent = document.querySelector('[data-testid="main-content"]');
      
      if (!pageShell || !toolbar || !mainContent) {
        return {
          test: 'Layout Elements Present',
          status: 'fail' as const,
          details: 'Required layout elements not found'
        };
      }

      const shellRect = pageShell.getBoundingClientRect();
      const toolbarRect = toolbar.getBoundingClientRect();
      const mainRect = mainContent.getBoundingClientRect();

      // Check if elements are properly positioned
      const isLayoutStable = shellRect.width > 0 && 
                            toolbarRect.width > 0 && 
                            mainRect.width > 0 &&
                            shellRect.width <= window.innerWidth;

      return {
        test: `Layout Stability at ${viewportInfo.zoom}x zoom`,
        status: isLayoutStable ? 'pass' as const : 'fail' as const,
        details: `Shell: ${Math.round(shellRect.width)}px, Toolbar: ${Math.round(toolbarRect.width)}px, Main: ${Math.round(mainRect.width)}px`
      };
    };

    results.push(layoutStabilityTest());

    // Test 2: Sticky toolbar behavior
    const stickyToolbarTest = () => {
      const toolbar = document.querySelector('[data-testid="toolbar"]');
      if (!toolbar) {
        return {
          test: 'Sticky Toolbar',
          status: 'fail' as const,
          details: 'Toolbar element not found'
        };
      }

      const computedStyle = window.getComputedStyle(toolbar);
      const isSticky = computedStyle.position === 'sticky' || computedStyle.position === 'fixed';
      const hasBackdrop = computedStyle.backdropFilter !== 'none' || computedStyle.webkitBackdropFilter !== 'none';

      return {
        test: 'Sticky Toolbar Behavior',
        status: isSticky ? 'pass' as const : 'fail' as const,
        details: `Position: ${computedStyle.position}, Backdrop: ${hasBackdrop ? 'Yes' : 'No'}`
      };
    };

    results.push(stickyToolbarTest());

    // Test 3: Fluid width adaptation
    const fluidWidthTest = () => {
      const pageShell = document.querySelector('[data-testid="page-shell"]');
      if (!pageShell) {
        return {
          test: 'Fluid Width',
          status: 'fail' as const,
          details: 'PageShell element not found'
        };
      }

      const shellRect = pageShell.getBoundingClientRect();
      const maxExpectedWidth = Math.min(1600, window.innerWidth * 0.95);
      const isFluidWidth = shellRect.width <= maxExpectedWidth && shellRect.width > window.innerWidth * 0.8;

      return {
        test: 'Fluid Width Adaptation',
        status: isFluidWidth ? 'pass' as const : 'warning' as const,
        details: `Current: ${Math.round(shellRect.width)}px, Expected max: ${Math.round(maxExpectedWidth)}px`
      };
    };

    results.push(fluidWidthTest());

    // Test 4: No horizontal scrollbars
    const horizontalScrollTest = () => {
      const hasHorizontalScroll = document.documentElement.scrollWidth > document.documentElement.clientWidth;
      
      return {
        test: 'No Horizontal Scrollbars',
        status: hasHorizontalScroll ? 'fail' as const : 'pass' as const,
        details: `ScrollWidth: ${document.documentElement.scrollWidth}px, ClientWidth: ${document.documentElement.clientWidth}px`
      };
    };

    results.push(horizontalScrollTest());

    // Test 5: CSS calc() height calculations
    const calcHeightTest = () => {
      const mainContent = document.querySelector('[data-testid="main-content"]');
      if (!mainContent) {
        return {
          test: 'CSS Calc Heights',
          status: 'fail' as const,
          details: 'Main content element not found'
        };
      }

      const mainRect = mainContent.getBoundingClientRect();
      const expectedMinHeight = window.innerHeight * 0.4; // Should be at least 40% of viewport
      const isHeightValid = mainRect.height >= expectedMinHeight;

      return {
        test: 'CSS Calc() Height Calculations',
        status: isHeightValid ? 'pass' as const : 'warning' as const,
        details: `Main height: ${Math.round(mainRect.height)}px, Min expected: ${Math.round(expectedMinHeight)}px`
      };
    };

    results.push(calcHeightTest());

    // Test 6: CSS Variables availability
    const cssVariablesTest = () => {
      const rootStyles = getComputedStyle(document.documentElement);
      const shellMaxW = rootStyles.getPropertyValue('--shell-max-w').trim();
      const toolbarH = rootStyles.getPropertyValue('--toolbar-h').trim();
      const heroH = rootStyles.getPropertyValue('--hero-h').trim();

      const hasVariables = shellMaxW && toolbarH && heroH;

      return {
        test: 'CSS Variables Available',
        status: hasVariables ? 'pass' as const : 'fail' as const,
        details: `shell-max-w: ${shellMaxW}, toolbar-h: ${toolbarH}, hero-h: ${heroH}`
      };
    };

    results.push(cssVariablesTest());

    // Test 7: Resolution-specific tests
    const resolutionTest = () => {
      const { width, height } = viewportInfo;
      let resolutionCategory = 'Unknown';
      let expectedBehavior = '';

      if (width <= 1366 && height <= 768) {
        resolutionCategory = '1366x768 (HD)';
        expectedBehavior = 'Compact layout, efficient space usage';
      } else if (width <= 1920 && height <= 1080) {
        resolutionCategory = '1920x1080 (FHD)';
        expectedBehavior = 'Balanced layout, good content visibility';
      } else if (width >= 2560) {
        resolutionCategory = '2560x1440+ (QHD+)';
        expectedBehavior = 'Maximum width utilization up to 1600px';
      }

      const pageShell = document.querySelector('[data-testid="page-shell"]');
      const shellWidth = pageShell ? pageShell.getBoundingClientRect().width : 0;
      const isOptimalForResolution = shellWidth > width * 0.7; // At least 70% width usage

      return {
        test: `Resolution Optimization (${resolutionCategory})`,
        status: isOptimalForResolution ? 'pass' as const : 'warning' as const,
        details: `${expectedBehavior}. Current width: ${Math.round(shellWidth)}px (${Math.round((shellWidth/width)*100)}% of viewport)`
      };
    };

    results.push(resolutionTest());

    setTestResults(results);
    setIsRunning(false);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pass': return 'bg-green-100 text-green-800';
      case 'fail': return 'bg-red-100 text-red-800';
      case 'warning': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const toolbarActions = (
    <div className="flex gap-2">
      <Button 
        onClick={runTests} 
        disabled={isRunning}
        className="bg-blue-600 hover:bg-blue-700"
      >
        {isRunning ? 'Running Tests...' : 'Run Tests'}
      </Button>
      <Button 
        variant="outline" 
        onClick={() => setTestResults([])}
      >
        Clear Results
      </Button>
    </div>
  );

  return (
    <PageShell
      title="Zoom & Responsiveness Testing"
      hero={false}
      actions={toolbarActions}
      data-testid="page-shell"
    >
      <div data-testid="main-content" className="space-y-6">
        {/* Viewport Information */}
        <Card>
          <CardHeader>
            <CardTitle>Current Viewport Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <div className="text-sm text-gray-600">Width</div>
                <div className="font-mono text-lg">{viewportInfo.width}px</div>
              </div>
              <div>
                <div className="text-sm text-gray-600">Height</div>
                <div className="font-mono text-lg">{viewportInfo.height}px</div>
              </div>
              <div>
                <div className="text-sm text-gray-600">Zoom Level</div>
                <div className="font-mono text-lg">{Math.round(viewportInfo.zoom * 100)}%</div>
              </div>
              <div>
                <div className="text-sm text-gray-600">Device Pixel Ratio</div>
                <div className="font-mono text-lg">{viewportInfo.devicePixelRatio}</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Test Instructions */}
        <Card>
          <CardHeader>
            <CardTitle>Testing Instructions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <p><strong>Zoom Testing:</strong> Test at 80%, 100%, 125%, and 150% zoom levels using Ctrl+/Ctrl- or browser zoom controls.</p>
              <p><strong>Resolution Testing:</strong> Test on 1366x768, 1920x1080, and 2560x1440 resolutions or simulate using browser dev tools.</p>
              <p><strong>Scroll Testing:</strong> Scroll the page to verify sticky toolbar behavior at different zoom levels.</p>
              <p><strong>Width Testing:</strong> Resize browser window to verify fluid width adaptation.</p>
            </div>
          </CardContent>
        </Card>

        {/* Test Results */}
        {testResults.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Test Results</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {testResults.map((result, index) => (
                  <div key={index} className="flex items-start justify-between p-3 border rounded-lg">
                    <div className="flex-1">
                      <div className="font-medium">{result.test}</div>
                      <div className="text-sm text-gray-600 mt-1">{result.details}</div>
                    </div>
                    <Badge className={getStatusColor(result.status)}>
                      {result.status.toUpperCase()}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Sample Content for Testing */}
        <Card>
          <CardHeader>
            <CardTitle>Sample Content for Layout Testing</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {Array.from({ length: 6 }, (_, i) => (
                  <div key={i} className="p-4 border rounded-lg">
                    <h4 className="font-medium">Sample Card {i + 1}</h4>
                    <p className="text-sm text-gray-600 mt-2">
                      This is sample content to test layout behavior at different zoom levels and resolutions.
                    </p>
                  </div>
                ))}
              </div>
              
              {/* Large content area to test scrolling */}
              <div className="h-96 p-4 border rounded-lg bg-gray-50 overflow-y-auto">
                <h4 className="font-medium mb-4">Scrollable Content Area</h4>
                {Array.from({ length: 20 }, (_, i) => (
                  <p key={i} className="mb-2 text-sm">
                    Line {i + 1}: This is sample content to test scrolling behavior and sticky toolbar functionality.
                  </p>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </PageShell>
  );
};
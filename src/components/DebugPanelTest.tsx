import React, { useState, useEffect } from 'react';
import { useDebugLogger } from '@/utils/debugLogger';

/**
 * Simple test component to verify the infinite loop fix
 * This component should mount without causing infinite re-renders
 */
export const DebugPanelTest: React.FC = () => {
  const [renderCount, setRenderCount] = useState(0);
  const [stats, setStats] = useState<any>({});
  const { getStats } = useDebugLogger();

  // Track render count to detect infinite loops
  useEffect(() => {
    setRenderCount(prev => prev + 1);
  });

  // This should NOT cause infinite re-renders anymore
  useEffect(() => {
    console.log('🧪 DebugPanelTest: useEffect running, render count:', renderCount);
    
    const updateStats = () => {
      const newStats = getStats();
      console.log('🧪 DebugPanelTest: Updating stats:', newStats);
      setStats(newStats);
    };

    updateStats();
    const interval = setInterval(updateStats, 3000);
    
    return () => {
      console.log('🧪 DebugPanelTest: Cleaning up interval');
      clearInterval(interval);
    };
  }, []); // Empty dependency array - getStats is now stable

  // Warning if too many renders
  if (renderCount > 10) {
    console.error('🚨 DebugPanelTest: Too many renders detected!', renderCount);
  }

  return (
    <div className="p-4 border border-blue-500 rounded bg-blue-50">
      <h3 className="font-bold text-blue-800">Debug Panel Test</h3>
      <p className="text-sm text-blue-600">
        Render Count: <span className="font-mono">{renderCount}</span>
        {renderCount > 5 && <span className="text-red-600 ml-2">⚠️ High render count!</span>}
      </p>
      <p className="text-sm text-blue-600">
        Total Logs: <span className="font-mono">{stats.totalLogs || 0}</span>
      </p>
      <p className="text-sm text-blue-600">
        Errors: <span className="font-mono">{stats.errors || 0}</span>
      </p>
      <p className="text-xs text-gray-500 mt-2">
        This component tests the infinite loop fix. 
        If render count stays low (&lt;10), the fix is working.
      </p>
    </div>
  );
};

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { useDebugLogger } from '@/utils/debugLogger';
import { forceLogout } from '@/utils/forceLogout';
import { performHealthCheck } from '@/utils/supabaseHealthCheck';
import { runLogoutDiagnostics } from '@/utils/logoutDiagnostics';
import { Download, Trash2, Bug, Eye, EyeOff, AlertTriangle, Activity, Search } from 'lucide-react';

interface DebugPanelProps {
  position?: 'fixed' | 'relative';
}

export const DebugPanel: React.FC<DebugPanelProps> = ({ position = 'fixed' }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [stats, setStats] = useState<any>({});
  const { user, signOut } = useAuth();
  const { 
    logLogoutAttempt, 
    logLogoutResult, 
    downloadLog, 
    clearLogs, 
    getStats,
    logError 
  } = useDebugLogger();

  useEffect(() => {
    const updateStats = () => {
      setStats(getStats());
    };

    // Initial update
    updateStats();

    // Set up interval for periodic updates
    const interval = setInterval(updateStats, 2000);

    // Cleanup interval on unmount
    return () => clearInterval(interval);
  }, []); // Empty dependency array - getStats is now stable from useMemo

  const handleTestLogout = async () => {
    console.log('🧪 Debug Panel - Test Logout Button Clicked');
    logLogoutAttempt('test', user);

    try {
      // Create a more aggressive timeout for debug testing
      const timeoutPromise = new Promise((resolve) =>
        setTimeout(() => {
          console.log('⏰ Debug Panel - SignOut timeout, forcing local cleanup');
          resolve({ error: { message: 'Debug timeout - forcing logout', code: 'DEBUG_TIMEOUT' } });
        }, 1500) // Even shorter timeout for debug testing
      );

      const signOutPromise = signOut();
      const result = await Promise.race([signOutPromise, timeoutPromise]) as any;

      if (result?.error) {
        console.error('❌ Debug Panel - Logout Error:', result.error);
        logLogoutResult(false, result.error, user);
        logError(result.error, 'Debug Panel Test Logout', user);

        // Force logout even on error since local state should be cleared
        console.log('🚨 Debug Panel - Forcing logout despite error');
        downloadLog();
        setTimeout(() => {
          window.location.href = '/auth';
        }, 500);
      } else {
        console.log('✅ Debug Panel - Logout Success');
        logLogoutResult(true, null, user);

        // Force download log before redirect
        setTimeout(() => {
          downloadLog();
        }, 500);

        // Navigate after a short delay
        setTimeout(() => {
          window.location.href = '/auth';
        }, 1000);
      }
    } catch (error) {
      console.error('❌ Debug Panel - Logout Exception:', error);
      logLogoutResult(false, error, user);
      logError(error, 'Debug Panel Test Logout Exception', user);

      // Force logout even on exception
      console.log('🚨 Debug Panel - Forcing logout after exception');
      downloadLog();
      setTimeout(() => {
        window.location.href = '/auth';
      }, 500);
    }
  };

  const handleDropdownLogout = async () => {
    console.log('🔽 Debug Panel - Dropdown Logout Simulation');
    logLogoutAttempt('dropdown', user);

    // Simulate the dropdown logout process
    try {
      const { error } = await signOut();

      if (error) {
        console.error('❌ Debug Panel - Dropdown Logout Error:', error);
        logLogoutResult(false, error, user);
      } else {
        console.log('✅ Debug Panel - Dropdown Logout Success');
        logLogoutResult(true, null, user);

        // Force download log
        downloadLog();

        // Navigate
        setTimeout(() => {
          window.location.href = '/';
        }, 1000);
      }
    } catch (error) {
      console.error('❌ Debug Panel - Dropdown Logout Exception:', error);
      logLogoutResult(false, error, user);
    }
  };

  const handleForceLogout = () => {
    console.log('🚨 Debug Panel - Force Logout');
    logLogoutAttempt('force', user);

    // Download log before force logout
    downloadLog();

    // Force logout after short delay
    setTimeout(() => {
      forceLogout();
    }, 500);
  };

  const handleHealthCheck = async () => {
    console.log('🏥 Debug Panel - Health Check');
    try {
      const result = await performHealthCheck();
      console.log('🏥 Health check completed:', result);

      // Show result in a simple alert for now
      const status = result.isHealthy ? '✅ HEALTHY' : '❌ UNHEALTHY';
      const details = `Status: ${status}\nLatency: ${result.latency}ms\nConnection: ${result.checks.connection ? '✅' : '❌'}\nAuth: ${result.checks.auth ? '✅' : '❌'}\nDatabase: ${result.checks.database ? '✅' : '❌'}`;

      if (result.errors.length > 0) {
        console.error('🏥 Health check errors:', result.errors);
      }

      alert(`Supabase Health Check\n\n${details}${result.errors.length > 0 ? '\n\nErrors logged to console' : ''}`);
    } catch (error) {
      console.error('🏥 Health check failed:', error);
      alert('Health check failed - see console for details');
    }
  };

  const handleLogoutDiagnostics = async () => {
    console.log('🔍 Debug Panel - Logout Diagnostics');
    try {
      const result = await runLogoutDiagnostics();
      console.log('🔍 Logout diagnostics completed:', result);

      const status = result.overall.success ? '✅ ALL PASSED' : '❌ ISSUES FOUND';
      const summary = `Status: ${status}\nTests: ${result.overall.passedTests}/${result.overall.totalTests} passed`;
      const recommendations = result.recommendations.length > 0 ? `\n\nRecommendations:\n${result.recommendations.join('\n')}` : '';

      alert(`Logout Diagnostics\n\n${summary}${recommendations}\n\nSee console for detailed results`);
    } catch (error) {
      console.error('🔍 Logout diagnostics failed:', error);
      alert('Logout diagnostics failed - see console for details');
    }
  };

  const toggleVisibility = () => {
    setIsVisible(!isVisible);
  };

  if (position === 'fixed') {
    return (
      <>
        {/* Toggle Button */}
        <Button
          onClick={toggleVisibility}
          className="fixed bottom-4 right-4 z-50 bg-red-600 hover:bg-red-700 text-white"
          size="sm"
        >
          <Bug className="w-4 h-4 mr-1" />
          Debug
        </Button>

        {/* Debug Panel */}
        {isVisible && (
          <Card className="fixed bottom-16 right-4 z-50 w-96 max-h-96 overflow-y-auto bg-white shadow-2xl border-2 border-red-500">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm flex items-center">
                  <Bug className="w-4 h-4 mr-2 text-red-600" />
                  Debug Panel
                </CardTitle>
                <Button
                  onClick={toggleVisibility}
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0"
                >
                  <EyeOff className="w-4 h-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <DebugPanelContent
                stats={stats}
                user={user}
                onTestLogout={handleTestLogout}
                onDropdownLogout={handleDropdownLogout}
                onForceLogout={handleForceLogout}
                onHealthCheck={handleHealthCheck}
                onLogoutDiagnostics={handleLogoutDiagnostics}
                onDownloadLog={downloadLog}
                onClearLogs={clearLogs}
              />
            </CardContent>
          </Card>
        )}
      </>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center">
          <Bug className="w-5 h-5 mr-2 text-red-600" />
          Debug Panel
        </CardTitle>
      </CardHeader>
      <CardContent>
        <DebugPanelContent
          stats={stats}
          user={user}
          onTestLogout={handleTestLogout}
          onDropdownLogout={handleDropdownLogout}
          onForceLogout={handleForceLogout}
          onHealthCheck={handleHealthCheck}
          onLogoutDiagnostics={handleLogoutDiagnostics}
          onDownloadLog={downloadLog}
          onClearLogs={clearLogs}
        />
      </CardContent>
    </Card>
  );
};

interface DebugPanelContentProps {
  stats: any;
  user: any;
  onTestLogout: () => void;
  onDropdownLogout: () => void;
  onForceLogout: () => void;
  onHealthCheck: () => void;
  onLogoutDiagnostics: () => void;
  onDownloadLog: () => void;
  onClearLogs: () => void;
}

const DebugPanelContent: React.FC<DebugPanelContentProps> = ({
  stats,
  user,
  onTestLogout,
  onDropdownLogout,
  onForceLogout,
  onHealthCheck,
  onLogoutDiagnostics,
  onDownloadLog,
  onClearLogs
}) => {
  return (
    <div className="space-y-3">
      {/* User Info */}
      <div className="text-xs">
        <p><strong>User:</strong> {user?.email || 'Not logged in'}</p>
        <p><strong>Role:</strong> {user?.user_metadata?.role || 'No role'}</p>
        <p><strong>ID:</strong> {user?.id || 'N/A'}</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-2 text-xs">
        <div>
          <Badge variant="outline" className="text-xs">
            Logs: {stats.totalLogs || 0}
          </Badge>
        </div>
        <div>
          <Badge variant="destructive" className="text-xs">
            Errors: {stats.errors || 0}
          </Badge>
        </div>
        <div>
          <Badge variant="secondary" className="text-xs">
            Logout: {stats.logoutAttempts || 0}
          </Badge>
        </div>
        <div>
          <Badge variant="default" className="text-xs">
            Auth: {stats.authEvents || 0}
          </Badge>
        </div>
      </div>

      {/* Test Buttons */}
      <div className="space-y-2">
        <Button
          onClick={onTestLogout}
          className="w-full bg-red-600 hover:bg-red-700 text-white text-xs"
          size="sm"
        >
          🧪 Test Direct Logout
        </Button>
        
        <Button
          onClick={onDropdownLogout}
          className="w-full bg-orange-600 hover:bg-orange-700 text-white text-xs"
          size="sm"
        >
          🔽 Test Dropdown Logout
        </Button>

        <Button
          onClick={onForceLogout}
          className="w-full bg-red-800 hover:bg-red-900 text-white text-xs"
          size="sm"
        >
          <AlertTriangle className="w-3 h-3 mr-1" />
          🚨 Force Logout
        </Button>

        <Button
          onClick={onHealthCheck}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white text-xs"
          size="sm"
        >
          <Activity className="w-3 h-3 mr-1" />
          🏥 Health Check
        </Button>

        <Button
          onClick={onLogoutDiagnostics}
          className="w-full bg-purple-600 hover:bg-purple-700 text-white text-xs"
          size="sm"
        >
          <Search className="w-3 h-3 mr-1" />
          🔍 Logout Diagnostics
        </Button>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-2">
        <Button
          onClick={onDownloadLog}
          variant="outline"
          size="sm"
          className="flex-1 text-xs"
        >
          <Download className="w-3 h-3 mr-1" />
          Download TXT
        </Button>
        
        <Button
          onClick={onClearLogs}
          variant="outline"
          size="sm"
          className="flex-1 text-xs"
        >
          <Trash2 className="w-3 h-3 mr-1" />
          Clear
        </Button>
      </div>

      {/* Session Info */}
      <div className="text-xs text-gray-500">
        <p>Session: {stats.sessionId?.slice(-8) || 'N/A'}</p>
        <p>URL: {window.location.pathname}</p>
      </div>
    </div>
  );
};

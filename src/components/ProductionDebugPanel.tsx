import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface DebugInfo {
  environment: {
    mode: string;
    dev: boolean;
    prod: boolean;
    currentUrl: string;
    hasSupabaseUrl: boolean;
    hasSupabaseKey: boolean;
  };
  supabase: {
    url: string;
    keyPrefix: string;
    connected: boolean;
    error?: string;
  };
  auth: {
    hasUser: boolean;
    hasSession: boolean;
    hasProfile: boolean;
    loading: boolean;
    userEmail?: string;
    userRole?: string;
  };
}

export const ProductionDebugPanel: React.FC = () => {
  const [debugInfo, setDebugInfo] = useState<DebugInfo | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const { user, session, profile, loading } = useAuth();

  useEffect(() => {
    const loadDebugInfo = async () => {
      try {
        // Test Supabase connection
        const { data, error } = await supabase.auth.getSession();
        
        const info: DebugInfo = {
          environment: {
            mode: import.meta.env.MODE,
            dev: import.meta.env.DEV,
            prod: import.meta.env.PROD,
            currentUrl: window.location.href,
            hasSupabaseUrl: !!import.meta.env.VITE_SUPABASE_URL,
            hasSupabaseKey: !!import.meta.env.VITE_SUPABASE_ANON_KEY,
          },
          supabase: {
            url: import.meta.env.VITE_SUPABASE_URL ? '[set]' : '[unset]',
            keyPrefix: import.meta.env.VITE_SUPABASE_ANON_KEY ? '[set]' : '[unset]',
            connected: !error,
            error: error?.message,
          },
          auth: {
            hasUser: !!user,
            hasSession: !!session,
            hasProfile: !!profile,
            loading,
            userEmail: user?.email,
            userRole: profile?.role || user?.user_metadata?.role,
          },
        };

        setDebugInfo(info);
      } catch (err) {
        console.error('Debug info loading failed:', err);
      }
    };

    loadDebugInfo();
  }, [user, session, profile, loading]);

  // Don't render anything if not in development mode
  // This allows hooks to be called consistently but prevents rendering
  if (!import.meta.env.DEV) {
    return null;
  }

  return (
    <>
      {/* Debug Toggle Button */}
      <button
        onClick={() => setIsVisible(!isVisible)}
        className="fixed bottom-4 right-4 bg-red-600 text-white p-2 rounded-full shadow-lg z-50 text-xs"
        title="Production Debug Panel"
      >
        🐛
      </button>

      {/* Debug Panel */}
      {isVisible && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-96 overflow-auto p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold text-red-600">🚨 Production Debug Panel</h2>
              <button
                onClick={() => setIsVisible(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>

            {debugInfo && (
              <div className="space-y-4 text-sm">
                {/* Environment Info */}
                <div>
                  <h3 className="font-semibold text-gray-800 mb-2">🌐 Environment</h3>
                  <div className="bg-gray-100 p-3 rounded">
                    <div>Mode: <span className="font-mono">{debugInfo.environment.mode}</span></div>
                    <div>Production: <span className={debugInfo.environment.prod ? 'text-green-600' : 'text-red-600'}>{debugInfo.environment.prod ? '✅' : '❌'}</span></div>
                    <div>Current URL: <span className="font-mono text-xs">{debugInfo.environment.currentUrl}</span></div>
                    <div>Supabase URL: <span className={debugInfo.environment.hasSupabaseUrl ? 'text-green-600' : 'text-red-600'}>{debugInfo.environment.hasSupabaseUrl ? '✅' : '❌'}</span></div>
                    <div>Supabase Key: <span className={debugInfo.environment.hasSupabaseKey ? 'text-green-600' : 'text-red-600'}>{debugInfo.environment.hasSupabaseKey ? '✅' : '❌'}</span></div>
                  </div>
                </div>

                {/* Supabase Info */}
                <div>
                  <h3 className="font-semibold text-gray-800 mb-2">🗄️ Supabase</h3>
                  <div className="bg-gray-100 p-3 rounded">
                    <div>URL: <span className="font-mono text-xs">{debugInfo.supabase.url}</span></div>
                    <div>Key: <span className="font-mono text-xs">{debugInfo.supabase.keyPrefix}</span></div>
                    <div>Connected: <span className={debugInfo.supabase.connected ? 'text-green-600' : 'text-red-600'}>{debugInfo.supabase.connected ? '✅' : '❌'}</span></div>
                    {debugInfo.supabase.error && (
                      <div className="text-red-600 text-xs mt-1">Error: {debugInfo.supabase.error}</div>
                    )}
                  </div>
                </div>

                {/* Auth Info */}
                <div>
                  <h3 className="font-semibold text-gray-800 mb-2">🔐 Authentication</h3>
                  <div className="bg-gray-100 p-3 rounded">
                    <div>Loading: <span className={debugInfo.auth.loading ? 'text-yellow-600' : 'text-green-600'}>{debugInfo.auth.loading ? '⏳' : '✅'}</span></div>
                    <div>User: <span className={debugInfo.auth.hasUser ? 'text-green-600' : 'text-red-600'}>{debugInfo.auth.hasUser ? '✅' : '❌'}</span></div>
                    <div>Session: <span className={debugInfo.auth.hasSession ? 'text-green-600' : 'text-red-600'}>{debugInfo.auth.hasSession ? '✅' : '❌'}</span></div>
                    <div>Profile: <span className={debugInfo.auth.hasProfile ? 'text-green-600' : 'text-red-600'}>{debugInfo.auth.hasProfile ? '✅' : '❌'}</span></div>
                    {debugInfo.auth.userEmail && (
                      <div>Email: <span className="font-mono text-xs">{debugInfo.auth.userEmail}</span></div>
                    )}
                    {debugInfo.auth.userRole && (
                      <div>Role: <span className="font-mono">{debugInfo.auth.userRole}</span></div>
                    )}
                  </div>
                </div>

                {/* Quick Actions */}
                <div>
                  <h3 className="font-semibold text-gray-800 mb-2">🔧 Quick Actions</h3>
                  <div className="flex gap-2 flex-wrap">
                    <button
                      onClick={() => window.location.reload()}
                      className="bg-blue-500 text-white px-3 py-1 rounded text-xs hover:bg-blue-600"
                    >
                      Reload Page
                    </button>
                    <button
                      onClick={() => {
                        // Use React Router navigation if available, otherwise fallback
                        if (window.location.pathname !== '/auth') {
                          window.location.href = '/auth';
                        }
                      }}
                      className="bg-green-500 text-white px-3 py-1 rounded text-xs hover:bg-green-600"
                    >
                      Go to Auth
                    </button>
                    <button
                      onClick={() => {
                        localStorage.clear();
                        sessionStorage.clear();
                        window.location.reload();
                      }}
                      className="bg-red-500 text-white px-3 py-1 rounded text-xs hover:bg-red-600"
                    >
                      Clear Storage
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};

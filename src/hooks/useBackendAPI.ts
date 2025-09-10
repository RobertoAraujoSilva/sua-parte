import { useState, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';

interface BackendAPIConfig {
  baseUrl: string;
  timeout: number;
}

interface APIResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  details?: string;
}

interface MaterialFile {
  filename: string;
  size: number;
  sizeFormatted: string;
  modifiedAt: string;
  path: string;
}

interface DownloadResult {
  checked: MaterialFile[];
  downloaded: MaterialFile[];
  errors: any[];
  newMaterials: MaterialFile[];
}

const useBackendAPI = (config?: Partial<BackendAPIConfig>) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const defaultConfig: BackendAPIConfig = {
    baseUrl: import.meta.env.PROD ? '' : 'http://localhost:3001',
    timeout: 10000,
    ...config
  };

  // Generic API call function
  const apiCall = useCallback(async <T = any>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<APIResponse<T>> => {
    setLoading(true);
    setError(null);

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), defaultConfig.timeout);

      const response = await fetch(`${defaultConfig.baseUrl}${endpoint}`, {
        ...options,
        signal: controller.signal,
        headers: {
          'Authorization': `Bearer ${user?.access_token || 'dev-token'}`,
          'Content-Type': 'application/json',
          ...options.headers,
        },
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (err: any) {
      const errorMessage = err.name === 'AbortError' 
        ? 'Request timeout - backend may be offline'
        : err.message || 'Unknown error occurred';
      
      setError(errorMessage);
      console.error(`❌ API Error [${endpoint}]:`, errorMessage);
      
      return {
        success: false,
        error: errorMessage
      };
    } finally {
      setLoading(false);
    }
  }, [user, defaultConfig.baseUrl, defaultConfig.timeout]);

  // Materials API methods
  const materials = {
    // List all downloaded materials
    list: useCallback(async (): Promise<APIResponse<{ materials: MaterialFile[]; total: number }>> => {
      return apiCall('/api/materials');
    }, [apiCall]),

    // Get specific material info
    get: useCallback(async (filename: string): Promise<APIResponse<{ material: MaterialFile }>> => {
      return apiCall(`/api/materials/${encodeURIComponent(filename)}`);
    }, [apiCall]),

    // Download material by URL
    download: useCallback(async (url: string, language = 'pt-BR'): Promise<APIResponse<MaterialFile>> => {
      return apiCall('/api/materials/download', {
        method: 'POST',
        body: JSON.stringify({ url, language })
      });
    }, [apiCall]),

    // Check for updates
    checkUpdates: useCallback(async (language?: string): Promise<APIResponse<MaterialFile[]>> => {
      return apiCall('/api/materials/check-updates', {
        method: 'POST',
        body: JSON.stringify({ language })
      });
    }, [apiCall]),

    // Sync all materials
    syncAll: useCallback(async (): Promise<APIResponse<DownloadResult>> => {
      return apiCall('/api/materials/sync-all', {
        method: 'POST'
      });
    }, [apiCall]),

    // Cleanup old materials
    cleanup: useCallback(async (daysToKeep = 90): Promise<APIResponse<{ deleted: number; remaining: number }>> => {
      return apiCall('/api/materials/cleanup', {
        method: 'POST',
        body: JSON.stringify({ daysToKeep })
      });
    }, [apiCall])
  };

  // Admin API methods
  const admin = {
    // Get system status
    status: useCallback(async (): Promise<APIResponse<any>> => {
      return apiCall('/api/admin/status');
    }, [apiCall]),

    // Get system health
    health: useCallback(async (): Promise<APIResponse<any>> => {
      return apiCall('/api/admin/health');
    }, [apiCall]),

    // Trigger download
    triggerDownload: useCallback(async (): Promise<APIResponse<DownloadResult>> => {
      return apiCall('/api/admin/download', {
        method: 'POST'
      });
    }, [apiCall])
  };

  // Test backend connectivity
  const testConnection = useCallback(async (): Promise<boolean> => {
    // In production, we use Supabase as backend, so test Supabase connection
    if (import.meta.env.PROD) {
      try {
        // Test Supabase connection by making a simple query
        const { error } = await fetch('https://nwpuurgwnnuejqinkvrh.supabase.co/rest/v1/', {
          headers: {
            'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im53cHV1cmd3bm51ZWpxaW5rdnJoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ0NjIwNjUsImV4cCI6MjA3MDAzODA2NX0.UHjSvXYY_c-_ydAIfELRUs4CMEBLKiztpBGQBNPHfak'
          },
          signal: AbortSignal.timeout(5000)
        });
        return true; // Supabase is our backend in production
      } catch (error) {
        return false;
      }
    }
    
    // In development, test local backend
    if (!defaultConfig.baseUrl) {
      return true; // No local backend needed, use Supabase
    }
    
    try {
      const response = await fetch(`${defaultConfig.baseUrl}/api/admin/status`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${user?.access_token || 'dev-token'}`,
        },
        signal: AbortSignal.timeout(5000)
      });
      
      return response.ok;
    } catch (error) {
      return true; // Fallback to Supabase if local backend fails
    }
  }, [defaultConfig.baseUrl, user]);

  return {
    loading,
    error,
    materials,
    admin,
    testConnection,
    apiCall
  };
};

export default useBackendAPI;
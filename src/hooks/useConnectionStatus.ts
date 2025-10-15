import { useState, useEffect } from 'react';

export interface ConnectionStatus {
  isOnline: boolean;
  lastSync: Date | null;
  isSyncing: boolean;
  pendingOperations: number;
  failedOperations: number;
  autoSyncEnabled: boolean;
}

export const useConnectionStatus = () => {
  const [status, setStatus] = useState<ConnectionStatus>({
    isOnline: navigator.onLine,
    lastSync: null,
    isSyncing: false,
    pendingOperations: 0,
    failedOperations: 0,
    autoSyncEnabled: true
  });

  useEffect(() => {
    const handleOnline = () => {
      setStatus(prev => ({ ...prev, isOnline: true }));
    };

    const handleOffline = () => {
      setStatus(prev => ({ ...prev, isOnline: false }));
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const syncNow = async () => {
    setStatus(prev => ({ ...prev, isSyncing: true }));
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      setStatus(prev => ({ 
        ...prev, 
        isSyncing: false, 
        lastSync: new Date(),
        pendingOperations: 0 
      }));
      
      return {
        success: true,
        syncedCount: status.pendingOperations,
        failedCount: 0
      };
    } catch (error) {
      setStatus(prev => ({ 
        ...prev, 
        isSyncing: false,
        failedOperations: prev.failedOperations + 1 
      }));
      return {
        success: false,
        syncedCount: 0,
        failedCount: status.pendingOperations
      };
    }
  };

  const setAutoSyncEnabled = (enabled: boolean) => {
    setStatus(prev => ({ ...prev, autoSyncEnabled: enabled }));
  };

  return {
    ...status,
    syncNow,
    setAutoSyncEnabled
  };
};

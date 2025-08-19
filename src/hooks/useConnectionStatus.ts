import { useState, useEffect, useCallback } from 'react';
import { syncOutbox, getOutboxStatus, downloadIncrementalData } from '@/utils/offlineLocalDB';

export interface ConnectionStatus {
  isOnline: boolean;
  pendingOperations: number;
  failedOperations: number;
  lastSyncTime?: number;
  isSyncing: boolean;
}

export function useConnectionStatus() {
  const [status, setStatus] = useState<ConnectionStatus>({
    isOnline: navigator.onLine,
    pendingOperations: 0,
    failedOperations: 0,
    isSyncing: false
  });

  const [autoSyncEnabled, setAutoSyncEnabled] = useState(() => {
    return import.meta.env.VITE_SYNC_MANUAL_ONLY !== 'true';
  });

  // Update outbox status
  const updateOutboxStatus = useCallback(async () => {
    try {
      const outboxStatus = await getOutboxStatus();
      setStatus(prev => ({
        ...prev,
        pendingOperations: outboxStatus.pendingCount,
        failedOperations: outboxStatus.failedCount,
        lastSyncTime: outboxStatus.lastSyncTime
      }));
    } catch (error) {
      console.error('Error updating outbox status:', error);
    }
  }, []);

  // Manual sync function
  const syncNow = useCallback(async () => {
    if (status.isSyncing) return;
    
    setStatus(prev => ({ ...prev, isSyncing: true }));
    
    try {
      console.log('🔄 Starting manual sync...');
      
      // First, download any new data from server
      if (status.isOnline) {
        await downloadIncrementalData();
      }
      
      // Then sync outbox operations
      const result = await syncOutbox();
      
      console.log(`✅ Sync completed: ${result.syncedCount} synced, ${result.failedCount} failed`);
      
      // Update status
      await updateOutboxStatus();
      
      return result;
    } catch (error) {
      console.error('❌ Sync failed:', error);
      throw error;
    } finally {
      setStatus(prev => ({ ...prev, isSyncing: false }));
    }
  }, [status.isSyncing, status.isOnline, updateOutboxStatus]);

  // Auto-sync when coming back online
  const handleOnlineChange = useCallback(async () => {
    const isOnline = navigator.onLine;
    setStatus(prev => ({ ...prev, isOnline }));
    
    if (isOnline && autoSyncEnabled && !status.isSyncing) {
      console.log('📡 Connection restored - starting auto-sync...');
      try {
        await syncNow();
      } catch (error) {
        console.error('❌ Auto-sync failed:', error);
      }
    }
  }, [autoSyncEnabled, status.isSyncing, syncNow]);

  useEffect(() => {
    // Listen for online/offline events
    window.addEventListener('online', handleOnlineChange);
    window.addEventListener('offline', handleOnlineChange);
    
    // Update outbox status periodically
    const interval = setInterval(updateOutboxStatus, 5000);
    
    // Initial status update
    updateOutboxStatus();
    
    return () => {
      window.removeEventListener('online', handleOnlineChange);
      window.removeEventListener('offline', handleOnlineChange);
      clearInterval(interval);
    };
  }, [handleOnlineChange, updateOutboxStatus]);

  return {
    ...status,
    autoSyncEnabled,
    setAutoSyncEnabled,
    syncNow,
    updateStatus: updateOutboxStatus
  };
}
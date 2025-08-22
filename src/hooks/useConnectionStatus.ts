import { useState, useEffect } from 'react';

export interface ConnectionStatus {
  isOnline: boolean;
  lastOnline: Date | null;
  connectionType: 'online' | 'offline' | 'slow';
  latency: number | null;
}

export interface OutboxStatus {
  pendingCount: number;
  lastSync: Date | null;
  syncInProgress: boolean;
}

export function useConnectionStatus() {
  const [status, setStatus] = useState<ConnectionStatus>({
    isOnline: navigator.onLine,
    lastOnline: navigator.onLine ? new Date() : null,
    connectionType: navigator.onLine ? 'online' : 'offline',
    latency: null
  });

  const [outboxStatus, setOutboxStatus] = useState<OutboxStatus>({
    pendingCount: 0,
    lastSync: null,
    syncInProgress: false
  });

  // Monitor online/offline status
  useEffect(() => {
    const handleOnline = () => {
      setStatus(prev => ({
        ...prev,
        isOnline: true,
        lastOnline: new Date(),
        connectionType: 'online'
      }));
    };

    const handleOffline = () => {
      setStatus(prev => ({
        ...prev,
        isOnline: false,
        connectionType: 'offline'
      }));
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Check connection quality periodically
  useEffect(() => {
    if (!status.isOnline) return;

    const checkConnectionQuality = async () => {
      try {
        const startTime = Date.now();
        
        // Simple ping to check latency
        const response = await fetch('/favicon.ico', { 
          method: 'HEAD',
          cache: 'no-cache'
        });
        
        const latency = Date.now() - startTime;
        
        setStatus(prev => ({
          ...prev,
          latency,
          connectionType: latency > 2000 ? 'slow' : 'online'
        }));
      } catch (error) {
        // If fetch fails, we might be offline
        setStatus(prev => ({
          ...prev,
          isOnline: false,
          connectionType: 'offline',
          latency: null
        }));
      }
    };

    // Check immediately and then every 30 seconds
    checkConnectionQuality();
    const interval = setInterval(checkConnectionQuality, 30000);

    return () => clearInterval(interval);
  }, [status.isOnline]);

  // Monitor outbox status
  useEffect(() => {
    const checkOutboxStatus = async () => {
      try {
        // Check if offlineDB is available
        if (typeof window !== 'undefined' && (window as any).offlineDB?.getOutboxCount) {
          const count = await (window as any).offlineDB.getOutboxCount();

          setOutboxStatus(prev => ({
            ...prev,
            pendingCount: count
          }));
        }
      } catch (error) {
        console.warn('Failed to check outbox status:', error);
      }
    };

    // Check immediately and then every 10 seconds
    checkOutboxStatus();
    const interval = setInterval(checkOutboxStatus, 10000);

    return () => clearInterval(interval);
  }, []);

  return {
    ...status,
    outbox: outboxStatus,
    refresh: () => {
      setStatus(prev => ({
        ...prev,
        isOnline: navigator.onLine,
        lastOnline: navigator.onLine ? new Date() : prev.lastOnline,
        connectionType: navigator.onLine ? 'online' : 'offline'
      }));
    }
  };
}



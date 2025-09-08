import React, { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, Wifi, WifiOff } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

type ConnectionStatus = 'online' | 'offline' | 'reconnecting';

export const ConnectionStatusBanner = () => {
  const [status, setStatus] = useState<ConnectionStatus>('online');
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Check initial connection status
    setStatus(navigator.onLine ? 'online' : 'offline');
    
    // Set up event listeners for connection changes
    const handleOnline = () => {
      setStatus('online');
      // Show the banner briefly when reconnecting
      setVisible(true);
      setTimeout(() => setVisible(false), 3000);
    };
    
    const handleOffline = () => {
      setStatus('offline');
      setVisible(true);
    };
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (!visible) return null;

  return (
    <div className="fixed top-16 left-0 right-0 z-50 flex justify-center px-4 py-1">
      <Alert 
        variant={status === 'online' ? 'default' : 'destructive'}
        className="w-auto max-w-md animate-in fade-in slide-in-from-top-5 duration-300"
      >
        <div className="flex items-center gap-2">
          {status === 'online' ? (
            <Wifi className="h-4 w-4" />
          ) : (
            <WifiOff className="h-4 w-4" />
          )}
          <AlertDescription>
            {status === 'online' 
              ? 'Conexão restabelecida' 
              : 'Sem conexão com a internet'}
          </AlertDescription>
          <Badge 
            variant={status === 'online' ? 'outline' : 'destructive'}
            className="ml-2"
          >
            {status === 'online' ? 'Online' : 'Offline'}
          </Badge>
        </div>
      </Alert>
    </div>
  );
};
import React from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Wifi, WifiOff, RefreshCw, AlertTriangle } from 'lucide-react';
import { useConnectionStatus } from '@/hooks/useConnectionStatus';
import { useToast } from '@/hooks/use-toast';

export function ConnectionStatusBanner() {
  const { 
    isOnline, 
    pendingOperations, 
    failedOperations, 
    isSyncing, 
    autoSyncEnabled,
    syncNow 
  } = useConnectionStatus();
  const { toast } = useToast();

  const handleSync = async () => {
    try {
      const result = await syncNow();
      
      if (result.success) {
        toast({
          title: "Sincronização concluída",
          description: `${result.syncedCount} operações sincronizadas.`,
        });
      }
    } catch (error) {
      toast({
        title: "Erro na sincronização",
        description: "Não foi possível sincronizar.",
        variant: "destructive"
      });
    }
  };

  // Don't show banner if online and no pending operations
  if (isOnline && pendingOperations === 0 && failedOperations === 0) {
    return null;
  }

  const getVariant = () => {
    if (!isOnline) return 'destructive';
    if (failedOperations > 0) return 'destructive';
    if (pendingOperations > 0) return 'default';
    return 'default';
  };

  const getIcon = () => {
    if (!isOnline) return <WifiOff className="h-4 w-4" />;
    if (failedOperations > 0) return <AlertTriangle className="h-4 w-4" />;
    return <Wifi className="h-4 w-4" />;
  };

  const getMessage = () => {
    if (!isOnline) {
      return `Você está offline. ${pendingOperations > 0 ? `${pendingOperations} alterações serão sincronizadas quando voltar online.` : ''}`;
    }
    
    if (failedOperations > 0) {
      return `${failedOperations} operações falharam na sincronização. Clique em sincronizar para tentar novamente.`;
    }
    
    if (pendingOperations > 0) {
      return `${pendingOperations} alterações pendentes para sincronização.`;
    }
    
    return 'Todas as alterações foram sincronizadas.';
  };

  return (
    <Alert variant={getVariant()} className="mb-4">
      {getIcon()}
      <AlertDescription className="flex items-center justify-between">
        <span>{getMessage()}</span>
        
        {isOnline && (pendingOperations > 0 || failedOperations > 0) && (
          <Button
            onClick={handleSync}
            disabled={isSyncing}
            size="sm"
            variant="outline"
            className="ml-4"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isSyncing ? 'animate-spin' : ''}`} />
            {isSyncing ? 'Sincronizando...' : 'Sincronizar'}
          </Button>
        )}
        
        {!autoSyncEnabled && isOnline && (
          <span className="text-sm text-muted-foreground ml-2">
            (Auto-sync desabilitado)
          </span>
        )}
      </AlertDescription>
    </Alert>
  );
}

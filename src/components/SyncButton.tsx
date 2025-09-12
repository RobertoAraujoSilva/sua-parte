import React from 'react';
import { Button } from '@/components/ui/button';
import { RefreshCw, Wifi, WifiOff } from 'lucide-react';
import { useConnectionStatus } from '@/hooks/useConnectionStatus';
import { useToast } from '@/hooks/use-toast';

export function SyncButton() {
  const { 
    isOnline, 
    pendingOperations, 
    failedOperations, 
    isSyncing, 
    autoSyncEnabled,
    setAutoSyncEnabled,
    syncNow 
  } = useConnectionStatus();
  const { toast } = useToast();

  const handleSync = async () => {
    try {
      const result = await syncNow();
      
      if (result.success) {
        toast({
          title: "Sincronização concluída",
          description: `${result.syncedCount} operações sincronizadas com sucesso.`,
        });
      } else {
        toast({
          title: "Sincronização parcial",
          description: `${result.syncedCount} sincronizadas, ${result.failedCount} falharam.`,
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Erro na sincronização",
        description: "Não foi possível sincronizar os dados.",
        variant: "destructive"
      });
    }
  };

  const toggleAutoSync = () => {
    setAutoSyncEnabled(!autoSyncEnabled);
    toast({
      title: autoSyncEnabled ? "Auto-sync desabilitado" : "Auto-sync habilitado",
      description: autoSyncEnabled 
        ? "Sincronização automática foi desabilitada" 
        : "Sincronização automática foi habilitada"
    });
  };

  const hasPendingOperations = pendingOperations > 0 || failedOperations > 0;

  return (
    <div className="flex items-center gap-2">
      {/* Connection Status Indicator */}
      <div className="flex items-center gap-1 text-sm">
        {isOnline ? (
          <Wifi className="h-4 w-4 text-green-500" />
        ) : (
          <WifiOff className="h-4 w-4 text-red-500" />
        )}
        <span className={isOnline ? "text-green-600" : "text-red-600"}>
          {isOnline ? "Online" : "Offline"}
        </span>
      </div>

      {/* Pending Operations Counter */}
      {hasPendingOperations && (
        <div className="text-sm text-amber-600">
          {pendingOperations > 0 && `${pendingOperations} pendentes`}
          {failedOperations > 0 && ` ${failedOperations} falharam`}
        </div>
      )}

      {/* Auto-sync Toggle */}
      <Button
        variant="outline"
        size="sm"
        onClick={toggleAutoSync}
        className={autoSyncEnabled ? "bg-green-50 border-green-200" : ""}
      >
        Auto-sync {autoSyncEnabled ? "ON" : "OFF"}
      </Button>

      {/* Manual Sync Button */}
      <Button
        onClick={handleSync}
        disabled={isSyncing || !isOnline}
        size="sm"
        variant={hasPendingOperations ? "default" : "outline"}
      >
        <RefreshCw className={`h-4 w-4 mr-2 ${isSyncing ? 'animate-spin' : ''}`} />
        {isSyncing ? "Sincronizando..." : "Sincronizar"}
      </Button>
    </div>
  );
}

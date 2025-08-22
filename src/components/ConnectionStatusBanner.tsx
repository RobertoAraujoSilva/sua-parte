import React from 'react';
import { useConnectionStatus } from '@/hooks/useConnectionStatus';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Wifi, 
  WifiOff, 
  Clock, 
  RefreshCw, 
  AlertTriangle,
  CheckCircle,
  RefreshCw as Sync
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface ConnectionStatusBannerProps {
  className?: string;
  compact?: boolean;
}

export function ConnectionStatusBanner({ className, compact = false }: ConnectionStatusBannerProps) {
  const connection = useConnectionStatus();

  const getStatusIcon = () => {
    if (!connection.isOnline) {
      return <WifiOff className="h-4 w-4" />;
    }
    
    if (connection.connectionType === 'slow') {
      return <AlertTriangle className="h-4 w-4" />;
    }
    
    return <Wifi className="h-4 w-4" />;
  };

  const getStatusColor = () => {
    if (!connection.isOnline) return 'destructive';
    if (connection.connectionType === 'slow') return 'warning';
    return 'success';
  };

  const getStatusText = () => {
    if (!connection.isOnline) {
      return compact ? 'Offline' : 'Sem conexão com a internet';
    }
    
    if (connection.connectionType === 'slow') {
      return compact ? 'Lenta' : 'Conexão lenta detectada';
    }
    
    return compact ? 'Online' : 'Conectado';
  };

  const formatLastOnline = () => {
    if (!connection.lastOnline) return 'Nunca';
    
    const now = new Date();
    const diff = now.getTime() - connection.lastOnline.getTime();
    const minutes = Math.floor(diff / 60000);
    
    if (minutes < 1) return 'Agora';
    if (minutes < 60) return `${minutes}min atrás`;
    
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h atrás`;
    
    return connection.lastOnline.toLocaleDateString('pt-BR');
  };

  const handleSync = async () => {
    if (typeof window !== 'undefined' && (window as any).offlineDB?.sync) {
      try {
        await (window as any).offlineDB.sync();
      } catch (error) {
        console.error('Sync failed:', error);
      }
    }
  };

  if (compact) {
    return (
      <div className={cn("flex items-center gap-2", className)}>
        <Badge variant={getStatusColor() as any} className="flex items-center gap-1">
          {getStatusIcon()}
          {getStatusText()}
        </Badge>
        
        {connection.outbox.pendingCount > 0 && (
          <Badge variant="outline" className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {connection.outbox.pendingCount}
          </Badge>
        )}
      </div>
    );
  }

  return (
    <div className={cn(
      "border-b bg-muted/30 px-4 py-2 flex items-center justify-between",
      !connection.isOnline && "bg-destructive/10 border-destructive/20",
      connection.connectionType === 'slow' && "bg-warning/10 border-warning/20",
      className
    )}>
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          {getStatusIcon()}
          <span className="text-sm font-medium">{getStatusText()}</span>
        </div>
        
        {connection.latency && (
          <Badge variant="outline" className="text-xs">
            {connection.latency}ms
          </Badge>
        )}
        
        {!connection.isOnline && connection.lastOnline && (
          <span className="text-xs text-muted-foreground">
            Última conexão: {formatLastOnline()}
          </span>
        )}
      </div>

      <div className="flex items-center gap-2">
        {/* Outbox status */}
        {connection.outbox.pendingCount > 0 && (
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {connection.outbox.pendingCount} pendente{connection.outbox.pendingCount !== 1 ? 's' : ''}
            </Badge>
            
            {connection.isOnline && (
              <Button
                size="sm"
                variant="outline"
                onClick={handleSync}
                disabled={connection.outbox.syncInProgress}
                className="h-7 px-2"
              >
                {connection.outbox.syncInProgress ? (
                  <RefreshCw className="h-3 w-3 animate-spin" />
                ) : (
                  <Sync className="h-3 w-3" />
                )}
                Sincronizar
              </Button>
            )}
          </div>
        )}

        {/* Last sync info */}
        {connection.outbox.lastSync && (
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <CheckCircle className="h-3 w-3" />
            Última sync: {connection.outbox.lastSync.toLocaleTimeString('pt-BR')}
          </div>
        )}

        {/* Refresh button */}
        <Button
          size="sm"
          variant="ghost"
          onClick={connection.refresh}
          className="h-7 px-2"
        >
          <RefreshCw className="h-3 w-3" />
        </Button>
      </div>
    </div>
  );
}

// Utility component for showing connection status in other components
export function ConnectionStatusIndicator({ className }: { className?: string }) {
  return <ConnectionStatusBanner compact className={className} />;
}

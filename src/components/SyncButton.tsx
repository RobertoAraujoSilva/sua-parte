import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export const SyncButton = () => {
  const [syncing, setSyncing] = useState(false);
  const { toast } = useToast();

  const handleSync = async () => {
    if (syncing) return;
    
    setSyncing(true);
    
    try {
      // Simulate sync process
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Show success toast
      toast({
        title: 'Sincronização concluída',
        description: 'Todos os dados foram atualizados com sucesso.',
        variant: 'default',
      });
    } catch (error) {
      // Show error toast
      toast({
        title: 'Erro na sincronização',
        description: 'Não foi possível sincronizar os dados. Tente novamente.',
        variant: 'destructive',
      });
    } finally {
      setSyncing(false);
    }
  };

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleSync}
      disabled={syncing}
      className="flex items-center gap-2"
    >
      <RefreshCw className={`h-4 w-4 ${syncing ? 'animate-spin' : ''}`} />
      {syncing ? 'Sincronizando...' : 'Sincronizar'}
    </Button>
  );
};
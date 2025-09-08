import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RefreshCw, AlertCircle, FileX } from 'lucide-react';

interface FallbackStateProps {
  type: 'loading' | 'error' | 'empty';
  title?: string;
  message?: string;
  onRetry?: () => void;
  children?: React.ReactNode;
}

export function FallbackState({ 
  type, 
  title, 
  message, 
  onRetry, 
  children 
}: FallbackStateProps) {
  const getIcon = () => {
    switch (type) {
      case 'loading':
        return <RefreshCw className="h-12 w-12 animate-spin text-muted-foreground" />;
      case 'error':
        return <AlertCircle className="h-12 w-12 text-destructive" />;
      case 'empty':
        return <FileX className="h-12 w-12 text-muted-foreground" />;
    }
  };

  const getDefaultTitle = () => {
    switch (type) {
      case 'loading':
        return 'Carregando...';
      case 'error':
        return 'Erro ao carregar';
      case 'empty':
        return 'Nenhum dado encontrado';
    }
  };

  const getDefaultMessage = () => {
    switch (type) {
      case 'loading':
        return 'Aguarde enquanto carregamos os dados...';
      case 'error':
        return 'Ocorreu um erro ao carregar os dados. Tente novamente.';
      case 'empty':
        return 'Não há dados para exibir no momento. Tente recarregar a página (F5) ou clique em "Tentar Novamente".';
    }
  };

  return (
    <Card className="w-full">
      <CardContent className="flex flex-col items-center justify-center py-12 text-center">
        {getIcon()}
        <h3 className="text-lg font-medium mt-4 mb-2">
          {title || getDefaultTitle()}
        </h3>
        <p className="text-sm text-muted-foreground mb-6 max-w-md">
          {message || getDefaultMessage()}
        </p>
        {onRetry && type !== 'loading' && (
          <Button onClick={onRetry} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Tentar Novamente
          </Button>
        )}
        {children}
      </CardContent>
    </Card>
  );
}
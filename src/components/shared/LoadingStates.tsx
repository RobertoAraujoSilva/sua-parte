import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { 
  Loader2, 
  AlertCircle, 
  CheckCircle, 
  Info,
  RefreshCw,
  ArrowLeft
} from 'lucide-react';

// Loading Spinner Component
interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  size = 'md', 
  className = '' 
}) => {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8', 
    lg: 'h-12 w-12'
  };

  return (
    <Loader2 className={`animate-spin ${sizeClasses[size]} ${className}`} />
  );
};

// Loading Screen Component
interface LoadingScreenProps {
  message?: string;
  subMessage?: string;
  showSpinner?: boolean;
  className?: string;
}

export const LoadingScreen: React.FC<LoadingScreenProps> = ({
  message = "Carregando...",
  subMessage,
  showSpinner = true,
  className = ""
}) => (
  <div className={`min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center ${className}`}>
    <div className="text-center bg-white p-8 rounded-2xl shadow-lg border border-gray-200 max-w-md">
      {showSpinner && (
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-200 border-t-blue-600 mx-auto mb-6"></div>
      )}
      <h2 className="text-xl font-semibold text-gray-800 mb-2">{message}</h2>
      {subMessage && (
        <p className="text-gray-600 text-sm">{subMessage}</p>
      )}
      <div className="mt-4 flex justify-center space-x-2">
        <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"></div>
        <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
        <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
      </div>
    </div>
  </div>
);

// Compact Loading Card
interface LoadingCardProps {
  title?: string;
  description?: string;
  className?: string;
}

export const LoadingCard: React.FC<LoadingCardProps> = ({
  title = "Carregando",
  description = "Por favor aguarde...",
  className = ""
}) => (
  <Card className={className}>
    <CardContent className="pt-6">
      <div className="flex items-center justify-center py-8">
        <LoadingSpinner className="text-jw-blue mr-3" />
        <div className="text-left">
          <h3 className="font-medium text-gray-900">{title}</h3>
          <p className="text-sm text-gray-600">{description}</p>
        </div>
      </div>
    </CardContent>
  </Card>
);

// Error State Component
interface ErrorStateProps {
  title?: string;
  message: string;
  onRetry?: () => void;
  onGoBack?: () => void;
  retryLabel?: string;
  showGoBack?: boolean;
  className?: string;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  title = "Erro",
  message,
  onRetry,
  onGoBack,
  retryLabel = "Tentar Novamente",
  showGoBack = false,
  className = ""
}) => (
  <Alert className={`border-red-200 bg-red-50 ${className}`}>
    <AlertCircle className="h-4 w-4 text-red-600" />
    <AlertDescription>
      <div className="space-y-3">
        <div>
          <h4 className="font-semibold text-red-800">{title}</h4>
          <p className="text-red-700 text-sm mt-1">{message}</p>
        </div>
        
        <div className="flex gap-2">
          {onRetry && (
            <Button 
              size="sm" 
              variant="outline"
              onClick={onRetry}
              className="border-red-300 text-red-700 hover:bg-red-100"
            >
              <RefreshCw className="w-4 h-4 mr-1" />
              {retryLabel}
            </Button>
          )}
          
          {showGoBack && onGoBack && (
            <Button 
              size="sm" 
              variant="ghost"
              onClick={onGoBack}
              className="text-red-600 hover:bg-red-100"
            >
              <ArrowLeft className="w-4 h-4 mr-1" />
              Voltar
            </Button>
          )}
        </div>
      </div>
    </AlertDescription>
  </Alert>
);

// Success State Component
interface SuccessStateProps {
  title?: string;
  message: string;
  onContinue?: () => void;
  continueLabel?: string;
  className?: string;
}

export const SuccessState: React.FC<SuccessStateProps> = ({
  title = "Sucesso",
  message,
  onContinue,
  continueLabel = "Continuar",
  className = ""
}) => (
  <Alert className={`border-green-200 bg-green-50 ${className}`}>
    <CheckCircle className="h-4 w-4 text-green-600" />
    <AlertDescription>
      <div className="space-y-3">
        <div>
          <h4 className="font-semibold text-green-800">{title}</h4>
          <p className="text-green-700 text-sm mt-1">{message}</p>
        </div>
        
        {onContinue && (
          <Button 
            size="sm" 
            onClick={onContinue}
            className="bg-green-600 hover:bg-green-700 text-white"
          >
            {continueLabel}
          </Button>
        )}
      </div>
    </AlertDescription>
  </Alert>
);

// Info State Component
interface InfoStateProps {
  title?: string;
  message: string;
  onAction?: () => void;
  actionLabel?: string;
  className?: string;
}

export const InfoState: React.FC<InfoStateProps> = ({
  title = "Informação",
  message,
  onAction,
  actionLabel = "OK",
  className = ""
}) => (
  <Alert className={`border-blue-200 bg-blue-50 ${className}`}>
    <Info className="h-4 w-4 text-blue-600" />
    <AlertDescription>
      <div className="space-y-3">
        <div>
          <h4 className="font-semibold text-blue-800">{title}</h4>
          <p className="text-blue-700 text-sm mt-1">{message}</p>
        </div>
        
        {onAction && (
          <Button 
            size="sm" 
            variant="outline"
            onClick={onAction}
            className="border-blue-300 text-blue-700 hover:bg-blue-100"
          >
            {actionLabel}
          </Button>
        )}
      </div>
    </AlertDescription>
  </Alert>
);

// Empty State Component
interface EmptyStateProps {
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  icon?: React.ReactNode;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  actionLabel,
  onAction,
  icon,
  className = ""
}) => (
  <Card className={className}>
    <CardContent className="py-12 text-center">
      <div className="space-y-4">
        {icon && (
          <div className="flex justify-center text-gray-400">
            {icon}
          </div>
        )}
        <div>
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          <p className="text-gray-600 mt-1">{description}</p>
        </div>
        
        {onAction && actionLabel && (
          <Button onClick={onAction} className="mt-4">
            {actionLabel}
          </Button>
        )}
      </div>
    </CardContent>
  </Card>
);

// Page Loading Component (for entire pages)
interface PageLoadingProps {
  title?: string;
  subtitle?: string;
}

export const PageLoading: React.FC<PageLoadingProps> = ({
  title = "Carregando Sistema Ministerial",
  subtitle = "Inicializando componentes..."
}) => (
  <LoadingScreen 
    message={title}
    subMessage={subtitle}
    className="fixed inset-0 z-50"
  />
);
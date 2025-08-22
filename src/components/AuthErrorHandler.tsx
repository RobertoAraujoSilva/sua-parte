import React from 'react';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import { Button } from './ui/button';
import { RefreshCw, LogIn, AlertTriangle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface AuthErrorHandlerProps {
  error?: string | null;
  onRetry?: () => void;
  onLogin?: () => void;
}

const AuthErrorHandler: React.FC<AuthErrorHandlerProps> = ({ 
  error, 
  onRetry, 
  onLogin 
}) => {
  const { authError, clearAuthError, refreshAuth, forceClearInvalidTokens } = useAuth();
  
  const currentError = error || authError;
  
  if (!currentError) {
    return null;
  }

  const isRefreshTokenError = currentError.includes('Refresh Token') || 
                             currentError.includes('JWT expired') ||
                             currentError.includes('Sessão expirada');

  const isNetworkError = currentError.includes('network') || 
                        currentError.includes('connection') ||
                        currentError.includes('timeout');

  const handleRetry = async () => {
    if (onRetry) {
      onRetry();
    } else {
      await refreshAuth();
    }
  };

  const handleLogin = async () => {
    // Limpar tokens inválidos antes de redirecionar para login
    await forceClearInvalidTokens();
    clearAuthError();
    if (onLogin) {
      onLogin();
    }
  };

  const handleDismiss = () => {
    clearAuthError();
  };

  return (
    <Alert className={`mb-4 ${
      isRefreshTokenError ? 'border-orange-200 bg-orange-50' :
      isNetworkError ? 'border-yellow-200 bg-yellow-50' :
      'border-red-200 bg-red-50'
    }`}>
      <AlertTriangle className={`h-4 w-4 ${
        isRefreshTokenError ? 'text-orange-600' :
        isNetworkError ? 'text-yellow-600' :
        'text-red-600'
      }`} />
      
      <AlertTitle className={
        isRefreshTokenError ? 'text-orange-800' :
        isNetworkError ? 'text-yellow-800' :
        'text-red-800'
      }>
        {isRefreshTokenError ? 'Sessão Expirada' :
         isNetworkError ? 'Erro de Conexão' :
         'Erro de Autenticação'}
      </AlertTitle>
      
      <AlertDescription className={
        isRefreshTokenError ? 'text-orange-700' :
        isNetworkError ? 'text-yellow-700' :
        'text-red-700'
      }>
        {currentError}
      </AlertDescription>

      <div className="flex gap-2 mt-3">
        {isRefreshTokenError ? (
          <>
            <Button 
              size="sm" 
              variant="outline" 
              onClick={handleLogin}
              className="border-orange-300 text-orange-700 hover:bg-orange-100"
            >
              <LogIn className="h-3 w-3 mr-2" />
              Fazer Login
            </Button>
          </>
        ) : isNetworkError ? (
          <>
            <Button 
              size="sm" 
              variant="outline" 
              onClick={handleRetry}
              className="border-yellow-300 text-yellow-700 hover:bg-yellow-100"
            >
              <RefreshCw className="h-3 w-3 mr-2" />
              Tentar Novamente
            </Button>
          </>
        ) : (
          <>
            <Button 
              size="sm" 
              variant="outline" 
              onClick={handleRetry}
              className="border-red-300 text-red-700 hover:bg-red-100"
            >
              <RefreshCw className="h-3 w-3 mr-2" />
              Tentar Novamente
            </Button>
          </>
        )}
        
        <Button 
          size="sm" 
          variant="ghost" 
          onClick={handleDismiss}
          className="text-gray-600 hover:text-gray-800"
        >
          Fechar
        </Button>
      </div>
    </Alert>
  );
};

export default AuthErrorHandler;

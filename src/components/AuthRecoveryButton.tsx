/**
 * Componente para recuperação de problemas de autenticação
 * 
 * Este componente fornece uma interface para usuários resolverem
 * problemas de tokens inválidos e sessões corrompidas.
 */

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { AlertTriangle, RefreshCw, Trash2, CheckCircle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { forceSignOut, clearAuthStorage, debugAuthState } from '@/utils/auth-recovery';

interface AuthRecoveryButtonProps {
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  className?: string;
}

export const AuthRecoveryButton: React.FC<AuthRecoveryButtonProps> = ({
  variant = 'outline',
  size = 'default',
  className = ''
}) => {
  const [isRecovering, setIsRecovering] = useState(false);
  const [recoveryStatus, setRecoveryStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const { forceClearInvalidTokens, authError } = useAuth();

  const handleRecovery = async () => {
    setIsRecovering(true);
    setRecoveryStatus('idle');

    try {
      console.log('🔧 Starting auth recovery process...');
      
      // Limpar storage
      clearAuthStorage();
      
      // Usar função do contexto para limpar tokens
      await forceClearInvalidTokens();
      
      // Forçar logout completo
      await forceSignOut();
      
      setRecoveryStatus('success');
      console.log('✅ Auth recovery completed successfully');
      
      // Recarregar página após um breve delay
      setTimeout(() => {
        window.location.reload();
      }, 1500);
      
    } catch (error) {
      console.error('❌ Error during auth recovery:', error);
      setRecoveryStatus('error');
    } finally {
      setIsRecovering(false);
    }
  };

  const handleDebugAuth = async () => {
    console.log('🔍 Running auth debug...');
    await debugAuthState();
  };

  // Mostrar botão apenas se houver erro de autenticação
  if (!authError || !authError.includes('Refresh Token')) {
    return null;
  }

  return (
    <div className="flex flex-col gap-2 p-4 border border-orange-200 bg-orange-50 rounded-lg">
      <div className="flex items-center gap-2 text-orange-800">
        <AlertTriangle className="h-4 w-4" />
        <span className="text-sm font-medium">Problema de Autenticação Detectado</span>
      </div>
      
      <p className="text-sm text-orange-700">
        Sua sessão expirou ou há tokens inválidos. Clique no botão abaixo para corrigir automaticamente.
      </p>
      
      <div className="flex gap-2 mt-2">
        <Button
          variant={variant}
          size={size}
          className={className}
          onClick={handleRecovery}
          disabled={isRecovering}
        >
          {isRecovering ? (
            <>
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              Corrigindo...
            </>
          ) : recoveryStatus === 'success' ? (
            <>
              <CheckCircle className="h-4 w-4 mr-2 text-green-600" />
              Corrigido!
            </>
          ) : (
            <>
              <Trash2 className="h-4 w-4 mr-2" />
              Corrigir Autenticação
            </>
          )}
        </Button>
        
        {import.meta.env.DEV && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleDebugAuth}
            className="text-xs"
          >
            Debug
          </Button>
        )}
      </div>
      
      {recoveryStatus === 'success' && (
        <div className="text-sm text-green-700 mt-2">
          ✅ Autenticação corrigida! A página será recarregada automaticamente.
        </div>
      )}
      
      {recoveryStatus === 'error' && (
        <div className="text-sm text-red-700 mt-2">
          ❌ Erro na correção. Tente recarregar a página manualmente (F5).
        </div>
      )}
    </div>
  );
};

export default AuthRecoveryButton;
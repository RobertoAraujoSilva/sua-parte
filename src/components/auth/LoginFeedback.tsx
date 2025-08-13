/**
 * LoginFeedback Component
 * 
 * Componente para mostrar feedback visual durante o processo de login,
 * incluindo estados de loading, erros e mensagens informativas.
 */


import { AlertCircle, AlertTriangle, Info, Loader2, CheckCircle } from 'lucide-react';

interface LoginFeedbackProps {
  loading?: boolean;
  error?: string | null;
  errorType?: 'error' | 'warning' | 'info' | null;
  success?: string | null;
  className?: string;
}

export function LoginFeedback({ 
  loading = false, 
  error = null, 
  errorType = null, 
  success = null,
  className = "" 
}: LoginFeedbackProps) {
  
  // Estado de loading
  if (loading) {
    return (
      <div className={`flex items-center gap-2 text-blue-600 text-sm p-3 bg-blue-50 border border-blue-200 rounded-lg ${className}`}>
        <Loader2 className="h-4 w-4 animate-spin" />
        <span>Verificando credenciais...</span>
      </div>
    );
  }

  // Estado de sucesso
  if (success) {
    return (
      <div className={`flex items-center gap-2 text-green-600 text-sm p-3 bg-green-50 border border-green-200 rounded-lg ${className}`}>
        <CheckCircle className="h-4 w-4" />
        <span>{success}</span>
      </div>
    );
  }

  // Estado de erro
  if (error && errorType) {
    const configs = {
      error: {
        icon: <AlertCircle className="h-4 w-4" />,
        className: 'text-red-600 bg-red-50 border-red-200'
      },
      warning: {
        icon: <AlertTriangle className="h-4 w-4" />,
        className: 'text-yellow-600 bg-yellow-50 border-yellow-200'
      },
      info: {
        icon: <Info className="h-4 w-4" />,
        className: 'text-blue-600 bg-blue-50 border-blue-200'
      }
    };

    const config = configs[errorType];

    return (
      <div className={`flex items-start gap-2 p-3 rounded-lg border text-sm ${config.className} ${className}`}>
        <div className="flex-shrink-0 mt-0.5">
          {config.icon}
        </div>
        <div className="flex-1">
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return null;
}

// Componente específico para credenciais de teste
interface TestCredentialsProps {
  onFillCredentials: (type: 'instructor' | 'student' | 'simple') => void;
  className?: string;
}

export function TestCredentials({ onFillCredentials, className = "" }: TestCredentialsProps) {
  // Só mostrar em desenvolvimento
  if (import.meta.env.PROD) return null;

  return (
    <div className={`mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg ${className}`}>
      <div className="flex items-center gap-2 mb-3">
        <Info className="h-4 w-4 text-yellow-600" />
        <p className="text-sm text-yellow-800 font-medium">
          🧪 Ambiente de Desenvolvimento - Credenciais de Teste
        </p>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
        <button
          type="button"
          onClick={() => onFillCredentials('instructor')}
          className="px-3 py-2 text-xs bg-white border border-yellow-300 rounded hover:bg-yellow-50 transition-colors"
        >
          👨‍🏫 Instrutor
          <div className="text-xs text-gray-500 mt-1">frankwebber33@hotmail.com</div>
        </button>
        
        <button
          type="button"
          onClick={() => onFillCredentials('student')}
          className="px-3 py-2 text-xs bg-white border border-yellow-300 rounded hover:bg-yellow-50 transition-colors"
        >
          👨‍🎓 Estudante
          <div className="text-xs text-gray-500 mt-1">franklinmarceloferreiradelima@gmail.com</div>
        </button>
        
        <button
          type="button"
          onClick={() => onFillCredentials('simple')}
          className="px-3 py-2 text-xs bg-white border border-yellow-300 rounded hover:bg-yellow-50 transition-colors"
        >
          🧪 Teste Simples
          <div className="text-xs text-gray-500 mt-1">teste@sistema.com</div>
        </button>
      </div>
      
      <p className="text-xs text-yellow-700 mt-2">
        Clique em um dos botões acima para preencher automaticamente as credenciais de teste.
      </p>
    </div>
  );
}

export default LoginFeedback;
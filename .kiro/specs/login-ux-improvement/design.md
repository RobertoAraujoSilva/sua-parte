# Design Document - Melhoria da UX da Tela de Login

## Overview

Este documento descreve a solução para melhorar a experiência do usuário na tela de login, incluindo mensagens de erro claras, indicadores visuais e funcionalidades de desenvolvimento.

## Architecture

### Componentes Afetados

1. **AuthContext.tsx** - Melhorar tratamento de erros
2. **Auth.tsx** - Adicionar mensagens visuais e credenciais de teste
3. **Componentes de UI** - Toast/Alert para feedback
4. **Utilitários** - Funções de validação e formatação de erros

## Components and Interfaces

### 1. Melhoria do AuthContext

```typescript
// Função melhorada para tratamento de erros
const handleAuthError = (error: any): { message: string; type: 'error' | 'warning' | 'info' } => {
  if (!error) return { message: 'Erro desconhecido', type: 'error' };
  
  const message = error.message || error.toString();
  
  if (message.includes('Invalid login credentials')) {
    return { 
      message: 'Email ou senha incorretos. Verifique suas credenciais e tente novamente.', 
      type: 'error' 
    };
  }
  
  if (message.includes('Email not confirmed')) {
    return { 
      message: 'Email não confirmado. Verifique sua caixa de entrada e clique no link de confirmação.', 
      type: 'warning' 
    };
  }
  
  if (message.includes('Too many requests')) {
    return { 
      message: 'Muitas tentativas de login. Aguarde alguns minutos antes de tentar novamente.', 
      type: 'warning' 
    };
  }
  
  if (message.includes('User not found')) {
    return { 
      message: 'Usuário não encontrado. Entre em contato com o administrador para criar sua conta.', 
      type: 'info' 
    };
  }
  
  if (message.includes('Invalid email')) {
    return { 
      message: 'Email em formato inválido. Verifique se digitou corretamente.', 
      type: 'error' 
    };
  }
  
  return { 
    message: 'Erro de conexão. Verifique sua internet e tente novamente.', 
    type: 'error' 
  };
};
```

### 2. Componente de Login Melhorado

```typescript
interface LoginState {
  email: string;
  password: string;
  loading: boolean;
  error: string | null;
  errorType: 'error' | 'warning' | 'info' | null;
}

const LoginForm = () => {
  const [state, setState] = useState<LoginState>({
    email: '',
    password: '',
    loading: false,
    error: null,
    errorType: null
  });

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    // Validação básica
    if (!state.email || !state.password) {
      setState(prev => ({
        ...prev,
        error: 'Por favor, preencha todos os campos.',
        errorType: 'error'
      }));
      return;
    }

    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      await signIn(state.email, state.password);
    } catch (error) {
      const { message, type } = handleAuthError(error);
      setState(prev => ({
        ...prev,
        loading: false,
        error: message,
        errorType: type
      }));
    }
  };
};
```

### 3. Credenciais de Teste para Desenvolvimento

```typescript
const TestCredentials = () => {
  if (import.meta.env.PROD) return null;

  const fillTestCredentials = (type: 'instructor' | 'student') => {
    const credentials = {
      instructor: {
        email: 'frankwebber33@hotmail.com',
        password: 'senha123'
      },
      student: {
        email: 'franklinmarceloferreiradelima@gmail.com',
        password: 'senha123'
      }
    };

    setState(prev => ({
      ...prev,
      email: credentials[type].email,
      password: credentials[type].password
    }));
  };

  return (
    <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
      <p className="text-sm text-yellow-800 mb-2">
        🧪 Ambiente de Desenvolvimento - Credenciais de Teste:
      </p>
      <div className="flex gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => fillTestCredentials('instructor')}
        >
          Instrutor
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => fillTestCredentials('student')}
        >
          Estudante
        </Button>
      </div>
    </div>
  );
};
```

### 4. Componente de Feedback Visual

```typescript
const LoginFeedback = ({ error, errorType, loading }: {
  error: string | null;
  errorType: 'error' | 'warning' | 'info' | null;
  loading: boolean;
}) => {
  if (loading) {
    return (
      <div className="flex items-center gap-2 text-blue-600 text-sm">
        <Loader2 className="h-4 w-4 animate-spin" />
        Verificando credenciais...
      </div>
    );
  }

  if (error) {
    const icons = {
      error: <AlertCircle className="h-4 w-4" />,
      warning: <AlertTriangle className="h-4 w-4" />,
      info: <Info className="h-4 w-4" />
    };

    const colors = {
      error: 'text-red-600 bg-red-50 border-red-200',
      warning: 'text-yellow-600 bg-yellow-50 border-yellow-200',
      info: 'text-blue-600 bg-blue-50 border-blue-200'
    };

    return (
      <div className={`flex items-center gap-2 p-3 rounded-lg border text-sm ${colors[errorType!]}`}>
        {icons[errorType!]}
        {error}
      </div>
    );
  }

  return null;
};
```

## Data Models

### Estados de Erro Mapeados

```typescript
interface AuthErrorMap {
  'Invalid login credentials': {
    message: string;
    type: 'error';
    action?: string;
  };
  'Email not confirmed': {
    message: string;
    type: 'warning';
    action: 'check_email';
  };
  'Too many requests': {
    message: string;
    type: 'warning';
    action: 'wait';
  };
  'User not found': {
    message: string;
    type: 'info';
    action: 'contact_admin';
  };
}
```

## Error Handling

### 1. Validação de Entrada

```typescript
const validateLoginForm = (email: string, password: string) => {
  const errors: string[] = [];

  if (!email) errors.push('Email é obrigatório');
  if (!password) errors.push('Senha é obrigatória');
  
  if (email && !isValidEmail(email)) {
    errors.push('Email em formato inválido');
  }
  
  if (password && password.length < 6) {
    errors.push('Senha deve ter pelo menos 6 caracteres');
  }

  return errors;
};
```

### 2. Logging de Erros

```typescript
const logAuthError = (error: any, context: string) => {
  if (import.meta.env.DEV) {
    console.group(`🔐 Auth Error - ${context}`);
    console.error('Error:', error);
    console.log('Timestamp:', new Date().toISOString());
    console.log('User Agent:', navigator.userAgent);
    console.groupEnd();
  }
  
  // Em produção, enviar para serviço de logging
  if (import.meta.env.PROD) {
    // sendToLoggingService(error, context);
  }
};
```

## Testing Strategy

### 1. Testes de Validação

- Testar validação de email inválido
- Testar campos vazios
- Testar senha muito curta

### 2. Testes de Erro

- Simular credenciais inválidas
- Simular erro de rede
- Testar rate limiting

### 3. Testes de UX

- Verificar indicadores de loading
- Testar credenciais de desenvolvimento
- Validar mensagens de erro

## Implementation Plan

### Fase 1: Correção Imediata das Credenciais
1. Verificar se o reset de senha funcionou
2. Criar usuários de teste alternativos se necessário
3. Testar login com credenciais conhecidas

### Fase 2: Melhoria das Mensagens
1. Implementar tratamento de erros melhorado
2. Adicionar componente de feedback visual
3. Implementar validação de formulário

### Fase 3: Funcionalidades de Desenvolvimento
1. Adicionar botões de credenciais de teste
2. Implementar logging de debug
3. Adicionar indicadores de ambiente

## Security Considerations

1. **Credenciais de Teste**
   - Mostrar apenas em desenvolvimento
   - Não expor em produção
   - Usar variáveis de ambiente

2. **Logging**
   - Não logar senhas
   - Sanitizar dados sensíveis
   - Usar níveis de log apropriados

3. **Validação**
   - Validar no frontend e backend
   - Sanitizar entradas
   - Implementar rate limiting
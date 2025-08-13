# Design Document - Correção de Autenticação

## Overview

Este documento descreve a solução para corrigir os problemas de autenticação no Sistema Ministerial, incluindo padronização de variáveis de ambiente, verificação de credenciais e criação de usuários de teste válidos.

## Architecture

### Componentes Afetados

1. **Configuração de Variáveis de Ambiente**
   - Todas as páginas devem usar `import.meta.env.VITE_*`
   - Padronização em todo o projeto

2. **Sistema de Autenticação**
   - Verificação de credenciais existentes
   - Criação de novos usuários de teste se necessário
   - Validação de configuração do Supabase

3. **Páginas do Sistema**
   - `/programas` - já corrigida
   - `/estudantes` - verificar se existe e corrigir
   - Outras páginas que usam Supabase

## Components and Interfaces

### 1. Configuração Padrão do Supabase

```typescript
// src/lib/supabase.ts
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
```

### 2. Verificação de Credenciais

```typescript
// Função para verificar se as credenciais de teste funcionam
const testCredentials = async (email: string, password: string) => {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    return { success: !error, data, error };
  } catch (error) {
    return { success: false, error };
  }
};
```

### 3. Criação de Usuários de Teste

Se as credenciais atuais não funcionarem, criar novos usuários:

```sql
-- Criar usuário instrutor de teste
INSERT INTO auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  raw_user_meta_data,
  created_at,
  updated_at
) VALUES (
  '00000000-0000-0000-0000-000000000000',
  gen_random_uuid(),
  'authenticated',
  'authenticated',
  'instrutor.teste@sistema.com',
  crypt('senha123', gen_salt('bf')),
  NOW(),
  '{"role": "instrutor", "nome_completo": "Instrutor Teste", "congregacao": "Congregação Teste"}',
  NOW(),
  NOW()
);
```

## Data Models

### Usuários de Teste Necessários

1. **Instrutor**
   - Email: `instrutor.teste@sistema.com`
   - Senha: `senha123`
   - Role: `instrutor`
   - Cargo: `anciao`

2. **Estudante**
   - Email: `estudante.teste@sistema.com`
   - Senha: `senha123`
   - Role: `estudante`
   - Cargo: `publicador`

## Error Handling

### 1. Validação de Variáveis de Ambiente

```typescript
const validateEnvironment = () => {
  const required = ['VITE_SUPABASE_URL', 'VITE_SUPABASE_ANON_KEY'];
  const missing = required.filter(key => !import.meta.env[key]);
  
  if (missing.length > 0) {
    throw new Error(`Missing environment variables: ${missing.join(', ')}`);
  }
};
```

### 2. Tratamento de Erros de Autenticação

```typescript
const handleAuthError = (error: any) => {
  if (error.message.includes('Invalid login credentials')) {
    return 'Credenciais inválidas. Verifique email e senha.';
  }
  if (error.message.includes('Email not confirmed')) {
    return 'Email não confirmado. Verifique sua caixa de entrada.';
  }
  return 'Erro de autenticação. Tente novamente.';
};
```

## Testing Strategy

### 1. Testes de Configuração

- Verificar se todas as variáveis de ambiente estão definidas
- Testar conexão com Supabase
- Validar configuração em diferentes ambientes

### 2. Testes de Autenticação

- Testar login com credenciais válidas
- Testar login com credenciais inválidas
- Testar fluxo de logout
- Verificar persistência de sessão

### 3. Testes de Integração

- Testar acesso às páginas protegidas
- Verificar redirecionamentos
- Testar diferentes roles de usuário

## Implementation Plan

### Fase 1: Correção Imediata
1. Corrigir variáveis de ambiente na página `/programas` ✅
2. Verificar e corrigir outras páginas
3. Testar credenciais existentes

### Fase 2: Padronização
1. Criar arquivo central de configuração do Supabase
2. Atualizar todas as páginas para usar configuração central
3. Adicionar validação de ambiente

### Fase 3: Usuários de Teste
1. Criar novos usuários de teste se necessário
2. Atualizar documentação com credenciais corretas
3. Implementar testes automatizados

## Security Considerations

1. **Credenciais de Teste**
   - Usar apenas em ambiente de desenvolvimento
   - Não expor em produção
   - Rotacionar periodicamente

2. **Variáveis de Ambiente**
   - Validar antes de usar
   - Não logar valores sensíveis
   - Usar fallbacks seguros

3. **Tratamento de Erros**
   - Não expor informações sensíveis
   - Logar erros para debugging
   - Mostrar mensagens amigáveis ao usuário
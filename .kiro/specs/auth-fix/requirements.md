# Requirements Document - Correção de Autenticação

## Introduction

Este documento define os requisitos para corrigir os problemas de autenticação no Sistema Ministerial, incluindo a padronização das variáveis de ambiente e verificação das credenciais de teste.

## Requirements

### Requirement 1

**User Story:** Como desenvolvedor, eu quero que as variáveis de ambiente sejam consistentes em todo o projeto, para que não haja erros de configuração entre diferentes páginas.

#### Acceptance Criteria

1. WHEN o sistema carrega qualquer página THEN todas as variáveis de ambiente devem usar o mesmo prefixo (VITE_)
2. WHEN uma nova página é criada THEN ela deve usar import.meta.env ao invés de process.env
3. IF uma página usa variáveis de ambiente THEN ela deve ter fallbacks apropriados para desenvolvimento

### Requirement 2

**User Story:** Como usuário do sistema, eu quero conseguir fazer login com as credenciais de teste, para que eu possa acessar o sistema durante o desenvolvimento.

#### Acceptance Criteria

1. WHEN eu uso as credenciais do instrutor THEN o sistema deve autenticar com sucesso
2. WHEN eu uso as credenciais do estudante THEN o sistema deve autenticar com sucesso
3. IF as credenciais estão incorretas THEN o sistema deve mostrar uma mensagem de erro clara

### Requirement 3

**User Story:** Como desenvolvedor, eu quero verificar se as credenciais de teste estão válidas no Supabase, para que eu possa identificar se o problema é de configuração ou de dados.

#### Acceptance Criteria

1. WHEN eu verifico as credenciais no banco THEN devo conseguir confirmar se os usuários existem
2. WHEN eu testo a autenticação via MCP THEN devo conseguir validar as credenciais
3. IF as credenciais não existem THEN devo criar novos usuários de teste

### Requirement 4

**User Story:** Como desenvolvedor, eu quero que todas as páginas do sistema tenham configuração consistente do Supabase, para que não haja erros de conexão.

#### Acceptance Criteria

1. WHEN qualquer página acessa o Supabase THEN ela deve usar a mesma configuração
2. WHEN o sistema inicializa THEN deve validar se as variáveis de ambiente estão corretas
3. IF há erro de configuração THEN o sistema deve mostrar uma mensagem de debug clara
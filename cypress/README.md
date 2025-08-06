# Testes E2E - Sistema Ministerial

## 📋 Visão Geral

Este diretório contém testes end-to-end (E2E) usando Cypress para o Sistema Ministerial, com foco especial no teste do login do estudante Franklin e navegação no portal.

## 🎯 Testes Implementados

### 1. **franklin-login.cy.ts** - Teste Principal do Login
- ✅ Login com sucesso e redirecionamento para portal
- ✅ Persistência de sessão após refresh
- ✅ Tratamento de credenciais inválidas
- ✅ Funcionalidade de logout

### 2. **student-portal-navigation.cy.ts** - Navegação no Portal
- ✅ Exibição de informações pessoais
- ✅ Seções da Escola do Ministério
- ✅ Responsividade em diferentes telas
- ✅ Verificação de erros de console

### 3. **url-configuration.cy.ts** - Configuração de URLs
- ✅ Redirecionamentos de segurança
- ✅ Proteção de rotas
- ✅ Navegação entre páginas
- ✅ Tratamento de URLs inválidas

## 🚀 Como Executar

### Pré-requisitos
```bash
# Instalar dependências
npm install
```

### Executar Testes

#### Modo Interativo (Recomendado para desenvolvimento)
```bash
# Abrir Cypress Test Runner
npm run cypress:open

# Ou especificamente para testes E2E
npm run test:e2e:open
```

#### Modo Headless (Para CI/CD)
```bash
# Executar todos os testes
npm run cypress:run

# Ou
npm run test:e2e

# Executar apenas teste do Franklin
npm run test:franklin
```

### Executar Teste Específico
```bash
# Apenas login do Franklin
npx cypress run --spec "cypress/e2e/franklin-login.cy.ts"

# Apenas navegação no portal
npx cypress run --spec "cypress/e2e/student-portal-navigation.cy.ts"

# Apenas configuração de URLs
npx cypress run --spec "cypress/e2e/url-configuration.cy.ts"
```

## 🔧 Configuração

### Variáveis de Ambiente
As credenciais e URLs estão configuradas em `cypress.config.ts`:

```typescript
env: {
  FRANKLIN_EMAIL: 'franklinmarceloferreiradelima@gmail.com',
  FRANKLIN_PASSWORD: '13a21r15',
  FRANKLIN_USER_ID: '77c99e53-500b-4140-b7fc-a69f96b216e1',
  FRANKLIN_PORTAL_URL: '/estudante/77c99e53-500b-4140-b7fc-a69f96b216e1'
}
```

### URLs de Teste
- **Produção**: `https://sua-parte.lovable.app`
- **Local**: `http://localhost:5173`

## 🛠️ Comandos Customizados

### `cy.loginAsFranklin()`
Faz login automaticamente com as credenciais do Franklin.

```typescript
cy.loginAsFranklin()
cy.url().should('include', '/estudante/77c99e53-500b-4140-b7fc-a69f96b216e1')
```

### `cy.waitForPageLoad()`
Aguarda o carregamento completo da página.

```typescript
cy.visit('/auth')
cy.waitForPageLoad()
```

### `cy.shouldBeOnPage(path)`
Verifica se está na página correta.

```typescript
cy.shouldBeOnPage('/auth')
```

### `cy.waitForElement(selector)`
Aguarda elemento aparecer e estar visível.

```typescript
cy.waitForElement('[data-testid="welcome-message"]')
```

## 📊 Relatórios

### Vídeos e Screenshots
- **Vídeos**: Salvos em `cypress/videos/`
- **Screenshots**: Salvos em `cypress/screenshots/` (apenas em falhas)

### Logs Detalhados
Os testes incluem logs detalhados para facilitar debugging:

```
🎯 Teste: Login do Franklin e redirecionamento para portal do estudante
📍 Passo 1: Navegando para página de login
📝 Passo 2: Preenchendo credenciais do Franklin
🚀 Passo 3: Submetendo formulário de login
⏳ Passo 4: Aguardando resposta da autenticação
✅ Autenticação bem-sucedida
🔄 Passo 5: Verificando redirecionamento para portal do estudante
📋 Passo 6: Verificando carregamento do portal do estudante
👤 Passo 7: Verificando dados do usuário
🎉 Teste concluído com sucesso!
```

## 🐛 Debugging

### Modo Debug
Para pausar execução e inspecionar:

```typescript
cy.debug() // Pausa execução
```

### Interceptações de Rede
Os testes monitoram requests importantes:

```typescript
cy.intercept('POST', '**/auth/v1/token**').as('authLogin')
cy.intercept('GET', '**/rest/v1/user_profiles**').as('getUserProfile')
```

### Verificação de Console
Erros de console são capturados e reportados automaticamente.

## 📋 Checklist de Testes

### ✅ Funcionalidades Testadas
- [x] Login com credenciais válidas
- [x] Redirecionamento para portal correto
- [x] Exibição de dados do usuário
- [x] Persistência de sessão
- [x] Tratamento de erros
- [x] Responsividade
- [x] Proteção de rotas
- [x] Navegação entre páginas

### 🔄 Cenários de Teste
- [x] **Happy Path**: Login → Portal → Navegação
- [x] **Error Path**: Credenciais inválidas
- [x] **Security Path**: Proteção de rotas
- [x] **Performance Path**: Carregamento e responsividade

## 🚨 Troubleshooting

### Problemas Comuns

#### Teste falha no login
```bash
# Verificar se credenciais estão corretas
# Verificar se aplicação está rodando
# Verificar conectividade de rede
```

#### Timeout em redirecionamento
```bash
# Aumentar timeout em cypress.config.ts
# Verificar logs de console para erros
# Verificar se routing fixes estão aplicados
```

#### Elementos não encontrados
```bash
# Verificar se seletores estão corretos
# Aguardar carregamento com cy.waitForElement()
# Verificar se componente está renderizando
```

## 📞 Suporte

Para problemas com os testes:

1. **Verificar logs**: Console do Cypress e browser
2. **Verificar vídeos**: `cypress/videos/` para ver execução
3. **Verificar screenshots**: `cypress/screenshots/` para falhas
4. **Executar em modo interativo**: `npm run cypress:open`

## 🎯 Próximos Passos

- [ ] Testes para outros tipos de usuário (instrutor)
- [ ] Testes de funcionalidades específicas do portal
- [ ] Testes de performance
- [ ] Integração com CI/CD
- [ ] Testes de acessibilidade

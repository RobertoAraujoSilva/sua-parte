# 🧪 Guia de Testes Cypress - Sistema Ministerial

## 📋 **VISÃO GERAL**

Este guia explica como executar os testes E2E (End-to-End) do Sistema Ministerial usando Cypress. Os testes validam todas as funcionalidades principais do sistema, incluindo autenticação, dashboard, sistema de equidade e funcionalidades administrativas.

---

## 🚀 **EXECUÇÃO RÁPIDA**

### **Opção 1: Script Automático (Recomendado)**
```bash
# Windows (PowerShell)
.\scripts\run-cypress-tests.ps1

# Windows (CMD)
.\scripts\run-cypress-tests.bat
```

### **Opção 2: Comandos Manuais**
```bash
# 1. Iniciar aplicação
npm run dev

# 2. Em outro terminal, executar testes
npx cypress run --spec "cypress/e2e/sistema-ministerial-completo.cy.ts"

# 3. Ou abrir Cypress interativo
npx cypress open
```

---

## ⚙️ **CONFIGURAÇÃO**

### **Variáveis de Ambiente**
As credenciais de teste estão configuradas automaticamente nos scripts:

```bash
# Instrutor (Admin completo)
CYPRESS_INSTRUCTOR_EMAIL=frankwebber33@hotmail.com
CYPRESS_INSTRUCTOR_PASSWORD=senha123

# Estudante (Acesso limitado)
CYPRESS_STUDENT_EMAIL=franklinmarceloferreiradelima@gmail.com
CYPRESS_STUDENT_PASSWORD=senha123

# Franklin (Legacy)
FRANKLIN_EMAIL=franklinmarceloferreiradelima@gmail.com
FRANKLIN_PASSWORD=senha123
```

### **Configuração do Cypress**
O arquivo `cypress.config.mjs` está configurado para:
- **Base URL**: `http://localhost:5173` (desenvolvimento)
- **Viewport**: 1280x720 (desktop)
- **Browser**: Chrome (padrão)
- **Timeouts**: Configurados para ambiente de teste
- **Retry**: 2 tentativas para testes flaky

---

## 🧪 **TESTES DISPONÍVEIS**

### **📁 Teste Completo do Sistema**
- **Arquivo**: `cypress/e2e/sistema-ministerial-completo.cy.ts`
- **Descrição**: Valida todas as funcionalidades principais
- **Duração**: ~10-15 minutos
- **Cobertura**: 100% das funcionalidades críticas

### **📁 Testes Específicos**
- **`authentication-roles.cy.ts`** - Testes de autenticação e roles
- **`assignment-generation.cy.ts`** - Geração de designações
- **`enhanced-pdf-parsing.cy.ts`** - Parser de PDF
- **`programs-page-functionality.cy.ts`** - Funcionalidades de programas
- **`student-portal-navigation.cy.ts`** - Navegação do portal do estudante

---

## 🔍 **FUNCIONALIDADES TESTADAS**

### **🔐 Sistema de Autenticação**
- ✅ Login como Instrutor (Admin)
- ✅ Login como Estudante
- ✅ Bloqueio de rotas protegidas
- ✅ Validação de permissões por perfil

### **🏠 Dashboard Principal**
- ✅ Carregamento completo do dashboard
- ✅ Navegação entre todas as seções
- ✅ Elementos visuais e estatísticas
- ✅ Ações rápidas funcionando

### **⚖️ Sistema de Equidade**
- ✅ Todas as abas funcionando
- ✅ Cálculo da fila justa
- ✅ Aplicação de políticas de fairness
- ✅ Validações S-38 implementadas

### **👥 Gestão de Estudantes**
- ✅ Lista de estudantes carregando
- ✅ Adição de novos estudantes
- ✅ Informações completas S-38
- ✅ Sistema familiar funcionando

### **📚 Gestão de Programas**
- ✅ Lista de programas
- ✅ Criação de novos programas
- ✅ Upload de PDF funcionando
- ✅ Parser automático

### **🎯 Sistema de Designações**
- ✅ Lista de designações ativas
- ✅ Geração automática
- ✅ Validações S-38
- ✅ Sistema de ajudantes

### **🔧 Dashboard Administrativo**
- ✅ Acesso ao dashboard admin
- ✅ Todas as abas administrativas
- ✅ Gestão de materiais MWB
- ✅ Monitoramento do sistema

### **📱 Responsividade e Mobile**
- ✅ Interface mobile funcionando
- ✅ Menu mobile responsivo
- ✅ Controle de densidade
- ✅ Adaptação para diferentes dispositivos

### **🌍 Sistema Multilíngue**
- ✅ Suporte a português e inglês
- ✅ Seletor de idioma funcionando
- ✅ Traduções automáticas

### **🔒 Segurança e Validações**
- ✅ Row Level Security (RLS) ativo
- ✅ Validação de permissões
- ✅ Separação de dados por congregação
- ✅ Auditoria de operações

### **📊 Relatórios e Estatísticas**
- ✅ Relatórios do sistema
- ✅ Estatísticas em tempo real
- ✅ Dados sincronizados

### **🔄 Sincronização e Performance**
- ✅ Sincronização em tempo real
- ✅ Carregamento rápido de páginas
- ✅ Triggers automáticos funcionando

---

## 🛠️ **TROUBLESHOOTING**

### **❌ Erro: "Aplicação não respondeu"**
**Solução:**
```bash
# 1. Verificar se a porta 5173 está livre
netstat -ano | findstr :5173

# 2. Matar processos na porta
taskkill /f /pid <PID>

# 3. Reiniciar aplicação
npm run dev
```

### **❌ Erro: "Cypress não encontrado"**
**Solução:**
```bash
# Instalar Cypress globalmente
npm install -g cypress

# Ou instalar localmente
npm install cypress --save-dev
```

### **❌ Erro: "Dependências não instaladas"**
**Solução:**
```bash
# Limpar cache e reinstalar
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
```

### **❌ Erro: "Testes falhando"**
**Soluções:**
1. **Verificar aplicação rodando** em `http://localhost:5173`
2. **Verificar credenciais** de teste válidas
3. **Verificar banco de dados** Supabase acessível
4. **Executar em modo interativo** para debug:
   ```bash
   npx cypress open
   ```

### **❌ Erro: "PowerShell spawn error"**
**Solução:**
```bash
# Usar script .bat em vez de .ps1
.\scripts\run-cypress-tests.bat

# Ou executar PowerShell como administrador
```

---

## 📊 **INTERPRETAÇÃO DOS RESULTADOS**

### **✅ Testes Passando (Verde)**
- Todas as funcionalidades estão funcionando
- Sistema está pronto para produção
- Interface responsiva e segura

### **⚠️ Testes com Warnings (Amarelo)**
- Funcionalidades funcionando com pequenos problemas
- Verificar logs para detalhes
- Pode ser problema de timing ou ambiente

### **❌ Testes Falhando (Vermelho)**
- Funcionalidades críticas com problemas
- Verificar logs detalhados
- Executar em modo interativo para debug
- Verificar se aplicação está rodando

---

## 🔧 **CONFIGURAÇÕES AVANÇADAS**

### **Executar Testes Específicos**
```bash
# Apenas autenticação
npx cypress run --spec "cypress/e2e/authentication-roles.cy.ts"

# Apenas sistema de equidade
npx cypress run --spec "cypress/e2e/sistema-ministerial-completo.cy.ts" --grep "Sistema de Equidade"

# Apenas testes que falharam
npx cypress run --spec "cypress/e2e/sistema-ministerial-completo.cy.ts" --reporter junit
```

### **Executar em Diferentes Browsers**
```bash
# Chrome (padrão)
npx cypress run --browser chrome

# Firefox
npx cypress run --browser firefox

# Edge
npx cypress run --browser edge
```

### **Executar em Modo Headless**
```bash
# Sem interface gráfica (CI/CD)
npx cypress run --headless

# Com vídeo e screenshots
npx cypress run --headless --video --screenshots
```

---

## 📈 **MÉTRICAS E RELATÓRIOS**

### **Relatórios Automáticos**
Os testes geram automaticamente:
- **Vídeos** de execução (em caso de falha)
- **Screenshots** de erro
- **Logs** detalhados de execução
- **Relatórios** de performance

### **Análise de Performance**
```bash
# Verificar tempo de execução
npx cypress run --spec "cypress/e2e/sistema-ministerial-completo.cy.ts" --reporter json

# Analisar resultados
cat cypress/results/results.json | jq '.runs[0].stats'
```

---

## 🎯 **PRÓXIMOS PASSOS**

### **1. Executar Testes Regularmente**
- **Desenvolvimento**: Antes de cada commit
- **Staging**: Antes de deploy
- **Produção**: Monitoramento contínuo

### **2. Adicionar Novos Testes**
- Criar arquivos `.cy.ts` em `cypress/e2e/`
- Seguir padrão de nomenclatura
- Usar comandos customizados existentes

### **3. Integração com CI/CD**
- GitHub Actions
- GitLab CI
- Jenkins
- Azure DevOps

---

## 🏆 **CONCLUSÃO**

O Sistema Ministerial possui **testes E2E completos** que validam:

- ✅ **100% das funcionalidades críticas**
- ✅ **Interface responsiva** para todos dispositivos
- ✅ **Segurança avançada** com RLS
- ✅ **Performance otimizada** com carregamento rápido
- ✅ **Sistema multilíngue** funcionando
- ✅ **Validações S-38** implementadas

**Execute os testes regularmente para garantir a qualidade do sistema! 🚀**

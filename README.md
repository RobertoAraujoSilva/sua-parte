# 📚 Sistema Ministerial Simplificado

## 🚀 **Status: SISTEMA REFORMULADO E SIMPLIFICADO!**

O **Sistema Ministerial** foi reformulado para ser mais simples e direto. Agora temos apenas **dois dashboards principais**: **Instrutor** (painel central) e **Estudante** (portal pessoal).

---

## 🎯 **Nova Arquitetura Simplificada**

### ✅ **O que mudou:**
- ❌ **Admin Dashboard removido** - Complexidade desnecessária eliminada
- ✅ **Dashboard do Instrutor** - Agora é o painel principal do sistema
- ✅ **Portal do Estudante** - Visualização simples das designações pessoais
- ✅ **Programação mockada** - Baseada nos PDFs oficiais (sem scraping)
- ✅ **Foco na designação** - Sistema centrado na atribuição de estudantes

### 🎯 **Fluxo Simplificado:**
1. **👨‍🏫 Instrutor** → Login → Vê programação oficial → Designa estudantes
2. **👨‍🎓 Estudante** → Login → Vê suas designações pessoais

---

## ✨ **Funcionalidades Atuais**

### 👨‍🏫 **Dashboard do Instrutor (Principal)**
- **Programação oficial** das semanas (mockada dos PDFs)
- **Lista de estudantes** locais com privilégios
- **Interface de designação** drag-and-drop
- **Salvamento no Supabase** das atribuições
- **Seletor de semanas** (setembro 2025 disponível)

### 👨‍🎓 **Portal do Estudante**
- **Visualização das designações** pessoais
- **Detalhes das partes** (referências, duração, tipo)
- **Status das designações** (pendente, confirmada, concluída)
- **Dicas de preparação** para cada tipo de atividade

### 📊 **Dados Mockados Disponíveis**
- **3 semanas de setembro 2025:**
  - 8-14 setembro: Provérbios 30
  - 15-21 setembro: Provérbios 31  
  - 22-28 setembro: Eclesiastes 1-2
- **Estrutura JSON completa** com todas as partes e referências

---

## 🚀 **Como Usar o Sistema**

### **🎯 Opção 1 - Iniciar Tudo de Uma Vez (RECOMENDADO)**
```bash
npm run dev:all
```
**Resultado:** Inicia **ambos** os servidores simultaneamente
- **Backend:** Porta 3000
- **Frontend:** Porta 8080

### **🔧 Opção 2 - Iniciar Separadamente**
```bash
# Terminal 1 - Backend
npm run dev:backend-only

# Terminal 2 - Frontend  
npm run dev:frontend-only
```

### **📱 Acessar o Admin Dashboard**
```
URL: http://localhost:8080/admin
Login: amazonwebber007@gmail.com / admin123
```

---

## 🛠️ **Correções Recentes**

### **📂 Upload de PDF para Storage**
- **Problema:** Erros 400 ao fazer upload de PDFs para o storage
- **Solução:** Implementado sistema de upload com verificação de bucket e políticas adequadas
- **Documentação:** [FIXES_DOCUMENTATION.md](FIXES_DOCUMENTATION.md#1-storage-upload--bucket-policies-)

### **🔄 Modal de Programas Duplicados**
- **Problema:** Confirmação nativa (window.confirm) pouco intuitiva
- **Solução:** Criado modal personalizado com opções "Atualizar" e "Atualizar e Gerar"
- **Documentação:** [FIXES_DOCUMENTATION.md](FIXES_DOCUMENTATION.md#2-modal-atualizar-e-gerar-)

### **🔇 Redução de Logs**
- **Problema:** Excesso de logs no console gerando ruído
- **Solução:** Implementado utilitário de logging com níveis configuráveis
- **Documentação:** [FIXES_DOCUMENTATION.md](FIXES_DOCUMENTATION.md#3-logging-reduction-)

### **🛡️ Correção de Erros 403**
- **Problema:** Erros 403 ao salvar designações devido a políticas RLS
- **Solução:** Aplicadas políticas RLS corretas para tabelas do banco de dados
- **Documentação:** [FIXES_DOCUMENTATION.md](FIXES_DOCUMENTATION.md#1-bancorls-issues-)

---

## 🏗️ **Arquitetura do Sistema**

```
sua-parte/
├── 📁 src/                          # Frontend React
│   ├── pages/AdminDashboard.tsx     # ✅ Dashboard Admin
│   ├── pages/Auth.tsx               # ✅ Sistema de Login
│   ├── pages/Programas.tsx          # ✅ Gerenciamento de Programas
│   └── contexts/AuthContext.tsx     # ✅ Contexto de Autenticação
├── 📁 backend/                      # ✅ Backend Node.js
│   ├── server.js                    # ✅ Servidor Principal
│   ├── services/jwDownloader.js     # ✅ Download JW.org
│   ├── routes/admin.js              # ✅ APIs Admin
│   └── config/mwbSources.json      # ✅ URLs JW.org
├── 📁 cypress/                      # ✅ Testes Automatizados
│   └── e2e/admin-dashboard-integration.cy.ts
├── 📁 supabase/                     # ✅ Migrações e Banco
│   └── migrations/
└── 📁 docs/Oficial/                 # ✅ Materiais Baixados
```

---

## 🔍 **Funcionalidades Detalhadas**

### **🎯 Scripts Unificados (NOVO!)**
- **`npm run dev:all`** - Inicia backend e frontend simultaneamente
- **`npm run dev:backend-only`** - Apenas o backend (porta 3000)
- **`npm run dev:frontend-only`** - Apenas o frontend (porta 8080)
- **Desenvolvimento simplificado** com um único comando

### **🔧 Scripts de Correção**
- **`npm run fix:policies-only`** - Exibe instruções para aplicar políticas
- **`npm run verify:storage`** - Verifica configuração do storage

### **✅ Admin Dashboard**
- **Visão Geral:** Estatísticas do sistema e ações rápidas
- **Downloads:** Configuração e verificação de atualizações da JW.org
- **Materiais:** Lista de materiais baixados e seus status
- **Publicação:** Sistema de publicação para congregações

---

## 🎯 **Explicação Completa dos Dashboards**

### **🏠 1. Dashboard Principal (Dashboard Geral)**
- **📍 URL:** `/dashboard` ou `/`
- **👥 Usuários:** Instrutores (não-admin)
- **🎯 Finalidade:** Visão geral da congregação, gerenciamento de estudantes, visualização de programas publicados, controle de designações e partes, estatísticas básicas de participação
- **🔧 Funcionalidades:** Lista de estudantes sob responsabilidade, programas ministeriais disponíveis, calendário de reuniões, designações pendentes e realizadas, relatórios de participação

### **👑 2. Admin Dashboard (Dashboard Administrativo)**
- **📍 URL:** `/admin`
- **👥 Usuários:** Administradores do sistema
- **🎯 Finalidade:** Controle total do sistema, gerenciamento de materiais da JW.org, administração de congregações, configuração de usuários e permissões, monitoramento do sistema

#### **🔧 Funcionalidades Detalhadas:**
- **📊 Visão Geral:** Estatísticas do sistema, status dos serviços, ações rápidas
- **📥 Downloads:** Verificar Novas Versões (scraping automático da JW.org), download de materiais (PDF, EPUB, JWPub, RTF, DAISY), configuração de URLs e idiomas, logs de download
- **📚 Materiais:** Lista de materiais baixados, status de processamento, organização por idioma e período, metadados dos arquivos
- **📢 Publicação:** Publicar materiais para congregações, controle de acesso por região, agendamento de publicações, histórico de publicações
- **🏥 Monitoramento:** Status do backend, conexão com banco de dados, logs do sistema, health checks

### **👨‍🎓 3. Dashboard do Estudante**
- **📍 URL:** `/estudante/{id}`
- **👥 Usuários:** Estudantes individuais
- **🎯 Finalidade:** Acesso limitado aos materiais publicados, visualização de programas ministeriais, histórico pessoal de participação, materiais de estudo disponíveis
- **🔧 Funcionalidades:** Materiais publicados para sua congregação, programas ministeriais disponíveis, histórico de designações, perfil pessoal básico, acesso somente leitura

### **👨‍👩‍👧‍👦 4. Portal Familiar**
- **📍 URL:** `/portal-familiar`
- **👥 Usuários:** Membros de família
- **🎯 Finalidade:** Acesso familiar aos materiais, suporte para estudo em casa, materiais complementares de estudo
- **🔧 Funcionalidades:** Materiais de estudo em família, recursos complementares, acesso limitado e controlado

### **🔐 5. Sistema de Autenticação**
- **📍 URL:** `/auth`
- **👥 Usuários:** Todos os usuários
- **🎯 Finalidade:** Login e registro de usuários, controle de acesso baseado em roles, gerenciamento de sessões
- **🔧 Funcionalidades:** Login com email/senha, registro de novos usuários, recuperação de senha, controle de sessão

---

## 🔄 **Fluxo de Funcionamento**

### **1. Administrador:**
```
Login → Admin Dashboard → Downloads → Materiais → Publicação
```

### **2. Instrutor:**
```
Login → Dashboard Principal → Gerenciar Estudantes → Ver Programas
```

### **3. Estudante:**
```
Login → Dashboard Estudante → Ver Materiais Publicados
```

---

## 📎 Atalhos Úteis

- Guia definitivo do fluxo (Admin → Instrutor → Estudante): docs/GUIA_DEFINITIVO.md
- Programas (Instrutor): /programas
- Designações (Instrutor): /designacoes
- Estudantes (Instrutor): /estudantes
- Admin Dashboard: /admin

## 🎨 **Características Visuais**

### **Admin Dashboard:**
- Interface administrativa com abas organizadas
- Cores azuis para transmitir confiança
- Loading states elegantes (implementados recentemente)
- Debug info para desenvolvimento

### **Dashboard Principal:**
- Interface limpa e focada em tarefas
- Cores neutras para uso prolongado
- Componentes reutilizáveis para consistência

### **Dashboard Estudante:**
- Interface simples e intuitiva
- Acesso limitado e controlado
- Foco em conteúdo e não em funcionalidades

---

## 🚀 **Integração com Backend**

### **Admin Dashboard:**
- APIs completas para todas as funcionalidades
- Download automático da JW.org
- Gerenciamento de arquivos e metadados
- Sistema de cron para tarefas automáticas

### **Dashboard Principal:**
- APIs de consulta para dados da congregação
- Integração com Supabase para dados em tempo real
- Sistema de notificações para atualizações

### **Dashboard Estudante:**
- APIs de leitura para materiais publicados
- Controle de acesso baseado em RLS
- Cache inteligente para performance

---

## 🎯 **Arquitetura dos Dashboards**

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Admin         │    │   Instrutor     │    │   Estudante     │
│   Dashboard     │    │   Dashboard     │    │   Dashboard     │
│                 │    │                 │    │                 │
│ • Downloads     │    │ • Estudantes    │    │ • Materiais     │
│ • Materiais     │    │ • Programas     │    │ • Programas     │
│ • Publicação    │    │ • Designações   │    │ • Histórico     │
│ • Monitoramento │    │ • Relatórios    │    │ • Perfil        │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Backend Node.js                              │
│              • APIs REST                                        │
│              • JWDownloader                                     │
│              • Supabase Integration                             │
│              • File Management                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🌟 **Benefícios do Sistema**

### **Para Administradores:**
- Controle total sobre materiais e usuários
- Automação de downloads da JW.org
- Monitoramento em tempo real

### **Para Instrutores:**
- Gerenciamento eficiente de estudantes
- Acesso rápido a materiais atualizados
- Controle de designações e programas

### **Para Estudantes:**
- Acesso organizado aos materiais
- Interface simples e intuitiva
- Materiais sempre atualizados
- **Monitoramento:** Status do sistema e logs

### **✅ Sistema de Downloads**
- **URLs configuradas** para JW.org (PT-BR e EN-US)
- **Download automático** de múltiplos formatos
- **Organização por idioma** e período
- **Verificação de atualizações** em tempo real

### **✅ Controle de Acesso**
- **Admin:** Acesso completo ao sistema
- **Instrutor:** Gerenciamento de programas e materiais
- **Estudante:** Visualização de materiais publicados

---

## 🧪 **Executar Testes**

### **Testes Cypress**
```bash
# Executar todos os testes
npm run cypress:run

# Teste específico do Admin Dashboard
npm run cypress:run --spec "cypress/e2e/admin-dashboard-integration.cy.ts"
```

### **Testes Disponíveis**
1. ✅ **Carregamento do Dashboard**
2. ✅ **Conexão com Backend**
3. ✅ **Verificação de Atualizações**
4. ✅ **Listagem de Materiais**
5. ✅ **Teste de Perfil + Backend**
6. ✅ **Monitoramento do Sistema**
7. ✅ **Debug Info**
8. ✅ **Funcionalidade Completa de Download**

---

## 🔧 **Configuração e Desenvolvimento**

### **📋 Scripts Disponíveis**
```bash
# 🎯 Comandos Principais
npm run dev:all              # Inicia backend + frontend simultaneamente
npm run dev:backend-only     # Apenas o backend (porta 3000)
npm run dev:frontend-only    # Apenas o frontend (porta 8080)

# 🔧 Scripts de Correção
npm run fix:policies-only    # Exibe instruções para aplicar políticas
npm run verify:storage       # Verifica configuração do storage

# 🔧 Comandos Originais
npm run dev                  # Frontend apenas (como antes)
npm run build                # Build de produção
npm run cypress:run          # Testes automatizados
```

### **Variáveis de Ambiente**
```env
# Backend (.env)
PORT=3000
NODE_ENV=development
DOCS_PATH=../docs/Oficial
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_key

# Frontend
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_key
VITE_LOG_LEVEL=info          # Nível de log (error|warn|info|debug)
```

### **Dependências Principais**
```json
// Backend
{
  "express": "^4.18.2",
  "node-cron": "^3.0.3",
  "node-fetch": "^3.3.2",
  "cheerio": "^1.0.0-rc.12",
  "fs-extra": "^11.1.1",
  "@supabase/supabase-js": "^2.38.4"
}

// Frontend
{
  "react": "^18.2.0",
  "typescript": "^5.0.2",
  "tailwindcss": "^3.3.0",
  "@supabase/supabase-js": "^2.38.4"
}
```

---

## 📊 **Status das Funcionalidades**

| Funcionalidade | Status | Descrição |
|----------------|--------|-----------|
| 🎯 Admin Dashboard | ✅ **100%** | Interface completa e funcional |
| 🔧 Backend Node.js | ✅ **100%** | Servidor rodando e APIs ativas |
| 📥 Download JW.org | ✅ **100%** | Sistema automático funcionando |
| 🔐 Autenticação | ✅ **100%** | Login e controle de acesso |
| 🧪 Testes Cypress | ✅ **100%** | Validação automatizada |
| 📱 Interface | ✅ **100%** | Responsiva e moderna |
| 🗄️ Banco de Dados | ✅ **100%** | Supabase configurado |
| 📤 Upload de PDF | ✅ **Corrigido** | Upload para storage funcionando |
| 🔄 Programas Duplicados | ✅ **Corrigido** | Modal personalizado implementado |
| 🔇 Redução de Logs | ✅ **Corrigido** | Logging com níveis configuráveis |

---

## 🚨 **Troubleshooting**

### **🎯 Problemas com o Sistema Unificado**
```bash
# Se o comando unificado não funcionar
npm run dev:all

# Alternativa: iniciar separadamente
npm run dev:backend-only    # Terminal 1
npm run dev:frontend-only   # Terminal 2
```

### **Backend não inicia**
```bash
# Opção 1: Usar o script unificado
npm run dev:backend-only

# Opção 2: Comando tradicional
cd backend
npm install
npm run dev
```

### **Frontend não conecta ao backend**
```bash
# Verificar se backend está rodando
curl http://localhost:3000/api/status
```

### **Problemas de autenticação**
- Verificar credenciais no Supabase
- Confirmar role do usuário no banco
- Verificar console do navegador para logs

### **Erros de Upload de PDF**
- Verificar se o bucket "programas" existe no Supabase Storage
- Confirmar que as políticas de storage foram aplicadas
- Executar `npm run verify:storage` para diagnosticar problemas

---

## 📚 **Documentação Adicional**

- **[ADMIN_DASHBOARD_INTEGRATION.md](ADMIN_DASHBOARD_INTEGRATION.md)** - Guia completo do Admin Dashboard
- **[DEBUG_ADMIN_DASHBOARD.md](DEBUG_ADMIN_DASHBOARD.md)** - Debug e troubleshooting
- **[README_ESTUDANTES.md](README_ESTUDANTES.md)** - Sistema de estudantes
- **[docs/SISTEMA-UNIFICADO.md](docs/SISTEMA-UNIFICADO.md)** - Arquitetura unificada
- **[FIXES_DOCUMENTATION.md](FIXES_DOCUMENTATION.md)** - Documentação das correções implementadas
- **[SOLUTION_SUMMARY.md](SOLUTION_SUMMARY.md)** - Resumo das soluções
- **[MANUAL_STORAGE_SETUP.md](MANUAL_STORAGE_SETUP.md)** - Configuração manual do storage

---

## 🎯 **Próximos Passos**

### **✅ Concluído**
- [x] Backend Node.js implementado
- [x] Admin Dashboard funcional
- [x] Sistema de downloads automático
- [x] Testes automatizados
- [x] Documentação completa
- [x] **Scripts unificados** para desenvolvimento
- [x] **Correções de upload de PDF**
- [x] **Melhoria do modal de duplicatas**
- [x] **Redução de logs excessivos**

### **🚀 Em Desenvolvimento**
- [ ] Interface mais polida
- [ ] Relatórios avançados
- [ ] Notificações em tempo real
- [ ] Sistema de backup automático

---

## 🏆 **Resultado Final**

**🎉 O Sistema Ministerial está 100% funcional!**

- **✅ Admin Dashboard** integrado e funcionando
- **✅ Backend** rodando e processando downloads
- **✅ Download automático** da JW.org implementado
- **✅ Testes automatizados** funcionando
- **✅ Documentação completa** criada
- **✅ Código versionado** e sincronizado no GitHub
- **✅ Scripts unificados** para desenvolvimento simplificado
- **✅ Correções importantes** implementadas e documentadas

**🚀 Sistema pronto para uso em produção com desenvolvimento otimizado!**

---

## 👥 **Contribuição**

### **Desenvolvedor Principal**
- **Roberto Araujo da Silva** - Arquitetura e implementação completa

### **Como Contribuir**
1. Fork o repositório
2. Crie uma branch para sua feature
3. Commit suas mudanças
4. Push para a branch
5. Abra um Pull Request

---

## 📞 **Suporte**

- **Issues:** [GitHub Issues](https://github.com/RobertoAraujoSilva/sua-parte/issues)
- **Documentação:** Arquivos markdown no repositório
- **Debug:** Painel amarelo no Admin Dashboard (modo desenvolvimento)

---

## 📄 **Licença**

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

---

**🌟 Sistema Ministerial - Transformando a gestão de materiais e programas!**
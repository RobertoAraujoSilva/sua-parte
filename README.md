# 📚 Sistema Ministerial

## 🚀 **Status: SISTEMA COMPLETO IMPLEMENTADO E FUNCIONANDO!**

O **Sistema Ministerial** é uma plataforma completa para gerenciamento de materiais, programas e congregações, com **Admin Dashboard integrado** e **Backend Node.js** funcionando em tempo real.

---

## ✨ **Funcionalidades Implementadas**

### 🎯 **Admin Dashboard (100% Funcional)**
- **Interface administrativa completa** com abas organizadas
- **Download automático** de materiais da JW.org (PDF, JWPub, RTF, DAISY)
- **Gerenciamento de materiais** e publicação para congregações
- **Monitoramento do sistema** em tempo real
- **Sistema de debug** para desenvolvimento

### 🔧 **Backend Node.js (Porta 3001)**
- **Servidor Express** com APIs REST completas
- **Serviço JWDownloader** para scraping e download da JW.org
- **Sistema de cron** para downloads automáticos
- **Integração com Supabase** para banco de dados
- **Health checks** e monitoramento do sistema

### 🌐 **Frontend React (Porta 8081)**
- **Interface responsiva** com TailwindCSS e Shadcn/ui
- **Sistema de autenticação** integrado com Supabase
- **Controle de acesso** por roles (admin, instrutor, estudante)
- **Dashboard unificado** para todos os usuários

### 🧪 **Testes Automatizados**
- **Testes Cypress** para validação completa do sistema
- **Cobertura de funcionalidades** principais
- **Testes de integração** frontend-backend

---

## 🚀 **Como Usar o Sistema**

### **🎯 Opção 1 - Iniciar Tudo de Uma Vez (RECOMENDADO)**
```bash
npm run dev:all
```
**Resultado:** Inicia **ambos** os servidores simultaneamente
- **Backend:** Porta 3001
- **Frontend:** Porta 8081

### **🔧 Opção 2 - Iniciar Separadamente**
```bash
# Terminal 1 - Backend
npm run dev:backend-only

# Terminal 2 - Frontend  
npm run dev:frontend-only
```

### **📱 Acessar o Admin Dashboard**
```
URL: http://localhost:8081/admin
Login: amazonwebber007@gmail.com / admin123
```

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
- **`npm run dev:backend-only`** - Apenas o backend (porta 3001)
- **`npm run dev:frontend-only`** - Apenas o frontend (porta 8081)
- **Desenvolvimento simplificado** com um único comando

### **✅ Admin Dashboard**
- **Visão Geral:** Estatísticas do sistema e ações rápidas
- **Downloads:** Configuração e verificação de atualizações da JW.org
- **Materiais:** Lista de materiais baixados e seus status
- **Publicação:** Sistema de publicação para congregações
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
npm run dev:backend-only     # Apenas o backend (porta 3001)
npm run dev:frontend-only    # Apenas o frontend (porta 8081)

# 🔧 Comandos Originais
npm run dev                  # Frontend apenas (como antes)
npm run build                # Build de produção
npm run cypress:run          # Testes automatizados
```

### **Variáveis de Ambiente**
```env
# Backend (.env)
PORT=3001
NODE_ENV=development
DOCS_PATH=../docs/Oficial
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_key

# Frontend
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_key
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
curl http://localhost:3001/api/status
```

### **Problemas de autenticação**
- Verificar credenciais no Supabase
- Confirmar role do usuário no banco
- Verificar console do navegador para logs

---

## 📚 **Documentação Adicional**

- **[ADMIN_DASHBOARD_INTEGRATION.md](ADMIN_DASHBOARD_INTEGRATION.md)** - Guia completo do Admin Dashboard
- **[DEBUG_ADMIN_DASHBOARD.md](DEBUG_ADMIN_DASHBOARD.md)** - Debug e troubleshooting
- **[README_ESTUDANTES.md](README_ESTUDANTES.md)** - Sistema de estudantes
- **[docs/SISTEMA-UNIFICADO.md](docs/SISTEMA-UNIFICADO.md)** - Arquitetura unificada

---

## 🎯 **Próximos Passos**

### **✅ Concluído**
- [x] Backend Node.js implementado
- [x] Admin Dashboard funcional
- [x] Sistema de downloads automático
- [x] Testes automatizados
- [x] Documentação completa
- [x] **Scripts unificados** para desenvolvimento

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


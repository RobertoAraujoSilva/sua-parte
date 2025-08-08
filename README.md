# 📚 Sistema Ministerial

> **Plataforma completa para gestão de designações da Escola do Ministério Teocrático das Testemunhas de Jeová**

[![React](https://img.shields.io/badge/React-18.3.1-blue.svg)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8.3-blue.svg)](https://www.typescriptlang.org/)
[![Supabase](https://img.shields.io/badge/Supabase-2.53.0-green.svg)](https://supabase.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4.17-blue.svg)](https://tailwindcss.com/)
[![Vite](https://img.shields.io/badge/Vite-5.4.19-purple.svg)](https://vitejs.dev/)

## 🎯 Visão Geral

O **Sistema Ministerial** é uma aplicação web moderna desenvolvida para automatizar e otimizar a gestão de designações da Escola do Ministério Teocrático. O sistema oferece uma solução completa que respeita todas as diretrizes organizacionais e facilita o trabalho dos superintendentes e estudantes.

### 🌟 Principais Características

- **🔐 Autenticação Dual**: Sistema de roles para instrutores e estudantes
- **👥 Gestão Completa de Estudantes**: Cadastro manual e importação em massa via Excel
- **📊 Dashboard Inteligente**: Estatísticas em tempo real e ações rápidas
- **👨‍👩‍👧‍👦 Gestão Familiar**: Sistema de convites e relacionamentos familiares
- **📱 Portal do Estudante**: Interface dedicada para visualização de designações
- **🎯 Conformidade S-38-T**: Algoritmo que respeita todas as regras congregacionais
- **📈 Relatórios Avançados**: Métricas de participação e engajamento

## 🏗️ Arquitetura Técnica

### **Frontend**
- **React 18.3.1** com TypeScript para type safety
- **Vite** para build rápido e hot reload
- **Tailwind CSS** para estilização responsiva
- **shadcn/ui** para componentes consistentes
- **React Router** para navegação SPA
- **React Query** para gerenciamento de estado servidor

### **Backend & Database**
- **Supabase** como Backend-as-a-Service
- **PostgreSQL** com Row Level Security (RLS)
- **Supabase Auth** para autenticação segura
- **Real-time subscriptions** para atualizações em tempo real

### **Funcionalidades Avançadas**
- **Excel Processing** com biblioteca XLSX
- **Cypress E2E Testing** para garantia de qualidade
- **Error Boundaries** para tratamento robusto de erros
- **Protected Routes** com controle de acesso baseado em roles

## 🚀 Início Rápido

### Pré-requisitos
- Node.js 18+
- npm ou yarn
- Conta no Supabase

### Instalação

```bash
# Clone o repositório
git clone https://github.com/RobertoAraujoSilva/sua-parte.git

# Navegue para o diretório
cd sua-parte

# Instale as dependências
npm install

# Configure as variáveis de ambiente
cp .env.example .env.local
# Edite .env.local com suas credenciais do Supabase

# Execute as migrações do banco
npx supabase db push

# Inicie o servidor de desenvolvimento
npm run dev
```

### Configuração do Supabase

1. Crie um projeto no [Supabase](https://supabase.com)
2. Configure as variáveis no `.env.local`:
```env
VITE_SUPABASE_URL=sua_url_do_supabase
VITE_SUPABASE_ANON_KEY=sua_chave_anonima
```
3. Execute as migrações: `npx supabase db push`

## 📋 Funcionalidades Implementadas

### ✅ **Core Features**
- [x] **Sistema de Autenticação** - Login/registro com roles (instrutor/estudante)
- [x] **Dashboard Administrativo** - Visão geral com estatísticas em tempo real
- [x] **Gestão de Estudantes** - CRUD completo com validações
- [x] **Importação Excel** - Upload e processamento de planilhas com validação
- [x] **Portal do Estudante** - Interface dedicada para estudantes
- [x] **Gestão Familiar** - Cadastro e convites para familiares
- [x] **Sistema de Reuniões** - Gestão de reuniões e eventos especiais

### ✅ **Advanced Features**
- [x] **Row Level Security** - Segurança de dados por usuário
- [x] **Responsive Design** - Interface adaptável para mobile/desktop
- [x] **Error Handling** - Tratamento robusto de erros
- [x] **Type Safety** - TypeScript em todo o projeto
- [x] **Testing Setup** - Cypress configurado para E2E testing

## 🎯 Próximos Passos de Desenvolvimento

### 🔄 **Fase 1: Algoritmo de Designações (Prioridade Alta)**
- [ ] **Importação de Programas** - Upload e parsing de PDFs da apostila
- [ ] **Algoritmo Inteligente** - Geração automática respeitando regras S-38-T
- [ ] **Validação de Regras** - Parte 3 masculina, partes 4-7 em duplas
- [ ] **Prevenção de Repetições** - Evitar designações consecutivas

### 🔄 **Fase 2: Notificações e Comunicação (Prioridade Alta)**
- [ ] **Sistema de Notificações** - Email automático para estudantes
- [ ] **Templates de Email** - Configuração no Supabase Auth
- [ ] **WhatsApp Integration** - Notificações via API do WhatsApp
- [ ] **Fallback PDF** - Geração de PDFs para backup

### 🔄 **Fase 3: Relatórios e Analytics (Prioridade Média)**
- [ ] **Relatórios Avançados** - Histórico de participação
- [ ] **Métricas de Engajamento** - Taxa de participação por estudante
- [ ] **Exportação de Dados** - PDF/Excel para relatórios
- [ ] **Dashboard Analytics** - Gráficos e visualizações

### 🔄 **Fase 4: Funcionalidades Premium (Prioridade Baixa)**
- [ ] **Sistema de Doações** - QR Code PIX integrado
- [ ] **Multi-congregação** - Suporte para múltiplas congregações
- [ ] **API Pública** - Endpoints para integrações externas
- [ ] **Mobile App** - Aplicativo nativo React Native

## 📁 Estrutura do Projeto

```
sua-parte/
├── 📁 src/
│   ├── 📁 components/          # Componentes reutilizáveis
│   │   ├── 📁 ui/             # Componentes shadcn/ui
│   │   ├── EstudanteForm.tsx  # Formulário de estudantes
│   │   ├── SpreadsheetUpload.tsx # Upload de planilhas
│   │   └── ...
│   ├── 📁 contexts/           # Contextos React
│   │   └── AuthContext.tsx    # Contexto de autenticação
│   ├── 📁 hooks/              # Custom hooks
│   │   ├── useEstudantes.ts   # Hook para gestão de estudantes
│   │   ├── useSpreadsheetImport.ts # Hook para importação
│   │   └── ...
│   ├── 📁 pages/              # Páginas da aplicação
│   │   ├── Dashboard.tsx      # Dashboard principal
│   │   ├── Estudantes.tsx     # Gestão de estudantes
│   │   ├── Auth.tsx           # Autenticação
│   │   └── ...
│   ├── 📁 types/              # Definições TypeScript
│   │   ├── estudantes.ts      # Tipos para estudantes
│   │   ├── spreadsheet.ts     # Tipos para importação
│   │   └── ...
│   └── 📁 utils/              # Utilitários
│       ├── spreadsheetProcessor.ts # Processamento Excel
│       └── ...
├── 📁 supabase/
│   ├── 📁 migrations/         # Migrações do banco
│   └── config.toml           # Configuração Supabase
├── 📁 docs/                   # Documentação técnica
├── 📁 cypress/                # Testes E2E
└── 📁 scripts/                # Scripts de automação
```

## 🧪 Testes e Qualidade

### **Cypress E2E Testing**
```bash
# Instalar Cypress
npm run cypress:install

# Executar testes em modo interativo
npm run cypress:open

# Executar todos os testes
npm run cypress:run

# Executar testes específicos
npm run test:sarah    # Teste de cadastro de estudante
npm run test:franklin # Teste de login
```

### **Scripts de Verificação**
```bash
# Verificar build
node scripts/verify-build.js

# Verificar configuração do Cypress
./scripts/verify-cypress-setup.ps1

# Lint do código
npm run lint
```

## 🔧 Scripts Disponíveis

| Script | Descrição |
|--------|-----------|
| `npm run dev` | Inicia servidor de desenvolvimento |
| `npm run build` | Build para produção |
| `npm run preview` | Preview do build de produção |
| `npm run lint` | Executa ESLint |
| `npm run cypress:open` | Abre Cypress em modo interativo |
| `npm run cypress:run` | Executa todos os testes Cypress |

## 📚 Documentação Técnica

### **Documentos Principais**
- [`docs/PRD.md`](docs/PRD.md) - Product Requirements Document
- [`docs/PLANO.md`](docs/PLANO.md) - Plano de implementação
- [`docs/AUTHENTICATION_STATUS_REPORT.md`](docs/AUTHENTICATION_STATUS_REPORT.md) - Status da autenticação

### **Funcionalidades Específicas**
- [`docs/FAMILY_INVITATIONS_FEATURE.md`](docs/FAMILY_INVITATIONS_FEATURE.md) - Sistema de convites familiares
- [`docs/STUDENT_PORTAL_IMPLEMENTATION.md`](docs/STUDENT_PORTAL_IMPLEMENTATION.md) - Portal do estudante
- [`docs/CYPRESS_TESTING_SETUP.md`](docs/CYPRESS_TESTING_SETUP.md) - Configuração de testes

### **Correções e Melhorias**
- [`docs/BUILD_ERRORS_FIXED.md`](docs/BUILD_ERRORS_FIXED.md) - Correções de build
- [`docs/SECURITY_FIX_REPORT.md`](docs/SECURITY_FIX_REPORT.md) - Correções de segurança
- [`docs/SUPABASE_CLIENT_TIMEOUT_FIX.md`](docs/SUPABASE_CLIENT_TIMEOUT_FIX.md) - Correções do Supabase

## 🔐 Segurança e Privacidade

### **Medidas Implementadas**
- ✅ **Row Level Security (RLS)** - Isolamento de dados por usuário
- ✅ **Autenticação JWT** - Tokens seguros via Supabase Auth
- ✅ **Validação de Entrada** - Sanitização de dados no frontend e backend
- ✅ **HTTPS Obrigatório** - Comunicação criptografada
- ✅ **Variáveis de Ambiente** - Credenciais protegidas

### **Conformidade**
- ✅ **LGPD Compliance** - Proteção de dados pessoais
- ✅ **Auditoria de Acesso** - Logs de ações dos usuários
- ✅ **Backup Automático** - Supabase gerencia backups
- ✅ **Controle de Acesso** - Roles e permissões granulares

## 🤝 Contribuição

### **Como Contribuir**
1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

### **Padrões de Código**
- Use TypeScript para type safety
- Siga as convenções do ESLint configurado
- Escreva testes para novas funcionalidades
- Documente APIs e componentes complexos
- Use commits semânticos (feat, fix, docs, etc.)

## 📞 Suporte e Contato

### **Canais de Suporte**
- 📧 **Email**: amazonwebber007@gmail.com
- 🐛 **Issues**: [GitHub Issues](https://github.com/RobertoAraujoSilva/sua-parte/issues)
- 📖 **Documentação**: Pasta `docs/` do projeto

### **Informações do Projeto**
- **Versão**: 1.0.0
- **Licença**: MIT
- **Autor**: Roberto Araújo Silva
- **Repositório**: https://github.com/RobertoAraujoSilva/sua-parte

---

<div align="center">

**🙏 Desenvolvido com dedicação para servir às congregações das Testemunhas de Jeová**

*"Tudo o que fizerem, façam de todo o coração, como para Jeová, e não para homens." - Colossenses 3:23*

</div>

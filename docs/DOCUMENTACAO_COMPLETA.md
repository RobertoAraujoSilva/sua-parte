# 📚 Sistema Ministerial - Documentação Completa

> **Plataforma completa para gestão de designações da Escola do Ministério Teocrático das Testemunhas de Jeová**

[![React](https://img.shields.io/badge/React-18.3.1-blue.svg)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8.3-blue.svg)](https://www.typescriptlang.org/)
[![Supabase](https://img.shields.io/badge/Supabase-2.54.0-green.svg)](https://supabase.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4.17-blue.svg)](https://tailwindcss.com/)
[![Vite](https://img.shields.io/badge/Vite-5.4.19-purple.svg)](https://vitejs.dev/)

---

## 🎯 Visão Geral do Sistema

O **Sistema Ministerial** é uma aplicação web moderna desenvolvida para automatizar e otimizar a gestão de designações da Escola do Ministério Teocrático. O sistema oferece uma solução completa que respeita todas as diretrizes organizacionais e facilita o trabalho dos superintendentes e estudantes.

### 🌟 Principais Características

- **🔐 Autenticação Dual**: Sistema de roles para instrutores e estudantes
- **👥 Gestão Completa de Estudantes**: Cadastro manual e importação em massa via Excel
- **📊 Dashboard Inteligente**: Estatísticas em tempo real e ações rápidas
- **👨👩👧👦 Gestão Familiar**: Sistema de convites e relacionamentos familiares
- **📱 Portal do Estudante**: Interface dedicada para visualização de designações
- **🎯 Conformidade S-38-T**: Algoritmo que respeita todas as regras congregacionais
- **📈 Relatórios Avançados**: Métricas de participação e engajamento
- **📋 Planilha Editável**: Interface tipo Excel para edição em massa de dados

---

## 🏗️ Arquitetura do Sistema

### Stack Tecnológico

#### Frontend
- **React 18.3.1** - Framework principal
- **TypeScript 5.8.3** - Tipagem estática
- **Vite 5.4.19** - Build tool e dev server
- **Tailwind CSS 3.4.17** - Framework CSS
- **Radix UI** - Componentes acessíveis
- **AG Grid 34.1.1** - Planilha profissional
- **React Router 6.30.1** - Roteamento
- **React Hook Form 7.61.1** - Gerenciamento de formulários

#### Backend & Database
- **Supabase 2.54.0** - Backend as a Service
- **PostgreSQL** - Banco de dados relacional
- **Row Level Security (RLS)** - Segurança de dados
- **Real-time subscriptions** - Atualizações em tempo real

#### Ferramentas de Desenvolvimento
- **Cypress 13.17.0** - Testes E2E
- **ESLint** - Linting
- **PWA** - Progressive Web App
- **jsPDF 3.0.1** - Geração de PDFs

### Estrutura de Diretórios

```
sua-parte/
├── 📁 src/                    # Código-fonte da aplicação
│   ├── 📁 components/         # Componentes reutilizáveis
│   │   ├── 📁 auth/           # Componentes de autenticação
│   │   ├── 📁 instructor/     # Painel do instrutor
│   │   ├── 📁 navigation/     # Navegação e menus
│   │   ├── 📁 students/       # Gestão de estudantes
│   │   ├── 📁 tutorial/       # Sistema de tutoriais
│   │   └── 📁 ui/             # Componentes base (shadcn/ui)
│   ├── 📁 contexts/           # Contextos React
│   ├── 📁 hooks/              # Custom hooks
│   ├── 📁 pages/              # Páginas da aplicação
│   ├── 📁 types/              # Definições TypeScript
│   └── 📁 utils/              # Utilitários e helpers
├── 📁 supabase/               # Configuração do Supabase
│   ├── 📁 migrations/         # Migrações do banco
│   └── config.toml           # Configuração Supabase
├── 📁 cypress/                # Testes E2E
├── 📁 docs/                   # Documentação técnica
└── 📁 scripts/                # Scripts de automação
```

---

## 🚀 Funcionalidades Principais

### 1. 🔐 Sistema de Autenticação

#### Roles de Usuário
- **Instrutor**: Acesso completo ao sistema
- **Estudante**: Acesso limitado ao portal do estudante
- **Desenvolvedor**: Acesso a ferramentas de debug

#### Funcionalidades de Auth
- Login/logout seguro
- Recuperação de senha
- Perfis de usuário
- Timeout de sessão
- Autenticação por email

### 2. 👥 Gestão de Estudantes

#### Cadastro de Estudantes
- **Formulário completo** com validação
- **Campos obrigatórios**: Nome, idade, gênero, cargo
- **Campos opcionais**: Email, telefone, data batismo, observações
- **Validação automática** de dados

#### Importação em Massa
- **Upload de planilhas Excel**
- **Validação de dados** em lote
- **Preview antes da importação**
- **Relatório de erros** detalhado

#### Planilha Editável (NOVA FUNCIONALIDADE)
- **Interface tipo Excel** com AG Grid
- **Edição inline** de todos os campos
- **Salvamento automático** no banco
- **Altura condicional** das linhas
- **Colunas responsivas** e redimensionáveis
- **Filtros e ordenação** avançados
- **Quebra de texto** automática
- **Validação em tempo real**

### 3. 📊 Gestão de Programas

#### Importação de Programas
- **Upload de PDFs** da apostila oficial
- **Parser automático** de conteúdo
- **Importação via JW.org** (copy/paste)
- **Validação de estrutura** do programa

#### Geração de Designações
- **Algoritmo S-38-T** compliant
- **Balanceamento automático** de participações
- **Respeito às qualificações** dos estudantes
- **Evita repetições** excessivas
- **Considera restrições** de gênero

#### Geração de PDFs
- **PDFs profissionais** com dados completos
- **Formatação adequada** para impressão
- **Informações dos designados** claramente visíveis
- **Quebra automática** de páginas
- **Cabeçalhos e rodapés** informativos

### 4. 📱 Portal do Estudante

#### Funcionalidades
- **Visualização de designações** pessoais
- **Histórico de participações**
- **Notificações** de novas designações
- **Interface simplificada** e intuitiva

### 5. 👨👩👧👦 Gestão Familiar

#### Sistema de Convites
- **Convites por email** para familiares
- **Relacionamentos familiares** automáticos
- **Gestão de menores** de idade
- **Responsáveis primários** e secundários

### 6. 📈 Relatórios e Estatísticas

#### Dashboard Inteligente
- **Métricas em tempo real**
- **Gráficos interativos**
- **Estatísticas de participação**
- **Indicadores de performance**

#### Relatórios Detalhados
- **Relatórios de designações**
- **Histórico de participações**
- **Análise de balanceamento**
- **Exportação em PDF**

---

## 🛠️ Configuração e Instalação

### Pré-requisitos
- Node.js 18+
- npm ou yarn
- Conta no Supabase

### Instalação Local

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

### Variáveis de Ambiente

```env
# Supabase
VITE_SUPABASE_URL=sua_url_supabase
VITE_SUPABASE_ANON_KEY=sua_chave_anonima

# Database
DATABASE_URL=sua_connection_string

# Cypress (opcional)
CYPRESS_RECORD_KEY=sua_chave_cypress
```

---

## 🗄️ Estrutura do Banco de Dados

### Tabelas Principais

#### `profiles`
- Perfis de usuário
- Roles e permissões
- Informações pessoais

#### `estudantes`
- Dados dos estudantes
- Qualificações e cargos
- Relacionamentos familiares

#### `programas`
- Programas semanais
- Status de aprovação
- Metadados de importação

#### `designacoes`
- Designações geradas
- Estudantes e ajudantes
- Status de confirmação

#### `family_members`
- Relacionamentos familiares
- Convites e aprovações
- Hierarquia familiar

### Segurança (RLS)

Todas as tabelas implementam **Row Level Security**:
- Usuários só acessam seus próprios dados
- Políticas específicas por role
- Auditoria de acesso automática

---

## 🧪 Testes e Qualidade

### Cypress E2E Testing

```bash
# Instalar Cypress
npm run cypress:install

# Executar testes em modo interativo
npm run cypress:open

# Executar todos os testes
npm run cypress:run

# Testes específicos
npm run test:franklin    # Login do instrutor
npm run test:sarah       # Registro de estudante
npm run test:audit       # Auditoria completa
```

### Cobertura de Testes
- ✅ Autenticação e autorização
- ✅ Cadastro de estudantes
- ✅ Importação de programas
- ✅ Geração de designações
- ✅ Portal do estudante
- ✅ Gestão familiar

---

## 📋 Scripts Disponíveis

| Script | Descrição |
|--------|-----------|
| `npm run dev` | Servidor de desenvolvimento |
| `npm run build` | Build para produção |
| `npm run preview` | Preview do build |
| `npm run lint` | Executa ESLint |
| `npm run test:e2e` | Testes E2E completos |
| `npm run cypress:open` | Cypress interativo |
| `npm run env:validate` | Valida variáveis de ambiente |

---

## 🔧 Configurações Avançadas

### PWA (Progressive Web App)
- **Offline support** básico
- **Ícones otimizados** para dispositivos
- **Manifest configurado**
- **Service worker** automático

### Performance
- **Code splitting** automático
- **Lazy loading** de componentes
- **Otimização de imagens**
- **Caching inteligente**

### SEO e Acessibilidade
- **Meta tags** otimizadas
- **Componentes acessíveis** (Radix UI)
- **Navegação por teclado**
- **Screen reader support**

---

## 🚀 Deploy e Produção

### Plataformas Suportadas
- **Netlify** (recomendado)
- **Vercel**
- **AWS S3 + CloudFront**
- **Servidor próprio**

### Build de Produção

```bash
# Build otimizado
npm run build

# Preview local
npm run preview

# Deploy (exemplo Netlify)
netlify deploy --prod --dir=dist
```

### Configurações de Produção
- **HTTPS obrigatório**
- **Variáveis de ambiente** seguras
- **Backup automático** do banco
- **Monitoramento** de performance

---

## 🔒 Segurança

### Medidas Implementadas
- **Row Level Security** no banco
- **Sanitização** de inputs
- **Validação** server-side
- **Rate limiting** nas APIs
- **Logs de auditoria**

### Boas Práticas
- **Senhas criptografadas**
- **Tokens JWT** seguros
- **CORS** configurado
- **Headers de segurança**
- **Validação de tipos** TypeScript

---

## 📞 Suporte e Manutenção

### Canais de Suporte
- 📧 **Email**: amazonwebber007@gmail.com
- 🐛 **Issues**: [GitHub Issues](https://github.com/RobertoAraujoSilva/sua-parte/issues)
- 📖 **Documentação**: Pasta `docs/` do projeto

### Logs e Debugging
- **Console logs** estruturados
- **Error boundaries** React
- **Supabase logs** integrados
- **Performance monitoring**

### Backup e Recuperação
- **Backup automático** diário (Supabase)
- **Point-in-time recovery**
- **Exportação de dados** em JSON/Excel
- **Migração de dados** assistida

---

## 🔄 Atualizações e Versionamento

### Processo de Release
1. **Desenvolvimento** em branches feature
2. **Testes automatizados** (Cypress)
3. **Code review** obrigatório
4. **Deploy staging** para validação
5. **Deploy produção** com rollback

### Changelog
- **Semantic versioning** (SemVer)
- **Release notes** detalhadas
- **Breaking changes** documentadas
- **Migration guides** quando necessário

---

## 🎯 Roadmap Futuro

### Próximas Funcionalidades
- [ ] **API REST** completa
- [ ] **Mobile app** nativo
- [ ] **Integração WhatsApp** para notificações
- [ ] **Relatórios avançados** com BI
- [ ] **Multi-congregação** support
- [ ] **Backup/restore** via interface

### Melhorias Planejadas
- [ ] **Performance** otimizada
- [ ] **UI/UX** aprimorada
- [ ] **Acessibilidade** completa
- [ ] **Internacionalização** (i18n)
- [ ] **Dark mode** nativo

---

## 🤝 Contribuição

### Como Contribuir
1. **Fork** o repositório
2. **Crie** uma branch feature
3. **Implemente** as mudanças
4. **Teste** completamente
5. **Submeta** um Pull Request

### Guidelines
- **TypeScript** obrigatório
- **Testes** para novas funcionalidades
- **Documentação** atualizada
- **Code review** necessário
- **Conventional commits**

---

## 📄 Licença

Este projeto é desenvolvido para uso exclusivo das congregações das Testemunhas de Jeová, seguindo os princípios e diretrizes organizacionais.

---

## 🙏 Agradecimentos

Desenvolvido com dedicação para servir às congregações das Testemunhas de Jeová.

*"Tudo o que fizerem, façam de todo o coração, como para Jeová, e não para homens." - Colossenses 3:23*

---

## 📊 Estatísticas do Projeto

- **Linhas de código**: ~50,000+
- **Componentes React**: 80+
- **Páginas**: 25+
- **Testes E2E**: 15+
- **Migrações DB**: 13+
- **Documentos**: 100+

---

*Documentação atualizada em: Janeiro 2025*
*Versão do sistema: 1.0.0*
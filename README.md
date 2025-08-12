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

## 📚 Documentação

A documentação completa do projeto está disponível no diretório [`docs/`](docs/). Alguns documentos importantes incluem:

- [Product Requirements Document (PRD)](docs/PRD.md)
- [Plano de Implementação](docs/PLANO.md)
- [Próximas Tarefas](docs/PROXIMAS_TAREFAS.md)
- [Sistema de Designações S-38-T](docs/SISTEMA_DESIGNACOES_S38T.md)

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

## 📁 Estrutura do Projeto

```
sua-parte/
├── 📁 src/                    # Código-fonte da aplicação
│   ├── 📁 components/         # Componentes reutilizáveis
│   ├── 📁 contexts/            # Contextos React
│   ├── 📁 hooks/              # Custom hooks
│   ├── 📁 pages/              # Páginas da aplicação
│   ├── 📁 types/              # Definições TypeScript
│   └── 📁 utils/              # Utilitários
├── 📁 supabase/               # Configuração do Supabase
│   ├── 📁 migrations/         # Migrações do banco
│   └── config.toml           # Configuração Supabase
├── 📁 docs/                   # Documentação técnica
├── 📁 cypress/                # Testes E2E
└── 📁 scripts/                # Scripts de automação
```

## 🧪 Testes e Qualidade

### Cypress E2E Testing
```bash
# Instalar Cypress
npm run cypress:install

# Executar testes em modo interativo
npm run cypress:open

# Executar todos os testes
npm run cypress:run
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

## 📞 Suporte e Contato

### Canais de Suporte
- 📧 **Email**: amazonwebber007@gmail.com
- 🐛 **Issues**: [GitHub Issues](https://github.com/RobertoAraujoSilva/sua-parte/issues)
- 📖 **Documentação**: Pasta `docs/` do projeto

---

<div align="center">

**🙏 Desenvolvido com dedicação para servir às congregações das Testemunhas de Jeová**

*"Tudo o que fizerem, façam de todo o coração, como para Jeová, e não para homens." - Colossenses 3:23*

</div>
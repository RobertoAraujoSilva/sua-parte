# Plano de Implementação — Sistema Ministerial

## 1. Infraestrutura e Ambiente
- Configurar variáveis de ambiente no `.env` (Supabase, banco, MCP)
- Garantir que o projeto roda em `localhost:8080` (ajustar porta no Vite se necessário)
- Instalar dependências (npm install)

## 2. Roteamento e Páginas
- Verificar e corrigir rotas principais: Início, Funcionalidades, Congregações, Suporte, Sobre, Entrar, Dashboard
- Implementar rota dinâmica `/estudante/:id` (Portal do Estudante)
- Criar página de cadastro inicial (“Começar”)

## 3. Layout e Componentes
- Garantir que o layout institucional está igual ao modelo (Header, Hero, Features, Footer)
- Adicionar navegação entre todas as páginas
- Implementar botão “Começar Agora” e “Ver Demonstração” com navegação correta

## 4. Backend e Banco de Dados
- Conectar ao Supabase usando as variáveis do `.env`
- Criar tabelas: estudantes, programas, designações, notificações, profiles
- Implementar autenticação (login/signup para designadores)
- Configurar Row Level Security (RLS) nas tabelas

## 5. Funcionalidades Principais
- Cadastro de estudantes (formulário e importação por planilha)
- Importação de programa semanal (upload de PDF e parsing)
- Geração automática de designações (algoritmo conforme regras)
- Notificações automáticas (e-mail, WhatsApp, fallback PDF)
- Portal do estudante (visualização, confirmação, doações)
- Relatórios e dashboard administrativo

## 6. Doações
- Adicionar QR code Pix e botão “Copiar Chave Pix” no portal do estudante
- Implementar popup de agradecimento após doação

## 7. Testes e Ajustes Finais
- Testar navegação e funcionalidades em todos os navegadores
- Validar integração com Supabase (CRUD completo)
- Corrigir bugs e polir interface
- Documentar uso e fluxo para administradores e estudantes

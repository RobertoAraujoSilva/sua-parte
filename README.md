# Sua-Parte — Sistema Ministerial

O Sua-Parte é uma plataforma para gestão de materiais, programas e congregações, com Frontend React (Vite) e Backend Node.js (Express). Este documento descreve os papéis dos dashboards, além de trazer instruções objetivas de instalação e uso.

## Papéis dos Dashboards

### Admin Dashboard (Administradores)
- Importar e organizar materiais oficiais (PDF, JWPub, etc.).
- Gerenciar congregações, instrutores e permissões.
- Monitorar saúde do sistema e serviços do backend.
- Publicar Programacao que deve estar Visivel no Dashboard do Admin e ser espelhada nos dashbords dos Instrutores mas sem os nomes dos estudantes. 

### Dashboard do Instrutor (Congregações)
- Visualizar a programação publicada pelo admin.
- Cadastrar e gerenciar estudantes da congregação.
- Designar partes da reunião aos estudantes.
- Operar offline com sincronização quando voltar a ficar online.

### Dashboard do Estudante (Leitura/Acompanhamento)
- Acessar materiais publicados para sua congregação.
- Consultar designações, histórico e programas disponibilizados.
- Acesso com perfil restrito (somente leitura das publicações).

## Tecnologias
- Frontend: React + TypeScript, Vite, TailwindCSS, shadcn/ui
- Backend: Node.js + Express, cron, integração com Supabase
- Testes: Cypress E2E

## Instalação
1. Clonar o repositório
```bash
git clone https://github.com/RobertoAraujoSilva/sua-parte.git
cd sua-parte
```

2. Instalar dependências (raiz)
```bash
npm install
```

3. Variáveis de ambiente
- Crie um arquivo `.env` na raiz (frontend) e outro em `backend/.env` se necessário.
- Exemplo (ajuste para seu ambiente — não compartilhe chaves reais):

Frontend (.env)
```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

Backend (backend/.env)
```env
PORT=3001
NODE_ENV=development
DOCS_PATH=../docs/Oficial
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_service_or_anon_key
```

## Execução
- Iniciar frontend e backend juntos (recomendado)
```bash
npm run dev:all
```

- Iniciar apenas o backend (porta padrão 3001)
```bash
npm run dev:backend-only
```

- Iniciar apenas o frontend (porta padrão 8080)
```bash
npm run dev:frontend-only
```

Portas padrão
- Frontend (Vite): http://localhost:8080
- Backend (Express): http://localhost:3001

## Acesso rápido
- Admin Dashboard: `http://localhost:8080/admin`
- Dashboard do Instrutor: `http://localhost:8080/` ou `http://localhost:8080/dashboard`
- Estudante: acesso controlado conforme publicação/perfil

## Testes (Cypress)
- Executar todos os testes
```bash
npm run cypress:run
```

- Exemplos de testes específicos
```bash
npm run test:audit
npm run test:auth
npm run test:programs
```

## Segurança e Boas Práticas
- Não exponha chaves ou credenciais no frontend; use variáveis de ambiente.
- Garanta RLS (Row Level Security) no Supabase e privilégios mínimos por papel.
- Trate erros em todas as chamadas de API e aplique early return/guard clauses.
- Mantenha componentes enxutos, reutilizáveis e consistentes com Tailwind/shadcn.

## Documentação adicional
- `ADMIN_DASHBOARD_INTEGRATION.md` — Integração e fluxo do Admin Dashboard
- `DEBUG_ADMIN_DASHBOARD.md` — Dicas de debug
- `README_ESTUDANTES.md` — Guia do módulo de estudantes
- Pasta `docs/` — Materiais e documentação complementar
- `AGENTS.md` — Orquestrador de personas e fluxo de trabalho (com registro automático de atividades)

## Licença
Projeto sob licença MIT. Consulte `LICENSE` para mais detalhes.

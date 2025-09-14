# Fonte Definitiva de Verdade — Guia de Harmonia do Sistema Ministerial (v3)

Este documento é a referência única e atualizada de como o sistema deve operar “TUDO EM HARMONIA”: rotas, layout, dados, regras S‑38, autenticação, geração de designações e integrações.

Rotas principais (todas compartilham o mesmo shell visual e o mesmo backend):
- /bem-vindo
- /dashboard
- /estudantes
- /programas
- /designacoes
- /relatorios

Arquitetura base
- Frontend: React + TypeScript + Tailwind + shadcn/ui (Vite)
- Backend de dados: Supabase (Postgres + Auth)
- API local: Node/Express simplificado servindo /api (porta 3000)
- Integrações MCP (fora do runtime Web):
  - @supabase/mcp-server-supabase — acesso assistido ao Supabase
  - @upstash/context7-mcp — contexto inteligente (recomendações)
  - @modelcontextprotocol/server-filesystem — cache e acesso a arquivos (PDF/Excel)


---

## 1) Inicialização & Ambiente

1. Verifique .env (raiz):
   - `VITE_API_BASE_URL="http://localhost:3000"`
   - `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY` corretos
2. Suba tudo em dev (raiz do repositório):
   - `npm run dev:all`
     - Backend (porta 3000): http://localhost:3000/api/status (deve responder “online”)
     - Frontend (porta 8080): http://localhost:8080
3. Build de produção (opcional):
   - `npm run build` — artefatos em `dist/`

Notas de build/dev
- Warnings de chunk > 500 kB são esperados em dev; reduza com imports dinâmicos onde fizer sentido e/ou configure manualChunks do Rollup.
- Sempre faça Hard Reload (Ctrl+Shift+R) após mudanças em componentes críticos (/designacoes, ProtectedRoute).


---

## 2) Layout unificado (harmonia visual)

Todas as páginas usam o mesmo shell (Sidebar + Header + Content):
- Sidebar fixa com links para as 6 rotas
- Header com título e ações contextuais
- Conteúdo em cards/tabelas (shadcn/ui)
- Paleta padrão:
  - Azul: ações/navegação
  - Verde: OK/confirmado
  - Amarelo: pendente
  - Vermelho: conflito/erro
  - Cinza claro: molduras neutras

Componentes base
- LayoutShell: organiza Sidebar + Content
- SidebarNav: define os links principais
- (Opcional) PageHeader: título + botões da página
- StatusBadge: mapeia estados para cores


---

## 3) Autenticação & ProtectedRoute (evitar loop)

Regras
- Usuário precisa estar autenticado e com perfil carregado para acessar as rotas principais.
- Papel (role) deve ser verificado: `instrutor` (principal), `estudante`, `family_member`, etc.

Evitar loop de redirecionamento
- Instrutor com `profile.role === 'instrutor'` e `allowedRoles` contendo `instrutor` deve acessar rotas principais assim que o perfil estiver pronto.
- Caso o onboarding seja obrigatório, só redirecione **uma única vez** e respeite `onboarding_completed` no localStorage; evite reentradas em cada render.
- Fluxo robusto:
  1) Se `loading` → mostre loading (não redirecione)
  2) Se `requireAuth && !user` → redirecione para `/auth`
  3) Se `user && profile.role` e `allowedRoles` inclui → conceda acesso
  4) Opcional: onboarding → redirecionar **uma única vez** (sem loops)


---

## 4) Integração com o Backend (/api)

Endpoints implementados
- Programações:
  - `POST /api/programacoes` — upsert de semana (week_start, week_end, items)
  - `GET  /api/programacoes?week_start=YYYY-MM-DD&week_end=YYYY-MM-DD` — lê a semana e seus itens
  - `GET  /api/programacoes/mock?semana=YYYY-MM-DD` — programa mockado (docs/Oficial)
- Designações:
  - `POST /api/designacoes/generate` — aplica S‑38 e grava designações (rascunho)
  - `GET  /api/designacoes?programacao_id=...&congregacao_id=...` — lista designacoes + itens
  - `POST /api/designacoes` — salvar/atualizar itens manualmente
- Status:
  - `GET  /api/status` — status do backend

Supabase (tabelas relevantes)
- estudantes (flags S‑38 e `congregacao_id`)
- programacoes, programacao_itens
- designacoes, designacao_itens


---

## 5) S‑38 — Regras oficiais (mapeamento prático)

- Tesouros — Discurso: ancião/servo (par. 3)
- Joias espirituais: ancião/servo (par. 4)
- Leitura bíblica: somente homem (par. 5)
- Ministério (pars. 6–14):
  - Iniciando conversa, Cultivando interesse, Fazendo discípulos: homem/mulher; **assistente do mesmo gênero** (ou familiar)
  - Explicando crenças (talk): somente homem
- Vida Cristã (par. 15): ancião/servo; `local_needs`: ancião
- Estudo Bíblico de Congregação (par. 16): sempre ancião
- Comentários finais (par. 17): presidente (ancião/servo)
- Rotação justa (par. 23): balancear designações por idade/experiência; 1 parte por semana por pessoa (reuso apenas fallback)
- Tempo (par. 19): total 1h45; ninguém deve ultrapassar o tempo


---

## 6) Fluxo por página (o que cada uma deve fazer)

### /bem-vindo (Hub)
- Saudação personalizada com perfil
- Cards de atalho para /dashboard, /estudantes, /programas, /designacoes, /relatorios
- Destaques: próxima semana, avisos (ex.: visita do superintendente)

### /dashboard (Visão geral)
- Cards: estudantes ativos; designações atribuídas vs. pendentes; últimos designados
- Gráficos: distribuição por seção (TREASURES/APPLY/LIVING); rotatividade por estudante
- Alertas: itens sem designação; conflitos/dobra

### /estudantes (Gestão)
- Tabela: nome | cargo | gênero | idade | ativo | última designação | ações
- Filtros: cargo, gênero, ativo
- Modal: novo/editar estudante
- Importar/Exportar Excel
- Flags S‑38 (importante): chairman, pray, tresures, gems, reading, starting, following, making, explaining, talk
- `congregacao_id` preenchido corretamente (usado pelo gerador)

### /programas (Semanas do Workbook)
- Lista de semanas (cards com week_start/week_end)
- Detalhe: itens (order, section, type, minutes, lang)
- Botões: Upload PDF (parser → POST /api/programacoes), Corrigir (edits pontuais), Mock (desenvolvimento)

### /designacoes (Coração operacional)
- Header:
  - Seletor de semana (setas) — GET /api/programacoes
  - Botões: **Gerar Designações Automáticas**, Regerar, Salvar, Exportar S‑89
  - Caso não haja semana → botão **Carregar Semana Atual (mock)**
- Campo “Congregação (UUID)” — obrigatório. **Auto‑preenchimento**: usa o `congregacao_id` do primeiro estudante ativo quando possível
- Ao clicar **Gerar Designações Automáticas**:
  1) Semana persistida (quando importada)
  2) POST `/api/designacoes/generate { programacao_id, congregacao_id }`
  3) GET `/api/designacoes` para listar o rascunho salvo
- Tabela por parte:
  - Parte | Tempo | Referência | Estudante | Assistente | Status | Ações
  - Status: ✅ ok | ⚠ pendente/conflito | ❌ inválido (S‑38)
  - [✏] Editar → modal com dropdown filtrado pelas regras S‑38
- Regras S‑38 aplicadas no backend (evitar duplicação de lógica no frontend)

### /relatorios (Análise e exportação)
- Abas:
  - Estudante: totais por tipo, últimas designações, evolução
  - Semana: resumo de partes e designados
  - Período: distribuição e rotatividade
- Exportar PDF/Excel


---

## 7) Integrações MCP (opcional)

- Supabase MCP (@supabase/mcp-server-supabase): acesso mediado ao banco
- Context7 MCP (@upstash/context7-mcp): sugestões de rotatividade e variedade
- Filesystem MCP (@modelcontextprotocol/server-filesystem): cache local para uploads

Recomendação: gateway no backend com rotas como:
- `POST /api/suggestions/assignments` — usa Context7 para sugerir variações
- `POST /api/files/cache` — armazena arquivo via filesystem MCP e retorna path

Segurança: tokens MCP não devem residir no .env do app Web.


---

## 8) Checklist operacional para geração em /designacoes

1) Backend online: http://localhost:3000/api/status
2) Semana ativa visível no header:
   - Se “Semana: —” → use setas para carregar uma semana existente, ou Importar → PDF, ou “Carregar Semana Atual (mock)”
3) Campo “Congregação (UUID)” preenchido:
   - Auto-preenchido quando possível; se vazio, copie `congregacao_id` de /estudantes e cole
4) Clique em **Gerar Designações Automáticas**:
   - POST /api/designacoes/generate → 200 OK; se msg “Nenhum elegível…”, ajuste flags/cargos/gênero nas regras S‑38
   - GET /api/designacoes → tabela de rascunho preenchida


---

## 9) Troubleshooting (com base nos logs)

### 9.1) Relato de problema — “Tudo está falso” em /designacoes

**Sintoma**
- A página exibe “Semana: —” e um card: “Nenhuma semana carregada. Carregue a semana atual (mock) ou importe um PDF na aba Importar.”
- Mesmo após login como instrutor, a geração não ocorre.

**Causas mais prováveis**
- Semana não carregada: o seletor de semana não tem week_start/week_end efetivos.
- Campo “Congregação (UUID)” vazio: o gerador exige `congregacao_id`.
- Estudantes sem elegibilidade S‑38: filtros por cargo/gênero/flags impedem seleção.
- Redirecionamento de onboarding intermitente: ProtectedRoute redireciona sem necessidade, atrasando acesso às rotas.

**Verificações objetivas (sem alterar código)**
1) Backend: abrir http://localhost:3000/api/status (deve estar online)
2) Semana: clicar “Carregar Semana Atual (mock)” OU importar Apostila na aba Importar; depois confirmar que o header mostra “Semana: DD mês – DD mês AAAA”.
3) Congregação: verificar o campo “Congregação (UUID)” (auto-preenchido). Se vazio, copiar `congregacao_id` da página /estudantes e colar.
4) Clicar “Gerar Designações Automáticas” e acompanhar o Network:
   - POST /api/designacoes/generate deve retornar 200. A resposta inclui detalhes por item (OK, PENDING, PENDING_ASSISTANT).
   - GET /api/designacoes deve listar os itens salvos (a tabela deve preencher).
5) Se o /generate retornar “Nenhum elegível…”, ajustar os estudantes conforme mapeamento S‑38 (cargo/flags/gênero/ativo/congregacao_id) e repetir.

### 9.2) Logs de ProtectedRoute (observação)
- Mensagens “Redirecting to onboarding for incomplete setup” apareceram, mas na sequência o log mostra “Access granted … Rendering children”.
- Interpretação: houve redirecionamento para onboarding no meio do carregamento do perfil; ao final, o acesso foi concedido.
- Ação sugerida (sem código hoje): confirmar que o localStorage contém `onboarding_completed = '1'` e evitar reabrir o onboarding repetidamente.

### 9.3) Warnings do AG Grid (não bloqueiam a geração)
- Erros com propriedades inválidas (ex.: `data-lov-id`, `data-component-*`) e paginação (page size não incluído no selector) poluem o console.
- Ação sugerida (sem código hoje): registrar para correção futura.


---

## 10) Critérios de aceite (harmonia garantida)

- As 6 rotas usam o mesmo shell visual
- Todos os dados são obtidos via /api no backend (mock apenas controlado para dev)
- /designacoes gera, lista e salva rascunho conforme S‑38
- /dashboard e /relatorios leem do mesmo backend
- /estudantes gerencia qualificações S‑38 e `congregacao_id`
- Exportações operacionais (PDF/Excel)


---

## 11) Comandos úteis

- Dev full: `npm run dev:all`
- Backend isolado: `cd backend && npm run dev`
- Frontend isolado: `vite --port 8080 --strictPort`
- Status: `curl http://localhost:3000/api/status`
- Programa mock: `curl "http://localhost:3000/api/programacoes/mock?semana=YYYY-MM-DD"`


---

## 12) Roadmap incremental

- Assistente automático nas partes de ministério (mesmo gênero; se diferente, somente familiares; menores: mesmo gênero)
- Subtipo “Explicando Crenças”: demo (ambos), talk (homens)
- Semanas especiais:
  - co_visit: substituir CBS por Service Talk (CO)
  - assembly_week/memorial_week: bloquear geração
- Painel Context7: recomendações de rotatividade
- Otimizações de bundle (imports dinâmicos / manualChunks)


---

## 13) Glossário

- S‑38: instruções da Reunião Vida e Ministério Cristão
- TREASURES/APPLY/LIVING: seções do programa (Tesouros/Ministério/Vida Cristã)
- Rascunho: designações geradas e salvas, editáveis
- `congregacao_id`: chave para filtrar estudantes da congregação adequada


---

### Conclusão

Com este guia, todas as rotas funcionam em harmonia: mesmas cores e componentes, mesmos dados, mesmas regras S‑38, e fluxo consistente de geração e análise. 

Relato do momento (“tudo está falso”):
- Não há semana carregada no header; o gerador não tem base para trabalhar.
- O campo “Congregação (UUID)” pode estar vazio; sem ele o gerador não roda.
- A autenticação está ok (instrutor), mas houve redirecionamento para onboarding no meio do carregamento; no fim, o acesso foi concedido.
- Warnings do AG Grid são ruídos visuais, não impedem a geração.

Próximo passo (sem mexer no código hoje):
1) Carregar a semana (mock ou PDF importado);
2) Garantir `congregacao_id` no campo da página;
3) Clicar “Gerar Designações Automáticas” e observar o retorno do /generate; 
4) Ajustar estudantes conforme S‑38 caso a resposta acuse “Nenhum elegível…”.

# Execution Tasks Tracker — Sistema Ministerial

Legend:
- [x] Done
- [~] In progress
- [ ] Pending

Source of truth for goals: docs/SISTEMA-UNIFICADO.md (Admin/Instrutor/Estudante, RLS, Offline, Sync, PDFs)

This tracker is updated as work progresses. Each task lists acceptance criteria and references.

---

## MCP-01 — PDFs (Programas/Designações)

- [x] 1.1 Conectar Exportar PDF em Designações (cards e ações rápidas)
  - Affected: src/pages/Designacoes.tsx, src/utils/pdfGenerator.ts
  - Acceptance: Botões exportam PDF com as designações do programa selecionado e pela ação rápida (programa mais recente com designações).

- [x] 1.2 Melhorar legibilidade do PDF de designações
  - Affected: src/utils/pdfGenerator.ts
  - Changes: Cabeçalho tipo tabela (PARTE/SEÇÃO, TÍTULO, TEMPO); separadores de seção (Abertura, Tesouros, Ministério, Vida Cristã, Encerramento); blocos compactos por parte.
  - Acceptance: PDF mais fácil de ler, com seções e colunas básicas, mantendo quebras de página e rodapé.

- [~] 1.3 Ajustar layout para o modelo oficial
  - Add: cânticos, orações, comentários de abertura/encerramento, formatação dos horários (ex.: 7.00–7.05), tipografia mais fiel.
  - Acceptance: Estrutura visual espelha o modelo fornecido; mantém compatibilidade com dados atuais.

- [ ] 1.4 Aprimorar generateProgramPDF (programa semanal)
  - Add: seções, tempos e cabeçalhos equivalentes; fallback quando partes não disponíveis.
  - Acceptance: Programa semanal também exportável com layout coerente.

---

## MCP-02 — Banco Local e Leitura Offline (Local-First)

- [x] 2.1 IndexedDB: schema inicial + helpers
  - Affected: src/utils/offlineLocalDB.ts
  - Stores: estudantes, programas, designacoes, outbox, cursors
  - Exposed: window.offlineDB.download(), window.offlineDB.list(), window.offlineDB.sync()
  - Acceptance: Download popula o cache local; leitura programática disponível.

- [x] 2.2 UI para iniciar cache offline
  - Affected: src/pages/Designacoes.tsx
  - Add: botão "Baixar Dados Offline" com toasts de sucesso/falha.
  - Acceptance: Disparo do seeding via UI com feedback.

- [x] 2.3 Local-first (fase 1)
  - Affected: src/utils/dataLoaders.ts
  - Implemented: fallback para IndexedDB quando falhar supabase
    - carregarEstudantesAtivos (OK)
    - carregarHistoricoDesignacoes (reconstrução via designacoes + programas) (OK)
  - Acceptance: Sem internet, estudantes/histórico são lidos do cache.

- [x] 2.4 Local-first (fase 2)
  - Scope: Programas + Designações nas telas que ainda consultam supabase diretamente.
  - Acceptance: Telas principais continuam funcionais offline com dados previamente baixados.

- [ ] 2.5 UI de status e pendências
  - Add: Banner Online/Offline (navigator.onLine); contador de pendências (outbox).
  - Acceptance: Usuário vê o estado da conexão e itens pendentes.

---

## MCP-03 — Sincronizaç# Execution Tasks Tracker — Sistema Ministerial

Legend:
- [x] Done
- [~] In progress
- [ ] Pending

Source of truth for goals: docs/SISTEMA-UNIFICADO.md (Admin/Instrutor/Estudante, RLS, Offline, Sync, PDFs)

This tracker is updated as work progresses. Each task lists acceptance criteria and references.

---

## MCP-01 — PDFs (Programas/Designações)

- [x] 1.1 Conectar Exportar PDF em Designações (cards e ações rápidas)
  - Affected: src/pages/Designacoes.tsx, src/utils/pdfGenerator.ts
  - Acceptance: Botões exportam PDF com as designações do programa selecionado e pela ação rápida (programa mais recente com designações).

- [x] 1.2 Melhorar legibilidade do PDF de designações
  - Affected: src/utils/pdfGenerator.ts
  - Changes: Cabeçalho tipo tabela (PARTE/SEÇÃO, TÍTULO, TEMPO); separadores de seção (Abertura, Tesouros, Ministério, Vida Cristã, Encerramento); blocos compactos por parte.
  - Acceptance: PDF mais fácil de ler, com seções e colunas básicas, mantendo quebras de página e rodapé.

- [~] 1.3 Ajustar layout para o modelo oficial
  - Add: cânticos, orações, comentários de abertura/encerramento, formatação dos horários (ex.: 7.00–7.05), tipografia mais fiel.
  - Acceptance: Estrutura visual espelha o modelo fornecido; mantém compatibilidade com dados atuais.

- [ ] 1.4 Aprimorar generateProgramPDF (programa semanal)
  - Add: seções, tempos e cabeçalhos equivalentes; fallback quando partes não disponíveis.
  - Acceptance: Programa semanal também exportável com layout coerente.

---

## MCP-02 — Banco Local e Leitura Offline (Local-First)

- [x] 2.1 IndexedDB: schema inicial + helpers
  - Affected: src/utils/offlineLocalDB.ts
  - Stores: estudantes, programas, designacoes, outbox, cursors
  - Exposed: window.offlineDB.download(), window.offlineDB.list(), window.offlineDB.sync()
  - Acceptance: Download popula o cache local; leitura programática disponível.

- [x] 2.2 UI para iniciar cache offline
  - Affected: src/pages/Designacoes.tsx
  - Add: botão "Baixar Dados Offline" com toasts de sucesso/falha.
  - Acceptance: Disparo do seeding via UI com feedback.

- [x] 2.3 Local-first (fase 1)
  - Affected: src/utils/dataLoaders.ts
  - Implemented: fallback para IndexedDB quando falhar supabase
    - carregarEstudantesAtivos (OK)
    - carregarHistoricoDesignacoes (reconstrução via designacoes + programas) (OK)
  - Acceptance: Sem internet, estudantes/histórico são lidos do cache.

- [x] 2.4 Local-first (fase 2)
  - Scope: Programas + Designações nas telas que ainda consultam supabase diretamente.
  - Acceptance: Telas principais continuam funcionais offline com dados previamente baixados.

- [ ] 2.5 UI de status e pendências
  - Add: Banner Online/Offline (navigator.onLine); contador de pendências (outbox).
  - Acceptance: Usuário vê o estado da conexão e itens pendentes.

---

## MCP-03 — Sincronização (Automática + Manual)

- [ ] 3.1 Outbox: engine de operações locais
  - Implementar push das alterações (upsert/delete) com controle de estado (pending/synced/failed) no store outbox.
  - Acceptance: Alterações locais são persistidas e posteriormente enviadas.

- [ ] 3.2 Delta download (updated_at > cursor)
  - Utilize cursors por entidade para baixar apenas mudanças.
  - Acceptance: Download incremental eficiente e idempotente.

- [ ] 3.3 Auto-sync + Sync manual
  - Auto-sync quando voltar online; botão "Sincronizar alterações" força execução.
  - Flags: VITE_SYNC_MANUAL_ONLY (para cenários específicos).
  - Acceptance: Sincronização funciona em background e sob demanda.

- [ ] 3.4 Resolução de conflitos (revision)
  - Estratégia: revision + updated_at; UI simples de resolução.
  - Acceptance: Conflitos detectados e resolvidos de forma previsível.

---

## MCP-05 — Metadados e RLS (Aderência à Arquitetura)

- [~] 5.1 Metadados e triggers
  - Add (estudantes, programas, designacoes): updated_at TIMESTAMPTZ NOT NULL DEFAULT now(), revision BIGINT NOT NULL DEFAULT 0, last_modified_by UUID NULL, deleted_at TIMESTAMPTZ NULL.
  - Triggers BEFORE UPDATE: bump revision, set updated_at/last_modified_by.
  - Acceptance: Banco pronto para delta e resolução de conflitos.

- [x] 5.2 RLS — estudantes (owner-only)
  - Affected: src/utils/applyEstudantesRLS.ts (políticas adicionadas anteriormente)
  - Acceptance: Somente owner acessa seus estudantes; confirmado em código.

- [~] 5.3 RLS — programas/designações
  - Instrutor: acesso por congregação (programas/designações da congregação e somente leitura/escrita conforme papel).
  - Estudante: apenas suas designações.
  - Admin: acesso global.
  - Acceptance: Acesso alinhado ao docs/SISTEMA-UNIFICADO.md.

---

## MCP-06 — PWA (Refinamento)

- [ ] 6.1 runtimeCaching e update UX
  - Ajustar vite-plugin-pwa/workbox runtimeCaching para assets críticos (fonts/CDNs) e mensagens de update.
  - Acceptance: Cache efetivo; aviso de nova versão.

- [ ] 6.2 Fallback de rotas offline
  - Garantir navegação básica offline para rotas visitadas; revisar sw-register e SW.
  - Acceptance: Usuário consegue navegar a telas já abertas sem erro.

---

## MCP-07 — QA e Testes

- [ ] 7.1 E2E — PDFs
  - Gerar e validar presença de campos/seções esperadas.
  - Acceptance: Testes Cypress passam consistentemente.

- [ ] 7.2 E2E — Offline local-first
  - Simular offline e confirmar leitura por IndexedDB nas telas principais.
  - Acceptance: Fluxos críticos funcionam sem rede após seeding.

- [ ] 7.3 E2E — Sincronização
  - Criar/editar offline → voltar online → sincronizar; validar no backend.
  - Acceptance: Outbox processado e delta aplicado.

---

## Operacional / Suporte

- [ ] O.1 Corrigir dev:all no host local
  - Run: npm install; depois npm run dev:all; alternativa: dois terminais (dev:backend-only e dev:frontend-only).
  - Acceptance: Ambos servidores sobem via script unificado.

- [ ] O.2 Segurança de credenciais
  - Revisar .env e rotacionar chaves sensíveis antes de produção; ocultar logs.
  - Acceptance: Sem chaves sensíveis expostas em repositório/logs públicos.

---

## Como usar (rápido)

- PDFs:
  - /designacoes → Exportar PDF (card ou ações rápidas).
- Offline:
  - /designacoes → Baixar Dados Offline → depois use DevTools → Offline.
  - Console:
    - await window.offlineDB.download()
    - await window.offlineDB.list('estudantes'|'programas'|'designacoes')
- Local-first (implementado):
  - carregarEstudantesAtivos / carregarHistoricoDesignacoes já usam fallback offline.

---

## Referências
- docs/SISTEMA-UNIFICADO.md (arquitetura, papéis, RLS, Offline/Sync)
- src/utils/pdfGenerator.ts
- src/pages/Designacoes.tsx
- src/utils/offlineLocalDB.ts
- src/utils/dataLoaders.ts
- src/utils/applyEstudantesRLS.ts
- src/utils/applyProgramsDesignacoesRLS.tsão (Automática + Manual)

- [ ] 3.1 Outbox: engine de operações locais
  - Implementar push das alterações (upsert/delete) com controle de estado (pending/synced/failed) no store outbox.
  - Acceptance: Alterações locais são persistidas e posteriormente enviadas.

- [ ] 3.2 Delta download (updated_at > cursor)
  - Utilize cursors por entidade para baixar apenas mudanças.
  - Acceptance: Download incremental eficiente e idempotente.

- [ ] 3.3 Auto-sync + Sync manual
  - Auto-sync quando voltar online; botão "Sincronizar alterações" força execução.
  - Flags: VITE_SYNC_MANUAL_ONLY (para cenários específicos).
  - Acceptance: Sincronização funciona em background e sob demanda.

- [ ] 3.4 Resolução de conflitos (revision)
  - Estratégia: revision + updated_at; UI simples de resolução.
  - Acceptance: Conflitos detectados e resolvidos de forma previsível.

---

## MCP-05 — Metadados e RLS (Aderência à Arquitetura)

- [~] 5.1 Metadados e triggers
  - Add (estudantes, programas, designacoes): updated_at TIMESTAMPTZ NOT NULL DEFAULT now(), revision BIGINT NOT NULL DEFAULT 0, last_modified_by UUID NULL, deleted_at TIMESTAMPTZ NULL.
  - Triggers BEFORE UPDATE: bump revision, set updated_at/last_modified_by.
  - Acceptance: Banco pronto para delta e resolução de conflitos.

- [x] 5.2 RLS — estudantes (owner-only)
  - Affected: src/utils/applyEstudantesRLS.ts (políticas adicionadas anteriormente)
  - Acceptance: Somente owner acessa seus estudantes; confirmado em código.

- [~] 5.3 RLS — programas/designações
  - Instrutor: acesso por congregação (programas/designações da congregação e somente leitura/escrita conforme papel).
  - Estudante: apenas suas designações.
  - Admin: acesso global.
  - Acceptance: Acesso alinhado ao docs/SISTEMA-UNIFICADO.md.

---

## MCP-06 — PWA (Refinamento)

- [ ] 6.1 runtimeCaching e update UX
  - Ajustar vite-plugin-pwa/workbox runtimeCaching para assets críticos (fonts/CDNs) e mensagens de update.
  - Acceptance: Cache efetivo; aviso de nova versão.

- [ ] 6.2 Fallback de rotas offline
  - Garantir navegação básica offline para rotas visitadas; revisar sw-register e SW.
  - Acceptance: Usuário consegue navegar a telas já abertas sem erro.

---

## MCP-07 — QA e Testes

- [ ] 7.1 E2E — PDFs
  - Gerar e validar presença de campos/seções esperadas.
  - Acceptance: Testes Cypress passam consistentemente.

- [ ] 7.2 E2E — Offline local-first
  - Simular offline e confirmar leitura por IndexedDB nas telas principais.
  - Acceptance: Fluxos críticos funcionam sem rede após seeding.

- [ ] 7.3 E2E — Sincronização
  - Criar/editar offline → voltar online → sincronizar; validar no backend.
  - Acceptance: Outbox processado e delta aplicado.

---

## Operacional / Suporte

- [ ] O.1 Corrigir dev:all no host local
  - Run: npm install; depois npm run dev:all; alternativa: dois terminais (dev:backend-only e dev:frontend-only).
  - Acceptance: Ambos servidores sobem via script unificado.

- [ ] O.2 Segurança de credenciais
  - Revisar .env e rotacionar chaves sensíveis antes de produção; ocultar logs.
  - Acceptance: Sem chaves sensíveis expostas em repositório/logs públicos.

---

## Como usar (rápido)

- PDFs:
  - /designacoes → Exportar PDF (card ou ações rápidas).
- Offline:
  - /designacoes → Baixar Dados Offline → depois use DevTools → Offline.
  - Console:
    - await window.offlineDB.download()
    - await window.offlineDB.list('estudantes'|'programas'|'designacoes')
- Local-first (implementado):
  - carregarEstudantesAtivos / carregarHistoricoDesignacoes já usam fallback offline.

---

## Referências
- docs/SISTEMA-UNIFICADO.md (arquitetura, papéis, RLS, Offline/Sync)
- src/utils/pdfGenerator.ts
- src/pages/Designacoes.tsx
- src/utils/offlineLocalDB.ts
- src/utils/dataLoaders.ts
- src/utils/applyEstudantesRLS.ts
- src/utils/applyProgramsDesignacoesRLS.ts

# Execution Tasks Tracker — Sistema Ministerial

Legend:
- [x] Done
- [~] In progress
- [ ] Pending

Source of truth for goals: docs/SISTEMA-UNIFICADO.md (Admin/Instrutor/Estudante, RLS, Offline, Sync, PDFs)

This tracker is updated as work progresses. Each task lists acceptance criteria and references.

---

## MCP-01 — PDFs (Programas/Designações)

- [x] 1.1 Conectar Exportar PDF em Designações (cards e ações rápidas)
  - Affected: src/pages/Designacoes.tsx, src/utils/pdfGenerator.ts
  - Acceptance: Botões exportam PDF com as designações do programa selecionado e pela ação rápida (programa mais recente com designações).

- [x] 1.2 Melhorar legibilidade do PDF de designações
  - Affected: src/utils/pdfGenerator.ts
  - Changes: Cabeçalho tipo tabela (PARTE/SEÇÃO, TÍTULO, TEMPO); separadores de seção (Abertura, Tesouros, Ministério, Vida Cristã, Encerramento); blocos compactos por parte.
  - Acceptance: PDF mais fácil de ler, com seções e colunas básicas, mantendo quebras de página e rodapé.

- [~] 1.3 Ajustar layout para o modelo oficial
  - Add: cânticos, orações, comentários de abertura/encerramento, formatação dos horários (ex.: 7.00–7.05), tipografia mais fiel.
  - Acceptance: Estrutura visual espelha o modelo fornecido; mantém compatibilidade com dados atuais.

- [ ] 1.4 Aprimorar generateProgramPDF (programa semanal)
  - Add: seções, tempos e cabeçalhos equivalentes; fallback quando partes não disponíveis.
  - Acceptance: Programa semanal também exportável com layout coerente.

---

## MCP-02 — Banco Local e Leitura Offline (Local-First)

- [x] 2.1 IndexedDB: schema inicial + helpers
  - Affected: src/utils/offlineLocalDB.ts
  - Stores: estudantes, programas, designacoes, outbox, cursors
  - Exposed: window.offlineDB.download(), window.offlineDB.list(), window.offlineDB.sync()
  - Acceptance: Download popula o cache local; leitura programática disponível.

- [x] 2.2 UI para iniciar cache offline
  - Affected: src/pages/Designacoes.tsx
  - Add: botão "Baixar Dados Offline" com toasts de sucesso/falha.
  - Acceptance: Disparo do seeding via UI com feedback.

- [x] 2.3 Local-first (fase 1)
  - Affected: src/utils/dataLoaders.ts
  - Implemented: fallback para IndexedDB quando falhar supabase
    - carregarEstudantesAtivos (OK)
    - carregarHistoricoDesignacoes (reconstrução via designacoes + programas) (OK)
  - Acceptance: Sem internet, estudantes/histórico são lidos do cache.

- [x] 2.4 Local-first (fase 2)
  - Scope: Programas + Designações nas telas que ainda consultam supabase diretamente.
  - Acceptance: Telas principais continuam funcionais offline com dados previamente baixados.

- [ ] 2.5 UI de status e pendências
  - Add: Banner Online/Offline (navigator.onLine); contador de pendências (outbox).
  - Acceptance: Usuário vê o estado da conexão e itens pendentes.

---

## MCP-03 — Sincronização (Automática + Manual)

- [ ] 3.1 Outbox: engine de operações locais
  - Implementar push das alterações (upsert/delete) com controle de estado (pending/synced/failed) no store outbox.
  - Acceptance: Alterações locais são persistidas e posteriormente enviadas.

- [ ] 3.2 Delta download (updated_at > cursor)
  - Utilize cursors por entidade para baixar apenas mudanças.
  - Acceptance: Download incremental eficiente e idempotente.

- [ ] 3.3 Auto-sync + Sync manual
  - Auto-sync quando voltar online; botão "Sincronizar alterações" força execução.
  - Flags: VITE_SYNC_MANUAL_ONLY (para cenários específicos).
  - Acceptance: Sincronização funciona em background e sob demanda.

- [ ] 3.4 Resolução de conflitos (revision)
  - Estratégia: revision + updated_at; UI simples de resolução.
  - Acceptance: Conflitos detectados e resolvidos de forma previsível.

---

## MCP-04 — Performance (Lighthouse / Carregamento)

- [~] 4.1 Compactação de texto (Brotli/Gzip)
  - Build: vite-plugin-compression2; Server: servir .br/.gz quando disponíveis.
  - Acceptance: Payload de texto comprimido; rede total (primeira visita) <= 1.5–2.5 MB comprimido.

- [~] 4.2 Divisão de vendors + lazy-load de PDF/planilhas
  - manualChunks (react-vendor, supabase-vendor, pdf-vendor, xlsx-vendor, icons-vendor); import() para pdf/xlsx.
  - Acceptance: Bibliotecas pesadas só baixam sob demanda; redução > 500KB do JS inicial.

- [ ] 4.3 Remover bloqueadores de BFCache
  - Trocar unload/beforeunload por pagehide/visibilitychange; evitar limpeza síncrona em navegação.
  - Acceptance: Navegações de voltar/avançar restauram instantaneamente (bfCache hit).

- [ ] 4.4 Split por rota (React.lazy/Suspense) para páginas pesadas
  - Acceptance: Rota inicial não carrega gráficos/editores até uso.

- [ ] 4.5 Relatório de bundle (rollup-plugin-visualizer/source-map-explorer)
  - Encontrar duplicatas (ex.: date-fns locales, lucide-react).
  - Acceptance: Nenhum vendor único > 800KB; locais desnecessários removidos.

- [ ] 4.6 Fontes e imagens
  - WOFF2 self-host; font-display: swap; WebP/AVIF para imagens grandes.
  - Acceptance: Sem bloqueio de renderização por fontes; imagens críticas otimizadas.

- [ ] 4.7 Lighthouse CI (mobile, slow 4G)
  - Adicionar workflow no CI.
  - Acceptance: Score 85–95; FCP < 4.5s, LCP < 7s, TBT < 150ms, CLS ~ 0.0.

---

## MCP-05 — Metadados e RLS (Aderência à Arquitetura)

- [~] 5.1 Metadados e triggers
  - Add (estudantes, programas, designacoes): updated_at TIMESTAMPTZ NOT NULL DEFAULT now(), revision BIGINT NOT NULL DEFAULT 0, last_modified_by UUID NULL, deleted_at TIMESTAMPTZ NULL.
  - Triggers BEFORE UPDATE: bump revision, set updated_at/last_modified_by.
  - Acceptance: Banco pronto para delta e resolução de conflitos.

- [x] 5.2 RLS — estudantes (owner-only)
  - Affected: src/utils/applyEstudantesRLS.ts (políticas adicionadas anteriormente)
  - Acceptance: Somente owner acessa seus estudantes; confirmado em código.

- [~] 5.3 RLS — programas/designações
  - Instrutor: acesso por congregação (programas/designações da congregação e somente leitura/escrita conforme papel).
  - Estudante: apenas suas designações.
  - Admin: acesso global.
  - Acceptance: Acesso alinhado ao docs/SISTEMA-UNIFICADO.md.

---

## MCP-06 — PWA (Refinamento)

- [ ] 6.1 runtimeCaching e update UX
  - Ajustar vite-plugin-pwa/workbox runtimeCaching para assets críticos (fonts/CDNs) e mensagens de update.
  - Acceptance: Cache efetivo; aviso de nova versão.

- [ ] 6.2 Fallback de rotas offline
  - Garantir navegação básica offline para rotas visitadas; revisar sw-register e SW.
  - Acceptance: Usuário consegue navegar a telas já abertas sem erro.

---

## MCP-07 — QA e Testes

- [ ] 7.1 E2E — PDFs
  - Gerar e validar presença de campos/seções esperadas.
  - Acceptance: Testes Cypress passam consistentemente.

- [ ] 7.2 E2E — Offline local-first
  - Simular offline e confirmar leitura por IndexedDB nas telas principais.
  - Acceptance: Fluxos críticos funcionam sem rede após seeding.

- [ ] 7.3 E2E — Sincronização
  - Criar/editar offline → voltar online → sincronizar; validar no backend.
  - Acceptance: Outbox processado e delta aplicado.

---

## Operacional / Suporte

- [ ] O.1 Corrigir dev:all no host local
  - Run: npm install; depois npm run dev:all; alternativa: dois terminais (dev:backend-only e dev:frontend-only).
  - Acceptance: Ambos servidores sobem via script unificado.

- [ ] O.2 Segurança de credenciais
  - Revisar .env e rotacionar chaves sensíveis antes de produção; ocultar logs.
  - Acceptance: Sem chaves sensíveis expostas em repositório/logs públicos.

- [~] O.3 Bug: F5 → tela em branco na rota protegida
  - Causa: múltiplas instâncias do SupabaseClient + bloqueio em perfil/permissões.
  - Fix: singleton getSupabase(); AuthContext idempotente e não bloqueante; ProtectedRoute libera após sessão; guard para React StrictMode.
  - Acceptance: Sem aviso "Multiple GoTrueClient instances detected..."; com sessão válida, após F5 o conteúdo renderiza em <= 1s.

- [ ] O.4 Supabase 404 (HEAD /rest/v1/congregacoes?select=id)
  - Causa provável: tabela public.congregacoes ausente no projeto ou em schema diferente; uso de HEAD implícito (count/head) dispara 404 se relation não existe.
  - Fix:
    - Aplicar migration de criação da tabela (ver docs/OPERACIONAL_SUPABASE_404_FIX.md).
    - Se usar outro schema: ajustar client com supabase.schema('<schema>').from('congregacoes').
    - Evitar head quando desnecessário: .select('id', { head: false }).
  - Acceptance: GET/SELECT em congregacoes retorna 200; sem 404 em HEAD.

---

## Como usar (rápido)

- PDFs:
  - /designacoes → Exportar PDF (card ou ações rápidas).
- Offline:
  - /designacoes → Baixar Dados Offline → depois use DevTools → Offline.
  - Console:
    - await window.offlineDB.download()
    - await window.offlineDB.list('estudantes'|'programas'|'designacoes')
- Local-first (implementado):
  - carregarEstudantesAtivos / carregarHistoricoDesignacoes já usam fallback offline.

---

## Referências
- docs/SISTEMA-UNIFICADO.md (arquitetura, papéis, RLS, Offline/Sync)
- docs/MULTI_MONTH_DASHBOARD_PLAN.md
- docs/OPERACIONAL_SUPABASE_404_FIX.md
- src/utils/pdfGenerator.ts
- src/pages/Designacoes.tsx
- src/utils/offlineLocalDB.ts
- src/utils/dataLoaders.ts
- src/utils/applyEstudantesRLS.ts
- src/utils/applyProgramsDesignacoesRLS.ts# Multi-Month Dashboard Plan (Admin/Instrutor) — Official MWB/JWPub

Fontes oficiais no repositório:
- docs/Oficial/mwb_E_202507.pdf — Julho 2025
- docs/Oficial/mwb_E_202509.pdf — Setembro 2025
- docs/Oficial/mwb_E_202511.pdf — Novembro 2025
- docs/Oficial/mwb_T_202509.jwpub — Setembro 2025 (PT)
- docs/Oficial/mwb_T_202511.jwpub — Novembro 2025 (PT)
- docs/Oficial/S-38_E.rtf — Modelo oficial S-38 (estrutura das partes)
- docs/Oficial/estudantes_ficticios.xlsx, docs/Oficial/estudantes_rows.sql — base de estudantes fictícios

Objetivo:
- Admin e Instrutor devem navegar por vários meses (ex.: 2025-07, 2025-09, 2025-11), cada um com suas semanas e seções oficiais (S-38).
- Admin define somente a programação oficial (sem nomes).
- Instrutor vê a mesma programação e adiciona designações locais.

Navegação (UI/Rotas):
- Admin: /admin?month=YYYY-MM&lang=E|T|PT|EN
  - Abas/páginas por mês (Julho, Setembro, Novembro 2025).
  - Cards por semana com seções: Abertura, Tesouros, Ministério, Vida Cristã, Encerramento.
  - Ações: Preview/Exportar PDF (Programa).
- Instrutor: /programas?month=YYYY-MM e /designacoes?month=YYYY-MM
  - Mesmos meses/semanas do Admin + selects/dropdowns para designar estudantes locais.
  - Ações: Salvar, Exportar PDF (Semana/Mês).
- Estudante: /estudante/:id
  - Mostra somente designações futuras e histórico; botão para baixar PDF.

API (Backend):
- GET /api/programs?month=2025-09&lang=E → semanas oficiais do mês.
- GET /api/programs/:id → dados detalhados da semana oficial.
- GET /api/designacoes?month=2025-09 → designações locais (RLS por congregação).
- POST /api/designacoes → salvar/atualizar designações locais.

Backend (Parsing oficial):
- backend/services/programGenerator.js
  - Parsear PDF/JWPub/RTF de docs/Oficial → ProgramWeek[] por mês.
  - Normalizar: tempos (min), cânticos (opening/middle/closing), títulos, instruções, escrituras.
  - Persistir ou servir on-demand via routes/programs.js.
- backend/routes/programs.js
  - Filtrar por month=YYYY-MM, lang=E|T|PT|EN.

Modelo de dados:
- ProgramWeek
  - id, lang ('E'|'T'|'PT'|'EN'), month ('YYYY-MM'), weekStart (ISO), weekEnd (ISO)
  - sections:
    - abertura: { cantoInicial: string; comentario?: string; oracaoInicial: boolean }
    - tesouros: Array<{ tipo: 'discurso'|'joias'|'leitura'; titulo?: string; referencias?: string; tempoMin: number; notas?: string }>
    - ministerio: Array<{ tipo: 'inicio'|'cultivar'|'fazer'|'discurso'|'demonstracao'; titulo?: string; instrucao?: string; tempoMin: number }>
    - vida: Array<{ tipo: 'inicio'|'estudo'; titulo?: string; tempoMin: number; referencias?: string }>
    - encerramento: { cantoFinal: string; oracaoFinal: boolean }
- Assignment
  - weekId: string
  - partKey: string (ex.: "ministerio.inicio.1")
  - studentId: string
  - assistantId?: string
  - notes?: string

Aceitação (multi-mês):
1) Admin vê meses 2025-07, 2025-09, 2025-11 em abas, com semanas e seções sem nomes.
2) Instrutor vê a mesma grade + selects para designar estudantes (somente de sua congregação).
3) Estudante vê somente suas próximas designações e histórico.
4) Exportar PDF por semana e mês (seções e tempos, cabeçalho/rodapé, quebra por semana).
5) Dados seguem S-38 (Abertura, Tesouros, Ministério, Vida, Encerramento).
6) Navegação entre meses funciona mesmo offline (com cache local previamente baixado).

Regras/Dicas para designações (Instrutor):
- Evitar repetições consecutivas; alternar sexo/idade onde aplicável.
- Leitura da Bíblia: preferir habilitados; demonstracao pode requerer ajudante.
- Estudo bíblico/necessidades locais: preferir ancião/SM (configurável).

PDFs:
- src/utils/pdfGenerator.ts deve gerar:
  - Designações: tabela com Parte/Seção, Título, Tempo, Aluno(s), Observações; cabeçalhos; rodapé; quebra por semana.
  - Programa: conteúdo oficial (sem nomes) com cânticos e orações.

Testes (Cypress):
- /admin?month=2025-09 → semanas de setembro visíveis, sem selects.
- /designacoes?month=2025-11 → semanas visíveis, selects funcionam, salvar OK.
- /estudante/:id → somente suas partes futuras.
- Exportar PDF (Semana/Mês) → arquivos com seções corretas.
- Offline: após Baixar Dados Offline, navegar com DevTools Offline.

Observações:
- Reutilizar docs/Oficial/S-38_E.rtf para mapear as seções.
- Não misturar dados oficiais com designações locais na mesma tabela.
- Usar RLS por congregação e papel (admin, instrutor, estudante).# Operacional — Supabase 404 (HEAD /congregacoes) Fix

Sintoma:
- 404 (Not Found) em HEAD https://<project>.supabase.co/rest/v1/congregacoes?select=id
- Normalmente indica que a relation public.congregacoes não existe (ou está em outro schema).

Correção (SQL — criar tabela, índices e RLS):

```sql
-- Ensure pgcrypto for gen_random_uuid()
create extension if not exists pgcrypto;

-- Table: public.congregacoes
create table if not exists public.congregacoes (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  nome text not null,
  ativa boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid references auth.users(id),
  last_modified_by uuid references auth.users(id)
);

-- Updated_at trigger
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists set_updated_at_congregacoes on public.congregacoes;
create trigger set_updated_at_congregacoes
before update on public.congregacoes
for each row execute function public.set_updated_at();

-- RLS
alter table public.congregacoes enable row level security;

drop policy if exists "admins all on congregacoes" on public.congregacoes;
create policy "admins all on congregacoes"
on public.congregacoes
for all
using ( auth.jwt() ->> 'role' = 'admin' )
with check ( auth.jwt() ->> 'role' = 'admin' );

drop policy if exists "authenticated read active congregacoes" on public.congregacoes;
create policy "authenticated read active congregacoes"
on public.congregacoes
for select
to authenticated
using ( ativa = true );

-- Indexes
create index if not exists idx_congregacoes_slug on public.congregacoes (slug);
create index if not exists idx_congregacoes_ativa on public.congregacoes (ativa);Para aplicar no repositório:
- git add docs/EXECUTION_TASKS_TRACKER.md docs/MULTI_MONTH_DASHBOARD_PLAN.md docs/OPERACIONAL_SUPABASE_404_FIX.md
- git commit -m "docs: consolidate execution tracker; add multi-month plan and Supabase 404 fix"
- git push

Quer que eu também gere um PR template e issues automáticas a partir do tracker?Para aplicar no repositório:
- git add docs/EXECUTION_TASKS_TRACKER.md docs/MULTI_MONTH_DASHBOARD_PLAN.md docs/OPERACIONAL_SUPABASE_404_FIX.md
- git commit -m "docs: consolidate execution tracker; add multi-month plan and Supabase 404 fix"
- git push

Quer que eu também gere um PR template e issues automáticas a partir do tracker?
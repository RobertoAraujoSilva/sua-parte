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

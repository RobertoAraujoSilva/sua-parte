Sistema Ministerial — Auditoria & Implantação
=============================================

Guia objetivo para o programador **auditar o repositório** `sua-parte`, marcar o que já está pronto, **abrir issues/PRs** e **iniciar a implementação** do que faltar. No final há melhorias rápidas de UX para simplificar as 10 primeiras telas.

* * *

TL;DR (fluxo rápido)
--------------------

1.  **Preparar ambiente** → rodar lint/typecheck/build.
    
2.  **Auditoria automática** → gerar `audit/STATUS_IMPL_PLAN.md`.
    
3.  **Atualizar o plano** → marcar `[x]`, anexar evidências, abrir issues.
    
4.  **Executar por prioridade**: RLS (1.4) → Exportar PDF (5.3) → Estudantes (2.4) → Designações (2.6) → Regras/Validação (3.1/3.2) → Testes/CI (3.4/9.x) → Dashboard (2.3).
    
5.  **PRs pequenos e focados**, cada um fechando 1 item do plano com DoD claro.
    

* * *

1) Preparar ambiente
--------------------

    # Na raiz do repo
    git checkout -b chore/auditoria-plano
    node -v && npm -v
    npm ci
    
    # verificação
    npm run typecheck || tsc -p tsconfig.json
    npm run lint || eslint .
    npm run build
    

Se algum script não existir, ajuste o `package.json`:

    "scripts": {
      "dev": "vite",
      "build": "vite build",
      "preview": "vite preview",
      "lint": "eslint . --ext .ts,.tsx",
      "typecheck": "tsc -p tsconfig.json",
      "cypress:open": "cypress open"
    }
    

* * *

2) Auditoria automática (gera um relatório em Markdown)
-------------------------------------------------------

1.  Instale a dependência:
    

    npm i -D fast-glob
    

2.  Crie `scripts/auditar-plano.mjs` **(usar extensão .mjs ou** `"type":"module"`**)**:
    

    // scripts/auditar-plano.mjs
    // Auditor simples por heurística: verifica existência de arquivos/trechos
    // e indica "feito" (true) ou "pendente" (false). Ajuste os checks conforme evoluir.
    
    import fs from "fs";
    import path from "path";
    import fg from "fast-glob";
    import { fileURLToPath } from "url";
    
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);
    const root = path.resolve(__dirname, "..");
    
    const has = (p) => fs.existsSync(path.join(root, p));
    const grep = (globs, pattern) => {
      const files = fg.sync(globs, { cwd: root, dot: true, absolute: true });
      const rx = new RegExp(pattern, "i");
      return files.some(f => {
        try { return rx.test(fs.readFileSync(f, "utf8")); }
        catch { return false; }
      });
    };
    
    const checks = [
      // --- 1. Database Schema Modernization ---
      { id: "1.1", name: "Migrações aprimoradas", pass:
        has("APPLY_THIS_SQL.sql") || fg.sync("supabase/migrations/**/*.sql", {cwd:root}).length>0 },
      { id: "1.2", name: "Backfill + FamilyInferenceEngine", pass:
        grep(["src/**/**"], "FamilyInferenceEngine") && grep(["src/**/**"], "migration|backfill") },
      { id: "1.3", name: "Tipos TS (EstudanteEnhanced, enums)", pass:
        grep(["src/types/**","src/**/**.ts"], "EstudanteEnhanced|EstadoCivil|PapelFamiliar|RelacaoFamiliar") },
      { id: "1.4", name: "RLS atualizada p/ novo schema", pass:
        grep(["supabase/**/**.sql"], "policy|enable row level security") },
    
      // --- 2. Pages & Fluxos ---
      { id: "2.1", name: "Landing otimizada/SEO/PWA", pass:
        has("index.html") && (has("public/manifest.json") || has("public/site.webmanifest")) },
      { id: "2.2", name: "Autenticação + RBAC", pass:
        grep(["src/**/**"], "ProtectedRoute|role|RBAC") },
      { id: "2.3", name: "Dashboard avançado", pass:
        has("src/pages/Dashboard.tsx") && grep(["src/pages/Dashboard.tsx","src/components/**"], "widget|stats|websocket|realtime") },
      { id: "2.4", name: "Gestão de Estudantes avançada", pass:
        has("src/pages/Estudantes.tsx") && grep(["src/components/**"], "virtual|react-window|filter|Family") },
      { id: "2.5", name: "Gestão de Programas com parsing", pass:
        has("src/pages/Programas.tsx") && (grep(["src/components/**"], "PdfUpload|PdfParsing|JWContentParser") || has("test-jw-parser.js")) },
      { id: "2.6", name: "Designações (algoritmo + preview)", pass:
        has("src/pages/Designacoes.tsx") && grep(["src/components/**"], "Assignment(Generation|Preview|Status)") },
    
      // --- 3. Assignment Generation ---
      { id: "3.1", name: "Engine S-38-T reforçada", pass:
        grep(["src/utils/**"], "regrasS38T") && grep(["src/**"], "explain|justificativa|confidence") },
      { id: "3.2", name: "Validação familiar nova", pass:
        grep(["src/utils/**","src/components/**"], "validacaoFamiliar|family tree|visualiza") },
      { id: "3.3", name: "Balanceamento histórico", pass:
        grep(["src/utils/**"], "balanceamentoHistorico|fairness|peso") },
      { id: "3.4", name: "Testes abrangentes p/ designações", pass:
        grep(["cypress/**","src/**/__tests__/**"], "designa|assignment") },
    
      // --- 4. UX/UI ---
      { id: "4.1", name: "Responsividade e A11y", pass:
        grep(["src/**/**.tsx"], "aria-|role=") && has("src/components/ErrorBoundary.tsx") },
      { id: "4.2", name: "Loading progressivo (skeleton/offline)", pass:
        grep(["src/**/**.tsx"], "Skeleton|suspense") && (has("public/sw.js") || has("public/service-worker.js")) },
      { id: "4.3", name: "Tratamento de erros + toasts", pass:
        grep(["src/**/**.tsx"], "toast|error boundary|try\\s*\\{") },
      { id: "4.4", name: "Busca global/navegação avançada", pass:
        grep(["src/**/**.tsx"], "global search|command palette|Ctrl\\+K") },
    
      // --- 5. Import/Export ---
      { id: "5.1", name: "Import planilha robusto", pass:
        has("src/components/SpreadsheetUpload.tsx") && grep(["src/components/**"], "mapeamento|duplicado|preview") },
      { id: "5.2", name: "PDF/content processing", pass:
        grep(["src/components/**","src/utils/**"], "Pdf|parse.*pdf") },
      { id: "5.3", name: "Export avançado (PDF/XLSX)", pass:
        grep(["src/**"], "export.*(pdf|xlsx)") },
      { id: "5.4", name: "Operações em lote", pass:
        grep(["src/**"], "bulk|lote|batch") },
    
      // --- 6. Performance ---
      { id: "6.1", name: "Perf frontend (memo/virtual/cache)", pass:
        grep(["src/**/**.tsx"], "React\\.memo|useMemo|virtual") },
      { id: "6.2", name: "Índices/queries otimizadas", pass:
        grep(["supabase/**/**.sql"], "index|explain") },
      { id: "6.3", name: "Cache/queues", pass:
        grep(["src/**","supabase/**"], "Redis|queue|job") },
      { id: "6.4", name: "Monitoring/alertas", pass:
        grep(["src/**"], "Sentry|PostHog|monitor") },
    
      // --- 7. Segurança ---
      { id: "7.1", name: "MFA/RBAC/auditoria", pass:
        grep(["src/**"], "MFA|2FA|audit log|role") },
      { id: "7.2", name: "Proteção de dados", pass:
        grep(["supabase/**/**.sql","src/**"], "encrypt|mask|retention") },
      { id: "7.3", name: "Segurança de API", pass:
        grep(["src/**"], "rate limit|JWT|CORS|helmet") },
      { id: "7.4", name: "Conformidade/audit", pass:
        grep(["src/**","docs/**"], "compliance|auditoria") },
    
      // --- 8. Integrações ---
      { id: "8.1", name: "REST API + OpenAPI", pass:
        grep(["src/**"], "OpenAPI|swagger|/api/") },
      { id: "8.2", name: "Integrações externas", pass:
        grep(["src/**"], "Calendar|Webhook|email") },
      { id: "8.3", name: "Retry/backoff/circuit breaker", pass:
        grep(["src/**"], "backoff|circuit breaker|timeout") },
      { id: "8.4", name: "Monitoring API", pass:
        grep(["src/**"], "API health|usage analytics") },
    
      // --- 9. Testes & CI ---
      { id: "9.1", name: "Unit tests", pass:
        grep(["src/**/__tests__/**","src/**"], "describe\\(") },
      { id: "9.2", name: "E2E Cypress", pass:
        has("cypress.config.mjs") && fs.existsSync(path.join(root,"cypress")) },
      { id: "9.3", name: "CI/CD", pass:
        fs.existsSync(path.join(root,".github")) && grep([".github/**"], "actions|deploy") },
      { id: "9.4", name: "Qualidade/monitoramento", pass:
        grep(["eslint.config.js","src/**"], "eslint|prettier") },
    
      // --- 10. Documentação ---
      { id: "10.1", name: "Docs de usuário", pass:
        (fs.existsSync(path.join(root,"docs")) && grep(["docs/**","README.md"], "guia|tutorial")) },
      { id: "10.3", name: "Docs dev/API", pass:
        grep(["docs/**","README.md"], "API|arquitetura") },
      { id: "10.4", name: "Feedback/suporte", pass:
        grep(["src/**"], "feedback|suporte|help") },
    
      // --- 11. Gaps Críticos ---
      { id: "11.1", name: "UI de geração ligada ao engine", pass:
        grep(["src/components/**","src/pages/**"], "AssignmentGeneration.*regrasS38T") },
      { id: "11.2", name: "Form de estudante com família", pass:
        grep(["src/components/**"], "FamilyMember|Family.*List|EstudanteForm") },
      { id: "11.3", name: "Utils integrados ao UI", pass:
        grep(["src/components/**","src/utils/**"], "validacaoFamiliar|balanceamentoHistorico|regrasS38T") },
      { id: "11.5", name: "Páginas e routing", pass:
        has("src/pages/NotFound.tsx") && has("src/pages/Reunioes.tsx") && has("src/pages/Relatorios.tsx") },
    ];
    
    const rows = checks.map(c => `- [${c.pass ? "x" : " "}] ${c.id} ${c.name}`);
    const output = `# Auditoria do Plano\n\n${rows.join("\n")}\n`;
    fs.mkdirSync(path.join(root,"audit"), { recursive: true });
    fs.writeFileSync(path.join(root,"audit/STATUS_IMPL_PLAN.md"), output);
    console.log(output);
    

3.  Execute:
    

    node scripts/auditar-plano.mjs > audit/STATUS_IMPL_PLAN.md
    

> **Dica:** Se quiser estado “parcial”, adapte `pass` para retornar `"feito" | "parcial" | "pendente"` e renderize `[-]` para parcial.

* * *

3) Marcar no plano e abrir issues
---------------------------------

*   Atualize o arquivo do plano (ex.: `docs/IMPLEMENTATION_PLAN.md`) com o conteúdo de `audit/STATUS_IMPL_PLAN.md`.
    
*   Para cada tarefa:
    
    *   Marque `[x]` quando validado.
        
    *   Anexe **evidências** (commit/PR, arquivo, rota, screenshot).
        
    *   Linke o PR (ex.: `#123`).
        
*   Abra **Issues** para os itens pendentes (ex.: via GitHub CLI):
    

    gh issue create --title "1.4 RLS para novo schema" \
      --body "Implementar políticas de RLS em estudantes e family_links...\nDoD: policies testadas p/ admin, instrutor, aluno; docs/SECURITY_RLS.md" \
      --label "security,db,priority:high"
    

* * *

4) Execução por item (prioridades e DoD)
----------------------------------------

### 1.4 — **RLS para novo schema** (PRIORIDADE)

**Onde olhar:** `supabase/`, `APPLY_THIS_SQL.sql`.  
**Validar:** policies para `estudantes` e `family_links`; papéis `admin`, `instrutor`, `aluno` com `congregacao_id`.  
**MVP (SQL base):**

    -- estudantes
    alter table public.estudantes enable row level security;
    
    create policy select_estudantes_mesma_congregacao
    on public.estudantes for select
    to authenticated
    using (congregacao_id::text = coalesce(auth.jwt()->>'congregacao_id',''));
    
    create policy mod_admin_estudantes
    on public.estudantes for all
    to role_admin
    using (true) with check (true);
    
    -- family_links
    alter table public.family_links enable row level security;
    
    create policy select_links_da_mesma_congregacao
    on public.family_links for select
    to authenticated
    using (exists (
      select 1 from public.estudantes e
      where e.id = family_links.source_id
        and e.congregacao_id::text = coalesce(auth.jwt()->>'congregacao_id','')
    ));
    
    create policy upsert_links_instrutor
    on public.family_links for insert
    to role_instrutor
    with check (exists (
      select 1 from public.estudantes e
      where e.id = family_links.source_id
        and e.congregacao_id::text = coalesce(auth.jwt()->>'congregacao_id','')
    ));
    

**DoD:** Policies aplicadas e testadas com 3 papéis; documentação em `docs/SECURITY_RLS.md`.

* * *

### 2.3 — **Dashboard “Command Center”**

**Onde olhar:** `src/pages/Dashboard.tsx`, `src/components/AssignmentStatusCard.tsx`.  
**MVP:** `useRealtimeStats` (polling 30s) + widgets arrastáveis (dnd-kit) + atalhos (overlay `?`, `g d`, `g p`).  
**DoD:** 4 widgets dinâmicos + atalhos + indicador de saúde (fila PDF/designações).

* * *

### 2.4 — **Estudantes (alto volume)**

**Onde olhar:** `src/pages/Estudantes.tsx`, `src/components/students/*`, `EstudanteForm.tsx`.  
**MVP:** virtualização (`react-window`), filtros combinados (`useStudentFilters`), visão familiar (`FamilyGraph` com `reactflow`).  
**DoD:** lista fluida com 1k+ registros + filtros multi-critério + gráfico simples de vínculos.

* * *

### 2.5 — **Programas (processamento)**

**Onde olhar:** `Programas.tsx`, `PdfUpload.tsx`, `JWContentParser.tsx`.  
**MVP:** versionamento (`program_templates`/`program_versions`), preview de partes detectadas, cache via IndexedDB.  
**DoD:** fluxo upload → preview → salvar versão → processar; reprocessamento usa cache.

* * *

### 2.6 — **Designações (inteligência)**

**Onde olhar:** `AssignmentGenerationModal.tsx`, `AssignmentPreviewModal.tsx`, `src/utils/*`.  
**MVP:** detecção de conflitos em tempo real + **top-3** sugestões com score.  
**DoD:** preview exibe conflitos e aplica sugestões.

* * *

### 3.1 — **Engine S-38-T**

**MVP:** adaptar ao novo esquema familiar + “explicador de regra” (`code`, `message`, `explain()` por reprovação).  
**DoD:** relatório de regras pass/fail por designação.

* * *

### 3.2 — **Validação familiar**

**MVP:** detectar 1º/2º grau por `family_links` + **score de proximidade** (0–1) usado no emparelhamento (`canPair(a,b)`).  
**DoD:** API consumida pelo gerador; visual debug opcional.

* * *

### 3.3 — **Balanceamento histórico**

**MVP:** fairness por tipo de parte nos últimos _N_ meses + pesos configuráveis.  
**DoD:** retorna `fairnessScore` + logs no preview.

* * *

### 3.4 — **Testes para designações**

**MVP:** geradores de dados (novos/qualificados/família) + benchmark simples (100 gerações).  
**DoD:** `npm test` cobrindo >80% dos utils e **Cypress** cobrindo fluxo: importar PDF → gerar → aprovar.

* * *

### 4.x — **UX/A11y/Erros**

**MVP:** `<Skeleton />` em listas grandes; ARIA/teclado nas modais; mensagens amigáveis.  
**DoD:** Lighthouse A11y ≥ 90.

* * *

### 5.2 + 5.3 — **PDF/Export**

**MVP:** `@react-pdf/renderer` para 2 modelos: **Programa** e **Designações por Semana**.  
**DoD:** botão “Baixar PDF” funcional (estado _gerando_ + toast sucesso/erro) + teste e2e.

* * *

### 6.x — **Performance/DB**

**MVP:** `React.memo`/`useMemo` + virtualização em todas as listas; índices extras em `family_links(relacao, source_id, target_id)` e `estudantes(papel_familiar, menor)`.  
**DoD:** listas grandes suaves; consultas com `EXPLAIN` ok.

* * *

### 7.x — **Segurança**

**MVP:** MFA opcional (Supabase OTP/email), rate-limit no edge; checklist em `docs/SECURITY_CHECKLIST.md`.  
**DoD:** auditoria interna ok.

* * *

### 8.x — **API/Integrações**

**MVP:** `docs/api/openapi.yaml` (esqueleto) mesmo que só fronte; webhooks básicos.  
**DoD:** docs publicadas.

* * *

### 9.x — **CI/CD & Testes**

**MVP:** workflow `ci.yml` → `lint → typecheck → build → cypress`.  
**DoD:** PRs só mergeiam com CI verde.

* * *

### 10.x — **Documentação**

**MVP:** `docs/user/` (guias com screenshots) e `docs/dev/` (setup, scripts, convenções).  
**DoD:** links no menu **Suporte/Documentação**.

* * *

### 11.x — **Gaps críticos**

*   **11.1** UI de geração ligada ao engine (`assignmentGenerator.ts`) com aprovar/regenerar.
    
*   **11.2** `EstudanteForm`: `id_pai/id_mae/id_conjuge` + busca.
    
*   **11.4** Migrações completas (partes 1–12, FKs, gatilhos).
    
*   **11.5** Rotas: completar conteúdo de **Reuniões/Relatórios** ou ocultar até entregar.
    

* * *

5) Mapa rápido do repositório
-----------------------------

*   **Banco/RLS**: `APPLY_THIS_SQL.sql`, `supabase/migrations/**`, `supabase/**.sql`
    
*   **Engine/Utils**: `src/utils/regrasS38T.ts`, `validacaoFamiliar.ts`, `balanceamentoHistorico.ts`
    
*   **UI**: `src/pages/*.tsx`
    
*   **Componentes-chave**: `Assignment*Modal.tsx`, `PdfUpload.tsx`, `PdfParsingDemo.tsx`, `SpreadsheetUpload.tsx`, `EstudanteForm.tsx`, `Family*.*`, `ErrorBoundary.tsx`, `ProtectedRoute.tsx`
    
*   **Testes**: `cypress/**`, `test-*.js`
    
*   **Docs**: `docs/**`, `README.md`, `PROGRAMAS_SETUP.md`, `AUTH_TROUBLESHOOTING.md`
    
*   **Build/Qualidade**: `.github/**`, `eslint.config.js`, `tailwind.config.ts`
    

* * *

6) Fluxo de PRs
---------------

*   **1 item = 1 branch**: `feat/2-4-virtual-scroll-estudantes`
    
*   PR com:
    
    *   **Checklist DoD** do item
        
    *   **Screenshots** antes/depois
        
    *   **Como testar** (passos claros)
        
*   Ao mergear: atualizar `docs/IMPLEMENTATION_PLAN.md` e fechar a Issue.
    

* * *

7) Melhorias de UX para simplificar as 10 telas
-----------------------------------------------

1.  **Ação primária única e consistente**  
    Botão principal à direita no topo (ex.: _Gerar Designações_). Secundárias agrupadas em **“⋯”**.
    
2.  **Wizards para esconder complexidade**  
    Importar Programa em 4 passos: **Upload → Detectar → Revisar → Confirmar**. Avançado fica recolhido.
    
3.  **Remover toast vermelho fixo**  
    Trocar “Funcionalidade em Desenvolvimento” por **badge desabilitado** no botão + tooltip _“Em breve”_.
    
4.  **Resumo no topo, detalhes abaixo**  
    No Programa: barra com **Status, Semana, Partes, Última atualização, Ações (Aprovar/PDF)**; lista de partes vem depois.
    
5.  **Edição inline nas cartas de cada parte**  
    Combobox para trocar estudante/ajudante sem abrir modal.
    
6.  **Busca universal (Ctrl+K)**  
    Campo global em Programas/Designações/Estudantes com filtros salvos (status/mês/tipo).
    
7.  **Estados vazios orientativos**  
    Ex.: “Designações por Semana” vazio → CTA grande **“Escolher Programa para Gerar”**.
    
8.  **Terminologia curta e consistente**  
    Sempre **“Partes”**; usar **“Gerar”** (em vez de “Regenerar Semana”).
    
9.  **Layouts responsivos previsíveis**  
    Grids 1–2–3 colunas por breakpoint; barra de ações única com “Mais…”.
    
10.  **Tutoriais sob demanda**  
    O bloco “Tutoriais Recomendados” vira **ícone ?** no cabeçalho com popover e links.
    

* * *

8) Apêndice — SQL de RLS (base)
-------------------------------

> Ajuste nomes/colunas para seu schema (papéis, claims JWT, etc.). Ver seção **1.4** para o bloco completo.

    alter table public.estudantes enable row level security;
    alter table public.family_links enable row level security;
    
    -- Exemplo de select por congregação
    create policy select_estudantes_mesma_congregacao
    on public.estudantes for select to authenticated
    using (congregacao_id::text = coalesce(auth.jwt()->>'congregacao_id',''));
    

* * *

9) Apêndice — Script de auditoria
---------------------------------

Arquivo principal: `scripts/auditar-plano.mjs` (seção **2**).  
Execução:

    node scripts/auditar-plano.mjs > audit/STATUS_IMPL_PLAN.md
    

* * *

**Pronto.** Com este arquivo: rode a auditoria, atualize o plano, abra issues e siga a ordem sugerida para entregar valor rápido, mantendo segurança, testes e documentação em dia.

# AGENTS.md (v2) — Orquestrador de Personas

> Resumo rápido
>
> - Ciclo: Orchestrator → F Architect → Code → Debug → Orchestrator
> - “Def. of Done” por modo
> - Handoffs prontos para colar
> - `agents:log` grava em `agents.log.json` e atualiza a seção do AGENTS.md entre os marcadores
> - Scripts de CI/qualidade acoplados
> - Segurança: sem vazar tokens (Supabase MCP)

## Modos

- F Architect (Planejar)
  - Foco: arquitetura, fluxos, esquema de dados, regras S-38, RLS.
  - DoD: diagrama + esquema + riscos + critérios de aceite (teste verificável).

- Code (Implementar)
  - Foco: implementar com SOLID/DRY e UI consistente (Tailwind + shadcn/ui).
  - DoD: testes (unit/E2E), lint ok, build ok, docs curtas atualizadas.

- ? Ask (Descobrir)
  - Foco: esclarecer decisões e trade-offs.
  - DoD: respostas objetivas (máx. 5 bullets), decisão tomada/registrada.

- Debug (Diagnosticar)
  - Foco: reproduzir, isolar, corrigir; adicionar teste de regressão.
  - DoD: RCA curto, teste de regressão, métrica antes/depois (se aplicável).

- Orchestrator (Orquestrar)
  - Foco: dividir trabalho, ordenar etapas, garantir handoffs e critérios.
  - DoD: plano de execução, checklist, owners, prazos, conclusão registrada.

## Atalhos de Modo

- Ctrl + . → próximo modo
- Ctrl + Shift + . → modo anterior

## Diretrizes do Orquestrador (execução)

1. Iniciar no F Architect  
   Definir objetivo, requisitos, riscos, aceite; mapear entidades, RLS e S-38.

2. Delegar para Code (escopo claro)  
   Arquivos a criar/alterar, pontos de integração, testes obrigatórios.

3. ? Ask quando houver ambiguidade  
   Formular 2–4 perguntas fechadas com prós/cons curtos.

4. Debug após implementação  
   Reproduzir → corrigir → teste de regressão → registrar métrica/antes-depois.

5. Encerrar  
   Atualizar README/CHANGELOG/decisões; `agents:log`.

## Padrões (todos os modos)

- Segurança: nada de segredos no repo; RLS ativo; princípio do menor privilégio.
- Código: funções curtas, nomes claros, early return; tipagem estrita.
- UI/UX: responsivo, consistente, sem inline style desnecessário.
- Performance: memoização, paginação, evitar refetch; lazy/dynamic import.
- Docs: sucintas com exemplos de execução.

## Handoffs (modelos)

**Orchestrator → F Architect**

    Objetivo: <o que> para <quem> até <quando>.
    Requisitos: [ ] funcional 1 · [ ] segurança/RLS · [ ] S-38 · [ ] i18n
    Saídas: diagrama, esquema SQL, políticas RLS, critérios de aceite testáveis.
    Riscos: <lista breve>  Mitigação: <como>

**F Architect → Code**

    Arquivos: /supabase/migrations/xxx.sql · /src/modules/...  
    RLS: políticas SELECT/INSERT/UPDATE/DELETE; owner(s).  
    Validações S-38 no FE: regras de elegibilidade e conflitos.  
    Testes: unit <lista> · E2E (Cypress): <fluxos chave>.  
    Critérios de aceite: <checável>.

**Code → Debug**

    Build ok ✔ · Lint ok ✔ · Testes unit ✔.  
    Cenário bug/risco: <como reproduzir> → esperado vs atual.  
    Adicionar teste de regressão: <arquivo>.  

**Debug → Orchestrator**

    RCA: causa raiz (1–2 linhas).  
    Fix: <commit/PR>.  
    Regressão: <teste>.  
    Métrica (opcional): <antes> → <depois>.
    Pronto para merge.

## S-38 (regras mínimas embutidas)

- Elegibilidade por tipo de parte (ex.: `requires_male`, `elders_only`, etc.).
- Sem nomes no modelo oficial (admin publica template).
- RLS: cada congregação vê/aplica as próprias designações.
- Conflitos: impedir dupla designação no mesmo horário/semana; preferir fair queue.

---

# Registro de Atividades

Execute:

    npm run agents:log -- --agent="Code" --action="Implement feature X" --status="completed" --details="arquivos Y/Z atualizados"

Os logs entram em `agents.log.json` e atualizam a seção abaixo automaticamente.

<!-- AGENTS_LOG_START -->
<!-- Entradas serão inseridas automaticamente aqui. Não editar manualmente abaixo desta linha. -->
<!-- AGENTS_LOG_END -->

---

# Índice de Materiais e Documentos

## Materiais Oficiais (servidos pelo backend)
- mwb_E_202507.pdf — `http://localhost:3001/materials/mwb_E_202507.pdf`
- mwb_E_202509.pdf — `http://localhost:3001/materials/mwb_E_202509.pdf`
- mwb_E_202511.pdf — `http://localhost:3001/materials/mwb_E_202511.pdf`
- mwb_T_202507.daisy.zip — `http://localhost:3001/materials/mwb_T_202507.daisy.zip`
- mwb_T_202509.daisy.zip — `http://localhost:3001/materials/mwb_T_202509.daisy.zip`
- mwb_T_202509.jwpub — `http://localhost:3001/materials/mwb_T_202509.jwpub`
- mwb_T_202511.jwpub — `http://localhost:3001/materials/mwb_T_202511.jwpub`
- S-38_E.rtf — `http://localhost:3001/materials/S-38_E.rtf`
- WhatsApp Image 2025-08-14 at 19.44.07 (1).jpeg — `http://localhost:3001/materials/WhatsApp%20Image%202025-08-14%20at%2019.44.07%20%281%29.jpeg`
- WhatsApp Image 2025-08-14 at 19.44.07.jpeg — `http://localhost:3001/materials/WhatsApp%20Image%202025-08-14%20at%2019.44.07.jpeg`
- estudantes_ficticios.xlsx — `http://localhost:3001/materials/estudantes_ficticios.xlsx`
- estudantes_rows.sql — `http://localhost:3001/materials/estudantes_rows.sql`

## Documentação (links no repositório)
- docs/CONSOLE_LOG_FIXES.md
- docs/CORRECAO_ERRO_DATA_DESIGNACOES.md
- docs/CORRECAO_QRCODE_BUILD.md
- docs/CORREÇÕES_AUDITORIA_PWA.md
- docs/CORRECOES_TIPOS_MAPEAMENTOS.md
- docs/CORRECTED_DEVELOPER_REGISTRATION_GUIDE.md
- docs/CREDENCIAIS_TESTE_SISTEMA_COMPLETO.md
- docs/CRITICAL_ASSIGNMENT_FIXES_SUMMARY.md
- docs/CRITICAL_DATABASE_MIGRATION_APPLIED.md
- docs/CRITICAL_OPTIMIZATIONS_COMPLETE.md
- docs/CYPRESS_CICD_IMPLEMENTATION_SUMMARY.md
- docs/CYPRESS_CLOUD_CICD_SETUP.md
- docs/CYPRESS_CLOUD_SETUP.md
- docs/CYPRESS_CLOUD_TROUBLESHOOTING.md
- docs/CYPRESS_TESTING_SETUP.md
- docs/CYPRESS_TROUBLESHOOTING.md
- docs/DASHBOARD_LOGOUT_FIX.md
- docs/DEBUG_ADMIN_DASHBOARD.md
- docs/DEPLOYMENT_AUTHORIZATION_FIX.md
- docs/DEVELOPER_PANEL_IMPLEMENTATION_COMPLETE.md
- docs/DEVELOPER_REGISTRATION_VALIDATION_REPORT.md
- docs/DOCUMENTACAO_COMPLETA.md
- docs/DOCUMENTACAO_TECNICA_CONVITES_FAMILIARES.md
- docs/EMAIL_CONFIRMATION_FIX.md
- docs/ENHANCED_PDF_PARSING.md
- docs/ENVIRONMENT_CONFIGURATION_COMPLETE.md
- docs/ENVIRONMENT_SETUP_GUIDE.md
- docs/EXCEL_IMPORT_GUIDE.md
- docs/EXECUTION_TASKS_TRACKER.md
- docs/FAMILY_INVITATIONS_BUG_FIX.md
- docs/FAMILY_INVITATIONS_FEATURE.md
- docs/FAMILY_INVITATIONS_IMPLEMENTATION.md
- docs/FAMILY_MANAGEMENT_BUG_FIX.md
- docs/FAMILY_MANAGEMENT_TESTING_GUIDE.md
- docs/FAMILY_MEMBER_INSERT_BUG_FIX.md
- docs/FAQ_DELIVERABLES_SUMMARY.md
- docs/FAQ_SECTION_IMPLEMENTATION.md
- docs/GITHUB_ACTIONS_SETUP.md
- docs/GITHUB_REPOSITORY_SETUP.md
- docs/GUIA_ADMINISTRADOR_SISTEMA_MINISTERIAL.md
- docs/GUIA_TESTES_CYPRESS.md
- docs/GUIA_TRADUCAO_COMPLETA.md
- docs/GUIA_USUARIO.md
- docs/guia-desenvolvedor-logout.md
- docs/HEADER_AUTHENTICATION_FIX.md
- docs/historico-problemas-logout.md
- docs/IMPLEMENTACAO_COMPLETA_FINAL.md
- docs/IMPLEMENTACAO_COMPLETA_SISTEMA_MINISTERIAL.md
- docs/IMPLEMENTACAO_REGRA_S38_OFICIAL.md
- docs/IMPLEMENTATION_PLAN.md
- docs/INFINITE_LOADING_FIX.md
- docs/INTEGRACAO_DASHBOARDS_UNIFICADA.md
- docs/INTERNATIONAL_PHONE_SUPPORT.md
- docs/MEETINGS_DATABASE_IMPLEMENTATION_COMPLETE.md
- docs/MELHORIAS_IMPORTACAO_PLANILHA.md
- docs/PACKAGE_MANAGER_LOCKFILE_RESOLUTION.md
- docs/PAGE_REFRESH_FIX.md
- docs/PAGE_REFRESH_LOADING_FIX.md
- docs/PAINEL_INSTRUTOR_INTERATIVO.md
- docs/PERFORMANCE_OPTIMIZATIONS_IMPLEMENTED.md
- docs/PLANO.md
- docs/PLANO_IMPLEMENTACAO_HISTORICO_FILA_JUSTA.md
- docs/PRD.md
- docs/problemas-logout-sistema-ministerial.md
- docs/PRODUCTION_DEPLOYMENT_FIX.md
- docs/PRODUCTION_URL_UPDATE.md
- docs/PROFILE_FETCH_FIX.md
- docs/PROFILE_FETCH_TIMEOUT_FIXES.md
- docs/PROGRAM_PREVIEW_SYSTEM_COMPLETE.md
- docs/PROGRAMA_HARMONIZACAO_AMANHA.md
- docs/PROGRAMAS_SETUP.md
- docs/PROXIMAS_TAREFAS.md
- docs/PULL_REQUEST_DESCRIPTION.md
- docs/QUESTIONARIO_PROJETO_SISTEMA_MINISTERIAL.md
- docs/QUICK_DEPLOYMENT_FIX.md
- docs/REACT_HOOKS_ISSUE_FIX.md
- docs/REACT_USEEFFECT_FIX.md
- docs/README.md
- docs/README_ESTUDANTES.md
- docs/RECORD_KEY_GENERATION_GUIDE.md
- docs/REGIONAL_CONNECTIVITY_FIXES.md
- docs/RESPOSTAS_QUESTIONARIO.md
- docs/ROUTE_AUDIT_AND_UX_REVISION.md
- docs/ROUTE_AUDIT_IMPLEMENTATION_COMPLETE.md
- docs/ROUTING_FIX_SUMMARY.md
- docs/SARAH_CYPRESS_TEST.md
- docs/SCHEMA_FIX_APPLICATION_GUIDE.md
- docs/SECURITY_FIX_REPORT.md
- docs/SIGNUP_ERROR_FIX.md
- docs/SISTEMA_BILINGUE.md
- docs/SISTEMA_DESIGNACOES_S38T.md
- docs/SISTEMA_TUTORIAIS_INTERATIVOS.md
- docs/SISTEMA-UNIFICADO.md
- docs/SOLUCAO_WEBSOCKET.md
- docs/STUDENT_LOGIN_DEBUG_GUIDE.md
- docs/STUDENT_LOGOUT_IMPLEMENTATION.md
- docs/STUDENT_PORTAL_IMPLEMENTATION.md
- docs/SUPABASE_AUTHENTICATION_FIXES_SUMMARY.md
- docs/SUPABASE_CLIENT_TIMEOUT_FIX.md
- docs/SUPABASE_EMAIL_TEMPLATE_CONFIG.md
- docs/SUPABASE_URL_CONFIG_COMPLETE.md
- docs/SUPABASE_URL_CONFIGURATION.md
- docs/SYSTEM_FLOW.md
- docs/SYSTEM_FLOW_DIAGRAM.md
- docs/SYSTEM_LOGIC_DOCUMENTATION.md
- docs/TABLET_RESPONSIVENESS_FIXES.md
- docs/TAILWIND_CONFIGURATION_UPDATE_SUMMARY.md
- docs/TASK_14_COMPLETION_SUMMARY.md
- docs/TESTE_SISTEMA_BILINGUE.md
- docs/TUTORIAL_IMPORT_ERROR_FIX_COMPLETE.md
- docs/UNIFICACAO_SCRIPTS.md
- docs/UNIFIED_DASHBOARD_INTEGRATION_SUMMARY.md
- docs/VERIFICACAO_CYPRESS_BUILD.md
- docs/VERIFICATION_SYSTEM_GUIDE.md
- docs/VERIFICATION_SYSTEM_IMPLEMENTATION_COMPLETE.md
- docs/ZOOM_RESPONSIVENESS_TESTING_GUIDE.md
- docs/ZOOM_RESPONSIVENESS_TESTING_IMPLEMENTATION_SUMMARY.md
- docs/ADMIN_DASHBOARD_INTEGRATION.md
- docs/ANALISE_COMPLETA_SISTEMA_MINISTERIAL.md
- docs/ANALISE_DASHBOARDS_INTEGRACAO.md
- docs/ANALISE_RESPOSTAS_QUESTIONARIO.md
- docs/APPLICATION_READINESS_ASSESSMENT.md
- docs/APPLY_DATABASE_MIGRATION_NOW.md
- docs/ASSIGNMENT_GENERATION_SYSTEM.md
- docs/ASSIGNMENT_SYSTEM_IMPLEMENTATION_COMPLETE.md
- docs/ASSIGNMENT_SYSTEM_REPAIR_GUIDE.md
- docs/ASSIGNMENT_WORKFLOW_GUIDE.md
- docs/AUDITORIA_E_IMPLANTACAO.md
- docs/AUTH_TIMEOUT_FIXES_COMPREHENSIVE.md
- docs/AUTH_TROUBLESHOOTING.md
- docs/AUTHENTICATION_STATUS_REPORT.md
- docs/BIRTH_DATE_FEATURE.md
- docs/BUILD_ERRORS_FIXED.md
- docs/CACHE_ASIDE_PATTERN_GUIDE.md
- docs/CHECKLIST_IMPLEMENTACAO.md
- docs/CI_CD_COMPLETION_GUIDE.md
- docs/CI_CD_INTEGRATION_SUMMARY.md
- docs/COMPREHENSIVE_TUTORIAL_SYSTEM_COMPLETE.md
- docs/COMPREHENSIVE_VALIDATION_ASSESSMENT_REPORT.md


## Configuração MCP (segurança)

No trecho de configuração MCP (exemplo):

```
"supabase": {
  "command": "npx",
  "args": ["@supabase/mcp-server-supabase","--read-only","--project-ref=nwpuurgwnnuejqinkvrh"],
  "cwd": "C:\\...\\sua-parte",
  "env": {
    "SUPABASE_ACCESS_TOKEN": "sbp_0437..."
  }
}
```

- Não versionar o token. Mover para `.env`:

```
SUPABASE_ACCESS_TOKEN=sbp_****  # coloque aqui
```

- Injetar via script de inicialização (ou `cross-env`) sem fixar no arquivo MCP.
- Manter `--read-only` para auditorias.

---

# ⚙️ Scripts & arquivos necessários (orientação)

1) package.json (scripts sugeridos)

```
{
  "scripts": {
    "agents:log": "node scripts/agents-log.mjs",
    "agents:mode": "node -e \"console.log('modo atual:', process.env.AGENT_MODE||'Orchestrator')\"",
    "lint": "eslint . --ext .ts,.tsx",
    "test": "vitest run",
    "e2e": "cypress run",
    "precommit": "npm run lint && npm run test && echo '✅ qualidade ok'"
  }
}
```

2) scripts/agents-log.mjs

```
import fs from 'fs';
import path from 'path';

const ROOT = process.cwd();
const LOG_PATH = path.join(ROOT, 'agents.log.json');
const AGENTS_MD = path.join(ROOT, 'AGENTS.md');

function readArg(flag, def='') {
  const i = process.argv.indexOf(`--${flag}`);
  return i > -1 ? process.argv[i+1] : def;
}

const entry = {
  timestamp: new Date().toISOString(),
  agent: readArg('agent','Unknown'),
  action: readArg('action',''),
  status: readArg('status','pending'),
  details: readArg('details','')
};

// 1) append em agents.log.json
let log = [];
if (fs.existsSync(LOG_PATH)) {
  try { log = JSON.parse(fs.readFileSync(LOG_PATH,'utf8')); } catch {}
}
log.push(entry);
fs.writeFileSync(LOG_PATH, JSON.stringify(log, null, 2));

// 2) atualizar bloco no AGENTS.md entre marcadores
const md = fs.readFileSync(AGENTS_MD, 'utf8');
const start = '<!-- AGENTS_LOG_START -->';
const end   = '<!-- AGENTS_LOG_END -->';
const i1 = md.indexOf(start);
const i2 = md.indexOf(end);
if (i1 !== -1 && i2 !== -1 && i2 > i1) {
  const visible = log.slice(-10).reverse()
    .map(e => `- ${e.timestamp} — **${e.agent}**: ${e.action} _(status: ${e.status})_  \n  ${e.details ? '↳ ' + e.details : ''}`)
    .join('\n');
  const next = md.slice(0, i1 + start.length) + '\n' + visible + '\n' + md.slice(i2);
  fs.writeFileSync(AGENTS_MD, next);
  console.log('✅ agents.log.json atualizado e AGENTS.md refletido.');
} else {
  console.log('ℹ️ Marcadores não encontrados no AGENTS.md; gravado apenas em agents.log.json.');
}
```

3) .gitignore (garantir)

```
# segredos & artefatos
.env
*.local
*.log
agents.log.json
```

---

# ✅ Checklist de qualidade (curto)

- F Architect entregou esquema/fluxo + critérios de aceite testáveis.
- Code com testes (unit/E2E), lint e build.
- Debug registrou RCA + teste de regressão.
- Orchestrator rodou `npm run agents:log` com status final e atualizou docs.

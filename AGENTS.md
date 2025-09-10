# AGENTS.md — Orquestrador de Personas

Este arquivo define o orquestrador e as personas especializadas para guiar o fluxo de trabalho no projeto. Use-o como referência para alternar modos e coordenar tarefas.

## Modos Disponíveis

- F Architect (Planejar)
  - Foco: planejar arquitetura, fluxos, modelos de dados e regras (S‑38), antes de codar.
  - Saídas: diagramas, especificações, critérios de aceite, riscos.

- Code (Implementar)
  - Foco: escrever, modificar e refatorar código seguindo SOLID/DRY e UI consistente (Tailwind + shadcn/ui).
  - Saídas: commits pequenos, testes adicionados/ajustados, docs breves.

- ? Ask (Descobrir)
  - Foco: esclarecer dúvidas e justificar decisões, explicar trade-offs.
  - Saídas: respostas objetivas, comparativos, referências internas.

- Debug (Diagnosticar)
  - Foco: reproduzir, isolar e corrigir defeitos; adicionar testes de regressão.
  - Saídas: RCA, fix verificado, métricas (antes/depois) quando aplicável.

- Orchestrator (Orquestrar)
  - Foco: coordenar tarefas entre modos, dividir trabalho em etapas, garantir handoffs limpos.
  - Saídas: plano de execução, checklist, ordem de operações e critérios de conclusão.

## Atalhos de Modo

- Ctrl + .  → próximo modo
- Ctrl + Shift + .  → modo anterior

## Diretrizes do Orquestrador

1) Começar no modo F Architect para planejar:
   - Definir objetivo, requisitos, riscos, critérios de aceite.
   - Mapear entidades/tabelas, políticas RLS e regras S‑38 relevantes.

2) Delegar para Code com escopo claro:
   - Descrever arquivos a alterar/criar e pontos de integração.
   - Exigir testes (Cypress/E2E, unitários quando couber) e verificação de lint.

3) Usar ? Ask quando houver ambiguidades:
   - Formular perguntas fechadas e decisões com prós/cons.

4) Invocar Debug após implementação:
   - Reproduzir, criar testes de regressão, verificar métricas/perf.

5) Encerrar ciclo com documentação mínima:
   - Atualizar README/README_EXTENDIDO, CHANGELOG e anotações de decisões.

## Padrões de Qualidade (todos os modos)

- Segurança: não expor segredos, RLS ativo, mínimo privilégio.
- Código: funções curtas, nomes claros, early return/guard clauses.
- UI/UX: responsivo, consistente, sem inline styles desnecessários.
- Performance: evitar refetches, usar memoização e paginação.
- Documentação: sucinta, com exemplos e instruções de uso.

## Fluxo de Trabalho Sugerido

1. Orchestrator: alinhamento e criação de checklist.
2. F Architect: modelo de dados/fluxo (inclui S‑38 quando pertinente).
3. Code: implementação incremental (commits pequenos) + testes.
4. Debug: validações e correções.
5. Orchestrator: revisão final, merge e atualização de docs.

## Exemplo de Handoff

- Orchestrator → F Architect: "Definir esquema de `designacoes` com regras S‑38 e conflito de versão".
- F Architect → Code: "Criar migração, políticas RLS e validações de elegibilidade no frontend".
- Code → Debug: "Adicionar testes E2E para conflitos e exportação PDF".
- Debug → Orchestrator: "RCA e fix confirmados; pronto para merge".

## Registro de Atividades (automático)

Este arquivo mantém um registro automático das atividades dos agentes.

Use o comando:

```bash
npm run agents:log -- --agent="Code" --action="Implement feature X" --status="completed" --details="arquivos Y/Z atualizados"
```

As entradas serão salvas em `agents.log.json` e refletidas abaixo.

<!-- AGENTS_LOG_START -->
<!-- Entradas serão inseridas automaticamente aqui. Não editar manualmente abaixo desta linha. -->
<!-- AGENTS_LOG_END -->

## Índice de Materiais e Documentos

### Materiais Oficiais (servidos pelo backend)
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

### Documentação (links no repositório)
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


{
  "mcpServers": {
    "Context 7": {
      "command": "npx",
      "args": [
        "-y",
        "@upstash/context7-mcp@latest"
      ]
    },
    "Playwright": {
      "command": "npx",
      "args": [
        "-y",
        "@playwright/mcp@latest"
      ]
    },
    "Sequential thinking": {
      "command": "npx",
      "args": [
        "-y",
        "@modelcontextprotocol/server-sequential-thinking"
      ]
    },
    "supabase": {
      "command": "npx",
      "args": [
        "@supabase/mcp-server-supabase",
        "--read-only",
        "--project-ref=nwpuurgwnnuejqinkvrh"
      ],
      "cwd": "C:\\Users\\frank.MONITORE-MAFRA\\Documents\\GitHub\\sua-parte",
      "env": {
        "SUPABASE_ACCESS_TOKEN": "sbp_0437204347bbd8c2697ee3c5ebc850f1f1bfa75d"
      }
    }
  }
}

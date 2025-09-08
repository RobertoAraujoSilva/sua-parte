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


## Diretrizes do Orquestrador

  ---

  ## Como obter e organizar os JSONs dos servidores MCP do Projeto Designa

  Esta tarefa orienta como obter, organizar e validar os arquivos de configuração JSON dos servidores MCP mais relevantes para o Projeto Designa.

  ### 1. Identifique os MCPs necessários
  - Consulte a lista de servidores MCP recomendados para cada dashboard (Admin, Instrutor, Futuro) conforme documentado acima.

  ### 2. Pesquise exemplos e documentação
  - Busque exemplos de configuração nos repositórios oficiais de cada MCP (ex: GitHub, documentação oficial).
  - Priorize exemplos que incluam comandos, variáveis de ambiente e argumentos específicos.

  ### 3. Crie arquivos JSON individuais
  - Para cada MCP, crie um arquivo separado, por exemplo:
    - `fetch_mcp_config.json`
    - `filesystem_mcp_config.json`
    - `postgresql_mcp_config.json`
    - `puppeteer_mcp_config.json`
    - `context7_mcp.json`
    - `playwright_mcp.json`
    - `sequential_thinking_mcp.json`
    - `supabase_mcp.json`

  ### 4. Estrutura básica do JSON
  ```json
  {
    "command": "npx",
    "args": ["-y", "@nome-do-mcp@latest"],
    "cwd": "<diretório de trabalho, se necessário>",
    "env": { "VARIAVEL": "valor" }
  }
  ```

  ### 5. Ajuste variáveis e credenciais
  - Substitua placeholders por valores reais (tokens, project-ref, etc.) conforme necessário para cada ambiente.

  ### 6. Valide e teste
  - Execute cada MCP localmente usando o comando e argumentos definidos no JSON para garantir que está funcional.
  - Ajuste permissões, diretórios e variáveis conforme necessário.

  ### 7. Documente e versiona
  - Mantenha um README explicando a função de cada MCP e como configurar/rodar.
  - Versione todos os arquivos JSON e README junto ao repositório.

  ---

  > Siga este fluxo para garantir que todos os MCPs estejam corretamente configurados, documentados e prontos para integração com os dashboards do Projeto Designa.
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

## Crítica de Fluxo, Lógica, Integração e Promessas Não Cumpridas

Esta análise lista problemas observados no projeto quanto a: sequência de ações/botões, integração entre dashboards (Admin, Instrutor, Estudante), gaps entre documentação e implementação, e etapas desnecessárias.

### 1) Navegação e Proteções de Rota (Fluxo/Sequência)
- **Redirecionamentos inconsistentes**: `ProtectedRoute` redireciona por `role`, mas usa `localStorage('onboarding_completed')` para instrutor, criando dependência frágil e possibilidade de loops quando `profile` está carregando.
- **Rotas de Admin duplicadas**: `App.tsx` expõe `/admin` e `/admin/*` apontando para `AdminDashboardNew`, sem sub-rotas declaradas; pode confundir breadcrumbs e testes.
- **Auth → destino**: `Auth.tsx` promete redirecionar admin/instrutor/estudante conforme `profile` ou `user_metadata`, mas há janelas onde `profile` não está carregado e pode enviar para destino inadequado.
- **Onboarding disperso**: Rotas `/bem-vindo`, `/configuracao-inicial`, `/primeiro-programa` exigem `instrutor`, mas o fluxo recomendado aparece também no Dashboard (UserFlow/Tutorial), duplicando orientação.

### 2) Sequência de Ações e Botões (UX/Consistência)
- **Ações rápidas sem handler**: `src/components/QuickActions.tsx` exibe botões “Gerar”, “Regenerar”, “Exportar PDF” sem callbacks; parecem maqueta, gerando expectativa sem efeito.
- **Dashboard principal vs PrimeiroPrograma**: Tanto `Dashboard.tsx` quanto `PrimeiroPrograma.tsx` orientam sequência Estudantes → Programas → Designações, mas com destinos ligeiramente diferentes e repetição de conteúdo.
- **Admin ‘Atualizar’ simulado**: Em `AdminDashboardNew`, “Atualizar” só faz `setTimeout`; a documentação indica verificação real (JW.org, backend 3001), causando dissonância.
- **Tabs Admin sem dados reais**: Abas “Usuários”, “Congregações”, “Sistema” mostram métricas estáticas; documentação sugere valores vindos do backend.

### 3) Integração Frontend ↔ Backend (Portas/Rotas/Expectativas)
- **Portas divergentes**: Documentos citam backend em 3001, mas `backend/server.js` default é 3000 (usa `PORT` se setado). Isso quebra instruções “curl localhost:3001/api/status” quando variável não está definida.
- **Promessas de JW.org**: `ADMIN_DASHBOARD_INTEGRATION.md` promete “Verificar Novas Versões” e download automático via serviço; no Admin UI novo não há integração real com `/api/admin`/`/api/programs`.
- **Roteamento de materiais**: Backend serve `/materials` de `docs/Oficial`, porém o frontend Admin novo não lista nem consome esses arquivos (falta tela de “Materiais”).
- **Rotas backend existem, mas não conectadas**: Há rotas `admin`, `materials`, `programs`, `programacoes`, `designacoes`, porém o Admin UI atual usa dados mockados.

### 4) Documentação vs Implementação (Promessas não cumpridas)
- **“100% funcional” (Admin)**: `ADMIN_DASHBOARD_INTEGRATION.md` afirma integração completa; o componente `AdminDashboardNew` é predominantemente estático e sem chamadas REST reais.
- **Testes Cypress de Admin**: Doc referencia `cypress/e2e/admin-dashboard-integration.cy.ts`; não foi encontrado handler correspondente no Admin novo, indicando possível desatualização dos testes vs UI.
- **Roadmap/Features**: `DOCUMENTACAO_COMPLETA.md` promete “API REST completa” e integrações; no Admin novo essas integrações não estão implementadas.

### 5) Etapas desnecessárias ou duplicadas
- **Debug Buttons vs Painel Admin**: Existem vários botões e páginas de debug fora do Admin novo; overlap de propósito com “Sistema” no Admin.
- **Fluxos de tutorial e onboarding**: O mesmo guia de passos aparece em múltiplos lugares, gerando redundância.

### 6) Riscos de Estado/Carregamento
- **Condições de corrida**: `ProtectedRoute` e `Auth` dependem de `user`/`profile` enquanto carregam; logs indicam caminhos alternativos por metadata, podendo causar redirecionamentos erráticos.
- **Feature flags ausentes**: Componentes simulados não têm flags/avisos de “em desenvolvimento”, aumentando frustração do usuário.

### 7) Sugestões Objetivas
- **Unificar porta e docs**: Fixar backend em 3001 (ou 3000) e atualizar docs/scripts (`start-backend.bat`) e health checks para uma porta única.
- **Conectar Admin às rotas REST**: Implementar chamadas reais em `AdminDashboardNew` para `/api/status`, `/api/programs`, `/api/materials` e `/api/admin/check-updates`.
- **Remover/ocultar botões mock**: Adicionar handlers reais ou esconder botões até estarem prontos; incluir microcopy “beta”.
- **Convergir fluxo onboarding**: Centralizar a sequência Estudantes → Programas → Designações numa única fonte (tutorial ou página dedicada) e linká-la consistentemente.
- **Revisar ProtectedRoute/Auth**: Introduzir estado “loading barrier” e só decidir rota após `profile` carregar ou aplicar skeleton; evitar uso de `localStorage` como gate principal.
- **Atualizar testes E2E**: Sincronizar `cypress` com a UI do Admin novo; criar specs que validem integrações reais.
- **Superfície de Materiais**: Criar aba “Materiais” no Admin novo listando `/materials` e status de downloads.

—
Relatório gerado automaticamente com base no estado atual do código e documentação.


### Plano de Ação (Tarefas)

- [ ] Unificar porta do backend e documentação
  - **Ação**: Definir porta padrão (3001 ou 3000), ajustar `backend/server.js` ou scripts (`start-backend.bat`) e atualizar docs (`ADMIN_DASHBOARD_INTEGRATION.md`, health checks).
  - **Aceite**: `curl http://localhost:<PORT>/api/status` funciona e docs refletem a porta única.

- [ ] Conectar `AdminDashboardNew` a APIs reais
  - **Ação**: Consumir `/api/status` (cards “Sistema”), `/api/materials` (contagem/última sync), `/api/programs`/`/api/programacoes` (semanas programadas), `/api/admin/check-updates` (botão “Atualizar”).
  - **Aceite**: Botão “Atualizar” executa chamada real; métricas deixam de ser estáticas.

- [ ] Criar aba “Materiais” no Admin
  - **Ação**: Nova Tab listando arquivos de `/materials` (nome, data, idioma, tamanho) com filtros básicos.
  - **Aceite**: Lista exibe conteúdo de `docs/Oficial` via backend estático.

- [ ] Implementar handlers ou ocultar `QuickActions`
  - **Ação**: Adicionar callbacks reais para “Gerar/Regenerar/Exportar PDF” ou esconder até pronto; incluir label “Beta” quando parcial.
  - **Aceite**: Nenhum botão sem efeito visível ao usuário.

- [ ] Consolidar fluxo de onboarding
  - **Ação**: Centralizar sequência Estudantes → Programas → Designações em um único guia (tutorial ou página) e referenciar somente esse ponto no `Dashboard` e `PrimeiroPrograma`.
  - **Aceite**: Não há instruções duplicadas; links levam ao mesmo fluxo.

- [ ] Melhorar `ProtectedRoute`/`Auth` (barreira de loading)
  - **Ação**: Exibir skeleton/loader até `profile` carregar; evitar usar `localStorage` como gate; unificar lógica de redirect por `role`.
  - **Aceite**: Sem redirecionamentos erráticos durante carregamento; caminhos previsíveis por `role`.

- [ ] Atualizar testes E2E do Admin
  - **Ação**: Criar/ajustar specs no Cypress para o Admin novo com mock/fixture das rotas reais; cobrir “Atualizar”, “PDFs”, “Sistema”.
  - **Aceite**: Pipeline E2E valida integrações do Admin com API.

- [ ] Sinalização de features parciais
  - **Ação**: Adicionar badges “Em desenvolvimento/Beta” onde dados são mockados; esconder métricas não implementadas.
  - **Aceite**: UI não induz a erro sobre estado de funcionalidades.

- [ ] Revisar promessas em documentação
  - **Ação**: Ajustar `ADMIN_DASHBOARD_INTEGRATION.md` e `DOCUMENTACAO_COMPLETA.md` para refletir implementação atual, removendo “100% funcional” para seções mock.
  - **Aceite**: Docs e UI alinhados, sem overpromise.

- [ ] Endpoint de verificação JW.org (se faltar)
  - **Ação**: Expor no backend rota `POST /api/admin/check-updates` que chama `JWDownloader.checkAndDownloadAll()` e retorna resultados.
  - **Aceite**: Chamada retorna resumo (novos arquivos, erros) e Admin consome.

- [ ] Página/Seção de Saúde do Sistema no Admin
  - **Ação**: Bloco “Sistema” puxando `/api/status` periodicamente, com indicadores (uptime, latência simulada, serviços).
  - **Aceite**: Status muda conforme retorno da API.

- [ ] Normalizar rotas do Admin
  - **Ação**: Remover duplicidade `/admin` e `/admin/*` ou definir sub-rotas reais (ex.: `/admin/system`, `/admin/pdfs`).
  - **Aceite**: Navegação previsível, sem rotas redundantes.

- [ ] Consumir diretório de materiais na UI
  - **Ação**: Exibir link/preview/download dos arquivos servidos via `/materials` com paginação básica.
  - **Aceite**: Usuário consegue visualizar/baixar materiais do Admin.

- [ ] Estados de erro e carregamento padronizados
  - **Ação**: Padronizar spinners/placeholders e mensagens de erro para chamadas do Admin; usar toasts não-intrusivos.
  - **Aceite**: UX consistente durante carregamentos/falhas.

# 🛠️ Rules and User Guidelines - Sistema Ministerial

## Rules

As seguintes regras devem ser aplicadas globalmente para todo o desenvolvimento do **Sistema Ministerial**:

1. **Organização do Código**

   * Mantenha uma arquitetura limpa seguindo a estrutura de pastas definida no repositório.
   * Separe frontend, backend, automações e documentação claramente.
2. **Boas Práticas de Programação**

   * Evite duplicação de código e telas; utilize componentes reutilizáveis.
   * Siga os princípios SOLID e DRY.
   * Evite funções muito longas; priorize legibilidade e manutenção.
3. **UI/UX Consistente**

   * Utilize componentes de interface padronizados para todas as páginas e formulários.
   * Evite criar múltiplas telas para a mesma funcionalidade.
   * Mantenha o layout responsivo e testado em dispositivos móveis e desktop.
4. **Segurança e Privacidade**

   * Não exponha informações sensíveis no frontend.
   * Utilize variáveis de ambiente para chaves e URLs privadas.
   * Aplique políticas de Row Level Security (RLS) no Supabase.
5. **Fluxo de Trabalho com Git**

   * Crie branches para cada funcionalidade.
   * Faça commits claros e objetivos.
   * Sempre revise o código antes do merge.

## User Guidelines

As diretrizes abaixo definem como o time de desenvolvimento e o Augment devem operar:

1. **Não repetir funcionalidades**: Antes de criar uma nova feature, verifique se já existe no sistema.
2. **Documentar sempre**: Toda função, endpoint ou módulo precisa de comentários claros e documentação em `README` ou no arquivo correspondente.
3. **Reutilizar Componentes**: Utilize componentes React reutilizáveis para formulários, botões, tabelas e modais.
4. **Tratamento de Erros**: Todas as chamadas de API devem ter tratamento de erro e feedback amigável ao usuário.
5. **Padronização Visual**: Use TailwindCSS e mantenha cores, botões e fontes consistentes.
6. **Performance e Otimização**: Evite loops desnecessários e carregamento de dados redundantes.
7. **Testes Locais Antes do Deploy**: Verifique que tudo funciona localmente antes de subir para produção.

---

Essas regras e diretrizes garantem que o sistema seja **manutenível, seguro e consistente**, com uma **experiência de usuário fluida** e código limpo para futuras atualizações.
# Requirements Document - Mobile Portrait & SPA Refresh Fix

## Introduction

Este documento define os requisitos para corrigir problemas críticos de UX em dispositivos móveis no modo portrait e resolver o problema de tela branca ao fazer refresh em rotas SPA no Sistema Ministerial.

## Requirements

### Requirement 1: Mobile Portrait Layout Fixes

**User Story:** Como usuário em dispositivo móvel no modo portrait, eu quero que todas as interfaces sejam responsivas e funcionais, para que eu possa usar o sistema confortavelmente em qualquer orientação.

#### Acceptance Criteria

1. WHEN eu acesso /estudantes THEN o título deve ser "Gestão de Estudantes" (sem duplicação)
2. WHEN eu acesso /programas em produção THEN não deve aparecer campos de edição vazando no hero
3. WHEN eu uso barras de ações em telas estreitas THEN elas devem quebrar em linhas com gap consistente
4. WHEN eu navego pelas tabs em /estudantes THEN deve haver rolagem horizontal suave sem cortes
5. WHEN eu uso o app em Android THEN o conteúdo deve respeitar a safe-area da dock

### Requirement 2: SPA Refresh Resilience

**User Story:** Como usuário, eu quero que o sistema funcione corretamente quando eu recarrego a página em qualquer rota, para que eu não veja tela branca ou erros.

#### Acceptance Criteria

1. WHEN eu faço F5 em /estudantes, /programas ou /designacoes THEN o app deve carregar normalmente
2. WHEN há erro de chunk após deploy THEN o sistema deve limpar cache e recarregar automaticamente
3. WHEN o service worker é registrado THEN deve haver fallback seguro para SPA routing
4. IF o host serve como static site THEN deve haver configuração de rewrite apropriada

### Requirement 3: Loading States & Error Handling

**User Story:** Como usuário, eu quero feedback visual claro durante carregamentos e opções de retry em caso de erro, para que eu saiba o status do sistema e possa tentar novamente.

#### Acceptance Criteria

1. WHEN dados estão carregando THEN deve aparecer skeleton ao invés de spinner infinito
2. WHEN há timeout de rede (>10s) THEN deve aparecer estado de erro com botão "Tentar novamente"
3. WHEN clico em "Tentar novamente" THEN deve refazer a requisição
4. WHEN há erro de conexão THEN deve haver mensagem clara e ação de recovery

### Requirement 4: Safe Area & Responsive Actions

**User Story:** Como usuário em dispositivo móvel, eu quero que botões e ações sejam acessíveis e não sejam cortados pela interface do sistema, para que eu possa interagir com todas as funcionalidades.

#### Acceptance Criteria

1. WHEN uso o FAB "Debug" THEN deve respeitar a safe-area inferior do dispositivo
2. WHEN a barra de ações quebra linha THEN deve manter ordem lógica (Gerar → Regenerar → Exportar)
3. WHEN navego por tabs horizontais THEN deve haver snap suave e sem sobreposição
4. WHEN o conteúdo é longo THEN deve haver padding inferior adequado para não encostar na dock

### Requirement 5: Development vs Production Behavior

**User Story:** Como desenvolvedor, eu quero que ferramentas de debug apareçam apenas em desenvolvimento, para que usuários finais tenham uma interface limpa.

#### Acceptance Criteria

1. WHEN estou em ambiente de produção THEN campos de edição de debug não devem aparecer
2. WHEN estou em desenvolvimento THEN posso ver ferramentas de debug quando necessário
3. WHEN há diferença entre dev/prod THEN deve ser controlada por import.meta.env.DEV
4. IF há ferramentas de debug THEN devem ser claramente identificadas e não interferir na UX
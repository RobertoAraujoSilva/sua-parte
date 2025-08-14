# Requirements Document

## Introduction

Esta feature implementa uma otimização completa do layout para desktop, resolvendo problemas de aproveitamento de espaço, densidade visual e estabilidade em diferentes zooms. O objetivo é criar páginas que ocupem eficientemente a largura disponível (até 1600px), tenham altura fluida baseada no viewport, e mantenham consistência visual em qualquer nível de zoom.

## Requirements

### Requirement 1

**User Story:** Como usuário em desktop, quero que as páginas ocupem toda a largura útil disponível, para que eu possa visualizar mais dados sem margens desnecessárias.

#### Acceptance Criteria

1. WHEN acessando páginas internas THEN o conteúdo SHALL ocupar largura fluida até min(1600px, 95vw)
2. WHEN visualizando em monitores 1080p/1440p THEN a página SHALL ocupar quase toda a largura sem passar de 1600px
3. WHEN redimensionando a janela THEN o layout SHALL se adaptar fluidamente sem quebras

### Requirement 2

**User Story:** Como usuário, quero que a área de dados ocupe toda a altura útil do viewport, para que eu possa ver mais registros sem scroll desnecessário.

#### Acceptance Criteria

1. WHEN acessando planilhas/tabelas THEN a altura SHALL ser calc(100svh - cabeçalhos - toolbars - gutters)
2. WHEN rolando a página THEN não SHALL haver grandes espaços vazios acima ou abaixo da área de dados
3. WHEN o footer aparecer THEN ele SHALL estar posicionado após a área útil, não empurrando o conteúdo

### Requirement 3

**User Story:** Como usuário, quero heroes compactos em páginas internas, para que mais espaço seja dedicado ao conteúdo principal.

#### Acceptance Criteria

1. WHEN acessando páginas internas (Estudantes/Programas/Designações) THEN o hero SHALL ter altura compacta clamp(56px, 8svh, 120px)
2. WHEN acessando o Dashboard THEN o hero SHALL manter altura normal para destaque
3. WHEN redimensionando THEN a altura do hero SHALL se adaptar proporcionalmente

### Requirement 4

**User Story:** Como usuário, quero toolbars sticky, para que as ações principais permaneçam acessíveis durante o scroll.

#### Acceptance Criteria

1. WHEN rolando a página THEN a toolbar SHALL permanecer fixa no topo (sticky)
2. WHEN a toolbar estiver sticky THEN ela SHALL manter backdrop-blur e transparência
3. WHEN interagindo com botões na toolbar THEN eles SHALL permanecer funcionais independente da posição do scroll

### Requirement 5

**User Story:** Como usuário, quero densidade visual ajustável, para que eu possa escolher entre visualização confortável ou compacta.

#### Acceptance Criteria

1. WHEN em modo compact THEN as linhas SHALL ter altura 36px e padding 8px
2. WHEN em modo comfortable THEN as linhas SHALL ter altura 44px e padding 12px
3. WHEN alternando densidade THEN a mudança SHALL ser aplicada via CSS variables instantaneamente

### Requirement 6

**User Story:** Como usuário, quero layout estável em qualquer zoom, para que a interface permaneça funcional em 80%, 100%, 125% e 150% de zoom.

#### Acceptance Criteria

1. WHEN alterando zoom para 80-150% THEN o layout SHALL manter proporções usando clamp() e unidades viewport
2. WHEN em zoom extremo (50%) THEN não SHALL haver barras flutuantes ou quebras de layout
3. WHEN testando responsividade THEN a tabela SHALL continuar usando toda largura e altura calculada

### Requirement 7

**User Story:** Como usuário, quero toolbars inteligentes com grid fluida, para que os botões se organizem eficientemente no espaço disponível.

#### Acceptance Criteria

1. WHEN visualizando toolbar THEN ela SHALL usar grid com colunas "1fr auto auto auto"
2. WHEN em telas menores THEN os botões SHALL se reorganizar naturalmente
3. WHEN adicionando novos botões THEN eles SHALL se integrar ao grid sem quebrar o layout

### Requirement 8

**User Story:** Como desenvolvedor, quero um componente PageShell reutilizável, para que todas as páginas mantenham consistência de layout.

#### Acceptance Criteria

1. WHEN criando nova página THEN ela SHALL usar o componente PageShell
2. WHEN configurando hero THEN o parâmetro hero={false} SHALL aplicar layout compacto
3. WHEN passando actions THEN elas SHALL ser renderizadas na toolbar sticky
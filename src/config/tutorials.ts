import { TutorialConfig, Tutorial, TutorialPage } from '@/types/tutorial';

/**
 * Tutorial configuration for Sistema Ministerial
 * Contains all tutorial content for each page
 */

// Dashboard tutorials
const dashboardTutorials: Tutorial[] = [
  {
    id: 'dashboard-overview',
    title: 'Visão Geral do Dashboard',
    description: 'Aprenda a navegar pelo painel principal e entenda as funcionalidades básicas',
    page: 'dashboard',
    category: 'basic',
    estimatedTime: 3,
    steps: [
      {
        id: 'welcome',
        title: 'Bem-vindo ao Sistema Ministerial! 👋',
        content: 'Este é o seu painel de controle principal. Aqui você pode acessar todas as funcionalidades para gerenciar designações ministeriais de forma inteligente.',
        target: 'h2:contains("Painel de Controle")',
        position: 'bottom'
      },
      {
        id: 'quick-actions',
        title: 'Ações Rápidas',
        content: 'Use estes botões para acessar rapidamente as tarefas mais comuns: adicionar estudantes, importar programas e gerar designações.',
        target: '[data-tutorial="quick-actions"]',
        position: 'bottom'
      },
      {
        id: 'navigation-cards',
        title: 'Cartões de Navegação',
        content: 'Cada cartão representa uma seção principal do sistema. Clique neles para acessar as funcionalidades específicas.',
        target: '[data-tutorial="dashboard-cards"]',
        position: 'top'
      },
      {
        id: 'statistics',
        title: 'Estatísticas do Sistema',
        content: 'Acompanhe o progresso da sua congregação com estatísticas em tempo real sobre estudantes, programas e designações.',
        target: '[data-tutorial="stats-overview"]',
        position: 'top'
      }
    ]
  },
  {
    id: 'dashboard-workflow',
    title: 'Fluxo de Trabalho Recomendado',
    description: 'Entenda a sequência ideal para configurar e usar o sistema',
    page: 'dashboard',
    category: 'workflow',
    estimatedTime: 5,
    prerequisites: ['dashboard-overview'],
    steps: [
      {
        id: 'step1-students',
        title: 'Passo 1: Cadastrar Estudantes',
        content: 'Comece cadastrando os estudantes da Escola do Ministério Teocrático. Você pode adicionar um por vez ou importar uma planilha.',
        target: '[href="/estudantes"]',
        position: 'right',
        action: 'click'
      },
      {
        id: 'step2-programs',
        title: 'Passo 2: Importar Programas',
        content: 'Importe os programas semanais da apostila "Nossa Vida e Ministério Cristão" em formato PDF.',
        target: '[href="/programas"]',
        position: 'right',
        action: 'click'
      },
      {
        id: 'step3-assignments',
        title: 'Passo 3: Gerar Designações',
        content: 'Com estudantes e programas cadastrados, você pode gerar designações automáticas seguindo as regras S-38-T.',
        target: '[href="/designacoes"]',
        position: 'right',
        action: 'click'
      }
    ]
  }
];

// Estudantes tutorials
const estudantesTutorials: Tutorial[] = [
  {
    id: 'students-basic',
    title: 'Gerenciamento de Estudantes',
    description: 'Aprenda a cadastrar, editar e organizar estudantes da escola ministerial',
    page: 'estudantes',
    category: 'basic',
    estimatedTime: 7,
    steps: [
      {
        id: 'page-overview',
        title: 'Página de Estudantes',
        content: 'Esta página permite gerenciar todos os estudantes da Escola do Ministério Teocrático com validação automática de qualificações.',
        target: 'h1:contains("Gestão de Estudantes")',
        position: 'bottom'
      },
      {
        id: 'tabs-navigation',
        title: 'Navegação por Abas',
        content: 'Use as abas para alternar entre: Lista de estudantes, Formulário de cadastro, Importação por planilha e Estatísticas.',
        target: '[data-tutorial="tabs-navigation"]',
        position: 'bottom'
      },
      {
        id: 'add-student',
        title: 'Adicionar Novo Estudante',
        content: 'Clique na aba "Novo Estudante" para cadastrar um estudante individual com todas as informações necessárias.',
        target: '[data-value="form"]',
        position: 'bottom',
        action: 'click'
      },
      {
        id: 'student-form',
        title: 'Formulário de Cadastro',
        content: 'Preencha os dados do estudante. O sistema validará automaticamente as qualificações baseadas no cargo e gênero.',
        target: '[data-tutorial="student-form"]',
        position: 'right'
      },
      {
        id: 'import-option',
        title: 'Importação em Lote',
        content: 'Para cadastrar muitos estudantes de uma vez, use a importação por planilha Excel com detecção inteligente de duplicados.',
        target: '[data-value="import"]',
        position: 'bottom',
        action: 'click'
      },
      {
        id: 'filters-search',
        title: 'Filtros e Busca',
        content: 'Use os filtros para encontrar estudantes por cargo, gênero, status ou nome. Ideal para congregações grandes.',
        target: '[data-tutorial="filters-section"]',
        position: 'bottom'
      }
    ]
  },
  {
    id: 'students-advanced',
    title: 'Recursos Avançados',
    description: 'Explore funcionalidades avançadas como relacionamentos familiares e qualificações',
    page: 'estudantes',
    category: 'advanced',
    estimatedTime: 5,
    prerequisites: ['students-basic'],
    steps: [
      {
        id: 'family-relationships',
        title: 'Relacionamentos Familiares',
        content: 'Configure relacionamentos familiares para garantir que pares de gêneros diferentes sejam apenas entre familiares.',
        target: '[data-tutorial="family-field"]',
        position: 'right'
      },
      {
        id: 'qualifications',
        title: 'Sistema de Qualificações',
        content: 'O sistema determina automaticamente quais partes cada estudante pode receber baseado no cargo e regras S-38-T.',
        target: '[data-tutorial="qualifications-badge"]',
        position: 'left'
      },
      {
        id: 'statistics-view',
        title: 'Estatísticas Detalhadas',
        content: 'Visualize estatísticas da congregação: distribuição por cargo, gênero, idade e participação.',
        target: '[data-value="stats"]',
        position: 'bottom',
        action: 'click'
      }
    ]
  },
  {
    id: 'instructor-dashboard',
    title: 'Painel do Instrutor',
    description: 'Gerencie qualificações e progresso dos estudantes com ferramentas interativas',
    page: 'estudantes',
    category: 'advanced',
    estimatedTime: 8,
    prerequisites: ['students-basic'],
    steps: [
      {
        id: 'instructor-tab',
        title: 'Painel do Instrutor',
        content: 'Acesse o painel interativo do instrutor para gerenciar qualificações e progresso dos estudantes da Escola Ministerial.',
        target: '[data-value="instructor"]',
        position: 'bottom',
        action: 'click'
      },
      {
        id: 'dashboard-stats',
        title: 'Estatísticas do Instrutor',
        content: 'Visualize estatísticas detalhadas sobre progresso, qualificações e distribuição dos estudantes.',
        target: '[data-tutorial="instructor-stats"]',
        position: 'bottom'
      },
      {
        id: 'progress-board',
        title: 'Quadro de Progresso',
        content: 'Use o sistema de arrastar e soltar para mover estudantes entre níveis de progresso: Iniciante, Desenvolvimento, Qualificado e Avançado.',
        target: '[data-tutorial="progress-board"]',
        position: 'top'
      },
      {
        id: 'qualification-cards',
        title: 'Cartões de Qualificação',
        content: 'Edite as qualificações de cada estudante usando os switches para marcar quais tipos de designação eles podem receber.',
        target: '[data-tutorial="qualification-card"]',
        position: 'right'
      },
      {
        id: 'speech-categories',
        title: 'Categorização por Designação',
        content: 'Visualize estudantes organizados por tipos de designação S-38-T: Leitura da Bíblia, Discursos, Demonstrações.',
        target: '[data-tutorial="speech-categories"]',
        position: 'top'
      },
      {
        id: 'drag-drop-feature',
        title: 'Arrastar e Soltar',
        content: 'Arraste estudantes entre colunas para atualizar automaticamente seu nível de progresso e qualificações.',
        target: '[data-tutorial="drag-drop-area"]',
        position: 'center'
      }
    ]
  }
];

// Programas tutorials
const programasTutorials: Tutorial[] = [
  {
    id: 'programs-basic',
    title: 'Gestão de Programas',
    description: 'Aprenda a importar e gerenciar programas semanais da apostila',
    page: 'programas',
    category: 'basic',
    estimatedTime: 6,
    steps: [
      {
        id: 'programs-overview',
        title: 'Gestão de Programas',
        content: 'Importe e gerencie programas semanais da apostila "Nossa Vida e Ministério Cristão" com parsing automático.',
        target: 'h1:contains("Gestão de Programas")',
        position: 'bottom'
      },
      {
        id: 'import-methods',
        title: 'Métodos de Importação',
        content: 'Você pode importar programas de duas formas: fazendo upload de PDFs oficiais ou criando manualmente.',
        target: '[data-tutorial="import-section"]',
        position: 'bottom'
      },
      {
        id: 'pdf-upload',
        title: 'Upload de PDF',
        content: 'Arraste e solte ou clique para selecionar arquivos PDF dos programas. O sistema extrairá automaticamente as partes.',
        target: '[data-tutorial="pdf-upload"]',
        position: 'bottom'
      },
      {
        id: 'manual-creation',
        title: 'Criação Manual',
        content: 'Para casos especiais ou quando o PDF não está disponível, você pode criar programas manualmente.',
        target: '[data-tutorial="manual-create"]',
        position: 'bottom'
      },
      {
        id: 'programs-list',
        title: 'Lista de Programas',
        content: 'Visualize todos os programas importados com status, data de importação e partes identificadas.',
        target: '[data-tutorial="programs-list"]',
        position: 'top'
      },
      {
        id: 'program-actions',
        title: 'Ações do Programa',
        content: 'Para cada programa, você pode visualizar detalhes, editar informações ou gerar designações automáticas.',
        target: '[data-tutorial="program-actions"]',
        position: 'left'
      }
    ]
  }
];

// Designações tutorials
const designacoesTutorials: Tutorial[] = [
  {
    id: 'assignments-basic',
    title: 'Sistema de Designações Automáticas',
    description: 'Aprenda a gerar designações inteligentes seguindo as regras S-38-T',
    page: 'designacoes',
    category: 'basic',
    estimatedTime: 8,
    prerequisites: ['students-basic', 'programs-basic'],
    steps: [
      {
        id: 'assignments-overview',
        title: 'Designações Automáticas',
        content: 'Gere designações automáticas com algoritmo inteligente que respeita todas as regras da Escola do Ministério Teocrático.',
        target: 'h1:contains("Gestão de Designações")',
        position: 'bottom'
      },
      {
        id: 'generate-button',
        title: 'Gerar Designações',
        content: 'Clique neste botão para iniciar o processo de geração automática de designações para uma semana específica.',
        target: '[data-tutorial="generate-assignments"]',
        position: 'bottom',
        action: 'click'
      },
      {
        id: 'week-selection',
        title: 'Seleção de Semana',
        content: 'Escolha a semana para a qual deseja gerar designações. O sistema mostrará se já existem designações para regeneração.',
        target: '[data-tutorial="week-selector"]',
        position: 'right'
      },
      {
        id: 'preview-modal',
        title: 'Prévia das Designações',
        content: 'Revise as designações geradas antes de confirmar. Você pode ver estatísticas, validações e regenerar se necessário.',
        target: '[data-tutorial="preview-modal"]',
        position: 'center'
      },
      {
        id: 's38t-rules',
        title: 'Regras S-38-T Aplicadas',
        content: 'O sistema aplica automaticamente: Parte 3 apenas para homens, discursos para qualificados, pares familiares para gêneros diferentes.',
        target: '[data-tutorial="rules-info"]',
        position: 'left'
      },
      {
        id: 'balancing-system',
        title: 'Sistema de Balanceamento',
        content: 'O algoritmo considera o histórico das últimas 8 semanas para distribuir as designações de forma equilibrada.',
        target: '[data-tutorial="balancing-info"]',
        position: 'left'
      },
      {
        id: 'assignments-list',
        title: 'Lista de Designações',
        content: 'Visualize todas as designações por semana com status, data de geração e opções para regenerar ou exportar.',
        target: '[data-tutorial="assignments-list"]',
        position: 'top'
      }
    ]
  },
  {
    id: 'assignments-advanced',
    title: 'Recursos Avançados de Designações',
    description: 'Explore funcionalidades avançadas como regeneração e relatórios',
    page: 'designacoes',
    category: 'advanced',
    estimatedTime: 5,
    prerequisites: ['assignments-basic'],
    steps: [
      {
        id: 'regeneration',
        title: 'Regeneração de Designações',
        content: 'Se não estiver satisfeito com as designações, você pode regenerá-las. O sistema criará uma nova distribuição.',
        target: '[data-tutorial="regenerate-button"]',
        position: 'bottom'
      },
      {
        id: 'validation-system',
        title: 'Sistema de Validação',
        content: 'O sistema valida automaticamente conflitos, qualificações inadequadas e relacionamentos familiares.',
        target: '[data-tutorial="validation-tab"]',
        position: 'bottom'
      },
      {
        id: 'export-options',
        title: 'Opções de Exportação',
        content: 'Exporte designações para PDF, Excel ou envie por email diretamente para os estudantes.',
        target: '[data-tutorial="export-options"]',
        position: 'left'
      }
    ]
  }
];

// Developer Panel tutorials
const developerPanelTutorials: Tutorial[] = [
  {
    id: 'developer-panel-overview',
    title: 'Painel de Desenvolvedor - Visão Geral',
    description: 'Aprenda a usar o painel de desenvolvedor para processar apostilas JW.org e gerar templates para instrutores',
    page: 'developer-panel',
    category: 'basic',
    estimatedTime: 10,
    steps: [
      {
        id: 'developer-welcome',
        title: 'Bem-vindo ao Painel de Desenvolvedor! 🛠️',
        content: 'Este painel permite processar apostilas JW.org e gerar templates Excel para instrutores. Você centraliza o trabalho técnico para simplificar a vida dos instrutores.',
        target: 'h1:contains("Painel de Desenvolvedor")',
        position: 'bottom'
      },
      {
        id: 'developer-tabs',
        title: 'Navegação por Abas',
        content: 'O painel possui 3 abas principais: Processar Conteúdo (para criar templates), Templates (para gerenciar), e Estatísticas (para monitorar uso).',
        target: '[role="tablist"]',
        position: 'bottom'
      },
      {
        id: 'process-content-tab',
        title: 'Aba Processar Conteúdo',
        content: 'Aqui você cola o conteúdo da apostila JW.org, processa automaticamente e gera templates Excel profissionais.',
        target: '[data-value="process"]',
        position: 'bottom',
        action: 'click'
      }
    ]
  },
  {
    id: 'developer-content-processing',
    title: 'Processamento de Conteúdo JW.org',
    description: 'Tutorial completo sobre como processar conteúdo da apostila e gerar templates',
    page: 'developer-panel',
    category: 'workflow',
    estimatedTime: 15,
    steps: [
      {
        id: 'paste-content',
        title: 'Cole o Conteúdo da Apostila',
        content: 'Vá ao JW.org, copie o conteúdo completo da página da apostila "Nossa Vida e Ministério Cristão" e cole aqui. O sistema identificará automaticamente as 12 partes da reunião.',
        target: '#content',
        position: 'top'
      },
      {
        id: 'set-dates',
        title: 'Configure as Datas',
        content: 'Defina a data de início e fim da semana. Isso ajuda na organização e identificação do programa.',
        target: '#weekStart',
        position: 'bottom'
      },
      {
        id: 'congregation-name',
        title: 'Nome da Congregação (Opcional)',
        content: 'Adicione o nome da congregação se quiser personalizar o template. Isso aparecerá no cabeçalho do Excel.',
        target: '#congregation',
        position: 'bottom'
      },
      {
        id: 'process-button',
        title: 'Processar Conteúdo',
        content: 'Clique para processar o conteúdo. O sistema extrairá automaticamente: partes da reunião, cânticos, leitura bíblica, tempos e tipos de designação.',
        target: 'button:contains("Processar Conteúdo")',
        position: 'top',
        action: 'click'
      },
      {
        id: 'review-parsed',
        title: 'Revisar Conteúdo Processado',
        content: 'Após o processamento, revise as informações extraídas. Verifique se todas as 12 partes foram identificadas corretamente.',
        target: '[role="alert"]',
        position: 'top'
      },
      {
        id: 'generate-template',
        title: 'Gerar Template Excel',
        content: 'Com o conteúdo processado, gere o template Excel. Ele incluirá instruções, validação e formatação profissional.',
        target: 'button:contains("Gerar Template Excel")',
        position: 'top',
        action: 'click'
      },
      {
        id: 'processing-notes',
        title: 'Notas de Processamento',
        content: 'Adicione notas sobre o processamento, observações especiais ou instruções para instrutores.',
        target: '#notes',
        position: 'top'
      }
    ]
  },
  {
    id: 'developer-template-management',
    title: 'Gerenciamento de Templates',
    description: 'Como gerenciar, publicar e monitorar templates criados',
    page: 'developer-panel',
    category: 'advanced',
    estimatedTime: 8,
    steps: [
      {
        id: 'templates-tab',
        title: 'Aba Templates',
        content: 'Aqui você visualiza todos os templates processados, seus status e pode publicá-los para instrutores.',
        target: '[data-value="templates"]',
        position: 'bottom',
        action: 'click'
      },
      {
        id: 'template-status',
        title: 'Status dos Templates',
        content: 'Templates têm diferentes status: Pendente (aguardando), Template Pronto (gerado), Publicado (disponível para instrutores).',
        target: '.badge',
        position: 'left'
      },
      {
        id: 'publish-template',
        title: 'Publicar Template',
        content: 'Quando um template está pronto, clique em "Publicar" para disponibilizá-lo na biblioteca de templates dos instrutores.',
        target: 'button:contains("Publicar")',
        position: 'top'
      },
      {
        id: 'template-details',
        title: 'Detalhes do Template',
        content: 'Cada template mostra: número de partes, tempo total, data de processamento e notas. Use essas informações para controle de qualidade.',
        target: '.grid',
        position: 'top'
      }
    ]
  }
];

// Template Library tutorials
const templateLibraryTutorials: Tutorial[] = [
  {
    id: 'template-library-overview',
    title: 'Biblioteca de Templates - Visão Geral',
    description: 'Aprenda a navegar na biblioteca de templates e baixar programas pré-processados',
    page: 'template-library',
    category: 'basic',
    estimatedTime: 5,
    steps: [
      {
        id: 'library-welcome',
        title: 'Bem-vindo à Biblioteca de Templates! 📚',
        content: 'Aqui você encontra templates pré-processados pelos desenvolvedores. Baixe, preencha com nomes dos estudantes e faça upload - é muito mais simples!',
        target: 'h2:contains("Biblioteca de Templates")',
        position: 'bottom'
      },
      {
        id: 'available-templates',
        title: 'Templates Disponíveis',
        content: 'Cada template mostra a semana, data, leitura bíblica e número de partes. Todos foram processados e validados pelos desenvolvedores.',
        target: '.grid',
        position: 'top'
      },
      {
        id: 'search-filter',
        title: 'Busca e Filtros',
        content: 'Use a busca para encontrar templates por semana ou leitura bíblica. Os filtros ajudam a organizar por data.',
        target: 'input[placeholder*="Buscar"]',
        position: 'bottom'
      }
    ]
  },
  {
    id: 'template-download-workflow',
    title: 'Fluxo de Download e Upload',
    description: 'Tutorial completo do novo fluxo simplificado para instrutores',
    page: 'template-library',
    category: 'workflow',
    estimatedTime: 12,
    steps: [
      {
        id: 'select-template',
        title: 'Selecionar Template',
        content: 'Escolha o template da semana desejada. Verifique a data e leitura bíblica para confirmar que é o programa correto.',
        target: '.card',
        position: 'right'
      },
      {
        id: 'template-info',
        title: 'Informações do Template',
        content: 'Cada template mostra: número de partes (normalmente 12), tempo total da reunião, cânticos e data de processamento.',
        target: '.grid',
        position: 'top'
      },
      {
        id: 'download-excel',
        title: 'Baixar Template Excel',
        content: 'Clique em "Baixar Template Excel" para obter o arquivo. Ele virá com todas as partes pré-preenchidas e instruções detalhadas.',
        target: 'button:contains("Baixar Template Excel")',
        position: 'top',
        action: 'click'
      },
      {
        id: 'excel-structure',
        title: 'Estrutura do Excel',
        content: 'O Excel baixado contém: 1) Aba principal com as designações, 2) Aba de instruções com regras S-38-T, 3) Aba de validação com listas.',
        target: 'body',
        position: 'center'
      },
      {
        id: 'fill-students',
        title: 'Preencher Estudantes',
        content: 'No Excel, preencha APENAS as colunas "Estudante Principal" e "Ajudante" com os nomes dos estudantes. Não altere outras colunas.',
        target: 'body',
        position: 'center'
      },
      {
        id: 'upload-completed',
        title: 'Upload da Planilha Preenchida',
        content: 'Após preencher, volte aqui e clique em "Upload Preenchido" para enviar o arquivo. O sistema gerará as designações automaticamente.',
        target: 'button:contains("Upload Preenchido")',
        position: 'top'
      },
      {
        id: 'automatic-processing',
        title: 'Processamento Automático',
        content: 'O sistema processará sua planilha, aplicará as regras S-38-T e gerará as designações finais. Você será redirecionado para a página de revisão.',
        target: 'body',
        position: 'center'
      }
    ]
  }
];

// Program Preview tutorials
const programPreviewTutorials: Tutorial[] = [
  {
    id: 'program-preview-overview',
    title: 'Revisão de Programa - Visão Geral',
    description: 'Aprenda a revisar, editar e aprovar programas gerados automaticamente',
    page: 'program-preview',
    category: 'basic',
    estimatedTime: 8,
    steps: [
      {
        id: 'preview-welcome',
        title: 'Página de Revisão do Programa 📋',
        content: 'Aqui você revisa as designações geradas antes de finalizá-las. Pode editar designações individuais e aprovar quando estiver satisfeito.',
        target: 'h1',
        position: 'bottom'
      },
      {
        id: 'program-info',
        title: 'Informações do Programa',
        content: 'Veja detalhes do programa: semana, data, arquivo importado e status atual. Confirme se está revisando o programa correto.',
        target: '.card:first',
        position: 'bottom'
      },
      {
        id: 'assignments-list',
        title: 'Lista de Designações',
        content: 'Todas as 12 designações são exibidas com: número da parte, título, tipo, tempo, estudante designado e ajudante (quando aplicável).',
        target: '.space-y-4',
        position: 'left'
      },
      {
        id: 'compliance-indicators',
        title: 'Indicadores de Conformidade S-38-T',
        content: 'Badges coloridos mostram: restrições de gênero (♂️ Apenas Homens), qualificações necessárias e se a designação está conforme as regras.',
        target: '.badge',
        position: 'top'
      }
    ]
  },
  {
    id: 'program-editing-workflow',
    title: 'Editando Designações Individuais',
    description: 'Como editar designações específicas sem regenerar todo o programa',
    page: 'program-preview',
    category: 'workflow',
    estimatedTime: 10,
    steps: [
      {
        id: 'edit-button',
        title: 'Botão de Edição',
        content: 'Cada designação tem um botão de edição (ícone de lápis). Clique para abrir o modal de edição da designação específica.',
        target: 'button[title*="Editar"]',
        position: 'left',
        action: 'click'
      },
      {
        id: 'edit-modal',
        title: 'Modal de Edição',
        content: 'O modal mostra todos os detalhes da designação: título, tempo, cenário, estudante principal e ajudante. Você pode modificar qualquer campo.',
        target: '.dialog-content',
        position: 'center'
      },
      {
        id: 'student-selection',
        title: 'Seleção de Estudantes',
        content: 'Os dropdowns de estudantes são filtrados automaticamente: apenas estudantes qualificados para aquele tipo de parte aparecem.',
        target: 'select',
        position: 'top'
      },
      {
        id: 'compliance-validation',
        title: 'Validação de Conformidade',
        content: 'O sistema valida em tempo real: se você selecionar um estudante não qualificado, aparecerá um aviso vermelho explicando o problema.',
        target: '.alert-destructive',
        position: 'top'
      },
      {
        id: 'save-changes',
        title: 'Salvar Alterações',
        content: 'Após fazer as alterações, clique em "Salvar Alterações". A designação será atualizada imediatamente na lista.',
        target: 'button:contains("Salvar Alterações")',
        position: 'top',
        action: 'click'
      }
    ]
  },
  {
    id: 'program-approval-workflow',
    title: 'Aprovação e Finalização',
    description: 'Como aprovar programas e disponibilizá-los para a congregação',
    page: 'program-preview',
    category: 'advanced',
    estimatedTime: 6,
    steps: [
      {
        id: 'review-all',
        title: 'Revisar Todas as Designações',
        content: 'Antes de aprovar, revise todas as 12 designações. Verifique se os estudantes estão corretos e se não há conflitos.',
        target: '.space-y-4',
        position: 'left'
      },
      {
        id: 'approve-button',
        title: 'Aprovar e Finalizar',
        content: 'Quando estiver satisfeito com todas as designações, clique em "Aprovar e Finalizar". Isso tornará o programa oficial.',
        target: 'button:contains("Aprovar e Finalizar")',
        position: 'top'
      },
      {
        id: 'regenerate-option',
        title: 'Opção de Regenerar',
        content: 'Se não estiver satisfeito, pode clicar em "Regenerar Designações" para criar um novo conjunto de designações automaticamente.',
        target: 'button:contains("Regenerar")',
        position: 'top'
      },
      {
        id: 'final-status',
        title: 'Status Final',
        content: 'Programas aprovados ficam disponíveis na página de Designações e podem ser baixados em PDF para distribuição na congregação.',
        target: '.badge:contains("Aprovado")',
        position: 'bottom'
      }
    ]
  }
];

// Meetings Management tutorials
const reunioesTutorials: Tutorial[] = [
  {
    id: 'meetings-overview',
    title: 'Gestão de Reuniões - Visão Geral',
    description: 'Aprenda a gerenciar reuniões, designações administrativas e eventos especiais',
    page: 'reunioes',
    category: 'basic',
    estimatedTime: 7,
    steps: [
      {
        id: 'meetings-welcome',
        title: 'Sistema de Gestão de Reuniões 🏛️',
        content: 'Gerencie todos os aspectos das reuniões: cronograma, designações administrativas, salas auxiliares e eventos especiais.',
        target: 'h1:contains("Reuniões")',
        position: 'bottom'
      },
      {
        id: 'meeting-types',
        title: 'Tipos de Reunião',
        content: 'O sistema suporta: reuniões regulares (meio de semana e fim de semana), visitas do superintendente de circuito, assembleias e eventos especiais.',
        target: '.card:first',
        position: 'bottom'
      },
      {
        id: 'administrative-roles',
        title: 'Designações Administrativas',
        content: 'Gerencie designações como: superintendente da reunião, presidente, conselheiro assistente e superintendentes de sala.',
        target: '.grid',
        position: 'top'
      }
    ]
  },
  {
    id: 'meetings-creation',
    title: 'Criando e Agendando Reuniões',
    description: 'Como criar diferentes tipos de reuniões e configurar detalhes',
    page: 'reunioes',
    category: 'workflow',
    estimatedTime: 12,
    steps: [
      {
        id: 'create-meeting',
        title: 'Criar Nova Reunião',
        content: 'Clique em "Nova Reunião" para começar. Escolha o tipo: reunião regular, visita do CO, assembleia ou evento especial.',
        target: 'button:contains("Nova Reunião")',
        position: 'bottom',
        action: 'click'
      },
      {
        id: 'meeting-details',
        title: 'Detalhes da Reunião',
        content: 'Preencha: data, horário de início e fim, tipo de reunião e título. Para visitas do CO, adicione o nome do superintendente.',
        target: 'form',
        position: 'right'
      },
      {
        id: 'special-events',
        title: 'Eventos Especiais',
        content: 'Para assembleias e convenções, configure: datas de início e fim, local, tema e se cancela reuniões regulares.',
        target: 'input[type="date"]',
        position: 'top'
      },
      {
        id: 'administrative-assignments',
        title: 'Designações Administrativas',
        content: 'Atribua irmãos qualificados para: presidente da reunião, superintendente, conselheiros e superintendentes de sala.',
        target: 'select',
        position: 'top'
      }
    ]
  },
  {
    id: 'room-management',
    title: 'Gerenciamento de Salas',
    description: 'Como configurar e gerenciar salas auxiliares e equipamentos',
    page: 'reunioes',
    category: 'advanced',
    estimatedTime: 8,
    steps: [
      {
        id: 'rooms-section',
        title: 'Seção de Salas',
        content: 'Gerencie salas auxiliares para a Escola do Ministério Teocrático. Configure capacidade, equipamentos e superintendentes.',
        target: '.rooms-section',
        position: 'top'
      },
      {
        id: 'add-room',
        title: 'Adicionar Sala',
        content: 'Clique em "Adicionar Sala" para criar uma nova sala auxiliar. Defina nome, tipo, capacidade e equipamentos disponíveis.',
        target: 'button:contains("Adicionar Sala")',
        position: 'bottom'
      },
      {
        id: 'room-overseer',
        title: 'Superintendente de Sala',
        content: 'Atribua um irmão qualificado como superintendente de cada sala. Ele será responsável pela ordem e equipamentos.',
        target: 'select[name*="overseer"]',
        position: 'top'
      },
      {
        id: 'equipment-list',
        title: 'Lista de Equipamentos',
        content: 'Configure equipamentos disponíveis: microfones, projetores, telas, quadros. Isso ajuda no planejamento das designações.',
        target: 'input[type="checkbox"]',
        position: 'left'
      }
    ]
  }
];

// Main configuration object
export const tutorialConfig: TutorialConfig = {
  tutorials: {
    dashboard: dashboardTutorials,
    estudantes: estudantesTutorials,
    programas: programasTutorials,
    designacoes: designacoesTutorials,
    reunioes: reunioesTutorials,
    relatorios: [], // To be implemented
    'developer-panel': developerPanelTutorials,
    'template-library': templateLibraryTutorials,
    'program-preview': programPreviewTutorials
  },
  defaultPreferences: {
    autoStart: false,
    showHints: true,
    animationSpeed: 'normal'
  },
  storageKeys: {
    completedTutorials: 'tutorial_completed',
    skippedTutorials: 'tutorial_skipped',
    userPreferences: 'tutorial_preferences'
  }
};

// Helper functions
export function getTutorialById(tutorialId: string): Tutorial | null {
  for (const page of Object.keys(tutorialConfig.tutorials) as TutorialPage[]) {
    const tutorial = tutorialConfig.tutorials[page].find(t => t.id === tutorialId);
    if (tutorial) return tutorial;
  }
  return null;
}

export function getTutorialsForPage(page: TutorialPage): Tutorial[] {
  return tutorialConfig.tutorials[page] || [];
}

export function getBasicTutorials(): Tutorial[] {
  return Object.values(tutorialConfig.tutorials)
    .flat()
    .filter(t => t.category === 'basic');
}

export function getAdvancedTutorials(): Tutorial[] {
  return Object.values(tutorialConfig.tutorials)
    .flat()
    .filter(t => t.category === 'advanced');
}

export function getWorkflowTutorials(): Tutorial[] {
  return Object.values(tutorialConfig.tutorials)
    .flat()
    .filter(t => t.category === 'workflow');
}

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

// Main configuration object
export const tutorialConfig: TutorialConfig = {
  tutorials: {
    dashboard: dashboardTutorials,
    estudantes: estudantesTutorials,
    programas: programasTutorials,
    designacoes: designacoesTutorials,
    reunioes: [], // To be implemented
    relatorios: [] // To be implemented
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

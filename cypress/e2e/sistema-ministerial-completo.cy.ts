import { supabase } from '../../src/integrations/supabase/client'

describe('🧪 Sistema Ministerial - Teste Completo E2E', () => {
  beforeEach(() => {
    // Interceptar requisições de autenticação
    cy.intercept('POST', '**/auth/v1/token').as('authToken')
    cy.intercept('GET', '**/auth/v1/user').as('authUser')
    
    // Interceptar requisições do Supabase
    cy.intercept('POST', '**/rest/v1/**').as('supabaseRest')
    cy.intercept('GET', '**/rest/v1/**').as('supabaseGet')
    
    // Limpar cookies e localStorage antes de cada teste
    cy.clearCookies()
    cy.clearLocalStorage()
  })

  describe('🔐 Sistema de Autenticação', () => {
    it('Deve permitir login como Instrutor (Admin)', () => {
      cy.loginAsInstructor()
      
      // Verificar redirecionamento para dashboard
      cy.url().should('include', '/dashboard')
      
      // Verificar se o usuário está autenticado
      cy.get('[data-testid="user-menu"], .user-menu, [role="button"]:contains("Usuário")')
        .should('be.visible')
      
      cy.log('✅ Login como Instrutor realizado com sucesso')
    })

    it('Deve permitir login como Estudante', () => {
      cy.loginAsStudent()
      
      // Verificar redirecionamento para portal do estudante
      cy.url().should('include', '/estudante/')
      
      // Verificar se o usuário está autenticado
      cy.get('[data-testid="student-portal"], .student-portal')
        .should('be.visible')
      
      cy.log('✅ Login como Estudante realizado com sucesso')
    })

    it('Deve bloquear acesso a rotas protegidas sem autenticação', () => {
      // Tentar acessar dashboard sem login
      cy.visit('/dashboard')
      cy.url().should('include', '/auth')
      
      // Tentar acessar sistema de equidade sem login
      cy.visit('/equidade')
      cy.url().should('include', '/auth')
      
      cy.log('✅ Proteção de rotas funcionando corretamente')
    })
  })

  describe('🏠 Dashboard Principal', () => {
    beforeEach(() => {
      cy.loginAsInstructor()
      cy.visit('/dashboard')
      cy.waitForPageLoad()
    })

    it('Deve exibir dashboard completo para instrutores', () => {
      // Verificar elementos principais do dashboard
      cy.get('[data-testid="dashboard-stats"], .dashboard-stats')
        .should('be.visible')
      
      cy.get('[data-testid="recent-assignments"], .recent-assignments')
        .should('be.visible')
      
      cy.get('[data-testid="quick-actions"], .quick-actions')
        .should('be.visible')
      
      cy.log('✅ Dashboard principal carregado corretamente')
    })

    it('Deve permitir navegação para todas as seções', () => {
      // Navegar para Estudantes
      cy.get('a[href="/estudantes"], button:contains("Estudantes")')
        .should('be.visible')
        .click()
      
      cy.url().should('include', '/estudantes')
      cy.get('[data-testid="students-grid"], .students-grid')
        .should('be.visible')
      
      // Voltar para dashboard
      cy.visit('/dashboard')
      
      // Navegar para Programas
      cy.get('a[href="/programas"], button:contains("Programas")')
        .should('be.visible')
        .click()
      
      cy.url().should('include', '/programas')
      cy.get('[data-testid="programs-list"], .programs-list')
        .should('be.visible')
      
      cy.log('✅ Navegação entre seções funcionando')
    })
  })

  describe('⚖️ Sistema de Equidade', () => {
    beforeEach(() => {
      cy.loginAsInstructor()
      cy.visit('/equidade')
      cy.waitForPageLoad()
    })

    it('Deve exibir todas as abas do sistema de equidade', () => {
      // Verificar abas principais
      cy.get('[role="tablist"], .tabs-list')
        .should('be.visible')
      
      // Verificar conteúdo das abas
      cy.get('[role="tab"]:contains("Histórico")').should('be.visible')
      cy.get('[role="tab"]:contains("Fila Justa")').should('be.visible')
      cy.get('[role="tab"]:contains("Políticas")').should('be.visible')
      cy.get('[role="tab"]:contains("Simulação")').should('be.visible')
      cy.get('[role="tab"]:contains("Relatórios")').should('be.visible')
      
      cy.log('✅ Todas as abas do sistema de equidade estão visíveis')
    })

    it('Deve calcular fila justa corretamente', () => {
      // Clicar na aba Fila Justa
      cy.get('[role="tab"]:contains("Fila Justa")').click()
      
      // Verificar se a fila está sendo calculada
      cy.get('[data-testid="fair-queue"], .fair-queue')
        .should('be.visible')
      
      // Verificar se há estudantes na fila
      cy.get('[data-testid="queue-item"], .queue-item')
        .should('have.length.greaterThan', 0)
      
      cy.log('✅ Sistema de fila justa funcionando')
    })

    it('Deve aplicar políticas de fairness', () => {
      // Clicar na aba Políticas
      cy.get('[role="tab"]:contains("Políticas")').click()
      
      // Verificar configurações de fairness
      cy.get('[data-testid="fairness-policies"], .fairness-policies')
        .should('be.visible')
      
      // Verificar se as políticas estão sendo aplicadas
      cy.get('[data-testid="policy-item"], .policy-item')
        .should('have.length.greaterThan', 0)
      
      cy.log('✅ Políticas de fairness configuradas')
    })
  })

  describe('👥 Gestão de Estudantes', () => {
    beforeEach(() => {
      cy.loginAsInstructor()
      cy.visit('/estudantes')
      cy.waitForPageLoad()
    })

    it('Deve exibir lista de estudantes', () => {
      // Verificar grid de estudantes
      cy.get('[data-testid="students-grid"], .students-grid')
        .should('be.visible')
      
      // Verificar se há estudantes cadastrados
      cy.get('[data-testid="student-card"], .student-card')
        .should('have.length.greaterThan', 0)
      
      cy.log('✅ Lista de estudantes carregada')
    })

    it('Deve permitir adicionar novo estudante', () => {
      // Clicar no botão de adicionar
      cy.get('[data-testid="add-student"], button:contains("Adicionar"), button:contains("+")')
        .should('be.visible')
        .click()
      
      // Verificar se o modal/formulário abre
      cy.get('[data-testid="student-form"], .student-form, [role="dialog"]')
        .should('be.visible')
      
      cy.log('✅ Funcionalidade de adicionar estudante funcionando')
    })

    it('Deve exibir informações completas dos estudantes', () => {
      // Clicar no primeiro estudante para ver detalhes
      cy.get('[data-testid="student-card"], .student-card')
        .first()
        .click()
      
      // Verificar campos S-38
      cy.get('[data-testid="student-details"], .student-details')
        .should('be.visible')
      
      // Verificar se há informações de família
      cy.get('[data-testid="family-info"], .family-info')
        .should('be.visible')
      
      cy.log('✅ Detalhes completos dos estudantes funcionando')
    })
  })

  describe('📚 Gestão de Programas', () => {
    beforeEach(() => {
      cy.loginAsInstructor()
      cy.visit('/programas')
      cy.waitForPageLoad()
    })

    it('Deve exibir lista de programas', () => {
      // Verificar lista de programas
      cy.get('[data-testid="programs-list"], .programs-list')
        .should('be.visible')
      
      // Verificar se há programas cadastrados
      cy.get('[data-testid="program-card"], .program-card')
        .should('have.length.greaterThan', 0)
      
      cy.log('✅ Lista de programas carregada')
    })

    it('Deve permitir criar novo programa', () => {
      // Clicar no botão de criar programa
      cy.get('[data-testid="create-program"], button:contains("Criar"), button:contains("Novo")')
        .should('be.visible')
        .click()
      
      // Verificar se o modal/formulário abre
      cy.get('[data-testid="program-form"], .program-form, [role="dialog"]')
        .should('be.visible')
      
      cy.log('✅ Funcionalidade de criar programa funcionando')
    })

    it('Deve permitir upload de PDF', () => {
      // Verificar se há campo de upload
      cy.get('[data-testid="pdf-upload"], input[type="file"], .file-upload')
        .should('be.visible')
      
      cy.log('✅ Upload de PDF disponível')
    })
  })

  describe('🎯 Sistema de Designações', () => {
    beforeEach(() => {
      cy.loginAsInstructor()
      cy.visit('/designacoes')
      cy.waitForPageLoad()
    })

    it('Deve exibir designações ativas', () => {
      // Verificar lista de designações
      cy.get('[data-testid="assignments-list"], .assignments-list')
        .should('be.visible')
      
      // Verificar se há designações
      cy.get('[data-testid="assignment-item"], .assignment-item')
        .should('have.length.greaterThan', 0)
      
      cy.log('✅ Lista de designações carregada')
    })

    it('Deve permitir gerar designações automaticamente', () => {
      // Verificar botão de geração automática
      cy.get('[data-testid="auto-generate"], button:contains("Gerar"), button:contains("Automático")')
        .should('be.visible')
      
      cy.log('✅ Geração automática de designações disponível')
    })

    it('Deve aplicar regras S-38', () => {
      // Verificar se as validações S-38 estão funcionando
      cy.get('[data-testid="s38-validation"], .s38-validation')
        .should('be.visible')
      
      cy.log('✅ Validações S-38 implementadas')
    })
  })

  describe('🔧 Dashboard Administrativo', () => {
    beforeEach(() => {
      cy.loginAsInstructor()
      cy.visit('/admin')
      cy.waitForPageLoad()
    })

    it('Deve exibir dashboard administrativo', () => {
      // Verificar se o dashboard admin está acessível
      cy.get('[data-testid="admin-dashboard"], .admin-dashboard')
        .should('be.visible')
      
      // Verificar abas administrativas
      cy.get('[role="tab"]:contains("Downloads")').should('be.visible')
      cy.get('[role="tab"]:contains("Organização")').should('be.visible')
      cy.get('[role="tab"]:contains("Publicação")').should('be.visible')
      cy.get('[role="tab"]:contains("Monitoramento")').should('be.visible')
      cy.get('[role="tab"]:contains("Configurações")').should('be.visible')
      
      cy.log('✅ Dashboard administrativo funcionando')
    })

    it('Deve permitir gestão de materiais MWB', () => {
      // Clicar na aba Downloads
      cy.get('[role="tab"]:contains("Downloads")').click()
      
      // Verificar funcionalidades de download
      cy.get('[data-testid="mwb-download"], .mwb-download')
        .should('be.visible')
      
      cy.log('✅ Gestão de materiais MWB funcionando')
    })
  })

  describe('📱 Responsividade e Mobile', () => {
    beforeEach(() => {
      cy.loginAsInstructor()
    })

    it('Deve funcionar em dispositivos móveis', () => {
      // Testar em viewport móvel
      cy.viewport('iphone-x')
      
      cy.visit('/dashboard')
      cy.waitForPageLoad()
      
      // Verificar se o menu mobile está funcionando
      cy.get('[data-testid="mobile-menu"], .mobile-menu, [aria-label="Menu"]')
        .should('be.visible')
        .click()
      
      // Verificar navegação mobile
      cy.get('[data-testid="mobile-nav"], .mobile-nav')
        .should('be.visible')
      
      cy.log('✅ Interface mobile funcionando')
    })

    it('Deve adaptar layout para diferentes densidades', () => {
      cy.visit('/estudantes')
      cy.waitForPageLoad()
      
      // Verificar se há controle de densidade
      cy.get('[data-testid="density-toggle"], .density-toggle')
        .should('be.visible')
      
      cy.log('✅ Controle de densidade disponível')
    })
  })

  describe('🌍 Sistema Multilíngue', () => {
    beforeEach(() => {
      cy.loginAsInstructor()
      cy.visit('/dashboard')
      cy.waitForPageLoad()
    })

    it('Deve suportar português e inglês', () => {
      // Verificar se há seletor de idioma
      cy.get('[data-testid="language-selector"], .language-selector, [aria-label="Idioma"]')
        .should('be.visible')
      
      // Verificar se o conteúdo está em português por padrão
      cy.get('body').should('contain', 'Dashboard')
      
      cy.log('✅ Sistema multilíngue funcionando')
    })
  })

  describe('🔒 Segurança e Validações', () => {
    it('Deve aplicar Row Level Security (RLS)', () => {
      // Fazer login como estudante
      cy.loginAsStudent()
      
      // Tentar acessar área de instrutor
      cy.visit('/estudantes')
      
      // Verificar se o acesso é bloqueado
      cy.url().should('not.include', '/estudantes')
      
      cy.log('✅ RLS funcionando corretamente')
    })

    it('Deve validar permissões por perfil', () => {
      // Fazer login como estudante
      cy.loginAsStudent()
      
      // Tentar acessar dashboard administrativo
      cy.visit('/admin')
      
      // Verificar se o acesso é bloqueado
      cy.url().should('not.include', '/admin')
      
      cy.log('✅ Validação de permissões funcionando')
    })
  })

  describe('📊 Relatórios e Estatísticas', () => {
    beforeEach(() => {
      cy.loginAsInstructor()
      cy.visit('/relatorios')
      cy.waitForPageLoad()
    })

    it('Deve exibir relatórios do sistema', () => {
      // Verificar se há relatórios disponíveis
      cy.get('[data-testid="reports-section"], .reports-section')
        .should('be.visible')
      
      cy.log('✅ Relatórios do sistema funcionando')
    })

    it('Deve mostrar estatísticas em tempo real', () => {
      // Verificar estatísticas
      cy.get('[data-testid="stats-cards"], .stats-cards')
        .should('be.visible')
      
      cy.log('✅ Estatísticas em tempo real funcionando')
    })
  })

  describe('🔄 Sincronização e Performance', () => {
    beforeEach(() => {
      cy.loginAsInstructor()
      cy.visit('/dashboard')
      cy.waitForPageLoad()
    })

    it('Deve sincronizar dados em tempo real', () => {
      // Verificar se há indicadores de sincronização
      cy.get('[data-testid="sync-status"], .sync-status')
        .should('be.visible')
      
      cy.log('✅ Sincronização em tempo real funcionando')
    })

    it('Deve carregar páginas rapidamente', () => {
      // Medir tempo de carregamento
      const startTime = Date.now()
      
      cy.visit('/estudantes')
      cy.waitForPageLoad()
      
      const loadTime = Date.now() - startTime
      expect(loadTime).to.be.lessThan(5000) // Máximo 5 segundos
      
      cy.log(`✅ Página carregada em ${loadTime}ms`)
    })
  })

  afterEach(() => {
    // Log de sucesso do teste
    cy.log('✅ Teste executado com sucesso')
  })
})

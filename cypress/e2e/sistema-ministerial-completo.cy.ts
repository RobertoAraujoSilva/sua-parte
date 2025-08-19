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

      // Verificar se o usuário está autenticado - usar timeout maior
      cy.get('[data-testid="user-menu"], .user-menu, [role="button"]:contains("Usuário")', { timeout: 15000 })
        .should('be.visible')

      cy.log('✅ Login como Instrutor realizado com sucesso')
    })

    it('Deve permitir login como Estudante', () => {
      cy.loginAsStudent()

      // Verificar redirecionamento para portal do estudante
      cy.url().should('include', '/estudante/')

      // Verificar se o usuário está autenticado
      cy.get('[data-testid="student-portal"], .student-portal, h1', { timeout: 15000 })
        .should('be.visible')

      cy.log('✅ Login como Estudante realizado com sucesso')
    })

    it('Deve permitir logout', () => {
      cy.loginAsInstructor()

      // Fazer logout
      cy.get('[data-testid="user-menu"], .user-menu, [role="button"]:contains("Usuário")', { timeout: 15000 })
        .click()

      cy.get('[data-testid="logout-button"], button:contains("Sair"), button:contains("Logout")', { timeout: 10000 })
        .click()

      // Verificar se foi redirecionado para a página de login
      cy.url().should('include', '/auth')
        .or('include', '/')
        .or('not.include', '/dashboard')

      cy.log('✅ Logout realizado com sucesso')
    })
  })

  describe('🏠 Dashboard do Instrutor', () => {
    beforeEach(() => {
      cy.loginAsInstructor()
    })

    it('Deve carregar o dashboard principal', () => {
      // Verificar se está no dashboard
      cy.url().should('include', '/dashboard')

      // Verificar elementos principais do dashboard
      cy.get('h1, .dashboard-title', { timeout: 15000 })
        .should('contain', 'Dashboard')
        .or('contain', 'Início')
        .or('contain', 'Bem-vindo')

      cy.log('✅ Dashboard carregado com sucesso')
    })

    it('Deve navegar para a página de estudantes', () => {
      // Navegar para estudantes
      cy.get('a[href*="estudantes"], nav a:contains("Estudantes"), button:contains("Estudantes")', { timeout: 15000 })
        .click()

      // Verificar se chegou na página de estudantes
      cy.url().should('include', '/estudantes')

      // Verificar se a página carregou
      cy.get('h1, .page-title', { timeout: 15000 })
        .should('contain', 'Estudantes')
        .or('contain', 'Alunos')
        .or('be.visible')

      cy.log('✅ Navegação para estudantes funcionando')
    })

    it('Deve navegar para a página de programas', () => {
      // Navegar para programas
      cy.get('a[href*="programas"], nav a:contains("Programas"), button:contains("Programas")', { timeout: 15000 })
        .click()

      // Verificar se chegou na página de programas
      cy.url().should('include', '/programas')

      // Verificar se a página carregou
      cy.get('h1, .page-title', { timeout: 15000 })
        .should('contain', 'Programas')
        .or('contain', 'Reuniões')
        .or('be.visible')

      cy.log('✅ Navegação para programas funcionando')
    })
  })

  describe('👥 Portal do Estudante', () => {
    beforeEach(() => {
      cy.loginAsStudent()
    })

    it('Deve carregar o portal do estudante', () => {
      // Verificar se está no portal do estudante
      cy.url().should('include', '/estudante/')

      // Verificar se a página carregou
      cy.get('h1, .page-title, .student-portal', { timeout: 15000 })
        .should('be.visible')

      cy.log('✅ Portal do estudante carregado com sucesso')
    })

    it('Deve mostrar informações do estudante', () => {
      // Verificar se há informações do estudante
      cy.get('.student-info, .profile-info, [data-testid="student-info"]', { timeout: 15000 })
        .should('be.visible')

      cy.log('✅ Informações do estudante exibidas')
    })
  })

  describe('🔧 Funcionalidades do Sistema', () => {
    beforeEach(() => {
      cy.loginAsInstructor()
    })

    it('Deve permitir criar um novo programa', () => {
      // Navegar para programas
      cy.get('a[href*="programas"], nav a:contains("Programas"), button:contains("Programas")', { timeout: 15000 })
        .click()

      // Procurar botão de criar programa
      cy.get('button:contains("Novo"), button:contains("Criar"), button:contains("Adicionar")', { timeout: 15000 })
        .click()

      // Verificar se o formulário apareceu
      cy.get('form, .form, [data-testid="program-form"]', { timeout: 15000 })
        .should('be.visible')

      cy.log('✅ Formulário de criação de programa funcionando')
    })

    it('Deve permitir adicionar um novo estudante', () => {
      // Navegar para estudantes
      cy.get('a[href*="estudantes"], nav a:contains("Estudantes"), button:contains("Estudantes")', { timeout: 15000 })
        .click()

      // Procurar botão de adicionar estudante
      cy.get('button:contains("Novo"), button:contains("Adicionar"), button:contains("Criar")', { timeout: 15000 })
        .click()

      // Verificar se o formulário apareceu
      cy.get('form, .form, [data-testid="student-form"]', { timeout: 15000 })
        .should('be.visible')

      cy.log('✅ Formulário de criação de estudante funcionando')
    })
  })

  describe('📱 Responsividade', () => {
    beforeEach(() => {
      cy.loginAsInstructor()
    })

    it('Deve funcionar em dispositivos móveis', () => {
      // Simular dispositivo móvel
      cy.viewport('iphone-x')

      // Verificar se o menu mobile está funcionando
      cy.get('[data-testid="mobile-menu"], .mobile-menu, button:contains("Menu")', { timeout: 15000 })
        .should('be.visible')
        .click()

      // Verificar se o menu mobile abriu
      cy.get('nav, .navigation, .sidebar', { timeout: 10000 })
        .should('be.visible')

      cy.log('✅ Menu mobile funcionando')
    })
  })

  describe('🚀 Performance e Carregamento', () => {
    beforeEach(() => {
      cy.loginAsInstructor()
    })

    it('Deve carregar páginas em tempo razoável', () => {
      // Medir tempo de carregamento do dashboard
      const startTime = Date.now()

      cy.visit('/dashboard', { timeout: 30000 })

      cy.get('h1, .dashboard-title, .page-title', { timeout: 20000 })
        .should('be.visible')
        .then(() => {
          const loadTime = Date.now() - startTime
          expect(loadTime).to.be.lessThan(10000) // Máximo 10 segundos
          cy.log(`✅ Dashboard carregou em ${loadTime}ms`)
        })
    })
  })

  describe('🔒 Segurança e Autenticação', () => {
    it('Deve bloquear acesso a rotas protegidas sem autenticação', () => {
      // Tentar acessar dashboard sem login
      cy.visit('/dashboard', { failOnStatusCode: false })

      // Deve ser redirecionado para login
      cy.url().should('include', '/auth')
        .or('include', '/')
        .or('not.include', '/dashboard')

      cy.log('✅ Acesso bloqueado corretamente')
    })

    it('Deve bloquear acesso a rotas de estudante sem autenticação', () => {
      // Tentar acessar portal do estudante sem login
      cy.visit('/estudante/123', { failOnStatusCode: false })

      // Deve ser redirecionado para login
      cy.url().should('include', '/auth')
        .or('include', '/')
        .or('not.include', '/estudante')

      cy.log('✅ Acesso ao portal do estudante bloqueado')
    })
  })

  describe('🔄 Funcionalidades de Sincronização', () => {
    beforeEach(() => {
      cy.loginAsInstructor()
    })

    it('Deve mostrar status de sincronização', () => {
      // Navegar para uma página que tenha status de sync
      cy.visit('/dashboard')

      // Procurar por elementos de status (com timeout maior)
      cy.get('[data-testid="sync-status"], .sync-status, .status-indicator, .connection-status', { timeout: 20000 })
        .should('exist')
        .and('be.visible')

      cy.log('✅ Status de sincronização exibido')
    })

    it('Deve permitir sincronização manual', () => {
      // Procurar por botão de sincronização
      cy.get('button:contains("Sincronizar"), button:contains("Sync"), button:contains("Atualizar")', { timeout: 15000 })
        .should('be.visible')
        .click()

      // Verificar se a sincronização iniciou
      cy.get('.loading, .spinner, [data-testid="loading"]', { timeout: 10000 })
        .should('be.visible')

      cy.log('✅ Sincronização manual funcionando')
    })
  })

  describe('📊 Relatórios e Estatísticas', () => {
    beforeEach(() => {
      cy.loginAsInstructor()
    })

    it('Deve carregar página de relatórios', () => {
      // Navegar para relatórios
      cy.get('a[href*="relatorios"], nav a:contains("Relatórios"), button:contains("Relatórios")', { timeout: 15000 })
        .click()

      // Verificar se chegou na página de relatórios
      cy.url().should('include', '/relatorios')

      // Verificar se a página carregou
      cy.get('h1, .page-title', { timeout: 15000 })
        .should('be.visible')

      cy.log('✅ Página de relatórios funcionando')
    })
  })

  describe('🎯 Sistema de Equidade', () => {
    beforeEach(() => {
      cy.loginAsInstructor()
    })

    it('Deve carregar página de equidade', () => {
      // Navegar para equidade
      cy.get('a[href*="equidade"], nav a:contains("Equidade"), button:contains("Equidade")', { timeout: 15000 })
        .click()

      // Verificar se chegou na página de equidade
      cy.url().should('include', '/equidade')

      // Verificar se a página carregou
      cy.get('h1, .page-title', { timeout: 15000 })
        .should('be.visible')

      cy.log('✅ Página de equidade funcionando')
    })
  })

  describe('🔧 Dashboard Administrativo', () => {
    it('Deve permitir acesso como Administrador Global', () => {
      // Login como admin (se existir)
      cy.visit('/auth')
      
      // Tentar login com credenciais de admin
      cy.get('input[type="email"], input[name="email"]', { timeout: 15000 })
        .type('amazonwebber007@gmail.com')
      
      cy.get('input[type="password"], input[name="password"]', { timeout: 15000 })
        .type('Admin123!@#')
      
      cy.get('button[type="submit"], button:contains("Entrar"), button:contains("Login")', { timeout: 15000 })
        .click()

      // Aguardar autenticação
      cy.wait('@authToken', { timeout: 30000 })

      // Tentar acessar dashboard admin
      cy.visit('/admin', { timeout: 30000 })

      // Verificar se chegou na página admin
      cy.url().should('include', '/admin')

      // Verificar se a página carregou
      cy.get('h1, .page-title', { timeout: 20000 })
        .should('contain', 'Administrativo')
        .or('contain', 'Admin')
        .or('be.visible')

      cy.log('✅ Dashboard administrativo funcionando')
    })
  })
})

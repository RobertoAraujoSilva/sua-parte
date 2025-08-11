/// <reference types="cypress" />

/**
 * Testes de Autenticação e Roles - Sistema Ministerial
 * 
 * Este arquivo testa os diferentes tipos de login e níveis de acesso:
 * - Instrutor: Acesso completo ao dashboard e funcionalidades administrativas
 * - Estudante: Acesso limitado ao portal pessoal
 */

describe('🔐 Autenticação e Controle de Acesso', () => {
  beforeEach(() => {
    // Configurar interceptações para monitorar chamadas de autenticação
    cy.intercept('POST', '**/auth/v1/token**').as('authToken')
    cy.intercept('GET', '**/auth/v1/user**').as('getUser')
    cy.intercept('GET', '**/rest/v1/user_profiles**').as('getUserProfile')
    cy.intercept('GET', '**/rest/v1/profiles**').as('getProfiles')
  })

  describe('👨‍🏫 Login como Instrutor (Admin)', () => {
    it('🔑 Deve fazer login como instrutor e acessar dashboard completo', () => {
      cy.log('🧪 Testando login como Instrutor')
      
      // Fazer login como instrutor
      cy.loginAsInstructor()
      
      // Verificar redirecionamento para dashboard
      cy.url().should('include', '/dashboard')
      cy.shouldBeOnPage('/dashboard')
      
      // Verificar elementos do dashboard de instrutor
      cy.get('[data-testid="dashboard-header"]', { timeout: 10000 })
        .should('be.visible')
        .should('contain.text', 'Dashboard')
      
      // Verificar acesso a funcionalidades administrativas
      cy.get('nav').should('be.visible')
      
      // Verificar links de navegação do instrutor
      const instructorLinks = [
        'Estudantes',
        'Programas', 
        'Designações',
        'Relatórios',
        'Reuniões'
      ]
      
      instructorLinks.forEach(link => {
        cy.get('nav').should('contain.text', link)
      })
      
      cy.log('✅ Login como Instrutor realizado com sucesso')
    })

    it('🎯 Deve ter acesso à gestão de estudantes', () => {
      cy.loginAsInstructor()
      
      // Navegar para gestão de estudantes
      cy.visit('/estudantes')
      cy.waitForPageLoad()
      
      // Verificar acesso à página de estudantes
      cy.url().should('include', '/estudantes')
      cy.get('h1').should('contain.text', 'Estudantes')
      
      cy.log('✅ Acesso à gestão de estudantes confirmado')
    })
  })

  describe('👨‍🎓 Login como Estudante', () => {
    it('🔑 Deve fazer login como estudante e acessar portal limitado', () => {
      cy.log('🧪 Testando login como Estudante')
      
      // Fazer login como estudante
      cy.loginAsStudent()
      
      // Verificar redirecionamento para portal do estudante
      // O estudante deve ser redirecionado para seu portal pessoal
      cy.url().should('match', /\/(estudante|portal)/)
      
      // Verificar elementos do portal do estudante
      cy.get('body').should('be.visible')
      
      // Verificar que não tem acesso a funcionalidades administrativas
      cy.get('body').should('not.contain.text', 'Gestão de Estudantes')
      cy.get('body').should('not.contain.text', 'Relatórios Administrativos')
      
      cy.log('✅ Login como Estudante realizado com sucesso')
    })

    it('🚫 Não deve ter acesso a páginas administrativas', () => {
      cy.loginAsStudent()
      
      // Tentar acessar página administrativa
      cy.visit('/estudantes', { failOnStatusCode: false })
      
      // Deve ser redirecionado ou mostrar erro de acesso
      cy.url().should('not.include', '/estudantes')
      
      cy.log('✅ Restrição de acesso funcionando corretamente')
    })
  })

  describe('👤 Login Legacy (Franklin)', () => {
    it('🔑 Deve manter compatibilidade com comando legacy', () => {
      cy.log('🧪 Testando comando legacy cy.loginAsFranklin()')
      
      // Usar comando legacy
      cy.loginAsFranklin()
      
      // Verificar que o login funciona
      cy.url().should('match', /\/(estudante|portal|dashboard)/)
      
      cy.log('✅ Comando legacy funcionando corretamente')
    })
  })

  describe('🔄 Teste de Credenciais Customizadas', () => {
    it('🔑 Deve permitir login com credenciais customizadas', () => {
      const customEmail = Cypress.env('INSTRUCTOR_EMAIL')
      const customPassword = Cypress.env('INSTRUCTOR_PASSWORD')

      cy.log(`🧪 Testando login customizado com ${customEmail}`)

      // Usar comando de login customizado
      cy.loginWithCredentials(customEmail, customPassword)

      // Verificar que o login funciona
      cy.url().should('include', '/dashboard')

      cy.log('✅ Login customizado funcionando corretamente')
    })
  })

  describe('📚 Teste de Acesso à Página de Programas', () => {
    it('🔑 Instrutor deve ter acesso à funcionalidade de upload de PDF', () => {
      cy.log('🧪 Testando acesso do instrutor à página de programas')

      // Login como instrutor
      cy.loginAsInstructor()

      // Navegar para página de programas
      cy.visit('/programas')
      cy.url().should('include', '/programas')

      // Verificar elementos da página
      cy.contains('Gestão de Programas').should('be.visible')
      cy.contains('Importar Novo Programa').should('be.visible')

      // Verificar botão de upload de PDF
      cy.get('[data-testid="pdf-upload-button"]').should('be.visible')
      cy.contains('Selecionar Arquivo PDF').should('be.visible')

      cy.log('✅ Instrutor tem acesso completo à página de programas')
    })

    it('🚫 Estudante não deve ter acesso à página de programas', () => {
      cy.log('🧪 Testando restrição de acesso do estudante à página de programas')

      // Login como estudante
      cy.loginAsStudent()

      // Tentar acessar página de programas
      cy.visit('/programas', { failOnStatusCode: false })

      // Deve ser redirecionado para portal do estudante
      cy.url().should('not.include', '/programas')
      cy.url().should('match', /\/(estudante|portal)/)

      cy.log('✅ Estudante corretamente restrito da página de programas')
    })
  })

  describe('🔐 Teste de Logout', () => {
    it('🚪 Deve fazer logout do instrutor corretamente', () => {
      cy.loginAsInstrutor()
      cy.url().should('include', '/dashboard')

      // Procurar botão de logout
      cy.get('body').then($body => {
        if ($body.find('[data-testid="user-menu"]').length > 0) {
          cy.get('[data-testid="user-menu"]').click()
          cy.contains('Sair').click()
        } else if ($body.find('button:contains("Test Logout")').length > 0) {
          cy.contains('Test Logout').click()
        } else {
          cy.contains('Logout').click()
        }
      })

      // Deve redirecionar para página de auth
      cy.url().should('include', '/auth')

      cy.log('✅ Logout do instrutor realizado com sucesso')
    })

    it('🚪 Deve fazer logout do estudante corretamente', () => {
      cy.loginAsStudent()
      cy.url().should('match', /\/(estudante|portal)/)

      // Procurar botão de logout
      cy.get('body').then($body => {
        if ($body.find('[data-testid="user-menu"]').length > 0) {
          cy.get('[data-testid="user-menu"]').click()
          cy.contains('Sair').click()
        } else if ($body.find('button:contains("Test Logout")').length > 0) {
          cy.contains('Test Logout').click()
        } else {
          cy.contains('Logout').click()
        }
      })

      // Deve redirecionar para página de auth
      cy.url().should('include', '/auth')

      cy.log('✅ Logout do estudante realizado com sucesso')
    })
  })

  describe('🛡️ Segurança e Validação', () => {
    it('🔒 Deve validar credenciais de ambiente', () => {
      // Verificar se as credenciais estão configuradas
      const instructorEmail = Cypress.env('INSTRUCTOR_EMAIL')
      const instructorPassword = Cypress.env('INSTRUCTOR_PASSWORD')
      const studentEmail = Cypress.env('STUDENT_EMAIL')
      const studentPassword = Cypress.env('STUDENT_PASSWORD')
      
      expect(instructorEmail).to.not.be.empty
      expect(instructorPassword).to.not.be.empty
      expect(studentEmail).to.not.be.empty
      expect(studentPassword).to.not.be.empty
      
      cy.log('✅ Todas as credenciais estão configuradas')
    })

    it('🔐 Deve proteger rotas baseado no role do usuário', () => {
      // Login como estudante
      cy.loginAsStudent()
      
      // Lista de rotas que devem ser protegidas para estudantes
      const protectedRoutes = [
        '/estudantes',
        '/programas',
        '/designacoes',
        '/relatorios',
        '/reunioes'
      ]
      
      protectedRoutes.forEach(route => {
        cy.visit(route, { failOnStatusCode: false })
        cy.url().should('not.include', route)
        cy.log(`✅ Rota ${route} protegida corretamente`)
      })
    })
  })
})

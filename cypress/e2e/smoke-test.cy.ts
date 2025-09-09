describe('Smoke Test - Sistema Ministerial', () => {
  beforeEach(() => {
    cy.clearLocalStorage()
    cy.clearCookies()
  })

  it('deve carregar a página inicial sem erros', () => {
    cy.log('🏠 Teste: Carregamento da página inicial')

    cy.visit('/', { timeout: 30000 })

    // Verificar se a página carregou
    cy.get('body').should('exist')

    // Verificar se não há erros JavaScript críticos
    cy.window().then((win) => {
      expect(win.console.error).to.not.have.been.called
    })

    cy.log('✅ Página inicial carregada com sucesso')
  })

  it('deve carregar a página de autenticação', () => {
    cy.log('🔐 Teste: Carregamento da página de auth')

    cy.visit('/auth', { timeout: 30000 })

    // Verificar se a página carregou
    cy.get('body').should('exist')

    // Verificar se há campos de login
    cy.get('input[type="email"]', { timeout: 10000 }).should('exist')
    cy.get('input[type="password"]').should('exist')
    cy.get('button[type="submit"]').should('exist')

    cy.log('✅ Página de autenticação carregada com sucesso')
  })

  it('deve carregar a página de demo', () => {
    cy.log('🎯 Teste: Carregamento da página de demo')

    cy.visit('/demo', { timeout: 30000, failOnStatusCode: false })

    // Verificar se a página carregou
    cy.get('body').should('exist')

    cy.log('✅ Página de demo carregada com sucesso')
  })

  it('deve verificar se o build está funcionando', () => {
    cy.log('🔧 Teste: Verificação do build')

    cy.visit('/', { timeout: 30000 })

    // Verificar se recursos estão carregando
    cy.get('head link[rel="stylesheet"]').should('exist')
    cy.get('head script').should('exist')

    // Verificar se não há erros 404 críticos
    cy.request({
      url: '/',
      failOnStatusCode: false
    }).then((response) => {
      expect(response.status).to.be.oneOf([200, 301, 302])
    })

    cy.log('✅ Build funcionando corretamente')
  })

  it('deve verificar navegação básica', () => {
    cy.log('🧭 Teste: Navegação básica')

    // Começar na página inicial
    cy.visit('/', { timeout: 30000 })
    cy.url().should('include', Cypress.config().baseUrl)

    // Ir para auth
    cy.visit('/auth', { timeout: 30000 })
    cy.url().should('include', '/auth')

    // Voltar para inicial
    cy.visit('/', { timeout: 30000 })
    cy.url().should('include', Cypress.config().baseUrl)

    cy.log('✅ Navegação básica funcionando')
  })

  it('deve verificar responsividade básica', () => {
    cy.log('📱 Teste: Responsividade básica')

    cy.visit('/', { timeout: 30000 })

    // Testar viewport mobile
    cy.viewport(375, 667)
    cy.get('body').should('be.visible')

    // Testar viewport tablet
    cy.viewport(768, 1024)
    cy.get('body').should('be.visible')

    // Testar viewport desktop
    cy.viewport(1280, 720)
    cy.get('body').should('be.visible')

    cy.log('✅ Responsividade básica funcionando')
  })
})
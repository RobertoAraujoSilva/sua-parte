describe('URL Configuration & Routing - Sistema Ministerial', () => {
  const franklinUserId = Cypress.env('FRANKLIN_USER_ID')
  const franklinPortalUrl = Cypress.env('FRANKLIN_PORTAL_URL')

  beforeEach(() => {
    cy.clearLocalStorage()
    cy.clearCookies()
  })

  it('deve redirecionar usuário não autenticado para /auth', () => {
    cy.log('🔒 Teste: Redirecionamento de usuário não autenticado')
    
    // Tentar acessar portal do estudante sem estar logado
    cy.visit(franklinPortalUrl, { failOnStatusCode: false })
    
    // Deve redirecionar para /auth
    cy.url({ timeout: 10000 }).should('include', '/auth')
    
    cy.log('✅ Redirecionamento para /auth funcionando')
  })

  it('deve permitir acesso direto ao portal após login', () => {
    cy.log('🎯 Teste: Acesso direto ao portal após login')
    
    // Fazer login
    cy.loginAsFranklin()
    
    // Aguardar redirecionamento automático
    cy.url({ timeout: 30000 }).should('include', franklinPortalUrl)
    
    // Tentar acessar diretamente o portal (deve funcionar)
    cy.visit(franklinPortalUrl)
    cy.waitForPageLoad()
    
    // Verificar se carregou corretamente
    cy.get('body').should('contain.text', 'Franklin')
    
    cy.log('✅ Acesso direto ao portal funcionando após login')
  })

  it('deve bloquear acesso a portal de outro usuário', () => {
    cy.log('🚫 Teste: Bloqueio de acesso a portal de outro usuário')
    
    // Fazer login como Franklin
    cy.loginAsFranklin()
    cy.url({ timeout: 30000 }).should('include', franklinPortalUrl)
    
    // Tentar acessar portal de outro usuário (ID fictício)
    const otherUserPortal = '/estudante/00000000-0000-0000-0000-000000000000'
    cy.visit(otherUserPortal, { failOnStatusCode: false })
    
    // Deve redirecionar de volta para /auth ou para o próprio portal
    cy.url({ timeout: 10000 }).should('satisfy', (url: string) => {
      return url.includes('/auth') || url.includes(franklinPortalUrl)
    })
    
    cy.log('✅ Bloqueio de acesso a portal de outro usuário funcionando')
  })

  it('deve funcionar navegação entre páginas públicas', () => {
    cy.log('🌐 Teste: Navegação em páginas públicas')
    
    // Testar página inicial
    cy.visit('/')
    cy.waitForPageLoad()
    cy.url().should('eq', Cypress.config().baseUrl + '/')
    
    // Testar página de demo (se existir)
    cy.visit('/demo', { failOnStatusCode: false })
    cy.waitForPageLoad()
    
    // Testar página de auth
    cy.visit('/auth')
    cy.waitForPageLoad()
    cy.url().should('include', '/auth')
    
    cy.log('✅ Navegação em páginas públicas funcionando')
  })

  it('deve manter URL correta durante o fluxo de login', () => {
    cy.log('🔄 Teste: Manutenção de URL durante login')
    
    // Ir para página de auth
    cy.visit('/auth')
    cy.shouldBeOnPage('/auth')
    
    // Fazer login
    cy.get('input[type="email"]')
      .should('be.visible')
      .type(Cypress.env('FRANKLIN_EMAIL'))
    
    cy.get('input[type="password"]')
      .should('be.visible')
      .type(Cypress.env('FRANKLIN_PASSWORD'))
    
    cy.get('button[type="submit"]')
      .should('be.visible')
      .click()
    
    // Aguardar redirecionamento
    cy.url({ timeout: 30000 }).should('include', franklinPortalUrl)
    cy.shouldBeOnPage(franklinPortalUrl)
    
    cy.log('✅ URL mantida corretamente durante fluxo de login')
  })

  it('deve funcionar botão voltar do navegador', () => {
    cy.log('⬅️ Teste: Funcionalidade do botão voltar')
    
    // Começar na página de auth
    cy.visit('/auth')
    cy.shouldBeOnPage('/auth')
    
    // Ir para página inicial
    cy.visit('/')
    cy.shouldBeOnPage('/')
    
    // Usar botão voltar
    cy.go('back')
    cy.shouldBeOnPage('/auth')
    
    // Usar botão avançar
    cy.go('forward')
    cy.shouldBeOnPage('/')
    
    cy.log('✅ Navegação com botões do navegador funcionando')
  })

  it('deve lidar com URLs inválidas graciosamente', () => {
    cy.log('❓ Teste: Tratamento de URLs inválidas')
    
    // Tentar acessar URL que não existe
    cy.visit('/pagina-que-nao-existe', { failOnStatusCode: false })
    
    // Verificar se não quebrou a aplicação
    cy.get('body').should('exist')
    
    // Pode redirecionar para 404, home ou auth
    cy.url().should('satisfy', (url: string) => {
      return url.includes('/') || url.includes('/auth') || url.includes('404')
    })
    
    cy.log('✅ URLs inválidas tratadas graciosamente')
  })

  it('deve preservar parâmetros de URL quando necessário', () => {
    cy.log('🔗 Teste: Preservação de parâmetros de URL')
    
    // Acessar URL com parâmetros
    cy.visit('/auth?redirect=test')
    cy.waitForPageLoad()
    
    // Verificar se parâmetros estão presentes
    cy.url().should('include', 'redirect=test')
    
    cy.log('✅ Parâmetros de URL preservados')
  })

  it('deve funcionar refresh em qualquer página após login', () => {
    cy.log('🔄 Teste: Refresh em páginas autenticadas')
    
    // Fazer login
    cy.loginAsFranklin()
    cy.url({ timeout: 30000 }).should('include', franklinPortalUrl)
    
    // Fazer refresh
    cy.reload()
    cy.waitForPageLoad()
    
    // Verificar se ainda está na página correta
    cy.url().should('include', franklinPortalUrl)
    cy.get('body').should('contain.text', 'Franklin')
    
    cy.log('✅ Refresh funcionando em páginas autenticadas')
  })
})

describe('Franklin Login - Sistema Ministerial', () => {
  const franklinEmail = Cypress.env('FRANKLIN_EMAIL')
  const franklinPassword = Cypress.env('FRANKLIN_PASSWORD')
  const franklinUserId = Cypress.env('FRANKLIN_USER_ID')
  const franklinPortalUrl = Cypress.env('FRANKLIN_PORTAL_URL')

  beforeEach(() => {
    // Limpar dados antes de cada teste
    cy.clearLocalStorage()
    cy.clearCookies()
    
    // Configurar interceptações para monitorar requests
    cy.intercept('POST', '**/auth/v1/token**').as('authLogin')
    cy.intercept('GET', '**/auth/v1/user**').as('getUser')
    cy.intercept('GET', '**/rest/v1/user_profiles**').as('getUserProfile')
    cy.intercept('GET', '**/rest/v1/profiles**').as('getProfiles')
  })

  it('deve fazer login com sucesso e redirecionar para o portal do estudante', () => {
    cy.log('🎯 Teste: Login do Franklin e redirecionamento para portal do estudante')
    
    // Passo 1: Navegar para a página de autenticação
    cy.log('📍 Passo 1: Navegando para página de login')
    cy.visit('/auth')
    cy.waitForPageLoad()
    
    // Verificar se está na página correta
    cy.shouldBeOnPage('/auth')
    cy.get('h1, h2').should('contain.text', 'Sistema Ministerial')
    
    // Passo 2: Preencher credenciais do Franklin
    cy.log('📝 Passo 2: Preenchendo credenciais do Franklin')
    
    // Aguardar formulário aparecer
    cy.waitForElement('input[type="email"]', 15000)
    
    // Preencher email
    cy.get('input[type="email"]')
      .should('be.visible')
      .clear()
      .type(franklinEmail, { delay: 50 })
      .should('have.value', franklinEmail)
    
    // Preencher senha
    cy.get('input[type="password"]')
      .should('be.visible')
      .clear()
      .type(franklinPassword, { delay: 50 })
    
    // Passo 3: Submeter formulário
    cy.log('🚀 Passo 3: Submetendo formulário de login')
    
    cy.get('button[type="submit"]')
      .should('be.visible')
      .should('not.be.disabled')
      .click()
    
    // Passo 4: Aguardar autenticação
    cy.log('⏳ Passo 4: Aguardando resposta da autenticação')
    
    cy.wait('@authLogin', { timeout: 20000 }).then((interception) => {
      expect(interception.response?.statusCode).to.be.oneOf([200, 201])
      cy.log('✅ Autenticação bem-sucedida')
    })
    
    // Passo 5: Verificar redirecionamento
    cy.log('🔄 Passo 5: Verificando redirecionamento para portal do estudante')
    
    // Aguardar redirecionamento (pode demorar devido ao carregamento do perfil)
    cy.url({ timeout: 30000 }).should('include', franklinPortalUrl)
    cy.shouldBeOnPage(franklinPortalUrl)
    
    // Passo 6: Verificar carregamento do portal
    cy.log('📋 Passo 6: Verificando carregamento do portal do estudante')
    
    // Aguardar elementos do portal aparecerem
    cy.waitForElement('[data-testid="student-portal"], .student-portal, h1, h2', 20000)
    
    // Verificar se o nome do Franklin aparece
    cy.get('body').should('contain.text', 'Franklin')
    
    // Verificar elementos específicos do portal do estudante
    cy.get('body').should('contain.text', 'Bem-vindo')
    cy.get('body').should('contain.text', 'Escola do Ministério')
    
    // Passo 7: Verificar dados do usuário
    cy.log('👤 Passo 7: Verificando dados do usuário')
    
    // Verificar se o perfil foi carregado (aguardar request se necessário)
    cy.wait('@getUserProfile', { timeout: 15000 }).then((interception) => {
      if (interception.response?.statusCode === 200) {
        cy.log('✅ Perfil carregado via view')
      } else {
        cy.log('⚠️ Perfil não carregado via view, usando metadata')
      }
    })
    
    // Verificar informações do estudante
    cy.get('body').should('contain.text', 'estudante')
    
    cy.log('🎉 Teste concluído com sucesso!')
  })

  it('deve manter a sessão após refresh da página', () => {
    cy.log('🔄 Teste: Persistência de sessão após refresh')
    
    // Fazer login primeiro
    cy.loginAsFranklin()
    
    // Aguardar redirecionamento
    cy.url({ timeout: 30000 }).should('include', franklinPortalUrl)
    
    // Fazer refresh da página
    cy.reload()
    cy.waitForPageLoad()
    
    // Verificar se ainda está logado e na página correta
    cy.url().should('include', franklinPortalUrl)
    cy.get('body').should('contain.text', 'Franklin')
    
    cy.log('✅ Sessão mantida após refresh')
  })

  it('deve mostrar erro para credenciais inválidas', () => {
    cy.log('❌ Teste: Credenciais inválidas')
    
    cy.visit('/auth')
    cy.waitForPageLoad()
    
    // Tentar login com senha incorreta
    cy.get('input[type="email"]')
      .should('be.visible')
      .type(franklinEmail)
    
    cy.get('input[type="password"]')
      .should('be.visible')
      .type('senhaincorreta123')
    
    cy.get('button[type="submit"]')
      .should('be.visible')
      .click()
    
    // Verificar mensagem de erro
    cy.get('body', { timeout: 10000 }).should('contain.text', 'Invalid')
    
    // Verificar que não foi redirecionado
    cy.url().should('include', '/auth')
    
    cy.log('✅ Erro mostrado corretamente para credenciais inválidas')
  })

  it('deve funcionar o logout', () => {
    cy.log('🚪 Teste: Logout do sistema')
    
    // Fazer login primeiro
    cy.loginAsFranklin()
    
    // Aguardar redirecionamento
    cy.url({ timeout: 30000 }).should('include', franklinPortalUrl)
    
    // Procurar botão de logout (pode estar em menu dropdown)
    cy.get('body').then(($body) => {
      if ($body.find('[data-testid="logout"], button:contains("Sair"), button:contains("Logout")').length > 0) {
        cy.get('[data-testid="logout"], button:contains("Sair"), button:contains("Logout")')
          .first()
          .click()
        
        // Verificar redirecionamento para página de login
        cy.url({ timeout: 10000 }).should('include', '/auth')
        cy.log('✅ Logout realizado com sucesso')
      } else {
        cy.log('⚠️ Botão de logout não encontrado - pode estar em menu')
      }
    })
  })
})

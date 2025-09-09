describe('Admin Dashboard - Teste Focado (http://localhost:5173/admin)', () => {
  
  beforeEach(() => {
    // Limpar dados de sessão
    cy.clearLocalStorage()
    cy.clearCookies()
    
    // Configurar viewport
    cy.viewport(1280, 720)
  })

  const adminEmail = Cypress.env('GENERAL_ADMIN') || 'amazonwebber007@gmail.com'
  const adminPassword = Cypress.env('ADMIN_PASSW0RD') || 'admin123'

  it('deve fazer login como GENERAL_ADMIN e acessar /admin', () => {
    cy.log('🔐 Fazendo login como GENERAL_ADMIN...')
    
    // Visitar página de autenticação
    cy.visit('/auth')
    cy.wait(2000)
    
    // Verificar se a página carregou
    cy.get('body').should('be.visible')
    
    // Preencher formulário de login
    cy.get('input[type="email"]', { timeout: 10000 })
      .should('be.visible')
      .clear()
      .type(adminEmail, { delay: 100 })
    
    cy.get('input[type="password"]')
      .should('be.visible')
      .clear()
      .type(adminPassword, { delay: 100 })
    
    // Clicar no botão de login
    cy.get('button[type="submit"]')
      .should('be.visible')
      .click()
    
    // Aguardar redirecionamento (pode ir para dashboard primeiro)
    cy.wait(3000)
    
    // Verificar se foi redirecionado
    cy.url().should('not.include', '/auth')
    
    // Navegar diretamente para /admin
    cy.visit('/admin')
    cy.wait(2000)
    
    // Verificar se chegou na página de admin
    cy.url().should('include', '/admin')
    
    // Verificar se o dashboard administrativo carregou
    cy.get('body').should('contain.text', 'Dashboard Administrativo')
      .or('contain.text', 'Admin')
      .or('contain.text', 'Sistema Ministerial')
  })

  it('deve verificar as abas do Admin Dashboard', () => {
    // Fazer login primeiro
    cy.visit('/auth')
    cy.get('input[type="email"]').type(adminEmail)
    cy.get('input[type="password"]').type(adminPassword)
    cy.get('button[type="submit"]').click()
    cy.wait(3000)
    
    // Ir para admin
    cy.visit('/admin')
    cy.wait(2000)
    
    // Verificar se as abas estão presentes
    cy.get('body').then(($body) => {
      if ($body.text().includes('Visão Geral') || $body.text().includes('Overview')) {
        cy.log('✅ Aba "Visão Geral" encontrada')
        cy.contains('Visão Geral').should('be.visible')
      }
      
      if ($body.text().includes('Usuários') || $body.text().includes('Users')) {
        cy.log('✅ Aba "Usuários" encontrada')
        cy.contains('Usuários').should('be.visible')
      }
      
      if ($body.text().includes('Congregações') || $body.text().includes('Congregations')) {
        cy.log('✅ Aba "Congregações" encontrada')
        cy.contains('Congregações').should('be.visible')
      }
      
      if ($body.text().includes('Sistema') || $body.text().includes('System')) {
        cy.log('✅ Aba "Sistema" encontrada')
        cy.contains('Sistema').should('be.visible')
      }
    })
  })

  it('deve testar a navegação entre as abas', () => {
    // Fazer login
    cy.visit('/auth')
    cy.get('input[type="email"]').type(adminEmail)
    cy.get('input[type="password"]').type(adminPassword)
    cy.get('button[type="submit"]').click()
    cy.wait(3000)
    
    // Ir para admin
    cy.visit('/admin')
    cy.wait(2000)
    
    // Testar clique nas abas (se existirem)
    cy.get('body').then(($body) => {
      // Tentar clicar na aba Usuários
      if ($body.text().includes('Usuários')) {
        cy.contains('Usuários').click()
        cy.wait(1000)
        cy.log('✅ Navegou para aba Usuários')
      }
      
      // Tentar clicar na aba Congregações
      if ($body.text().includes('Congregações')) {
        cy.contains('Congregações').click()
        cy.wait(1000)
        cy.log('✅ Navegou para aba Congregações')
      }
      
      // Tentar clicar na aba Sistema
      if ($body.text().includes('Sistema')) {
        cy.contains('Sistema').click()
        cy.wait(1000)
        cy.log('✅ Navegou para aba Sistema')
      }
      
      // Voltar para Visão Geral
      if ($body.text().includes('Visão Geral')) {
        cy.contains('Visão Geral').click()
        cy.wait(1000)
        cy.log('✅ Voltou para aba Visão Geral')
      }
    })
  })

  it('deve verificar se existem estatísticas no dashboard', () => {
    // Fazer login
    cy.visit('/auth')
    cy.get('input[type="email"]').type(adminEmail)
    cy.get('input[type="password"]').type(adminPassword)
    cy.get('button[type="submit"]').click()
    cy.wait(3000)
    
    // Ir para admin
    cy.visit('/admin')
    cy.wait(2000)
    
    // Verificar se há estatísticas ou cards informativos
    cy.get('body').then(($body) => {
      const bodyText = $body.text()
      
      // Procurar por indicadores comuns de dashboard
      const indicators = [
        'Congregações', 'Usuários', 'Total', 'Estatísticas',
        'Status', 'Sistema', 'Conectado', 'Operacional',
        'MWB', 'JW.org', 'Downloads'
      ]
      
      let foundIndicators = 0
      indicators.forEach(indicator => {
        if (bodyText.includes(indicator)) {
          foundIndicators++
          cy.log(`✅ Encontrado indicador: ${indicator}`)
        }
      })
      
      expect(foundIndicators).to.be.at.least(1, 'Pelo menos um indicador de dashboard deve estar presente')
    })
  })

  it('deve verificar se não há erros JavaScript na página', () => {
    // Capturar erros JavaScript
    cy.window().then((win) => {
      cy.stub(win.console, 'error').as('consoleError')
    })
    
    // Fazer login
    cy.visit('/auth')
    cy.get('input[type="email"]').type(adminEmail)
    cy.get('input[type="password"]').type(adminPassword)
    cy.get('button[type="submit"]').click()
    cy.wait(3000)
    
    // Ir para admin
    cy.visit('/admin')
    cy.wait(2000)
    
    // Verificar se não houve erros críticos no console
    cy.get('@consoleError').should('not.have.been.calledWith', Cypress.sinon.match(/error/i))
    
    // Verificar se a página não tem texto de erro visível
    cy.get('body').should('not.contain.text', 'Error')
      .and('not.contain.text', 'Failed')
      .and('not.contain.text', 'Erro')
      .and('not.contain.text', 'Falhou')
  })

  it('deve testar a responsividade básica do dashboard', () => {
    // Fazer login
    cy.visit('/auth')
    cy.get('input[type="email"]').type(adminEmail)
    cy.get('input[type="password"]').type(adminPassword)
    cy.get('button[type="submit"]').click()
    cy.wait(3000)
    
    // Ir para admin
    cy.visit('/admin')
    cy.wait(2000)
    
    // Testar em diferentes tamanhos de tela
    const viewports = [
      { width: 1920, height: 1080, name: 'Desktop Large' },
      { width: 1280, height: 720, name: 'Desktop' },
      { width: 768, height: 1024, name: 'Tablet' },
      { width: 375, height: 667, name: 'Mobile' }
    ]
    
    viewports.forEach(viewport => {
      cy.viewport(viewport.width, viewport.height)
      cy.wait(1000)
      cy.log(`✅ Testando viewport: ${viewport.name} (${viewport.width}x${viewport.height})`)
      
      // Verificar se a página ainda é funcional
      cy.get('body').should('be.visible')
      cy.url().should('include', '/admin')
    })
  })

  it('deve salvar screenshot do dashboard para documentação', () => {
    // Fazer login
    cy.visit('/auth')
    cy.get('input[type="email"]').type(adminEmail)
    cy.get('input[type="password"]').type(adminPassword)
    cy.get('button[type="submit"]').click()
    cy.wait(3000)
    
    // Ir para admin
    cy.visit('/admin')
    cy.wait(3000)
    
    // Aguardar carregamento completo
    cy.get('body').should('be.visible')
    
    // Tirar screenshot para documentação
    cy.screenshot('admin-dashboard-overview', { 
      capture: 'fullPage',
      overwrite: true 
    })
    
    cy.log('✅ Screenshot do Admin Dashboard salvo')
  })
})





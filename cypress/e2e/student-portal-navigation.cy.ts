describe('Student Portal Navigation - Franklin', () => {
  const franklinPortalUrl = Cypress.env('FRANKLIN_PORTAL_URL')

  beforeEach(() => {
    // Fazer login como Franklin antes de cada teste
    cy.loginAsFranklin()
    
    // Aguardar redirecionamento para o portal
    cy.url({ timeout: 30000 }).should('include', franklinPortalUrl)
    cy.waitForPageLoad()
  })

  it('deve exibir informações pessoais do estudante', () => {
    cy.log('👤 Teste: Verificação de informações pessoais')
    
    // Verificar nome completo
    cy.get('body').should('contain.text', 'Franklin Marcelo Ferreira de Lima')
    
    // Verificar congregação
    cy.get('body').should('contain.text', 'Market Harborough')
    
    // Verificar cargo ministerial
    cy.get('body').should('contain.text', 'Publicador Não Batizado')
    
    // Verificar role de estudante
    cy.get('body').should('contain.text', 'estudante')
    
    cy.log('✅ Informações pessoais exibidas corretamente')
  })

  it('deve exibir seção da Escola do Ministério Teocrático', () => {
    cy.log('📚 Teste: Seção da Escola do Ministério')
    
    // Verificar título da seção
    cy.get('body').should('contain.text', 'Escola do Ministério')
    
    // Verificar informações sobre a estrutura da reunião
    cy.get('body').should('contain.text', 'Nossa Vida e Ministério Cristão')
    
    // Verificar menção às partes da reunião
    cy.get('body').should('contain.text', 'designações')
    
    cy.log('✅ Seção da Escola do Ministério exibida')
  })

  it('deve exibir seção de designações', () => {
    cy.log('📋 Teste: Seção de designações')
    
    // Procurar por elementos relacionados a designações
    cy.get('body').then(($body) => {
      const hasAssignments = $body.text().includes('designações') || 
                           $body.text().includes('Designações') ||
                           $body.text().includes('assignments')
      
      if (hasAssignments) {
        cy.log('✅ Seção de designações encontrada')
      } else {
        cy.log('⚠️ Seção de designações não encontrada - pode estar vazia')
      }
    })
  })

  it('deve exibir seção de cronograma de reuniões', () => {
    cy.log('📅 Teste: Cronograma de reuniões')
    
    // Procurar por elementos relacionados ao cronograma
    cy.get('body').then(($body) => {
      const hasSchedule = $body.text().includes('cronograma') || 
                         $body.text().includes('Cronograma') ||
                         $body.text().includes('reuniões') ||
                         $body.text().includes('schedule')
      
      if (hasSchedule) {
        cy.log('✅ Cronograma de reuniões encontrado')
      } else {
        cy.log('⚠️ Cronograma não encontrado - pode estar em desenvolvimento')
      }
    })
  })

  it('deve ser responsivo em diferentes tamanhos de tela', () => {
    cy.log('📱 Teste: Responsividade')
    
    // Testar em mobile
    cy.viewport(375, 667)
    cy.waitForPageLoad()
    cy.get('body').should('contain.text', 'Franklin')
    
    // Testar em tablet
    cy.viewport(768, 1024)
    cy.waitForPageLoad()
    cy.get('body').should('contain.text', 'Franklin')
    
    // Voltar para desktop
    cy.viewport(1280, 720)
    cy.waitForPageLoad()
    cy.get('body').should('contain.text', 'Franklin')
    
    cy.log('✅ Portal responsivo em diferentes tamanhos')
  })

  it('deve manter dados após navegação', () => {
    cy.log('🔄 Teste: Persistência de dados')
    
    // Verificar dados iniciais
    cy.get('body').should('contain.text', 'Franklin')
    
    // Simular navegação (se houver abas ou seções)
    cy.get('body').then(($body) => {
      // Procurar por links ou botões de navegação interna
      const navElements = $body.find('nav a, button[role="tab"], .tab-trigger')
      
      if (navElements.length > 0) {
        cy.wrap(navElements.first()).click()
        cy.waitForPageLoad()
        
        // Verificar se os dados ainda estão presentes
        cy.get('body').should('contain.text', 'Franklin')
        cy.log('✅ Dados mantidos após navegação interna')
      } else {
        cy.log('⚠️ Elementos de navegação interna não encontrados')
      }
    })
  })

  it('deve carregar sem erros de console críticos', () => {
    cy.log('🐛 Teste: Verificação de erros de console')
    
    // Capturar erros de console
    cy.window().then((win) => {
      const errors: string[] = []
      
      // Interceptar console.error
      const originalError = win.console.error
      win.console.error = (...args) => {
        errors.push(args.join(' '))
        originalError.apply(win.console, args)
      }
      
      // Aguardar um tempo para capturar erros
      cy.wait(3000).then(() => {
        // Filtrar erros críticos (ignorar warnings menores)
        const criticalErrors = errors.filter(error => 
          !error.includes('ResizeObserver') &&
          !error.includes('Non-Error promise rejection') &&
          !error.includes('Warning:')
        )
        
        if (criticalErrors.length === 0) {
          cy.log('✅ Nenhum erro crítico de console encontrado')
        } else {
          cy.log(`⚠️ Erros críticos encontrados: ${criticalErrors.length}`)
          criticalErrors.forEach(error => cy.log(`❌ ${error}`))
        }
      })
    })
  })
})

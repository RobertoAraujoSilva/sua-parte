/// <reference types="cypress" />

describe('🔍 Debug Simples - Listar Elementos', () => {
  it('Deve listar todos os elementos encontrados na página', () => {
    cy.log('🧪 Debug simples - listando elementos')
    
    // Fazer login como instrutor
    cy.loginAsInstructor()
    
    // Verificar redirecionamento para dashboard
    cy.url().should('include', '/dashboard')
    
    // Aguardar carregamento da página
    cy.wait(5000)
    
    cy.log('📋 === INICIANDO DEBUG ===')
    
    // Listar todos os elementos com texto
    cy.get('*').then(($allElements) => {
      const elementsWithText = $allElements.filter((i, el) => {
        const text = el.textContent?.trim()
        return text && text.length > 0 && text.length < 200
      }).slice(0, 20) // Primeiros 20 elementos
      
      cy.log(`🔍 Encontrados ${elementsWithText.length} elementos com texto (primeiros 20):`)
      
      elementsWithText.each((i, el) => {
        const tagName = el.tagName.toLowerCase()
        const text = el.textContent?.trim()
        const className = el.className
        const id = el.id
        
        let info = `Elemento ${i + 1} (${tagName})`
        if (id) info += ` id="${id}"`
        if (className) info += ` class="${className}"`
        info += `: "${text}"`
        
        cy.log(info)
      })
    })
    
    // Listar todos os elementos com data-testid
    cy.get('body').then(($body) => {
      const dataTestIdElements = $body.find('[data-testid]')
      cy.log(`🏷️ Elementos com data-testid: ${dataTestIdElements.length}`)
      
      if (dataTestIdElements.length > 0) {
        dataTestIdElements.each((i, el) => {
          const testId = el.getAttribute('data-testid')
          const text = el.textContent?.substring(0, 50) || 'sem texto'
          cy.log(`  data-testid="${testId}": "${text}"`)
        })
      }
    })
    
    // Listar todos os elementos com classes específicas
    cy.get('body').then(($body) => {
      const dashboardElements = $body.find('[class*="dashboard"], [class*="header"], [class*="nav"], [class*="main"]')
      cy.log(`🎯 Elementos com classes relevantes: ${dashboardElements.length}`)
      
      if (dashboardElements.length > 0) {
        dashboardElements.each((i, el) => {
          const className = el.className
          const tagName = el.tagName.toLowerCase()
          const text = el.textContent?.substring(0, 50) || 'sem texto'
          cy.log(`  ${tagName} class="${className}": "${text}"`)
        })
      }
    })
    
    // Listar todos os links
    cy.get('a').then(($links) => {
      cy.log(`🔗 Links encontrados: ${$links.length}`)
      
      if ($links.length > 0) {
        $links.each((i, el) => {
          const text = el.textContent?.trim() || 'sem texto'
          const href = el.getAttribute('href') || 'sem href'
          cy.log(`  Link ${i + 1}: "${text}" -> ${href}`)
        })
      }
    })
    
    // Listar todos os botões
    cy.get('button').then(($buttons) => {
      cy.log(`🔘 Botões encontrados: ${$buttons.length}`)
      
      if ($buttons.length > 0) {
        $buttons.each((i, el) => {
          const text = el.textContent?.trim() || 'sem texto'
          const className = el.className
          cy.log(`  Botão ${i + 1}: "${text}" class="${className}"`)
        })
      }
    })
    
    cy.log('✅ === DEBUG CONCLUÍDO ===')
  })
})

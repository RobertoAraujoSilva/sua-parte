/// <reference types="cypress" />

describe('💾 Salvar Informações de Debug', () => {
  it('Deve salvar informações de debug em arquivo', () => {
    cy.log('🧪 Salvando informações de debug')
    
    // Fazer login como instrutor
    cy.loginAsInstructor()
    
    // Verificar redirecionamento para dashboard
    cy.url().should('include', '/dashboard')
    
    // Aguardar carregamento da página
    cy.wait(5000)
    
    let debugInfo = '=== DEBUG DASHBOARD ===\n\n'
    
    // Coletar informações sobre elementos com texto
    cy.get('*').then(($allElements) => {
      const elementsWithText = $allElements.filter((i, el) => {
        const text = el.textContent?.trim()
        return text && text.length > 0 && text.length < 200
      }).slice(0, 30) // Primeiros 30 elementos
      
      debugInfo += `🔍 Elementos com texto (${elementsWithText.length}):\n`
      
      elementsWithText.each((i, el) => {
        const tagName = el.tagName.toLowerCase()
        const text = el.textContent?.trim()
        const className = el.className
        const id = el.id
        
        let info = `  ${i + 1}. ${tagName}`
        if (id) info += ` id="${id}"`
        if (className) info += ` class="${className}"`
        info += `: "${text}"`
        
        debugInfo += info + '\n'
      })
      
      debugInfo += '\n'
    })
    
    // Coletar informações sobre elementos com data-testid
    cy.get('body').then(($body) => {
      const dataTestIdElements = $body.find('[data-testid]')
      debugInfo += `🏷️ Elementos com data-testid (${dataTestIdElements.length}):\n`
      
      if (dataTestIdElements.length > 0) {
        dataTestIdElements.each((i, el) => {
          const testId = el.getAttribute('data-testid')
          const text = el.textContent?.substring(0, 50) || 'sem texto'
          debugInfo += `  ${i + 1}. data-testid="${testId}": "${text}"\n`
        })
      } else {
        debugInfo += '  Nenhum elemento com data-testid encontrado\n'
      }
      
      debugInfo += '\n'
    })
    
    // Coletar informações sobre elementos com classes específicas
    cy.get('body').then(($body) => {
      const dashboardElements = $body.find('[class*="dashboard"], [class*="header"], [class*="nav"], [class*="main"]')
      debugInfo += `🎯 Elementos com classes relevantes (${dashboardElements.length}):\n`
      
      if (dashboardElements.length > 0) {
        dashboardElements.each((i, el) => {
          const className = el.className
          const tagName = el.tagName.toLowerCase()
          const text = el.textContent?.substring(0, 50) || 'sem texto'
          debugInfo += `  ${i + 1}. ${tagName} class="${className}": "${text}"\n`
        })
      } else {
        debugInfo += '  Nenhum elemento com classes relevantes encontrado\n'
      }
      
      debugInfo += '\n'
    })
    
    // Coletar informações sobre links
    cy.get('a').then(($links) => {
      debugInfo += `🔗 Links encontrados (${$links.length}):\n`
      
      if ($links.length > 0) {
        $links.each((i, el) => {
          const text = el.textContent?.trim() || 'sem texto'
          const href = el.getAttribute('href') || 'sem href'
          debugInfo += `  ${i + 1}. "${text}" -> ${href}\n`
        })
      } else {
        debugInfo += '  Nenhum link encontrado\n'
      }
      
      debugInfo += '\n'
    })
    
    // Coletar informações sobre botões
    cy.get('button').then(($buttons) => {
      debugInfo += `🔘 Botões encontrados (${$buttons.length}):\n`
      
      if ($buttons.length > 0) {
        $buttons.each((i, el) => {
          const text = el.textContent?.trim() || 'sem texto'
          const className = el.className
          debugInfo += `  ${i + 1}. "${text}" class="${className}"\n`
        })
      } else {
        debugInfo += '  Nenhum botão encontrado\n'
      }
      
      debugInfo += '\n'
    })
    
    // Salvar informações em arquivo
    cy.writeFile('cypress/debug-dashboard-info.txt', debugInfo).then(() => {
      cy.log('✅ Informações de debug salvas em cypress/debug-dashboard-info.txt')
    })
    
    cy.log('✅ Debug concluído e salvo')
  })
})

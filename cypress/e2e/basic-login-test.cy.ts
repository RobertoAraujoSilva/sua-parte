/// <reference types="cypress" />

describe('🔐 Teste Básico de Login', () => {
  it('Deve fazer login e verificar se chegou ao dashboard', () => {
    cy.log('🧪 Teste básico de login')
    
    // Fazer login como instrutor
    cy.loginAsInstructor()
    
    // Verificar redirecionamento para dashboard
    cy.url().should('include', '/dashboard')
    
    // Aguardar carregamento da página
    cy.wait(5000)
    
    // Verificar se a página carregou
    cy.get('body').should('be.visible')
    
    // Verificar se há algum conteúdo na página
    cy.get('body').then(($body) => {
      const text = $body.text()
      cy.log(`📄 Conteúdo da página: ${text.substring(0, 200)}...`)
      
      // Salvar o conteúdo em arquivo
      cy.writeFile('cypress/page-content.txt', text).then(() => {
        cy.log('✅ Conteúdo da página salvo em cypress/page-content.txt')
      })
    })
    
    // Verificar se há elementos HTML
    cy.get('*').then(($elements) => {
      cy.log(`🔍 Total de elementos na página: ${$elements.length}`)
      
      // Verificar se há elementos com texto
      const elementsWithText = $elements.filter((i, el) => {
        const text = el.textContent?.trim()
        return text && text.length > 0
      })
      
      cy.log(`📝 Elementos com texto: ${elementsWithText.length}`)
      
      // Salvar informações básicas
      let info = `Total de elementos: ${$elements.length}\n`
      info += `Elementos com texto: ${elementsWithText.length}\n\n`
      
      // Primeiros 10 elementos com texto
      elementsWithText.slice(0, 10).each((i, el) => {
        const tagName = el.tagName.toLowerCase()
        const text = el.textContent?.trim().substring(0, 100) || 'sem texto'
        info += `${i + 1}. ${tagName}: "${text}"\n`
      })
      
      cy.writeFile('cypress/basic-info.txt', info).then(() => {
        cy.log('✅ Informações básicas salvas em cypress/basic-info.txt')
      })
    })
    
    cy.log('✅ Teste básico concluído')
  })
})

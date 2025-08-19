/// <reference types="cypress" />

describe('🐛 Debug Dashboard - Verificar Elementos', () => {
  it('Deve verificar quais elementos estão sendo renderizados', () => {
    cy.log('🧪 Testando debug do dashboard')
    
    // Fazer login como instrutor
    cy.loginAsInstructor()
    
    // Verificar redirecionamento para dashboard
    cy.url().should('include', '/dashboard')
    
    // Aguardar carregamento da página
    cy.wait(3000)
    
    // Verificar o que está sendo renderizado
    cy.log('📋 Verificando elementos da página...')
    
    // Verificar se há algum h1, h2, h3
    cy.get('h1, h2, h3').then(($headers) => {
      cy.log(`Encontrados ${$headers.length} headers:`)
      if ($headers.length > 0) {
        $headers.each((i, el) => {
          cy.log(`Header ${i + 1}: ${el.textContent}`)
        })
      } else {
        cy.log('❌ Nenhum header encontrado')
      }
    })
    
    // Verificar se há elementos com data-testid (pode não existir)
    cy.get('body').then(($body) => {
      const dataTestIdElements = $body.find('[data-testid]')
      cy.log(`Encontrados ${dataTestIdElements.length} elementos com data-testid:`)
      if (dataTestIdElements.length > 0) {
        dataTestIdElements.each((i, el) => {
          const testId = el.getAttribute('data-testid')
          const text = el.textContent?.substring(0, 50) || 'sem texto'
          cy.log(`Elemento ${i + 1}: data-testid="${testId}" - texto: "${text}"`)
        })
      } else {
        cy.log('❌ Nenhum elemento com data-testid encontrado')
      }
    })
    
    // Verificar se há navegação
    cy.get('nav, .nav, [role="navigation"], .navigation, .navbar').then(($navs) => {
      cy.log(`Encontrados ${$navs.length} elementos de navegação:`)
      if ($navs.length > 0) {
        $navs.each((i, el) => {
          cy.log(`Nav ${i + 1}: ${el.textContent?.substring(0, 100)}`)
        })
      } else {
        cy.log('❌ Nenhum elemento de navegação encontrado')
      }
    })
    
    // Verificar se há botões
    cy.get('button').then(($buttons) => {
      cy.log(`Encontrados ${$buttons.length} botões:`)
      if ($buttons.length > 0) {
        $buttons.each((i, el) => {
          const text = el.textContent?.substring(0, 30) || 'sem texto'
          cy.log(`Botão ${i + 1}: "${text}"`)
        })
      } else {
        cy.log('❌ Nenhum botão encontrado')
      }
    })
    
    // Verificar se há links
    cy.get('a').then(($links) => {
      cy.log(`Encontrados ${$links.length} links:`)
      if ($links.length > 0) {
        $links.each((i, el) => {
          const text = el.textContent?.substring(0, 30) || 'sem texto'
          const href = el.getAttribute('href') || 'sem href'
          cy.log(`Link ${i + 1}: "${text}" -> ${href}`)
        })
      } else {
        cy.log('❌ Nenhum link encontrado')
      }
    })
    
    // Verificar se há divs com classes específicas (sem falhar se não encontrar)
    cy.get('body').then(($body) => {
      const dashboardDivs = $body.find('div[class*="dashboard"], div[class*="header"], div[class*="nav"]')
      cy.log(`Encontrados ${dashboardDivs.length} divs com classes relacionadas ao dashboard:`)
      if (dashboardDivs.length > 0) {
        dashboardDivs.each((i, el) => {
          const className = el.className
          const text = el.textContent?.substring(0, 50) || 'sem texto'
          cy.log(`Div ${i + 1}: class="${className}" - texto: "${text}"`)
        })
      } else {
        cy.log('❌ Nenhum div com classes de dashboard encontrado')
      }
    })
    
    // Verificar se há spans ou outros elementos com texto
    cy.get('span, p, div').then(($textElements) => {
      const visibleElements = $textElements.filter((i, el) => {
        const text = el.textContent?.trim()
        return text && text.length > 0 && text.length < 100
      }).slice(0, 10) // Limitar a 10 elementos para não poluir o log
      
      cy.log(`Encontrados ${visibleElements.length} elementos com texto visível (primeiros 10):`)
      visibleElements.each((i, el) => {
        const text = el.textContent?.trim()
        const tagName = el.tagName.toLowerCase()
        cy.log(`Elemento ${i + 1} (${tagName}): "${text}"`)
      })
    })
    
    // Verificar se há elementos com classes específicas
    cy.get('body').then(($body) => {
      const elementsWithClasses = $body.find('[class]')
      const relevantElements = elementsWithClasses.filter((i, el) => {
        const className = el.className
        // Verificar se className é uma string válida antes de usar includes
        if (typeof className === 'string') {
          return className.includes('dashboard') || 
                 className.includes('header') || 
                 className.includes('nav') || 
                 className.includes('main') ||
                 className.includes('content')
        }
        return false
      }).slice(0, 10)
      
      cy.log(`Encontrados ${relevantElements.length} elementos com classes relevantes (primeiros 10):`)
      relevantElements.each((i, el) => {
        const className = el.className
        const tagName = el.tagName.toLowerCase()
        const text = el.textContent?.substring(0, 50) || 'sem texto'
        cy.log(`Elemento ${i + 1} (${tagName}): class="${className}" - texto: "${text}"`)
      })
    })
    
    // Capturar screenshot para análise
    cy.screenshot('debug-dashboard-elements')
    
    cy.log('✅ Debug do dashboard concluído')
  })
})

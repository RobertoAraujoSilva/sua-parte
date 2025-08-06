/// <reference types="cypress" />

// ***********************************************
// This example commands.ts shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************

declare global {
  namespace Cypress {
    interface Chainable {
      /**
       * Login como Franklin (estudante)
       * @example cy.loginAsFranklin()
       */
      loginAsFranklin(): Chainable<void>

      /**
       * Login com credenciais customizadas
       * @param email - Email do usuário
       * @param password - Senha do usuário
       * @example cy.loginWithCredentials('user@example.com', 'password123')
       */
      loginWithCredentials(email: string, password: string): Chainable<void>

      /**
       * Register Sarah as a student with birth date
       * @example cy.registerSarah()
       */
      registerSarah(): Chainable<void>

      /**
       * Login as Sarah (estudante)
       * @example cy.loginAsSarah()
       */
      loginAsSarah(): Chainable<void>
      
      /**
       * Aguardar o carregamento completo da página
       * @example cy.waitForPageLoad()
       */
      waitForPageLoad(): Chainable<void>
      
      /**
       * Verificar se está na página correta
       * @param path - Caminho esperado
       * @example cy.shouldBeOnPage('/estudante/123')
       */
      shouldBeOnPage(path: string): Chainable<void>
      
      /**
       * Aguardar elemento aparecer e estar visível
       * @param selector - Seletor do elemento
       * @param timeout - Timeout em ms (opcional)
       * @example cy.waitForElement('[data-testid="welcome-message"]')
       */
      waitForElement(selector: string, timeout?: number): Chainable<JQuery<HTMLElement>>
    }
  }
}

// Comando para login como Franklin
Cypress.Commands.add('loginAsFranklin', () => {
  const email = Cypress.env('FRANKLIN_EMAIL')
  const password = Cypress.env('FRANKLIN_PASSWORD')
  
  cy.log('🔐 Fazendo login como Franklin...')
  cy.visit(Cypress.env('AUTH_URL'))
  
  // Aguardar a página carregar
  cy.waitForPageLoad()
  
  // Preencher formulário de login
  cy.get('input[type="email"]', { timeout: 10000 })
    .should('be.visible')
    .clear()
    .type(email, { delay: 50 })
  
  cy.get('input[type="password"]')
    .should('be.visible')
    .clear()
    .type(password, { delay: 50 })
  
  // Clicar no botão de login
  cy.get('button[type="submit"]')
    .should('be.visible')
    .should('not.be.disabled')
    .click()
  
  // Aguardar resposta da autenticação
  cy.wait('@authToken', { timeout: 15000 }).then((interception) => {
    cy.log('✅ Token de autenticação recebido')
  })
})

// Comando para login com credenciais customizadas
Cypress.Commands.add('loginWithCredentials', (email: string, password: string) => {
  cy.log(`🔐 Fazendo login com ${email}...`)
  cy.visit(Cypress.env('AUTH_URL'))
  
  cy.waitForPageLoad()
  
  cy.get('input[type="email"]', { timeout: 10000 })
    .should('be.visible')
    .clear()
    .type(email, { delay: 50 })
  
  cy.get('input[type="password"]')
    .should('be.visible')
    .clear()
    .type(password, { delay: 50 })
  
  cy.get('button[type="submit"]')
    .should('be.visible')
    .should('not.be.disabled')
    .click()
  
  cy.wait('@authToken', { timeout: 15000 })
})

// Comando para aguardar carregamento da página
Cypress.Commands.add('waitForPageLoad', () => {
  cy.log('⏳ Aguardando carregamento da página...')
  
  // Aguardar que o documento esteja pronto
  cy.document().should('have.property', 'readyState', 'complete')
  
  // Aguardar que não haja mais requests pendentes
  cy.window().then((win) => {
    return new Cypress.Promise((resolve) => {
      const checkPendingRequests = () => {
        // @ts-ignore
        if (win.fetch && win.fetch.pendingRequests === 0) {
          resolve()
        } else {
          setTimeout(checkPendingRequests, 100)
        }
      }
      setTimeout(resolve, 1000) // Fallback timeout
    })
  })
})

// Comando para verificar se está na página correta
Cypress.Commands.add('shouldBeOnPage', (path: string) => {
  cy.log(`📍 Verificando se está na página: ${path}`)
  cy.url().should('include', path)
  cy.location('pathname').should('eq', path)
})

// Comando para aguardar elemento aparecer
Cypress.Commands.add('waitForElement', (selector: string, timeout: number = 10000) => {
  cy.log(`⏳ Aguardando elemento: ${selector}`)
  return cy.get(selector, { timeout })
    .should('exist')
    .should('be.visible')
})

// Comando adicional para debug
Cypress.Commands.add('debug', () => {
  cy.log('🐛 Debug: Pausando execução...')
  cy.pause()
})

// Custom command to register Sarah as a student with birth date
Cypress.Commands.add('registerSarah', () => {
  const sarahData = {
    fullName: 'Sarah Rackel Ferreira Lima',
    email: 'franklima.flm@gmail.com',
    password: 'test@123',
    dateOfBirth: '2009-09-25',
    congregation: 'Market Harborough',
    cargo: 'publicador_nao_batizado'
  }

  cy.log('🧪 Registering Sarah with birth date feature')

  // Navigate to auth page
  cy.visit('/auth')
  cy.waitForPageLoad()

  // Switch to signup tab
  cy.get('[data-testid="signup-tab"], button:contains("Criar Conta"), [role="tab"]:contains("Criar")')
    .should('be.visible')
    .click()

  // Select student account type
  cy.get('div:contains("Estudante")')
    .should('be.visible')
    .click()

  // Fill form fields
  cy.get('input[id*="nome"], input[placeholder*="nome"]')
    .parent()
    .find('input')
    .clear()
    .type(sarahData.fullName)

  // Birth date (NEW FEATURE)
  cy.get('input[type="date"]')
    .clear()
    .type(sarahData.dateOfBirth)

  cy.get('input[id*="congregacao"], input[placeholder*="congregação"]')
    .parent()
    .find('input')
    .clear()
    .type(sarahData.congregation)

  // Select ministerial role
  cy.get('select, [role="combobox"], button:contains("Selecione seu cargo")')
    .click()

  cy.get('option:contains("Publicador Não Batizado"), [role="option"]:contains("Publicador Não Batizado")')
    .click()

  // Email and password
  cy.get('input[type="email"]')
    .clear()
    .type(sarahData.email)

  cy.get('input[type="password"]')
    .first()
    .clear()
    .type(sarahData.password)

  cy.get('input[type="password"]')
    .last()
    .clear()
    .type(sarahData.password)

  // Submit registration
  cy.get('button[type="submit"], button:contains("Criar Conta")')
    .click()

  // Wait for redirect to student portal
  cy.url({ timeout: 30000 }).should('include', '/estudante/')

  cy.log('✅ Sarah registered successfully')
})

// Custom command to login as Sarah
Cypress.Commands.add('loginAsSarah', () => {
  cy.log('🔐 Logging in as Sarah')

  cy.visit('/auth')
  cy.waitForPageLoad()

  // Ensure on sign-in tab
  cy.get('[data-testid="signin-tab"], button:contains("Entrar")')
    .click()

  cy.get('input[type="email"]')
    .clear()
    .type('franklima.flm@gmail.com')

  cy.get('input[type="password"]')
    .clear()
    .type('test@123')

  cy.get('button[type="submit"], button:contains("Entrar")')
    .click()

  cy.url({ timeout: 30000 }).should('include', '/estudante/')

  cy.log('✅ Sarah logged in successfully')
})

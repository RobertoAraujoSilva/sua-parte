/// <reference types="cypress" />

declare global {
  namespace Cypress {
    interface Chainable {
      /**
       * Login como Instrutor (admin completo)
       * @example cy.loginAsInstructor()
       */
      loginAsInstructor(): Chainable<void>

      /**
       * Login como Estudante (acesso limitado)
       * @example cy.loginAsStudent()
       */
      loginAsStudent(): Chainable<void>

      /**
       * Login como Franklin (estudante - legacy)
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

      /**
       * Debug command to pause execution
       * @example cy.debugTest()
       */
      debugTest(): Chainable<void>
    }
  }
}

export {}

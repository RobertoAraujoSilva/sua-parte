// ***********************************************************
// This example support/e2e.ts is processed and
// loaded automatically before your test files.
//
// This is a great place to put global configuration and
// behavior that modifies Cypress.
//
// You can change the location of this file or turn off
// automatically serving support files with the
// 'supportFile' configuration option.
//
// You can read more here:
// https://on.cypress.io/configuration
// ***********************************************************

// Import commands.js using ES2015 syntax:
import './commands'

// Alternatively you can use CommonJS syntax:
// require('./commands')

// Configurações globais para o Sistema Ministerial
Cypress.on('uncaught:exception', (err, runnable) => {
  // Ignorar erros específicos que não afetam os testes
  if (err.message.includes('ResizeObserver loop limit exceeded')) {
    return false
  }
  if (err.message.includes('Non-Error promise rejection captured')) {
    return false
  }
  // Permitir que outros erros falhem o teste
  return true
})

// Configurações de viewport padrão
beforeEach(() => {
  // Configurar viewport para desktop
  cy.viewport(1280, 720)
  
  // Limpar localStorage e sessionStorage antes de cada teste
  cy.clearLocalStorage()
  cy.clearCookies()
  
  // Configurar interceptações comuns
  cy.intercept('POST', '**/auth/v1/token**').as('authToken')
  cy.intercept('GET', '**/auth/v1/user**').as('getUser')
  cy.intercept('GET', '**/rest/v1/user_profiles**').as('getUserProfile')
  cy.intercept('GET', '**/rest/v1/profiles**').as('getProfiles')
})

// Cypress support file
import './commands'

// Disable uncaught exception handling
Cypress.on('uncaught:exception', (err, runnable) => {
  return false
})
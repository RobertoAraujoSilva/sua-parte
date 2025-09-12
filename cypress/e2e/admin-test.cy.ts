describe('Admin Dashboard Test', () => {
  beforeEach(() => {
    cy.visit('/admin')
  })

  it('should load admin dashboard', () => {
    cy.contains('Sistema Ministerial').should('be.visible')
    cy.get('body').should('be.visible')
  })

  it('should login as admin', () => {
    cy.loginAsAdmin()
    cy.wait(3000)
    cy.contains('Admin Dashboard').should('be.visible')
  })

  it('should display dashboard stats', () => {
    cy.loginAsAdmin()
    cy.wait(3000)
    cy.get('.card').should('have.length.at.least', 1)
  })

  it('should navigate tabs', () => {
    cy.loginAsAdmin()
    cy.wait(3000)
    
    const tabs = ['Programas', 'Materiais', 'Sistema']
    tabs.forEach(tab => {
      cy.contains(tab).click()
      cy.wait(500)
    })
  })
})
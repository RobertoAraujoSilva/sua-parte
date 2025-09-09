describe('Mobile Landing Page', () => {
  it('should not have horizontal overflow on iPhone 6', () => {
    cy.viewport('iphone-6');
    cy.visit('/');
    cy.window().then((win) => {
      expect(win.document.documentElement.scrollWidth).to.equal(win.document.documentElement.clientWidth);
    });
  });

  it('should not have horizontal overflow on iPad portrait', () => {
    cy.viewport('ipad-2', 'portrait');
    cy.visit('/');
    cy.window().then((win) => {
      expect(win.document.documentElement.scrollWidth).to.equal(win.document.documentElement.clientWidth);
    });
  });

  // Add test for Hero height
  it('should have Hero occupying at least 60% of viewport height', () => {
    cy.viewport('iphone-6');
    cy.visit('/');
    cy.get('.hero-section').then(($el) => { // assuming class name
      const height = $el.height();
      const viewportHeight = Cypress.config('viewportHeight');
      expect(height).to.be.at.least(viewportHeight * 0.6);
    });
  });
});

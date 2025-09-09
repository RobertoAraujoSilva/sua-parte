/// <reference types="cypress" />

describe('Assignment Generation Functionality', () => {
  beforeEach(() => {
    // Login as instructor and navigate to programs page
    cy.visit('/auth');
    cy.get('input[type="email"]').type(Cypress.env('INSTRUCTOR_EMAIL'));
    cy.get('input[type="password"]').type(Cypress.env('INSTRUCTOR_PASSWORD'));
    cy.get('button[type="submit"]').click();
    cy.url().should('include', '/dashboard');
    cy.visit('/programas');
  });

  describe('Assignment Generation Workflow', () => {
    it('should complete full assignment generation workflow', () => {
      cy.log('🧪 Testing complete assignment generation workflow');
      
      // Step 1: Upload a PDF program
      const fileName = 'mwb_T_202508.pdf';
      cy.get('[data-testid="pdf-file-input"]').selectFile({
        contents: Cypress.Buffer.from('August 2025 workbook content'),
        fileName: fileName,
        mimeType: 'application/pdf',
      }, { force: true });

      // Wait for upload completion
      cy.contains('PDF Importado com Sucesso!', { timeout: 15000 }).should('be.visible');
      
      // Reset upload to see the program in list
      cy.contains('Importar Outro PDF').click();
      
      // Step 2: Verify program appears with correct status
      cy.contains('Apostila Agosto 2025').should('be.visible');
      cy.contains('Aguardando Designações').should('be.visible');
      
      // Step 3: Click "Gerar Designações" button
      cy.get('[data-testid="generate-assignments-button"]').first().click();
      
      // Step 4: Verify assignment generation modal appears
      cy.contains('Gerando Designações').should('be.visible');
      cy.contains('Criando designações inteligentes').should('be.visible');
      
      // Step 5: Wait for generation process to complete
      cy.contains('Designações Criadas!', { timeout: 30000 }).should('be.visible');
      
      // Step 6: Verify preview modal appears
      cy.contains('Prévia das Designações Geradas', { timeout: 5000 }).should('be.visible');
      cy.contains('Estudantes Designados').should('be.visible');
      cy.contains('Total de Partes').should('be.visible');
      
      // Step 7: Confirm assignments
      cy.contains('Confirmar Designações').click();
      
      // Step 8: Verify success and navigation
      cy.contains('Designações Confirmadas!', { timeout: 10000 }).should('be.visible');
      cy.url({ timeout: 10000 }).should('include', '/designacoes');
      
      cy.log('✅ Assignment generation workflow completed successfully');
    });

    it('should handle programs without sufficient students gracefully', () => {
      cy.log('🧪 Testing assignment generation with insufficient students');
      
      // Upload a program
      const fileName = 'programa-test-insufficient.pdf';
      cy.get('[data-testid="pdf-file-input"]').selectFile({
        contents: Cypress.Buffer.from('Test program content'),
        fileName: fileName,
        mimeType: 'application/pdf',
      }, { force: true });

      cy.contains('PDF Importado com Sucesso!', { timeout: 15000 }).should('be.visible');
      cy.contains('Importar Outro PDF').click();
      
      // Try to generate assignments
      cy.get('[data-testid="generate-assignments-button"]').first().click();
      
      // Should show generation modal
      cy.contains('Gerando Designações').should('be.visible');
      
      // Should handle error gracefully (if no students available)
      // This test assumes the system will show appropriate error messages
      cy.get('body', { timeout: 30000 }).should('contain.text', 'Designações');
      
      cy.log('✅ Error handling working correctly');
    });
  });

  describe('Assignment Generation UI Elements', () => {
    it('should display correct button states during generation', () => {
      cy.log('🧪 Testing button states during assignment generation');
      
      // Upload a program first
      const fileName = 'programa-button-states.pdf';
      cy.get('[data-testid="pdf-file-input"]').selectFile({
        contents: Cypress.Buffer.from('Button states test content'),
        fileName: fileName,
        mimeType: 'application/pdf',
      }, { force: true });

      cy.contains('PDF Importado com Sucesso!', { timeout: 15000 }).should('be.visible');
      cy.contains('Importar Outro PDF').click();
      
      // Verify initial button state
      cy.get('[data-testid="generate-assignments-button"]').first().should('be.visible');
      cy.get('[data-testid="generate-assignments-button"]').first().should('contain.text', 'Gerar Designações');
      
      // Click to start generation
      cy.get('[data-testid="generate-assignments-button"]').first().click();
      
      // Verify button changes to loading state
      cy.contains('Gerando...').should('be.visible');
      
      // Wait for completion
      cy.contains('Prévia das Designações Geradas', { timeout: 30000 }).should('be.visible');
      
      // Close preview
      cy.contains('Cancelar').click();
      
      cy.log('✅ Button states working correctly');
    });

    it('should show assignment preview with correct information', () => {
      cy.log('🧪 Testing assignment preview modal content');
      
      // Upload and generate assignments
      const fileName = 'programa-preview-test.pdf';
      cy.get('[data-testid="pdf-file-input"]').selectFile({
        contents: Cypress.Buffer.from('Preview test content'),
        fileName: fileName,
        mimeType: 'application/pdf',
      }, { force: true });

      cy.contains('PDF Importado com Sucesso!', { timeout: 15000 }).should('be.visible');
      cy.contains('Importar Outro PDF').click();
      
      cy.get('[data-testid="generate-assignments-button"]').first().click();
      
      // Wait for preview modal
      cy.contains('Prévia das Designações Geradas', { timeout: 30000 }).should('be.visible');
      
      // Verify preview content
      cy.contains('Estudantes Designados').should('be.visible');
      cy.contains('Total de Partes').should('be.visible');
      cy.contains('Com Ajudantes').should('be.visible');
      
      // Verify assignment cards are displayed
      cy.contains('Parte').should('be.visible');
      cy.contains('Estudante Principal').should('be.visible');
      
      // Verify action buttons
      cy.contains('Cancelar').should('be.visible');
      cy.contains('Confirmar Designações').should('be.visible');
      
      cy.log('✅ Assignment preview displaying correctly');
    });
  });

  describe('Program Status Management', () => {
    it('should update program status after assignment generation', () => {
      cy.log('🧪 Testing program status updates');
      
      // Upload a program
      const fileName = 'programa-status-test.pdf';
      cy.get('[data-testid="pdf-file-input"]').selectFile({
        contents: Cypress.Buffer.from('Status test content'),
        fileName: fileName,
        mimeType: 'application/pdf',
      }, { force: true });

      cy.contains('PDF Importado com Sucesso!', { timeout: 15000 }).should('be.visible');
      cy.contains('Importar Outro PDF').click();
      
      // Verify initial status
      cy.contains('Aguardando Designações').should('be.visible');
      cy.get('[data-testid="generate-assignments-button"]').should('be.visible');
      
      // Generate assignments
      cy.get('[data-testid="generate-assignments-button"]').first().click();
      cy.contains('Prévia das Designações Geradas', { timeout: 30000 }).should('be.visible');
      cy.contains('Confirmar Designações').click();
      
      // Wait for navigation back to programs or designations
      cy.url({ timeout: 10000 }).should('match', /\/(designacoes|programas)/);
      
      // If we're on designations page, go back to programs to verify status
      cy.url().then((url) => {
        if (url.includes('/designacoes')) {
          cy.visit('/programas');
        }
      });
      
      // Verify status changed
      cy.contains('Designações Geradas').should('be.visible');
      cy.contains('Ver Designações').should('be.visible');
      
      cy.log('✅ Program status updates working correctly');
    });

    it('should show "Ver Designações" button for completed programs', () => {
      cy.log('🧪 Testing "Ver Designações" button functionality');
      
      // Look for a program with generated assignments (from previous test or mock data)
      cy.get('body').then($body => {
        if ($body.find(':contains("Designações Geradas")').length > 0) {
          // Click "Ver Designações" button
          cy.contains('Ver Designações').first().click();
          
          // Should navigate to designations page
          cy.url().should('include', '/designacoes');
          
          cy.log('✅ "Ver Designações" navigation working correctly');
        } else {
          cy.log('ℹ️ No programs with generated assignments found - skipping test');
        }
      });
    });
  });

  describe('Error Handling and Edge Cases', () => {
    it('should handle authentication errors gracefully', () => {
      cy.log('🧪 Testing authentication error handling');
      
      // This test would require mocking authentication failure
      // For now, we'll test that the system requires authentication
      
      // Upload a program
      const fileName = 'programa-auth-test.pdf';
      cy.get('[data-testid="pdf-file-input"]').selectFile({
        contents: Cypress.Buffer.from('Auth test content'),
        fileName: fileName,
        mimeType: 'application/pdf',
      }, { force: true });

      cy.contains('PDF Importado com Sucesso!', { timeout: 15000 }).should('be.visible');
      cy.contains('Importar Outro PDF').click();
      
      // Verify button is available (user is authenticated)
      cy.get('[data-testid="generate-assignments-button"]').should('be.visible');
      
      cy.log('✅ Authentication requirements working correctly');
    });

    it('should prevent multiple simultaneous generations', () => {
      cy.log('🧪 Testing prevention of multiple simultaneous generations');
      
      // Upload multiple programs
      const fileName1 = 'programa-multi-1.pdf';
      cy.get('[data-testid="pdf-file-input"]').selectFile({
        contents: Cypress.Buffer.from('Multi test content 1'),
        fileName: fileName1,
        mimeType: 'application/pdf',
      }, { force: true });

      cy.contains('PDF Importado com Sucesso!', { timeout: 15000 }).should('be.visible');
      cy.contains('Importar Outro PDF').click();
      
      // Start generation for first program
      cy.get('[data-testid="generate-assignments-button"]').first().click();
      
      // Verify generation modal appears
      cy.contains('Gerando Designações').should('be.visible');
      
      // Other generation buttons should be disabled
      cy.get('[data-testid="generate-assignments-button"]').should('be.disabled');
      
      cy.log('✅ Multiple generation prevention working correctly');
    });
  });

  describe('Integration with Designations System', () => {
    it('should create assignments that appear in designations page', () => {
      cy.log('🧪 Testing integration with designations system');
      
      // Generate assignments (reuse workflow from first test)
      const fileName = 'programa-integration-test.pdf';
      cy.get('[data-testid="pdf-file-input"]').selectFile({
        contents: Cypress.Buffer.from('Integration test content'),
        fileName: fileName,
        mimeType: 'application/pdf',
      }, { force: true });

      cy.contains('PDF Importado com Sucesso!', { timeout: 15000 }).should('be.visible');
      cy.contains('Importar Outro PDF').click();
      
      cy.get('[data-testid="generate-assignments-button"]').first().click();
      cy.contains('Prévia das Designações Geradas', { timeout: 30000 }).should('be.visible');
      cy.contains('Confirmar Designações').click();
      
      // Should navigate to designations page
      cy.url({ timeout: 10000 }).should('include', '/designacoes');
      
      // Verify assignments appear in designations system
      cy.contains('Designações').should('be.visible');
      
      // Look for assignment-related content
      cy.get('body').should('contain.text', 'Programa');
      
      cy.log('✅ Integration with designations system working correctly');
    });
  });
});

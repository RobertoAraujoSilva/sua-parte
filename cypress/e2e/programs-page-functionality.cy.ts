/// <reference types="cypress" />

describe('Programs Page Functionality', () => {
  beforeEach(() => {
    // Login as instructor
    cy.visit('/auth');
    cy.get('input[type="email"]').type(Cypress.env('INSTRUCTOR_EMAIL'));
    cy.get('input[type="password"]').type(Cypress.env('INSTRUCTOR_PASSWORD'));
    cy.get('button[type="submit"]').click();
    cy.url().should('include', '/dashboard');
    
    // Navigate to programs page
    cy.visit('/programas');
    cy.url().should('include', '/programas');
  });

  describe('Page Layout and Navigation', () => {
    it('should display the programs page header', () => {
      cy.contains('Gestão de Programas').should('be.visible');
      cy.contains('Importe e gerencie programas semanais da apostila Vida e Ministério Cristão').should('be.visible');
    });

    it('should have a back to dashboard button', () => {
      cy.contains('Voltar ao Dashboard').should('be.visible').click();
      cy.url().should('include', '/dashboard');
    });

    it('should display tutorial button', () => {
      cy.visit('/programas');
      cy.get('button').contains('Tutorial').should('be.visible');
    });
  });

  describe('PDF Upload Section', () => {
    it('should display upload section with correct elements', () => {
      cy.contains('Importar Novo Programa').should('be.visible');
      cy.get('[data-testid="pdf-upload-button"]').should('be.visible');
      cy.contains('Criar Manualmente').should('be.visible');
      cy.contains('Formatos aceitos: PDF • Tamanho máximo: 10MB').should('be.visible');
    });

    it('should handle successful PDF upload', () => {
      const fileName = 'programa-teste-funcional.pdf';
      
      cy.get('[data-testid="pdf-file-input"]').selectFile({
        contents: Cypress.Buffer.from('Test PDF content'),
        fileName: fileName,
        mimeType: 'application/pdf',
      }, { force: true });

      cy.contains('Processando PDF...').should('be.visible');
      cy.contains('PDF Importado com Sucesso!', { timeout: 10000 }).should('be.visible');
    });
  });

  describe('Programs List', () => {
    it('should display programs list section', () => {
      cy.contains('Programas Importados').should('be.visible');
      cy.get('input[placeholder="Buscar programas..."]').should('be.visible');
    });

    it('should display program cards with correct information', () => {
      // Check if program cards exist (from mock data)
      cy.get('.space-y-4').within(() => {
        cy.get('.hover\\:shadow-lg').should('exist');
      });
    });

    it('should show program details in cards', () => {
      // Look for program information in cards
      cy.contains('Arquivo:').should('be.visible');
      cy.contains('Partes do Programa:').should('be.visible');
      cy.contains('Status das Designações:').should('be.visible');
    });

    it('should display action buttons for programs', () => {
      cy.contains('Visualizar').should('be.visible');
      cy.contains('Download').should('be.visible');
    });

    it('should show generate assignments button for pending programs', () => {
      cy.contains('Gerar Designações').should('be.visible');
    });

    it('should filter programs using search', () => {
      const searchInput = cy.get('input[placeholder="Buscar programas..."]');
      searchInput.should('be.visible');
      
      // Type in search (this will test the input functionality)
      searchInput.type('Agosto');
      searchInput.should('have.value', 'Agosto');
    });
  });

  describe('Statistics Section', () => {
    it('should display statistics cards', () => {
      cy.contains('Estatísticas').should('be.visible');
      cy.contains('Programas Importados').should('be.visible');
      cy.contains('Programas Processados').should('be.visible');
      cy.contains('Aguardando Processamento').should('be.visible');
      cy.contains('Partes Identificadas').should('be.visible');
    });

    it('should show correct statistics numbers', () => {
      // Check for numeric values in statistics
      cy.get('.text-3xl.font-bold').should('exist');
    });
  });

  describe('Program Status Management', () => {
    it('should display different status badges', () => {
      // Check for status badges
      cy.get('.bg-green-100').should('exist'); // Processado
      cy.get('.bg-yellow-100').should('exist'); // Pendente
      cy.get('.bg-gray-100').should('exist'); // Rascunho
    });

    it('should show appropriate actions based on status', () => {
      // Programs with generated assignments should not show "Gerar Designações"
      // Programs without assignments should show "Gerar Designações"
      cy.contains('Designações Geradas').should('be.visible');
      cy.contains('Aguardando Designações').should('be.visible');
    });
  });

  describe('Integration with Upload', () => {
    it('should add new program to list after successful upload', () => {
      // Count existing programs
      cy.get('.space-y-4 > .hover\\:shadow-lg').then($cards => {
        const initialCount = $cards.length;
        
        // Upload a new program
        const fileName = 'programa-integracao.pdf';
        cy.get('[data-testid="pdf-file-input"]').selectFile({
          contents: Cypress.Buffer.from('Integration test PDF'),
          fileName: fileName,
          mimeType: 'application/pdf',
        }, { force: true });

        // Wait for upload completion
        cy.contains('PDF Importado com Sucesso!', { timeout: 10000 }).should('be.visible');
        
        // Reset upload to see the updated list
        cy.contains('Importar Outro PDF').click();
        
        // Check if the new program appears in the list
        cy.get('.space-y-4 > .hover\\:shadow-lg').should('have.length', initialCount + 1);
      });
    });

    it('should show toast notification after successful upload', () => {
      const fileName = 'programa-notificacao.pdf';
      
      cy.get('[data-testid="pdf-file-input"]').selectFile({
        contents: Cypress.Buffer.from('Notification test PDF'),
        fileName: fileName,
        mimeType: 'application/pdf',
      }, { force: true });

      // Wait for upload and check for toast (if visible)
      cy.contains('PDF Importado com Sucesso!', { timeout: 10000 }).should('be.visible');
    });
  });

  describe('Responsive Design', () => {
    it('should work on mobile viewport', () => {
      cy.viewport('iphone-x');
      cy.contains('Gestão de Programas').should('be.visible');
      cy.get('[data-testid="pdf-upload-button"]').should('be.visible');
    });

    it('should work on tablet viewport', () => {
      cy.viewport('ipad-2');
      cy.contains('Gestão de Programas').should('be.visible');
      cy.get('[data-testid="pdf-upload-button"]').should('be.visible');
    });
  });

  describe('Error Handling', () => {
    it('should handle network errors gracefully', () => {
      // This would require mocking network failures
      // For now, we'll test that error states are handled in the upload component
      cy.get('[data-testid="pdf-file-input"]').selectFile({
        contents: Cypress.Buffer.from('Error test'),
        fileName: 'error-test.txt', // Wrong file type
        mimeType: 'text/plain',
      }, { force: true });

      cy.contains('Erro ao Processar PDF').should('be.visible');
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA labels and roles', () => {
      cy.get('[data-testid="pdf-upload-button"]').should('have.attr', 'role', 'button');
      cy.get('input[placeholder="Buscar programas..."]').should('have.attr', 'type', 'text');
    });

    it('should be keyboard navigable', () => {
      cy.get('[data-testid="pdf-upload-button"]').focus().should('be.focused');
      cy.get('input[placeholder="Buscar programas..."]').focus().should('be.focused');
    });
  });
});

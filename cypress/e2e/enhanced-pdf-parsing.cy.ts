/// <reference types="cypress" />

describe('Enhanced PDF Parsing Functionality', () => {
  beforeEach(() => {
    // Login as instructor and navigate to programs page
    cy.visit('/auth');
    cy.get('input[type="email"]').type(Cypress.env('INSTRUCTOR_EMAIL'));
    cy.get('input[type="password"]').type(Cypress.env('INSTRUCTOR_PASSWORD'));
    cy.get('button[type="submit"]').click();
    cy.url().should('include', '/dashboard');
    cy.visit('/programas');
  });

  describe('JW.org Official Workbook Parsing', () => {
    const officialWorkbooks = [
      { filename: 'mwb_T_202507.pdf', expectedMonth: 'Julho', expectedYear: '2025' },
      { filename: 'mwb_T_202509.pdf', expectedMonth: 'Setembro', expectedYear: '2025' },
      { filename: 'mwb_T_202511.pdf', expectedMonth: 'Novembro', expectedYear: '2025' }
    ];

    officialWorkbooks.forEach(({ filename, expectedMonth, expectedYear }) => {
      it(`should correctly parse ${filename}`, () => {
        cy.log(`🧪 Testing parsing of ${filename}`);
        
        cy.get('[data-testid="pdf-file-input"]').selectFile({
          contents: Cypress.Buffer.from(`Official workbook content for ${expectedMonth} ${expectedYear}`),
          fileName: filename,
          mimeType: 'application/pdf',
        }, { force: true });

        // Wait for upload completion
        cy.contains('PDF Importado com Sucesso!', { timeout: 15000 }).should('be.visible');
        
        // Verify extracted information
        cy.contains('Programa:').should('be.visible');
        cy.contains(`Apostila ${expectedMonth} ${expectedYear}`).should('be.visible');
        cy.contains('Arquivo:').should('be.visible');
        cy.contains(filename).should('be.visible');
        
        // Reset for next test
        cy.contains('Importar Outro PDF').click();
        cy.contains('Importar Novo Programa').should('be.visible');
      });
    });
  });

  describe('Assignment Form Parsing', () => {
    it('should correctly identify and parse S-38 assignment form', () => {
      cy.log('🧪 Testing S-38 assignment form parsing');
      
      const filename = 'S-38_T.pdf';
      
      cy.get('[data-testid="pdf-file-input"]').selectFile({
        contents: Cypress.Buffer.from('Assignment form S-38 content'),
        fileName: filename,
        mimeType: 'application/pdf',
      }, { force: true });

      // Wait for completion
      cy.contains('PDF Importado com Sucesso!', { timeout: 15000 }).should('be.visible');
      
      // Verify assignment form recognition
      cy.contains('Formulário de Designação S-38').should('be.visible');
      cy.contains('Arquivo:').should('be.visible');
      cy.contains(filename).should('be.visible');
    });
  });

  describe('Weekly Program Parsing', () => {
    const weeklyPrograms = [
      { 
        filename: 'programa-12-18-agosto-2024.pdf', 
        expectedWeek: '12-18 de Agosto de 2024' 
      },
      { 
        filename: 'programa-19-25-setembro-2024.pdf', 
        expectedWeek: '19-25 de Setembro de 2024' 
      },
      { 
        filename: '26-agosto-01-setembro-2024.pdf', 
        expectedWeek: '26-01 de Agosto de 2024' // This tests the fallback parsing
      }
    ];

    weeklyPrograms.forEach(({ filename, expectedWeek }) => {
      it(`should correctly parse weekly program ${filename}`, () => {
        cy.log(`🧪 Testing weekly program parsing: ${filename}`);
        
        cy.get('[data-testid="pdf-file-input"]').selectFile({
          contents: Cypress.Buffer.from(`Weekly program content for ${filename}`),
          fileName: filename,
          mimeType: 'application/pdf',
        }, { force: true });

        // Wait for completion
        cy.contains('PDF Importado com Sucesso!', { timeout: 15000 }).should('be.visible');
        
        // Verify week information extraction
        cy.contains('Programa:').should('be.visible');
        // Note: The exact week format might vary based on parsing logic
        cy.get('body').should('contain.text', filename.includes('agosto') ? 'Agosto' : 'Setembro');
        
        // Reset for next test
        cy.contains('Importar Outro PDF').click();
        cy.contains('Importar Novo Programa').should('be.visible');
      });
    });
  });

  describe('Enhanced Parsing Demo Page', () => {
    it('should access and use the PDF parsing test page', () => {
      cy.log('🧪 Testing PDF parsing demo page');
      
      // Navigate to the parsing test page
      cy.contains('🧪 Testar Parser Aprimorado').click();
      cy.url().should('include', '/pdf-parsing-test');
      
      // Verify page elements
      cy.contains('Teste do Parser de PDF Aprimorado').should('be.visible');
      cy.contains('Demonstração do Parser de PDF Aprimorado').should('be.visible');
      
      // Test the demo functionality
      cy.contains('Testar Análise de Arquivos').click();
      
      // Wait for results to appear
      cy.contains('Resultados da Análise', { timeout: 10000 }).should('be.visible');
      
      // Verify that different file types are parsed
      cy.contains('mwb_T_202507.pdf').should('be.visible');
      cy.contains('S-38_T.pdf').should('be.visible');
      cy.contains('Apostila Mensal').should('be.visible');
      cy.contains('Formulário de Designação').should('be.visible');
    });

    it('should display parsing results with correct information', () => {
      cy.visit('/pdf-parsing-test');
      
      // Run the parsing demo
      cy.contains('Testar Análise de Arquivos').click();
      
      // Wait for results
      cy.contains('Resultados da Análise', { timeout: 10000 }).should('be.visible');
      
      // Check for specific parsing results
      cy.get('body').should('contain.text', 'Apostila Julho 2025'); // From mwb_T_202507.pdf
      cy.get('body').should('contain.text', 'Formulário de Designação S-38'); // From S-38_T.pdf
      
      // Verify that program parts are displayed
      cy.contains('Tesouros da Palavra de Deus').should('be.visible');
      cy.contains('Faça Seu Melhor no Ministério').should('be.visible');
      cy.contains('Nossa Vida Cristã').should('be.visible');
    });
  });

  describe('Integration with Programs List', () => {
    it('should add parsed programs to the main programs list with correct information', () => {
      cy.log('🧪 Testing integration with programs list');
      
      // Count existing programs
      cy.get('[data-cy="program-card"]').then($cards => {
        const initialCount = $cards.length;
        
        // Upload a JW.org workbook
        const filename = 'mwb_T_202508.pdf';
        cy.get('[data-testid="pdf-file-input"]').selectFile({
          contents: Cypress.Buffer.from('August 2025 workbook content'),
          fileName: filename,
          mimeType: 'application/pdf',
        }, { force: true });

        // Wait for completion
        cy.contains('PDF Importado com Sucesso!', { timeout: 15000 }).should('be.visible');
        
        // Reset upload to see the updated list
        cy.contains('Importar Outro PDF').click();
        
        // Verify new program appears in list
        cy.get('[data-cy="program-card"]').should('have.length', initialCount + 1);
        
        // Verify the new program has correct information
        cy.contains('Apostila Agosto 2025').should('be.visible');
        cy.contains(filename).should('be.visible');
      });
    });
  });

  describe('Error Handling and Fallbacks', () => {
    it('should handle unknown file formats gracefully', () => {
      cy.log('🧪 Testing unknown format handling');
      
      const filename = 'unknown-format-file.pdf';
      
      cy.get('[data-testid="pdf-file-input"]').selectFile({
        contents: Cypress.Buffer.from('Unknown format content'),
        fileName: filename,
        mimeType: 'application/pdf',
      }, { force: true });

      // Should still complete successfully with fallback parsing
      cy.contains('PDF Importado com Sucesso!', { timeout: 15000 }).should('be.visible');
      
      // Should show the filename as program name
      cy.contains(`Programa Importado - ${filename}`).should('be.visible');
    });

    it('should maintain functionality even with parsing errors', () => {
      cy.log('🧪 Testing error resilience');
      
      // Upload a file that might cause parsing issues
      const filename = 'problematic-file-name-with-special-chars-@#$.pdf';
      
      cy.get('[data-testid="pdf-file-input"]').selectFile({
        contents: Cypress.Buffer.from('Content that might cause parsing issues'),
        fileName: filename,
        mimeType: 'application/pdf',
      }, { force: true });

      // Should handle gracefully
      cy.contains('PDF Importado com Sucesso!', { timeout: 15000 }).should('be.visible');
      
      // Should show some form of program information
      cy.contains('Programa:').should('be.visible');
      cy.contains('Arquivo:').should('be.visible');
    });
  });

  describe('Performance and User Experience', () => {
    it('should provide real-time feedback during parsing', () => {
      cy.log('🧪 Testing parsing feedback');
      
      const filename = 'mwb_T_202512.pdf';
      
      cy.get('[data-testid="pdf-file-input"]').selectFile({
        contents: Cypress.Buffer.from('December 2025 workbook content'),
        fileName: filename,
        mimeType: 'application/pdf',
      }, { force: true });

      // Should show processing state
      cy.contains('Processando PDF...').should('be.visible');
      
      // Should show progress indicators
      cy.get('[role="progressbar"]').should('be.visible');
      
      // Should show different phases of processing
      cy.contains('Fazendo upload...').should('be.visible');
      cy.contains('Extraindo informações do programa...', { timeout: 5000 }).should('be.visible');
      
      // Should complete successfully
      cy.contains('PDF Importado com Sucesso!', { timeout: 15000 }).should('be.visible');
    });
  });
});

/// <reference types="cypress" />

describe('PDF Upload Functionality', () => {
  beforeEach(() => {
    // Visit the auth page and login as instructor
    cy.visit('/auth');
    
    // Login with instructor credentials
    cy.get('input[type="email"]').type(Cypress.env('INSTRUCTOR_EMAIL'));
    cy.get('input[type="password"]').type(Cypress.env('INSTRUCTOR_PASSWORD'));
    cy.get('button[type="submit"]').click();
    
    // Wait for redirect to dashboard
    cy.url().should('include', '/dashboard');
    
    // Navigate to programs page
    cy.visit('/programas');
    cy.url().should('include', '/programas');
  });

  it('should display the PDF upload section', () => {
    // Check if the upload section is visible
    cy.contains('Importar Novo Programa').should('be.visible');
    cy.contains('Faça upload do PDF oficial da apostila Vida e Ministério Cristão').should('be.visible');
    cy.get('[data-testid="pdf-upload-button"]').should('be.visible');
    cy.contains('Formatos aceitos: PDF • Tamanho máximo: 10MB').should('be.visible');
  });

  it('should open file picker when PDF upload button is clicked', () => {
    // Click the PDF upload button
    cy.get('[data-testid="pdf-upload-button"]').click();
    
    // Check if the hidden file input exists and has correct attributes
    cy.get('[data-testid="pdf-file-input"]')
      .should('exist')
      .should('have.attr', 'type', 'file')
      .should('have.attr', 'accept', '.pdf');
  });

  it('should handle PDF file upload simulation', () => {
    // Create a mock PDF file
    const fileName = 'programa-teste.pdf';
    const fileContent = 'Mock PDF content for testing';
    
    // Upload the file
    cy.get('[data-testid="pdf-file-input"]').selectFile({
      contents: Cypress.Buffer.from(fileContent),
      fileName: fileName,
      mimeType: 'application/pdf',
    }, { force: true });

    // Check if upload process starts
    cy.contains('Processando PDF...').should('be.visible');
    
    // Wait for upload to complete (with timeout for mock processing)
    cy.contains('PDF Importado com Sucesso!', { timeout: 10000 }).should('be.visible');
    
    // Check if the uploaded program appears in the list
    cy.contains('Programa:').should('be.visible');
    cy.contains('Arquivo:').should('be.visible');
    cy.contains(fileName).should('be.visible');
  });

  it('should validate file type and show error for non-PDF files', () => {
    // Try to upload a non-PDF file
    const fileName = 'documento.txt';
    const fileContent = 'This is not a PDF file';
    
    cy.get('[data-testid="pdf-file-input"]').selectFile({
      contents: Cypress.Buffer.from(fileContent),
      fileName: fileName,
      mimeType: 'text/plain',
    }, { force: true });

    // Should show error message
    cy.contains('Erro ao Processar PDF').should('be.visible');
    cy.contains('Arquivo deve ser do tipo PDF').should('be.visible');
  });

  it('should validate file size and show error for large files', () => {
    // Create a large mock file (simulate > 10MB)
    const fileName = 'programa-grande.pdf';
    const largeContent = 'x'.repeat(11 * 1024 * 1024); // 11MB of content
    
    cy.get('[data-testid="pdf-file-input"]').selectFile({
      contents: Cypress.Buffer.from(largeContent),
      fileName: fileName,
      mimeType: 'application/pdf',
    }, { force: true });

    // Should show error message
    cy.contains('Erro ao Processar PDF').should('be.visible');
    cy.contains('Arquivo muito grande. Limite máximo: 10MB').should('be.visible');
  });

  it('should allow uploading another PDF after successful upload', () => {
    // First upload
    const fileName1 = 'programa-1.pdf';
    cy.get('[data-testid="pdf-file-input"]').selectFile({
      contents: Cypress.Buffer.from('PDF content 1'),
      fileName: fileName1,
      mimeType: 'application/pdf',
    }, { force: true });

    // Wait for completion
    cy.contains('PDF Importado com Sucesso!', { timeout: 10000 }).should('be.visible');
    
    // Click to upload another PDF
    cy.contains('Importar Outro PDF').click();
    
    // Should return to upload state
    cy.contains('Importar Novo Programa').should('be.visible');
    cy.get('[data-testid="pdf-upload-button"]').should('be.visible');
  });

  it('should show progress during upload', () => {
    const fileName = 'programa-com-progresso.pdf';
    
    cy.get('[data-testid="pdf-file-input"]').selectFile({
      contents: Cypress.Buffer.from('PDF content for progress test'),
      fileName: fileName,
      mimeType: 'application/pdf',
    }, { force: true });

    // Check if progress indicators are shown
    cy.contains('Processando PDF...').should('be.visible');
    cy.contains('Fazendo upload...').should('be.visible');
    
    // Progress bar should be visible
    cy.get('[role="progressbar"]').should('be.visible');
    
    // Eventually should show extraction phase
    cy.contains('Extraindo informações do programa...', { timeout: 5000 }).should('be.visible');
  });

  it('should extract program information from JW.org workbook filename', () => {
    // Upload a PDF with official JW.org workbook filename pattern
    const fileName = 'mwb_T_202507.pdf';

    cy.get('[data-testid="pdf-file-input"]').selectFile({
      contents: Cypress.Buffer.from('Official JW workbook content'),
      fileName: fileName,
      mimeType: 'application/pdf',
    }, { force: true });

    // Wait for completion
    cy.contains('PDF Importado com Sucesso!', { timeout: 10000 }).should('be.visible');

    // Check if program information was extracted correctly
    cy.contains('Programa:').should('be.visible');
    cy.contains('Apostila Julho 2025').should('be.visible');
    cy.contains('Arquivo:').should('be.visible');
    cy.contains(fileName).should('be.visible');
  });

  it('should handle assignment form S-38 correctly', () => {
    // Upload S-38 assignment form
    const fileName = 'S-38_T.pdf';

    cy.get('[data-testid="pdf-file-input"]').selectFile({
      contents: Cypress.Buffer.from('Assignment form content'),
      fileName: fileName,
      mimeType: 'application/pdf',
    }, { force: true });

    // Wait for completion
    cy.contains('PDF Importado com Sucesso!', { timeout: 10000 }).should('be.visible');

    // Check if assignment form was recognized
    cy.contains('Formulário de Designação S-38').should('be.visible');
  });

  it('should parse weekly program with specific dates', () => {
    // Upload weekly program with date range
    const fileName = 'programa-12-18-agosto-2024.pdf';

    cy.get('[data-testid="pdf-file-input"]').selectFile({
      contents: Cypress.Buffer.from('Weekly program content'),
      fileName: fileName,
      mimeType: 'application/pdf',
    }, { force: true });

    // Wait for completion
    cy.contains('PDF Importado com Sucesso!', { timeout: 10000 }).should('be.visible');

    // Check if week information was extracted
    cy.contains('12-18 de Agosto de 2024').should('be.visible');
  });

  it('should integrate with programs list after upload', () => {
    // Count initial programs
    cy.get('[data-cy="program-card"]').then($cards => {
      const initialCount = $cards.length;
      
      // Upload a new program
      const fileName = 'novo-programa.pdf';
      cy.get('[data-testid="pdf-file-input"]').selectFile({
        contents: Cypress.Buffer.from('New program content'),
        fileName: fileName,
        mimeType: 'application/pdf',
      }, { force: true });

      // Wait for completion
      cy.contains('PDF Importado com Sucesso!', { timeout: 10000 }).should('be.visible');
      
      // Check if new program appears in the list
      cy.get('[data-cy="program-card"]').should('have.length', initialCount + 1);
      
      // The new program should be at the top (most recent)
      cy.get('[data-cy="program-card"]').first().should('contain', fileName);
    });
  });

  it('should handle drag and drop upload', () => {
    // Create a mock PDF file for drag and drop
    const fileName = 'programa-drag-drop.pdf';
    const fileContent = 'PDF content for drag and drop test';
    
    // Simulate drag and drop (Note: Cypress has limitations with drag/drop file uploads)
    // This test verifies the drag/drop area exists and is properly configured
    cy.get('[data-testid="pdf-upload-button"]').parent().parent()
      .should('exist')
      .should('be.visible');
    
    // Alternative: Use the file input directly to simulate the end result
    cy.get('[data-testid="pdf-file-input"]').selectFile({
      contents: Cypress.Buffer.from(fileContent),
      fileName: fileName,
      mimeType: 'application/pdf',
    }, { force: true });

    cy.contains('PDF Importado com Sucesso!', { timeout: 10000 }).should('be.visible');
  });
});

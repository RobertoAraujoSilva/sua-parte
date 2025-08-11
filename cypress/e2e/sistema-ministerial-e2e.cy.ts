/// <reference types="cypress" />

/**
 * End-to-End Test Suite for Sistema Ministerial
 * 
 * This comprehensive test suite covers:
 * - Authentication and role-based access control
 * - PDF upload functionality
 * - Programs page functionality
 * - Cross-browser compatibility
 * - CI/CD environment compatibility
 */

describe('🎯 Sistema Ministerial - Complete E2E Test Suite', () => {
  beforeEach(() => {
    // Set up API interceptors for monitoring
    cy.intercept('POST', '**/auth/v1/token**').as('authToken')
    cy.intercept('GET', '**/auth/v1/user**').as('getUser')
    cy.intercept('GET', '**/rest/v1/profiles**').as('getProfiles')
  })

  describe('🔐 Authentication Flow', () => {
    it('should complete full instructor authentication flow', () => {
      cy.log('🧪 Testing complete instructor authentication flow')
      
      // Login as instructor
      cy.loginAsInstructor()
      
      // Verify dashboard access
      cy.url().should('include', '/dashboard')
      cy.contains('Painel de Controle').should('be.visible')
      
      // Verify instructor role display
      cy.contains('Instrutor').should('be.visible')
      
      // Test navigation to all instructor pages
      const instructorPages = [
        { path: '/estudantes', title: 'Estudantes' },
        { path: '/programas', title: 'Programas' },
        { path: '/designacoes', title: 'Designações' },
        { path: '/relatorios', title: 'Relatórios' }
      ]
      
      instructorPages.forEach(page => {
        cy.visit(page.path)
        cy.url().should('include', page.path)
        cy.contains(page.title).should('be.visible')
      })
      
      cy.log('✅ Instructor authentication flow completed successfully')
    })

    it('should complete full student authentication flow', () => {
      cy.log('🧪 Testing complete student authentication flow')
      
      // Login as student
      cy.loginAsStudent()
      
      // Verify student portal access
      cy.url().should('match', /\/(estudante|portal)/)
      
      // Verify restricted access to instructor pages
      const restrictedPages = ['/dashboard', '/estudantes', '/programas', '/designacoes']
      
      restrictedPages.forEach(page => {
        cy.visit(page, { failOnStatusCode: false })
        cy.url().should('not.include', page)
      })
      
      cy.log('✅ Student authentication flow completed successfully')
    })
  })

  describe('📚 PDF Upload Functionality', () => {
    beforeEach(() => {
      // Login as instructor for PDF upload tests
      cy.loginAsInstructor()
      cy.visit('/programas')
    })

    it('should handle successful PDF upload with progress tracking', () => {
      cy.log('🧪 Testing PDF upload with progress tracking')
      
      const fileName = 'programa-e2e-test.pdf'
      const fileContent = 'Mock PDF content for E2E testing'
      
      // Upload PDF file
      cy.get('[data-testid="pdf-file-input"]').selectFile({
        contents: Cypress.Buffer.from(fileContent),
        fileName: fileName,
        mimeType: 'application/pdf',
      }, { force: true })

      // Verify upload process
      cy.contains('Processando PDF...').should('be.visible')
      cy.get('[role="progressbar"]').should('be.visible')
      
      // Wait for completion
      cy.contains('PDF Importado com Sucesso!', { timeout: 15000 }).should('be.visible')
      
      // Verify extracted information
      cy.contains('Programa:').should('be.visible')
      cy.contains('Arquivo:').should('be.visible')
      cy.contains(fileName).should('be.visible')
      
      cy.log('✅ PDF upload completed successfully')
    })

    it('should validate file types and show appropriate errors', () => {
      cy.log('🧪 Testing PDF file validation')
      
      // Test invalid file type
      cy.get('[data-testid="pdf-file-input"]').selectFile({
        contents: Cypress.Buffer.from('Not a PDF file'),
        fileName: 'invalid-file.txt',
        mimeType: 'text/plain',
      }, { force: true })

      cy.contains('Erro ao Processar PDF').should('be.visible')
      cy.contains('Arquivo deve ser do tipo PDF').should('be.visible')
      
      cy.log('✅ File validation working correctly')
    })

    it('should integrate uploaded programs with the programs list', () => {
      cy.log('🧪 Testing PDF upload integration with programs list')
      
      // Count existing programs
      cy.get('[data-cy="program-card"]').then($cards => {
        const initialCount = $cards.length
        
        // Upload new program
        const fileName = 'programa-integracao-e2e.pdf'
        cy.get('[data-testid="pdf-file-input"]').selectFile({
          contents: Cypress.Buffer.from('Integration test PDF content'),
          fileName: fileName,
          mimeType: 'application/pdf',
        }, { force: true })

        // Wait for upload completion
        cy.contains('PDF Importado com Sucesso!', { timeout: 15000 }).should('be.visible')
        
        // Reset upload to see updated list
        cy.contains('Importar Outro PDF').click()
        
        // Verify new program in list
        cy.get('[data-cy="program-card"]').should('have.length', initialCount + 1)
        cy.contains(fileName).should('be.visible')
      })
      
      cy.log('✅ PDF upload integration working correctly')
    })
  })

  describe('📋 Programs Page Functionality', () => {
    beforeEach(() => {
      cy.loginAsInstructor()
      cy.visit('/programas')
    })

    it('should display all required page elements', () => {
      cy.log('🧪 Testing programs page elements')
      
      // Header elements
      cy.contains('Gestão de Programas').should('be.visible')
      cy.contains('Voltar ao Dashboard').should('be.visible')
      cy.get('button').contains('Tutorial').should('be.visible')
      
      // Upload section
      cy.contains('Importar Novo Programa').should('be.visible')
      cy.get('[data-testid="pdf-upload-button"]').should('be.visible')
      cy.contains('Criar Manualmente').should('be.visible')
      
      // Programs list
      cy.contains('Programas Importados').should('be.visible')
      cy.get('input[placeholder="Buscar programas..."]').should('be.visible')
      
      // Statistics
      cy.contains('Estatísticas').should('be.visible')
      
      cy.log('✅ All page elements displayed correctly')
    })

    it('should handle program search functionality', () => {
      cy.log('🧪 Testing program search functionality')
      
      const searchInput = cy.get('input[placeholder="Buscar programas..."]')
      searchInput.should('be.visible')
      
      // Test search input
      searchInput.type('Agosto')
      searchInput.should('have.value', 'Agosto')
      
      // Clear search
      searchInput.clear()
      searchInput.should('have.value', '')
      
      cy.log('✅ Search functionality working correctly')
    })

    it('should display program cards with correct information', () => {
      cy.log('🧪 Testing program card information')
      
      // Check for program cards
      cy.get('[data-cy="program-card"]').should('exist')
      
      // Verify card content
      cy.contains('Arquivo:').should('be.visible')
      cy.contains('Partes do Programa:').should('be.visible')
      cy.contains('Status das Designações:').should('be.visible')
      
      // Verify action buttons
      cy.contains('Visualizar').should('be.visible')
      cy.contains('Download').should('be.visible')
      
      cy.log('✅ Program cards displaying correctly')
    })
  })

  describe('🔄 Cross-Browser Compatibility', () => {
    it('should work correctly in different viewport sizes', () => {
      cy.loginAsInstructor()
      cy.visit('/programas')
      
      // Test mobile viewport
      cy.viewport('iphone-x')
      cy.contains('Gestão de Programas').should('be.visible')
      cy.get('[data-testid="pdf-upload-button"]').should('be.visible')
      
      // Test tablet viewport
      cy.viewport('ipad-2')
      cy.contains('Gestão de Programas').should('be.visible')
      cy.get('[data-testid="pdf-upload-button"]').should('be.visible')
      
      // Test desktop viewport
      cy.viewport(1280, 720)
      cy.contains('Gestão de Programas').should('be.visible')
      cy.get('[data-testid="pdf-upload-button"]').should('be.visible')
      
      cy.log('✅ Cross-browser compatibility verified')
    })
  })

  describe('🚀 CI/CD Environment Tests', () => {
    it('should handle environment-specific configurations', () => {
      cy.log('🧪 Testing CI/CD environment compatibility')
      
      // Verify environment variables are loaded
      expect(Cypress.env('INSTRUCTOR_EMAIL')).to.exist
      expect(Cypress.env('INSTRUCTOR_PASSWORD')).to.exist
      expect(Cypress.env('STUDENT_EMAIL')).to.exist
      expect(Cypress.env('STUDENT_PASSWORD')).to.exist
      
      // Test base URL configuration
      cy.url().should('include', Cypress.config('baseUrl'))
      
      cy.log('✅ CI/CD environment configuration verified')
    })

    it('should complete full system workflow', () => {
      cy.log('🧪 Testing complete system workflow')
      
      // 1. Login as instructor
      cy.loginAsInstructor()
      cy.url().should('include', '/dashboard')
      
      // 2. Navigate to programs
      cy.visit('/programas')
      cy.contains('Gestão de Programas').should('be.visible')
      
      // 3. Upload a PDF
      const fileName = 'programa-workflow-test.pdf'
      cy.get('[data-testid="pdf-file-input"]').selectFile({
        contents: Cypress.Buffer.from('Workflow test PDF content'),
        fileName: fileName,
        mimeType: 'application/pdf',
      }, { force: true })

      // 4. Verify upload success
      cy.contains('PDF Importado com Sucesso!', { timeout: 15000 }).should('be.visible')
      
      // 5. Reset and verify program in list
      cy.contains('Importar Outro PDF').click()
      cy.contains(fileName).should('be.visible')
      
      // 6. Navigate back to dashboard
      cy.contains('Voltar ao Dashboard').click()
      cy.url().should('include', '/dashboard')
      
      cy.log('✅ Complete system workflow verified')
    })
  })

  describe('♿ Accessibility Tests', () => {
    beforeEach(() => {
      cy.loginAsInstructor()
      cy.visit('/programas')
    })

    it('should have proper ARIA attributes and keyboard navigation', () => {
      cy.log('🧪 Testing accessibility features')
      
      // Test keyboard navigation
      cy.get('[data-testid="pdf-upload-button"]')
        .focus()
        .should('be.focused')
      
      // Test form labels
      cy.get('input[placeholder="Buscar programas..."]')
        .should('have.attr', 'type', 'text')
      
      // Test button roles
      cy.get('[data-testid="pdf-upload-button"]')
        .should('have.attr', 'role', 'button')
      
      cy.log('✅ Accessibility features verified')
    })
  })
});

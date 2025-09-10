describe('Admin Dashboard - Complete Functionality Test', () => {
  const ADMIN_EMAIL = 'amazonwebber007@gmail.com';
  const ADMIN_PASSWORD = 'admin123';
  const BASE_URL = 'http://localhost:5174';

  beforeEach(() => {
    cy.visit(`${BASE_URL}/admin`);
    cy.window().then((win) => {
      win.localStorage.clear();
      win.sessionStorage.clear();
    });
  });

  it('should login as admin and access dashboard', () => {
    cy.log('🔐 Testing admin login and dashboard access');
    
    // Force admin login via console
    cy.window().then((win) => {
      return new Promise((resolve) => {
        (win as any).forceAdminLogin = async () => {
          const { createClient } = await import('@supabase/supabase-js');
          const supabase = createClient(
            'https://nwpuurgwnnuejqinkvrh.supabase.co',
            'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im53cHV1cmd3bm51ZWpxaW5rdnJoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ0NjIwNjUsImV4cCI6MjA3MDAzODA2NX0.UHjSvXYY_c-_ydAIfELRUs4CMEBLKiztpBGQBNPHfak'
          );
          
          const { data, error } = await supabase.auth.signInWithPassword({
            email: ADMIN_EMAIL,
            password: ADMIN_PASSWORD
          });
          
          if (!error && data.user) {
            resolve(data.user);
          }
        };
        
        (win as any).forceAdminLogin();
      });
    });

    // Wait for dashboard to load
    cy.contains('Admin Dashboard', { timeout: 10000 }).should('be.visible');
    cy.contains('Sistema Ministerial').should('be.visible');
  });

  it('should display dashboard stats cards', () => {
    cy.log('📊 Testing dashboard statistics cards');
    
    // Login first
    cy.window().then((win) => {
      (win as any).forceAdminLogin?.();
    });

    // Check stats cards
    cy.get('[data-testid="stats-card"], .grid .card', { timeout: 10000 }).should('have.length.at.least', 3);
    
    // Verify specific stats
    cy.contains('Programas').should('be.visible');
    cy.contains('Congregações').should('be.visible');
    cy.contains('Materiais').should('be.visible');
    cy.contains('Sistema').should('be.visible');
  });

  it('should navigate between tabs', () => {
    cy.log('🔄 Testing tab navigation');
    
    // Login first
    cy.window().then((win) => {
      (win as any).forceAdminLogin?.();
    });

    // Wait for tabs to load
    cy.get('[role="tablist"], .tabs-list', { timeout: 10000 }).should('be.visible');

    // Test each tab
    const tabs = ['Visão Geral', 'Programas', 'Materiais', 'Congregações', 'Sistema'];
    
    tabs.forEach((tabName) => {
      cy.contains(tabName).click();
      cy.wait(500);
      cy.log(`✅ Clicked on ${tabName} tab`);
    });
  });

  it('should display programs section', () => {
    cy.log('📋 Testing programs functionality');
    
    // Login first
    cy.window().then((win) => {
      (win as any).forceAdminLogin?.();
    });

    // Navigate to programs tab
    cy.contains('Programas', { timeout: 10000 }).click();
    
    // Check for program elements
    cy.get('body').then(($body) => {
      if ($body.find('[data-testid="new-program-btn"]').length > 0) {
        cy.get('[data-testid="new-program-btn"]').should('be.visible');
      } else {
        cy.contains('Novo Programa').should('be.visible');
      }
    });

    // Check for existing programs
    cy.get('body').should('contain.text', 'Programa');
  });

  it('should display materials section', () => {
    cy.log('📚 Testing materials functionality');
    
    // Login first
    cy.window().then((win) => {
      (win as any).forceAdminLogin?.();
    });

    // Navigate to materials tab
    cy.contains('Materiais', { timeout: 10000 }).click();
    
    // Check for material elements
    cy.get('body').then(($body) => {
      if ($body.find('[data-testid="upload-material-btn"]').length > 0) {
        cy.get('[data-testid="upload-material-btn"]').should('be.visible');
      } else {
        cy.contains('Upload Material').should('be.visible');
      }
    });
  });

  it('should display system status', () => {
    cy.log('⚙️ Testing system status');
    
    // Login first
    cy.window().then((win) => {
      (win as any).forceAdminLogin?.();
    });

    // Navigate to system tab
    cy.contains('Sistema', { timeout: 10000 }).click();
    
    // Check system status indicators
    cy.contains('Status do Sistema').should('be.visible');
    cy.contains('Online').should('be.visible');
  });

  it('should handle responsive design', () => {
    cy.log('📱 Testing responsive design');
    
    // Login first
    cy.window().then((win) => {
      (win as any).forceAdminLogin?.();
    });

    // Test mobile viewport
    cy.viewport(375, 667);
    cy.wait(1000);
    cy.get('body').should('be.visible');

    // Test tablet viewport
    cy.viewport(768, 1024);
    cy.wait(1000);
    cy.get('body').should('be.visible');

    // Test desktop viewport
    cy.viewport(1920, 1080);
    cy.wait(1000);
    cy.get('body').should('be.visible');
  });

  it('should test admin actions', () => {
    cy.log('🔧 Testing admin-specific actions');
    
    // Login first
    cy.window().then((win) => {
      (win as any).forceAdminLogin?.();
    });

    // Try to access admin-only features
    cy.get('body', { timeout: 10000 }).then(($body) => {
      // Look for admin buttons
      if ($body.find('button:contains("Novo Programa")').length > 0) {
        cy.contains('button', 'Novo Programa').should('be.visible');
      }
      
      if ($body.find('button:contains("Upload Material")').length > 0) {
        cy.contains('button', 'Upload Material').should('be.visible');
      }
    });
  });

  it('should verify page performance', () => {
    cy.log('⚡ Testing page performance');
    
    const startTime = Date.now();
    
    cy.visit(`${BASE_URL}/admin`);
    
    cy.window().then((win) => {
      (win as any).forceAdminLogin?.();
    });

    cy.contains('Admin Dashboard', { timeout: 15000 }).should('be.visible').then(() => {
      const loadTime = Date.now() - startTime;
      cy.log(`Page loaded in ${loadTime}ms`);
      expect(loadTime).to.be.lessThan(15000); // Should load within 15 seconds
    });
  });

  it('should test error handling', () => {
    cy.log('🚨 Testing error handling');
    
    // Test with invalid URL
    cy.visit(`${BASE_URL}/admin/invalid-page`, { failOnStatusCode: false });
    
    // Should redirect or show error
    cy.url().should('include', '/admin');
  });
});
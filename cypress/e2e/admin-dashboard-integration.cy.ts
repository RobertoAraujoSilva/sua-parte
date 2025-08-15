describe('Admin Dashboard - Integração Completa', () => {
  beforeEach(() => {
    // Verificar se o backend está rodando
    cy.request('http://localhost:3001/api/status').then((response) => {
      expect(response.status).to.eq(200);
      expect(response.body.status).to.eq('online');
    });
  });

  it('deve carregar o dashboard e mostrar informações do sistema', () => {
    // Fazer login como admin
    cy.visit('/auth');
    cy.get('[data-testid="email-input"]').type('amazonwebber007@gmail.com');
    cy.get('[data-testid="password-input"]').type('admin123');
    cy.get('[data-testid="login-button"]').click();

    // Aguardar redirecionamento para o dashboard
    cy.url().should('include', '/admin');
    
    // Verificar se o dashboard carregou
    cy.contains('Dashboard Administrativo').should('be.visible');
    cy.contains('Sistema Ativo').should('be.visible');
    
    // Verificar se as abas estão presentes
    cy.contains('Visão Geral').should('be.visible');
    cy.contains('Downloads').should('be.visible');
    cy.contains('Materiais').should('be.visible');
    cy.contains('Publicação').should('be.visible');
    cy.contains('Monitoramento').should('be.visible');
  });

  it('deve testar a conexão com o backend', () => {
    cy.login('amazonwebber007@gmail.com', 'admin123');
    cy.visit('/admin');
    
    // Clicar no botão de teste do backend
    cy.contains('🗄️ Test Backend').click();
    
    // Verificar se o teste foi bem-sucedido
    cy.on('window:alert', (str) => {
      expect(str).to.include('Backend connection test successful');
    });
  });

  it('deve verificar atualizações através do backend', () => {
    cy.login('amazonwebber007@gmail.com', 'admin123');
    cy.visit('/admin');
    
    // Ir para a aba Downloads
    cy.contains('Downloads').click();
    
    // Clicar em "Verificar Novas Versões"
    cy.contains('Verificar Novas Versões').click();
    
    // Aguardar o carregamento
    cy.get('[data-testid="loading-spinner"]', { timeout: 10000 }).should('not.exist');
    
    // Verificar se a verificação foi concluída
    cy.contains('Verificação concluída').should('be.visible');
  });

  it('deve mostrar materiais baixados na aba Materiais', () => {
    cy.login('amazonwebber007@gmail.com', 'admin123');
    cy.visit('/admin');
    
    // Ir para a aba Materiais
    cy.contains('Materiais').click();
    
    // Verificar se a aba carregou
    cy.contains('Materiais Disponíveis').should('be.visible');
    
    // Se houver materiais, verificar se estão sendo exibidos
    cy.get('body').then(($body) => {
      if ($body.find('.materiais-lista').length > 0) {
        cy.get('.materiais-lista').should('contain', 'mwb_');
      } else {
        cy.contains('Nenhum material encontrado').should('be.visible');
        cy.contains('Execute a verificação de atualizações para baixar materiais').should('be.visible');
      }
    });
  });

  it('deve testar o botão Force Profile + Backend', () => {
    cy.login('amazonwebber007@gmail.com', 'admin123');
    cy.visit('/admin');
    
    // Clicar no botão Force Profile + Backend
    cy.contains('👤 Force Profile + Backend').click();
    
    // Verificar se o teste foi bem-sucedido
    cy.on('window:alert', (str) => {
      expect(str).to.include('Backend test completed');
    });
  });

  it('deve verificar o status do sistema na aba Monitoramento', () => {
    cy.login('amazonwebber007@gmail.com', 'admin123');
    cy.visit('/admin');
    
    // Ir para a aba Monitoramento
    cy.contains('Monitoramento').click();
    
    // Verificar se a aba carregou
    cy.contains('Monitoramento do Sistema').should('be.visible');
    
    // Verificar status do banco
    cy.contains('Status do Banco').should('be.visible');
    cy.contains('Online').should('be.visible');
    
    // Verificar última verificação
    cy.contains('Última Verificação').should('be.visible');
  });

  it('deve verificar se o debug info está funcionando', () => {
    cy.login('amazonwebber007@gmail.com', 'admin123');
    cy.visit('/admin');
    
    // Verificar se o painel de debug está visível (apenas em desenvolvimento)
    if (Cypress.env('NODE_ENV') === 'development') {
      cy.contains('🐛 Debug Info (Development Only)').should('be.visible');
      
      // Verificar se há informações de debug
      cy.get('pre').should('contain', 'user');
      cy.get('pre').should('contain', 'profile');
      cy.get('pre').should('contain', 'isAdmin');
    }
  });

  it('deve testar a funcionalidade completa de download', () => {
    cy.login('amazonwebber007@gmail.com', 'admin123');
    cy.visit('/admin');
    
    // Ir para a aba Downloads
    cy.contains('Downloads').click();
    
    // Verificar se as URLs estão configuradas
    cy.contains('https://www.jw.org/pt/biblioteca/jw-apostila-do-mes/').should('be.visible');
    cy.contains('https://www.jw.org/en/library/jw-meeting-workbook/').should('be.visible');
    
    // Clicar em "Verificar Novas Versões"
    cy.contains('Verificar Novas Versões').click();
    
    // Aguardar o processo de download
    cy.get('[data-testid="loading-spinner"]', { timeout: 30000 }).should('not.exist');
    
    // Verificar se o processo foi concluído
    cy.contains('Verificação concluída').should('be.visible');
    
    // Ir para a aba Materiais para verificar se os materiais foram baixados
    cy.contains('Materiais').click();
    
    // Aguardar carregamento
    cy.wait(2000);
    
    // Verificar se há materiais ou mensagem apropriada
    cy.get('body').then(($body) => {
      if ($body.find('.materiais-lista').length > 0) {
        cy.get('.materiais-lista').should('contain', 'mwb_');
      } else {
        cy.contains('Nenhum material encontrado').should('be.visible');
      }
    });
  });
});

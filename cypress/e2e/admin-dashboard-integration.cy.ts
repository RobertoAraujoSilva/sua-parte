describe('Admin Dashboard - Integração Completa', () => {
  beforeEach(() => {
    // Fazer login como admin (instrutor) antes de cada teste
    cy.loginWithCredentials(Cypress.env('INSTRUCTOR_EMAIL'), Cypress.env('INSTRUCTOR_PASSWORD'));
    cy.url().should('include', '/admin');
    cy.contains('Dashboard do Administrador Geral').should('be.visible');
  });

  it('deve carregar o dashboard e mostrar as abas corretas', () => {
    // Verificar se as abas estão presentes
    cy.contains('Visão Geral').should('be.visible');
    cy.contains('Programação').should('be.visible');
    cy.contains('Usuários').should('be.visible');
    cy.contains('Congregações').should('be.visible');
    cy.contains('Sistema').should('be.visible');
  });

  it('deve navegar para a aba de Programação e ver o ProgramManager', () => {
    cy.contains('Programação').click();
    cy.contains('Gerenciar Programação').should('be.visible');
    // Verificar se há cartões de programa ou a mensagem de "Nenhuma programação encontrada"
    cy.get('body').then(($body) => {
      if ($body.find('div.card').length > 1) { // >1 para ignorar o card de "Nova Congregação"
        cy.contains('Semana').should('be.visible');
      } else {
        cy.contains('Nenhuma programação encontrada').should('be.visible');
      }
    });
  });

  it('deve navegar para a aba de Congregações e criar uma nova congregação', () => {
    cy.contains('Congregações').click();
    cy.contains('Nova Congregação').should('be.visible');

    const newCongregationName = `Congregação de Teste ${Date.now()}`;
    cy.get('input[placeholder="Nome da congregação"]').type(newCongregationName);
    cy.contains('button', 'Criar').click();

    // Verificar se a nova congregação aparece na lista
    cy.contains(newCongregationName).should('be.visible');
  });

  it('deve clicar no botão de Importar Planilha e navegar para a página correta', () => {
    cy.contains('Visão Geral').click();
    cy.contains('Importar Planilha').click();
    cy.url().should('include', '/estudantes?tab=import');
  });

  it('deve sincronizar os materiais do JW.org e atualizar a lista na aba Programação', () => {
    cy.contains('Visão Geral').click();
    
    // Clicar no botão para sincronizar materiais
    cy.contains('Sincronizar Materiais com JW.org').click();

    // O hook exibe um alerta ao concluir, então vamos verificar isso
    cy.on('window:alert', (str) => {
      expect(str).to.equal('Sincronização de materiais concluída!');
    });

    // Aguardar um pouco para a UI atualizar se necessário
    cy.wait(1000);

    // Navegar para a aba de programação para verificar se os materiais foram carregados
    cy.contains('Programação').click();
    cy.contains('Gerenciar Programação').should('be.visible');

    // Clicar em "Atualizar Materiais" para garantir que a lista seja recarregada
    cy.contains('Atualizar Materiais').click();
    
    // Verificar se a lista de materiais agora contém itens
    cy.get('body').then(($body) => {
        cy.contains('Semana').should('be.visible');
    });
  });
});

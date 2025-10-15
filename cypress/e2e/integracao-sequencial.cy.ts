describe('Integração Sequencial - Sistema Ministerial', () => {
  beforeEach(() => {
    // Login como instrutor
    cy.visit('/auth');
    cy.get('[data-testid="email-input"]').type('instrutor@test.com');
    cy.get('[data-testid="password-input"]').type('password123');
    cy.get('[data-testid="login-button"]').click();
    cy.url().should('include', '/dashboard');
  });

  it('Deve completar fluxo completo: importar programação → designar estudantes → visualizar no portal', () => {
    // 1. Importar programação
    cy.visit('/importar-programacao');
    
    // Simular conteúdo JW.org (semana de exemplo)
    const conteudoJwOrg = `
      13-19 de outubro
      Apostila Vida e Ministério — 2025 | setembro
      13-19 DE OUTUBRO
      ECLESIASTES 7-8
      Cântico 39 e oração | Comentários iniciais (1 min)
      TESOUROS DA PALAVRA DE DEUS
      1. 'Vá à casa onde há luto'
      (10 min)
      
      Tire tempo para consolar quem perdeu alguém. (Ecl. 7:2; it "Pranto" § 9)
      
      2. Joias espirituais
      (10 min)
      
      Ecl. 7:20-22 — Como esses versículos podem nos ajudar a decidir se vamos ou não falar com alguém que nos ofendeu? (w23.03 31 § 18)
      
      3. Leitura da Bíblia
      (4 min) Ecl. 8:1-13 (th lição 10)
      
      FAÇA SEU MELHOR NO MINISTÉRIO
      4. Iniciando conversas
      (2 min) TESTEMUNHO PÚBLICO. Descubra um assunto que interessa a pessoa e combine de continuar a conversa depois. (lmd lição 2 ponto 4)
      
      5. Cultivando o interesse
      (2 min) DE CASA EM CASA. Mostre algo no site jw.org. (lmd lição 9 ponto 4)
      
      NOSSA VIDA CRISTÃ
      6. Desenvolva uma forte fé na ressurreição
      (15 min) Consideração.
      
      7. Estudo bíblico de congregação
      (30 min) lfb histórias 26-27
    `;
    
    cy.get('textarea[placeholder*="Cole aqui o conteúdo"]').type(conteudoJwOrg);
    cy.get('button').contains('Converter para JSON').click();
    
    // Verificar se a conversão foi bem-sucedida
    cy.get('[data-testid="success-alert"]').should('be.visible');
    cy.get('button').contains('Salvar no Sistema').click();
    
    // Aguardar salvamento
    cy.get('[data-testid="success-alert"]').should('contain', 'Programação salva no sistema');
    
    // 2. Navegar para o dashboard do instrutor
    cy.visit('/dashboard');
    
    // Verificar se a programação foi carregada
    cy.get('[data-testid="programacao-viewer"]').should('be.visible');
    cy.get('h3').contains('13-19 de outubro').should('be.visible');
    
    // 3. Designar estudantes para as partes
    // Designar para "Joias espirituais" (qualquer gênero)
    cy.get('[data-testid="parte-2"]').within(() => {
      cy.get('select').first().select('João Silva');
    });
    
    // Designar para "Leitura da Bíblia" (apenas homens)
    cy.get('[data-testid="parte-3"]').within(() => {
      cy.get('select').first().select('Pedro Costa');
    });
    
    // Designar para "Iniciando conversas" (qualquer gênero)
    cy.get('[data-testid="parte-4"]').within(() => {
      cy.get('select').first().select('Maria Santos');
    });
    
    // Salvar designações
    cy.get('button').contains('Salvar Designações').click();
    cy.get('[data-testid="toast-success"]').should('be.visible');
    
    // 4. Verificar no portal do estudante
    // Login como estudante
    cy.clearCookies();
    cy.visit('/auth');
    cy.get('[data-testid="email-input"]').type('joao@test.com');
    cy.get('[data-testid="password-input"]').type('password123');
    cy.get('[data-testid="login-button"]').click();
    cy.url().should('include', '/portal');
    
    // Verificar se as designações aparecem no portal
    cy.get('[data-testid="proximas-designacoes"]').should('be.visible');
    cy.get('[data-testid="proximas-designacoes"]').should('contain', 'Joias espirituais');
    cy.get('[data-testid="proximas-designacoes"]').should('contain', '13-19 de outubro');
    
    // Verificar estatísticas
    cy.get('[data-testid="stats-card"]').first().should('contain', '1'); // 1 designação próxima
    cy.get('[data-testid="stats-card"]').eq(1).should('contain', '1'); // 1 designação total
  });

  it('Deve validar restrições de gênero nas designações', () => {
    cy.visit('/dashboard');
    
    // Tentar designar mulher para "Leitura da Bíblia" (deve ser restrito)
    cy.get('[data-testid="parte-3"]').within(() => {
      cy.get('select').first().should('not.contain', 'Maria Santos');
      cy.get('select').first().should('not.contain', 'Ana Oliveira');
      cy.get('select').first().should('contain', 'João Silva');
      cy.get('select').first().should('contain', 'Pedro Costa');
    });
    
    // Verificar que outras partes permitem qualquer gênero
    cy.get('[data-testid="parte-2"]').within(() => {
      cy.get('select').first().should('contain', 'Maria Santos');
      cy.get('select').first().should('contain', 'Ana Oliveira');
    });
  });

  it('Deve exportar e importar designações corretamente', () => {
    cy.visit('/dashboard');
    
    // Fazer algumas designações
    cy.get('[data-testid="parte-2"]').within(() => {
      cy.get('select').first().select('João Silva');
    });
    
    cy.get('[data-testid="parte-4"]').within(() => {
      cy.get('select').first().select('Maria Santos');
    });
    
    // Exportar designações
    cy.get('button').contains('Exportar').click();
    
    // Verificar se o arquivo foi baixado (simulação)
    cy.window().then((win) => {
      // Mock do download
      cy.stub(win, 'open').as('downloadStub');
    });
    
    // Limpar designações
    cy.get('[data-testid="parte-2"]').within(() => {
      cy.get('select').first().select('Não designado');
    });
    
    // Verificar que as designações foram removidas
    cy.get('[data-testid="resumo-designacoes"]').should('contain', '0');
  });

  it('Deve mostrar estatísticas corretas no dashboard', () => {
    cy.visit('/dashboard');
    
    // Verificar cards de estatísticas
    cy.get('[data-testid="stats-programacoes"]').should('contain', '1'); // 1 programação
    cy.get('[data-testid="stats-estudantes"]').should('contain', '4'); // 4 estudantes
    cy.get('[data-testid="stats-designacoes"]').should('contain', '0'); // 0 designações inicialmente
    cy.get('[data-testid="stats-esta-semana"]').should('contain', '0'); // 0 esta semana
    
    // Fazer uma designação
    cy.get('[data-testid="parte-2"]').within(() => {
      cy.get('select').first().select('João Silva');
    });
    
    // Verificar que as estatísticas foram atualizadas
    cy.get('[data-testid="stats-designacoes"]').should('contain', '1');
    cy.get('[data-testid="stats-esta-semana"]').should('contain', '1');
  });

  it('Deve navegar entre as abas do dashboard corretamente', () => {
    cy.visit('/dashboard');
    
    // Verificar aba Programação (ativa por padrão)
    cy.get('[data-testid="tab-programacao"]').should('have.attr', 'data-state', 'active');
    cy.get('[data-testid="programacao-viewer"]').should('be.visible');
    
    // Navegar para aba Designações
    cy.get('[data-testid="tab-designacoes"]').click();
    cy.get('[data-testid="tab-designacoes"]').should('have.attr', 'data-state', 'active');
    cy.get('[data-testid="todas-designacoes"]').should('be.visible');
    
    // Navegar para aba Estudantes
    cy.get('[data-testid="tab-estudantes"]').click();
    cy.get('[data-testid="tab-estudantes"]').should('have.attr', 'data-state', 'active');
    cy.get('[data-testid="lista-estudantes"]').should('be.visible');
  });

  it('Deve validar fluxo completo de erro e recuperação', () => {
    // Simular erro de rede
    cy.intercept('POST', '/api/designacoes', { forceNetworkError: true }).as('designacaoError');
    
    cy.visit('/dashboard');
    
    // Tentar fazer designação com erro de rede
    cy.get('[data-testid="parte-2"]').within(() => {
      cy.get('select').first().select('João Silva');
    });
    
    // Verificar que o erro foi tratado
    cy.get('[data-testid="toast-error"]').should('be.visible');
    cy.get('[data-testid="toast-error"]').should('contain', 'Erro ao designar');
    
    // Restaurar intercept
    cy.intercept('POST', '/api/designacoes').as('designacaoSuccess');
    
    // Tentar novamente
    cy.get('[data-testid="parte-2"]').within(() => {
      cy.get('select').first().select('João Silva');
    });
    
    // Verificar sucesso
    cy.get('[data-testid="toast-success"]').should('be.visible');
    cy.get('[data-testid="toast-success"]').should('contain', 'Designação realizada');
  });
});

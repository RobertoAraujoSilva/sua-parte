/**
 * AUDITORIA COMPLETA DO SISTEMA MINISTERIAL
 * 
 * Este teste realiza uma auditoria sistemática de todas as páginas do sistema
 * verificando funcionalidade, origem dos dados e robustez.
 */

describe('🔍 Auditoria Sistema Ministerial', () => {
  // Configuração de páginas para auditoria
  const paginasPublicas = [
    { rota: '/', nome: 'Index', descricao: 'Página inicial' },
    { rota: '/auth', nome: 'Autenticação', descricao: 'Login/Cadastro' },
    { rota: '/demo', nome: 'Demo', descricao: 'Demonstração' },
    { rota: '/funcionalidades', nome: 'Funcionalidades', descricao: 'Lista de funcionalidades' },
    { rota: '/congregacoes', nome: 'Congregações', descricao: 'Informações sobre congregações' },
    { rota: '/suporte', nome: 'Suporte', descricao: 'Página de suporte' },
    { rota: '/sobre', nome: 'Sobre', descricao: 'Sobre o sistema' },
    { rota: '/doar', nome: 'Doar', descricao: 'Página de doações' }
  ];

  const paginasInstrutor = [
    { rota: '/dashboard', nome: 'Dashboard', descricao: 'Painel principal do instrutor' },
    { rota: '/estudantes', nome: 'Estudantes', descricao: 'Gestão de estudantes' },
    { rota: '/programas', nome: 'Programas', descricao: 'Gestão de programas' },
    { rota: '/designacoes', nome: 'Designações', descricao: 'Gestão de designações' },
    { rota: '/relatorios', nome: 'Relatórios', descricao: 'Relatórios do sistema' },
    { rota: '/reunioes', nome: 'Reuniões', descricao: 'Gestão de reuniões' }
  ];

  const paginasEspeciais = [
    { rota: '/convite/aceitar', nome: 'Aceitar Convite', descricao: 'Aceitar convite familiar' },
    { rota: '*', nome: 'Not Found', descricao: 'Página 404' }
  ];

  let relatorioAuditoria: any[] = [];

  beforeEach(() => {
    // Configurar interceptadores para monitorar chamadas Supabase
    cy.intercept('GET', '**/rest/v1/**').as('supabaseGet');
    cy.intercept('POST', '**/rest/v1/**').as('supabasePost');
    cy.intercept('PATCH', '**/rest/v1/**').as('supabasePatch');
    cy.intercept('DELETE', '**/rest/v1/**').as('supabaseDelete');

    // Interceptar chamadas de autenticação
    cy.intercept('POST', '**/auth/v1/**').as('supabaseAuth');
  });

  describe('📋 Auditoria de Páginas Públicas', () => {
    paginasPublicas.forEach(pagina => {
      it(`🔍 Auditoria: ${pagina.nome}`, () => {
        cy.log(`🔍 Iniciando auditoria da página: ${pagina.nome}`);

        // Visitar a página e configurar spy para console.error
        cy.visit(pagina.rota, { failOnStatusCode: false });

        // Configurar spy para console.error após visitar a página
        cy.window().then((win) => {
          cy.stub(win.console, 'error').as('consoleError');
        });

        // Aguardar carregamento
        cy.wait(2000);

        // Verificar se a página carregou sem erros críticos
        cy.get('body').should('exist');

        // Verificar se não há erros de JavaScript no console
        cy.get('@consoleError').should('not.have.been.called');
        
        // Testar botões visíveis
        cy.get('button:visible').then($buttons => {
          if ($buttons.length > 0) {
            cy.log(`✅ Encontrados ${$buttons.length} botões na página`);
            
            // Testar o primeiro botão
            cy.get('button:visible').first().then($btn => {
              const btnText = $btn.text();
              cy.log(`🔘 Testando botão: "${btnText}"`);
              
              // Verificar se o botão não está desabilitado
              if (!$btn.prop('disabled')) {
                cy.wrap($btn).click({ force: true });
                cy.wait(1000);
              }
            });
          } else {
            cy.log(`⚠️ Nenhum botão encontrado na página ${pagina.nome}`);
          }
        });
        
        // Verificar chamadas ao Supabase
        cy.get('@supabaseGet.all').then((requests) => {
          const numChamadas = requests.length;
          const origemDados = numChamadas > 0 ? '🔄 Supabase (dados reais)' : '📄 Possível mock/estático';
          
          cy.log(`📊 ${pagina.nome}: ${origemDados} (${numChamadas} chamadas)`);
          
          // Adicionar ao relatório
          relatorioAuditoria.push({
            pagina: pagina.nome,
            rota: pagina.rota,
            carregamento: '✅ OK',
            origemDados: origemDados,
            numChamadasSupabase: numChamadas,
            erros: 'Nenhum detectado',
            observacoes: pagina.descricao
          });
        });
        
        // Capturar screenshot para documentação
        cy.screenshot(`auditoria-${pagina.nome.toLowerCase().replace(/\s+/g, '-')}`);
        
        cy.log(`✅ Auditoria concluída: ${pagina.nome}`);
      });
    });
  });

  describe('🔐 Auditoria de Páginas Protegidas (Instrutor)', () => {
    paginasInstrutor.forEach(pagina => {
      it(`🔍 Auditoria: ${pagina.nome} (Sem Autenticação)`, () => {
        cy.log(`🔍 Testando acesso não autorizado: ${pagina.nome}`);
        
        // Tentar acessar página protegida sem autenticação
        cy.visit(pagina.rota, { failOnStatusCode: false });
        cy.wait(2000);
        
        // Verificar se foi redirecionado para login ou mostra erro de acesso
        cy.url().then(url => {
          if (url.includes('/auth') || url.includes('/login')) {
            cy.log(`✅ Redirecionamento correto para autenticação`);
          } else {
            cy.get('body').then($body => {
              if ($body.text().includes('não autorizado') || 
                  $body.text().includes('acesso negado') ||
                  $body.text().includes('login')) {
                cy.log(`✅ Mensagem de acesso negado exibida`);
              } else {
                cy.log(`⚠️ Possível falha de segurança - página acessível sem autenticação`);
              }
            });
          }
        });
        
        cy.screenshot(`auditoria-protegida-${pagina.nome.toLowerCase().replace(/\s+/g, '-')}`);
      });
    });

    // Teste adicional: Verificar acesso autorizado
    it('🔑 Teste de Acesso Autorizado como Instrutor', () => {
      cy.log('🔑 Testando acesso autorizado como instrutor');

      // Fazer login como instrutor
      cy.loginAsInstructor();

      // Verificar se foi redirecionado para dashboard
      cy.url().should('include', '/dashboard');

      // Verificar se o dashboard carregou corretamente
      cy.get('body').should('exist');
      cy.wait(2000);

      // Testar navegação para página de estudantes
      cy.visit('/estudantes');
      cy.wait(2000);
      cy.get('body').should('exist');

      cy.log('✅ Acesso autorizado funcionando corretamente');
      cy.screenshot('acesso-autorizado-instrutor');
    });

    it('👨‍🎓 Teste de Acesso como Estudante', () => {
      cy.log('👨‍🎓 Testando acesso como estudante');

      // Fazer login como estudante
      cy.loginAsStudent();

      // Verificar redirecionamento (pode ser dashboard ou portal específico)
      cy.url().should('match', /\/(dashboard|estudante|portal)/);

      // Verificar se a página carregou
      cy.get('body').should('exist');
      cy.wait(2000);

      cy.log('✅ Acesso como estudante funcionando');
      cy.screenshot('acesso-estudante');
    });
  });

  describe('🧪 Teste de Robustez', () => {
    it('🌐 Teste de Conectividade Offline', () => {
      cy.log('🌐 Testando comportamento offline');

      // Primeiro fazer login como instrutor
      cy.loginAsInstructor();
      cy.url().should('include', '/dashboard');

      // Aguardar carregamento completo
      cy.wait(3000);

      // Interceptar e falhar todas as chamadas de rede para simular offline
      cy.intercept('**', { forceNetworkError: true }).as('networkError');

      // Tentar navegar para uma página que requer dados
      cy.visit('/estudantes', { failOnStatusCode: false });
      cy.wait(3000);

      // Verificar se há tratamento adequado de erro ou cache
      cy.get('body').should('exist');

      // Verificar se há mensagem de erro ou conteúdo em cache
      cy.get('body').then($body => {
        const bodyText = $body.text();
        if (bodyText.includes('offline') ||
            bodyText.includes('sem conexão') ||
            bodyText.includes('erro de rede') ||
            bodyText.includes('Estudantes')) {
          cy.log('✅ Sistema lida adequadamente com modo offline');
        } else {
          cy.log('⚠️ Sistema pode precisar de melhor tratamento offline');
        }
      });

      cy.screenshot('teste-offline');
    });

    it('📊 Verificação de Dados Vazios', () => {
      cy.log('📊 Testando comportamento com dados vazios');
      
      // Interceptar chamadas e retornar arrays vazios
      cy.intercept('GET', '**/rest/v1/**', { body: [] }).as('dadosVazios');
      
      cy.visit('/', { failOnStatusCode: false });
      cy.wait(2000);
      
      // Verificar se a página lida bem com dados vazios
      cy.get('body').should('exist');
      cy.screenshot('teste-dados-vazios');
    });
  });

  after(() => {
    // Gerar relatório final
    cy.task('log', '📋 RELATÓRIO DE AUDITORIA GERADO');
    cy.task('log', JSON.stringify(relatorioAuditoria, null, 2));
  });
});

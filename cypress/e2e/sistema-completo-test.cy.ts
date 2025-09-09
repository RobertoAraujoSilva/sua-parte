/// <reference types="cypress" />

describe('🧪 Sistema Ministerial Completo - Teste de Todas as Funcionalidades', () => {
  beforeEach(() => {
    // Limpar cookies e localStorage antes de cada teste
    cy.clearCookies()
    cy.clearLocalStorage()
  })

  describe('🏠 Dashboard Admin - Controle Global', () => {
    it('✅ Deve fazer login como admin e acessar dashboard completo', () => {
      cy.visit('/auth')
      
      // Login como admin
      cy.get('[data-testid="email-input"]').type('amazonwebber007@gmail.com')
      cy.get('[data-testid="password-input"]').type('admin123')
      cy.get('[data-testid="login-button"]').click()
      
      // Verificar redirecionamento para dashboard admin
      cy.url().should('include', '/admin')
      
      // Verificar título do dashboard
      cy.contains('Dashboard Administrativo').should('be.visible')
      cy.contains('Sistema Ministerial Global - Gestão e Monitoramento').should('be.visible')
      
      // Verificar estatísticas globais
      cy.contains('Total de Estudantes').should('be.visible')
      cy.contains('35').should('be.visible') // Total de estudantes
      cy.contains('Programas Ativos').should('be.visible')
      cy.contains('Designações').should('be.visible')
      cy.contains('Congregações').should('be.visible')
      
      // Verificar ações rápidas
      cy.contains('Materiais JW.org').should('be.visible')
      cy.contains('Configuração S-38').should('be.visible')
      
      // Verificar todas as abas
      cy.contains('Visão Geral').should('be.visible')
      cy.contains('Usuários').should('be.visible')
      cy.contains('Congregações').should('be.visible')
      cy.contains('Sistema').should('be.visible')
      cy.contains('Monitoramento').should('be.visible')
    })

    it('✅ Deve navegar por todas as abas do dashboard admin', () => {
      // Login como admin
      cy.loginAsAdmin()
      cy.visit('/admin')
      
      // Testar aba Visão Geral
      cy.contains('Visão Geral').click()
      cy.contains('Dashboard Administrativo').should('be.visible')
      
      // Testar aba Usuários
      cy.contains('Usuários').click()
      cy.contains('Gestão de Usuários').should('be.visible')
      
      // Testar aba Congregações
      cy.contains('Congregações').click()
      cy.contains('Gestão de Congregações').should('be.visible')
      
      // Testar aba Sistema
      cy.contains('Sistema').click()
      cy.contains('Configurações do Sistema').should('be.visible')
      
      // Testar aba Monitoramento
      cy.contains('Monitoramento').click()
      cy.contains('Monitoramento do Sistema').should('be.visible')
    })
  })

  describe('👨‍🏫 Dashboard Instrutor - Gestão Local', () => {
    it('✅ Deve fazer login como instrutor da congregação "Exemplar"', () => {
      cy.visit('/auth')
      
      // Login como instrutor
      cy.get('[data-testid="email-input"]').type('test@example.com')
      cy.get('[data-testid="password-input"]').type('senha123')
      cy.get('[data-testid="login-button"]').click()
      
      // Verificar redirecionamento para dashboard instrutor
      cy.url().should('include', '/dashboard')
      
      // Verificar título do dashboard
      cy.contains('Dashboard do Instrutor').should('be.visible')
      cy.contains('Exemplar - Gestão Local').should('be.visible')
      
      // Verificar estatísticas locais
      cy.contains('Estudantes').should('be.visible')
      cy.contains('35').should('be.visible') // Estudantes da congregação
      cy.contains('Programas').should('be.visible')
      cy.contains('Designações').should('be.visible')
      
      // Verificar ações rápidas
      cy.contains('Designações da Semana').should('be.visible')
      cy.contains('Materiais Disponíveis').should('be.visible')
    })

    it('✅ Deve fazer login como instrutor da congregação "Compensa"', () => {
      cy.visit('/auth')
      
      // Login como instrutor da congregação Compensa
      cy.get('[data-testid="email-input"]').type('ellen.barauna@gmail.com')
      cy.get('[data-testid="password-input"]').type('senha123')
      cy.get('[data-testid="login-button"]').click()
      
      // Verificar redirecionamento para dashboard instrutor
      cy.url().should('include', '/dashboard')
      
      // Verificar título do dashboard
      cy.contains('Dashboard do Instrutor').should('be.visible')
      cy.contains('Compensa - Gestão Local').should('be.visible')
    })

    it('✅ Deve navegar por todas as abas do dashboard instrutor', () => {
      // Login como instrutor
      cy.loginAsInstructor()
      cy.visit('/dashboard')
      
      // Testar aba Visão Geral
      cy.contains('Visão Geral').click()
      cy.contains('Bem-vindo').should('be.visible')
      
      // Testar aba Estudantes
      cy.contains('Estudantes').click()
      cy.contains('Gestão de Estudantes').should('be.visible')
      
      // Testar aba Programas
      cy.contains('Programas').click()
      cy.contains('Programas Disponíveis').should('be.visible')
      
      // Testar aba Designações
      cy.contains('Designações').click()
      cy.contains('Sistema de Designações').should('be.visible')
    })
  })

  describe('👨‍🎓 Portal do Estudante - Acesso Individual', () => {
    it('✅ Deve fazer login como estudante Mauricio (19 anos)', () => {
      cy.visit('/auth')
      
      // Login como estudante
      cy.get('[data-testid="email-input"]').type('frankwebber33@hotmail.com')
      cy.get('[data-testid="password-input"]').type('senha123')
      cy.get('[data-testid="login-button"]').click()
      
      // Verificar redirecionamento para portal do estudante
      cy.url().should('include', '/estudante')
      
      // Verificar título do portal
      cy.contains('Meu Dashboard').should('be.visible')
      cy.contains('Mauricio Williams Ferreira de Lima').should('be.visible')
      
      // Verificar estatísticas individuais
      cy.contains('Minhas Designações').should('be.visible')
      cy.contains('Status').should('be.visible')
      
      // Verificar ações rápidas
      cy.contains('Próximas Designações').should('be.visible')
      cy.contains('Materiais de Preparo').should('be.visible')
    })

    it('✅ Deve fazer login como estudante Franklin (13 anos)', () => {
      cy.visit('/auth')
      
      // Login como estudante
      cy.get('[data-testid="email-input"]').type('franklinmarceloferreiradelima@gmail.com')
      cy.get('[data-testid="password-input"]').type('senha123')
      cy.get('[data-testid="login-button"]').click()
      
      // Verificar redirecionamento para portal do estudante
      cy.url().should('include', '/estudante')
      
      // Verificar título do portal
      cy.contains('Meu Dashboard').should('be.visible')
      cy.contains('Franklin Marcelo Ferreira de Lima').should('be.visible')
      
      // Verificar que é estudante não batizado
      cy.contains('publicador_nao_batizado').should('be.visible')
    })

    it('✅ Deve navegar por todas as abas do portal do estudante', () => {
      // Login como estudante
      cy.loginAsStudent()
      cy.visit('/estudante')
      
      // Testar aba Visão Geral
      cy.contains('Visão Geral').click()
      cy.contains('Resumo da Semana').should('be.visible')
      
      // Testar aba Minhas Designações
      cy.contains('Minhas Designações').click()
      cy.contains('Visualize e confirme suas participações').should('be.visible')
      
      // Testar aba Materiais
      cy.contains('Materiais').click()
      cy.contains('Materiais de Preparo').should('be.visible')
    })
  })

  describe('🔄 Sistema de Navegação Unificado', () => {
    it('✅ Deve ter navegação adaptativa baseada no role', () => {
      // Testar navegação como admin
      cy.loginAsAdmin()
      cy.visit('/admin')
      cy.get('[data-testid="navigation-menu"]').should('contain', 'Admin')
      
      // Testar navegação como instrutor
      cy.loginAsInstructor()
      cy.visit('/dashboard')
      cy.get('[data-testid="navigation-menu"]').should('contain', 'Instrutor')
      
      // Testar navegação como estudante
      cy.loginAsStudent()
      cy.visit('/estudante')
      cy.get('[data-testid="navigation-menu"]').should('contain', 'Estudante')
    })

    it('✅ Deve ter breadcrumbs inteligentes', () => {
      // Testar breadcrumbs como admin
      cy.loginAsAdmin()
      cy.visit('/admin')
      cy.get('[data-testid="breadcrumbs"]').should('contain', 'Admin')
      
      // Testar breadcrumbs como instrutor
      cy.loginAsInstructor()
      cy.visit('/dashboard')
      cy.get('[data-testid="breadcrumbs"]').should('contain', 'Instrutor')
      
      // Testar breadcrumbs como estudante
      cy.loginAsStudent()
      cy.visit('/estudante')
      cy.get('[data-testid="breadcrumbs"]').should('contain', 'Estudante')
    })
  })

  describe('🔐 Segurança e Controle de Acesso', () => {
    it('✅ Deve proteger rotas baseadas no role', () => {
      // Tentar acessar rota admin sem estar logado
      cy.visit('/admin')
      cy.url().should('include', '/auth')
      
      // Tentar acessar rota instrutor sem estar logado
      cy.visit('/dashboard')
      cy.url().should('include', '/auth')
      
      // Tentar acessar rota estudante sem estar logado
      cy.visit('/estudante')
      cy.url().should('include', '/auth')
    })

    it('✅ Deve redirecionar usuários para suas rotas apropriadas', () => {
      // Admin tentando acessar rota de instrutor
      cy.loginAsAdmin()
      cy.visit('/dashboard')
      cy.url().should('include', '/admin')
      
      // Instrutor tentando acessar rota de admin
      cy.loginAsInstructor()
      cy.visit('/admin')
      cy.url().should('include', '/dashboard')
      
      // Estudante tentando acessar rota de admin
      cy.loginAsStudent()
      cy.visit('/admin')
      cy.url().should('include', '/estudante')
    })
  })

  describe('📱 Responsividade e UX', () => {
    it('✅ Deve ser responsivo em dispositivos móveis', () => {
      // Testar como admin em mobile
      cy.loginAsAdmin()
      cy.visit('/admin')
      cy.viewport('iphone-x')
      
      // Verificar que o dashboard se adapta
      cy.contains('Dashboard Administrativo').should('be.visible')
      cy.get('[data-testid="mobile-menu"]').should('be.visible')
      
      // Testar como instrutor em mobile
      cy.loginAsInstructor()
      cy.visit('/dashboard')
      cy.viewport('iphone-x')
      
      cy.contains('Dashboard do Instrutor').should('be.visible')
      cy.get('[data-testid="mobile-menu"]').should('be.visible')
    })

    it('✅ Deve ter interface consistente em todos os roles', () => {
      // Verificar consistência visual como admin
      cy.loginAsAdmin()
      cy.visit('/admin')
      cy.get('[data-testid="dashboard-layout"]').should('have.class', 'admin-theme')
      
      // Verificar consistência visual como instrutor
      cy.loginAsInstructor()
      cy.visit('/dashboard')
      cy.get('[data-testid="dashboard-layout"]').should('have.class', 'instructor-theme')
      
      // Verificar consistência visual como estudante
      cy.loginAsStudent()
      cy.visit('/estudante')
      cy.get('[data-testid="dashboard-layout"]').should('have.class', 'student-theme')
    })
  })

  describe('🚀 Performance e Otimização', () => {
    it('✅ Deve carregar dados rapidamente', () => {
      // Testar tempo de carregamento do dashboard admin
      cy.loginAsAdmin()
      const startTime = Date.now()
      cy.visit('/admin')
      cy.contains('Dashboard Administrativo').should('be.visible')
      const endTime = Date.now()
      
      // Verificar que carregou em menos de 3 segundos
      expect(endTime - startTime).to.be.lessThan(3000)
    })

    it('✅ Deve usar lazy loading para componentes pesados', () => {
      cy.loginAsAdmin()
      cy.visit('/admin')
      
      // Verificar que as abas são carregadas sob demanda
      cy.contains('Usuários').click()
      cy.get('[data-testid="loading-spinner"]').should('be.visible')
      cy.get('[data-testid="users-tab"]').should('be.visible')
      
      cy.contains('Congregações').click()
      cy.get('[data-testid="loading-spinner"]').should('be.visible')
      cy.get('[data-testid="congregations-tab"]').should('be.visible')
    })
  })

  describe('🔔 Sistema de Notificações', () => {
    it('✅ Deve exibir notificações contextuais por role', () => {
      // Verificar notificações como admin
      cy.loginAsAdmin()
      cy.visit('/admin')
      cy.get('[data-testid="notifications"]').should('contain', 'Sistema')
      
      // Verificar notificações como instrutor
      cy.loginAsInstructor()
      cy.visit('/dashboard')
      cy.get('[data-testid="notifications"]').should('contain', 'Congregação')
      
      // Verificar notificações como estudante
      cy.loginAsStudent()
      cy.visit('/estudante')
      cy.get('[data-testid="notifications"]').should('contain', 'Designação')
    })
  })

  describe('📊 Dados e Estatísticas', () => {
    it('✅ Deve exibir estatísticas corretas para cada role', () => {
      // Verificar estatísticas globais como admin
      cy.loginAsAdmin()
      cy.visit('/admin')
      cy.contains('35').should('be.visible') // Total de estudantes
      cy.contains('1').should('be.visible') // Programa ativo
      cy.contains('4').should('be.visible') // Designações
      
      // Verificar estatísticas locais como instrutor
      cy.loginAsInstructor()
      cy.visit('/dashboard')
      cy.contains('35').should('be.visible') // Estudantes da congregação
      
      // Verificar estatísticas individuais como estudante
      cy.loginAsStudent()
      cy.visit('/estudante')
      cy.contains('Minhas Designações').should('be.visible')
    })
  })

  describe('🎯 Funcionalidades Específicas por Role', () => {
    it('✅ Admin deve ter acesso a materiais JW.org', () => {
      cy.loginAsAdmin()
      cy.visit('/admin')
      
      cy.contains('Materiais JW.org').click()
      cy.contains('Apostila MWB Setembro-Outubro 2025').should('be.visible')
      cy.contains('Meeting Workbook (Inglês)').should('be.visible')
    })

    it('✅ Instrutor deve ter acesso a designações da semana', () => {
      cy.loginAsInstructor()
      cy.visit('/dashboard')
      
      cy.contains('Designações da Semana').click()
      cy.contains('Gerenciar Designações').should('be.visible')
    })

    it('✅ Estudante deve ter acesso a materiais de preparo', () => {
      cy.loginAsStudent()
      cy.visit('/estudante')
      
      cy.contains('Materiais de Preparo').click()
      cy.contains('Apostila MWB Setembro-Outubro 2025').should('be.visible')
    })
  })

  describe('🔄 Logout e Sessão', () => {
    it('✅ Deve fazer logout corretamente', () => {
      // Login como admin
      cy.loginAsAdmin()
      cy.visit('/admin')
      cy.contains('Dashboard Administrativo').should('be.visible')
      
      // Fazer logout
      cy.get('[data-testid="logout-button"]').click()
      
      // Verificar redirecionamento para login
      cy.url().should('include', '/auth')
      cy.contains('Login').should('be.visible')
    })

    it('✅ Deve limpar dados da sessão no logout', () => {
      // Login como admin
      cy.loginAsAdmin()
      cy.visit('/admin')
      
      // Verificar que dados estão carregados
      cy.contains('35').should('be.visible') // Estatísticas
      
      // Fazer logout
      cy.get('[data-testid="logout-button"]').click()
      
      // Tentar acessar rota protegida
      cy.visit('/admin')
      cy.url().should('include', '/auth')
      cy.contains('35').should('not.exist') // Dados não devem estar visíveis
    })
  })
})

// 🎯 Comandos personalizados para facilitar os testes
Cypress.Commands.add('loginAsAdmin', () => {
  cy.visit('/auth')
  cy.get('[data-testid="email-input"]').type('amazonwebber007@gmail.com')
  cy.get('[data-testid="password-input"]').type('admin123')
  cy.get('[data-testid="login-button"]').click()
  cy.url().should('include', '/admin')
})

Cypress.Commands.add('loginAsInstructor', () => {
  cy.visit('/auth')
  cy.get('[data-testid="email-input"]').type('test@example.com')
  cy.get('[data-testid="password-input"]').type('senha123')
  cy.get('[data-testid="login-button"]').click()
  cy.url().should('include', '/dashboard')
})

Cypress.Commands.add('loginAsStudent', () => {
  cy.visit('/auth')
  cy.get('[data-testid="email-input"]').type('frankwebber33@hotmail.com')
  cy.get('[data-testid="password-input"]').type('senha123')
  cy.get('[data-testid="login-button"]').click()
  cy.url().should('include', '/estudante')
})

// 🎯 Declaração de tipos para os comandos personalizados
declare global {
  namespace Cypress {
    interface Chainable {
      loginAsAdmin(): Chainable<void>
      loginAsInstructor(): Chainable<void>
      loginAsStudent(): Chainable<void>
    }
  }
}

import { defineConfig } from 'cypress'

export default defineConfig({
  e2e: {
    baseUrl: 'https://sua-parte.lovable.app',
    viewportWidth: 1280,
    viewportHeight: 720,
    video: true,
    screenshotOnRunFailure: true,
    defaultCommandTimeout: 10000,
    requestTimeout: 10000,
    responseTimeout: 10000,
    pageLoadTimeout: 30000,
    
    // Configurações específicas para o Sistema Ministerial
    env: {
      // URLs do ambiente
      PRODUCTION_URL: 'https://sua-parte.lovable.app',
      LOCAL_URL: 'http://localhost:5173',
      
      // Credenciais de teste (Franklin)
      FRANKLIN_EMAIL: 'franklinmarceloferreiradelima@gmail.com',
      FRANKLIN_PASSWORD: '13a21r15',
      FRANKLIN_USER_ID: '77c99e53-500b-4140-b7fc-a69f96b216e1',
      
      // URLs específicas
      AUTH_URL: '/auth',
      FRANKLIN_PORTAL_URL: '/estudante/77c99e53-500b-4140-b7fc-a69f96b216e1',
      DASHBOARD_URL: '/dashboard',
      DEMO_URL: '/demo'
    },
    
    setupNodeEvents(on, config) {
      // Configurações adicionais podem ser adicionadas aqui
      on('task', {
        log(message) {
          console.log(message)
          return null
        }
      })
    },
    
    // Configurações de retry para testes flaky
    retries: {
      runMode: 2,
      openMode: 0
    },
    
    // Configurações de browser
    chromeWebSecurity: false,
    
    // Padrões de arquivos de teste
    specPattern: 'cypress/e2e/**/*.cy.{js,jsx,ts,tsx}',
    supportFile: 'cypress/support/e2e.ts'
  },
  
  component: {
    devServer: {
      framework: 'react',
      bundler: 'vite',
    },
    specPattern: 'cypress/component/**/*.cy.{js,jsx,ts,tsx}',
    supportFile: 'cypress/support/component.ts'
  }
})

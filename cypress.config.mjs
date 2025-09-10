import { defineConfig } from 'cypress'

export default defineConfig({
  projectId: 'o6ctse',
  e2e: {
    // Usa 8080 no dev por padrão; 4173 em CI (vite preview)
    baseUrl: process.env.CYPRESS_BASE_URL || (process.env.CI ? 'http://localhost:4173' : 'http://localhost:8080'),
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
      
      // Credenciais de teste - Instrutor (Admin completo)
      INSTRUCTOR_EMAIL: process.env.CYPRESS_INSTRUCTOR_EMAIL || 'frankwebber33@hotmail.com',
      INSTRUCTOR_PASSWORD: process.env.CYPRESS_INSTRUCTOR_PASSWORD || 'senha123',

      // Credenciais de teste - Estudante (Acesso limitado)
      STUDENT_EMAIL: process.env.CYPRESS_STUDENT_EMAIL || 'franklinmarceloferreiradelima@gmail.com',
      STUDENT_PASSWORD: process.env.CYPRESS_STUDENT_PASSWORD || 'senha123',

      // Credenciais de teste (Franklin - Legacy)
      FRANKLIN_EMAIL: process.env.FRANKLIN_EMAIL || 'franklinmarceloferreiradelima@gmail.com',
      FRANKLIN_PASSWORD: process.env.FRANKLIN_PASSWORD || 'senha123',
      FRANKLIN_USER_ID: '77c99e53-500b-4140-b7fc-a69f96b216e1',

      // Credenciais de teste (Sarah)
      SARAH_EMAIL: 'franklima.flm@gmail.com',
      SARAH_PASSWORD: 'test@123',
      SARAH_FULL_NAME: 'Sarah Rackel Ferreira Lima',
      SARAH_DATE_OF_BIRTH: '2009-09-25',
      SARAH_CONGREGATION: 'Market Harborough',
      SARAH_CARGO: 'publicador_nao_batizado',
      
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

      // Fix para PowerShell spawn error no Windows
      on('before:browser:launch', (browser = {}, launchOptions) => {
        if (browser.family === 'chromium' && browser.name !== 'electron') {
          // Adicionar flags para resolver problemas de spawn no Windows
          launchOptions.args.push('--disable-dev-shm-usage')
          launchOptions.args.push('--no-sandbox')
          launchOptions.args.push('--disable-gpu')
          launchOptions.args.push('--disable-web-security')
          launchOptions.args.push('--disable-features=VizDisplayCompositor')
        }
        return launchOptions
      })

      // Configurar variáveis de ambiente para evitar PowerShell
      on('before:run', (details) => {
        // Fix PowerShell spawn error on Windows
        if (process.platform === 'win32') {
          const path = process.env.PATH || '';
          const powershellPath = 'C:\\Windows\\System32\\WindowsPowerShell\\v1.0';
          if (!path.includes(powershellPath)) {
            process.env.PATH = `${powershellPath};${path}`;
          }
        }

        process.env.CYPRESS_INTERNAL_BROWSER_CONNECT_TIMEOUT = '60000'
        process.env.CYPRESS_VERIFY_TIMEOUT = '100000'

        // Additional Windows-specific fixes
        process.env.CYPRESS_CRASH_REPORTS = '0'
        process.env.CI = process.env.CI || 'false'
      })
    },
    
    // Configurações de retry para testes flaky
    retries: {
      runMode: 2,
      openMode: 0
    },
    
    // Configurações de browser
    chromeWebSecurity: false,

    // Configurações específicas para Windows
    experimentalStudio: true,
    experimentalWebKitSupport: false,
    
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

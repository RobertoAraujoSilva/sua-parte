import { defineConfig } from 'cypress'

export default defineConfig({
  e2e: {
    baseUrl: 'http://localhost:5174',
    supportFile: 'cypress/support/e2e.ts',
    specPattern: 'cypress/e2e/**/*.cy.{js,jsx,ts,tsx}',
    viewportWidth: 1280,
    viewportHeight: 720,
    video: false,
    screenshotOnRunFailure: true,
    defaultCommandTimeout: 10000,
    requestTimeout: 10000,
    responseTimeout: 10000,
    env: {
      ADMIN_EMAIL: 'amazonwebber007@gmail.com',
      ADMIN_PASSWORD: 'admin123',
      INSTRUCTOR_EMAIL: 'frankwebber33@hotmail.com',
      INSTRUCTOR_PASSWORD: 'senha123',
      STUDENT_EMAIL: 'franklinmarceloferreiradelima@gmail.com',
      STUDENT_PASSWORD: 'senha123'
    }
  }
})
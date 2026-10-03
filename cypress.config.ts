import { defineConfig } from 'cypress';

export default defineConfig({
  e2e: {
    baseUrl: process.env.BASE_URL ?? 'https://www.saucedemo.com',
    specPattern: 'frameworks/cypress/e2e/**/*.cy.ts',
    supportFile: 'frameworks/cypress/support/e2e.ts',
  },
  defaultCommandTimeout: 10_000,
  pageLoadTimeout: 20_000,
  retries: process.env.CI ? 1 : 0,
  screenshotOnRunFailure: true,
  video: true,
});

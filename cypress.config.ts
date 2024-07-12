import { defineConfig } from 'cypress';

export default defineConfig({
  chromeWebSecurity: false,
  responseTimeout: 12000000,
  experimentalModifyObstructiveThirdPartyCode: true,
  component: {
    devServer: {
      framework: 'angular',
      bundler: 'webpack',
    },
    specPattern: '**/*.cy.ts',
  },

  e2e: {
    baseUrl: 'http://localhost:4200',
    specPattern: '**/*.e2e.ts',
    setupNodeEvents(on, config) {
      // implement node event listeners here
      on('task', {
        log(message) {
          console.log(message);
          return null;
        },
      });
    },
  },
});

// cypress/e2e/authGuard.spec.js

import { slowCypressDown } from 'cypress-slow-down';

slowCypressDown();
describe('Auth Guard', () => {
  beforeEach(() => {});

  it('should redirect to login page if not logged in', () => {
    // Visit a protected route
    cy.visit('/auth/login'); // Adjust the URL to a route protected by the authGuard
    // Assert that the URL is redirected to the login page
    cy.url().should('include', '/auth/login');
  });

  it('should allow access to protected route if logged in', () => {
    // Modify the intercept to simulate a logged-in user

    localStorage.setItem('accessToken', 'saksdsakdsakdskdskdk');
    // Visit a protected route
    cy.visit('/auth/login'); // Adjust the URL to a route protected by the authGuard

    // Assert that the URL is the protected route
    cy.url().should('include', '/trip-list');
  });
});

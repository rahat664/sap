// cypress/e2e/sign-in.spec.js
import { slowCypressDown } from 'cypress-slow-down';

slowCypressDown();
describe('SignInComponent', () => {
  beforeEach(() => {
    cy.off('uncaught:exception', (err, runnable) => {
      return false;
    });
    // Visit the sign-in page
    cy.visit('/auth/login'); // Adjust the URL to your sign-in page
  });

  it('should display the sign-in form', () => {
    // Check if the form elements are visible
    cy.get('input[id="email"]').should('be.visible');
    cy.get('input[id="password"]').should('be.visible');
    cy.get('button').should('be.visible');
  });

  it('should display validation errors for empty fields', () => {
    // Submit the form without filling in the fields
    cy.get('button').click();

    // Check for validation error messages
    cy.get('div[id="emailError"]').should('contain.text', 'Email is required');

    cy.get('div[id="passwordError"]').should(
      'contain.text',
      'Password required'
    );
  });

  it('should display validation errors for invalid email and password', () => {
    // Enter invalid email and password
    cy.get('input[id="email"]').type('invalid-email');
    cy.get('input[id="password"]').type('12');

    // Submit the form
    cy.get('button').click();

    // Check for validation error messages
    cy.get('div[id="emailError"]').should('contain.text', 'Invalid email');
    cy.get('div[id="passwordError"]').should(
      'contain.text',
      'Invalid password'
    );
  });

  it('should toggle password visibility', () => {
    // Enter a password
    cy.get('input[id="password"]').type('password123');

    // Click the toggle password visibility icon
    cy.get('i[id="icon"]').click();

    // Check if the password input type is changed to text
    cy.get('input[id="password"]').should('have.attr', 'type', 'text');

    // Click the toggle password visibility icon again
    cy.get('#icon').click();

    // Check if the password input type is changed back to password
    cy.get('input[id="password"]').should('have.attr', 'type', 'password');
  });

  it('should submit the form and login successfully', () => {
    // Enter valid email and password
    cy.get('input[id="email"]').type('jane@doe.com');
    cy.get('input[id="password"]').type('123');

    // Submit the form
    cy.get('button').click();

    // Wait for the login request to complete

    // Check if the URL is redirected to the expected page after login
    cy.url().should('not.include', '/trip-list');
  });
});

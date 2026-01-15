/// <reference types="cypress" />

// ***********************************************
// This example commands.ts shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************

// -- This is a custom command to login --
Cypress.Commands.add('login', (username: string, password: string) => {
  cy.session([username, password], () => {
    cy.visit('/login');
    cy.get('input[name="username"]').type(username);
    cy.get('input[name="password"]').type(password);
    cy.get('button[type="submit"]').click();
    // Wait for redirect to home page
    cy.url().should('include', '/');
  });
});

// -- This is a custom command to logout --
Cypress.Commands.add('logout', () => {
  cy.contains('Logout').click();
  cy.url().should('include', '/login');
});

// Helper to get test password from environment variable
export const getTestPassword = () => {
  return Cypress.env('TEST_PASSWORD') || 'TestPassword123!';
};

export const getAdminPassword = () => {
  return Cypress.env('ADMIN_PASSWORD') || 'AdminPassword123!';
};

// Add TypeScript definitions
declare global {
  namespace Cypress {
    interface Chainable {
      login(username: string, password: string): Chainable<void>;
      logout(): Chainable<void>;
    }
  }
}

export {};

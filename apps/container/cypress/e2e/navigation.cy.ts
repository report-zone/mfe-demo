/// <reference types="cypress" />

import { getTestPassword } from '../support/commands';

describe('Navigation', () => {
  beforeEach(() => {
    // For navigation tests, we need to be logged in
    // In a real test environment, use cy.login() custom command
    cy.visit('/login');
  });

  describe('Public Routes', () => {
    it('should access login page without authentication', () => {
      cy.visit('/login');
      cy.url().should('include', '/login');
      cy.contains('Login').should('be.visible');
    });

    it('should access create account page without authentication', () => {
      cy.visit('/create-account');
      cy.url().should('include', '/create-account');
      cy.contains(/create.*account|sign up/i).should('be.visible');
    });

    it('should access reset password page without authentication', () => {
      cy.visit('/reset-password');
      cy.url().should('include', '/reset-password');
      cy.contains(/reset.*password/i).should('be.visible');
    });
  });

  describe('Protected Routes - Unauthenticated', () => {
    it('should redirect to login when accessing home without authentication', () => {
      cy.visit('/');
      cy.url({ timeout: 10000 }).should('include', '/login');
    });

    it('should redirect to login when accessing preferences without authentication', () => {
      cy.visit('/preferences');
      cy.url({ timeout: 10000 }).should('include', '/login');
    });

    it('should redirect to login when accessing account without authentication', () => {
      cy.visit('/account');
      cy.url({ timeout: 10000 }).should('include', '/login');
    });

    it('should redirect to login when accessing admin without authentication', () => {
      cy.visit('/admin');
      cy.url({ timeout: 10000 }).should('include', '/login');
    });
  });

  describe('Navigation Menu - Authenticated User', () => {
    beforeEach(() => {
      // Login before each test
      cy.fixture('users').then((users) => {
        cy.get('input[name="username"]').type(users.credentials.validUsername);
        cy.get('input[name="password"]').type(getTestPassword());
        cy.get('button[type="submit"]').click();
        cy.url({ timeout: 15000 }).should('not.include', '/login');
      });
    });

    it('should display navigation menu items', () => {
      cy.contains('Home').should('be.visible');
      cy.contains('Preferences').should('be.visible');
      cy.contains('Account').should('be.visible');
    });

    it('should navigate to home page', () => {
      cy.contains('Home').click();
      cy.url().should('match', /\/$|\/home/);
    });

    it('should navigate to preferences page', () => {
      cy.contains('Preferences').click();
      cy.url().should('include', '/preferences');
    });

    it('should navigate to account page', () => {
      cy.contains('Account').click();
      cy.url().should('include', '/account');
    });

    it('should not show admin link for regular users', () => {
      // Regular users should not see Admin link
      cy.contains('Admin').should('not.exist');
    });
  });

  describe('Route Changes', () => {
    beforeEach(() => {
      // Login before each test
      cy.fixture('users').then((users) => {
        cy.get('input[name="username"]').type(users.credentials.validUsername);
        cy.get('input[name="password"]').type(getTestPassword());
        cy.get('button[type="submit"]').click();
        cy.url({ timeout: 15000 }).should('not.include', '/login');
      });
    });

    it('should maintain authentication across route changes', () => {
      // Navigate to different routes
      cy.contains('Preferences').click();
      cy.url().should('include', '/preferences');
      
      cy.contains('Account').click();
      cy.url().should('include', '/account');
      
      cy.contains('Home').click();
      cy.url().should('match', /\/$|\/home/);
      
      // Should still be authenticated
      cy.contains('Logout').should('be.visible');
    });

    it('should handle browser back button', () => {
      cy.contains('Preferences').click();
      cy.url().should('include', '/preferences');
      
      cy.go('back');
      cy.url().should('match', /\/$|\/home/);
    });

    it('should handle browser forward button', () => {
      cy.contains('Preferences').click();
      cy.url().should('include', '/preferences');
      
      cy.go('back');
      cy.url().should('match', /\/$|\/home/);
      
      cy.go('forward');
      cy.url().should('include', '/preferences');
    });
  });

  describe('Unknown Routes', () => {
    beforeEach(() => {
      // Login before each test
      cy.fixture('users').then((users) => {
        cy.get('input[name="username"]').type(users.credentials.validUsername);
        cy.get('input[name="password"]').type(getTestPassword());
        cy.get('button[type="submit"]').click();
        cy.url({ timeout: 15000 }).should('not.include', '/login');
      });
    });

    it('should redirect to home for unknown routes', () => {
      cy.visit('/unknown-route');
      cy.url({ timeout: 10000 }).should('match', /\/$|\/home/);
    });
  });
});

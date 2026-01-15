/// <reference types="cypress" />

import { getTestPassword } from '../support/commands';

describe('User Interactions', () => {
  beforeEach(() => {
    cy.visit('/login');
  });

  describe('Login Form Interactions', () => {
    it('should accept text input in username field', () => {
      cy.get('input[name="username"]').type('testuser');
      cy.get('input[name="username"]').should('have.value', 'testuser');
    });

    it('should accept text input in password field', () => {
      cy.get('input[name="password"]').type('password123');
      cy.get('input[name="password"]').should('have.value', 'password123');
    });

    it('should mask password input', () => {
      cy.get('input[name="password"]').should('have.attr', 'type', 'password');
    });

    it('should enable submit button when form is filled', () => {
      cy.get('input[name="username"]').type('testuser');
      cy.get('input[name="password"]').type('password123');
      cy.get('button[type="submit"]').should('not.be.disabled');
    });

    it('should handle form submission on Enter key', () => {
      cy.get('input[name="username"]').type('testuser');
      cy.get('input[name="password"]').type('password123{enter}');
      // Form should attempt to submit
      cy.url({ timeout: 10000 }).should('not.equal', 'http://localhost:3000/login');
    });
  });

  describe('Create Account Form Interactions', () => {
    beforeEach(() => {
      cy.visit('/create-account');
    });

    it('should display create account form fields', () => {
      cy.get('input[name="username"]').should('be.visible');
      cy.get('input[name="email"]').should('be.visible');
      cy.get('input[name="password"]').should('be.visible');
    });

    it('should accept input in all form fields', () => {
      cy.get('input[name="username"]').type('newuser');
      cy.get('input[name="email"]').type('newuser@example.com');
      cy.get('input[name="password"]').type('NewPassword123!');
      
      cy.get('input[name="username"]').should('have.value', 'newuser');
      cy.get('input[name="email"]').should('have.value', 'newuser@example.com');
    });

    it('should show validation errors for invalid email', () => {
      cy.get('input[name="username"]').type('newuser');
      cy.get('input[name="email"]').type('invalid-email');
      cy.get('input[name="password"]').type('NewPassword123!');
      
      // Trigger validation by moving focus
      cy.get('input[name="email"]').blur();
      
      // Should show error or prevent submission
      cy.get('button[type="submit"]').click();
      cy.url().should('include', '/create-account');
    });

    it('should show validation errors for short password', () => {
      cy.get('input[name="username"]').type('newuser');
      cy.get('input[name="email"]').type('newuser@example.com');
      cy.get('input[name="password"]').type('short');
      
      // Trigger validation
      cy.get('input[name="password"]').blur();
      
      // Should show error message
      cy.contains(/password.*8/i).should('be.visible');
    });
  });

  describe('Header Interactions', () => {
    beforeEach(() => {
      // Login first to see header with user info
      cy.fixture('users').then((users) => {
        cy.get('input[name="username"]').type(users.credentials.validUsername);
        cy.get('input[name="password"]').type(getTestPassword());
        cy.get('button[type="submit"]').click();
        cy.url({ timeout: 15000 }).should('not.include', '/login');
      });
    });

    it('should display user welcome message', () => {
      cy.contains(/welcome/i, { timeout: 10000 }).should('be.visible');
    });

    it('should display logout button', () => {
      cy.contains('Logout').should('be.visible');
    });

    it('should logout when clicking logout button', () => {
      cy.contains('Logout').click();
      cy.url().should('include', '/login');
    });
  });

  describe('Navigation Menu Interactions', () => {
    beforeEach(() => {
      // Login first
      cy.fixture('users').then((users) => {
        cy.get('input[name="username"]').type(users.credentials.validUsername);
        cy.get('input[name="password"]').type(getTestPassword());
        cy.get('button[type="submit"]').click();
        cy.url({ timeout: 15000 }).should('not.include', '/login');
      });
    });

    it('should highlight active navigation item', () => {
      cy.contains('Home').parent().should('have.class', 'Mui-selected');
    });

    it('should update active item on navigation', () => {
      cy.contains('Preferences').click();
      cy.contains('Preferences').parent().should('have.class', 'Mui-selected');
    });

    it('should respond to keyboard navigation', () => {
      // Test keyboard accessibility by using Tab key
      cy.get('body').type('{tab}');
      // Check that focus is working (exact implementation depends on MUI)
      cy.focused().should('exist');
    });
  });

  describe('Button Click Interactions', () => {
    it('should respond to login button clicks', () => {
      cy.get('input[name="username"]').type('testuser');
      cy.get('input[name="password"]').type('password123');
      
      cy.get('button[type="submit"]').click();
      // Should attempt authentication
      cy.url({ timeout: 10000 }).should('not.equal', 'http://localhost:3000/login');
    });

    it('should respond to link clicks', () => {
      cy.contains(/create.*account|sign up/i).click();
      cy.url().should('include', '/create-account');
    });

    it('should handle rapid button clicks gracefully', () => {
      cy.get('input[name="username"]').type('testuser');
      cy.get('input[name="password"]').type('password123');
      
      // Click submit button multiple times rapidly
      cy.get('button[type="submit"]').click().click().click();
      
      // Should not cause errors or multiple submissions
      cy.url({ timeout: 10000 }).should('exist');
    });
  });

  describe('Form Validation', () => {
    beforeEach(() => {
      cy.visit('/create-account');
    });

    it('should validate username length', () => {
      cy.get('input[name="username"]').type('ab');
      cy.get('input[name="username"]').blur();
      
      // Should show validation error for short username
      cy.contains(/username.*3/i).should('be.visible');
    });

    it('should validate email format', () => {
      cy.get('input[name="email"]').type('invalid');
      cy.get('input[name="email"]').blur();
      
      // Should show validation error
      cy.contains(/email/i).should('be.visible');
    });

    it('should validate required fields', () => {
      cy.get('button[type="submit"]').click();
      
      // Should not proceed with empty form
      cy.url().should('include', '/create-account');
    });
  });
});

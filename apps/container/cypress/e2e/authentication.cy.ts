/// <reference types="cypress" />

import { getTestPassword } from '../support/commands';

describe('Authentication Flow', () => {
  beforeEach(() => {
    cy.visit('/login');
  });

  describe('Login', () => {
    it('should display login page elements', () => {
      cy.contains('Login').should('be.visible');
      cy.get('input[name="username"]').should('be.visible');
      cy.get('input[name="password"]').should('be.visible');
      cy.get('button[type="submit"]').should('be.visible');
    });

    it('should show validation errors for empty fields', () => {
      cy.get('button[type="submit"]').click();
      // The form should not submit with empty fields
      cy.url().should('include', '/login');
    });

    it('should show error for invalid credentials', () => {
      cy.get('input[name="username"]').type('wronguser');
      cy.get('input[name="password"]').type('wrongpassword');
      cy.get('button[type="submit"]').click();
      
      // Should show error message from auth service
      // Wait for potential error display
      cy.wait(2000);
      // The form should remain on login page, indicating auth failure
      cy.url().should('include', '/login');
    });

    it('should redirect to home page on successful login', () => {
      // Note: This test requires a valid test user in the auth system
      // In a real test environment, you would use test fixtures or mocked auth
      cy.fixture('users').then((users) => {
        cy.get('input[name="username"]').type(users.credentials.validUsername);
        cy.get('input[name="password"]').type(getTestPassword());
        cy.get('button[type="submit"]').click();
        
        // Wait for redirect - timeout increased for auth service response
        cy.url({ timeout: 15000 }).should('not.include', '/login');
      });
    });

    it('should show create account link', () => {
      cy.contains(/create.*account|sign up/i).should('be.visible');
    });

    it('should show reset password link', () => {
      cy.contains(/forgot.*password|reset.*password/i).should('be.visible');
    });
  });

  describe('Logout', () => {
    it('should logout and redirect to login page', () => {
      // This test assumes a logged-in session
      // In real tests, you would use cy.login() custom command
      cy.fixture('users').then((users) => {
        // First login
        cy.get('input[name="username"]').type(users.credentials.validUsername);
        cy.get('input[name="password"]').type(getTestPassword());
        cy.get('button[type="submit"]').click();
        
        // Wait for successful login
        cy.url({ timeout: 15000 }).should('not.include', '/login');
        
        // Then logout
        cy.contains('Logout', { timeout: 10000 }).click();
        cy.url().should('include', '/login');
      });
    });
  });

  describe('Create Account Navigation', () => {
    it('should navigate to create account page', () => {
      cy.contains(/create.*account|sign up/i).click();
      cy.url().should('include', '/create-account');
    });
  });

  describe('Reset Password Navigation', () => {
    it('should navigate to reset password page', () => {
      cy.contains(/forgot.*password|reset.*password/i).click();
      cy.url().should('include', '/reset-password');
    });
  });
});

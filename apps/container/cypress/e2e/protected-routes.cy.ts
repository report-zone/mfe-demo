/// <reference types="cypress" />

describe('Protected Routes and Admin Access', () => {
  describe('Protected Routes - Authentication Required', () => {
    it('should redirect unauthenticated users from home page', () => {
      cy.visit('/');
      cy.url({ timeout: 10000 }).should('include', '/login');
    });

    it('should redirect unauthenticated users from preferences page', () => {
      cy.visit('/preferences');
      cy.url({ timeout: 10000 }).should('include', '/login');
    });

    it('should redirect unauthenticated users from account page', () => {
      cy.visit('/account');
      cy.url({ timeout: 10000 }).should('include', '/login');
    });

    it('should redirect unauthenticated users from admin page', () => {
      cy.visit('/admin');
      cy.url({ timeout: 10000 }).should('include', '/login');
    });

    it('should allow access to protected routes after login', () => {
      cy.visit('/login');
      cy.fixture('users').then((users) => {
        cy.get('input[name="username"]').type(users.credentials.validUsername);
        cy.get('input[name="password"]').type(users.credentials.validPassword);
        cy.get('button[type="submit"]').click();
        
        // Should be able to access home
        cy.url({ timeout: 15000 }).should('not.include', '/login');
        
        // Should be able to access preferences
        cy.visit('/preferences');
        cy.url().should('include', '/preferences');
        
        // Should be able to access account
        cy.visit('/account');
        cy.url().should('include', '/account');
      });
    });
  });

  describe('Admin Route Protection', () => {
    it('should not show admin link for non-admin users', () => {
      cy.visit('/login');
      cy.fixture('users').then((users) => {
        cy.get('input[name="username"]').type(users.credentials.validUsername);
        cy.get('input[name="password"]').type(users.credentials.validPassword);
        cy.get('button[type="submit"]').click();
        cy.url({ timeout: 15000 }).should('not.include', '/login');
        
        // Admin link should not be visible
        cy.contains('Admin').should('not.exist');
      });
    });

    it('should redirect non-admin users attempting to access admin page', () => {
      cy.visit('/login');
      cy.fixture('users').then((users) => {
        cy.get('input[name="username"]').type(users.credentials.validUsername);
        cy.get('input[name="password"]').type(users.credentials.validPassword);
        cy.get('button[type="submit"]').click();
        cy.url({ timeout: 15000 }).should('not.include', '/login');
        
        // Try to access admin page directly
        cy.visit('/admin');
        
        // Should be redirected away from admin page
        cy.url({ timeout: 10000 }).should('not.include', '/admin');
      });
    });

    it('should allow admin users to access admin page', () => {
      // Note: This test requires an admin user in the test environment
      cy.visit('/login');
      cy.fixture('users').then((users) => {
        // Check if admin credentials exist
        if (users.adminUser) {
          cy.get('input[name="username"]').type(users.adminUser.username);
          cy.get('input[name="password"]').type(users.adminUser.password);
          cy.get('button[type="submit"]').click();
          cy.url({ timeout: 15000 }).should('not.include', '/login');
          
          // Admin link should be visible
          cy.contains('Admin').should('be.visible');
          
          // Should be able to access admin page
          cy.contains('Admin').click();
          cy.url().should('include', '/admin');
        }
      });
    });
  });

  describe('Session Persistence', () => {
    it('should maintain authentication on page reload', () => {
      cy.visit('/login');
      cy.fixture('users').then((users) => {
        cy.get('input[name="username"]').type(users.credentials.validUsername);
        cy.get('input[name="password"]').type(users.credentials.validPassword);
        cy.get('button[type="submit"]').click();
        cy.url({ timeout: 15000 }).should('not.include', '/login');
        
        // Reload page
        cy.reload();
        
        // Should still be authenticated
        cy.url({ timeout: 10000 }).should('not.include', '/login');
        cy.contains('Logout', { timeout: 10000 }).should('be.visible');
      });
    });

    it('should lose authentication after logout', () => {
      cy.visit('/login');
      cy.fixture('users').then((users) => {
        cy.get('input[name="username"]').type(users.credentials.validUsername);
        cy.get('input[name="password"]').type(users.credentials.validPassword);
        cy.get('button[type="submit"]').click();
        cy.url({ timeout: 15000 }).should('not.include', '/login');
        
        // Logout
        cy.contains('Logout').click();
        cy.url().should('include', '/login');
        
        // Try to access protected route
        cy.visit('/account');
        cy.url({ timeout: 10000 }).should('include', '/login');
      });
    });
  });

  describe('Route Authorization', () => {
    it('should prevent unauthorized navigation via URL manipulation', () => {
      // Not logged in
      cy.visit('/account');
      cy.url({ timeout: 10000 }).should('include', '/login');
      
      // Still not logged in
      cy.visit('/preferences');
      cy.url({ timeout: 10000 }).should('include', '/login');
      
      // Still not logged in
      cy.visit('/admin');
      cy.url({ timeout: 10000 }).should('include', '/login');
    });

    it('should handle multiple rapid route changes securely', () => {
      // Rapid navigation attempts while not authenticated
      cy.visit('/');
      cy.visit('/account');
      cy.visit('/preferences');
      cy.visit('/admin');
      
      // Should end up on login page
      cy.url({ timeout: 10000 }).should('include', '/login');
    });
  });

  describe('Public Routes - Always Accessible', () => {
    it('should allow unauthenticated access to login page', () => {
      cy.visit('/login');
      cy.url().should('include', '/login');
      cy.contains('Login').should('be.visible');
    });

    it('should allow unauthenticated access to create account page', () => {
      cy.visit('/create-account');
      cy.url().should('include', '/create-account');
    });

    it('should allow unauthenticated access to reset password page', () => {
      cy.visit('/reset-password');
      cy.url().should('include', '/reset-password');
    });

    it('should redirect authenticated users away from login page', () => {
      cy.visit('/login');
      cy.fixture('users').then((users) => {
        cy.get('input[name="username"]').type(users.credentials.validUsername);
        cy.get('input[name="password"]').type(users.credentials.validPassword);
        cy.get('button[type="submit"]').click();
        cy.url({ timeout: 15000 }).should('not.include', '/login');
        
        // Try to visit login page while authenticated
        cy.visit('/login');
        
        // Should be redirected to home
        cy.url({ timeout: 10000 }).should('not.include', '/login');
      });
    });
  });
});

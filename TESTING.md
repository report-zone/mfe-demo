# Testing Guide

This document provides comprehensive information about the testing strategy and implementation for the MFE Demo application.

## Testing Strategy

The project follows a comprehensive testing approach with two main types of tests:

### 1. Unit Tests (Vitest)

Unit tests verify individual components, hooks, utilities, and contexts in isolation. They ensure that each piece of code works correctly on its own.

**Coverage Goals:**
- ✅ **Statements**: > 80%
- ✅ **Branches**: > 75%
- ✅ **Functions**: > 80%
- ✅ **Lines**: > 80%

### 2. E2E Tests (Cypress)

End-to-end tests verify the complete user flows and interactions across the application. They test the system as a whole from the user's perspective.

## Test Structure

```
apps/
├── container/
│   ├── src/__tests__/          # Container unit tests
│   │   ├── AuthContext.test.tsx
│   │   ├── DataContext.test.tsx
│   │   ├── UserPreferencesContext.test.tsx
│   │   ├── Header.test.tsx
│   │   ├── Navbar.test.tsx
│   │   ├── MFELoader.test.tsx
│   │   ├── Loading.test.tsx
│   │   ├── MFEPlaceholder.test.tsx
│   │   ├── useMultiStepForm.test.ts
│   │   ├── validation.test.ts
│   │   └── errorHandler.test.ts
│   └── cypress/                # Cypress E2E tests
│       ├── e2e/
│       │   ├── authentication.cy.ts
│       │   ├── navigation.cy.ts
│       │   ├── user-interactions.cy.ts
│       │   └── protected-routes.cy.ts
│       ├── fixtures/
│       │   └── users.json
│       └── support/
│           ├── commands.ts
│           └── e2e.ts
├── home/
│   └── src/__tests__/          # Home MFE unit tests
│       └── App.test.tsx
├── preferences/
│   └── src/__tests__/          # Preferences MFE unit tests
│       └── App.test.tsx
├── account/
│   └── src/__tests__/          # Account MFE unit tests
│       └── App.test.tsx
└── admin/
    └── src/__tests__/          # Admin MFE unit tests
        └── App.test.tsx
```

## Running Tests

### Run All Tests

```bash
# Run all unit tests across all MFEs
yarn test

# Or explicitly
yarn test:unit:all
```

### Run Tests by Application

```bash
# Container app (shell)
yarn test:unit:container

# Home MFE
yarn test:unit:home

# Preferences MFE
yarn test:unit:preferences

# Account MFE
yarn test:unit:account

# Admin MFE
yarn test:unit:admin
```

### Run Tests with Coverage

```bash
# Run container tests with coverage report
yarn test:coverage
```

### Run E2E Tests

```bash
# Run Cypress E2E tests
yarn test:e2e

# Open Cypress UI (for interactive testing)
cd apps/container
yarn test:e2e:open
```

### Watch Mode (Development)

```bash
# Run tests in watch mode (auto-rerun on changes)
cd apps/container
yarn test:watch
```

## Test Coverage Summary

### Container App

**Total Tests: 79 passing**

#### Components (98.27% coverage)
- ✅ Header component (5 tests)
- ✅ Navbar component (4 tests)
- ✅ MFELoader component (3 tests)
- ✅ Loading component (2 tests)
- ✅ MFEPlaceholder component (4 tests)

#### Contexts (82.37% coverage)
- ✅ AuthContext (2 tests)
- ✅ DataContext (3 tests)
- ✅ UserPreferencesContext (7 tests)

#### Hooks (100% coverage)
- ✅ useMultiStepForm (11 tests)

#### Utilities (100% coverage)
- ✅ Validation utilities (20 tests)
  - Password validation
  - Email validation
  - Username validation
  - Password match validation
  - Verification code validation
- ✅ Error handler utilities (18 tests)
  - Error message extraction
  - Error logging
  - Auth error message formatting

### Home MFE

**Tests: 7 passing**
- App component rendering
- Card content validation
- Icon display
- Layout structure

### Preferences MFE

**Tests: 6 passing**
- App component rendering
- Tab navigation
- Settings UI
- Layout structure

### Account MFE

**Tests: 10 passing**
- Form field rendering
- Input validation
- Default values
- Icon display

### Admin MFE

**Tests: 10 passing**
- Admin panel rendering
- User table display
- Role and status chips
- Warning alerts

## E2E Test Coverage

### Authentication Flow (authentication.cy.ts)
- ✅ Login page elements
- ✅ Form validation
- ✅ Invalid credential handling
- ✅ Successful login flow
- ✅ Logout flow
- ✅ Navigation to create account
- ✅ Navigation to reset password

### Navigation (navigation.cy.ts)
- ✅ Public routes accessibility
- ✅ Protected routes (redirect when unauthenticated)
- ✅ Navigation menu items
- ✅ Route changes
- ✅ Browser back/forward navigation
- ✅ Unknown route handling

### User Interactions (user-interactions.cy.ts)
- ✅ Form input handling
- ✅ Password masking
- ✅ Form submission
- ✅ Keyboard interactions
- ✅ Button clicks
- ✅ Field validation
- ✅ Multiple rapid clicks handling

### Protected Routes (protected-routes.cy.ts)
- ✅ Authentication requirements
- ✅ Admin-only access control
- ✅ Session persistence
- ✅ Post-logout access control
- ✅ URL manipulation prevention
- ✅ Public routes availability

## Testing Best Practices

### Writing Unit Tests

1. **Arrange-Act-Assert Pattern**
   ```typescript
   it('should validate password length', () => {
     // Arrange
     const password = 'short';
     
     // Act
     const result = validatePassword(password);
     
     // Assert
     expect(result.isValid).toBe(false);
   });
   ```

2. **Use Descriptive Test Names**
   - Good: `should redirect to login when accessing home without authentication`
   - Bad: `test home page`

3. **Test One Thing Per Test**
   - Each test should verify a single behavior or outcome

4. **Use Testing Library Best Practices**
   - Query by role, label, or text (user-centric)
   - Avoid implementation details
   - Use `waitFor` for async operations

### Writing E2E Tests

1. **Test User Flows**
   - Focus on complete user journeys
   - Test real user interactions

2. **Use Custom Commands**
   ```typescript
   // Define in commands.ts
   Cypress.Commands.add('login', (username, password) => {
     // Login logic
   });
   
   // Use in tests
   cy.login('testuser', 'password123');
   ```

3. **Use Fixtures for Test Data**
   ```typescript
   cy.fixture('users').then((users) => {
     cy.login(users.testUser.username, users.testUser.password);
   });
   ```

4. **Handle Async Operations**
   - Use appropriate timeouts
   - Wait for specific elements or conditions

## Continuous Integration

Tests should be run in CI/CD pipelines:

```yaml
# Example CI configuration
test:
  script:
    - yarn install
    - yarn test:unit:all
    - yarn test:e2e
```

## Test Coverage Reports

After running tests with coverage:

```bash
yarn test:coverage
```

View the HTML report at:
```
apps/container/coverage/index.html
```

## Troubleshooting

### Common Issues

**Issue: Tests fail with "Cannot find module"**
- Solution: Run `yarn install` to ensure all dependencies are installed

**Issue: E2E tests timeout**
- Solution: Increase timeout in cypress.config.ts or specific tests
- Ensure the development server is running on localhost:3000

**Issue: Snapshot mismatches**
- Solution: Review the changes and update snapshots if intentional

**Issue: Flaky tests**
- Solution: Use proper `waitFor` and avoid hardcoded delays
- Check for race conditions in async operations

## Extending Tests

### Adding New Unit Tests

1. Create a test file in `src/__tests__/` directory
2. Follow naming convention: `ComponentName.test.tsx` or `utilityName.test.ts`
3. Import necessary testing utilities
4. Write test cases using `describe` and `it` blocks

### Adding New E2E Tests

1. Create a test file in `cypress/e2e/` directory
2. Follow naming convention: `feature-name.cy.ts`
3. Use page object pattern for complex flows
4. Add necessary fixtures in `cypress/fixtures/`

## Additional Resources

- [Vitest Documentation](https://vitest.dev/)
- [Testing Library](https://testing-library.com/docs/react-testing-library/intro/)
- [Cypress Documentation](https://docs.cypress.io/)
- [Jest DOM Matchers](https://github.com/testing-library/jest-dom)

## Test Summary

| Application | Unit Tests | Coverage |
|-------------|------------|----------|
| Container   | 79         | 82.37%   |
| Home        | 7          | N/A      |
| Preferences | 6          | N/A      |
| Account     | 10         | N/A      |
| Admin       | 10         | N/A      |
| **Total**   | **112**    | -        |

| E2E Test Suite        | Tests |
|----------------------|-------|
| Authentication       | ~8    |
| Navigation           | ~15   |
| User Interactions    | ~15   |
| Protected Routes     | ~12   |
| **Total (approx.)**  | **~50** |

**Overall Test Count: ~162 tests**

## Next Steps

- Run tests regularly during development
- Maintain test coverage above 80%
- Add tests for new features
- Keep E2E tests focused on critical user flows
- Review and update tests when refactoring

# SOLID Principles Implementation Guide

**Version**: 2.0  
**Last Updated**: January 2026

This document describes the SOLID principles refactoring applied to the MFE Demo application.

## Overview

The codebase has been comprehensively refactored to follow SOLID principles, making it more maintainable, testable, and extensible. This includes cross-cutting improvements across all MFE applications.

## SOLID Principles Applied

### 1. Single Responsibility Principle (SRP)

**Definition**: A class/module should have only one reason to change.

#### Implementations:

**a) Form Validation (`src/utils/validation.ts`)**
- **Before**: Validation logic was embedded in component files
- **After**: Centralized validation utilities that can be reused across components
- **Benefits**: Easy to test, maintain, and reuse

```typescript
// Usage
import { validatePassword, validateEmail } from '../utils/validation';

const result = validatePassword(password);
if (!result.isValid) {
  setError(result.error);
}
```

**b) Multi-Step Form Management (`src/hooks/useMultiStepForm.ts`)**
- **Before**: Step management logic mixed with component state
- **After**: Dedicated hook for multi-step form navigation
- **Benefits**: Reusable across different multi-step forms

```typescript
// Usage
import { useMultiStepForm } from '../hooks/useMultiStepForm';

const { activeStep, nextStep, previousStep } = useMultiStepForm(3);
```

**c) Error Handling (`src/utils/errorHandler.ts`)**
- **Before**: Error handling duplicated in multiple places
- **After**: Centralized error handling utilities
- **Benefits**: Consistent error messages and logging

```typescript
// Usage
import { logError, getAuthErrorMessage } from '../utils/errorHandler';

try {
  await someOperation();
} catch (error) {
  logError('Login', error);
  setError(getAuthErrorMessage(error));
}
```

**d) User Preferences Context (`src/contexts/UserPreferencesContext.tsx`)**
- **Before**: Generic `Record<string, unknown>` data context
- **After**: Type-safe, domain-specific preferences context
- **Benefits**: Type safety, clear API, focused responsibility

**e) Container App Hooks (January 2026)**
- **Before**: App.tsx mixed concerns (routing, theme, redirects in one component)
- **After**: Extracted into focused custom hooks:
  - `useBaseUrlRedirect` - handles base URL redirects only
  - `useThemeManagement` - manages theme state and persistence only
  - `useMFEMounting` - manages MFE mounting lifecycle only
- **Benefits**: Each hook has one responsibility, easier to test and maintain

**f) I18n and Theme Contexts (All MFEs)**
- **Before**: Contexts handled storage, events, state management together
- **After**: Dependencies injected via props, each concern isolated
- **Benefits**: Separation of storage, event handling, and state logic

### 2. Open/Closed Principle (OCP)

**Definition**: Software entities should be open for extension but closed for modification.

#### Implementations:

**a) MFE Registry (`src/config/mfeRegistry.ts`)**
- **Before**: Switch statement in MFELoader requiring modification for new MFEs
- **After**: Configuration-based registry system
- **Benefits**: Add new MFEs without modifying MFELoader

```typescript
// Adding a new MFE - just update the registry
export const mfeRegistry: Record<string, MFEConfig> = {
  home: { name: 'Home', loadComponent: () => import('...') },
  newMFE: { name: 'New MFE', loadComponent: () => import('...') }, // New!
};
```

**b) Theme Configuration (`src/config/theme.ts`)**
- **Before**: Theme hard-coded in App.tsx
- **After**: Extracted theme configuration with extension support
- **Benefits**: Easy to create theme variants without modifying App.tsx

```typescript
// Creating a custom theme
import { createCustomTheme } from './config/theme';

const darkTheme = createCustomTheme({
  palette: { mode: 'dark' }
});
```

**c) Route Configuration (`src/config/routes.ts`)**
- **Before**: Routes hard-coded in App.tsx JSX
- **After**: Data-driven route configuration
- **Benefits**: Add routes by updating configuration

**d) Route Mappings (`src/config/routeMappings.ts`) (January 2026)**
- **Before**: Hard-coded if-statements in getCurrentMFE() function
- **After**: Configuration array with flexible pattern matching
- **Benefits**: Add new route mappings without modifying code

```typescript
// Adding a new route mapping - just update the configuration
export const routeMappings: RouteMapping[] = [
  { pattern: '/preferences', mfeName: 'preferences', exact: false },
  { pattern: '/new-feature', mfeName: 'newFeature', exact: true }, // New!
];
```

### 3. Liskov Substitution Principle (LSP)

**Definition**: Subtypes must be substitutable for their base types.

#### Implementation:

**Interface-based Design**
- All service implementations adhere to their interfaces
- Components work with any `IAuthService` implementation
- Can swap authentication providers without breaking code

```typescript
// Any implementation of IAuthService works
const mockAuthService: IAuthService = {
  signIn: async () => {},
  signOut: async () => {},
  // ... other methods
};

<AuthProvider authService={mockAuthService}>
  {/* Components work the same */}
</AuthProvider>
```

### 4. Interface Segregation Principle (ISP)

**Definition**: Clients should not be forced to depend on interfaces they don't use.

#### Implementations:

**a) Auth Context Interfaces (`src/contexts/interfaces/IAuthContext.ts`)**
- **Before**: Single large interface with 11 methods
- **After**: Segregated into focused interfaces

```typescript
// Components can depend on just what they need
interface IAuthState {
  user: User | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isLoading: boolean;
}

interface IAuthActions {
  login: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

interface ISignUpOperations {
  signUp: (...) => Promise<void>;
  confirmSignUp: (...) => Promise<void>;
}

interface IPasswordReset {
  resetPassword: (...) => Promise<void>;
  confirmResetPassword: (...) => Promise<void>;
}

// Full interface combines all when needed
interface IAuthContext extends IAuthState, IAuthActions, 
                                ISignUpOperations, IPasswordReset {}
```

**Benefits**:
- Header component only needs `IAuthState` and `IAuthActions`
- Login page needs `IAuthActions`
- Create account page needs `ISignUpOperations`
- Reset password page needs `IPasswordReset`

### 5. Dependency Inversion Principle (DIP)

**Definition**: High-level modules should not depend on low-level modules. Both should depend on abstractions.

#### Implementations:

**a) Auth Service Interface (`src/services/interfaces/IAuthService.ts`)**
- **Before**: Components directly imported concrete `authService`
- **After**: Components depend on `IAuthService` interface

```typescript
// Interface (abstraction)
export interface IAuthService {
  signIn(username: string, password: string): Promise<void>;
  signOut(): Promise<void>;
  // ... other methods
}

// Concrete implementation
class CognitoAuthService implements IAuthService {
  async signIn(username: string, password: string): Promise<void> {
    // AWS Cognito specific implementation
  }
  // ...
}
```

**b) Dependency Injection in AuthProvider**
- **Before**: AuthProvider hard-coded to use specific authService
- **After**: AuthService can be injected (useful for testing)

```typescript
// Production use
<AuthProvider>
  {children}
</AuthProvider>

// Testing use
<AuthProvider authService={mockAuthService}>
  {children}
</AuthProvider>
```

**c) Storage and Event Bus Abstractions (January 2026)**
- **Before**: All contexts directly used `localStorage` and `window` APIs
- **After**: Abstractions via `IStorageService` and `IEventBus` interfaces

```typescript
// Interfaces
export interface IStorageService {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
  // ...
}

export interface IEventBus {
  dispatch<T>(eventName: string, detail?: T): void;
  subscribe<T>(eventName: string, handler: (detail: T) => void): () => void;
  unsubscribe<T>(eventName: string, handler: (detail: T) => void): void;
}

// Usage with dependency injection
<I18nProvider 
  config={config}
  storageService={localStorageService}
  eventBus={windowEventBus}
>
  {children}
</I18nProvider>
```

**d) ErrorBoundary Logger Dependency (January 2026)**
- **Before**: Used `console.error()` directly
- **After**: Imports and uses logger service abstraction

```typescript
// Now uses logger service
logger.error('ErrorBoundary caught an error', 'ErrorBoundary', error, {
  componentStack: errorInfo.componentStack,
});
```

**Benefits**:
- Can swap from AWS Cognito to Auth0, Firebase, or any other provider
- Easy to mock for testing
- No changes needed in components when switching providers
- Can swap localStorage for sessionStorage or custom storage
- Can swap window events for message bus or other communication

## File Organization

```
apps/container/src/
├── config/              # Configuration files (OCP)
│   ├── mfeRegistry.ts   # MFE configuration
│   ├── routeMappings.ts # Route-to-MFE mapping (NEW)
│   ├── routes.ts        # Route configuration
│   └── theme.ts         # Theme configuration
├── contexts/            # React contexts
│   ├── interfaces/      # Context interfaces (ISP)
│   │   └── IAuthContext.ts
│   ├── AuthContext.tsx
│   ├── DataContext.tsx
│   └── UserPreferencesContext.tsx
├── hooks/               # Custom hooks (SRP)
│   ├── useMultiStepForm.ts
│   ├── useBaseUrlRedirect.ts    # NEW - Base URL redirect logic
│   ├── useThemeManagement.ts    # NEW - Theme state management
│   └── useMFEMounting.ts        # NEW - MFE mounting lifecycle
├── services/            # Business logic layer
│   ├── interfaces/      # Service interfaces (DIP)
│   │   ├── IAuthService.ts
│   │   ├── IStorageService.ts   # NEW - Storage abstraction
│   │   └── IEventBus.ts         # NEW - Event bus abstraction
│   ├── authService.ts
│   ├── localStorageService.ts   # NEW - LocalStorage implementation
│   ├── windowEventBus.ts        # NEW - Window event bus implementation
│   ├── loggerService.ts
│   └── ThemeConverter.ts
├── utils/               # Utility functions (SRP)
│   ├── errorHandler.ts
│   └── validation.ts
└── components/
    ├── MFELoader.tsx    # Uses registry (OCP)
    └── ErrorBoundary.tsx # Uses logger service (DIP)

apps/[home|account|admin|preferences]/src/
├── i18n/
│   └── I18nContext.tsx  # Uses IStorageService & IEventBus (DIP)
├── context/             # (preferences only)
│   └── ThemeContext.tsx # Uses IStorageService & IEventBus (DIP)
└── services/
    ├── interfaces/
    │   ├── IStorageService.ts
    │   └── IEventBus.ts
    ├── localStorageService.ts
    └── windowEventBus.ts
```

## Recent Improvements (January 2026)

### Cross-MFE Service Abstractions

All MFE applications now use standardized service abstractions:

1. **Storage Abstraction (`IStorageService`)**
   - Eliminates direct `localStorage` dependencies
   - Enables testing with mock storage
   - Supports swapping storage mechanisms (localStorage, sessionStorage, etc.)

2. **Event Bus Abstraction (`IEventBus`)**
   - Eliminates direct `window` event dependencies
   - Properly handles event listener cleanup (fixes memory leaks)
   - Supports different communication mechanisms

3. **Dependency Injection Throughout**
   - All contexts accept optional service dependencies
   - Defaults to concrete implementations for convenience
   - Easy to override for testing or custom implementations

### Container App Refactoring

Extracted complex App.tsx logic into focused hooks:
- `useBaseUrlRedirect` - Single responsibility: handle redirects
- `useThemeManagement` - Single responsibility: manage themes
- `useMFEMounting` - Single responsibility: manage MFE lifecycle

### Bug Fixes

**WindowEventBus Memory Leak (January 2026)**
- **Issue**: Event listeners were wrapped but cleanup used original handlers
- **Fix**: Added WeakMap to track handler-to-listener mappings
- **Impact**: Proper cleanup now prevents memory leaks across all MFEs

## Benefits Summary

### Maintainability
- Each module has a single, clear purpose
- Changes are localized to specific files
- Less code duplication

### Testability
- Interfaces enable easy mocking
- Pure utility functions are trivial to test
- Dependency injection supports isolated testing

### Extensibility
- Add new MFEs without modifying loader
- Add new routes without modifying App
- Swap auth providers without changing components
- Create theme variations without modifying base theme

### Type Safety
- TypeScript interfaces ensure contracts are met
- Generic data structures replaced with typed ones
- Compile-time errors catch integration issues

## Migration Guide

### Using the New Validation Utilities

```typescript
// Old way
if (password.length < 8) {
  setError('Password must be at least 8 characters long');
}

// New way
const result = validatePassword(password);
if (!result.isValid) {
  setError(result.error);
}
```

### Using Multi-Step Forms

```typescript
// In your component
const { activeStep, nextStep, previousStep, goToStep } = useMultiStepForm(3);

// Navigate through steps
<Button onClick={nextStep}>Next</Button>
<Button onClick={previousStep}>Back</Button>
```

### Adding a New MFE

```typescript
// 1. Add to mfeRegistry.ts
export const mfeRegistry: Record<string, MFEConfig> = {
  // ... existing MFEs
  myNewMFE: {
    name: 'My New MFE',
    loadComponent: () => import('./MyNewMFEPlaceholder'),
    description: 'Description of my new MFE',
  },
};

// 2. That's it! MFELoader automatically handles it
<MFELoader mfeName="myNewMFE" />
```

### Creating a Custom Auth Provider

```typescript
// 1. Implement IAuthService
class CustomAuthService implements IAuthService {
  async signIn(username: string, password: string): Promise<void> {
    // Your custom implementation
  }
  // ... implement all interface methods
}

// 2. Use it
const customAuthService = new CustomAuthService();
<AuthProvider authService={customAuthService}>
  {children}
</AuthProvider>
```

## Testing Improvements

### Mocking Made Easy

```typescript
// Mock auth service for testing
const mockAuthService: IAuthService = {
  signIn: jest.fn(),
  signOut: jest.fn(),
  getCurrentUser: jest.fn().mockResolvedValue(mockUser),
  // ... other methods
};

// Use in tests
render(
  <AuthProvider authService={mockAuthService}>
    <MyComponent />
  </AuthProvider>
);
```

### Testing Validation

```typescript
import { validatePassword } from '../utils/validation';

describe('validatePassword', () => {
  it('should reject passwords shorter than 8 characters', () => {
    const result = validatePassword('short');
    expect(result.isValid).toBe(false);
    expect(result.error).toBeDefined();
  });
});
```

## Best Practices

1. **Always depend on abstractions (interfaces)**, not concrete implementations
2. **Keep functions and classes focused** on a single responsibility
3. **Prefer composition over inheritance**
4. **Use configuration over hard-coded values** for extensibility
5. **Centralize cross-cutting concerns** (validation, error handling, logging)
6. **Make dependencies explicit** through function parameters or constructor injection
7. **Write testable code** by avoiding tight coupling

## Future Improvements

1. **Route Guards**: Extract ProtectedRoute logic into a configurable guard system
2. **Form Builders**: Create declarative form builders using the validation utilities
3. **State Management**: Consider more sophisticated state management for complex flows
4. **Logging Service**: Create an interface for logging to support different logging backends
5. **Configuration Service**: Centralize all configuration with environment-specific overrides

## Conclusion

This refactoring demonstrates how SOLID principles lead to more maintainable, testable, and extensible code. The patterns established here can be applied to new features and extended as the application grows.

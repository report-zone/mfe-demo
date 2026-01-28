# Shared Hooks Guide

A comprehensive guide for creating and using hooks that can be shared across multiple Micro Frontends (MFEs) in this project.

## Table of Contents

- [Overview](#overview)
- [Current Architecture](#current-architecture)
- [Approaches for Sharing Hooks](#approaches-for-sharing-hooks)
- [Creating a Shared Hook Package](#creating-a-shared-hook-package)
- [Using Shared Hooks in MFEs](#using-shared-hooks-in-mfes)
- [Cross-MFE Communication](#cross-mfe-communication)
- [Testing Shared Hooks](#testing-shared-hooks)
- [Best Practices](#best-practices)
- [Troubleshooting](#troubleshooting)
- [Examples](#examples)

## Overview

In a micro frontend architecture, sharing code between independent applications requires careful planning. This guide demonstrates how to create reusable hooks that can be shared across multiple MFEs while maintaining their independence.

### When to Share Hooks

Share hooks when:
- Multiple MFEs need the same functionality
- The logic is stable and unlikely to change frequently
- You want to maintain consistency across MFEs
- The hook doesn't create tight coupling between MFEs

Don't share hooks when:
- The logic is MFE-specific
- Different MFEs need different variations
- The hook would create unwanted dependencies

## Current Architecture

This project currently uses **code duplication** as the sharing strategy:

```
apps/
├── container/src/i18n/
│   ├── I18nContext.tsx    # Duplicated code
│   ├── index.ts           # Duplicated code
│   └── config.ts          # Duplicated code
├── home/src/i18n/
│   ├── I18nContext.tsx    # Duplicated code
│   └── ...
├── account/src/i18n/
│   ├── I18nContext.tsx    # Duplicated code
│   └── ...
└── admin/src/i18n/
    ├── I18nContext.tsx    # Duplicated code
    └── ...
```

### How Current Hooks Communicate

The existing hooks use two mechanisms for cross-MFE communication:

1. **localStorage** - For persisting and sharing state
2. **CustomEvents** - For real-time synchronization

Example from `I18nContext.tsx`:
```typescript
// Broadcasting changes
window.dispatchEvent(
  new CustomEvent('languageChanged', {
    detail: { language: newLanguage },
  })
);

// Listening for changes
window.addEventListener('languageChanged', handleLanguageChange);
```

## Approaches for Sharing Hooks

### Approach 1: Shared Package (Recommended)

Create a shared package in the monorepo that all MFEs can depend on.

**Pros:**
- Single source of truth
- Easy to maintain and update
- Type-safe with TypeScript
- Works well with Yarn workspaces

**Cons:**
- Requires rebuild/reinstall when changed
- Creates dependency between MFEs and package

### Approach 2: Code Duplication (Current)

Copy the hook code into each MFE that needs it.

**Pros:**
- Complete independence between MFEs
- No shared dependencies
- Can customize per MFE if needed

**Cons:**
- Code duplication
- Hard to maintain consistency
- Bug fixes must be applied to all copies

### Approach 3: Runtime Sharing

Share hooks at runtime through import maps or module federation.

**Pros:**
- Dynamic loading
- Can update without rebuilding consumers

**Cons:**
- More complex setup
- Harder to debug
- Requires additional infrastructure

## Creating a Shared Hook Package

### Step 1: Create Package Structure

```bash
# Create the package directory
mkdir -p packages/shared-hooks

# Navigate to the package
cd packages/shared-hooks
```

### Step 2: Initialize Package

Create `packages/shared-hooks/package.json`:

```json
{
  "name": "@mfe-demo/shared-hooks",
  "version": "1.0.0",
  "private": true,
  "type": "module",
  "main": "./dist/index.js",
  "module": "./dist/index.js",
  "types": "./dist/index.d.ts",
  "exports": {
    ".": {
      "import": "./dist/index.js",
      "types": "./dist/index.d.ts"
    }
  },
  "scripts": {
    "build": "tsc",
    "dev": "tsc --watch",
    "test": "vitest"
  },
  "peerDependencies": {
    "react": "^18.3.1",
    "react-dom": "^18.3.1"
  },
  "devDependencies": {
    "@types/react": "^18.2.48",
    "@types/react-dom": "^18.2.18",
    "typescript": "^5.3.3",
    "vitest": "^1.2.0"
  }
}
```

### Step 3: Configure TypeScript

Create `packages/shared-hooks/tsconfig.json`:

```json
{
  "extends": "../../tsconfig.json",
  "compilerOptions": {
    "outDir": "./dist",
    "rootDir": "./src",
    "declaration": true,
    "declarationMap": true,
    "jsx": "react-jsx"
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist", "**/*.test.ts", "**/*.test.tsx"]
}
```

### Step 4: Create Source Structure

```bash
# Create source directory
mkdir -p packages/shared-hooks/src
```

### Step 5: Create a Shared Hook

Create `packages/shared-hooks/src/useLocalStorage.ts`:

```typescript
import { useState, useEffect, useCallback } from 'react';

/**
 * A hook for syncing state with localStorage across MFEs
 * 
 * @param key - The localStorage key
 * @param initialValue - Initial value if key doesn't exist
 * @param broadcastEvent - Optional event name to broadcast changes
 * @returns [value, setValue] tuple
 */
export function useLocalStorage<T>(
  key: string,
  initialValue: T,
  broadcastEvent?: string
): [T, (value: T | ((prev: T) => T)) => void] {
  // Get initial value from localStorage
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  });

  // Update localStorage and broadcast changes
  const setValue = useCallback(
    (value: T | ((prev: T) => T)) => {
      try {
        // Allow value to be a function for functional updates
        const valueToStore = value instanceof Function ? value(storedValue) : value;
        
        // Save state
        setStoredValue(valueToStore);
        
        // Save to localStorage
        window.localStorage.setItem(key, JSON.stringify(valueToStore));
        
        // Broadcast change to other MFEs if event name provided
        if (broadcastEvent) {
          window.dispatchEvent(
            new CustomEvent(broadcastEvent, {
              detail: { value: valueToStore },
            })
          );
        }
      } catch (error) {
        console.error(`Error setting localStorage key "${key}":`, error);
      }
    },
    [key, storedValue, broadcastEvent]
  );

  // Listen for changes from other MFEs
  useEffect(() => {
    if (!broadcastEvent) return;

    const handleStorageChange = (event: Event) => {
      const customEvent = event as CustomEvent<{ value: T }>;
      if (customEvent.detail?.value !== undefined) {
        setStoredValue(customEvent.detail.value);
      }
    };

    window.addEventListener(broadcastEvent, handleStorageChange);
    
    return () => {
      window.removeEventListener(broadcastEvent, handleStorageChange);
    };
  }, [broadcastEvent]);

  return [storedValue, setValue];
}
```

### Step 6: Create Hook with Context Pattern

Create `packages/shared-hooks/src/useSharedState.tsx`:

```typescript
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

/**
 * Generic shared state hook that syncs across MFEs via CustomEvents
 * 
 * Usage:
 * 1. Create a context provider in your shared package
 * 2. Use the hook in any MFE that needs the shared state
 * 3. State changes broadcast to all MFEs via CustomEvents
 */

interface SharedStateContextValue<T> {
  state: T;
  setState: (value: T | ((prev: T) => T)) => void;
}

export function createSharedStateHook<T>(
  eventName: string,
  initialValue: T
) {
  const Context = createContext<SharedStateContextValue<T> | undefined>(undefined);

  const Provider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [state, setStateInternal] = useState<T>(initialValue);

    const setState = (value: T | ((prev: T) => T)) => {
      setStateInternal((prevState) => {
        const newState = value instanceof Function ? value(prevState) : value;
        
        // Broadcast change to other MFEs
        window.dispatchEvent(
          new CustomEvent(eventName, {
            detail: { state: newState },
          })
        );
        
        return newState;
      });
    };

    // Listen for changes from other MFEs
    useEffect(() => {
      const handleStateChange = (event: Event) => {
        const customEvent = event as CustomEvent<{ state: T }>;
        if (customEvent.detail?.state !== undefined) {
          setStateInternal(customEvent.detail.state);
        }
      };

      window.addEventListener(eventName, handleStateChange);
      
      return () => {
        window.removeEventListener(eventName, handleStateChange);
      };
    }, []);

    return (
      <Context.Provider value={{ state, setState }}>
        {children}
      </Context.Provider>
    );
  };

  const useSharedState = (): SharedStateContextValue<T> => {
    const context = useContext(Context);
    if (!context) {
      throw new Error(
        `useSharedState must be used within a Provider for event "${eventName}"`
      );
    }
    return context;
  };

  return { Provider, useSharedState };
}
```

### Step 7: Export All Hooks

Create `packages/shared-hooks/src/index.ts`:

```typescript
export { useLocalStorage } from './useLocalStorage';
export { createSharedStateHook } from './useSharedState';

// Export specific shared state hooks
export { LanguageProvider, useLanguage } from './language';
export { ThemeProvider, useTheme } from './theme';
```

### Step 8: Build the Package

```bash
# Build from root
yarn workspace @mfe-demo/shared-hooks build

# Or in watch mode during development
yarn workspace @mfe-demo/shared-hooks dev
```

## Using Shared Hooks in MFEs

### Step 1: Add Package Dependency

Update the MFE's `package.json`:

```json
{
  "dependencies": {
    "@mfe-demo/shared-hooks": "1.0.0",
    // ... other dependencies
  }
}
```

### Step 2: Install Dependencies

```bash
# From root directory
yarn install
```

### Step 3: Import and Use the Hook

In your MFE component:

```typescript
import { useLocalStorage } from '@mfe-demo/shared-hooks';

function MyComponent() {
  const [language, setLanguage] = useLocalStorage(
    'selectedLanguage',
    'en',
    'languageChanged' // Broadcast event name
  );

  return (
    <div>
      <p>Current language: {language}</p>
      <button onClick={() => setLanguage('fr')}>
        Switch to French
      </button>
    </div>
  );
}
```

### Step 4: Wrap with Context Provider (if needed)

If using context-based hooks:

```typescript
import { LanguageProvider } from '@mfe-demo/shared-hooks';

// In your app root
function App() {
  return (
    <LanguageProvider>
      <MyComponent />
    </LanguageProvider>
  );
}
```

## Cross-MFE Communication

Shared hooks enable communication between MFEs through two mechanisms:

### 1. localStorage

Used for:
- Persisting data across sessions
- Sharing configuration
- Syncing state across page reloads

```typescript
// MFE 1: Set value
localStorage.setItem('theme', 'dark');

// MFE 2: Read value
const theme = localStorage.getItem('theme');
```

### 2. CustomEvents (window.dispatchEvent)

Used for:
- Real-time synchronization
- Broadcasting state changes
- Event-driven updates

```typescript
// MFE 1: Dispatch event
window.dispatchEvent(
  new CustomEvent('themeChanged', {
    detail: { theme: 'dark' }
  })
);

// MFE 2: Listen for event
window.addEventListener('themeChanged', (event) => {
  const { theme } = event.detail;
  // Update local state
});
```

### Communication Flow Example

```
┌─────────────┐         CustomEvent          ┌─────────────┐
│   Home MFE  │ ─────────────────────────────>│ Account MFE │
│             │    "languageChanged"          │             │
│ setLanguage │                               │ receives &  │
│   ('fr')    │         localStorage          │  updates UI │
│             │ ─────────────────────────────>│             │
└─────────────┘     key: selectedLanguage     └─────────────┘
      │                                              ^
      │                                              │
      └──────────────────────────────────────────────┘
              Both MFEs stay synchronized
```

## Testing Shared Hooks

### Unit Testing

Create `packages/shared-hooks/src/__tests__/useLocalStorage.test.ts`:

```typescript
import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useLocalStorage } from '../useLocalStorage';

describe('useLocalStorage', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  it('should initialize with initial value', () => {
    const { result } = renderHook(() => 
      useLocalStorage('test-key', 'initial')
    );
    
    expect(result.current[0]).toBe('initial');
  });

  it('should update localStorage when value changes', () => {
    const { result } = renderHook(() => 
      useLocalStorage('test-key', 'initial')
    );
    
    act(() => {
      result.current[1]('updated');
    });
    
    expect(localStorage.getItem('test-key')).toBe('"updated"');
    expect(result.current[0]).toBe('updated');
  });

  it('should broadcast changes when event name provided', () => {
    const dispatchEventSpy = vi.spyOn(window, 'dispatchEvent');
    
    const { result } = renderHook(() => 
      useLocalStorage('test-key', 'initial', 'testEvent')
    );
    
    act(() => {
      result.current[1]('updated');
    });
    
    expect(dispatchEventSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'testEvent',
        detail: { value: 'updated' }
      })
    );
  });

  it('should sync with changes from other MFEs', () => {
    const { result } = renderHook(() => 
      useLocalStorage('test-key', 'initial', 'testEvent')
    );
    
    // Simulate event from another MFE
    act(() => {
      window.dispatchEvent(
        new CustomEvent('testEvent', {
          detail: { value: 'from-other-mfe' }
        })
      );
    });
    
    expect(result.current[0]).toBe('from-other-mfe');
  });
});
```

### Integration Testing

Test that hooks work correctly when used in multiple MFEs:

```typescript
import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { useLocalStorage } from '@mfe-demo/shared-hooks';

// Simulate two MFEs
function MFE1() {
  const [value, setValue] = useLocalStorage('shared', 'initial', 'sharedEvent');
  return (
    <div>
      <span data-testid="mfe1-value">{value}</span>
      <button onClick={() => setValue('from-mfe1')}>Update</button>
    </div>
  );
}

function MFE2() {
  const [value] = useLocalStorage('shared', 'initial', 'sharedEvent');
  return <span data-testid="mfe2-value">{value}</span>;
}

describe('Cross-MFE synchronization', () => {
  it('should sync state between MFEs', () => {
    render(
      <div>
        <MFE1 />
        <MFE2 />
      </div>
    );
    
    // Both should show initial value
    expect(screen.getByTestId('mfe1-value')).toHaveTextContent('initial');
    expect(screen.getByTestId('mfe2-value')).toHaveTextContent('initial');
    
    // Update in MFE1
    fireEvent.click(screen.getByText('Update'));
    
    // Both should update
    expect(screen.getByTestId('mfe1-value')).toHaveTextContent('from-mfe1');
    expect(screen.getByTestId('mfe2-value')).toHaveTextContent('from-mfe1');
  });
});
```

### Running Tests

```bash
# Test shared hooks package
yarn workspace @mfe-demo/shared-hooks test

# Test specific MFE with shared hooks
yarn workspace @mfe-demo/home test
```

## Best Practices

### 1. Design for Independence

Each MFE should work independently even if shared hooks fail:

```typescript
function MyComponent() {
  const [language, setLanguage] = useLocalStorage('lang', 'en', 'langChanged');
  
  // Fallback if hook fails
  const safeLang = language || 'en';
  
  return <div>{safeLang}</div>;
}
```

### 2. Use TypeScript for Type Safety

Define clear interfaces for shared state:

```typescript
interface Theme {
  mode: 'light' | 'dark';
  primaryColor: string;
}

const [theme, setTheme] = useLocalStorage<Theme>(
  'theme',
  { mode: 'light', primaryColor: '#1976d2' },
  'themeChanged'
);
```

### 3. Document Event Names

Maintain a registry of all CustomEvent names to avoid conflicts:

```typescript
// packages/shared-hooks/src/events.ts
export const EVENTS = {
  LANGUAGE_CHANGED: 'languageChanged',
  THEME_CHANGED: 'themeChanged',
  USER_LOGGED_OUT: 'userLoggedOut',
} as const;
```

### 4. Handle Errors Gracefully

```typescript
export function useLocalStorage<T>(key: string, initialValue: T) {
  const [value, setValue] = useState<T>(() => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(`Failed to load ${key}:`, error);
      return initialValue; // Fallback to initial value
    }
  });
  
  // ... rest of implementation
}
```

### 5. Clean Up Event Listeners

Always clean up event listeners to prevent memory leaks:

```typescript
useEffect(() => {
  const handler = (event: Event) => {
    // Handle event
  };
  
  window.addEventListener('myEvent', handler);
  
  return () => {
    window.removeEventListener('myEvent', handler); // Clean up
  };
}, []);
```

### 6. Version Your Shared Packages

Use semantic versioning for shared packages:

```json
{
  "name": "@mfe-demo/shared-hooks",
  "version": "1.2.0"
}
```

### 7. Keep Hooks Focused

Each hook should have a single responsibility:

```typescript
// Good: Single purpose
export function useLanguage() { /* ... */ }
export function useTheme() { /* ... */ }

// Bad: Too many responsibilities
export function useAppState() { /* handles language, theme, auth, etc. */ }
```

## Troubleshooting

### Issue: Hook Changes Don't Appear in MFEs

**Problem**: Updated shared hook but MFEs still use old version.

**Solution**:
```bash
# Rebuild shared package
yarn workspace @mfe-demo/shared-hooks build

# Reinstall in MFEs
yarn install

# Clear cache and restart dev server
rm -rf node_modules/.vite
yarn dev
```

### Issue: Type Errors After Hook Updates

**Problem**: TypeScript errors after updating shared hooks.

**Solution**:
```bash
# Rebuild with declarations
yarn workspace @mfe-demo/shared-hooks build

# Restart TypeScript server in your IDE
# VS Code: Cmd/Ctrl + Shift + P -> "TypeScript: Restart TS Server"
```

### Issue: Events Not Syncing Between MFEs

**Problem**: State changes in one MFE don't update others.

**Solution**:
- Check that event names match exactly
- Verify both MFEs are using the same event name
- Check browser console for errors
- Ensure event listeners are properly registered

```typescript
// Debug logging
useEffect(() => {
  const handler = (event: Event) => {
    console.log('Event received:', event.type, event.detail);
    // Handle event
  };
  
  window.addEventListener('myEvent', handler);
  console.log('Listener registered for myEvent');
  
  return () => {
    window.removeEventListener('myEvent', handler);
    console.log('Listener removed for myEvent');
  };
}, []);
```

### Issue: localStorage Quota Exceeded

**Problem**: "QuotaExceededError: Failed to execute 'setItem' on 'Storage'"

**Solution**:
```typescript
export function useLocalStorage<T>(key: string, initialValue: T) {
  const setValue = (value: T) => {
    try {
      const serialized = JSON.stringify(value);
      
      // Check size before saving
      if (serialized.length > 5000000) { // ~5MB limit
        console.warn('Value too large for localStorage');
        return;
      }
      
      localStorage.setItem(key, serialized);
    } catch (error) {
      if (error instanceof DOMException && error.name === 'QuotaExceededError') {
        console.error('localStorage quota exceeded');
        // Clear old data or use different storage
      }
    }
  };
  
  // ...
}
```

### Issue: Stale Closures in Event Handlers

**Problem**: Event handlers capture old values.

**Solution**: Use refs or ensure dependencies are correct:

```typescript
const [value, setValue] = useState('initial');
const valueRef = useRef(value);

useEffect(() => {
  valueRef.current = value;
}, [value]);

useEffect(() => {
  const handler = (event: Event) => {
    // Use ref to get current value
    console.log('Current value:', valueRef.current);
  };
  
  window.addEventListener('myEvent', handler);
  return () => window.removeEventListener('myEvent', handler);
}, []); // Empty deps - handler uses ref for current value
```

## Examples

### Example 1: Shared Language Hook

Complete example of a language hook shared across MFEs:

**packages/shared-hooks/src/language.tsx**
```typescript
import { createSharedStateHook } from './useSharedState';

export type Language = 'en' | 'fr' | 'de' | 'zh' | 'es' | 'ja';

const { Provider, useSharedState } = createSharedStateHook<Language>(
  'languageChanged',
  'en'
);

export const LanguageProvider = Provider;
export const useLanguage = useSharedState;
```

**Usage in Container MFE:**
```typescript
import { LanguageProvider } from '@mfe-demo/shared-hooks';

function App() {
  return (
    <LanguageProvider>
      <Router>
        {/* Your app */}
      </Router>
    </LanguageProvider>
  );
}
```

**Usage in Home MFE:**
```typescript
import { useLanguage, LanguageProvider } from '@mfe-demo/shared-hooks';

function HomeApp() {
  const { state: language, setState: setLanguage } = useLanguage();
  
  return (
    <div>
      <p>Current: {language}</p>
      <button onClick={() => setLanguage('fr')}>French</button>
    </div>
  );
}

// Wrap in provider
export default function Home() {
  return (
    <LanguageProvider>
      <HomeApp />
    </LanguageProvider>
  );
}
```

### Example 2: Shared Theme Hook

**packages/shared-hooks/src/theme.tsx**
```typescript
import { useLocalStorage } from './useLocalStorage';

export interface Theme {
  mode: 'light' | 'dark';
  primaryColor: string;
  secondaryColor: string;
}

const defaultTheme: Theme = {
  mode: 'light',
  primaryColor: '#1976d2',
  secondaryColor: '#dc004e',
};

export function useTheme() {
  const [theme, setTheme] = useLocalStorage<Theme>(
    'app-theme',
    defaultTheme,
    'themeChanged'
  );
  
  const toggleMode = () => {
    setTheme((prev) => ({
      ...prev,
      mode: prev.mode === 'light' ? 'dark' : 'light',
    }));
  };
  
  return { theme, setTheme, toggleMode };
}
```

**Usage:**
```typescript
import { useTheme } from '@mfe-demo/shared-hooks';
import { ThemeProvider, createTheme } from '@mui/material';

function App() {
  const { theme, toggleMode } = useTheme();
  
  const muiTheme = createTheme({
    palette: {
      mode: theme.mode,
      primary: { main: theme.primaryColor },
      secondary: { main: theme.secondaryColor },
    },
  });
  
  return (
    <ThemeProvider theme={muiTheme}>
      <button onClick={toggleMode}>
        Toggle {theme.mode === 'light' ? 'Dark' : 'Light'} Mode
      </button>
      {/* Your app */}
    </ThemeProvider>
  );
}
```

### Example 3: Shared Authentication State

**packages/shared-hooks/src/auth.tsx**
```typescript
import { createSharedStateHook } from './useSharedState';
import { useEffect } from 'react';

interface AuthState {
  isAuthenticated: boolean;
  user: { username: string; email: string } | null;
}

const { Provider, useSharedState } = createSharedStateHook<AuthState>(
  'authStateChanged',
  { isAuthenticated: false, user: null }
);

export const AuthProvider = Provider;

export function useAuth() {
  const { state, setState } = useSharedState();
  
  // Persist to localStorage
  useEffect(() => {
    localStorage.setItem('authState', JSON.stringify(state));
  }, [state]);
  
  const login = (username: string, email: string) => {
    setState({
      isAuthenticated: true,
      user: { username, email },
    });
  };
  
  const logout = () => {
    setState({
      isAuthenticated: false,
      user: null,
    });
  };
  
  return { ...state, login, logout };
}
```

### Example 4: Debounced Shared State

For performance-critical shared state:

**packages/shared-hooks/src/useDebouncedSharedState.ts**
```typescript
import { useState, useEffect, useCallback } from 'react';
import { useLocalStorage } from './useLocalStorage';

export function useDebouncedSharedState<T>(
  key: string,
  initialValue: T,
  eventName: string,
  delay: number = 300
) {
  const [storedValue, setStoredValue] = useLocalStorage<T>(
    key,
    initialValue,
    eventName
  );
  const [localValue, setLocalValue] = useState<T>(storedValue);

  // Debounce updates to shared state
  useEffect(() => {
    const timer = setTimeout(() => {
      if (localValue !== storedValue) {
        setStoredValue(localValue);
      }
    }, delay);

    return () => clearTimeout(timer);
  }, [localValue, delay, storedValue, setStoredValue]);

  return [localValue, setLocalValue] as const;
}
```

## Migration Guide

### Migrating Existing Duplicated Hooks

If you have duplicated hooks across MFEs (like the current I18n implementation):

1. **Create the shared package** following steps above
2. **Extract common code** into the shared package
3. **Update one MFE at a time** to use the shared version
4. **Test thoroughly** before migrating next MFE
5. **Remove duplicated code** after successful migration

**Before (Duplicated):**
```
apps/home/src/i18n/I18nContext.tsx
apps/account/src/i18n/I18nContext.tsx
apps/admin/src/i18n/I18nContext.tsx
```

**After (Shared):**
```
packages/shared-hooks/src/i18n/I18nContext.tsx  (shared)
apps/home/src/App.tsx (imports from shared)
apps/account/src/App.tsx (imports from shared)
apps/admin/src/App.tsx (imports from shared)
```

## Summary

Creating shared hooks for MFEs requires:

1. **Proper package structure** - Use Yarn workspaces
2. **Clear communication patterns** - CustomEvents + localStorage
3. **Type safety** - TypeScript interfaces and types
4. **Independence** - MFEs should work without shared hooks
5. **Testing** - Unit and integration tests
6. **Documentation** - Clear usage examples and patterns

By following this guide, you can create maintainable, reusable hooks that work seamlessly across all your micro frontends while maintaining their independence and flexibility.

## Related Documentation

- [Developer Guide](./DEVELOPER.md) - General development guidelines
- [Testing Guide](./TESTING.md) - Testing strategies
- [Architecture Guide](./SOLID_PRINCIPLES.md) - Architecture principles
- [Troubleshooting](./TROUBLESHOOTING.md) - Common issues

## Additional Resources

- [React Hooks Documentation](https://react.dev/reference/react)
- [Yarn Workspaces](https://classic.yarnpkg.com/en/docs/workspaces/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/intro.html)
- [CustomEvents API](https://developer.mozilla.org/en-US/docs/Web/API/CustomEvent)

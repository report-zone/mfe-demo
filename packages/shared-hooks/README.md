# @mfe-demo/shared-hooks

Shared hooks and utilities package for the MFE Demo monorepo.

## Overview

This package provides shared functionality used across all Micro Frontend (MFE) applications in the monorepo, including:

- **I18n System**: Internationalization with cross-MFE synchronization
- **Service Abstractions**: localStorage and event bus interfaces
- **Reusable Hooks**: Generic hooks for state management

## Installation

This package is automatically installed when you run `yarn install` from the monorepo root.

```bash
# From monorepo root
yarn install
```

## Usage

Import from the package in any MFE:

```typescript
import { 
  useI18n, 
  I18nProvider,
  localStorageService,
  windowEventBus 
} from '@mfe-demo/shared-hooks';
```

## Available Exports

### Services

- `LocalStorageService` - Class for localStorage operations
- `localStorageService` - Singleton instance
- `WindowEventBus` - Class for cross-MFE event communication
- `windowEventBus` - Singleton instance
- `IStorageService` - Interface for storage abstraction
- `IEventBus` - Interface for event bus abstraction

### I18n

- `I18n` - Core translation class
- `I18nProvider` - React provider component
- `useI18n` - React hook for translations
- `Language` - Type definition (`'en' | 'fr' | 'de' | 'zh' | 'es' | 'ja'`)
- `Translations` - Type definition for translation objects
- `I18nConfig` - Type definition for i18n configuration

### Hooks

- `useLocalStorage<T>` - Hook for syncing state with localStorage across MFEs
- `createSharedStateHook<T>` - Utility for creating custom shared state hooks

## Examples

### Using I18n

```typescript
import { useI18n } from '@mfe-demo/shared-hooks';

function MyComponent() {
  const { t, language, setLanguage } = useI18n();
  
  return (
    <div>
      <h1>{t('mykey.title')}</h1>
      <button onClick={() => setLanguage('fr')}>
        Switch to French
      </button>
    </div>
  );
}
```

### Using localStorage Hook

```typescript
import { useLocalStorage } from '@mfe-demo/shared-hooks';

function MyComponent() {
  const [theme, setTheme] = useLocalStorage(
    'selectedTheme',
    'light',
    'themeChanged' // Event name for cross-MFE sync
  );
  
  return (
    <button onClick={() => setTheme('dark')}>
      Current theme: {theme}
    </button>
  );
}
```

### Using Services

```typescript
import { localStorageService, windowEventBus } from '@mfe-demo/shared-hooks';

// Use storage service
localStorageService.setItem('key', 'value');
const value = localStorageService.getItem('key');

// Use event bus
windowEventBus.dispatch('myEvent', { data: 'hello' });
windowEventBus.subscribe('myEvent', (detail) => {
  console.log(detail);
});
```

## Development

### Building

```bash
# Build the package
yarn workspace @mfe-demo/shared-hooks build

# Watch mode for development
yarn workspace @mfe-demo/shared-hooks dev
```

### Testing

```bash
# Run tests
yarn workspace @mfe-demo/shared-hooks test

# Watch mode
yarn workspace @mfe-demo/shared-hooks test:watch
```

## Architecture

This package uses:

- **TypeScript** for type safety
- **React** for UI hooks and context
- **CustomEvents** for cross-MFE communication
- **localStorage** for persistent state

## Documentation

For detailed documentation, see [SHARED_HOOKS_GUIDE.md](../../SHARED_HOOKS_GUIDE.md) in the monorepo root.

## License

Private package for the MFE Demo project.

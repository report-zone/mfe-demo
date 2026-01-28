# Theme Application Fix - Summary

## Problem Statement
When selecting a different theme in Preferences, the theme was only applied to the Preferences content and the container. It was NOT applied to Admin, Account, and Home MFEs.

**Key Issue**: This worked in "yarn dev" but NOT in "yarn prod:local" and deployed production.

## Root Cause
The MFEs (home, admin, account, preferences) exported components without theme management capabilities:
1. They used a static theme defined in `main.tsx`
2. They didn't listen for theme change events
3. They didn't load the selected theme from localStorage on mount
4. In production builds, MFEs are loaded as separate ES modules and don't inherit the container's theme properly

## Solution Overview
Implemented a comprehensive theme synchronization system that works consistently in both development and production modes:

1. **Created shared `useThemeSync` hook** - A generic hook that all MFEs can use to sync their themes
2. **Added ThemeConverter to each MFE** - Enables each MFE to convert theme configs independently
3. **Updated all MFE exports** - Wrapped with ThemeProvider using the synced theme
4. **Material UI v7 Upgrade** - Unified all packages to use MUI v7.3.7 for consistency

## Technical Changes

### 1. Material UI v7 Upgrade
Updated all packages to use Material UI v7.3.7:
- `packages/shared-hooks/package.json` - Updated from v6.1.6 to v7.3.7
- All apps already used v7.3.7

### 2. Shared Theme Sync Hook
Created `packages/shared-hooks/src/hooks/useThemeSync.ts`:
```typescript
export function useThemeSync<T>(
  defaultTheme: T,
  storageService: IStorageService,
  eventBus: IEventBus,
  convertToTheme: (themeConfig: unknown) => T
): T
```

**Features**:
- Loads theme from localStorage on mount
- Listens for 'themeChanged' events
- Generic - works with any theme type
- Framework agnostic - can be adapted for other UI libraries

### 3. ThemeConverter Utility
Copied `ThemeConverter.ts` from container to each MFE:
- `apps/home/src/utils/ThemeConverter.ts`
- `apps/admin/src/utils/ThemeConverter.ts`
- `apps/account/src/utils/ThemeConverter.ts`
- `apps/preferences/src/utils/ThemeConverter.ts`

This maintains MFE independence - each MFE can convert themes without depending on the container.

### 4. Updated MFE Main Files
Modified all MFE `main.tsx` files to:
```typescript
const HomeMFE: React.FC = () => {
  const convertToTheme = useCallback((themeConfig: unknown): Theme => {
    return ThemeConverter.convertToTheme(themeConfig);
  }, []);
  
  const theme = useThemeSync(defaultTheme, localStorageService, windowEventBus, convertToTheme);
  
  return (
    <ThemeProvider theme={theme}>
      <I18nProvider config={i18nConfig}>
        <App />
      </I18nProvider>
    </ThemeProvider>
  );
};
```

## How It Works

### Initial Load (Production Mode)
1. MFE component mounts
2. `useThemeSync` hook reads `selectedThemeId` from localStorage
3. Loads theme config from `customThemes` in localStorage
4. Converts theme config to MUI Theme using ThemeConverter
5. Applies theme via ThemeProvider

### Theme Change Flow
1. User selects new theme in Preferences
2. Preferences MFE saves theme to localStorage
3. Preferences dispatches 'themeChanged' event with theme config
4. All MFEs (Home, Admin, Account, Preferences) receive the event
5. Each MFE converts the theme config and updates its ThemeProvider
6. UI updates immediately across all MFEs

### Why It Works in Dev but Not Prod
**Development Mode**:
- MFEs loaded via module aliases
- Hot module replacement enabled
- Single React context tree
- Theme changes propagate naturally

**Production Mode (Before Fix)**:
- MFEs loaded as separate ES modules
- Each MFE has its own React context
- Static themes defined at build time
- No mechanism to sync theme changes

**Production Mode (After Fix)**:
- MFEs still load as separate modules
- Each has its own ThemeProvider
- Themes sync via localStorage + events
- Works identically to dev mode

## Testing

### Unit Tests
Created `apps/home/src/__tests__/themeSync.test.tsx`:
- ✅ Returns default theme when no theme in storage
- ✅ Loads theme from storage on mount
- ✅ Subscribes to theme change events
- ✅ Updates theme when themeChanged event is dispatched

All tests pass: **4/4 tests**

### Integration Test
Created `test-theme-sync.js`:
- ✅ Simulates theme selection in Preferences
- ✅ Verifies theme loads in MFE on mount
- ✅ Simulates theme change event
- ✅ Verifies event received by MFEs

**Result**: All integration tests passed ✓

### Build Verification
```bash
yarn build
```
**Result**: All apps built successfully ✓
- Container: ✓
- Home: ✓ (242.98 kB)
- Preferences: ✓ (949.19 kB)
- Account: ✓ (506.84 kB)
- Admin: ✓ (316.83 kB)

## Files Changed
1. `packages/shared-hooks/package.json` - MUI v7 upgrade
2. `packages/shared-hooks/src/index.ts` - Export useThemeSync
3. `packages/shared-hooks/src/hooks/useThemeSync.ts` - New hook
4. `apps/home/src/main.tsx` - Theme sync integration
5. `apps/home/src/utils/ThemeConverter.ts` - Theme converter
6. `apps/admin/src/main.tsx` - Theme sync integration
7. `apps/admin/src/utils/ThemeConverter.ts` - Theme converter
8. `apps/account/src/main.tsx` - Theme sync integration
9. `apps/account/src/utils/ThemeConverter.ts` - Theme converter
10. `apps/preferences/src/main.tsx` - Theme sync integration
11. `apps/preferences/src/utils/ThemeConverter.ts` - Theme converter

## Benefits
1. **Consistency** - Themes work identically in dev and production
2. **Independence** - Each MFE manages its own theme
3. **Simplicity** - Clean, maintainable code
4. **Extensibility** - Easy to add new MFEs with theme support
5. **Performance** - No extra network requests, uses localStorage
6. **Real-time Updates** - Theme changes apply immediately

## Future Improvements
1. Consider creating a shared types package for theme definitions
2. Add theme validation to prevent invalid configs
3. Create theme migration utility for format changes
4. Add theme preloading for faster initial render
5. Consider SSR support if needed

## Security Considerations
- Theme configs stored in localStorage (browser storage)
- No sensitive data in themes
- Theme converter validates inputs
- Event system uses window events (same origin only)

## Backwards Compatibility
✅ Fully backwards compatible:
- Existing themes continue to work
- No changes to theme format
- Container theme management unchanged
- Only adds theme sync to MFEs

## Deployment Notes
1. Build all apps with `yarn build`
2. Deploy to S3/CDN as usual
3. No environment variable changes needed
4. No infrastructure changes required
5. Works with existing Cognito setup

## Verification Steps for QA
1. Start production build: `yarn prod:local`
2. Login to the application
3. Navigate to Preferences → Themes
4. Select "Dark" theme
5. **Verify**: All MFEs (Home, Admin, Account) update to dark theme
6. Select "Light" theme
7. **Verify**: All MFEs update to light theme
8. Create a custom theme
9. Apply custom theme
10. **Verify**: Custom theme applies to all MFEs
11. Refresh the browser
12. **Verify**: Selected theme persists after reload

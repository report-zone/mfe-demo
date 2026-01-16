# Dark Mode Test Guide

## Overview
This directory contains example theme files to test the dark mode palette fix in custom themes.

## Issue Fixed
Previously, when a custom theme was created with `palette.mode` set to "dark", the dark mode was not applied when the theme was selected in the container app. This was because the `ThemeConverter` in the container app was not reading and applying the `palette.mode` property from the theme configuration.

## Testing the Fix

### Prerequisites
1. Build and run the application:
   ```bash
   yarn install
   yarn build
   yarn dev
   ```

2. Navigate to the application at `http://localhost:5173` (or appropriate port)
3. Login with your credentials
4. Go to Preferences → Themes

### Manual Test Steps

#### Test 1: Load and Apply Dark Theme
1. Click "Load Custom Theme" button in the Themes tab
2. Select the `dark-theme-example.json` file from this directory
3. The theme should appear in the theme selection list
4. Select the dark theme
5. **Expected Result**: 
   - The entire application should switch to dark mode
   - Background should be dark (#121212)
   - Text should be light/white
   - All UI elements should respect the dark palette

#### Test 2: Load and Apply Light Theme
1. Click "Load Custom Theme" button in the Themes tab
2. Select the `light-theme-example.json` file from this directory
3. The theme should appear in the theme selection list
4. Select the light theme
5. **Expected Result**:
   - The entire application should switch to light mode
   - Background should be light/white
   - Text should be dark/black
   - All UI elements should respect the light palette

#### Test 3: Create Custom Dark Theme in Editor
1. Click "Create Custom Theme" button
2. Navigate to the "Background" tab
3. Change "Palette Mode" dropdown to "Dark"
4. Optionally adjust other colors to dark theme colors
5. Click "Save" to download the theme
6. Load the saved theme using "Load Custom Theme"
7. Select the theme
8. **Expected Result**: Dark mode should be applied

#### Test 4: Toggle Between Themes
1. Load both dark and light example themes
2. Switch between them using the theme selector
3. **Expected Result**: 
   - The application should smoothly transition between light and dark modes
   - No console errors
   - All UI elements should update properly

### Visual Verification Checklist

When dark mode is applied, verify:
- ✅ App bar background is dark
- ✅ Navigation drawer is dark
- ✅ Main content area background is dark
- ✅ Cards and papers have dark backgrounds
- ✅ Text is light colored and readable
- ✅ Buttons use the dark theme colors
- ✅ Form inputs have dark backgrounds

When light mode is applied, verify:
- ✅ App bar background is light
- ✅ Navigation drawer is light
- ✅ Main content area background is light
- ✅ Cards and papers have light backgrounds
- ✅ Text is dark colored and readable
- ✅ Buttons use the light theme colors
- ✅ Form inputs have light backgrounds

## Files in This Directory

- **dark-theme-example.json**: Example theme with `palette.mode: "dark"`
- **light-theme-example.json**: Example theme with `palette.mode: "light"`
- **themeFormat.json**: Legacy format theme (doesn't include palette.mode)

## Technical Details

### What Changed

1. **ThemeConverter.ts Interface Update**:
   ```typescript
   export interface CustomThemeDefinition {
     // ... other properties
     palette?: {
       mode?: 'light' | 'dark';
     };
     // ... rest of interface
   }
   ```

2. **ThemeConverter.ts Mode Application**:
   ```typescript
   static createThemeFromDefinition(config: CustomThemeDefinition): Theme {
     return createTheme({
       palette: {
         mode: config.palette?.mode || 'light',  // ← Added this line
         // ... rest of palette config
       },
       // ... rest of theme config
     });
   }
   ```

### Theme JSON Structure

The theme JSON format now supports the `palette` field:

```json
{
  "name": "Theme Name",
  "version": "1.0.0",
  "description": "Description",
  "palette": {
    "mode": "dark"  // ← This is now properly applied
  },
  "colors": {
    // ... color definitions
  },
  // ... rest of theme config
}
```

## Automated Tests

The fix includes comprehensive unit tests in:
- `apps/container/src/__tests__/ThemeConverter.test.ts`

Run tests with:
```bash
yarn test:unit:container
```

All 88 tests should pass, including 9 new tests specifically for the dark mode fix.

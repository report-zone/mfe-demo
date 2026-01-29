#!/usr/bin/env node

/**
 * MFE Generator Script
 *
 * This script creates a new Micro Frontend application with:
 * - Complete directory structure
 * - i18n support with translations for all 6 languages
 * - Theme support with ThemeConverter
 * - Shared hooks integration
 * - Vite and TypeScript configuration
 * - Testing setup with Vitest
 * - Proper routing integration
 *
 * Usage:
 *   node scripts/create-mfe.js <mfe-name>
 *   OR
 *   yarn create-mfe <mfe-name>
 *
 * Example:
 *   yarn create-mfe reports
 */

const fs = require('fs');
const path = require('path');

// Get MFE name from command line
const mfeName = process.argv[2];

if (!mfeName) {
  console.error('❌ Error: MFE name is required');
  console.log('Usage: node scripts/create-mfe.js <mfe-name>');
  console.log('Example: node scripts/create-mfe.js reports');
  process.exit(1);
}

// Validate MFE name (lowercase, alphanumeric with hyphens)
if (!/^[a-z][a-z0-9-]*$/.test(mfeName)) {
  console.error('❌ Error: MFE name must start with a lowercase letter and contain only lowercase letters, numbers, and hyphens');
  process.exit(1);
}

// Check if MFE already exists
const projectRoot = path.join(__dirname, '..');
const mfeDir = path.join(projectRoot, 'apps', mfeName);

if (fs.existsSync(mfeDir)) {
  console.error(`❌ Error: MFE "${mfeName}" already exists at ${mfeDir}`);
  process.exit(1);
}

// Helper functions
const capitalize = (str) => str.charAt(0).toUpperCase() + str.slice(1);
const pascalCase = (str) => str.split('-').map(capitalize).join('');
const camelCase = (str) => {
  const pascal = pascalCase(str);
  return pascal.charAt(0).toLowerCase() + pascal.slice(1);
};

const mfeNamePascal = pascalCase(mfeName);
const mfeNameCamel = camelCase(mfeName);

// Get the next available port by reading the mfeRegistry.ts file
const getNextAvailablePort = () => {
  const mfeRegistryPath = path.join(projectRoot, 'apps/container/src/config/mfeRegistry.ts');
  try {
    const registryContent = fs.readFileSync(mfeRegistryPath, 'utf8');
    const portMapMatch = registryContent.match(/const ports: Record<string, number> = \{([\s\S]*?)\};/);
    if (portMapMatch) {
      // Extract all port numbers from the ports object
      const portMatches = portMapMatch[1].match(/:\s*(\d+)/g);
      if (portMatches) {
        const ports = portMatches.map(p => parseInt(p.replace(/:\s*/, ''), 10));
        return Math.max(...ports) + 1;
      }
    }
  } catch (e) {
    // Fall back to default if registry can't be read
  }
  // Default fallback: start from port 4001 (after admin's 3004 and container's 4000)
  return 4001;
};

const nextPort = getNextAvailablePort();

console.log(`\n🚀 Creating MFE: ${mfeName}`);
console.log(`   Directory: ${mfeDir}`);
console.log(`   Component: ${mfeNamePascal}MFE`);
console.log(`   Port: ${nextPort}\n`);

// Create directory structure
const directories = [
  '',
  'src',
  'src/__tests__',
  'src/i18n',
  'src/i18n/locales',
  'src/utils',
];

directories.forEach(dir => {
  const fullPath = path.join(mfeDir, dir);
  fs.mkdirSync(fullPath, { recursive: true });
  console.log(`📁 Created: apps/${mfeName}/${dir || ''}`);
});

// File templates
const templates = {
  // package.json
  'package.json': `{
  "name": "@mfe-demo/${mfeName}",
  "version": "1.0.0",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "vite",
    "prebuild": "yarn workspace @mfe-demo/shared-hooks build",
    "build": "tsc && vite build",
    "preview": "vite preview",
    "test": "vitest run",
    "test:unit": "vitest run",
    "test:watch": "vitest",
    "lint": "eslint . --ext ts,tsx",
    "clean": "rm -rf dist node_modules .vite"
  },
  "dependencies": {
    "@mfe-demo/shared-hooks": "1.0.0",
    "@emotion/react": "^11.11.3",
    "@emotion/styled": "^11.11.0",
    "@mui/material": "^7.3.7",
    "@mui/icons-material": "^7.3.7",
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "react-router-dom": "^6.21.3"
  },
  "devDependencies": {
    "@testing-library/jest-dom": "^6.1.5",
    "@testing-library/react": "^14.1.2",
    "@types/react": "^18.2.48",
    "@types/react-dom": "^18.2.18",
    "@vitejs/plugin-react": "^4.2.1",
    "jsdom": "^23.2.0",
    "vite": "^5.0.11",
    "vitest": "^1.2.0"
  }
}
`,

  // tsconfig.json
  'tsconfig.json': `{
  "extends": "../../tsconfig.json",
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["src"]
}
`,

  // tsconfig.node.json
  'tsconfig.node.json': `{
  "extends": "../../tsconfig.json",
  "compilerOptions": {
    "composite": true,
    "skipLibCheck": true,
    "module": "ESNext",
    "moduleResolution": "bundler",
    "allowSyntheticDefaultImports": true
  },
  "include": ["vite.config.ts"]
}
`,

  // vite.config.ts
  'vite.config.ts': `import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => ({
  plugins: [react()],
  base: '/${mfeName}/',  // Base URL for production deployment
  server: {
    port: ${nextPort},
    host: true,
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
    lib: {
      entry: './src/main.tsx',
      name: '${mfeNamePascal}MFE',
      formats: ['es'],
      fileName: '${mfeName}-mfe',
    },
    rollupOptions: {
      external: ['react', 'react-dom', 'react-router-dom'],
      output: {
        globals: {
          react: 'React',
          'react-dom': 'ReactDOM',
          'react-router-dom': 'ReactRouterDOM',
        },
      },
    },
  },
  define: {
    // Define import.meta.env.DEV based on build mode
    // This ensures import.meta.env.DEV is properly defined in production builds
    'import.meta.env.DEV': mode === 'development',
    // Define process.env to prevent "process is not defined" errors when loaded remotely
    'process.env': JSON.stringify({}),
    // Also define process itself to prevent "process is not defined" errors
    'process': JSON.stringify({ env: {} }),
  },
  preview: {
    port: ${nextPort},
    host: true,
    cors: true, // Enable CORS for cross-origin MFE loading in preview mode
  },
}));
`,

  // vitest.config.ts
  'vitest.config.ts': `import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/setupTests.ts',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      statements: 80,
      branches: 75,
      functions: 80,
      lines: 80,
    },
  },
});
`,

  // index.html
  'index.html': `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${mfeNamePascal} MFE</title>
    <script type="importmap">
      {
        "imports": {
          "react": "https://esm.sh/react@18.3.1",
          "react-dom": "https://esm.sh/react-dom@18.3.1?deps=react@18.3.1",
          "react-dom/client": "https://esm.sh/react-dom@18.3.1/client?deps=react@18.3.1",
          "react-router-dom": "https://esm.sh/react-router-dom@6.21.3?deps=react@18.3.1,react-dom@18.3.1"
        }
      }
    </script>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
`,

  // src/vite-env.d.ts
  'src/vite-env.d.ts': `/// <reference types="vite/client" />
`,

  // src/setupTests.ts
  'src/setupTests.ts': `import '@testing-library/jest-dom';
`,

  // src/main.tsx
  'src/main.tsx': `import React, { useCallback } from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider, createTheme, CssBaseline, Theme } from '@mui/material';
import App from './App';
import { I18nProvider, useThemeSync, localStorageService, windowEventBus } from '@mfe-demo/shared-hooks';
import { i18nConfig } from './i18n/config';
import { ThemeConverter } from './utils/ThemeConverter';

const defaultTheme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#1976d2',
    },
  },
});

// Wrapper component that provides I18nProvider and ThemeProvider for the MFE
const ${mfeNamePascal}MFE: React.FC = () => {
  // Theme converter function
  const convertToTheme = useCallback((themeConfig: unknown): Theme => {
    return ThemeConverter.convertToTheme(themeConfig);
  }, []);
  
  // Sync theme with container app
  const theme = useThemeSync(defaultTheme, localStorageService, windowEventBus, convertToTheme);
  
  return (
    <ThemeProvider theme={theme}>
      <I18nProvider config={i18nConfig}>
        <App />
      </I18nProvider>
    </ThemeProvider>
  );
};

// Standalone mode - for development
// Only create root if we're running standalone (not imported as a module)
// Check if root element exists and hasn't been used yet
if (import.meta.env.DEV) {
  const rootElement = document.getElementById('root');
  if (rootElement && !rootElement.hasChildNodes()) {
    ReactDOM.createRoot(rootElement).render(
      <React.StrictMode>
        <I18nProvider config={i18nConfig}>
          <ThemeProvider theme={defaultTheme}>
            <CssBaseline />
            <BrowserRouter>
              <App />
            </BrowserRouter>
          </ThemeProvider>
        </I18nProvider>
      </React.StrictMode>
    );
  }
}

// Export wrapped component for container app
export default ${mfeNamePascal}MFE;
`,

  // src/App.tsx
  'src/App.tsx': `import React from 'react';
import { Box, Typography, Paper, Card, CardContent, Grid } from '@mui/material';
import ViewModuleIcon from '@mui/icons-material/ViewModule';
import { useI18n } from '@mfe-demo/shared-hooks';

const App: React.FC = () => {
  const { t } = useI18n();

  return (
    <Box sx={{ p: 3 }}>
      <Paper sx={{ p: 3, mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <ViewModuleIcon sx={{ fontSize: 40, mr: 2, color: 'primary.main' }} />
          <Typography variant="h4" component="h1">
            {t('${mfeNameCamel}.title')}
          </Typography>
        </Box>
        <Typography variant="body1" color="text.secondary" paragraph>
          {t('${mfeNameCamel}.welcome')}
        </Typography>
      </Paper>

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 6 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                {t('${mfeNameCamel}.feature1.title')}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {t('${mfeNameCamel}.feature1.description')}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                {t('${mfeNameCamel}.feature2.title')}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {t('${mfeNameCamel}.feature2.description')}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default App;
`,

  // src/i18n/config.ts
  'src/i18n/config.ts': `import { I18nConfig } from '@mfe-demo/shared-hooks';
import en from './locales/en.json';
import fr from './locales/fr.json';
import de from './locales/de.json';
import zh from './locales/zh.json';
import es from './locales/es.json';
import ja from './locales/ja.json';

export const i18nConfig: I18nConfig = {
  defaultLanguage: 'en',
  fallbackLanguage: 'en',
  translations: {
    en,
    fr,
    de,
    zh,
    es,
    ja,
  },
};
`,

  // src/i18n/locales/en.json
  'src/i18n/locales/en.json': `{
  "${mfeNameCamel}": {
    "title": "${mfeNamePascal}",
    "welcome": "Welcome to the ${mfeNamePascal} micro frontend application. This is an independently deployable application that is part of the larger MFE architecture.",
    "feature1": {
      "title": "Feature 1",
      "description": "Description of the first feature. Customize this to match your requirements."
    },
    "feature2": {
      "title": "Feature 2",
      "description": "Description of the second feature. Add more features as needed."
    }
  }
}
`,

  // src/i18n/locales/fr.json
  'src/i18n/locales/fr.json': `{
  "${mfeNameCamel}": {
    "title": "${mfeNamePascal}",
    "welcome": "Bienvenue dans l'application micro frontend ${mfeNamePascal}. Il s'agit d'une application déployable de manière indépendante qui fait partie de l'architecture MFE plus large.",
    "feature1": {
      "title": "Fonctionnalité 1",
      "description": "Description de la première fonctionnalité. Personnalisez ceci selon vos besoins."
    },
    "feature2": {
      "title": "Fonctionnalité 2",
      "description": "Description de la deuxième fonctionnalité. Ajoutez plus de fonctionnalités si nécessaire."
    }
  }
}
`,

  // src/i18n/locales/de.json
  'src/i18n/locales/de.json': `{
  "${mfeNameCamel}": {
    "title": "${mfeNamePascal}",
    "welcome": "Willkommen bei der ${mfeNamePascal} Micro-Frontend-Anwendung. Dies ist eine unabhängig bereitstellbare Anwendung, die Teil der größeren MFE-Architektur ist.",
    "feature1": {
      "title": "Funktion 1",
      "description": "Beschreibung der ersten Funktion. Passen Sie dies an Ihre Anforderungen an."
    },
    "feature2": {
      "title": "Funktion 2",
      "description": "Beschreibung der zweiten Funktion. Fügen Sie bei Bedarf weitere Funktionen hinzu."
    }
  }
}
`,

  // src/i18n/locales/zh.json
  'src/i18n/locales/zh.json': `{
  "${mfeNameCamel}": {
    "title": "${mfeNamePascal}",
    "welcome": "欢迎来到${mfeNamePascal}微前端应用程序。这是一个独立部署的应用程序，是更大的MFE架构的一部分。",
    "feature1": {
      "title": "功能 1",
      "description": "第一个功能的描述。根据您的需求进行自定义。"
    },
    "feature2": {
      "title": "功能 2",
      "description": "第二个功能的描述。根据需要添加更多功能。"
    }
  }
}
`,

  // src/i18n/locales/es.json
  'src/i18n/locales/es.json': `{
  "${mfeNameCamel}": {
    "title": "${mfeNamePascal}",
    "welcome": "Bienvenido a la aplicación de micro frontend ${mfeNamePascal}. Esta es una aplicación implementable de forma independiente que forma parte de la arquitectura MFE más grande.",
    "feature1": {
      "title": "Característica 1",
      "description": "Descripción de la primera característica. Personalice esto según sus requisitos."
    },
    "feature2": {
      "title": "Característica 2",
      "description": "Descripción de la segunda característica. Agregue más características según sea necesario."
    }
  }
}
`,

  // src/i18n/locales/ja.json
  'src/i18n/locales/ja.json': `{
  "${mfeNameCamel}": {
    "title": "${mfeNamePascal}",
    "welcome": "${mfeNamePascal}マイクロフロントエンドアプリケーションへようこそ。これは、より大きなMFEアーキテクチャの一部である、独立してデプロイ可能なアプリケーションです。",
    "feature1": {
      "title": "機能 1",
      "description": "最初の機能の説明。要件に合わせてカスタマイズしてください。"
    },
    "feature2": {
      "title": "機能 2",
      "description": "2番目の機能の説明。必要に応じて機能を追加してください。"
    }
  }
}
`,

  // src/utils/ThemeConverter.ts
  'src/utils/ThemeConverter.ts': `/**
 * Theme Converter Service
 * 
 * Following Single Responsibility Principle (SRP),
 * theme conversion logic is separated from App component.
 * This service handles conversion of custom theme definitions to MUI themes.
 */

import { createTheme, Theme } from '@mui/material';

// CustomThemeDefinition interface
// Note: This interface is duplicated from preferences app's types to maintain
// independence between MFEs. Each MFE should be able to run standalone.
// The structure matches the theme JSON format defined in the requirements.
// 
// Future Improvement: Consider creating a shared types package to avoid duplication
// while maintaining MFE independence through proper dependency management.
export interface CustomThemeDefinition {
  name: string;
  version: string;
  description?: string;
  palette?: {
    mode?: 'light' | 'dark';
  };
  colors: {
    primaryMain: string;
    primaryLight: string;
    primaryDark: string;
    secondaryMain: string;
    secondaryLight: string;
    secondaryDark: string;
    errorMain: string;
    warningMain: string;
    infoMain: string;
    successMain: string;
    backgroundDefault: string;
    backgroundPaper: string;
    textPrimary: string;
    textSecondary: string;
  };
  componentOverrides: {
    button?: {
      borderRadius?: number;
      textTransform?: string;
    };
    paper?: {
      borderRadius?: number;
      elevation?: number;
    };
    card?: {
      borderRadius?: number;
      elevation?: number;
    };
    textField?: {
      borderRadius?: number;
    };
    appBar?: {
      elevation?: number;
    };
    drawer?: {
      width?: number;
    };
    alert?: {
      borderRadius?: number;
    };
    dialog?: {
      borderRadius?: number;
    };
    tooltip?: {
      fontSize?: number;
    };
    chip?: {
      borderRadius?: number;
    };
    list?: {
      padding?: number;
    };
    typography?: {
      h1FontSize?: number;
      h2FontSize?: number;
      h3FontSize?: number;
      bodyFontSize?: number;
    };
  };
  muiComponentOverrides: Record<string, unknown>;
  createdAt?: string;
}

/**
 * Theme Converter Service
 */
export class ThemeConverter {
  /**
   * Type guard to check if theme config is in new custom format
   */
  static isNewThemeFormat(cfg: unknown): cfg is CustomThemeDefinition {
    if (typeof cfg !== 'object' || cfg === null) return false;
    const obj = cfg as Record<string, unknown>;
    return !!(obj.colors && obj.componentOverrides && obj.muiComponentOverrides);
  }

  /**
   * Calculates relative brightness of a color
   * Uses simplified approach: checks if hex value is above threshold
   */
  private static getColorBrightness(color: string): number {
    const hex = color.toLowerCase().replace(/^#/, '').replace(/\\s/g, '');
    
    // Handle 3-digit hex
    const fullHex = hex.length === 3 
      ? hex.split('').map(c => c + c).join('')
      : hex;
    
    if (fullHex.length !== 6) return 0;
    
    // Extract RGB
    const r = parseInt(fullHex.substring(0, 0 + 2), 16);
    const g = parseInt(fullHex.substring(2, 2 + 2), 16);
    const b = parseInt(fullHex.substring(4, 4 + 2), 16);
    
    // Simple brightness calculation (average of RGB)
    // Light colors have high brightness (>200), dark colors have low (<100)
    return (r + g + b) / 3;
  }

  /**
   * Checks if background colors appear to be for light mode
   * Light mode typically has bright backgrounds (near white)
   */
  private static isLightModeBackground(bgDefault: string, bgPaper: string): boolean {
    const defaultBrightness = this.getColorBrightness(bgDefault);
    const paperBrightness = this.getColorBrightness(bgPaper);
    
    // If both backgrounds are bright (>200), it's light mode
    return defaultBrightness > 200 && paperBrightness > 200;
  }

  /**
   * Checks if text colors appear to be for light mode
   * Light mode typically has dark text (black or near-black)
   */
  private static isLightModeText(textPrimary: string): boolean {
    const text = textPrimary.toLowerCase().trim();
    
    // Check for common black/dark representations
    if (text === '#000000' || text === '#000' || 
        text === 'rgba(0, 0, 0, 0.87)' || text === 'rgba(0,0,0,0.87)') {
      return true;
    }
    
    // Check hex colors with brightness
    if (text.startsWith('#')) {
      return this.getColorBrightness(text) < 100;
    }
    
    return false;
  }

  /**
   * Filters component overrides to only include valid MUI component names
   * Valid component names start with "Mui" (e.g., MuiButton, MuiCard)
   * This prevents theme-level keys like 'breakpoints', 'palette' from being
   * misinterpreted as component overrides
   */
  private static filterValidComponentOverrides(overrides: Record<string, unknown>): Record<string, unknown> {
    const filtered: Record<string, unknown> = {};
    for (const key in overrides) {
      // Only include keys that start with "Mui" (valid component override names)
      if (key.startsWith('Mui')) {
        filtered[key] = overrides[key];
      }
    }
    return filtered;
  }

  /**
   * Converts a CustomThemeDefinition to a MUI Theme
   * 
   * When palette mode is 'dark' but colors are for light mode (or vice versa),
   * this function omits background and text colors to let MUI use appropriate defaults.
   */
  static createThemeFromDefinition(config: CustomThemeDefinition): Theme {
    const mode = config.palette?.mode || 'light';
    
    // Use defaults for colors if not provided
    const bgDefault = config.colors?.backgroundDefault || '#ffffff';
    const bgPaper = config.colors?.backgroundPaper || '#f5f5f5';
    const txtPrimary = config.colors?.textPrimary || '#000000';
    
    // Check if background and text colors are compatible with the mode
    const hasLightModeBackground = this.isLightModeBackground(bgDefault, bgPaper);
    const hasLightModeText = this.isLightModeText(txtPrimary);
    
    // If mode is dark but colors are for light mode, use MUI defaults
    // If mode is light but colors are for dark mode, use MUI defaults
    const shouldUseDefaultBackgroundAndText = 
      (mode === 'dark' && hasLightModeBackground && hasLightModeText) ||
      (mode === 'light' && !hasLightModeBackground && !hasLightModeText);
    
    return createTheme({
      palette: {
        mode,
        primary: {
          main: config.colors?.primaryMain || '#1976d2',
          light: config.colors?.primaryLight || '#42a5f5',
          dark: config.colors?.primaryDark || '#1565c0',
        },
        secondary: {
          main: config.colors?.secondaryMain || '#dc004e',
          light: config.colors?.secondaryLight || '#ff4081',
          dark: config.colors?.secondaryDark || '#9a0036',
        },
        error: {
          main: config.colors?.errorMain || '#d32f2f',
        },
        warning: {
          main: config.colors?.warningMain || '#ed6c02',
        },
        info: {
          main: config.colors?.infoMain || '#0288d1',
        },
        success: {
          main: config.colors?.successMain || '#2e7d32',
        },
        // Only set background/text if they're compatible with the mode
        ...(!shouldUseDefaultBackgroundAndText && {
          background: {
            default: bgDefault,
            paper: bgPaper,
          },
          text: {
            primary: txtPrimary,
            secondary: config.colors?.textSecondary || 'rgba(0, 0, 0, 0.6)',
          },
        }),
      },
      typography: {
        fontSize: config.componentOverrides?.typography?.bodyFontSize || 16,
        h1: {
          fontSize: \`\${config.componentOverrides?.typography?.h1FontSize || 96}px\`,
        },
        h2: {
          fontSize: \`\${config.componentOverrides?.typography?.h2FontSize || 60}px\`,
        },
        h3: {
          fontSize: \`\${config.componentOverrides?.typography?.h3FontSize || 48}px\`,
        },
        body1: {
          fontSize: \`\${config.componentOverrides?.typography?.bodyFontSize || 16}px\`,
        },
      },
      shape: {
        borderRadius: config.componentOverrides?.button?.borderRadius || 4,
      },
      components: this.filterValidComponentOverrides(config.muiComponentOverrides || {}),
    });
  }

  /**
   * Detects if an object appears to be a serialized MUI Theme object
   * Serialized themes have properties like breakpoints.keys, breakpoints.unit
   * that are output-only (generated by createTheme but not valid input options).
   * These cannot be passed to createTheme() as they would cause runtime errors.
   */
  private static isSerializedMuiTheme(obj: Record<string, unknown>): boolean {
    // Check for serialized breakpoints object
    // breakpoints.keys and breakpoints.unit are output-only properties from createTheme
    // ThemeOptions only allows breakpoints.values and breakpoints.step as input
    const breakpoints = obj.breakpoints as Record<string, unknown> | undefined;
    if (breakpoints && typeof breakpoints === 'object') {
      if (breakpoints.keys && breakpoints.unit) {
        return true;
      }
    }

    // Check for serialized transitions object
    // duration.enteringScreen and duration.leavingScreen are output-only properties
    // that createTheme generates but are not typically in user input
    const transitions = obj.transitions as Record<string, unknown> | undefined;
    if (transitions && typeof transitions === 'object') {
      const duration = transitions.duration as Record<string, unknown> | undefined;
      if (duration && typeof duration === 'object') {
        // These specific duration keys are generated by createTheme
        if (duration.enteringScreen !== undefined && duration.leavingScreen !== undefined) {
          return true;
        }
      }
    }

    return false;
  }

  /**
   * Type guard to check if theme config is a valid legacy MUI theme format
   * Returns false for serialized MUI Theme objects (which have lost their methods)
   */
  static isLegacyThemeFormat(cfg: unknown): boolean {
    if (typeof cfg !== 'object' || cfg === null) return false;
    const obj = cfg as Record<string, unknown>;
    
    // Reject serialized MUI Theme objects - they cannot be used with createTheme()
    if (this.isSerializedMuiTheme(obj)) {
      return false;
    }
    
    // Legacy format typically has palette, typography, spacing, etc.
    return !!(obj.palette || obj.typography || obj.spacing || obj.components);
  }

  /**
   * Converts any theme config format to a MUI Theme
   * Handles both new custom format and legacy MUI theme format
   */
  static convertToTheme(themeConfig: unknown): Theme {
    if (this.isNewThemeFormat(themeConfig)) {
      return this.createThemeFromDefinition(themeConfig);
    }
    // Legacy format - validate before conversion
    if (this.isLegacyThemeFormat(themeConfig)) {
      return createTheme(themeConfig as Record<string, unknown>);
    }
    // Fallback to default theme if format is unrecognized
    return createTheme();
  }
}
`,

  // src/__tests__/App.test.tsx
  'src/__tests__/App.test.tsx': `import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import App from '../App';
import { I18nProvider } from '@mfe-demo/shared-hooks';
import { i18nConfig } from '../i18n/config';

const renderWithI18n = (component: React.ReactElement) => {
  return render(<I18nProvider config={i18nConfig}>{component}</I18nProvider>);
};

describe('${mfeNamePascal} MFE - App Component', () => {
  it('should render ${mfeNameCamel} title', () => {
    renderWithI18n(<App />);
    expect(screen.getByText('${mfeNamePascal}')).toBeDefined();
  });

  it('should render welcome message', () => {
    renderWithI18n(<App />);
    expect(screen.getByText(/Welcome to the ${mfeNamePascal} micro frontend/i)).toBeDefined();
  });

  it('should render feature 1 card', () => {
    renderWithI18n(<App />);
    expect(screen.getByText('Feature 1')).toBeDefined();
    expect(screen.getByText(/Description of the first feature/i)).toBeDefined();
  });

  it('should render feature 2 card', () => {
    renderWithI18n(<App />);
    expect(screen.getByText('Feature 2')).toBeDefined();
    expect(screen.getByText(/Description of the second feature/i)).toBeDefined();
  });

  it('should render icon', () => {
    const { container } = renderWithI18n(<App />);
    const icon = container.querySelector('svg[data-testid="ViewModuleIcon"]');
    expect(icon).toBeDefined();
  });

  it('should have proper layout structure', () => {
    const { container } = renderWithI18n(<App />);
    const paper = container.querySelector('.MuiPaper-root');
    expect(paper).toBeDefined();
  });
});
`,

  // src/__tests__/ThemeConverter.test.ts
  'src/__tests__/ThemeConverter.test.ts': `import { describe, it, expect } from 'vitest';
import { ThemeConverter, CustomThemeDefinition } from '../utils/ThemeConverter';

describe('ThemeConverter', () => {
  describe('isNewThemeFormat', () => {
    it('should return true for valid new theme format', () => {
      const theme = {
        colors: { primaryMain: '#000' },
        componentOverrides: {},
        muiComponentOverrides: {},
      };
      expect(ThemeConverter.isNewThemeFormat(theme)).toBe(true);
    });

    it('should return false for legacy theme format', () => {
      const theme = { palette: { mode: 'light' } };
      expect(ThemeConverter.isNewThemeFormat(theme)).toBe(false);
    });

    it('should return false for null', () => {
      expect(ThemeConverter.isNewThemeFormat(null)).toBe(false);
    });
  });

  describe('isLegacyThemeFormat', () => {
    it('should return true for theme with palette', () => {
      const theme = { palette: { mode: 'light' } };
      expect(ThemeConverter.isLegacyThemeFormat(theme)).toBe(true);
    });

    it('should return false for serialized MUI theme', () => {
      const theme = {
        palette: {},
        breakpoints: { keys: ['xs', 'sm'], unit: 'px' },
      };
      expect(ThemeConverter.isLegacyThemeFormat(theme)).toBe(false);
    });
  });

  describe('convertToTheme', () => {
    it('should convert new theme format', () => {
      const themeConfig: CustomThemeDefinition = {
        name: 'Test',
        version: '1.0.0',
        colors: {
          primaryMain: '#1976d2',
          primaryLight: '#42a5f5',
          primaryDark: '#1565c0',
          secondaryMain: '#dc004e',
          secondaryLight: '#ff4081',
          secondaryDark: '#9a0036',
          errorMain: '#d32f2f',
          warningMain: '#ed6c02',
          infoMain: '#0288d1',
          successMain: '#2e7d32',
          backgroundDefault: '#ffffff',
          backgroundPaper: '#f5f5f5',
          textPrimary: '#000000',
          textSecondary: 'rgba(0, 0, 0, 0.6)',
        },
        componentOverrides: {},
        muiComponentOverrides: {},
      };
      const theme = ThemeConverter.convertToTheme(themeConfig);
      expect(theme.palette.primary.main).toBe('#1976d2');
    });

    it('should convert legacy theme format', () => {
      const themeConfig = {
        palette: {
          mode: 'dark' as const,
          primary: { main: '#ff0000' },
        },
      };
      const theme = ThemeConverter.convertToTheme(themeConfig);
      expect(theme.palette.mode).toBe('dark');
    });

    it('should return default theme for unrecognized format', () => {
      const theme = ThemeConverter.convertToTheme({});
      expect(theme).toBeDefined();
      expect(theme.palette).toBeDefined();
    });
  });
});
`,
};

// Write all template files
Object.entries(templates).forEach(([relativePath, content]) => {
  const fullPath = path.join(mfeDir, relativePath);
  fs.writeFileSync(fullPath, content);
  console.log(`📄 Created: apps/${mfeName}/${relativePath}`);
});

console.log('\n✅ MFE files created successfully!\n');

// Now update the integration files
console.log('🔧 Updating integration files...\n');

// Helper function to update JSON file with error handling
function updateJsonFile(filePath, updateFn) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const json = JSON.parse(content);
    updateFn(json);
    fs.writeFileSync(filePath, JSON.stringify(json, null, 2) + '\n');
  } catch (error) {
    console.error(`❌ Error updating ${filePath}: ${error.message}`);
    throw error;
  }
}

// 1. Update root package.json
const rootPackageJson = path.join(projectRoot, 'package.json');
updateJsonFile(rootPackageJson, (pkg) => {
  // Add dev script
  pkg.scripts[`dev:${mfeName}`] = `yarn workspace @mfe-demo/${mfeName} dev`;
  
  // Add build script
  pkg.scripts[`build:${mfeName}`] = `yarn workspace @mfe-demo/${mfeName} build`;
  
  // Add preview script
  pkg.scripts[`preview:${mfeName}`] = `yarn workspace @mfe-demo/${mfeName} preview`;
  
  // Add test script
  pkg.scripts[`test:unit:${mfeName}`] = `yarn workspace @mfe-demo/${mfeName} test:unit`;
  
  // Update the combined dev script - add new MFE to concurrently
  if (!pkg.scripts.dev.includes(`dev:${mfeName}`)) {
    // Simply append to the existing concurrently command
    pkg.scripts.dev = pkg.scripts.dev.replace(
      /"yarn dev:admin"$/,
      `"yarn dev:admin" "yarn dev:${mfeName}"`
    );
  }
  
  // Update the combined build script
  if (!pkg.scripts.build.includes(`build:${mfeName}`)) {
    pkg.scripts.build = pkg.scripts.build + ` && yarn build:${mfeName}`;
  }
  
  // Update the combined preview script
  if (!pkg.scripts.preview.includes(`preview:${mfeName}`)) {
    pkg.scripts.preview = pkg.scripts.preview.replace(
      /"yarn preview:admin"$/,
      `"yarn preview:admin" "yarn preview:${mfeName}"`
    );
  }
  
  // Update test:unit:all script
  if (!pkg.scripts['test:unit:all'].includes(`test:unit:${mfeName}`)) {
    pkg.scripts['test:unit:all'] = pkg.scripts['test:unit:all'] + ` && yarn test:unit:${mfeName}`;
  }
  
  // Update clean script
  if (!pkg.scripts.clean.includes(`../${mfeName}`)) {
    pkg.scripts.clean = pkg.scripts.clean.replace(
      /&& cd \.\.\/admin && rm -rf node_modules dist$/,
      `&& cd ../admin && rm -rf node_modules dist && cd ../${mfeName} && rm -rf node_modules dist`
    );
  }
});
console.log('📦 Updated: package.json');

// 2. Update container navbar translations (all languages)
const containerLocales = ['en', 'fr', 'de', 'zh', 'es', 'ja'];
const navbarTranslations = {
  en: mfeNamePascal,
  fr: mfeNamePascal,
  de: mfeNamePascal,
  zh: mfeNamePascal,
  es: mfeNamePascal,
  ja: mfeNamePascal,
};

containerLocales.forEach(lang => {
  const localePath = path.join(projectRoot, 'apps/container/src/i18n/locales', `${lang}.json`);
  updateJsonFile(localePath, (json) => {
    // Ensure navbar object exists
    if (!json.navbar) {
      json.navbar = {};
    }
    json.navbar[mfeName] = navbarTranslations[lang];
  });
  console.log(`🌐 Updated: apps/container/src/i18n/locales/${lang}.json`);
});

// 3. Update container Navbar.tsx
const navbarPath = path.join(projectRoot, 'apps/container/src/components/Navbar.tsx');
let navbarContent = fs.readFileSync(navbarPath, 'utf8');

// Find the navItems array and add the new entry before the admin item
const navItemsMatch = navbarContent.match(/const navItems: NavItem\[\] = \[([\s\S]*?)\];/);
if (navItemsMatch) {
  const existingItems = navItemsMatch[1];
  // Check if MFE already added
  if (!existingItems.includes(`path: '/${mfeName}'`)) {
    // Insert new nav item before admin (which is usually last and has adminOnly)
    const newNavItem = `\n  { path: '/${mfeName}', labelKey: 'navbar.${mfeName}' },`;
    const updatedItems = existingItems.replace(
      /(\s*\{ path: '\/admin', labelKey: 'navbar\.admin', adminOnly: true \},?)/,
      `${newNavItem}$1`
    );
    navbarContent = navbarContent.replace(navItemsMatch[1], updatedItems);
    fs.writeFileSync(navbarPath, navbarContent);
    console.log('🧭 Updated: apps/container/src/components/Navbar.tsx');
  }
}

// 4. Update container mfeRegistry.ts
const mfeRegistryPath = path.join(projectRoot, 'apps/container/src/config/mfeRegistry.ts');
let registryContent = fs.readFileSync(mfeRegistryPath, 'utf8');

// Add port mapping
const portMapMatch = registryContent.match(/const ports: Record<string, number> = \{([\s\S]*?)\};/);
if (portMapMatch && !portMapMatch[1].includes(mfeName)) {
  // Find the last entry in the ports object and add the new one after it
  const lastEntryMatch = portMapMatch[1].match(/(\s*\w+: \d+),?\s*$/);
  if (lastEntryMatch) {
    const updatedContent = portMapMatch[1].replace(
      /(\s*admin: \d+),?\s*$/,
      `$1,\n    ${mfeName}: ${nextPort},`
    );
    registryContent = registryContent.replace(
      /const ports: Record<string, number> = \{[\s\S]*?\};/,
      `const ports: Record<string, number> = {${updatedContent}\n  };`
    );
  }
}

// Add case in switch statement
const switchMatch = registryContent.match(/switch \(mfeName\) \{([\s\S]*?)default:/);
if (switchMatch && !switchMatch[1].includes(`case '${mfeName}':`)) {
  const newCase = `\n        case '${mfeName}':\n          return import('@mfe-demo/${mfeName}');`;
  registryContent = registryContent.replace(
    /(\s*case 'admin':[\s\S]*?return import\('@mfe-demo\/admin'\);)/,
    `$1${newCase}`
  );
}

// Add registry entry
const registryMatch = registryContent.match(/export const mfeRegistry: Record<string, MFEConfig> = \{([\s\S]*?)\};/);
if (registryMatch && !registryMatch[1].includes(`${mfeName}:`)) {
  const newEntry = `\n  ${mfeName}: {\n    name: '${mfeNamePascal}',\n    loadComponent: createMFELoader('${mfeName}'),\n    description: '${mfeNamePascal} micro frontend',\n  },`;
  registryContent = registryContent.replace(
    /(admin: \{[\s\S]*?description: 'Admin panel micro frontend',\s*\},)/,
    `$1${newEntry}`
  );
}

fs.writeFileSync(mfeRegistryPath, registryContent);
console.log('📋 Updated: apps/container/src/config/mfeRegistry.ts');

// 5. Update container routeMappings.ts
const routeMappingsPath = path.join(projectRoot, 'apps/container/src/config/routeMappings.ts');
let routeContent = fs.readFileSync(routeMappingsPath, 'utf8');

const routeArrayMatch = routeContent.match(/export const routeMappings: RouteMapping\[\] = \[([\s\S]*?)\];/);
if (routeArrayMatch && !routeArrayMatch[1].includes(`'/${mfeName}'`)) {
  const newRoute = `\n  { pattern: '/${mfeName}', mfeName: '${mfeName}', exact: true },`;
  routeContent = routeContent.replace(
    /(\{ pattern: '\/admin', mfeName: 'admin', exact: true \},)/,
    `$1${newRoute}`
  );
  fs.writeFileSync(routeMappingsPath, routeContent);
  console.log('🛤️  Updated: apps/container/src/config/routeMappings.ts');
}

// 5b. Update container App.tsx to add MFE loader entry
const appTsxPath = path.join(projectRoot, 'apps/container/src/App.tsx');
let appTsxContent = fs.readFileSync(appTsxPath, 'utf8');

// Check if the MFE is already added
if (!appTsxContent.includes(`mountedMFEs.has('${mfeName}')`)) {
  // Find the account MFE loader block and add the new MFE after it (before admin)
  const accountMfeBlock = `{mountedMFEs.has('account') && (
          <Box sx={{ display: currentMFE === 'account' ? 'block' : 'none' }}>
            <MFELoader mfeName="account" />
          </Box>
        )}`;
  
  const newMfeBlock = `{mountedMFEs.has('account') && (
          <Box sx={{ display: currentMFE === 'account' ? 'block' : 'none' }}>
            <MFELoader mfeName="account" />
          </Box>
        )}
        {mountedMFEs.has('${mfeName}') && (
          <Box sx={{ display: currentMFE === '${mfeName}' ? 'block' : 'none' }}>
            <MFELoader mfeName="${mfeName}" />
          </Box>
        )}`;
  
  appTsxContent = appTsxContent.replace(accountMfeBlock, newMfeBlock);
  fs.writeFileSync(appTsxPath, appTsxContent);
  console.log('📱 Updated: apps/container/src/App.tsx');
}

// 6. Update container vite.config.ts
const containerViteConfigPath = path.join(projectRoot, 'apps/container/vite.config.ts');
let viteConfigContent = fs.readFileSync(containerViteConfigPath, 'utf8');

// Add to hasRemoteUrls check
if (!viteConfigContent.includes(`process.env.VITE_MFE_${mfeName.toUpperCase()}_URL`)) {
  viteConfigContent = viteConfigContent.replace(
    /process\.env\.VITE_MFE_ADMIN_URL/,
    `process.env.VITE_MFE_ADMIN_URL &&\n    process.env.VITE_MFE_${mfeName.toUpperCase()}_URL`
  );
}

// Add alias
const aliasMatch = viteConfigContent.match(/alias: useAliases \? \{([\s\S]*?)\} : \{/);
if (aliasMatch && !aliasMatch[1].includes(`@mfe-demo/${mfeName}`)) {
  const newAlias = `\n        '@mfe-demo/${mfeName}': path.resolve(__dirname, '../${mfeName}/src/main.tsx'),`;
  viteConfigContent = viteConfigContent.replace(
    /('@mfe-demo\/admin': path\.resolve\(__dirname, '\.\.\/admin\/src\/main\.tsx'\),)/,
    `$1${newAlias}`
  );
  fs.writeFileSync(containerViteConfigPath, viteConfigContent);
  console.log('⚙️  Updated: apps/container/vite.config.ts');
}

// 7. Update scripts/run-production-local.js
const prodLocalPath = path.join(projectRoot, 'scripts/run-production-local.js');
let prodLocalContent = fs.readFileSync(prodLocalPath, 'utf8');

// Update APPS array
if (!prodLocalContent.includes(`'${mfeName}'`)) {
  prodLocalContent = prodLocalContent.replace(
    /const APPS = \['container', 'home', 'preferences', 'account', 'admin'\];/,
    `const APPS = ['container', 'home', 'preferences', 'account', 'admin', '${mfeName}'];`
  );
  
  // Add access point log
  prodLocalContent = prodLocalContent.replace(
    /console\.log\('   Admin:       http:\/\/localhost:3004'\);/,
    `console.log('   Admin:       http://localhost:3004');\n    console.log('   ${mfeNamePascal}:${' '.repeat(Math.max(1, 10 - mfeNamePascal.length))}http://localhost:${nextPort}');`
  );
  
  fs.writeFileSync(prodLocalPath, prodLocalContent);
  console.log('🏃 Updated: scripts/run-production-local.js');
}

// 8. Update scripts/deploy-all.sh
const deployAllPath = path.join(projectRoot, 'scripts/deploy-all.sh');
let deployAllContent = fs.readFileSync(deployAllPath, 'utf8');

if (!deployAllContent.includes(mfeName)) {
  deployAllContent = deployAllContent.replace(
    /for APP in container home preferences account admin;/,
    `for APP in container home preferences account admin ${mfeName};`
  );
  fs.writeFileSync(deployAllPath, deployAllContent);
  console.log('🚀 Updated: scripts/deploy-all.sh');
}

// 9. Update scripts/deploy.sh
const deployPath = path.join(projectRoot, 'scripts/deploy.sh');
let deployContent = fs.readFileSync(deployPath, 'utf8');

if (!deployContent.includes(mfeName)) {
  // Update echo for available apps
  deployContent = deployContent.replace(
    /echo "Available apps: container, home, preferences, account, admin"/,
    `echo "Available apps: container, home, preferences, account, admin, ${mfeName}"`
  );
  
  // Update regex validation
  deployContent = deployContent.replace(
    /if \[\[ ! "\$APP_NAME" =~ \^\(container\|home\|preferences\|account\|admin\)\$ \]\];/,
    `if [[ ! "$APP_NAME" =~ ^(container|home|preferences|account|admin|${mfeName})$ ]];`
  );
  
  // Update error message
  deployContent = deployContent.replace(
    /echo "Error: Invalid app name\. Must be one of: container, home, preferences, account, admin"/,
    `echo "Error: Invalid app name. Must be one of: container, home, preferences, account, admin, ${mfeName}"`
  );
  
  fs.writeFileSync(deployPath, deployContent);
  console.log('📤 Updated: scripts/deploy.sh');
}

// 10. Update deployment/deploy-apps.sh
const deployAppsPath = path.join(projectRoot, 'deployment/deploy-apps.sh');
let deployAppsContent = fs.readFileSync(deployAppsPath, 'utf8');

// Update MFE remote URL settings
if (!deployAppsContent.includes(`VITE_MFE_${mfeName.toUpperCase()}_URL`)) {
  deployAppsContent = deployAppsContent.replace(
    /export VITE_MFE_ADMIN_URL="\$\{WEBSITE_URL\}\/admin"/,
    `export VITE_MFE_ADMIN_URL="\${WEBSITE_URL}/admin"\n    export VITE_MFE_${mfeName.toUpperCase()}_URL="\${WEBSITE_URL}/${mfeName}"`
  );
  
  deployAppsContent = deployAppsContent.replace(
    /print_info "  - Admin: \$\{VITE_MFE_ADMIN_URL\}"/,
    `print_info "  - Admin: \${VITE_MFE_ADMIN_URL}"\n    print_info "  - ${mfeNamePascal}: \${VITE_MFE_${mfeName.toUpperCase()}_URL}"`
  );
}

// Update APPS array
if (!deployAppsContent.includes(`"${mfeName}"`)) {
  deployAppsContent = deployAppsContent.replace(
    /APPS=\("container" "home" "preferences" "account" "admin"\)/,
    `APPS=("container" "home" "preferences" "account" "admin" "${mfeName}")`
  );
}

fs.writeFileSync(deployAppsPath, deployAppsContent);
console.log('☁️  Updated: deployment/deploy-apps.sh');

console.log('\n✅ All integration updates complete!\n');

// Print next steps
console.log('📋 Next steps:\n');
console.log(`   1. Run 'yarn install' to install dependencies`);
console.log(`   2. Run 'yarn dev' to start all MFEs in development mode`);
console.log(`   3. Access the new MFE at http://localhost:${nextPort}`);
console.log(`   4. Or access it through the container at http://localhost:4000/${mfeName}`);
console.log(`\n   To build: yarn build:${mfeName}`);
console.log(`   To test:  yarn test:unit:${mfeName}`);
console.log(`   To deploy: ./scripts/deploy.sh ${mfeName}`);
console.log('\n🎉 MFE creation complete!');

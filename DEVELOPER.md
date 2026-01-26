# Developer Guide

Welcome to the MFE Demo project! This guide will help you get started with development.

## Table of Contents

- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Project Structure](#project-structure)
- [Creating a New MFE](#creating-a-new-mfe)
- [Testing](#testing)
- [Debugging](#debugging)
- [Best Practices](#best-practices)
- [Troubleshooting](#troubleshooting)

## Getting Started

### Prerequisites

- Node.js >= 18.0.0
- Yarn >= 1.22.0
- Git
- Code editor (VS Code recommended)

### Initial Setup

1. Clone the repository:

```bash
git clone https://github.com/report-zone/mfe-demo.git
cd mfe-demo
```

2. Install dependencies:

```bash
yarn install
```

3. Set up environment variables:

```bash
cp apps/container/.env.example apps/container/.env
# Edit .env with your AWS Cognito credentials
```

4. Verify setup:

```bash
yarn build
```

## Development Workflow

### Running Applications

#### Run All Applications (Not Recommended)

```bash
# This will start all apps on different ports
# Container: 3000, Home: 3001, Preferences: 3002, Account: 3003, Admin: 3004
yarn dev:container & yarn dev:home & yarn dev:preferences & yarn dev:account & yarn dev:admin
```

#### Run Container Only (Recommended for Development)

```bash
# Start the container app which will load MFE placeholders
yarn dev:container
```

#### Run Individual MFE

```bash
# Test an MFE in standalone mode
yarn dev:home
yarn dev:preferences
yarn dev:account
yarn dev:admin
```

### Development Ports

| Application | Port |
| ----------- | ---- |
| Container   | 4000 |
| Home MFE    | 3001 |
| Preferences | 3002 |
| Account MFE | 3003 |
| Admin MFE   | 3004 |

### Hot Reload

All applications support hot module replacement (HMR). Changes to source files will automatically reload in the browser.

## Project Structure

```
mfe-demo/
├── apps/                      # Application workspaces
│   ├── container/             # Main container app
│   │   ├── src/
│   │   │   ├── components/    # Reusable components
│   │   │   ├── contexts/      # React contexts
│   │   │   ├── __tests__/     # Unit tests
│   │   │   ├── App.tsx        # Root component
│   │   │   └── main.tsx       # Entry point
│   │   ├── index.html         # HTML template
│   │   ├── package.json       # Dependencies
│   │   ├── vite.config.ts     # Vite configuration
│   │   └── vitest.config.ts   # Vitest configuration
│   │
│   ├── home/                  # Home MFE
│   ├── preferences/           # Preferences MFE
│   ├── account/               # Account MFE
│   └── admin/                 # Admin MFE (protected)
│
├── packages/                  # Shared packages (future)
├── scripts/                   # Deployment scripts
├── .eslintrc.json            # ESLint configuration
├── .prettierrc               # Prettier configuration
├── tsconfig.json             # TypeScript configuration
└── package.json              # Root package.json
```

### Key Files

- **apps/container/src/App.tsx**: Main application component with routing
- **apps/container/src/contexts/AuthContext.tsx**: Authentication state management
- **apps/container/src/contexts/DataContext.tsx**: Shared data management
- **apps/container/src/components/MFELoader.tsx**: Dynamic MFE loader

## Creating a New MFE

To create a new micro frontend:

1. Create the directory structure:

```bash
mkdir -p apps/my-mfe/src
```

2. Create package.json:

```json
{
  "name": "@mfe-demo/my-mfe",
  "version": "1.0.0",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "@emotion/react": "^11.11.3",
    "@emotion/styled": "^11.11.0",
    "@mui/material": "^6.1.6",
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "react-router-dom": "^6.21.3"
  },
  "devDependencies": {
    "@types/react": "^18.2.48",
    "@types/react-dom": "^18.2.18",
    "@vitejs/plugin-react": "^4.2.1",
    "vite": "^5.0.11"
  }
}
```

3. Create vite.config.ts:

```typescript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3005, // Use next available port
    host: true,
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
    lib: {
      entry: './src/main.tsx',
      name: 'MyMFE',
      formats: ['es'],
      fileName: 'my-mfe',
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
});
```

4. Create src/App.tsx:

```typescript
import React from 'react';
import { Box, Typography, Paper } from '@mui/material';

const App: React.FC = () => {
  return (
    <Box sx={{ p: 3 }}>
      <Paper sx={{ p: 3 }}>
        <Typography variant="h4">My MFE</Typography>
        <Typography variant="body1">
          Content here...
        </Typography>
      </Paper>
    </Box>
  );
};

export default App;
```

5. Create src/main.tsx:

```typescript
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider, createTheme, CssBaseline } from '@mui/material';
import App from './App';

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#1976d2',
    },
  },
});

if (import.meta.env.DEV) {
  ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </ThemeProvider>
    </React.StrictMode>
  );
}

export { default } from './App';
```

6. Update container's MFELoader to include new MFE
7. Add to root package.json scripts
8. Install dependencies: `yarn install`

## Testing

### Unit Tests

Run unit tests for a specific app:

```bash
yarn workspace @mfe-demo/container test:unit
```

Run tests in watch mode:

```bash
yarn workspace @mfe-demo/container test:watch
```

### E2E Tests

Run Cypress tests:

```bash
yarn workspace @mfe-demo/container test:e2e
```

Open Cypress UI:

```bash
yarn workspace @mfe-demo/container test:e2e:open
```

### Writing Tests

Example component test:

```typescript
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import MyComponent from '../components/MyComponent';

describe('MyComponent', () => {
  it('renders correctly', () => {
    render(<MyComponent />);
    expect(screen.getByText('Hello')).toBeDefined();
  });
});
```

Example context test:

```typescript
import { describe, it, expect } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { act } from 'react';
import { MyProvider, useMyContext } from '../contexts/MyContext';

const TestComponent = () => {
  const { value, setValue } = useMyContext();
  return (
    <div>
      <div data-testid="value">{value}</div>
      <button onClick={() => setValue('new')}>Set</button>
    </div>
  );
};

describe('MyContext', () => {
  it('provides default value', () => {
    render(
      <MyProvider>
        <TestComponent />
      </MyProvider>
    );
    expect(screen.getByTestId('value')).toHaveTextContent('');
  });
});
```

## Debugging

### VS Code Configuration

Create `.vscode/launch.json`:

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "type": "chrome",
      "request": "launch",
      "name": "Launch Chrome",
      "url": "http://localhost:3000",
      "webRoot": "${workspaceFolder}/apps/container/src"
    }
  ]
}
```

### Browser DevTools

1. Open Chrome DevTools (F12)
2. Go to Sources tab
3. Find your source files under `webpack://` or `src/`
4. Set breakpoints as needed

### React DevTools

Install React DevTools browser extension for better debugging of React components and state.

### Network Debugging

- Use Network tab to inspect API calls
- Check for CORS issues
- Verify MFE loading

## Best Practices

### Code Style

- Follow the ESLint and Prettier configurations
- Use TypeScript for type safety
- Write meaningful variable and function names
- Add comments for complex logic

### Component Design

- Keep components small and focused
- Use Material UI components for consistency
- Avoid prop drilling - use contexts instead
- Make components reusable

### State Management

- Use AuthContext for authentication state
- Use DataContext for shared data between MFEs
- Keep local state in components when possible
- Avoid unnecessary re-renders

### Performance

- Use React.memo for expensive components
- Implement lazy loading for routes
- Optimize images and assets
- Monitor bundle sizes

### Security

- Never commit credentials or secrets
- Validate all user inputs
- Use HTTPS in production
- Implement proper authentication checks

### Git Workflow

1. Create a feature branch: `git checkout -b step1-feature-name`
2. Make changes and commit regularly
3. Write descriptive commit messages
4. Push and create pull request
5. Address review comments

### PR Naming Convention

Use the pattern: `step<N>-<meaningful-name>`

Examples:

- `step1-setup-monorepo`
- `step2-add-authentication`
- `step3-implement-home-mfe`

## Troubleshooting

### Build Errors

**Problem**: TypeScript compilation errors

**Solution**:

```bash
# Clean and rebuild
yarn clean
yarn install
yarn build
```

**Problem**: Module not found errors

**Solution**:

```bash
# Reinstall dependencies
rm -rf node_modules yarn.lock
yarn install
```

### Development Server Issues

**Problem**: Port already in use

**Solution**: Kill the process or change port in vite.config.ts

**Problem**: Changes not reflecting

**Solution**:

- Clear browser cache
- Restart dev server
- Check HMR is working in console

### Authentication Issues

**Problem**: Cannot login

**Solution**:

- Verify Cognito credentials in .env
- Check AWS region is correct
- Verify user exists in Cognito user pool

**Problem**: Token expired

**Solution**: Logout and login again

### MFE Loading Issues

**Problem**: MFE not loading in container

**Solution**:

- Verify MFE is built
- Check MFELoader configuration
- Verify import maps in production

## Getting Help

- Check existing GitHub issues
- Read the documentation in README.md and DEPLOYMENT.md
- Ask questions in team chat
- Open a new issue with details

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## Resources

- [React Documentation](https://react.dev)
- [Material UI Documentation](https://mui.com)
- [Vite Documentation](https://vitejs.dev)
- [Vitest Documentation](https://vitest.dev)
- [AWS Amplify Documentation](https://docs.amplify.aws)
- [TypeScript Documentation](https://www.typescriptlang.org)

## License

MIT

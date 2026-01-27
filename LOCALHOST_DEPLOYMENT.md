# Running MFE Demo on Localhost

This guide explains how to run the MFE Demo application on localhost in different modes.

## Overview

The MFE Demo application has three distinct modes:

1. **Development Mode** (`yarn dev`) - Hot reload, uses module aliases
2. **Preview Mode** (`yarn preview`) - Built artifacts served locally, tests production builds locally
3. **Production Mode** - Built artifacts deployed to CDN, uses remote module loading

## Quick Start

### Development Mode (Recommended for Development)

```bash
# Install dependencies
yarn install

# Start all applications in development mode
yarn dev
```

Access the application at: http://localhost:4000

**How it works:**
- Vite dev server with hot module reload
- Uses module aliases to import MFEs directly
- No build step required
- Fast feedback loop

### Preview Mode (Test Production Builds Locally)

```bash
# Build all applications
yarn build

# Start preview servers for all apps
yarn preview
```

Access the application at: http://localhost:4000/container/

**How it works:**
- Serves production builds from `dist/` folders
- Container automatically detects localhost and loads MFEs from local preview servers
- Tests production build without needing actual deployment
- No environment variables needed

### Local Production Testing (yarn prod:local)

```bash
# Build and preview in one command
yarn prod:local
```

This is a convenience script that:
1. Builds all applications if needed
2. Starts all preview servers concurrently
3. Automatically uses localhost detection to load MFEs locally

## How Localhost Detection Works

The container application automatically detects when running on localhost and adjusts its behavior:

```typescript
// In mfeRegistry.ts
const isLocalEnvironment = (): boolean => {
  const hostname = window.location.hostname;
  return (
    hostname === 'localhost' ||
    hostname === '127.0.0.1' ||
    hostname.startsWith('192.168.') ||
    hostname.startsWith('10.') ||
    hostname.startsWith('172.')
  );
};
```

**When on localhost:**
- Container loads MFEs from `http://localhost:3001-3004`
- No need to set `VITE_MFE_*_URL` environment variables
- CORS is automatically enabled in preview mode

**When in production (non-localhost):**
- Container uses `VITE_MFE_*_URL` environment variables if set
- Falls back to local imports if no remote URLs configured

## Environment Variables

### For Localhost - NOT NEEDED

You do **not** need to set any `VITE_MFE_*_URL` environment variables when running on localhost. The application will automatically use local preview servers.

### For Production Deployment

When deploying to AWS or other CDN, set these environment variables **before building**:

```bash
# Example for CloudFront deployment
export VITE_MFE_HOME_URL=https://your-domain.cloudfront.net/home
export VITE_MFE_PREFERENCES_URL=https://your-domain.cloudfront.net/preferences
export VITE_MFE_ACCOUNT_URL=https://your-domain.cloudfront.net/account
export VITE_MFE_ADMIN_URL=https://your-domain.cloudfront.net/admin

# Then build
yarn build
```

**Important:** These variables are baked into the build at build time. They cannot be changed at runtime.

## Common Issues and Solutions

### Issue: "Failed to load remote module from https://mfe.world"

**Cause:** The container was built with `VITE_MFE_*_URL` set to a non-existent or inaccessible domain.

**Solution:**
1. For localhost: Don't set `VITE_MFE_*_URL` variables. Rebuild: `yarn build`
2. For production: Set correct CDN URLs before building
3. Verify the domain is accessible: `curl -I https://your-domain/home/home-mfe.js`

### Issue: CORS errors when loading MFEs

**Cause:** Cross-origin requests blocked by browser.

**Solution:**
- In preview mode: CORS is automatically enabled
- In production: Configure CloudFront/CDN to send proper CORS headers
- Verify CORS headers: `curl -I http://localhost:3001/home/home-mfe.js`

### Issue: MFEs not loading after authentication

**Cause:** AWS Cognito not configured.

**Solution:**
1. Deploy Cognito stack (see AWS_DEPLOYMENT_GUIDE.md)
2. Set Cognito environment variables in `.env`:
   ```
   VITE_COGNITO_USER_POOL_ID=your-pool-id
   VITE_COGNITO_CLIENT_ID=your-client-id
   VITE_AWS_REGION=us-east-1
   ```
3. Rebuild: `yarn build`

## Port Configuration

Default ports for preview mode:
- Container: 4000
- Home MFE: 3001
- Preferences MFE: 3002
- Account MFE: 3003
- Admin MFE: 3004

To change ports, edit the respective `vite.config.ts` file in each app directory.

## Development Workflow

### Making Changes to MFEs

1. **Development mode** (recommended):
   ```bash
   yarn dev
   ```
   Changes to any MFE are immediately reflected in the container.

2. **Preview mode** (test production builds):
   ```bash
   # After making changes
   yarn build
   yarn preview
   ```

### Testing Production Build Locally

1. Build all apps: `yarn build`
2. Start preview servers: `yarn preview`
3. Open http://localhost:4000/container/
4. Application should load MFEs from local preview servers automatically

### Preparing for Production Deployment

1. Set environment variables for your CDN
2. Build: `yarn build`
3. Deploy to S3/CloudFront using deployment scripts
4. Verify MFEs load from CDN URLs

## See Also

- [QUICKSTART.md](QUICKSTART.md) - General quickstart guide
- [AWS_DEPLOYMENT_GUIDE.md](AWS_DEPLOYMENT_GUIDE.md) - Production deployment guide
- [DEVELOPER.md](DEVELOPER.md) - Developer documentation
- [RUNNING_PRODUCTION_LOCALLY.md](RUNNING_PRODUCTION_LOCALLY.md) - More details on local production testing

# MFE Remote Loading Configuration Guide

This document explains how the MFE Demo application loads individual micro frontends (MFEs) from remote URLs in production.

## Overview

The container application now supports **dynamic remote loading** of MFEs from their deployed S3/CloudFront locations. This enables:

- **Independent deployments**: Deploy individual MFEs without redeploying the container
- **True micro frontend architecture**: Each MFE is loaded from its own URL at runtime
- **Development flexibility**: Local development still uses hot module replacement

## How It Works

### Development Mode

In development (`yarn dev`), the container uses local Vite aliases to load MFEs directly from source files. This provides:
- Hot module replacement (HMR)
- Fast feedback loop
- No build required for MFEs

### Production Mode

In production builds, the container:
1. Does NOT bundle MFE code into the container bundle
2. Loads MFEs dynamically at runtime from remote URLs
3. Uses environment variables to determine MFE URLs

## Configuration

### Step 1: Set Environment Variables

Create a `.env.production` file in `apps/container/` (or set environment variables in your CI/CD pipeline):

```bash
# CloudFront/S3 URLs where MFEs are deployed
VITE_MFE_HOME_URL=https://your-cloudfront-domain.cloudfront.net/home
VITE_MFE_PREFERENCES_URL=https://your-cloudfront-domain.cloudfront.net/preferences
VITE_MFE_ACCOUNT_URL=https://your-cloudfront-domain.cloudfront.net/account
VITE_MFE_ADMIN_URL=https://your-cloudfront-domain.cloudfront.net/admin

# Other required variables
VITE_COGNITO_USER_POOL_ID=your-pool-id
VITE_COGNITO_CLIENT_ID=your-client-id
VITE_AWS_REGION=us-east-1
```

### Step 2: Build Applications

Build each application separately:

```bash
# Build container (does NOT include MFE code)
yarn build:container

# Build individual MFEs
yarn build:home
yarn build:preferences
yarn build:account
yarn build:admin

# Or build all at once
yarn build
```

### Step 3: Deploy to S3

Deploy each application to its own S3 path:

```bash
# Using the deployment script
./deployment/deploy-apps.sh all

# Or deploy individually
./deployment/deploy-apps.sh home
./deployment/deploy-apps.sh preferences
```

The deployment structure will be:
```
s3://your-bucket/
├── container/          # Container app
│   ├── index.html
│   └── assets/
├── home/              # Home MFE
│   └── home-mfe.js
├── preferences/       # Preferences MFE
│   └── preferences-mfe.js
├── account/           # Account MFE
│   └── account-mfe.js
└── admin/             # Admin MFE
    └── admin-mfe.js
```

## Technical Details

### Remote Module Loading

The container uses a custom remote module loader (`remoteModuleLoader.ts`) that:
- Dynamically injects script tags for remote modules
- Caches loaded modules to prevent duplicate loads
- Handles loading errors gracefully
- Supports CORS-enabled remote URLs

### MFE Registry

The MFE registry (`mfeRegistry.ts`) now:
- Checks for remote URL environment variables
- Falls back to local imports in development
- Uses the remote module loader in production

### Build Configuration

#### Container (`apps/container/vite.config.ts`)
- **Development**: Uses aliases to local MFE source files
- **Production**: Removes aliases to prevent bundling MFEs

#### MFEs (`apps/*/vite.config.ts`)
- Configured as library builds with predictable output filenames
- Each has a `base` URL matching its deployment path
- Externalize React dependencies to reduce bundle size

## Deployment Workflow

### Full Deployment

When deploying everything for the first time:

1. Set environment variables (see Step 1 above)
2. Build all applications: `yarn build`
3. Deploy all: `./deployment/deploy-apps.sh all`

### Individual MFE Update

When updating a single MFE:

1. Make changes to the MFE (e.g., `apps/home/`)
2. Build the MFE: `yarn build:home`
3. Deploy only that MFE: `./deployment/deploy-apps.sh home`
4. **The container automatically picks up the new version!**

### Container Update

When updating the container (shell app):

1. Make changes to `apps/container/`
2. Build the container: `yarn build:container`
3. Deploy the container: `./deployment/deploy-apps.sh container`

## Troubleshooting

### MFEs Not Loading in Production

1. **Check environment variables**: Ensure `VITE_MFE_*_URL` variables are set correctly
2. **Verify CORS**: S3/CloudFront must allow CORS for the container domain
3. **Check browser console**: Look for loading errors or network issues
4. **Verify file names**: MFE files should be `{mfename}-mfe.js` (e.g., `home-mfe.js`)

### Container Still Bundling MFEs

If the container bundle includes MFE code:
1. Verify you're building in production mode
2. Check that environment variables are set during build
3. Clear build cache: `rm -rf apps/container/dist && yarn build:container`

### Changes Not Appearing After Deployment

1. **Clear CloudFront cache**: Use the deployment script which invalidates cache automatically
2. **Hard refresh browser**: Cmd+Shift+R (Mac) or Ctrl+Shift+R (Windows)
3. **Check deployment logs**: Ensure files were uploaded to correct S3 paths

## Migration from Bundled to Remote Loading

If you're upgrading from a version that bundled all MFEs:

1. **Update environment variables**: Add `VITE_MFE_*_URL` variables
2. **Rebuild container**: `yarn build:container` (it will be smaller now)
3. **Deploy container**: This is a one-time full deployment
4. **Test**: Verify all MFEs load correctly
5. **Future updates**: Now you can deploy MFEs independently!

## Best Practices

1. **Version MFE URLs**: Consider using versioned URLs for better cache control
2. **Monitor loading performance**: Remote loading adds network overhead
3. **Implement error boundaries**: Handle MFE loading failures gracefully
4. **Use CI/CD**: Automate environment variable injection
5. **Test independently**: Each MFE should work standalone (run `yarn dev` in MFE directory)

## See Also

- [Deployment Guide](./DEPLOYMENT.md) - General deployment instructions
- [AWS Deployment Guide](./AWS_DEPLOYMENT_GUIDE.md) - AWS-specific setup
- [Developer Guide](./DEVELOPER.md) - Development setup

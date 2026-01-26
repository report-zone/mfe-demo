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

### Automated Deployment (Recommended)

**When using the provided deployment script (`deployment/deploy-apps.sh`), environment variables are automatically configured.** The script:
1. Reads the `WEBSITE_URL` from `deployment/infrastructure-info.txt`
2. Automatically sets `VITE_MFE_*_URL` environment variables before building the container
3. Ensures MFEs are NOT bundled into the container

Simply run:
```bash
./deployment/deploy-apps.sh all
```

The deployment script will automatically set:
- `VITE_MFE_HOME_URL=${WEBSITE_URL}/home`
- `VITE_MFE_PREFERENCES_URL=${WEBSITE_URL}/preferences`
- `VITE_MFE_ACCOUNT_URL=${WEBSITE_URL}/account`
- `VITE_MFE_ADMIN_URL=${WEBSITE_URL}/admin`

### Manual Build (Advanced)

If you're building manually outside of the deployment script, you need to set environment variables yourself:

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

Then build applications:

Build each application separately:

```bash
# Build container (does NOT include MFE code when env vars are set)
yarn build:container

# Build individual MFEs
yarn build:home
yarn build:preferences
yarn build:account
yarn build:admin

# Or build all at once
yarn build
```

### Deploy to S3

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

1. Deploy infrastructure (if not already done): `./deployment/deploy-cloudformation.sh`
2. Deploy all apps (builds automatically with correct env vars): `./deployment/deploy-apps.sh all`

The deployment script automatically:
- Sets `VITE_MFE_*_URL` environment variables based on your `WEBSITE_URL`
- Builds the container WITHOUT bundling MFE code
- Builds each MFE separately
- Deploys everything to S3
- Invalidates CloudFront cache

### Individual MFE Update

When updating a single MFE:

1. Make changes to the MFE (e.g., `apps/home/`)
2. Deploy only that MFE: `./deployment/deploy-apps.sh home`
3. **The container automatically picks up the new version!** (No container redeployment needed)

### Container Update

When updating the container (shell app):

1. Make changes to `apps/container/`
2. Deploy the container: `./deployment/deploy-apps.sh container`

## Troubleshooting

### MFEs Not Loading in Production

When using the deployment script, this should not happen. If it does:

1. **Check build output**: Look for `_virtual_mfe-remote_*` files in container build (should be ~0.10 kB each)
2. **Verify infrastructure**: Ensure `deployment/infrastructure-info.txt` exists with correct `WEBSITE_URL`
3. **Check browser console**: Look for loading errors or network issues
4. **Verify file names**: MFE files should be `{mfename}-mfe.js` (e.g., `home-mfe.js`)

### Container Still Bundling MFEs

If the container bundle includes MFE code (look for `main-*.js` files ~5-187 kB instead of `_virtual_mfe-remote_*.js` ~0.10 kB):

**When using deployment script:**
- This should not happen as environment variables are set automatically
- Check that `deployment/infrastructure-info.txt` exists and contains `WEBSITE_URL`
- Verify the deployment script output shows "Setting MFE remote URLs for container build..."

**When building manually:**
1. Verify you're building in production mode (`NODE_ENV=production`)
2. Check that `VITE_MFE_*_URL` environment variables are set during build: `echo $VITE_MFE_HOME_URL`
3. Clear build cache: `rm -rf apps/container/dist && yarn build:container`
4. Verify environment variables are actually available to the build process

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

# Quick Start: Remote MFE Loading

This guide helps you get started with the remote MFE loading feature that enables independent deployment of micro frontends.

## What's Changed?

Previously, the container bundled all MFE code, so deploying an individual MFE didn't update production. Now, the container can load MFEs dynamically from remote URLs, enabling true independent deployments.

## Quick Setup

### For Production with Independent MFE Deployments

1. **Create `.env.production` in `apps/container/`:**
```bash
VITE_MFE_HOME_URL=https://your-cloudfront-domain.cloudfront.net/home
VITE_MFE_PREFERENCES_URL=https://your-cloudfront-domain.cloudfront.net/preferences
VITE_MFE_ACCOUNT_URL=https://your-cloudfront-domain.cloudfront.net/account
VITE_MFE_ADMIN_URL=https://your-cloudfront-domain.cloudfront.net/admin
```

2. **Build and deploy:**
```bash
# Build all apps
yarn build

# Deploy all apps (first time)
./deployment/deploy-apps.sh all

# Future updates - deploy just the changed MFE
./deployment/deploy-apps.sh home
```

That's it! The container will now load MFEs from their remote URLs.

### For Development

No changes needed! Development works exactly as before:
```bash
yarn dev
```

### For Production without Remote Loading (Legacy Mode)

If you don't set the environment variables, the build works as before:
```bash
yarn build:container  # Bundles all MFEs (legacy behavior)
```

## How to Deploy Individual MFE Updates

1. **Make changes to an MFE** (e.g., `apps/home/`)

2. **Build only that MFE:**
```bash
yarn build:home
```

3. **Deploy only that MFE:**
```bash
./deployment/deploy-apps.sh home
```

4. **Done!** Changes are live without touching the container.

## Verifying It's Working

### Check Build Output

**With remote URLs configured:**
```bash
VITE_MFE_HOME_URL=https://example.com/home \
VITE_MFE_PREFERENCES_URL=https://example.com/preferences \
VITE_MFE_ACCOUNT_URL=https://example.com/account \
VITE_MFE_ADMIN_URL=https://example.com/admin \
yarn build:container
```

You should see virtual stub files instead of bundled MFE code:
```
dist/assets/_virtual_mfe-remote_home-*.js     (~100 bytes)
dist/assets/_virtual_mfe-remote_preferences-*.js (~100 bytes)
...
```

**Without remote URLs:**
```bash
yarn build:container
```

You'll see the MFE code bundled into the main bundle (larger file size).

### Check Browser Console

When running in production with remote loading:
1. Open browser DevTools → Network tab
2. Load your app
3. Look for requests to your MFE URLs (e.g., `https://your-cdn.com/home/home-mfe.js`)

## Troubleshooting

### MFEs not loading in production?

1. **Verify environment variables are set during build**
2. **Check CORS configuration** on your S3/CloudFront
3. **Inspect browser console** for loading errors
4. **Verify MFE file names** match the pattern: `{app-name}-mfe.js`

### Container still bundling MFEs?

1. **Ensure all 4 environment variables are set** during build
2. **Clear build cache:** `rm -rf apps/container/dist && yarn build:container`
3. **Check that you're building in production mode**

### Changes not appearing?

1. **Invalidate CloudFront cache** (deployment script does this automatically)
2. **Hard refresh browser:** Cmd+Shift+R (Mac) or Ctrl+Shift+R (Windows)
3. **Check deployment logs** to ensure files uploaded correctly

## Learn More

- [MFE_REMOTE_LOADING.md](./MFE_REMOTE_LOADING.md) - Comprehensive guide
- [MFE_REMOTE_LOADING_SUMMARY.md](./MFE_REMOTE_LOADING_SUMMARY.md) - Technical details
- [DEPLOYMENT.md](./DEPLOYMENT.md) - General deployment guide

## Questions?

If you have questions or issues:
1. Check the documentation files linked above
2. Review the code comments in `apps/container/src/utils/remoteModuleLoader.ts`
3. Open an issue in the repository

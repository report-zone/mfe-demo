# MFE Production Loading Fix

## Problem Summary

None of the MFEs were loading in production - only a loading spinner was displayed indefinitely. This issue occurred because the MFEs are built as ES modules with externalized React dependencies, but the browser had no way to resolve these bare module specifiers when loading the MFEs remotely.

## Root Cause

The architecture uses the following approach:
1. MFEs are built as ES modules (library format) with React, ReactDOM, and React Router DOM marked as `external`
2. The remote module loader dynamically loads MFEs from their deployed URLs
3. When the browser tries to load an MFE, it encounters import statements like `import React from 'react'`
4. **The browser doesn't know where to find 'react'** - there's no import map defined!

This causes the MFE module to fail loading, resulting in the infinite loading spinner.

## Solution

Added an **import map** to the container's index.html that maps bare module specifiers to their CDN locations:

```html
<script type="importmap">
  {
    "imports": {
      "react": "https://esm.sh/react@18.3.1",
      "react-dom": "https://esm.sh/react-dom@18.3.1",
      "react-dom/client": "https://esm.sh/react-dom@18.3.1/client",
      "react-router-dom": "https://esm.sh/react-router-dom@6.21.3"
    }
  }
</script>
```

Additionally, updated the container's Vite configuration to externalize these same dependencies when building with remote MFE URLs. This ensures both the container and the MFEs use the **same React instance** from the CDN, preventing React version conflicts and duplicate React instances.

## Changes Made

### 1. `apps/container/index.html`
- Added import map script tag before the main module script
- Maps react, react-dom, and react-router-dom to esm.sh CDN URLs
- Uses exact versions matching package.json (18.3.1 for React, 6.21.3 for React Router)

### 2. `apps/container/vite.config.ts`
- Added `rollupOptions.external` array that externalizes React dependencies when `hasRemoteUrls` is true
- This prevents bundling React into the container when using remote MFEs
- Reduces container bundle size from ~571KB to ~407KB (29% reduction)

### 3. `.gitignore`
- Added `www/` directory to prevent temporary test artifacts from being committed

## How It Works

### Before the Fix
```
Container loads → 
  Bundles all React internally (571KB) → 
  Tries to load remote MFE → 
  MFE imports 'react' → 
  ❌ Browser doesn't know where 'react' is → 
  Loading fails
```

### After the Fix
```
Container loads → 
  Uses React from CDN via import map → 
  Loads remote MFE → 
  MFE imports 'react' → 
  ✅ Import map resolves 'react' to CDN → 
  Same React instance used by container → 
  MFE loads successfully
```

## Bundle Size Impact

| Build Mode | Container Size | Notes |
|------------|---------------|-------|
| Without remote URLs | 571 KB | All MFEs bundled into container |
| With remote URLs | 407 KB | MFEs loaded remotely, React from CDN |
| **Savings** | **164 KB (29%)** | More efficient with separate deployments |

## Browser Compatibility

Import maps are supported in:
- Chrome/Edge 89+
- Safari 16.4+
- Firefox 108+

For older browsers, consider using an import map polyfill like `es-module-shims`.

## Deployment

### Existing Deployment Script
The existing `deployment/deploy-apps.sh` script already:
1. Sets the `VITE_MFE_*_URL` environment variables automatically
2. Builds the container with these variables, triggering the externalization
3. Deploys everything to S3

**No changes needed to the deployment process!**

### Manual Deployment
If deploying manually:

```bash
# Set environment variables
export VITE_MFE_HOME_URL=https://your-cdn.com/home
export VITE_MFE_PREFERENCES_URL=https://your-cdn.com/preferences
export VITE_MFE_ACCOUNT_URL=https://your-cdn.com/account
export VITE_MFE_ADMIN_URL=https://your-cdn.com/admin

# Build container (will externalize React and use import map)
yarn build:container

# Build MFEs (already configured correctly)
yarn build:home
yarn build:preferences
yarn build:account
yarn build:admin

# Deploy to S3/CloudFront
# ... your deployment commands
```

## Testing Locally

To test the fix locally without CDN access:

1. Build all apps with local URLs:
```bash
export VITE_MFE_HOME_URL=http://localhost:8000/home
export VITE_MFE_PREFERENCES_URL=http://localhost:8000/preferences
export VITE_MFE_ACCOUNT_URL=http://localhost:8000/account
export VITE_MFE_ADMIN_URL=http://localhost:8000/admin
yarn build
```

2. Serve the built files:
```bash
# Create deployment structure
mkdir -p www/container www/home www/preferences www/account www/admin
cp -r apps/container/dist/* www/container/
cp apps/home/dist/*.js www/home/
cp apps/preferences/dist/*.js www/preferences/
cp apps/account/dist/*.js www/account/
cp apps/admin/dist/*.js www/admin/

# Serve
python3 -m http.server 8000 --directory www
```

3. Access http://localhost:8000/container/

**Note:** This requires internet access to esm.sh CDN for the React modules.

## CDN Choice: esm.sh

We're using esm.sh as the CDN because:
- ✅ Native ES module support
- ✅ Automatic transpilation for compatibility
- ✅ No build step required
- ✅ CDN-cached and fast
- ✅ Supports exact version pinning

Alternative CDNs that would also work:
- unpkg.com (add `?module` query parameter)
- jsdelivr.com (use `/+esm` path)
- skypack.dev

## Architecture Notes

### What's Shared
- ✅ React 18.3.1
- ✅ ReactDOM 18.3.1
- ✅ React Router DOM 6.21.3

### What's Not Shared (Bundled in Each MFE)
- Material-UI and all @mui packages
- Other third-party libraries
- MFE-specific code

This is intentional - sharing Material-UI would require significant refactoring and could lead to version conflicts. The current approach keeps MFEs relatively self-contained while still sharing the core React libraries.

## Troubleshooting

### MFEs Still Not Loading
1. Check browser console for errors
2. Verify import map is present in the HTML: `view-source:https://your-domain.com/container/`
3. Check that MFE files are accessible: `curl https://your-domain.com/home/home-mfe.js`
4. Verify environment variables were set during container build
5. Check browser compatibility with import maps

### CDN Issues
If esm.sh is unavailable:
1. Update the import map in `apps/container/index.html` to use a different CDN
2. Rebuild the container
3. Redeploy

### React Version Conflicts
If you see React errors:
1. Verify the import map uses the same React version as package.json
2. Check that both container and MFEs are using the import map (not bundling React)
3. Clear browser cache and try again

## Security Considerations

- ✅ Using HTTPS for all CDN imports
- ✅ Pinned to specific versions (not latest)
- ⚠️ CDN dependency: esm.sh must be available
- ℹ️ Consider adding Subresource Integrity (SRI) hashes for additional security

## Future Improvements

1. **Add SRI hashes** to import map for tamper detection
2. **Add import map polyfill** for older browser support
3. **Consider CDN fallback** if primary CDN is unavailable
4. **Share Material-UI** via import map to further reduce bundle sizes
5. **Add performance monitoring** for MFE load times

## Summary

This fix resolves the production MFE loading issue by:
1. Adding an import map to resolve bare module specifiers
2. Externalizing React dependencies to use shared CDN versions
3. Reducing bundle sizes and preventing React instance conflicts

The solution is minimal, non-breaking, and works with the existing deployment infrastructure.

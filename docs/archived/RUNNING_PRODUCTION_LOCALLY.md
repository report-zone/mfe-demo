# Running Production Locally

This guide explains how to run production builds locally for testing before deploying to AWS.

## Overview

The `yarn prod:local` command allows you to:
1. Build all applications in production mode
2. Serve them locally using Vite's preview server
3. Test the production setup including import maps and MFE loading

## Quick Start

```bash
# Build and run all applications in production mode
yarn prod:local
```

This will:
- Build all applications if not already built
- Start preview servers for all apps on their respective ports
- Display access URLs in the terminal

Access the application at: **http://localhost:4000**

## Skip Rebuild

If you've already built the applications and just want to restart the servers:

```bash
yarn prod:local --skip-build
```

## Individual Preview Servers

You can also run preview servers individually:

```bash
# Preview container app on port 4000
yarn preview:container

# Preview individual MFEs
yarn preview:home        # Port 3001
yarn preview:preferences # Port 3002
yarn preview:account     # Port 3003
yarn preview:admin       # Port 3004

# Or run all preview servers at once
yarn preview
```

## How It Works

### Development Mode vs Production Preview

| Mode | Command | Purpose | MFE Loading |
|------|---------|---------|-------------|
| **Development** | `yarn dev` | Active development with HMR | Uses local aliases for fast iteration |
| **Production Preview** | `yarn prod:local` | Test production build locally | Uses production build with import maps |

### What Gets Built

When you run `yarn prod:local`, the following happens:

1. **Container App** (`apps/container/dist/`)
   - Builds with base path `/container/`
   - Includes import map for React and React Router DOM from CDN
   - Optimized and minified assets in `/assets/` folder
   
2. **MFE Apps** (home, preferences, account, admin)
   - Each builds as an ES module library
   - Externalizes React dependencies (they come from CDN via import map)
   - Creates single JS file: `{app}-mfe.js`
   - Base paths: `/home/`, `/preferences/`, `/account/`, `/admin/`

### Preview Server Configuration

The preview servers use Vite's built-in preview server which:
- Serves the production build from the `dist/` folder
- Applies correct base paths for each app
- Simulates a real deployment environment

## Port Configuration

| Application | Port | URL |
|-------------|------|-----|
| Container | 4000 | http://localhost:4000 |
| Home MFE | 3001 | http://localhost:3001/home/ |
| Preferences MFE | 3002 | http://localhost:3002/preferences/ |
| Account MFE | 3003 | http://localhost:3003/account/ |
| Admin MFE | 3004 | http://localhost:3004/admin/ |

## Testing Production Behavior

### Import Maps

The container's `index.html` includes an import map that resolves React dependencies from the esm.sh CDN:

```html
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
```

This ensures all apps share the same React instance, just like in production.

### Base Paths

Each app is configured with a base path matching the production deployment structure:
- Container: `/container/`
- MFEs: `/home/`, `/preferences/`, `/account/`, `/admin/`

This matches the S3/CloudFront structure used in production.

### MFE Loading

In production mode, MFEs are loaded as remote modules. However, when running locally with `yarn prod:local`, the container still uses local aliases during development. To test true remote loading:

1. Set environment variables for remote URLs:
```bash
export VITE_MFE_HOME_URL=http://localhost:3001/home/home-mfe.js
export VITE_MFE_PREFERENCES_URL=http://localhost:3002/preferences/preferences-mfe.js
export VITE_MFE_ACCOUNT_URL=http://localhost:3003/account/account-mfe.js
export VITE_MFE_ADMIN_URL=http://localhost:3004/admin/admin-mfe.js
```

2. Rebuild the container:
```bash
yarn build:container
```

3. Run preview servers:
```bash
yarn prod:local --skip-build
```

Now the container will load MFEs remotely from the other preview servers, simulating the production deployment.

## Troubleshooting

### Port Already in Use

If you see errors about ports being in use:

```bash
# Find processes using the ports
lsof -ti:4000,3001,3002,3003,3004

# Review the process IDs, then kill them individually (be careful!)
kill <PID1> <PID2> <PID3>

# Or use pkill to kill all vite preview processes (stops ALL vite servers)
pkill -f "vite preview"
```

**⚠️ Warning:** Always verify process IDs before killing them to avoid stopping unrelated processes.

Then try again:
```bash
yarn prod:local --skip-build
```

### Build Errors

If builds fail:

1. Clean all builds:
```bash
yarn clean
```

2. Reinstall dependencies:
```bash
yarn install
```

3. Build again:
```bash
yarn build
```

### CDN Issues

If you see errors loading React from esm.sh:
- Check your internet connection
- The import map requires internet access to load dependencies from CDN
- This is intentional to match production behavior

### MFEs Not Loading

If MFEs show loading spinners indefinitely:
1. Check browser console for errors
2. Verify all preview servers are running
3. Check that environment variables are set correctly (if testing remote loading)
4. Clear browser cache and reload

## Differences from Production

| Aspect | Local Preview | Production |
|--------|---------------|------------|
| **Serving** | Vite preview server | CloudFront + S3 |
| **URLs** | localhost:XXXX | https://app.mfeworld.com |
| **HTTPS** | HTTP only | HTTPS with CDN |
| **Caching** | No caching | CloudFront caching |
| **Auth** | Local Cognito config | Production Cognito |

## Next Steps

After testing locally:

1. **Commit your changes**
   ```bash
   git add .
   git commit -m "Your changes"
   ```

2. **Deploy to AWS** (see [AWS_DEPLOYMENT_GUIDE.md](./AWS_DEPLOYMENT_GUIDE.md))
   ```bash
   ./deployment/deploy-apps.sh all
   ```

3. **Test in production**
   - Verify in browser
   - Check CloudFront logs
   - Monitor for errors

## See Also

- [DEPLOYMENT.md](./DEPLOYMENT.md) - Deployment guide
- [AWS_DEPLOYMENT_GUIDE.md](./AWS_DEPLOYMENT_GUIDE.md) - Complete AWS deployment
- [DEVELOPER.md](./DEVELOPER.md) - Developer guide
- [MFE_PRODUCTION_FIX.md](./MFE_PRODUCTION_FIX.md) - Production MFE loading details

# Troubleshooting Guide

This guide consolidates common issues and solutions encountered during development and deployment of the MFE Demo application.

## Table of Contents

- [Remote MFE Loading Issues](#remote-mfe-loading-issues)
- [Production Build and Deployment Issues](#production-build-and-deployment-issues)
- [Theme and UI Issues](#theme-and-ui-issues)
- [CloudFormation and Infrastructure Issues](#cloudformation-and-infrastructure-issues)
- [Development Environment Issues](#development-environment-issues)

---

## Remote MFE Loading Issues

### Issue: "process is not defined" Error

**Symptoms:**
- Error in browser console: `Error: Failed to load remote module from https://mfe.world/home/home-mfe.js: process is not defined`
- MFEs fail to load in production
- ErrorBoundary catches the error

**Root Cause:**
Vite configuration only defined `process.env` but some code (likely in dependencies) tried to access the `process` object itself, which doesn't exist in browser environments.

**Solution:**
Update all Vite configuration files to define both `process.env` AND the `process` object:

```typescript
define: {
  'process.env': JSON.stringify({}),
  'process': JSON.stringify({ env: {} }),
}
```

**Files to modify:**
- `apps/container/vite.config.ts`
- `apps/home/vite.config.ts`
- `apps/preferences/vite.config.ts`
- `apps/account/vite.config.ts`
- `apps/admin/vite.config.ts`

**Verification:**
```bash
# Build and check output
yarn build
grep "process" apps/home/dist/home-mfe.js  # Should return 0 results
```

---

### Issue: MFE Content Not Loading (Import Maps)

**Symptoms:**
- Container loads successfully
- Header and navbar render correctly
- Network tab shows MFE files downloading
- MFE content never appears, only loading spinner
- No error messages in console

**Root Cause:**
MFEs are built as ES modules with React dependencies externalized, but the browser has no way to resolve bare module specifiers like `import React from 'react'`.

**Solution:**
Add an import map to `apps/container/index.html` before the main module script:

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

**CRITICAL:** The `?deps=` parameter in esm.sh URLs prevents multiple React instances. Without it, you'll get duplicate React instances that break hooks.

**Additional Changes:**
Update `apps/container/vite.config.ts` to externalize React dependencies when building with remote MFE URLs:

```typescript
rollupOptions: {
  external: hasRemoteUrls ? ['react', 'react-dom', 'react-dom/client', 'react-router-dom'] : [],
}
```

---

### Issue: Dynamic Import Failure in Remote Module Loader

**Symptoms:**
- MFE files download successfully
- Polling mechanism fails to detect loaded modules
- Loading spinner displays indefinitely

**Root Cause:**
The polling mechanism in `remoteModuleLoader.ts` had race conditions where module evaluation could complete between polling intervals.

**Solution:**
Replace polling mechanism with promise-based approach using `script.onload`:

```typescript
// Use script.onload instead of polling
script.onload = async () => {
  try {
    const module = await import(url);
    resolve(module);
  } catch (error) {
    reject(new Error(`Failed to import module: ${error}`));
  }
};
```

---

### Issue: Multiple React Instances

**Symptoms:**
- Error: "TypeError: Cannot read properties of null (reading 'useRef')"
- React hooks not working correctly
- Context values not accessible across MFEs

**Root Cause:**
Different versions of React loaded for container and MFEs, or React loaded multiple times.

**Solution:**
1. Ensure all apps use the same React version in package.json
2. Use import map with `?deps=` parameter (see Import Maps solution above)
3. Externalize React in MFE builds:

```typescript
// In each MFE's vite.config.ts
rollupOptions: {
  external: ['react', 'react-dom', 'react-router-dom'],
}
```

---

## Production Build and Deployment Issues

### Issue: Root URL Shows Blank Page

**Symptoms:**
- Accessing `https://mfe.world/` shows nothing
- Accessing `https://mfe.world/container/` works correctly
- No console errors

**Root Cause:**
CloudFront's `DefaultRootObject` served the container HTML file at the root URL, but the browser URL remained at `/` while React Router expected `/container/`. This mismatch caused routing to fail silently.

**Solution:**
1. Remove `DefaultRootObject` from CloudFormation configuration
2. Add client-side redirect in `apps/container/src/App.tsx`:

```typescript
// Redirect to /container/ if at root but built for /container/
useEffect(() => {
  const basename = import.meta.env.BASE_URL;
  if (basename !== '/' && window.location.pathname === '/') {
    window.location.replace(basename);
  }
}, []);
```

**CloudFormation Change:**
Remove this line from `cloudformation/templates/s3-cloudfront.yaml`:
```yaml
DefaultRootObject: container/index.html  # REMOVE THIS
```

Keep the CustomErrorResponses that serve `/container/index.html` for 403/404 errors.

---

## Theme and UI Issues

### Issue: Theme Editor State Not Persisting

**Symptoms:**
- Theme changes don't save
- Editor shows previous state after reload
- Monaco Editor shows empty object

**Root Cause:**
Multiple issues with state management and Monaco Editor integration.

**Solution:**
1. Fixed Monaco Editor empty object display
2. Improved state synchronization between color picker and JSON editor
3. Added proper validation before saving themes

See `apps/preferences/src/components/ThemeEditorDialog.tsx` for implementation details.

---

### Issue: Monaco Editor Shows Empty Object

**Symptoms:**
- Monaco Editor displays `{}` instead of theme JSON
- Changes in color pickers don't update the editor
- Manual JSON editing doesn't reflect in color pickers

**Root Cause:**
State synchronization issue between the theme object and Monaco Editor's model.

**Solution:**
Properly sync editor content with theme state and ensure proper debouncing:

```typescript
// Update editor content when theme changes
useEffect(() => {
  if (editorRef.current && theme) {
    const model = editorRef.current.getModel();
    if (model) {
      model.setValue(JSON.stringify(theme, null, 2));
    }
  }
}, [theme]);
```

---

## CloudFormation and Infrastructure Issues

### Issue: CloudFormation Stack Update Fails

**Symptoms:**
- Stack update hangs or fails
- Resource creation times out
- Unable to rollback

**Common Causes and Solutions:**

1. **CloudFront distribution update takes too long:**
   - CloudFront updates typically take 10-15 minutes
   - Wait patiently, don't cancel the update
   - Check CloudFront console for distribution status

2. **S3 bucket not empty during deletion:**
   ```bash
   # Empty bucket before deletion
   aws s3 rm s3://your-bucket-name --recursive
   ```

3. **Cognito User Pool has users:**
   - Cannot delete user pool with existing users
   - Delete users first or use DeletionPolicy: Retain

4. **Invalid parameter values:**
   - Check `deployment/config.yaml` for correct values
   - Ensure domain names are valid and available
   - Verify ACM certificate ARN is correct

**Best Practices:**
```bash
# Always validate templates before deploying
./deployment/validate-templates.sh

# Test rollback handling
./deployment/test-rollback-handling.sh

# Check infrastructure info sourcing
./deployment/test-infrastructure-info-sourcing.sh
```

---

### Issue: Certificate Validation Pending

**Symptoms:**
- CloudFormation stack stuck waiting for certificate validation
- SSL/TLS certificate in "Pending Validation" state

**Solution:**
1. Certificate must be created in `us-east-1` region for CloudFront
2. Add DNS validation records to your domain's DNS provider
3. Wait for validation (can take 5-30 minutes)
4. Verify validation status:
   ```bash
   aws acm describe-certificate --certificate-arn <arn> --region us-east-1
   ```

---

## Development Environment Issues

### Issue: Port Already in Use

**Symptoms:**
- `Error: listen EADDRINUSE: address already in use :::3001`
- Unable to start development server

**Solution:**
```bash
# Find and kill process using the port
lsof -ti:3001 | xargs kill -9

# Or use a different port
PORT=3005 yarn dev:home
```

---

### Issue: Yarn Install Fails

**Symptoms:**
- Dependency installation errors
- Version conflicts

**Solution:**
```bash
# Clear yarn cache
yarn cache clean

# Remove node_modules and lockfile
rm -rf node_modules yarn.lock

# Reinstall
yarn install
```

---

### Issue: Cypress Binary Download Fails During Install

**Symptoms:**
- `yarn install` fails with error: "The Cypress App could not be downloaded"
- Error message: "getaddrinfo ENOTFOUND download.cypress.io"
- Installation stops before completing
- Subsequent `yarn dev` or `yarn build` commands fail with "Cannot find module '@mfe-demo/shared-hooks'"

**Root Cause:**
In restricted network environments (CI servers, corporate networks, firewalls), Cypress binary download may be blocked or unavailable. This prevents the installation from completing, which means dependencies are not installed and the shared-hooks package cannot be built.

**Solution:**
Skip the Cypress binary download during installation. The Cypress package will still be installed for E2E test functionality, but the binary can be downloaded later when needed:

```bash
# Install dependencies without Cypress binary
CYPRESS_INSTALL_BINARY=0 yarn install

# After successful install, build shared-hooks
yarn build:shared-hooks

# Now you can run dev or build commands
yarn dev
# OR
yarn build
```

**Alternative - Download Cypress Binary Later:**
If you need to run E2E tests after installation:
```bash
# After successful install, download Cypress binary separately
npx cypress install
```

**For CI Environments:**
Add the environment variable to your CI configuration:
```yaml
# Example for GitHub Actions
env:
  CYPRESS_INSTALL_BINARY: 0
```

---

### Issue: TypeScript Compilation Errors After Dependency Update

**Symptoms:**
- Type errors in code that previously compiled
- Missing type definitions

**Solution:**
```bash
# Reinstall @types packages
yarn add -D @types/react @types/react-dom

# Clear TypeScript cache
rm -rf node_modules/.cache

# Rebuild
yarn build
```

---

## Testing and Verification

### Quick Verification Checklist

After making fixes:

- [ ] Build all applications: `yarn build`
- [ ] Check for linting errors: `yarn lint`
- [ ] Run unit tests: `yarn test:unit`
- [ ] Test production locally: `yarn prod:local`
- [ ] Verify no console errors in browser
- [ ] Test all navigation routes
- [ ] Test authentication flow
- [ ] Verify MFE content loads
- [ ] Check network tab for failed requests

### Production Deployment Verification

After deploying to production:

- [ ] Root URL redirects correctly
- [ ] All MFEs load without errors
- [ ] Authentication works
- [ ] Theme changes save and persist
- [ ] Protected routes work correctly
- [ ] No console errors
- [ ] CloudFront cache invalidated if needed

---

## Getting Help

If you encounter issues not covered in this guide:

1. **Check console errors:** Open browser DevTools and look for error messages
2. **Check network tab:** Look for failed requests or CORS errors
3. **Review build output:** Check for build-time errors or warnings
4. **Check CloudFormation events:** Look for stack update failures
5. **Review application logs:** Check browser console and server logs
6. **Consult other documentation:**
   - [Developer Guide](./DEVELOPER.md)
   - [AWS Deployment Guide](./AWS_DEPLOYMENT_GUIDE.md)
   - [Testing Guide](./TESTING.md)

---

## Related Documentation

- **[DEVELOPER.md](./DEVELOPER.md)** - Development setup and workflow
- **[AWS_DEPLOYMENT_GUIDE.md](./AWS_DEPLOYMENT_GUIDE.md)** - Complete AWS deployment instructions
- **[TESTING.md](./TESTING.md)** - Testing strategies and setup
- **[CUSTOM_THEME_GUIDE.md](./CUSTOM_THEME_GUIDE.md)** - Theme customization guide

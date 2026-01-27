# Root URL Routing Fix

## Problem

When accessing the production deployment at the root URL (e.g., https://mfe.world/), the application displayed nothing. However, accessing https://mfe.world/container/ worked correctly.

## Root Cause

The CloudFront configuration included a `DefaultRootObject: container/index.html` setting. This caused CloudFront to serve the container app's HTML file when users visited the root URL `/`, but with a critical issue:

1. The browser URL remained at `/` (root)
2. The React app was built with `basename="/container/"` 
3. React Router expected to be at `/container/`, not `/`
4. This mismatch caused the routing to fail silently, resulting in a blank page

### Why This Happened

CloudFront's `DefaultRootObject` serves a specific object for root requests, but **does not redirect the browser**. The browser stays at `/`, while the application code expects to be at `/container/`. This creates a routing conflict where:
- Browser is at: `/`
- React Router expects to be at: `/container/`
- Result: No routes match, blank page

## Solution

The fix involves two changes:

1. **Removed the `DefaultRootObject` from CloudFront configuration**: This prevents CloudFront from serving a confusing response where the URL and content don't match.

2. **Added client-side redirect in App.tsx**: When the app loads at the root URL `/` but is built for `/container/`, it now automatically redirects the browser to `/container/`. This ensures the browser URL matches the React Router basename.

### How It Works

When a user visits `/` (root URL):
1. CloudFront doesn't find an object at root → returns 403/404 error
2. CustomErrorResponses serves `/container/index.html` with 200 status (browser still at `/`)
3. React app loads and detects URL mismatch
4. Client-side redirect: `window.location.replace('/container/')`
5. Browser navigates to `/container/`
6. React app loads correctly with matching basename

### Files Changed

- `cloudformation/templates/s3-cloudfront.yaml`: Removed `DefaultRootObject: container/index.html`
- `apps/container/src/App.tsx`: Added client-side redirect when URL mismatch is detected

## Deployment

To deploy this fix to production:

1. **Update the CloudFormation Stack**:
   ```bash
   cd deployment
   ./deploy-cloudformation.sh
   ```

2. **Wait for Stack Update**: The CloudFormation stack update will modify the CloudFront distribution configuration. This typically takes 10-15 minutes.

3. **Test the Fix**:
   - Visit https://mfe.world/ (should automatically redirect to https://mfe.world/container/)
   - Verify the UI loads correctly
   - Test authentication and navigation

## How It Works Now

### CloudFront Configuration (Updated)

```yaml
CustomErrorResponses:
  - ErrorCode: 403
    ResponseCode: 200
    ResponsePagePath: /container/index.html
    ErrorCachingMinTTL: 0
  - ErrorCode: 404
    ResponseCode: 200
    ResponsePagePath: /container/index.html
    ErrorCachingMinTTL: 0
```

### Request Flow

1. **Root URL Request** (`/`):
   - CloudFront: 403 error (no object at root)
   - Error Response: Serve `/container/index.html`, status 200 (browser URL stays at `/`)
   - React App: Detects URL mismatch (at `/` but expects `/container/`)
   - Client-side Redirect: `window.location.replace('/container/')`
   - Browser: Navigates to `/container/`
   - App: Loads correctly with matching basename

2. **Container URL Request** (`/container/`):
   - CloudFront: Serves `/container/index.html`
   - Browser: At `/container/`
   - App: Loads correctly with matching basename (no redirect needed)

3. **Any Other URL** (e.g., `/preferences/general`):
   - CloudFront: 404 error (no object at path)
   - Error Response: Serve `/container/index.html`, status 200
   - Browser: URL stays at `/preferences/general`
   - React Router: Takes over, handles SPA routing

## Testing Locally

You cannot fully test this locally without deploying to AWS, as it requires CloudFront's error response handling. However, you can verify the app works correctly at `/container/`:

```bash
# Build all apps
yarn build:all

# Create local server structure
mkdir -p www
cp -r apps/container/dist www/container
cp -r apps/home/dist www/home
cp -r apps/preferences/dist www/preferences
cp -r apps/account/dist www/account
cp -r apps/admin/dist www/admin

# Serve locally
cd www
python3 -m http.server 8000

# Open: http://localhost:8000/container/
```

## Alternative Solutions Considered

1. **Use `base: '/'` in vite.config.ts**: This would require deploying the container app files to the root of S3, breaking the organizational structure and requiring changes to all MFE deployments.

2. **CloudFront Function for Redirect**: Add a CloudFront Function to explicitly redirect `/` to `/container/`. This would be cleaner but requires more complex infrastructure setup. The current solution (client-side redirect) is simpler.

3. **Duplicate Deployment**: Deploy container app to both root and `/container/`. This wastes storage and complicates deployments.

## Related Issues

- The vite.config.ts correctly uses `base: '/container/'` for production builds
- The app's basename is correctly set to `import.meta.env.BASE_URL` which resolves to `/container/` in production
- No code changes were needed - only infrastructure configuration

## Verification Checklist

After deploying this fix, verify:

- [ ] https://mfe.world/ redirects to https://mfe.world/container/
- [ ] Application loads and displays correctly
- [ ] Login functionality works
- [ ] Navigation between MFEs works
- [ ] All assets (JS, CSS, fonts) load correctly
- [ ] No console errors related to missing resources

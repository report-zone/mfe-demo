# Production Display Fix - Multiple React Instances Issue

## Issue
Production site at https://mfe.world displayed nothing and showed the error:
```
TypeError: Cannot read properties of null (reading 'useRef')
```

## Root Cause Analysis

### The Problem
When the browser loaded the application, it was loading **multiple React instances**:

1. `react@18.3.1` - loaded directly from the import map
2. `react@>=16.8?target=es2022` - loaded as a peer dependency of `react-dom`
3. `react@>=16.8?target=es2022` - loaded as a peer dependency of `react-router-dom`

### Why This Breaks React Hooks
React hooks (like `useRef`, `useState`, etc.) rely on a single shared React instance to maintain their internal state. When multiple React instances are loaded:
- Each instance maintains its own separate internal state
- Hooks called in components try to access state from one React instance
- But the component is rendered by a different React instance
- Result: `null` values where hooks expect data, causing the error

### Why This Happened
The esm.sh CDN, by default, loads peer dependencies with version ranges when the `?deps` parameter is not specified. So:
- `react-dom@18.3.1` required `react@>=16.8` 
- `react-router-dom@6.21.3` required `react@>=16.8`

Even though `react@18.3.1` was in the import map, esm.sh loaded additional React versions to satisfy these peer dependency ranges.

## The Solution

### Updated Import Map
Changed from:
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

To:
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

### Key Changes
The `?deps=` parameter explicitly tells esm.sh:
- "For react-dom, use react@18.3.1 (not react@>=16.8)"
- "For react-dom/client, use react@18.3.1 (not react@>=16.8)"
- "For react-router-dom, use react@18.3.1 and react-dom@18.3.1 (not version ranges)"

This ensures **only ONE React instance** is loaded and shared by all packages.

## Files Changed
1. **apps/container/index.html** - Updated import map with `?deps` parameter
2. **MFE_PRODUCTION_FIX.md** - Added documentation about the critical importance of `?deps`

## Verification

### Before Fix
Browser Network tab shows multiple React loads:
- `react@18.3.1`
- `react@>=16.8?target=es2022` (from react-dom)
- `react@>=16.8?target=es2022` (from react-router-dom)

Console error:
```
TypeError: Cannot read properties of null (reading 'useRef')
```

### After Fix
Browser Network tab shows single React load:
- `react@18.3.1` (shared by all packages)

No console errors, application displays correctly.

## Deployment Instructions

### To Deploy This Fix:
```bash
# 1. Build the container (MFEs don't need rebuilding)
cd apps/container
yarn build

# 2. Deploy to S3/CloudFront
aws s3 sync dist/ s3://your-bucket/container/ --delete

# 3. Invalidate CloudFront cache (if using)
aws cloudfront create-invalidation --distribution-id YOUR_DIST_ID --paths "/container/*"
```

### No MFE Changes Required
The MFEs (home, preferences, account, admin) do NOT need to be rebuilt or redeployed. They already externalize React correctly. Only the container needed this import map fix.

## Key Takeaways

### For esm.sh Usage:
1. **Always use `?deps=` parameter** when packages have peer dependencies
2. Pin all peer dependencies to exact versions to avoid multiple instances
3. The pattern is: `package@version?deps=dep1@version1,dep2@version2`

### For Micro Frontends:
1. Shared dependencies (React, ReactDOM, etc.) MUST be the same instance
2. Import maps are critical for resolving bare module specifiers
3. Test production builds carefully - development may work while production fails

### For React Specifically:
1. Multiple React instances break hooks completely
2. The error "Cannot read properties of null" from hooks is a strong indicator of multiple React instances
3. Always verify only one React instance is loaded (check Network tab)

## Testing Checklist

- [ ] Build container with remote MFE URLs
- [ ] Deploy to production environment
- [ ] Open browser developer tools Network tab
- [ ] Load the application
- [ ] Verify only ONE request to React is made
- [ ] Verify no console errors
- [ ] Verify application displays correctly
- [ ] Test navigation between MFEs
- [ ] Verify hooks work correctly in all MFEs

## References
- [esm.sh Documentation - deps parameter](https://esm.sh/)
- [React Hooks - Rules of Hooks](https://react.dev/reference/rules/rules-of-hooks)
- [Import Maps Specification](https://github.com/WICG/import-maps)
- Previous fix: MFE_PRODUCTION_FIX.md (import map setup)

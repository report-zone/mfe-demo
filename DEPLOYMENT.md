# Deployment Guide

This guide explains how to deploy the MFE Demo application to AWS S3 and CloudFront.

## Prerequisites

1. AWS CLI installed and configured
2. AWS credentials with appropriate permissions
3. S3 bucket created (e.g., `app.mfeworld.com`)
4. CloudFront distribution configured
5. All applications built locally

## Environment Variables

Set the following environment variables before deploying:

```bash
export S3_BUCKET=app.mfeworld.com
export CLOUDFRONT_DIST_ID=XYXYXYXYXYX
export AWS_REGION=us-east-1
```

## Deployment Scripts

### Deploy Single Application

Deploy a specific MFE application:

```bash
./scripts/deploy.sh <app-name> [environment]
```

Examples:
```bash
# Deploy container app to production
./scripts/deploy.sh container

# Deploy home MFE to staging
./scripts/deploy.sh home staging

# Deploy admin MFE
./scripts/deploy.sh admin
```

Available app names:
- `container`
- `home`
- `preferences`
- `account`
- `admin`

### Deploy All Applications

Deploy all MFE applications at once:

```bash
./scripts/deploy-all.sh [environment]
```

Examples:
```bash
# Deploy all to production
./scripts/deploy-all.sh

# Deploy all to staging
./scripts/deploy-all.sh staging
```

## Manual Deployment

If you prefer to deploy manually:

### 1. Build the Application

```bash
# Build specific app
yarn build:container
yarn build:home
yarn build:preferences
yarn build:account
yarn build:admin

# Or build all
yarn build
```

### 2. Upload to S3

```bash
# Sync the dist folder to S3
aws s3 sync apps/<app-name>/dist s3://app.mfeworld.com/<app-name>/ \
  --delete \
  --cache-control "public, max-age=31536000, immutable" \
  --exclude "index.html"

# Upload index.html with no-cache
aws s3 cp apps/<app-name>/dist/index.html s3://app.mfeworld.com/<app-name>/index.html \
  --cache-control "no-cache, no-store, must-revalidate"
```

### 3. Invalidate CloudFront Cache

```bash
aws cloudfront create-invalidation \
  --distribution-id XYXYXYXYXYX \
  --paths "/<app-name>/*"
```

## S3 Bucket Structure

After deployment, your S3 bucket will have the following structure:

```
s3://app.mfeworld.com/
├── container/
│   ├── index.html
│   └── assets/
│       ├── index-*.js
│       └── *.css
├── home/
│   └── home-mfe.js
├── preferences/
│   └── preferences-mfe.js
├── account/
│   └── account-mfe.js
└── admin/
    └── admin-mfe.js
```

## S3 Bucket Configuration

### Bucket Policy

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PublicReadGetObject",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::app.mfeworld.com/*"
    }
  ]
}
```

### Static Website Hosting

Enable static website hosting on the S3 bucket:
- Index document: `container/index.html`
- Error document: `container/index.html`

## CloudFront Configuration

### Origin Settings

- **Origin Domain Name**: `app.mfeworld.com.s3.amazonaws.com`
- **Origin Path**: Leave empty
- **Origin Access**: Public

### Behavior Settings

- **Viewer Protocol Policy**: Redirect HTTP to HTTPS
- **Allowed HTTP Methods**: GET, HEAD, OPTIONS
- **Cached HTTP Methods**: GET, HEAD, OPTIONS
- **Cache Policy**: CachingOptimized (or custom)

### Custom Error Responses

Configure error responses to handle client-side routing:

| HTTP Error Code | Custom Error Response | Response Page Path | Response Code |
|-----------------|------------------------|-------------------|---------------|
| 403             | Yes                    | /container/index.html | 200           |
| 404             | Yes                    | /container/index.html | 200           |

## Import Maps Configuration

In production, the container app will use import maps to load MFEs dynamically. Update the container's `index.html` with:

```html
<script type="importmap">
{
  "imports": {
    "home-mfe": "https://app.mfeworld.com/home/home-mfe.js",
    "preferences-mfe": "https://app.mfeworld.com/preferences/preferences-mfe.js",
    "account-mfe": "https://app.mfeworld.com/account/account-mfe.js",
    "admin-mfe": "https://app.mfeworld.com/admin/admin-mfe.js"
  }
}
</script>
```

## CI/CD Integration

### GitHub Actions Example

```yaml
name: Deploy to AWS

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          
      - name: Install dependencies
        run: yarn install
        
      - name: Build applications
        run: yarn build
        
      - name: Configure AWS credentials
        uses: aws-actions/configure-aws-credentials@v2
        with:
          aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
          aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          aws-region: us-east-1
          
      - name: Deploy to S3
        run: ./scripts/deploy-all.sh production
```

## Environment-Specific Deployments

### Production
```bash
export S3_BUCKET=app.mfeworld.com
export CLOUDFRONT_DIST_ID=XYXYXYXYXYX
./scripts/deploy-all.sh production
```

### Staging
```bash
export S3_BUCKET=staging.mfeworld.com
export CLOUDFRONT_DIST_ID=YZYZYZYZYZYZ
./scripts/deploy-all.sh staging
```

### Development
```bash
export S3_BUCKET=dev.mfeworld.com
export CLOUDFRONT_DIST_ID=ZWZWZWZWZW
./scripts/deploy-all.sh development
```

## Rollback

To rollback to a previous version:

1. Use S3 versioning to restore previous files
2. Invalidate CloudFront cache
3. Or redeploy from a previous git tag

```bash
# Checkout previous version
git checkout v1.0.0

# Rebuild and deploy
yarn build
./scripts/deploy-all.sh production
```

## Monitoring

After deployment, monitor:

1. **CloudFront Metrics**: Requests, data transfer, error rates
2. **S3 Metrics**: Storage, requests
3. **Browser Console**: Check for loading errors
4. **Application Logs**: Monitor authentication and routing

## Troubleshooting

### MFE Not Loading

1. Check S3 bucket permissions
2. Verify CloudFront cache invalidation completed
3. Check browser console for CORS errors
4. Verify import map URLs are correct

### Authentication Issues

1. Verify Cognito configuration in environment variables
2. Check CORS settings in API Gateway (if applicable)
3. Verify user pool and client IDs

### Routing Issues

1. Verify CloudFront error response configuration
2. Check that all routes are wrapped in BrowserRouter
3. Ensure base path is correctly configured

## Security Considerations

1. **HTTPS Only**: Always use HTTPS in production
2. **Cognito Configuration**: Use secure authentication settings
3. **S3 Bucket**: Use bucket policies to restrict access
4. **CloudFront**: Enable WAF for additional security
5. **Secrets**: Never commit AWS credentials or Cognito secrets

## Cost Optimization

1. **CloudFront Caching**: Use appropriate cache policies
2. **S3 Lifecycle Rules**: Archive old versions
3. **Compression**: Enable Gzip/Brotli compression
4. **Image Optimization**: Use WebP format when possible

## Support

For issues or questions, please open an issue in the GitHub repository.

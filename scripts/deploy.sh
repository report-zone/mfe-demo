#!/bin/bash

# Deploy MFE applications to S3 and invalidate CloudFront cache
# Usage: ./deploy.sh <app-name> [environment]

set -e

APP_NAME=$1
ENVIRONMENT=${2:-production}
S3_BUCKET=${S3_BUCKET:-"app.mfeworld.com"}
CLOUDFRONT_DIST_ID=${CLOUDFRONT_DIST_ID:-"XYXYXYXYXYX"}

if [ -z "$APP_NAME" ]; then
  echo "Usage: ./deploy.sh <app-name> [environment]"
  echo "Available apps: container, home, preferences, account, admin"
  exit 1
fi

# Validate app name
if [[ ! "$APP_NAME" =~ ^(container|home|preferences|account|admin)$ ]]; then
  echo "Error: Invalid app name. Must be one of: container, home, preferences, account, admin"
  exit 1
fi

echo "🚀 Deploying $APP_NAME to $ENVIRONMENT..."

# Build the app
echo "📦 Building $APP_NAME..."
yarn build:$APP_NAME

# Deploy to S3
echo "☁️  Uploading to S3: s3://$S3_BUCKET/$APP_NAME/..."
aws s3 sync apps/$APP_NAME/dist s3://$S3_BUCKET/$APP_NAME/ \
  --delete \
  --cache-control "public, max-age=31536000, immutable" \
  --exclude "index.html"

# Upload index.html separately with no-cache
if [ -f "apps/$APP_NAME/dist/index.html" ]; then
  aws s3 cp apps/$APP_NAME/dist/index.html s3://$S3_BUCKET/$APP_NAME/index.html \
    --cache-control "no-cache, no-store, must-revalidate"
fi

# Invalidate CloudFront cache
echo "🔄 Invalidating CloudFront cache..."
aws cloudfront create-invalidation \
  --distribution-id $CLOUDFRONT_DIST_ID \
  --paths "/$APP_NAME/*"

echo "✅ Deployment complete!"
echo "🌐 URL: https://$S3_BUCKET/$APP_NAME/"

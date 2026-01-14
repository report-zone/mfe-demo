#!/bin/bash

# Deploy all MFE applications
# Usage: ./deploy-all.sh [environment]

set -e

ENVIRONMENT=${1:-production}

echo "🚀 Deploying all MFE applications to $ENVIRONMENT..."

# Build all apps
echo "📦 Building all applications..."
yarn build

# Deploy each app
for APP in container home preferences account admin; do
  echo ""
  echo "Deploying $APP..."
  ./scripts/deploy.sh $APP $ENVIRONMENT
done

echo ""
echo "✅ All deployments complete!"

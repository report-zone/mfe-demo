#!/bin/bash

###############################################################################
# MFE Demo - Deploy Applications to S3
# This script builds and deploys the applications to S3
###############################################################################

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"
CONFIG_FILE="${PROJECT_ROOT}/deployment/config.yaml"
INFRA_INFO_FILE="${PROJECT_ROOT}/deployment/infrastructure-info.txt"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_header() {
    echo ""
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${BLUE}  $1${NC}"
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo ""
}

# Check if config file exists
if [ ! -f "$CONFIG_FILE" ]; then
    print_error "Configuration file not found: $CONFIG_FILE"
    print_info "Please copy deployment/config.example.yaml to deployment/config.yaml and configure it"
    exit 1
fi

# Check if infrastructure has been deployed
if [ ! -f "$INFRA_INFO_FILE" ]; then
    print_error "Infrastructure info file not found: $INFRA_INFO_FILE"
    print_info "Please deploy infrastructure first using: ./deployment/deploy-cloudformation.sh"
    exit 1
fi

# Load infrastructure info
source "$INFRA_INFO_FILE"

# Function to parse YAML
parse_yaml() {
    local prefix=$1
    local file=$2
    local s='[[:space:]]*'
    local w='[a-zA-Z0-9_]*'
    local fs=$(echo @|tr @ '\034')
    
    sed -ne "s|^\($s\):|\1|" \
        -e "s|^\($s\)\($w\)$s:$s[\"']\(.*\)[\"']$s\$|\1$fs\2$fs\3|p" \
        -e "s|^\($s\)\($w\)$s:$s\(.*\)$s\$|\1$fs\2$fs\3|p" "$file" |
    awk -F$fs '{
        indent = length($1)/2;
        vname[indent] = $2;
        for (i in vname) {if (i > indent) {delete vname[i]}}
        if (length($3) > 0) {
            vn=""; for (i=0; i<indent; i++) {vn=(vn)(vname[i])("_")}
            printf("%s%s%s=\"%s\"\n", "'$prefix'",vn, $2, $3);
        }
    }' | grep -v '^#' | grep -v '^\s*$'
}

# Parse configuration
print_info "Loading configuration..."
eval $(parse_yaml "" "$CONFIG_FILE")

# Set AWS CLI profile if specified
if [ -n "$aws_profile" ]; then
    export AWS_PROFILE="$aws_profile"
fi

# Set AWS region
if [ -n "$aws_region" ]; then
    export AWS_REGION="$aws_region"
    export AWS_DEFAULT_REGION="$aws_region"
fi

# Get command line arguments
APP_NAME=${1:-all}
SKIP_BUILD=${2:-false}

###############################################################################
# Function to build an application
###############################################################################
build_app() {
    local app_name=$1
    
    print_header "Building: $app_name"
    
    cd "$PROJECT_ROOT"
    
    print_info "Running build for $app_name..."
    yarn build:$app_name
    
    if [ $? -eq 0 ]; then
        print_success "Build completed for $app_name"
        return 0
    else
        print_error "Build failed for $app_name"
        return 1
    fi
}

###############################################################################
# Function to deploy an application to S3
###############################################################################
deploy_app() {
    local app_name=$1
    local bucket_name=$2
    
    print_header "Deploying: $app_name"
    
    local dist_dir="${PROJECT_ROOT}/apps/${app_name}/dist"
    
    # Check if dist directory exists
    if [ ! -d "$dist_dir" ]; then
        print_error "Distribution directory not found: $dist_dir"
        print_info "Please build the application first"
        return 1
    fi
    
    # Upload assets with long cache
    print_info "Uploading static assets to S3..."
    aws s3 sync "$dist_dir" "s3://${bucket_name}/${app_name}/" \
        --delete \
        --cache-control "public, max-age=${deployment_cache_static_max_age:-31536000}, immutable" \
        --exclude "index.html" \
        --exclude "*.map" \
        --region "$AWS_REGION"
    
    if [ $? -ne 0 ]; then
        print_error "Failed to upload static assets"
        return 1
    fi
    
    # Upload index.html with no cache (if exists)
    if [ -f "$dist_dir/index.html" ]; then
        print_info "Uploading index.html with no-cache..."
        aws s3 cp "$dist_dir/index.html" "s3://${bucket_name}/${app_name}/index.html" \
            --cache-control "no-cache, no-store, must-revalidate" \
            --content-type "text/html" \
            --region "$AWS_REGION"
        
        if [ $? -ne 0 ]; then
            print_error "Failed to upload index.html"
            return 1
        fi
    fi
    
    print_success "Deployed $app_name to s3://${bucket_name}/${app_name}/"
    return 0
}

###############################################################################
# Function to invalidate CloudFront cache
###############################################################################
invalidate_cache() {
    local app_name=$1
    local distribution_id=$2
    
    print_info "Invalidating CloudFront cache for $app_name..."
    
    local invalidation_path="/${app_name}/*"
    
    INVALIDATION_ID=$(aws cloudfront create-invalidation \
        --distribution-id "$distribution_id" \
        --paths "$invalidation_path" \
        --query 'Invalidation.Id' \
        --output text \
        --region "$AWS_REGION")
    
    if [ $? -eq 0 ]; then
        print_success "Invalidation created: $INVALIDATION_ID"
        print_info "Waiting for invalidation to complete..."
        
        # Wait for invalidation in background and show progress
        aws cloudfront wait invalidation-completed \
            --distribution-id "$distribution_id" \
            --id "$INVALIDATION_ID" \
            --region "$AWS_REGION" 2>/dev/null &
        
        local wait_pid=$!
        
        # Show progress while waiting
        while kill -0 $wait_pid 2>/dev/null; do
            echo -n "."
            sleep 2
        done
        
        # Wait for the background process and capture exit status
        wait $wait_pid
        local wait_status=$?
        
        echo ""
        
        if [ $wait_status -eq 0 ]; then
            print_success "Cache invalidation completed"
        else
            print_warning "Cache invalidation is in progress (check AWS console for status)"
            print_info "This is normal - invalidation can take several minutes"
        fi
        
        return 0
    else
        print_error "Failed to create invalidation"
        return 1
    fi
}

###############################################################################
# Function to deploy a single app (build + deploy + invalidate)
###############################################################################
deploy_single_app() {
    local app_name=$1
    
    # Build
    if [ "$SKIP_BUILD" != "true" ]; then
        build_app "$app_name" || return 1
    else
        print_warning "Skipping build for $app_name"
    fi
    
    # Deploy
    deploy_app "$app_name" "$BUCKET_NAME" || return 1
    
    # Invalidate cache
    invalidate_cache "$app_name" "$CLOUDFRONT_DISTRIBUTION_ID" || return 1
    
    print_success "Successfully deployed $app_name"
    return 0
}

###############################################################################
# Main execution
###############################################################################
print_header "MFE Demo - Application Deployment"

print_info "Bucket: $BUCKET_NAME"
print_info "CloudFront Distribution: $CLOUDFRONT_DISTRIBUTION_ID"
print_info "Website URL: $WEBSITE_URL"

if [ "$APP_NAME" == "all" ]; then
    print_header "Deploying All Applications"
    
    # Build all first
    if [ "$SKIP_BUILD" != "true" ]; then
        print_info "Building all applications..."
        cd "$PROJECT_ROOT"
        yarn build
        
        if [ $? -ne 0 ]; then
            print_error "Build failed"
            exit 1
        fi
    fi
    
    # Deploy each app
    APPS=("container" "home" "preferences" "account" "admin")
    FAILED_APPS=()
    
    for app in "${APPS[@]}"; do
        echo ""
        if ! deploy_app "$app" "$BUCKET_NAME"; then
            FAILED_APPS+=("$app")
        fi
    done
    
    # Invalidate all at once
    echo ""
    print_header "Invalidating CloudFront Cache"
    print_info "Invalidating cache for all applications..."
    
    INVALIDATION_ID=$(aws cloudfront create-invalidation \
        --distribution-id "$CLOUDFRONT_DISTRIBUTION_ID" \
        --paths "/*" \
        --query 'Invalidation.Id' \
        --output text \
        --region "$AWS_REGION")
    
    if [ $? -eq 0 ]; then
        print_success "Invalidation created: $INVALIDATION_ID"
        print_info "Cache invalidation is in progress"
    fi
    
    # Summary
    echo ""
    print_header "Deployment Summary"
    
    if [ ${#FAILED_APPS[@]} -eq 0 ]; then
        print_success "All applications deployed successfully!"
    else
        print_error "Some applications failed to deploy:"
        for app in "${FAILED_APPS[@]}"; do
            print_error "  - $app"
        done
        exit 1
    fi
    
else
    # Deploy single app
    deploy_single_app "$APP_NAME"
fi

print_header "Deployment Complete"
print_success "Applications are now live!"
print_info "Website URL: $WEBSITE_URL"
print_info ""
print_info "Note: CloudFront cache invalidation may take a few minutes"
print_info "Please wait 5-10 minutes before testing the application"

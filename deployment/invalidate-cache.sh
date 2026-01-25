#!/bin/bash

###############################################################################
# MFE Demo - Invalidate CloudFront Cache
# This script invalidates CloudFront cache for specific apps or all
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

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

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

# Parse configuration for AWS settings
if [ -f "$CONFIG_FILE" ]; then
    eval $(parse_yaml "" "$CONFIG_FILE")
    
    if [ -n "$aws_profile" ]; then
        export AWS_PROFILE="$aws_profile"
    fi
    
    if [ -n "$aws_region" ]; then
        export AWS_REGION="$aws_region"
        export AWS_DEFAULT_REGION="$aws_region"
    fi
fi

# Get arguments
TARGET=${1:-all}

print_info "CloudFront Distribution: $CLOUDFRONT_DISTRIBUTION_ID"

# Determine paths to invalidate
if [ "$TARGET" == "all" ]; then
    PATHS="/*"
    print_info "Invalidating all paths..."
else
    PATHS="/${TARGET}/*"
    print_info "Invalidating paths: $PATHS"
fi

# Create invalidation
print_info "Creating CloudFront invalidation..."

INVALIDATION_ID=$(aws cloudfront create-invalidation \
    --distribution-id "$CLOUDFRONT_DISTRIBUTION_ID" \
    --paths "$PATHS" \
    --query 'Invalidation.Id' \
    --output text)

if [ $? -eq 0 ]; then
    print_success "Invalidation created: $INVALIDATION_ID"
    print_info "Status: In Progress"
    print_info ""
    print_info "To check status, run:"
    print_info "aws cloudfront get-invalidation --distribution-id $CLOUDFRONT_DISTRIBUTION_ID --id $INVALIDATION_ID"
else
    print_error "Failed to create invalidation"
    exit 1
fi

#!/bin/bash

###############################################################################
# Quick Setup Guide
# Interactive setup wizard for MFE Demo deployment
###############################################################################

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
BOLD='\033[1m'
NC='\033[0m'

print_header() {
    echo ""
    echo -e "${BOLD}${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${BOLD}${BLUE}  $1${NC}"
    echo -e "${BOLD}${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo ""
}

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_step() {
    echo -e "${BOLD}${GREEN}$1${NC}"
}

###############################################################################
# Welcome
###############################################################################
clear
print_header "MFE Demo - AWS Deployment Setup Wizard"

echo "This wizard will help you set up deployment for the MFE Demo application."
echo ""
echo "Prerequisites:"
echo "  • AWS account with appropriate permissions"
echo "  • AWS CLI installed and configured"
echo "  • Route 53 hosted zone created"
echo "  • Node.js and Yarn installed"
echo ""
read -p "Press Enter to continue or Ctrl+C to exit..."

###############################################################################
# Step 1: Check Prerequisites
###############################################################################
print_header "Step 1: Checking Prerequisites"

MISSING_PREREQ=0

# Check AWS CLI
if command -v aws &> /dev/null; then
    AWS_VERSION=$(aws --version 2>&1 | cut -d' ' -f1)
    print_success "AWS CLI installed: $AWS_VERSION"
else
    print_error "AWS CLI not found"
    print_info "Install from: https://aws.amazon.com/cli/"
    MISSING_PREREQ=1
fi

# Check Node.js
if command -v node &> /dev/null; then
    NODE_VERSION=$(node --version)
    print_success "Node.js installed: $NODE_VERSION"
else
    print_error "Node.js not found"
    print_info "Install from: https://nodejs.org/"
    MISSING_PREREQ=1
fi

# Check Yarn
if command -v yarn &> /dev/null; then
    YARN_VERSION=$(yarn --version)
    print_success "Yarn installed: $YARN_VERSION"
else
    print_error "Yarn not found"
    print_info "Install: npm install -g yarn"
    MISSING_PREREQ=1
fi

if [ $MISSING_PREREQ -eq 1 ]; then
    echo ""
    print_error "Missing prerequisites. Please install required software."
    exit 1
fi

# Check AWS credentials
print_info "Checking AWS credentials..."
if aws sts get-caller-identity &> /dev/null; then
    AWS_ACCOUNT=$(aws sts get-caller-identity --query Account --output text)
    AWS_USER=$(aws sts get-caller-identity --query Arn --output text)
    print_success "AWS credentials configured"
    print_info "Account: $AWS_ACCOUNT"
    print_info "User/Role: $AWS_USER"
else
    print_error "AWS credentials not configured"
    print_info "Run: aws configure"
    exit 1
fi

echo ""
read -p "Press Enter to continue..."

###############################################################################
# Step 2: Configuration
###############################################################################
print_header "Step 2: Create Configuration File"

CONFIG_FILE="$PROJECT_ROOT/deployment/config.yaml"

if [ -f "$CONFIG_FILE" ]; then
    print_warning "Configuration file already exists: $CONFIG_FILE"
    read -p "Do you want to overwrite it? (y/N): " OVERWRITE
    if [[ ! "$OVERWRITE" =~ ^[Yy]$ ]]; then
        print_info "Keeping existing configuration"
        echo ""
        read -p "Press Enter to continue..."
    else
        cp "$PROJECT_ROOT/deployment/config.example.yaml" "$CONFIG_FILE"
        print_success "Configuration file recreated"
    fi
else
    cp "$PROJECT_ROOT/deployment/config.example.yaml" "$CONFIG_FILE"
    print_success "Configuration file created: $CONFIG_FILE"
fi

echo ""
print_info "Now let's configure your deployment settings..."
echo ""

# Get AWS region
read -p "AWS Region (default: us-east-1): " AWS_REGION
AWS_REGION=${AWS_REGION:-us-east-1}

# Get domain name
echo ""
print_info "Enter your domain name (e.g., app.mfeworld.com)"
print_warning "This domain must have a Route 53 hosted zone"
read -p "Domain name: " DOMAIN_NAME

if [ -z "$DOMAIN_NAME" ]; then
    print_error "Domain name is required"
    exit 1
fi

# Get hosted zone ID
echo ""
print_info "Getting Route 53 hosted zones..."
echo ""

# Try to find hosted zone
HOSTED_ZONES=$(aws route53 list-hosted-zones --query "HostedZones[?Name=='${DOMAIN_NAME}.' || Name=='${DOMAIN_NAME}'].{Id:Id,Name:Name}" --output table 2>/dev/null)

if [ -n "$HOSTED_ZONES" ]; then
    echo "$HOSTED_ZONES"
    echo ""
    print_info "Found hosted zone(s) above"
else
    print_warning "No hosted zones found for $DOMAIN_NAME"
fi

echo ""
print_info "Enter your Route 53 Hosted Zone ID"
print_info "Format: Z1234567890ABC (without '/hostedzone/' prefix)"
read -p "Hosted Zone ID: " HOSTED_ZONE_ID

if [ -z "$HOSTED_ZONE_ID" ]; then
    print_error "Hosted Zone ID is required"
    exit 1
fi

# Get environment
echo ""
read -p "Environment (development/staging/production, default: production): " ENVIRONMENT
ENVIRONMENT=${ENVIRONMENT:-production}

# Update configuration file
echo ""
print_info "Updating configuration file..."

# Use | as delimiter to avoid issues with forward slashes in values
sed -i "s|region: us-east-1|region: $AWS_REGION|" "$CONFIG_FILE"
sed -i "s|account_id: \"123456789012\"|account_id: \"$AWS_ACCOUNT\"|" "$CONFIG_FILE"
sed -i "s|name: app.mfeworld.com|name: $DOMAIN_NAME|" "$CONFIG_FILE"
sed -i "s|hosted_zone_id: Z1234567890ABC|hosted_zone_id: $HOSTED_ZONE_ID|" "$CONFIG_FILE"
sed -i "s|environment: production|environment: $ENVIRONMENT|" "$CONFIG_FILE"
sed -i "s|bucket_name: app.mfeworld.com|bucket_name: $DOMAIN_NAME|" "$CONFIG_FILE"

print_success "Configuration updated"

echo ""
print_info "Configuration Summary:"
print_info "  AWS Region: $AWS_REGION"
print_info "  AWS Account: $AWS_ACCOUNT"
print_info "  Domain: $DOMAIN_NAME"
print_info "  Hosted Zone: $HOSTED_ZONE_ID"
print_info "  Environment: $ENVIRONMENT"

echo ""
read -p "Press Enter to continue..."

###############################################################################
# Step 3: Review Configuration
###############################################################################
print_header "Step 3: Review Configuration"

print_info "Configuration file: $CONFIG_FILE"
echo ""
echo "You can review and edit the configuration file before proceeding."
echo ""
read -p "Do you want to edit the configuration file now? (y/N): " EDIT_CONFIG

if [[ "$EDIT_CONFIG" =~ ^[Yy]$ ]]; then
    ${EDITOR:-nano} "$CONFIG_FILE"
fi

echo ""
read -p "Press Enter to continue..."

###############################################################################
# Step 4: Next Steps
###############################################################################
print_header "Setup Complete!"

print_success "Configuration has been created successfully"
echo ""
print_step "Next Steps:"
echo ""
echo "1. Install dependencies (if not already done):"
echo "   ${BOLD}cd $PROJECT_ROOT${NC}"
echo "   ${BOLD}yarn install${NC}"
echo ""
echo "2. Deploy AWS infrastructure (CloudFormation):"
echo "   ${BOLD}./deployment/deploy-cloudformation.sh all${NC}"
echo ""
echo "   This will create:"
echo "   • S3 bucket for hosting"
echo "   • CloudFront distribution with HTTPS"
echo "   • ACM certificate (DNS validation required)"
echo "   • Cognito User Pool and Client"
echo ""
echo "3. Wait for ACM certificate validation (5-30 minutes)"
echo "   Check AWS Console → Certificate Manager"
echo ""
echo "4. Build and deploy applications:"
echo "   ${BOLD}./deployment/deploy-apps.sh all${NC}"
echo ""
echo "5. Create users in Cognito:"
echo "   See AWS_DEPLOYMENT_GUIDE.md for instructions"
echo ""
echo "6. Access your application:"
echo "   ${BOLD}https://$DOMAIN_NAME${NC}"
echo ""
print_info "For detailed instructions, see: AWS_DEPLOYMENT_GUIDE.md"
echo ""
print_warning "Important Notes:"
echo "  • Certificate validation can take up to 30 minutes"
echo "  • Ensure your domain nameservers point to Route 53"
echo "  • CloudFront distribution takes 15-20 minutes to deploy"
echo ""

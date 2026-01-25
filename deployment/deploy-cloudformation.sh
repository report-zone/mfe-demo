#!/bin/bash

###############################################################################
# MFE Demo - Deploy CloudFormation Stacks
# This script deploys the infrastructure using CloudFormation
###############################################################################

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"
CONFIG_FILE="${PROJECT_ROOT}/deployment/config.yaml"

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

# Function to parse YAML (simple key-value parsing)
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
print_info "Loading configuration from $CONFIG_FILE..."
eval $(parse_yaml "" "$CONFIG_FILE")

# Set AWS CLI profile if specified
if [ -n "$aws_profile" ]; then
    export AWS_PROFILE="$aws_profile"
    print_info "Using AWS Profile: $aws_profile"
fi

# Set AWS region
if [ -n "$aws_region" ]; then
    export AWS_REGION="$aws_region"
    export AWS_DEFAULT_REGION="$aws_region"
    print_info "Using AWS Region: $aws_region"
fi

# Verify AWS credentials
print_info "Verifying AWS credentials..."
if ! aws sts get-caller-identity &> /dev/null; then
    print_error "AWS credentials not configured correctly"
    print_info "Please configure AWS CLI or set credentials in config.yaml"
    exit 1
fi

AWS_ACCOUNT=$(aws sts get-caller-identity --query Account --output text)
print_success "Connected to AWS Account: $AWS_ACCOUNT"

# Get command line argument
COMMAND=${1:-all}

###############################################################################
# Function to deploy CloudFormation stack
###############################################################################
deploy_stack() {
    local stack_name=$1
    local template_file=$2
    local parameters=$3
    
    print_header "Deploying Stack: $stack_name"
    
    # Check if template exists
    if [ ! -f "$template_file" ]; then
        print_error "Template file not found: $template_file"
        return 1
    fi
    
    # Check if stack exists and get its status
    if aws cloudformation describe-stacks --stack-name "$stack_name" &> /dev/null; then
        STACK_STATUS=$(aws cloudformation describe-stacks \
            --stack-name "$stack_name" \
            --query 'Stacks[0].StackStatus' \
            --output text \
            --region "$AWS_REGION")
        
        # If stack is in a failed state, it must be deleted before creating
        if [ "$STACK_STATUS" == "ROLLBACK_COMPLETE" ] || [ "$STACK_STATUS" == "UPDATE_ROLLBACK_FAILED" ]; then
            print_warning "Stack is in $STACK_STATUS state and cannot be updated"
            print_info "Deleting stack before recreating..."
            
            aws cloudformation delete-stack \
                --stack-name "$stack_name" \
                --region "$AWS_REGION"
            
            print_info "Waiting for stack deletion to complete..."
            aws cloudformation wait stack-delete-complete \
                --stack-name "$stack_name" \
                --region "$AWS_REGION"
            
            print_success "Stack deleted successfully"
            print_info "Creating new stack..."
            OPERATION="create-stack"
        elif [[ "$STACK_STATUS" == *"FAILED"* ]] && [ "$STACK_STATUS" != "ROLLBACK_COMPLETE" ] && [ "$STACK_STATUS" != "UPDATE_ROLLBACK_FAILED" ]; then
            # Handle other failed states that may need manual intervention (e.g., DELETE_FAILED, ROLLBACK_FAILED)
            print_error "Stack is in $STACK_STATUS state"
            print_error "This state may require manual intervention"
            print_info "Please check the stack in AWS Console and delete it manually if needed"
            return 1
        elif [[ "$STACK_STATUS" == *"ROLLBACK"* ]] && [ "$STACK_STATUS" != "ROLLBACK_COMPLETE" ] && [ "$STACK_STATUS" != "UPDATE_ROLLBACK_FAILED" ]; then
            # Handle rollback-in-progress states
            print_warning "Stack is in $STACK_STATUS state"
            print_info "Please wait for the rollback to complete or fail, then try again"
            return 1
        else
            print_info "Stack exists in $STACK_STATUS state. Updating..."
            OPERATION="update-stack"
        fi
    else
        print_info "Stack does not exist. Creating..."
        OPERATION="create-stack"
    fi
    
    # Deploy stack
    print_info "Executing CloudFormation $OPERATION..."
    
    if [ -z "$parameters" ]; then
        aws cloudformation $OPERATION \
            --stack-name "$stack_name" \
            --template-body "file://$template_file" \
            --capabilities CAPABILITY_IAM \
            --region "$AWS_REGION" || {
                if [ "$OPERATION" == "update-stack" ]; then
                    print_warning "No updates to be performed"
                    return 0
                else
                    print_error "Failed to $OPERATION"
                    return 1
                fi
            }
    else
        aws cloudformation $OPERATION \
            --stack-name "$stack_name" \
            --template-body "file://$template_file" \
            --parameters $parameters \
            --capabilities CAPABILITY_IAM \
            --region "$AWS_REGION" || {
                if [ "$OPERATION" == "update-stack" ]; then
                    print_warning "No updates to be performed"
                    return 0
                else
                    print_error "Failed to $OPERATION"
                    return 1
                fi
            }
    fi
    
    # Wait for stack operation to complete
    print_info "Waiting for stack operation to complete..."
    
    if [ "$OPERATION" == "create-stack" ]; then
        aws cloudformation wait stack-create-complete \
            --stack-name "$stack_name" \
            --region "$AWS_REGION"
    else
        aws cloudformation wait stack-update-complete \
            --stack-name "$stack_name" \
            --region "$AWS_REGION" 2>/dev/null || true
    fi
    
    # Get stack status
    STACK_STATUS=$(aws cloudformation describe-stacks \
        --stack-name "$stack_name" \
        --query 'Stacks[0].StackStatus' \
        --output text \
        --region "$AWS_REGION")
    
    if [[ "$STACK_STATUS" == *"COMPLETE"* ]]; then
        print_success "Stack operation completed successfully"
        
        # Show outputs
        print_info "Stack Outputs:"
        aws cloudformation describe-stacks \
            --stack-name "$stack_name" \
            --query 'Stacks[0].Outputs' \
            --output table \
            --region "$AWS_REGION"
        
        return 0
    else
        print_error "Stack operation failed with status: $STACK_STATUS"
        return 1
    fi
}

###############################################################################
# Function to get stack output
###############################################################################
get_stack_output() {
    local stack_name=$1
    local output_key=$2
    
    aws cloudformation describe-stacks \
        --stack-name "$stack_name" \
        --query "Stacks[0].Outputs[?OutputKey=='$output_key'].OutputValue" \
        --output text \
        --region "$AWS_REGION"
}

###############################################################################
# Deploy Infrastructure Stack (S3 + CloudFront)
###############################################################################
deploy_infrastructure() {
    print_header "Deploying Infrastructure Stack"
    
    local stack_name="$stacks_infrastructure_name"
    local template_file="${PROJECT_ROOT}/$stacks_infrastructure_template"
    local parameters="ParameterKey=DomainName,ParameterValue=$domain_name \
                     ParameterKey=HostedZoneId,ParameterValue=$domain_hosted_zone_id \
                     ParameterKey=Environment,ParameterValue=$application_environment"
    
    deploy_stack "$stack_name" "$template_file" "$parameters"
    
    if [ $? -eq 0 ]; then
        # Get outputs
        BUCKET_NAME=$(get_stack_output "$stack_name" "BucketName")
        CLOUDFRONT_ID=$(get_stack_output "$stack_name" "CloudFrontDistributionId")
        WEBSITE_URL=$(get_stack_output "$stack_name" "WebsiteURL")
        
        print_success "Infrastructure deployed successfully"
        print_info "Bucket Name: $BUCKET_NAME"
        print_info "CloudFront Distribution ID: $CLOUDFRONT_ID"
        print_info "Website URL: $WEBSITE_URL"
        
        # Save to deployment info file
        cat > "${PROJECT_ROOT}/deployment/infrastructure-info.txt" <<EOF
BUCKET_NAME=$BUCKET_NAME
CLOUDFRONT_DISTRIBUTION_ID=$CLOUDFRONT_ID
WEBSITE_URL=$WEBSITE_URL
DEPLOYMENT_DATE=$(date -u +"%Y-%m-%d %H:%M:%S UTC")
EOF
        
        print_success "Infrastructure info saved to deployment/infrastructure-info.txt"
        
        # Important note about certificate validation
        print_warning "IMPORTANT: Certificate validation may take several minutes"
        print_info "The ACM certificate needs DNS validation. Check Route 53 for CNAME records."
        print_info "CloudFront distribution will not be fully functional until certificate is validated."
    fi
}

###############################################################################
# Deploy Cognito Stack
###############################################################################
deploy_cognito() {
    print_header "Deploying Cognito Stack"
    
    local stack_name="$stacks_auth_name"
    local template_file="${PROJECT_ROOT}/$stacks_auth_template"
    local parameters="ParameterKey=ApplicationName,ParameterValue=$application_name \
                     ParameterKey=Environment,ParameterValue=$application_environment \
                     ParameterKey=DomainName,ParameterValue=$domain_name"
    
    deploy_stack "$stack_name" "$template_file" "$parameters"
    
    if [ $? -eq 0 ]; then
        # Get outputs
        USER_POOL_ID=$(get_stack_output "$stack_name" "UserPoolId")
        CLIENT_ID=$(get_stack_output "$stack_name" "UserPoolClientId")
        HOSTED_UI_URL=$(get_stack_output "$stack_name" "HostedUIURL")
        
        print_success "Cognito deployed successfully"
        print_info "User Pool ID: $USER_POOL_ID"
        print_info "Client ID: $CLIENT_ID"
        print_info "Hosted UI URL: $HOSTED_UI_URL"
        
        # Save to deployment info file
        cat > "${PROJECT_ROOT}/deployment/cognito-info.txt" <<EOF
USER_POOL_ID=$USER_POOL_ID
CLIENT_ID=$CLIENT_ID
HOSTED_UI_URL=$HOSTED_UI_URL
AWS_REGION=$AWS_REGION
DEPLOYMENT_DATE=$(date -u +"%Y-%m-%d %H:%M:%S UTC")
EOF
        
        print_success "Cognito info saved to deployment/cognito-info.txt"
        
        # Create .env file for container app
        print_info "Creating .env file for container app..."
        cat > "${PROJECT_ROOT}/apps/container/.env" <<EOF
VITE_COGNITO_USER_POOL_ID=$USER_POOL_ID
VITE_COGNITO_CLIENT_ID=$CLIENT_ID
VITE_AWS_REGION=$AWS_REGION

# Environment
NODE_ENV=production
EOF
        
        print_success ".env file created at apps/container/.env"
        
        print_warning "IMPORTANT: Add users to Cognito User Pool"
        print_info "Use AWS Console or AWS CLI to create users and assign them to groups"
        print_info "Admin users should be added to 'admin' group"
    fi
}

###############################################################################
# Main execution
###############################################################################
print_header "MFE Demo - CloudFormation Deployment"

case "$COMMAND" in
    infrastructure|infra)
        deploy_infrastructure
        ;;
    cognito|auth)
        deploy_cognito
        ;;
    all)
        deploy_infrastructure
        echo ""
        deploy_cognito
        ;;
    *)
        print_error "Unknown command: $COMMAND"
        echo ""
        echo "Usage: $0 [command]"
        echo ""
        echo "Commands:"
        echo "  infrastructure, infra  - Deploy S3 and CloudFront stack"
        echo "  cognito, auth         - Deploy Cognito User Pool stack"
        echo "  all                   - Deploy all stacks (default)"
        echo ""
        exit 1
        ;;
esac

print_header "Deployment Complete"
print_success "All CloudFormation stacks have been deployed"
print_info ""
print_info "Next steps:"
print_info "1. Wait for ACM certificate validation (check Route 53)"
print_info "2. Build and deploy your applications using: ./deployment/deploy-apps.sh"
print_info "3. Create users in Cognito User Pool"
print_info "4. Access your application at: https://$domain_name"
print_info ""

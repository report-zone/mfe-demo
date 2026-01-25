#!/bin/bash

###############################################################################
# Test Deployment Setup
# This script tests the deployment configuration and scripts
###############################################################################

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

print_test() {
    echo -e "${BLUE}[TEST]${NC} $1"
}

print_pass() {
    echo -e "${GREEN}[PASS]${NC} $1"
}

print_fail() {
    echo -e "${RED}[FAIL]${NC} $1"
}

print_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

FAILED_TESTS=0
PASSED_TESTS=0

###############################################################################
# Test 1: Check if required directories exist
###############################################################################
print_test "Checking directory structure..."

if [ -d "$PROJECT_ROOT/cloudformation/templates" ]; then
    print_pass "cloudformation/templates directory exists"
    PASSED_TESTS=$((PASSED_TESTS + 1))
else
    print_fail "cloudformation/templates directory not found"
    FAILED_TESTS=$((FAILED_TESTS + 1))
fi

if [ -d "$PROJECT_ROOT/deployment" ]; then
    print_pass "deployment directory exists"
    PASSED_TESTS=$((PASSED_TESTS + 1))
else
    print_fail "deployment directory not found"
    FAILED_TESTS=$((FAILED_TESTS + 1))
fi

###############################################################################
# Test 2: Check if CloudFormation templates exist
###############################################################################
print_test "Checking CloudFormation templates..."

if [ -f "$PROJECT_ROOT/cloudformation/templates/s3-cloudfront.yaml" ]; then
    print_pass "s3-cloudfront.yaml template exists"
    PASSED_TESTS=$((PASSED_TESTS + 1))
else
    print_fail "s3-cloudfront.yaml template not found"
    FAILED_TESTS=$((FAILED_TESTS + 1))
fi

if [ -f "$PROJECT_ROOT/cloudformation/templates/cognito.yaml" ]; then
    print_pass "cognito.yaml template exists"
    PASSED_TESTS=$((PASSED_TESTS + 1))
else
    print_fail "cognito.yaml template not found"
    FAILED_TESTS=$((FAILED_TESTS + 1))
fi

###############################################################################
# Test 3: Check if deployment scripts exist and are executable
###############################################################################
print_test "Checking deployment scripts..."

if [ -f "$PROJECT_ROOT/deployment/deploy-cloudformation.sh" ]; then
    if [ -x "$PROJECT_ROOT/deployment/deploy-cloudformation.sh" ]; then
        print_pass "deploy-cloudformation.sh exists and is executable"
        PASSED_TESTS=$((PASSED_TESTS + 1))
    else
        print_fail "deploy-cloudformation.sh is not executable"
        FAILED_TESTS=$((FAILED_TESTS + 1))
    fi
else
    print_fail "deploy-cloudformation.sh not found"
    FAILED_TESTS=$((FAILED_TESTS + 1))
fi

if [ -f "$PROJECT_ROOT/deployment/deploy-apps.sh" ]; then
    if [ -x "$PROJECT_ROOT/deployment/deploy-apps.sh" ]; then
        print_pass "deploy-apps.sh exists and is executable"
        PASSED_TESTS=$((PASSED_TESTS + 1))
    else
        print_fail "deploy-apps.sh is not executable"
        FAILED_TESTS=$((FAILED_TESTS + 1))
    fi
else
    print_fail "deploy-apps.sh not found"
    FAILED_TESTS=$((FAILED_TESTS + 1))
fi

if [ -f "$PROJECT_ROOT/deployment/invalidate-cache.sh" ]; then
    if [ -x "$PROJECT_ROOT/deployment/invalidate-cache.sh" ]; then
        print_pass "invalidate-cache.sh exists and is executable"
        PASSED_TESTS=$((PASSED_TESTS + 1))
    else
        print_fail "invalidate-cache.sh is not executable"
        FAILED_TESTS=$((FAILED_TESTS + 1))
    fi
else
    print_fail "invalidate-cache.sh not found"
    FAILED_TESTS=$((FAILED_TESTS + 1))
fi

###############################################################################
# Test 4: Check if configuration example exists
###############################################################################
print_test "Checking configuration files..."

if [ -f "$PROJECT_ROOT/deployment/config.example.yaml" ]; then
    print_pass "config.example.yaml exists"
    PASSED_TESTS=$((PASSED_TESTS + 1))
else
    print_fail "config.example.yaml not found"
    FAILED_TESTS=$((FAILED_TESTS + 1))
fi

###############################################################################
# Test 5: Check if documentation exists
###############################################################################
print_test "Checking documentation..."

if [ -f "$PROJECT_ROOT/AWS_DEPLOYMENT_GUIDE.md" ]; then
    print_pass "AWS_DEPLOYMENT_GUIDE.md exists"
    PASSED_TESTS=$((PASSED_TESTS + 1))
else
    print_fail "AWS_DEPLOYMENT_GUIDE.md not found"
    FAILED_TESTS=$((FAILED_TESTS + 1))
fi

if [ -f "$PROJECT_ROOT/deployment/README.md" ]; then
    print_pass "deployment/README.md exists"
    PASSED_TESTS=$((PASSED_TESTS + 1))
else
    print_fail "deployment/README.md not found"
    FAILED_TESTS=$((FAILED_TESTS + 1))
fi

if [ -f "$PROJECT_ROOT/cloudformation/README.md" ]; then
    print_pass "cloudformation/README.md exists"
    PASSED_TESTS=$((PASSED_TESTS + 1))
else
    print_fail "cloudformation/README.md not found"
    FAILED_TESTS=$((FAILED_TESTS + 1))
fi

###############################################################################
# Test 6: Validate script syntax
###############################################################################
print_test "Validating script syntax..."

bash -n "$PROJECT_ROOT/deployment/deploy-cloudformation.sh" 2>&1
if [ $? -eq 0 ]; then
    print_pass "deploy-cloudformation.sh has valid syntax"
    PASSED_TESTS=$((PASSED_TESTS + 1))
else
    print_fail "deploy-cloudformation.sh has syntax errors"
    FAILED_TESTS=$((FAILED_TESTS + 1))
fi

bash -n "$PROJECT_ROOT/deployment/deploy-apps.sh" 2>&1
if [ $? -eq 0 ]; then
    print_pass "deploy-apps.sh has valid syntax"
    PASSED_TESTS=$((PASSED_TESTS + 1))
else
    print_fail "deploy-apps.sh has syntax errors"
    FAILED_TESTS=$((FAILED_TESTS + 1))
fi

bash -n "$PROJECT_ROOT/deployment/invalidate-cache.sh" 2>&1
if [ $? -eq 0 ]; then
    print_pass "invalidate-cache.sh has valid syntax"
    PASSED_TESTS=$((PASSED_TESTS + 1))
else
    print_fail "invalidate-cache.sh has syntax errors"
    FAILED_TESTS=$((FAILED_TESTS + 1))
fi

###############################################################################
# Test 7: Validate CloudFormation templates
###############################################################################
print_test "Validating CloudFormation templates..."

if [ -f "$PROJECT_ROOT/deployment/validate-templates.sh" ]; then
    "$PROJECT_ROOT/deployment/validate-templates.sh" > /dev/null 2>&1
    if [ $? -eq 0 ]; then
        print_pass "CloudFormation templates are valid"
        PASSED_TESTS=$((PASSED_TESTS + 1))
    else
        print_fail "CloudFormation templates validation failed"
        FAILED_TESTS=$((FAILED_TESTS + 1))
    fi
else
    print_info "Skipping template validation (validate-templates.sh not found)"
fi

###############################################################################
# Test 8: Check if AWS CLI is available
###############################################################################
print_test "Checking AWS CLI availability..."

if command -v aws &> /dev/null; then
    AWS_VERSION=$(aws --version 2>&1)
    print_pass "AWS CLI is installed: $AWS_VERSION"
    PASSED_TESTS=$((PASSED_TESTS + 1))
else
    print_fail "AWS CLI is not installed"
    print_info "AWS CLI is required for deployment"
    FAILED_TESTS=$((FAILED_TESTS + 1))
fi

###############################################################################
# Test 9: Check if Node.js is available
###############################################################################
print_test "Checking Node.js availability..."

if command -v node &> /dev/null; then
    NODE_VERSION=$(node --version)
    print_pass "Node.js is installed: $NODE_VERSION"
    PASSED_TESTS=$((PASSED_TESTS + 1))
else
    print_fail "Node.js is not installed"
    FAILED_TESTS=$((FAILED_TESTS + 1))
fi

###############################################################################
# Test 10: Check if Yarn is available
###############################################################################
print_test "Checking Yarn availability..."

if command -v yarn &> /dev/null; then
    YARN_VERSION=$(yarn --version)
    print_pass "Yarn is installed: $YARN_VERSION"
    PASSED_TESTS=$((PASSED_TESTS + 1))
else
    print_fail "Yarn is not installed"
    FAILED_TESTS=$((FAILED_TESTS + 1))
fi

###############################################################################
# Test 11: Check if .gitignore is properly configured
###############################################################################
print_test "Checking .gitignore configuration..."

if [ -f "$PROJECT_ROOT/.gitignore" ]; then
    if grep -q "deployment/config.yaml" "$PROJECT_ROOT/.gitignore"; then
        print_pass ".gitignore excludes deployment/config.yaml"
        PASSED_TESTS=$((PASSED_TESTS + 1))
    else
        print_fail ".gitignore does not exclude deployment/config.yaml"
        FAILED_TESTS=$((FAILED_TESTS + 1))
    fi
    
    if grep -q "deployment/\*-info.txt" "$PROJECT_ROOT/.gitignore"; then
        print_pass ".gitignore excludes deployment/*-info.txt"
        PASSED_TESTS=$((PASSED_TESTS + 1))
    else
        print_fail ".gitignore does not exclude deployment/*-info.txt"
        FAILED_TESTS=$((FAILED_TESTS + 1))
    fi
else
    print_fail ".gitignore not found"
    FAILED_TESTS=$((FAILED_TESTS + 1))
fi

###############################################################################
# Test 12: Check template required parameters
###############################################################################
print_test "Checking CloudFormation template parameters..."

# Check s3-cloudfront.yaml
if grep -q "DomainName:" "$PROJECT_ROOT/cloudformation/templates/s3-cloudfront.yaml"; then
    print_pass "s3-cloudfront.yaml has DomainName parameter"
    PASSED_TESTS=$((PASSED_TESTS + 1))
else
    print_fail "s3-cloudfront.yaml missing DomainName parameter"
    FAILED_TESTS=$((FAILED_TESTS + 1))
fi

if grep -q "HostedZoneId:" "$PROJECT_ROOT/cloudformation/templates/s3-cloudfront.yaml"; then
    print_pass "s3-cloudfront.yaml has HostedZoneId parameter"
    PASSED_TESTS=$((PASSED_TESTS + 1))
else
    print_fail "s3-cloudfront.yaml missing HostedZoneId parameter"
    FAILED_TESTS=$((FAILED_TESTS + 1))
fi

# Check cognito.yaml
if grep -q "ApplicationName:" "$PROJECT_ROOT/cloudformation/templates/cognito.yaml"; then
    print_pass "cognito.yaml has ApplicationName parameter"
    PASSED_TESTS=$((PASSED_TESTS + 1))
else
    print_fail "cognito.yaml missing ApplicationName parameter"
    FAILED_TESTS=$((FAILED_TESTS + 1))
fi

###############################################################################
# Summary
###############################################################################
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "${BLUE}Test Summary${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "${GREEN}Passed: $PASSED_TESTS${NC}"
echo -e "${RED}Failed: $FAILED_TESTS${NC}"
echo ""

if [ $FAILED_TESTS -eq 0 ]; then
    echo -e "${GREEN}✅ All tests passed!${NC}"
    echo ""
    echo "Next steps:"
    echo "1. Copy deployment/config.example.yaml to deployment/config.yaml"
    echo "2. Configure your AWS settings in deployment/config.yaml"
    echo "3. Run: ./deployment/deploy-cloudformation.sh all"
    echo "4. Run: ./deployment/deploy-apps.sh all"
    echo ""
    exit 0
else
    echo -e "${RED}❌ Some tests failed${NC}"
    echo ""
    echo "Please fix the issues above before proceeding with deployment."
    echo ""
    exit 1
fi

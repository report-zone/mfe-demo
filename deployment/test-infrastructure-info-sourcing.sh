#!/bin/bash

###############################################################################
# Test Infrastructure Info Sourcing
# This script tests that infrastructure-info.txt can be properly sourced
###############################################################################

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

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

FAILED_TESTS=0
PASSED_TESTS=0

###############################################################################
# Test 1: Verify infrastructure-info.txt can be sourced with quoted DEPLOYMENT_DATE
###############################################################################
print_test "Testing infrastructure-info.txt sourcing with quoted DEPLOYMENT_DATE..."

# Create a test file with quoted DEPLOYMENT_DATE (correct format)
cat > /tmp/test-infra-info-quoted.txt <<'EOF'
BUCKET_NAME=test-bucket
CLOUDFRONT_DISTRIBUTION_ID=E1234567890
WEBSITE_URL=https://example.com
DEPLOYMENT_DATE="2026-01-25 22:57:01 UTC"
EOF

# Try to source it
if source /tmp/test-infra-info-quoted.txt 2>/dev/null; then
    if [ "$DEPLOYMENT_DATE" == "2026-01-25 22:57:01 UTC" ]; then
        print_pass "infrastructure-info.txt with quoted DEPLOYMENT_DATE can be sourced correctly"
        PASSED_TESTS=$((PASSED_TESTS + 1))
    else
        print_fail "DEPLOYMENT_DATE value is incorrect: $DEPLOYMENT_DATE"
        FAILED_TESTS=$((FAILED_TESTS + 1))
    fi
else
    print_fail "Failed to source infrastructure-info.txt with quoted DEPLOYMENT_DATE"
    FAILED_TESTS=$((FAILED_TESTS + 1))
fi

# Clean up
unset BUCKET_NAME CLOUDFRONT_DISTRIBUTION_ID WEBSITE_URL DEPLOYMENT_DATE

###############################################################################
# Test 2: Verify infrastructure-info.txt fails with unquoted DEPLOYMENT_DATE
###############################################################################
print_test "Testing infrastructure-info.txt sourcing with unquoted DEPLOYMENT_DATE (should fail)..."

# Create a test file with unquoted DEPLOYMENT_DATE (incorrect format)
cat > /tmp/test-infra-info-unquoted.txt <<'EOF'
BUCKET_NAME=test-bucket
CLOUDFRONT_DISTRIBUTION_ID=E1234567890
WEBSITE_URL=https://example.com
DEPLOYMENT_DATE=2026-01-25 22:57:01 UTC
EOF

# Try to source it (should fail)
if source /tmp/test-infra-info-unquoted.txt 2>/dev/null; then
    print_fail "infrastructure-info.txt with unquoted DEPLOYMENT_DATE should have failed but didn't"
    FAILED_TESTS=$((FAILED_TESTS + 1))
else
    print_pass "infrastructure-info.txt with unquoted DEPLOYMENT_DATE correctly fails (as expected)"
    PASSED_TESTS=$((PASSED_TESTS + 1))
fi

###############################################################################
# Test 3: Verify cognito-info.txt can be sourced with quoted DEPLOYMENT_DATE
###############################################################################
print_test "Testing cognito-info.txt sourcing with quoted DEPLOYMENT_DATE..."

# Create a test file with quoted DEPLOYMENT_DATE (correct format)
cat > /tmp/test-cognito-info-quoted.txt <<'EOF'
USER_POOL_ID=us-east-1_TEST123
CLIENT_ID=testclientid123
HOSTED_UI_URL=https://auth.example.com
AWS_REGION=us-east-1
DEPLOYMENT_DATE="2026-01-25 22:57:01 UTC"
EOF

# Try to source it
if source /tmp/test-cognito-info-quoted.txt 2>/dev/null; then
    if [ "$DEPLOYMENT_DATE" == "2026-01-25 22:57:01 UTC" ]; then
        print_pass "cognito-info.txt with quoted DEPLOYMENT_DATE can be sourced correctly"
        PASSED_TESTS=$((PASSED_TESTS + 1))
    else
        print_fail "DEPLOYMENT_DATE value is incorrect: $DEPLOYMENT_DATE"
        FAILED_TESTS=$((FAILED_TESTS + 1))
    fi
else
    print_fail "Failed to source cognito-info.txt with quoted DEPLOYMENT_DATE"
    FAILED_TESTS=$((FAILED_TESTS + 1))
fi

# Clean up temporary files
rm -f /tmp/test-infra-info-quoted.txt /tmp/test-infra-info-unquoted.txt /tmp/test-cognito-info-quoted.txt

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
    exit 0
else
    echo -e "${RED}❌ Some tests failed${NC}"
    exit 1
fi

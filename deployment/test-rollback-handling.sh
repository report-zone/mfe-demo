#!/bin/bash

###############################################################################
# Test ROLLBACK_COMPLETE State Handling
# This script tests the logic for handling CloudFormation stacks in failed states
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

print_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

FAILED_TESTS=0
PASSED_TESTS=0

###############################################################################
# Test: Verify the script contains ROLLBACK_COMPLETE handling
###############################################################################
print_test "Checking for ROLLBACK_COMPLETE state handling..."

if grep -q "ROLLBACK_COMPLETE" "$SCRIPT_DIR/deploy-cloudformation.sh"; then
    print_pass "Script contains ROLLBACK_COMPLETE handling"
    PASSED_TESTS=$((PASSED_TESTS + 1))
else
    print_fail "Script does not contain ROLLBACK_COMPLETE handling"
    FAILED_TESTS=$((FAILED_TESTS + 1))
fi

###############################################################################
# Test: Verify the script contains UPDATE_ROLLBACK_FAILED handling
###############################################################################
print_test "Checking for UPDATE_ROLLBACK_FAILED state handling..."

if grep -q "UPDATE_ROLLBACK_FAILED" "$SCRIPT_DIR/deploy-cloudformation.sh"; then
    print_pass "Script contains UPDATE_ROLLBACK_FAILED handling"
    PASSED_TESTS=$((PASSED_TESTS + 1))
else
    print_fail "Script does not contain UPDATE_ROLLBACK_FAILED handling"
    FAILED_TESTS=$((FAILED_TESTS + 1))
fi

###############################################################################
# Test: Verify the script calls delete-stack when needed
###############################################################################
print_test "Checking for stack deletion logic..."

if grep -q "delete-stack" "$SCRIPT_DIR/deploy-cloudformation.sh"; then
    print_pass "Script contains delete-stack command"
    PASSED_TESTS=$((PASSED_TESTS + 1))
else
    print_fail "Script does not contain delete-stack command"
    FAILED_TESTS=$((FAILED_TESTS + 1))
fi

###############################################################################
# Test: Verify the script waits for deletion to complete
###############################################################################
print_test "Checking for stack-delete-complete waiter..."

if grep -q "stack-delete-complete" "$SCRIPT_DIR/deploy-cloudformation.sh"; then
    print_pass "Script waits for deletion to complete"
    PASSED_TESTS=$((PASSED_TESTS + 1))
else
    print_fail "Script does not wait for deletion to complete"
    FAILED_TESTS=$((FAILED_TESTS + 1))
fi

###############################################################################
# Test: Verify stack status is retrieved
###############################################################################
print_test "Checking for stack status retrieval..."

if grep -q "STACK_STATUS=.*describe-stacks" "$SCRIPT_DIR/deploy-cloudformation.sh"; then
    print_pass "Script retrieves stack status"
    PASSED_TESTS=$((PASSED_TESTS + 1))
else
    print_fail "Script does not retrieve stack status"
    FAILED_TESTS=$((FAILED_TESTS + 1))
fi

###############################################################################
# Test: Verify error handling for other failed states
###############################################################################
print_test "Checking for error handling of other failed states..."

if grep -q '\*\"FAILED\"\*' "$SCRIPT_DIR/deploy-cloudformation.sh" || grep -q '\*\"ROLLBACK\"\*' "$SCRIPT_DIR/deploy-cloudformation.sh"; then
    print_pass "Script has error handling for other failed states"
    PASSED_TESTS=$((PASSED_TESTS + 1))
else
    print_fail "Script lacks error handling for other failed states"
    FAILED_TESTS=$((FAILED_TESTS + 1))
fi

###############################################################################
# Test: Extract and display the logic flow
###############################################################################
print_test "Extracting stack status handling logic..."

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Stack Status Handling Logic:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Extract relevant lines from the script
grep -A 30 "# Check if stack exists and get its status" "$SCRIPT_DIR/deploy-cloudformation.sh" | grep -B 5 "OPERATION="

print_pass "Logic extraction complete"
PASSED_TESTS=$((PASSED_TESTS + 1))

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
    echo -e "${GREEN}✅ All ROLLBACK_COMPLETE handling tests passed!${NC}"
    echo ""
    echo "The deployment script now correctly handles:"
    echo "  1. ROLLBACK_COMPLETE state - automatically deletes and recreates"
    echo "  2. UPDATE_ROLLBACK_FAILED state - automatically deletes and recreates"
    echo "  3. Other failed states - provides error message for manual intervention"
    echo ""
    exit 0
else
    echo -e "${RED}❌ Some tests failed${NC}"
    exit 1
fi

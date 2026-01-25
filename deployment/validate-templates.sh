#!/bin/bash

###############################################################################
# Validate CloudFormation Templates
# This script validates the YAML syntax of CloudFormation templates
###############################################################################

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"

echo "Validating CloudFormation templates..."
echo ""

# Check if templates directory exists
if [ ! -d "$PROJECT_ROOT/cloudformation/templates" ]; then
    echo "❌ Templates directory not found"
    exit 1
fi

# Count templates
TEMPLATE_COUNT=$(find "$PROJECT_ROOT/cloudformation/templates" -name "*.yaml" -type f | wc -l)
echo "Found $TEMPLATE_COUNT template(s) to validate"
echo ""

FAILED=0

# Validate each template
for template in "$PROJECT_ROOT/cloudformation/templates"/*.yaml; do
    template_name=$(basename "$template")
    echo "Validating: $template_name"
    
    # Check if file exists
    if [ ! -f "$template" ]; then
        echo "  ❌ Template not found"
        FAILED=$((FAILED + 1))
        continue
    fi
    
    # Basic YAML syntax check using Python (CloudFormation uses custom tags)
    # CloudFormation intrinsic functions like !Ref, !Sub are not standard YAML
    if command -v python3 &> /dev/null; then
        # Just check basic YAML structure, ignore CloudFormation tags
        python3 -c "
import yaml
import sys

# Add CloudFormation tag handlers with error handling
def ref_constructor(loader, node):
    try:
        return {'Ref': loader.construct_scalar(node)}
    except Exception as e:
        print(f'Error constructing !Ref: {e}', file=sys.stderr)
        return None

def getatt_constructor(loader, node):
    try:
        # Handle both scalar (Resource.Attribute) and sequence ([Resource, Attribute]) formats
        if isinstance(node, yaml.ScalarNode):
            return {'Fn::GetAtt': loader.construct_scalar(node)}
        else:
            return {'Fn::GetAtt': loader.construct_sequence(node)}
    except Exception as e:
        print(f'Error constructing !GetAtt: {e}', file=sys.stderr)
        return None

def sub_constructor(loader, node):
    try:
        return {'Fn::Sub': loader.construct_scalar(node)}
    except Exception as e:
        print(f'Error constructing !Sub: {e}', file=sys.stderr)
        return None

yaml.SafeLoader.add_constructor('!Ref', ref_constructor)
yaml.SafeLoader.add_constructor('!GetAtt', getatt_constructor)
yaml.SafeLoader.add_constructor('!Sub', sub_constructor)

try:
    with open('$template', 'r') as f:
        yaml.safe_load(f)
    sys.exit(0)
except Exception as e:
    print(f'  Error: {e}')
    sys.exit(1)
" 2>&1
        if [ $? -eq 0 ]; then
            echo "  ✅ YAML syntax is valid"
        else
            echo "  ❌ YAML syntax error"
            FAILED=$((FAILED + 1))
        fi
    else
        echo "  ⚠️  Python3 not available, skipping YAML validation"
    fi
    
    # Check for required sections
    if grep -q "AWSTemplateFormatVersion" "$template"; then
        echo "  ✅ Has AWSTemplateFormatVersion"
    else
        echo "  ⚠️  Missing AWSTemplateFormatVersion"
    fi
    
    if grep -q "Description" "$template"; then
        echo "  ✅ Has Description"
    else
        echo "  ⚠️  Missing Description"
    fi
    
    if grep -q "Resources:" "$template"; then
        echo "  ✅ Has Resources section"
    else
        echo "  ❌ Missing Resources section"
        FAILED=$((FAILED + 1))
    fi
    
    echo ""
done

# Summary
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
if [ $FAILED -eq 0 ]; then
    echo "✅ All templates validated successfully"
    exit 0
else
    echo "❌ $FAILED template(s) failed validation"
    exit 1
fi

# CloudFormation Deployment Fixes

## Overview
This document describes the fixes applied to resolve CloudFormation stack creation failures that were causing the `mfe-demo-infrastructure` stack to go into `ROLLBACK_COMPLETE` state.

## Issues Fixed

### 1. S3 Origin Configuration Error (CRITICAL)
**Problem:** The CloudFormation template was using an incorrect S3 origin configuration that caused CloudFront distribution creation to fail.

**Root Cause:** 
- Template used `!GetAtt S3Bucket.RegionalDomainName` as the origin
- This pointed to the S3 REST API endpoint instead of the S3 website endpoint
- Since the bucket has `WebsiteConfiguration` enabled, it must be accessed via the website endpoint

**Fix Applied:**
Changed from:
```yaml
DomainName: !GetAtt S3Bucket.RegionalDomainName
```

To:
```yaml
DomainName: !Sub '${S3Bucket}.s3-website-${AWS::Region}.amazonaws.com'
```

**Impact:** CloudFront can now properly access the S3 website endpoint using the CustomOriginConfig with HTTP protocol.

### 2. Improved Error Reporting
**Problem:** When stack creation failed, users only saw "ROLLBACK_COMPLETE" status without understanding why it failed.

**Fix Applied:**
- Added automatic retrieval and display of CloudFormation failure events
- Shows the last 20 failed resource creation events with timestamps and reasons
- Helps users diagnose issues without manually checking AWS Console

**Implementation:**
```bash
# Show recent stack events to help diagnose the issue
aws cloudformation describe-stack-events \
    --stack-name "$stack_name" \
    --max-items 20 \
    --query 'StackEvents[?ResourceStatus==`CREATE_FAILED` || ...]'
```

### 3. Enhanced Status Detection
**Problem:** The success check `[[ "$STACK_STATUS" == *"COMPLETE"* ]]` incorrectly treated `ROLLBACK_COMPLETE` as a successful deployment.

**Fix Applied:**
Added explicit exclusion of ROLLBACK_COMPLETE from success conditions:
```bash
if [[ "$STACK_STATUS" == *"COMPLETE"* ]] && [[ "$STACK_STATUS" != "ROLLBACK_COMPLETE" ]]; then
```

### 4. Template Validation
**Problem:** No pre-flight validation of CloudFormation templates before attempting deployment.

**Fix Applied:**
- Added automatic template validation using AWS CloudFormation API
- Catches syntax errors and basic validation issues before stack creation
- Saves time and provides immediate feedback

**Implementation:**
```bash
# Validate CloudFormation template syntax
aws cloudformation validate-template \
    --template-body "file://$template_file" \
    --region "$AWS_REGION"
```

## Testing

All existing tests continue to pass:
```bash
$ ./deployment/test-rollback-handling.sh
✅ All ROLLBACK_COMPLETE handling tests passed!

$ ./deployment/validate-templates.sh  
✅ All templates validated successfully
```

## Deployment Process Changes

### Before
1. User runs `./deployment/deploy-cloudformation.sh all`
2. Stack fails with ROLLBACK_COMPLETE
3. Script shows "Stack operation failed with status: ROLLBACK_COMPLETE"
4. User must manually investigate in AWS Console
5. User must manually delete stack and retry

### After
1. User runs `./deployment/deploy-cloudformation.sh all`
2. Script validates template before deployment
3. If stack in ROLLBACK_COMPLETE state, automatically deletes and recreates
4. If deployment fails, shows detailed failure events immediately
5. User can see exactly what failed and why

## Common Issues Addressed

### S3 Bucket Name Collision
**Symptom:** Stack fails with "Bucket already exists" error  
**Cause:** S3 bucket names must be globally unique across all AWS accounts  
**Solution:** 
- Check the error events displayed by the script
- Use a different domain name or add account-specific prefix
- Consider using `!Sub '${AWS::AccountId}-${DomainName}'` pattern

### ACM Certificate Validation Timeout
**Symptom:** Stack waits indefinitely or times out during creation  
**Cause:** ACM certificate requires DNS validation via Route53 CNAME records  
**Solution:**
- Certificate validation is automatic but can take up to 30 minutes
- Check Route53 hosted zone for CNAME validation records
- Wait for validation to complete before CloudFront can be created

### Invalid Hosted Zone ID
**Symptom:** Route53 record creation fails  
**Cause:** Wrong or invalid `HostedZoneId` parameter in config.yaml  
**Solution:**
- Verify the hosted zone ID in Route53 console
- Update `domain.hosted_zone_id` in deployment/config.yaml
- Ensure the hosted zone matches your domain

## Files Modified

1. `cloudformation/templates/s3-cloudfront.yaml`
   - Fixed S3 origin DomainName to use website endpoint

2. `deployment/deploy-cloudformation.sh`
   - Added template validation
   - Improved error reporting with CloudFormation events
   - Enhanced ROLLBACK_COMPLETE detection
   - Better error handling for stack creation failures

3. `AWS_DEPLOYMENT_GUIDE.md`
   - Updated troubleshooting section with new information
   - Added details about automatic error handling
   - Documented common issues and solutions

## Recommendations for Users

1. **Always check the output**: The script now shows detailed error information
2. **Verify prerequisites**: Ensure domain is registered and Route53 hosted zone exists
3. **Monitor first deployment**: ACM certificate validation takes time on first deploy
4. **Use unique bucket names**: S3 bucket names must be globally unique
5. **Check AWS permissions**: Ensure IAM user/role has necessary permissions

## Migration Notes

No changes required for existing deployments. These fixes only affect:
- New stack deployments
- Failed stack recovery
- Error diagnosis and reporting

Existing successful deployments are not affected and will continue to work as expected.

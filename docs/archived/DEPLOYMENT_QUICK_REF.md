# Quick Reference - AWS Deployment

This is a quick reference guide for common deployment tasks.

## Initial Setup

```bash
# Run interactive setup wizard
cd deployment
./setup-wizard.sh

# OR manually configure
cp config.example.yaml config.yaml
# Edit config.yaml with your AWS settings

# Test your setup
./test-setup.sh
```

## Deploy Infrastructure

```bash
# Deploy all CloudFormation stacks (S3, CloudFront, Cognito)
./deployment/deploy-cloudformation.sh all

# Deploy only infrastructure
./deployment/deploy-cloudformation.sh infrastructure

# Deploy only Cognito
./deployment/deploy-cloudformation.sh cognito
```

## Deploy Applications

```bash
# Deploy all applications
./deployment/deploy-apps.sh all

# Deploy single application
./deployment/deploy-apps.sh container
./deployment/deploy-apps.sh home

# Deploy without rebuilding
./deployment/deploy-apps.sh all true
```

## Invalidate Cache

```bash
# Invalidate all cache
./deployment/invalidate-cache.sh all

# Invalidate specific app
./deployment/invalidate-cache.sh container
```

## Create Users

```bash
# Get User Pool ID
USER_POOL_ID=$(cat deployment/cognito-info.txt | grep USER_POOL_ID | cut -d'=' -f2)

# Create admin user
aws cognito-idp admin-create-user \
  --user-pool-id "$USER_POOL_ID" \
  --username admin@example.com \
  --user-attributes Name=email,Value=admin@example.com Name=email_verified,Value=true \
  --temporary-password "TempPass123!"

# Add to admin group
aws cognito-idp admin-add-user-to-group \
  --user-pool-id "$USER_POOL_ID" \
  --username admin@example.com \
  --group-name admin
```

## Common Issues

### Certificate Not Validated

```bash
# Check certificate status
aws acm list-certificates --region us-east-1

# Check DNS records
aws route53 list-resource-record-sets \
  --hosted-zone-id YOUR_HOSTED_ZONE_ID
```

**Solution:** Wait up to 30 minutes. Ensure nameservers point to Route 53.

### CloudFront 403 Error

```bash
# Check distribution status
DIST_ID=$(cat deployment/infrastructure-info.txt | grep CLOUDFRONT_DISTRIBUTION_ID | cut -d'=' -f2)
aws cloudfront get-distribution --id "$DIST_ID"
```

**Solution:** Wait 15-20 minutes for CloudFront to fully deploy.

### S3 Upload Failed

```bash
# Test S3 access
aws s3 ls s3://app.mfeworld.com/

# Check AWS credentials
aws sts get-caller-identity
```

**Solution:** Verify AWS credentials and IAM permissions.

## Useful Commands

```bash
# Get deployment info
cat deployment/infrastructure-info.txt
cat deployment/cognito-info.txt

# Check CloudFormation stacks
aws cloudformation list-stacks --stack-status-filter CREATE_COMPLETE UPDATE_COMPLETE

# List S3 contents
aws s3 ls s3://app.mfeworld.com/ --recursive

# Check CloudFront invalidations
aws cloudfront list-invalidations --distribution-id "$DIST_ID"

# Get stack outputs
aws cloudformation describe-stacks \
  --stack-name mfe-demo-infrastructure \
  --query 'Stacks[0].Outputs' --output table
```

## Build Commands

```bash
# Install dependencies
yarn install

# Build all apps
yarn build

# Build specific app
yarn build:container
yarn build:home
yarn build:preferences
yarn build:account
yarn build:admin

# Test locally
yarn dev
```

## Environment Variables

After Cognito deployment, environment variables are auto-generated in:
- `apps/container/.env`

Contains:
- `VITE_COGNITO_USER_POOL_ID`
- `VITE_COGNITO_CLIENT_ID`
- `VITE_AWS_REGION`

## File Locations

```
deployment/
├── config.yaml                  # Your configuration (gitignored)
├── config.example.yaml          # Configuration template
├── infrastructure-info.txt      # Generated after infra deployment
├── cognito-info.txt            # Generated after Cognito deployment
├── deploy-cloudformation.sh    # Deploy CloudFormation stacks
├── deploy-apps.sh              # Deploy applications
├── invalidate-cache.sh         # Invalidate CloudFront cache
├── setup-wizard.sh             # Interactive setup
├── test-setup.sh               # Validate setup
└── validate-templates.sh       # Validate CloudFormation templates

cloudformation/templates/
├── s3-cloudfront.yaml          # Infrastructure template
└── cognito.yaml                # Authentication template
```

## Deployment Workflow

1. **Initial Setup** (once)
   ```bash
   ./deployment/setup-wizard.sh
   ./deployment/test-setup.sh
   ```

2. **Deploy Infrastructure** (once)
   ```bash
   ./deployment/deploy-cloudformation.sh all
   # Wait for certificate validation (5-30 min)
   ```

3. **Deploy Applications** (repeatable)
   ```bash
   yarn build
   ./deployment/deploy-apps.sh all
   ```

4. **Create Users** (as needed)
   ```bash
   # See "Create Users" section above
   ```

5. **Updates** (repeatable)
   ```bash
   # Make code changes
   yarn build:container
   ./deployment/deploy-apps.sh container
   ```

## Cost Management

Check costs:
```bash
# This month's costs
aws ce get-cost-and-usage \
  --time-period Start=2024-01-01,End=2024-01-31 \
  --granularity MONTHLY \
  --metrics BlendedCost
```

Typical monthly costs:
- Small app: $1-2/month
- Medium app: $6-8/month
- Large app: $20+/month

## Rollback

```bash
# Git rollback
git checkout v1.0.0
yarn build
./deployment/deploy-apps.sh all

# S3 version restore
aws s3api list-object-versions --bucket app.mfeworld.com
# Copy specific version back
```

## Clean Up

```bash
# Delete all resources
# 1. Empty S3 bucket
aws s3 rm s3://app.mfeworld.com --recursive

# 2. Delete CloudFormation stacks
aws cloudformation delete-stack --stack-name mfe-demo-auth
aws cloudformation delete-stack --stack-name mfe-demo-infrastructure
```

## Support

- **Full Documentation:** [AWS_DEPLOYMENT_GUIDE.md](../AWS_DEPLOYMENT_GUIDE.md)
- **Deployment Scripts:** [deployment/README.md](README.md)
- **CloudFormation:** [cloudformation/README.md](../cloudformation/README.md)
- **Issues:** GitHub Issues

## Tips

1. **Always test in non-production first**
2. **Use version control for all changes**
3. **Monitor AWS costs regularly**
4. **Enable S3 versioning for rollback capability** (already enabled)
5. **Keep CloudFormation templates in Git**
6. **Document any manual changes**
7. **Use CloudWatch for monitoring**
8. **Set up billing alerts**

## Quick Troubleshooting Checklist

- [ ] AWS CLI installed and configured?
- [ ] Correct AWS region set?
- [ ] Route 53 hosted zone exists?
- [ ] Domain nameservers point to Route 53?
- [ ] Configuration file created (config.yaml)?
- [ ] CloudFormation stacks deployed successfully?
- [ ] Certificate validated (check ACM console)?
- [ ] CloudFront distribution deployed (status: Deployed)?
- [ ] Applications built (dist/ directories exist)?
- [ ] Users created in Cognito?
- [ ] Waited 5-10 minutes after deployment?

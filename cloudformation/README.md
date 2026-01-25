# CloudFormation Templates

This directory contains CloudFormation templates for deploying the MFE Demo infrastructure.

## Templates

### s3-cloudfront.yaml

Deploys the hosting infrastructure:
- **S3 Bucket** - Static website hosting with versioning
- **CloudFront Distribution** - CDN with HTTPS and custom caching rules
- **ACM Certificate** - SSL/TLS certificate with automatic DNS validation
- **Route 53 Record** - A record pointing to CloudFront distribution

**Parameters:**
- `DomainName` - Your domain name (e.g., app.mfeworld.com)
- `HostedZoneId` - Route 53 Hosted Zone ID
- `Environment` - Environment name (development/staging/production)

**Outputs:**
- `BucketName` - S3 bucket name
- `BucketArn` - S3 bucket ARN
- `CloudFrontDistributionId` - CloudFront distribution ID
- `CloudFrontDomainName` - CloudFront domain name
- `CertificateArn` - ACM certificate ARN
- `WebsiteURL` - Application URL

**Resources Created:**
- S3 bucket with public read policy
- CloudFront distribution with:
  - Custom cache behaviors for assets, JS files, and HTML
  - HTTPS redirect
  - Gzip compression
  - Custom error responses for SPA routing
- ACM certificate with DNS validation
- Route 53 A record with CloudFront alias

**Caching Strategy:**
- Static assets (`*/assets/*`): 1 year cache
- JavaScript files (`*/*.js`): 1 year cache
- HTML files (`*/index.html`): No cache
- Default: 24 hours cache

### cognito.yaml

Deploys authentication infrastructure:
- **Cognito User Pool** - User authentication
- **User Pool Client** - Web application client
- **User Pool Domain** - Hosted UI for authentication
- **User Groups** - Admin and user groups

**Parameters:**
- `ApplicationName` - Application name for resource naming
- `Environment` - Environment name
- `DomainName` - Domain name for callback URLs

**Outputs:**
- `UserPoolId` - Cognito User Pool ID
- `UserPoolArn` - User Pool ARN
- `UserPoolClientId` - User Pool Client ID
- `UserPoolDomain` - User Pool domain prefix
- `HostedUIURL` - Hosted UI URL
- `AdminGroupName` - Admin group name
- `UserGroupName` - User group name

**User Pool Configuration:**
- Email as username
- Auto-verified email
- Password policy:
  - Minimum 8 characters
  - Requires uppercase, lowercase, numbers, symbols
- MFA: Optional (can be enforced per user)
- Advanced security: AUDIT mode
- Account recovery via verified email

**User Pool Client Configuration:**
- OAuth flows: Authorization code and implicit
- OAuth scopes: email, openid, profile
- Callback URLs: Production domain + localhost for development
- Token validity:
  - Access token: 60 minutes
  - ID token: 60 minutes
  - Refresh token: 30 days

**User Groups:**
- `admin` - Administrator group (precedence 0)
- `user` - Standard user group (precedence 1)

## Usage

### Deploy with AWS CLI

```bash
# Deploy infrastructure stack
aws cloudformation create-stack \
  --stack-name mfe-demo-infrastructure \
  --template-body file://templates/s3-cloudfront.yaml \
  --parameters \
    ParameterKey=DomainName,ParameterValue=app.mfeworld.com \
    ParameterKey=HostedZoneId,ParameterValue=Z1234567890ABC \
    ParameterKey=Environment,ParameterValue=production \
  --capabilities CAPABILITY_IAM \
  --region us-east-1

# Wait for completion
aws cloudformation wait stack-create-complete \
  --stack-name mfe-demo-infrastructure \
  --region us-east-1

# Deploy Cognito stack
aws cloudformation create-stack \
  --stack-name mfe-demo-auth \
  --template-body file://templates/cognito.yaml \
  --parameters \
    ParameterKey=ApplicationName,ParameterValue=mfe-demo \
    ParameterKey=Environment,ParameterValue=production \
    ParameterKey=DomainName,ParameterValue=app.mfeworld.com \
  --capabilities CAPABILITY_IAM \
  --region us-east-1

# Wait for completion
aws cloudformation wait stack-create-complete \
  --stack-name mfe-demo-auth \
  --region us-east-1
```

### Deploy with Script (Recommended)

```bash
# From project root
cd deployment
./deploy-cloudformation.sh all
```

### Get Stack Outputs

```bash
# Get infrastructure outputs
aws cloudformation describe-stacks \
  --stack-name mfe-demo-infrastructure \
  --query 'Stacks[0].Outputs' \
  --output table

# Get Cognito outputs
aws cloudformation describe-stacks \
  --stack-name mfe-demo-auth \
  --query 'Stacks[0].Outputs' \
  --output table
```

## Template Validation

Validate templates before deployment:

```bash
# Validate infrastructure template
aws cloudformation validate-template \
  --template-body file://templates/s3-cloudfront.yaml

# Validate Cognito template
aws cloudformation validate-template \
  --template-body file://templates/cognito.yaml
```

## Updating Stacks

To update existing stacks:

```bash
# Update infrastructure
aws cloudformation update-stack \
  --stack-name mfe-demo-infrastructure \
  --template-body file://templates/s3-cloudfront.yaml \
  --parameters \
    ParameterKey=DomainName,ParameterValue=app.mfeworld.com \
    ParameterKey=HostedZoneId,ParameterValue=Z1234567890ABC \
    ParameterKey=Environment,ParameterValue=production \
  --capabilities CAPABILITY_IAM \
  --region us-east-1

# Or use script
cd deployment
./deploy-cloudformation.sh infrastructure
```

## Deleting Stacks

To remove all infrastructure:

```bash
# Delete Cognito stack first
aws cloudformation delete-stack \
  --stack-name mfe-demo-auth \
  --region us-east-1

# Wait for deletion
aws cloudformation wait stack-delete-complete \
  --stack-name mfe-demo-auth \
  --region us-east-1

# Delete infrastructure stack
# Note: S3 bucket must be empty first
aws s3 rm s3://app.mfeworld.com --recursive

aws cloudformation delete-stack \
  --stack-name mfe-demo-infrastructure \
  --region us-east-1

# Wait for deletion
aws cloudformation wait stack-delete-complete \
  --stack-name mfe-demo-infrastructure \
  --region us-east-1
```

## Cost Estimate

### Infrastructure Stack
- **S3**: ~$0.02-0.10/month for storage + $0.0004/1000 requests
- **CloudFront**: $0.085/GB for first 10 TB + $0.0075/10,000 requests
- **ACM Certificate**: Free
- **Route 53 Hosted Zone**: $0.50/month
- **Route 53 Queries**: $0.40/million queries

### Cognito Stack
- **User Pool**: Free for first 50,000 MAUs
- **After 50,000 MAUs**: $0.00550/MAU

**Estimated Total for Small App:** $1-5/month

## Security Considerations

### S3
- Versioning enabled for rollback capability
- Public read access for static content
- Lifecycle policy deletes old versions after 30 days

### CloudFront
- HTTPS only (HTTP redirects to HTTPS)
- TLS 1.2 minimum
- Gzip compression enabled
- Origin access identity configured

### Cognito
- Strong password policy enforced
- Email verification required
- MFA available (optional)
- Advanced security features in AUDIT mode
- Account recovery via verified email only

## Troubleshooting

### Certificate Validation Issues

If ACM certificate stays in "Pending validation":
1. Check Route 53 for CNAME records (should be auto-created)
2. Wait up to 30 minutes for DNS propagation
3. Verify domain nameservers point to AWS Route 53

### CloudFront 403 Errors

If accessing site returns 403:
1. Verify S3 bucket policy allows public read
2. Wait 15-20 minutes for CloudFront to fully deploy
3. Check CloudFront distribution status is "Deployed"
4. Verify index.html exists in container folder

### Stack Creation Failures

Common causes:
- Invalid domain name or hosted zone ID
- Insufficient IAM permissions
- Certificate validation timeout (extend to 60 minutes)
- Resource limits exceeded

Check stack events:
```bash
aws cloudformation describe-stack-events \
  --stack-name mfe-demo-infrastructure
```

## Dependencies

### Infrastructure Stack Dependencies
- Route 53 Hosted Zone must exist
- Domain must be registered
- DNS must be configured to use Route 53 nameservers

### Cognito Stack Dependencies
- Domain name must match infrastructure deployment
- No dependencies on infrastructure stack (can deploy independently)

## Best Practices

1. **Use Parameter Store or Secrets Manager** for sensitive configuration
2. **Enable CloudFormation drift detection** to monitor changes
3. **Tag all resources** with Environment, Project, and Owner tags
4. **Use stack policies** to prevent accidental deletion of critical resources
5. **Export outputs** for use in other stacks or applications
6. **Version your templates** in Git for change tracking
7. **Test in non-production environment** first

## Additional Resources

- [CloudFormation Documentation](https://docs.aws.amazon.com/cloudformation/)
- [S3 Static Website Hosting](https://docs.aws.amazon.com/AmazonS3/latest/userguide/WebsiteHosting.html)
- [CloudFront with S3](https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/GettingStarted.SimpleDistribution.html)
- [Cognito User Pools](https://docs.aws.amazon.com/cognito/latest/developerguide/cognito-user-identity-pools.html)
- [ACM Certificate Validation](https://docs.aws.amazon.com/acm/latest/userguide/dns-validation.html)

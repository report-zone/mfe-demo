# AWS Deployment Guide - CloudFormation & AWS CLI

This guide provides complete instructions for deploying the MFE Demo application to AWS using CloudFormation templates and AWS CLI.

## Table of Contents

1. [Overview](#overview)
2. [Prerequisites](#prerequisites)
3. [Architecture](#architecture)
4. [Quick Start](#quick-start)
5. [Detailed Setup Instructions](#detailed-setup-instructions)
6. [Deployment Process](#deployment-process)
7. [Configuration Reference](#configuration-reference)
8. [Troubleshooting](#troubleshooting)
9. [Security Best Practices](#security-best-practices)
10. [Cost Considerations](#cost-considerations)

---

## Overview

This deployment solution uses:

- **CloudFormation** for infrastructure as code
- **AWS CLI** for deployment automation
- **S3** for static file hosting
- **CloudFront** for CDN and HTTPS
- **ACM (AWS Certificate Manager)** for SSL certificates
- **Cognito** for user authentication
- **Route 53** for DNS management

**No AWS CodePipeline is used** - deployments are triggered manually via scripts.

---

## Prerequisites

### Required Software

1. **AWS CLI** (version 2.x or higher)

   ```bash
   # Install on macOS
   brew install awscli

   # Install on Linux
   curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"
   unzip awscliv2.zip
   sudo ./aws/install

   # Install on Windows
   # Download from: https://awscli.amazonaws.com/AWSCLIV2.msi
   ```

2. **Node.js** (version 18.x or higher)

   ```bash
   # Check version
   node --version

   # Install using nvm
   nvm install 18
   nvm use 18
   ```

3. **Yarn** (version 1.22.x or higher)

   ```bash
   npm install -g yarn
   ```

4. **Git**
   ```bash
   # Check version
   git --version
   ```

### AWS Account Requirements

1. **AWS Account** with appropriate permissions
2. **IAM User or Role** with the following permissions:
   - CloudFormation (full access)
   - S3 (full access)
   - CloudFront (full access)
   - ACM (full access)
   - Cognito (full access)
   - Route 53 (full access or specific hosted zone access)
   - IAM (limited - for creating service roles)

3. **Route 53 Hosted Zone** (must be created manually before deployment)
   - Register a domain or transfer an existing one to Route 53
   - Note the Hosted Zone ID - you'll need this for configuration

### AWS CLI Configuration

Configure AWS CLI with your credentials:

```bash
# Option 1: Configure using AWS CLI (recommended)
aws configure

# Enter when prompted:
# - AWS Access Key ID
# - AWS Secret Access Key
# - Default region (e.g., us-east-1)
# - Default output format (json)

# Option 2: Configure named profile
aws configure --profile mfe-demo

# Verify configuration
aws sts get-caller-identity
```

---

## Architecture

### Infrastructure Components

```
┌─────────────────────────────────────────────────────────┐
│                    Route 53 DNS                         │
│              (app.mfeworld.com)                         │
└─────────────────────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────┐
│              CloudFront Distribution                     │
│         (HTTPS with ACM Certificate)                    │
└─────────────────────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────┐
│                   S3 Bucket                             │
│              (app.mfeworld.com)                         │
│  ┌──────────────────────────────────────────────────┐  │
│  │ /container/    - Container App                   │  │
│  │ /home/         - Home MFE                        │  │
│  │ /account/      - Account MFE                     │  │
│  │ /preferences/  - Preferences MFE                 │  │
│  │ /admin/        - Admin MFE                       │  │
│  └──────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│              Cognito User Pool                          │
│   - User authentication                                 │
│   - User groups (admin, user)                          │
│   - Hosted UI for login                                │
└─────────────────────────────────────────────────────────┘
```

### CloudFormation Stacks

1. **Infrastructure Stack** (`s3-cloudfront.yaml`)
   - S3 bucket for hosting
   - CloudFront distribution with caching rules
   - ACM certificate for HTTPS
   - Route 53 DNS record
   - Bucket policies

2. **Authentication Stack** (`cognito.yaml`)
   - Cognito User Pool
   - User Pool Client (Web App)
   - User Pool Domain (Hosted UI)
   - User Groups (admin, user)

---

## Quick Start

### 1. Clone Repository

```bash
git clone https://github.com/custom/mfe-demo.git
cd mfe-demo
```

### 2. Install Dependencies

```bash
yarn install
```

### 3. Create Route 53 Hosted Zone

**Important:** This must be done manually before deployment.

1. Go to AWS Console → Route 53 → Hosted Zones
2. Click "Create Hosted Zone"
3. Enter your domain name (e.g., `mfeworld.com`)
4. Note the **Hosted Zone ID** (format: Z1234567890ABC)
5. Update your domain's nameservers at your registrar to point to AWS nameservers

### 4. Configure Deployment

```bash
# Copy the example configuration
cp deployment/config.example.yaml deployment/config.yaml

# Edit the configuration file
nano deployment/config.yaml
```

Update the following values:

- `aws.region` - Your AWS region (e.g., us-east-1)
- `aws.account_id` - Your 12-digit AWS account ID
- `aws.profile` - Your AWS CLI profile name (or leave as "default")
- `domain.name` - Your domain name (e.g., app.mfeworld.com)
- `domain.hosted_zone_id` - Your Route 53 Hosted Zone ID

### 5. Deploy Infrastructure

```bash
# Deploy CloudFormation stacks (S3, CloudFront, Cognito)
./deployment/deploy-cloudformation.sh all
```

This will:

- Create S3 bucket
- Create CloudFront distribution
- Request ACM certificate (with DNS validation)
- Create Route 53 DNS record
- Create Cognito User Pool and Client
- Generate `.env` file for container app

**Important:** Wait for ACM certificate validation (5-30 minutes).

### 6. Build and Deploy Applications

```bash
# Build and deploy all applications
./deployment/deploy-apps.sh all
```

This will:

- Build all 5 applications (container + 4 MFEs)
- Upload to S3
- Invalidate CloudFront cache

### 7. Create Users

```bash
# Create an admin user
aws cognito-idp admin-create-user \
  --user-pool-id <USER_POOL_ID> \
  --username admin@example.com \
  --user-attributes Name=email,Value=admin@example.com Name=email_verified,Value=true \
  --temporary-password TempPassword123!

# Add user to admin group
aws cognito-idp admin-add-user-to-group \
  --user-pool-id <USER_POOL_ID> \
  --username admin@example.com \
  --group-name admin
```

Replace `<USER_POOL_ID>` with the value from `deployment/cognito-info.txt`.

### 8. Access Application

Open your browser to `https://app.mfeworld.com` (or your configured domain).

---

## Detailed Setup Instructions

### Step 1: Register Domain (If Not Already Done)

If you don't have a domain:

1. Go to AWS Console → Route 53 → Registered Domains
2. Click "Register Domain"
3. Search for available domain
4. Complete registration (takes 10-60 minutes)

Or use an existing domain and transfer it to Route 53.

### Step 2: Create Hosted Zone

1. Go to AWS Console → Route 53 → Hosted Zones
2. Click "Create Hosted Zone"
3. Enter domain name: `mfeworld.com` (your actual domain)
4. Select type: "Public Hosted Zone"
5. Click "Create Hosted Zone"
6. **Note the Hosted Zone ID** - you'll need this

If you registered domain outside AWS:

- Update nameservers at your registrar to use AWS nameservers shown in hosted zone

### Step 3: Configure AWS Credentials

**Option A: Use AWS CLI Profile (Recommended)**

```bash
aws configure --profile mfe-demo-deploy
# Enter access key, secret key, region, and output format

# Test configuration
aws sts get-caller-identity --profile mfe-demo-deploy
```

Update `deployment/config.yaml`:

```yaml
aws:
  region: us-east-1
  profile: mfe-demo-deploy
```

**Option B: Use Default Profile**

```bash
aws configure
# Enter credentials

# Test
aws sts get-caller-identity
```

**Option C: Use Environment Variables** (Not recommended for production)

```bash
export AWS_ACCESS_KEY_ID=your-access-key
export AWS_SECRET_ACCESS_KEY=your-secret-key
export AWS_DEFAULT_REGION=us-east-1
```

### Step 4: Configure Deployment Settings

Edit `deployment/config.yaml`:

```yaml
# AWS Configuration
aws:
  region: us-east-1 # Change to your preferred region
  account_id: '123456789012' # Your AWS account ID
  profile: default # Or your profile name

# Application Configuration
application:
  name: mfe-demo
  environment: production # or staging, development

# Domain Configuration
domain:
  name: app.mfeworld.com # Your actual domain
  hosted_zone_id: Z1234567890ABC # Your Route 53 Hosted Zone ID

# Stack Names (optional - can leave as default)
stacks:
  infrastructure:
    name: mfe-demo-infrastructure
  auth:
    name: mfe-demo-auth
```

### Step 5: Deploy CloudFormation Stacks

Deploy all stacks:

```bash
./deployment/deploy-cloudformation.sh all
```

Or deploy individually:

```bash
# Deploy infrastructure first
./deployment/deploy-cloudformation.sh infrastructure

# Wait for certificate validation, then deploy Cognito
./deployment/deploy-cloudformation.sh cognito
```

**Monitor Progress:**

- Go to AWS Console → CloudFormation
- Watch stack events for progress
- Check for any errors

**Certificate Validation:**

- ACM will create CNAME records in Route 53 automatically
- Validation typically takes 5-30 minutes
- Check AWS Console → Certificate Manager for status

### Step 6: Verify Infrastructure

After deployment completes:

1. **Check S3 Bucket**

   ```bash
   aws s3 ls s3://app.mfeworld.com/
   ```

2. **Check CloudFront Distribution**

   ```bash
   aws cloudfront list-distributions --query 'DistributionList.Items[].{Domain:DomainName,Status:Status}'
   ```

3. **Check Certificate**
   - Go to AWS Console → Certificate Manager
   - Verify status is "Issued"

4. **Check Cognito**
   ```bash
   cat deployment/cognito-info.txt
   ```

### Step 7: Build Applications

Build all applications:

```bash
cd /path/to/mfe-demo
yarn install
yarn build
```

Or build individually:

```bash
yarn build:container
yarn build:home
yarn build:preferences
yarn build:account
yarn build:admin
```

### Step 8: Deploy Applications

Deploy all:

```bash
./deployment/deploy-apps.sh all
```

Deploy single application:

```bash
./deployment/deploy-apps.sh container
./deployment/deploy-apps.sh home
# etc.
```

Skip build (if already built):

```bash
./deployment/deploy-apps.sh all true
```

### Step 9: Create Users and Groups

Create an admin user:

```bash
# Get User Pool ID
USER_POOL_ID=$(cat deployment/cognito-info.txt | grep USER_POOL_ID | cut -d'=' -f2)

# Create user
aws cognito-idp admin-create-user \
  --user-pool-id "$USER_POOL_ID" \
  --username admin@yourdomain.com \
  --user-attributes \
    Name=email,Value=admin@yourdomain.com \
    Name=email_verified,Value=true \
  --temporary-password "TempPass123!" \
  --message-action SUPPRESS

# Add to admin group
aws cognito-idp admin-add-user-to-group \
  --user-pool-id "$USER_POOL_ID" \
  --username admin@yourdomain.com \
  --group-name admin
```

Create a regular user:

```bash
aws cognito-idp admin-create-user \
  --user-pool-id "$USER_POOL_ID" \
  --username user@yourdomain.com \
  --user-attributes \
    Name=email,Value=user@yourdomain.com \
    Name=email_verified,Value=true \
  --temporary-password "TempPass123!" \
  --message-action SUPPRESS

aws cognito-idp admin-add-user-to-group \
  --user-pool-id "$USER_POOL_ID" \
  --username user@yourdomain.com \
  --group-name user
```

---

## Deployment Process

### Complete Deployment

```bash
# 1. Deploy infrastructure
./deployment/deploy-cloudformation.sh all

# 2. Wait for certificate validation (check AWS Console)

# 3. Build and deploy apps
./deployment/deploy-apps.sh all

# 4. Create users
# See "Create Users and Groups" section above
```

### Update Deployment

When you make changes to your applications:

```bash
# 1. Build specific app
yarn build:container

# 2. Deploy specific app
./deployment/deploy-apps.sh container

# Or deploy all
./deployment/deploy-apps.sh all
```

### Invalidate Cache Only

If you need to invalidate CloudFront cache without re-deploying:

```bash
# Invalidate specific app
./deployment/invalidate-cache.sh container

# Invalidate all
./deployment/invalidate-cache.sh all
```

### Rollback

To rollback to a previous version:

```bash
# 1. Checkout previous git tag or commit
git checkout v1.0.0

# 2. Rebuild
yarn build

# 3. Redeploy
./deployment/deploy-apps.sh all
```

Or use S3 versioning to restore previous files:

```bash
# List versions
aws s3api list-object-versions \
  --bucket app.mfeworld.com \
  --prefix container/

# Restore specific version
aws s3api copy-object \
  --copy-source "app.mfeworld.com/container/index.html?versionId=VERSION_ID" \
  --bucket app.mfeworld.com \
  --key container/index.html
```

---

## Configuration Reference

### config.yaml Structure

```yaml
# AWS Account Settings
aws:
  region: string # AWS region (e.g., us-east-1)
  account_id: string # 12-digit AWS account ID
  profile: string # AWS CLI profile name
  # OR use direct credentials (not recommended)
  access_key_id: string # AWS access key
  secret_access_key: string # AWS secret key

# Application Settings
application:
  name: string # Application name for resource naming
  environment: string # Environment: development|staging|production

# Domain Settings
domain:
  name: string # Full domain name (e.g., app.mfeworld.com)
  hosted_zone_id: string # Route 53 Hosted Zone ID

# CloudFormation Stacks
stacks:
  infrastructure:
    name: string # Stack name for S3/CloudFront
    template: string # Path to template file
  auth:
    name: string # Stack name for Cognito
    template: string # Path to template file

# Deployment Settings
deployment:
  bucket_name: string # S3 bucket name (usually same as domain)
  applications: array # List of apps to deploy
  cache:
    static_max_age: number # Cache time for static assets (seconds)
    html_max_age: number # Cache time for HTML (seconds)
```

### Environment-Specific Configurations

For multiple environments, create separate config files:

```bash
# Development
deployment/config.dev.yaml

# Staging
deployment/config.staging.yaml

# Production
deployment/config.yaml (or config.prod.yaml)
```

Then specify config file when deploying:

```bash
# Edit scripts to use specific config
CONFIG_FILE="${PROJECT_ROOT}/deployment/config.dev.yaml"
```

---

## Troubleshooting

### Common Issues

#### 1. Certificate Validation Timeout

**Symptom:** ACM certificate stays in "Pending validation" status

**Solution:**

- Check Route 53 for CNAME validation records
- Ensure CNAME records were created automatically
- Wait up to 30 minutes for propagation
- If records missing, manually create them using values from ACM console

```bash
# Check certificate status
aws acm list-certificates --region us-east-1

# Describe certificate
aws acm describe-certificate --certificate-arn <ARN> --region us-east-1
```

#### 2. CloudFormation Stack Failed

**Symptom:** Stack creation/update fails with ROLLBACK_COMPLETE status

**Solution:**

The deployment script now automatically handles ROLLBACK_COMPLETE states by:

1. Detecting the failed state
2. Deleting the failed stack
3. Recreating the stack from scratch
4. Displaying detailed error events to help diagnose the issue

Common causes and solutions:

- **Invalid S3 Origin Configuration**: Fixed in recent updates to use proper S3 website endpoint
- **S3 Bucket Name Collision**: Bucket names must be globally unique across all AWS accounts
  - If deployment fails with "Bucket already exists", the bucket name is taken
  - Solution: Use a different domain name or add a unique prefix
- **Invalid parameters**: Check your config.yaml for correct domain and hosted zone ID
- **IAM permission issues**: Ensure your AWS credentials have CloudFormation, S3, CloudFront, ACM, and Route53 permissions
- **Resource limits exceeded**: Check AWS service quotas
- **Certificate not validated**: ACM certificate validation can take up to 30 minutes

```bash
# The script now shows detailed error events automatically
./deployment/deploy-cloudformation.sh infrastructure

# View all stack events (manual check)
aws cloudformation describe-stack-events --stack-name mfe-demo-infrastructure

# Delete failed stack (script now does this automatically)
aws cloudformation delete-stack --stack-name mfe-demo-infrastructure

# Validate template before deploying (script now does this automatically)
aws cloudformation validate-template --template-body file://cloudformation/templates/s3-cloudfront.yaml
```

#### 3. S3 Upload Permission Denied

**Symptom:** `aws s3 sync` fails with access denied

**Solution:**

- Verify AWS credentials are correct
- Check IAM user/role has S3 permissions
- Verify bucket policy allows uploads

```bash
# Test access
aws s3 ls s3://app.mfeworld.com/

# Check bucket policy
aws s3api get-bucket-policy --bucket app.mfeworld.com
```

#### 4. CloudFront Access Denied

**Symptom:** Accessing website shows 403 error

**Solution:**

- Check S3 bucket policy allows public read
- Verify CloudFront distribution is enabled
- Check CloudFront error pages configuration
- Wait for CloudFront distribution to fully deploy (can take 15-20 minutes)

```bash
# Check distribution status
aws cloudfront get-distribution --id <DISTRIBUTION_ID>

# List distributions
aws cloudfront list-distributions
```

#### 5. Cognito Redirect URL Mismatch

**Symptom:** Authentication fails with redirect URL error

**Solution:**

- Verify callback URLs in Cognito User Pool Client
- Ensure URLs match exactly (including trailing slash)
- Update CloudFormation template if needed

```bash
# Get client settings
aws cognito-idp describe-user-pool-client \
  --user-pool-id <POOL_ID> \
  --client-id <CLIENT_ID>
```

#### 6. Application Not Loading

**Symptom:** Website loads but applications don't render

**Solution:**

- Check browser console for errors
- Verify import map URLs in container index.html
- Ensure all MFE files uploaded to S3
- Clear browser cache
- Invalidate CloudFront cache

```bash
# Check if files exist in S3
aws s3 ls s3://app.mfeworld.com/ --recursive

# Invalidate cache
./deployment/invalidate-cache.sh all
```

### Debugging Commands

```bash
# Check AWS credentials
aws sts get-caller-identity

# List CloudFormation stacks
aws cloudformation list-stacks --stack-status-filter CREATE_COMPLETE UPDATE_COMPLETE

# Get stack outputs
aws cloudformation describe-stacks --stack-name mfe-demo-infrastructure --query 'Stacks[0].Outputs'

# Check S3 bucket contents
aws s3 ls s3://app.mfeworld.com/ --recursive --human-readable

# Check CloudFront distribution
aws cloudfront list-distributions --output table

# Check certificate status
aws acm list-certificates --region us-east-1 --output table

# Check Cognito user pool
aws cognito-idp list-user-pools --max-results 10

# Get CloudFront logs
aws cloudfront get-distribution --id <DISTRIBUTION_ID> | grep LoggingEnabled
```

---

## Security Best Practices

### 1. Credential Management

**DO:**

- Use AWS IAM roles with minimum required permissions
- Use AWS CLI profiles instead of hardcoded credentials
- Rotate access keys regularly
- Use AWS Secrets Manager for sensitive data
- Enable MFA on IAM users

**DON'T:**

- Commit credentials to Git
- Share credentials via email or chat
- Use root account for deployments
- Store credentials in config files

### 2. S3 Bucket Security

**Recommended Settings:**

- Enable versioning (already configured in template)
- Enable logging
- Enable encryption at rest
- Use bucket policies for public access control
- Block public ACLs (use bucket policy instead)

```bash
# Enable bucket encryption
aws s3api put-bucket-encryption \
  --bucket app.mfeworld.com \
  --server-side-encryption-configuration '{
    "Rules": [{
      "ApplyServerSideEncryptionByDefault": {
        "SSEAlgorithm": "AES256"
      }
    }]
  }'
```

### 3. CloudFront Security

**Recommended Settings:**

- Use HTTPS only (redirect HTTP to HTTPS) ✓
- Enable origin access identity (OAI) for S3
- Use security headers
- Enable field-level encryption for sensitive data
- Use AWS WAF for additional protection

### 4. Cognito Security

**Recommended Settings:**

- Enable MFA (configured as OPTIONAL in template)
- Use strong password policy ✓
- Enable advanced security features
- Monitor authentication logs
- Use groups for role-based access control ✓

### 5. IAM Policies

Minimum required IAM policy for deployment:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "cloudformation:*",
        "s3:*",
        "cloudfront:*",
        "acm:*",
        "cognito-idp:*",
        "route53:*",
        "iam:CreateRole",
        "iam:DeleteRole",
        "iam:GetRole",
        "iam:PassRole",
        "iam:AttachRolePolicy",
        "iam:DetachRolePolicy"
      ],
      "Resource": "*"
    }
  ]
}
```

### 6. Network Security

**Recommended:**

- Use CloudFront geo-restriction if needed
- Enable CloudFront access logs
- Use AWS Shield for DDoS protection
- Monitor CloudWatch metrics

---

## Cost Considerations

### Monthly Cost Estimates (US East region)

**Small Application (< 10,000 users/month):**

- S3 Storage (1 GB): $0.02
- S3 Requests (100K): $0.04
- CloudFront (1 GB transfer): $0.085
- CloudFront Requests (100K): $0.10
- ACM Certificate: Free
- Route 53 Hosted Zone: $0.50
- Cognito (< 50,000 MAUs): Free
- **Total: ~$1-2/month**

**Medium Application (< 100,000 users/month):**

- S3 Storage (5 GB): $0.12
- S3 Requests (1M): $0.40
- CloudFront (50 GB transfer): $4.25
- CloudFront Requests (1M): $1.00
- ACM Certificate: Free
- Route 53 Hosted Zone: $0.50
- Cognito (< 50,000 MAUs): Free
- **Total: ~$6-8/month**

**Large Application (> 100,000 users/month):**

- Costs scale with usage
- Consider Reserved Capacity for CloudFront
- Cognito charges $0.00550 per MAU after 50,000
- Consider CloudFront Savings Bundle

### Cost Optimization Tips

1. **Enable CloudFront Compression**
   - Reduces bandwidth costs by 70-80%
   - Already enabled in template ✓

2. **Set Appropriate Cache TTLs**
   - Longer cache for static assets (1 year) ✓
   - Short cache for HTML files ✓

3. **Use S3 Lifecycle Policies**
   - Delete old object versions after 30 days ✓
   - Move old logs to Glacier

4. **Monitor and Set Budgets**

   ```bash
   # Create budget alert
   aws budgets create-budget \
     --account-id 123456789012 \
     --budget file://budget.json \
     --notifications-with-subscribers file://notifications.json
   ```

5. **Clean Up Unused Resources**
   - Delete old CloudFront invalidations
   - Remove unused S3 object versions
   - Delete test stacks

### Monitoring Costs

```bash
# Check current month costs
aws ce get-cost-and-usage \
  --time-period Start=2024-01-01,End=2024-01-31 \
  --granularity MONTHLY \
  --metrics BlendedCost \
  --group-by Type=SERVICE

# Set up billing alerts in CloudWatch
```

---

## Advanced Topics

### Multi-Region Deployment

For global applications, deploy to multiple regions:

1. Create config files for each region
2. Deploy infrastructure stacks in each region
3. Use Route 53 latency-based routing
4. Replicate S3 content across regions

### Blue-Green Deployment

Implement zero-downtime deployments:

1. Deploy new version to different S3 prefix
2. Test thoroughly
3. Update CloudFront origin to point to new version
4. Invalidate cache
5. Keep old version for quick rollback

### Automated Deployments

Integrate with CI/CD (GitHub Actions, GitLab CI, etc.):

```yaml
# .github/workflows/deploy.yml
name: Deploy to AWS
on:
  push:
    branches: [main]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Setup Node
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: yarn install
      - run: yarn build
      - name: Configure AWS
        uses: aws-actions/configure-aws-credentials@v2
        with:
          aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
          aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          aws-region: us-east-1
      - name: Deploy
        run: ./deployment/deploy-apps.sh all true
```

---

## Support and Resources

### AWS Documentation

- [CloudFormation User Guide](https://docs.aws.amazon.com/cloudformation/)
- [S3 Developer Guide](https://docs.aws.amazon.com/s3/)
- [CloudFront Developer Guide](https://docs.aws.amazon.com/cloudfront/)
- [Cognito Developer Guide](https://docs.aws.amazon.com/cognito/)

### Useful Commands

```bash
# Get help for any script
./deployment/deploy-cloudformation.sh --help
./deployment/deploy-apps.sh --help

# View CloudFormation template
cat cloudformation/templates/s3-cloudfront.yaml

# Check deployment status
cat deployment/infrastructure-info.txt
cat deployment/cognito-info.txt

# Clean up everything
aws cloudformation delete-stack --stack-name mfe-demo-infrastructure
aws cloudformation delete-stack --stack-name mfe-demo-auth
```

---

## Appendix

### A. CloudFormation Template Parameters

**s3-cloudfront.yaml:**

- `DomainName`: Your domain name
- `HostedZoneId`: Route 53 hosted zone ID
- `Environment`: Environment name (development/staging/production)

**cognito.yaml:**

- `ApplicationName`: Application name for resource naming
- `Environment`: Environment name
- `DomainName`: Domain name for callback URLs

### B. File Structure

```
mfe-demo/
├── cloudformation/
│   └── templates/
│       ├── s3-cloudfront.yaml       # Infrastructure template
│       └── cognito.yaml             # Authentication template
├── deployment/
│   ├── config.example.yaml          # Configuration template
│   ├── config.yaml                  # Your configuration (gitignored)
│   ├── deploy-cloudformation.sh     # Deploy CloudFormation stacks
│   ├── deploy-apps.sh               # Deploy applications
│   ├── invalidate-cache.sh          # Invalidate CloudFront cache
│   ├── infrastructure-info.txt      # Generated after infra deployment
│   └── cognito-info.txt             # Generated after Cognito deployment
├── apps/
│   ├── container/
│   ├── home/
│   ├── preferences/
│   ├── account/
│   └── admin/
└── scripts/
    ├── deploy.sh                    # Legacy deployment script
    └── deploy-all.sh                # Legacy deployment script
```

### C. Checklist

Before going to production:

- [ ] Domain registered and DNS configured
- [ ] AWS credentials configured
- [ ] Configuration file created and reviewed
- [ ] CloudFormation stacks deployed successfully
- [ ] ACM certificate validated
- [ ] Applications built and deployed
- [ ] Users created in Cognito
- [ ] Application tested end-to-end
- [ ] Security settings reviewed
- [ ] Cost monitoring enabled
- [ ] Backup/rollback plan documented
- [ ] Team trained on deployment process

---

**Last Updated:** January 2024
**Version:** 1.0.0

# Deployment Scripts

This directory contains scripts and configuration for deploying the MFE Demo application to AWS.

## Quick Start

### Option 1: Interactive Setup (Recommended for First-Time Users)

```bash
# Run the setup wizard - it will guide you through configuration
./setup-wizard.sh
```

### Option 2: Manual Setup

```bash
# 1. Configure deployment
cp config.example.yaml config.yaml
# Edit config.yaml with your settings

# 2. (Optional) Test your setup
./test-setup.sh

# 3. Deploy infrastructure (CloudFormation stacks)
./deploy-cloudformation.sh all

# 4. Build and deploy applications
./deploy-apps.sh all
```

## Scripts

### setup-wizard.sh (NEW)

Interactive setup wizard that guides you through the configuration process.

**Features:**
- Checks prerequisites (AWS CLI, Node.js, Yarn)
- Verifies AWS credentials
- Creates and configures config.yaml
- Provides step-by-step deployment instructions

**Usage:**
```bash
./setup-wizard.sh
```

### test-setup.sh (NEW)

Validates your deployment setup before deploying.

**Checks:**
- Directory structure
- CloudFormation templates
- Script syntax
- Configuration files
- Documentation
- Required tools (AWS CLI, Node.js, Yarn)

**Usage:**
```bash
./test-setup.sh
```

### validate-templates.sh (NEW)

Validates CloudFormation template syntax.

**Usage:**
```bash
./validate-templates.sh
```

### deploy-cloudformation.sh

Deploys AWS infrastructure using CloudFormation templates.

**Usage:**
```bash
./deploy-cloudformation.sh [command]
```

**Commands:**
- `infrastructure` or `infra` - Deploy S3 and CloudFront stack
- `cognito` or `auth` - Deploy Cognito User Pool stack
- `all` - Deploy all stacks (default)

**Examples:**
```bash
# Deploy all infrastructure
./deploy-cloudformation.sh all

# Deploy only S3 and CloudFront
./deploy-cloudformation.sh infrastructure

# Deploy only Cognito
./deploy-cloudformation.sh cognito
```

### deploy-apps.sh

Builds and deploys applications to S3, then invalidates CloudFront cache.

**Usage:**
```bash
./deploy-apps.sh [app-name] [skip-build]
```

**Arguments:**
- `app-name` - Name of application to deploy (or "all")
  - Options: `all`, `container`, `home`, `preferences`, `account`, `admin`
- `skip-build` - Set to "true" to skip building (default: false)

**Examples:**
```bash
# Deploy all applications (builds first)
./deploy-apps.sh all

# Deploy only container app
./deploy-apps.sh container

# Deploy all without building (if already built)
./deploy-apps.sh all true

# Deploy specific app without building
./deploy-apps.sh home true
```

### invalidate-cache.sh

Invalidates CloudFront cache for specific applications or all content.

**Usage:**
```bash
./invalidate-cache.sh [target]
```

**Arguments:**
- `target` - Application name or "all" (default: all)

**Examples:**
```bash
# Invalidate all cache
./invalidate-cache.sh all

# Invalidate cache for container app only
./invalidate-cache.sh container

# Invalidate cache for home MFE
./invalidate-cache.sh home
```

## Configuration

### config.yaml

Main configuration file for deployment. Copy from `config.example.yaml` and customize.

**Required Settings:**
- `aws.region` - AWS region
- `aws.account_id` - AWS account ID
- `aws.profile` - AWS CLI profile name
- `domain.name` - Your domain name
- `domain.hosted_zone_id` - Route 53 hosted zone ID

**Example:**
```yaml
aws:
  region: us-east-1
  account_id: "123456789012"
  profile: default

domain:
  name: app.mfeworld.com
  hosted_zone_id: Z1234567890ABC

application:
  name: mfe-demo
  environment: production
```

## Generated Files

These files are automatically generated during deployment and are gitignored:

- `config.yaml` - Your configuration (copy from config.example.yaml)
- `infrastructure-info.txt` - Infrastructure deployment outputs
- `cognito-info.txt` - Cognito deployment outputs

## Prerequisites

1. **AWS CLI** installed and configured
2. **Node.js** 18+ and **Yarn** installed
3. **Route 53 Hosted Zone** created manually
4. **AWS credentials** with appropriate permissions

## Detailed Documentation

For complete deployment instructions, see [AWS_DEPLOYMENT_GUIDE.md](../AWS_DEPLOYMENT_GUIDE.md) in the project root.

## Troubleshooting

### Common Issues

**"Configuration file not found"**
- Copy `config.example.yaml` to `config.yaml`
- Fill in your AWS and domain settings

**"Infrastructure info file not found"**
- Deploy CloudFormation stacks first: `./deploy-cloudformation.sh all`

**"AWS credentials not configured"**
- Run `aws configure` to set up credentials
- Or update `config.yaml` with profile name

**Certificate validation timeout**
- Wait up to 30 minutes for ACM certificate validation
- Check Route 53 for CNAME records
- Verify domain nameservers point to AWS

## Support

For issues or questions:
1. Check the [AWS Deployment Guide](../AWS_DEPLOYMENT_GUIDE.md)
2. Review CloudFormation stack events in AWS Console
3. Check script output for error messages
4. Open an issue in the GitHub repository

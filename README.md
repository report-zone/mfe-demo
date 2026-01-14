# MFE Demo - Micro Frontend Architecture

An MFE architecture demo using React, TypeScript, React Router, Material UI v6, AWS Amplify and Cognito.

## Overview

This project demonstrates a micro frontend (MFE) architecture using modern web technologies without relying on complex MFE libraries like single-spa or Module Federation. It uses import maps and supports independent development and deployment of each micro frontend.

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     CloudFront CDN                          │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                  S3 Bucket (app.mfeworld.com)               │
│  ┌────────────┬────────┬──────────┬─────────────┬────────┐  │
│  │ container/ │ home/  │ account/ │ preferences/│ admin/ │  │
│  └────────────┴────────┴──────────┴─────────────┴────────┘  │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                    Container Application                     │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  Header + Navbar (with Role Protection)             │   │
│  └──────────────────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  Router + Auth Context + Data Context                │   │
│  └──────────────────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  Dynamic Microfrontend Loader (Import Maps)          │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
          │         │          │          │
          ▼         ▼          ▼          ▼
    ┌─────────┬─────────┬────────────┬─────────┐
    │  Home   │ Account │Preferences │   Admin │
    │   MFE   │   MFE   │   MFE      │   MFE   │
    └─────────┴─────────┴────────────┴─────────┘
```

## Technology Stack

### Frontend Stack

| Technology   | Version | Purpose                                 |
| ------------ | ------- | --------------------------------------- |
| React        | 18.3.1  | UI framework with concurrent features   |
| Material UI  | 6.1.6   | Component library for consistent design |
| TypeScript   | 5.3.3   | Type safety                             |
| React Router | 6.21.3  | Client-side routing                     |
| Vite         | 5.0.11  | Build tool and dev server               |
| AWS Amplify  | 6.0.8   | Authentication with Cognito             |

### Development Tools

| Tool            | Purpose                |
| --------------- | ---------------------- |
| Vitest          | Unit testing framework |
| Cypress         | E2E testing framework  |
| ESLint          | Code linting           |
| Prettier        | Code formatting        |
| Yarn Workspaces | Monorepo management    |

## Prerequisites

- Node.js >= 18.0.0
- Yarn >= 1.22.0

## Getting Started

### Installation

```bash
# Install dependencies for all workspaces
yarn install
```

### Development

Run all applications in development mode:

```bash
yarn dev
```

Run individual applications:

```bash
# Container app (port 3000)
yarn dev:container

# Home MFE (port 3001)
yarn dev:home

# Preferences MFE (port 3002)
yarn dev:preferences

# Account MFE (port 3003)
yarn dev:account

# Admin MFE (port 3004)
yarn dev:admin
```

### Building

Build all applications:

```bash
yarn build
```

Build individual applications:

```bash
yarn build:container
yarn build:home
yarn build:preferences
yarn build:account
yarn build:admin
```

### Testing

Run all tests:

```bash
yarn test
```

Run unit tests:

```bash
yarn test:unit
```

Run E2E tests (container only):

```bash
yarn test:e2e
```

### Linting & Formatting

```bash
# Lint all code
yarn lint

# Format all code
yarn format

# Check formatting
yarn format:check
```

## Project Structure

```
mfe-demo/
├── apps/
│   ├── container/       # Main container application
│   ├── home/            # Home MFE
│   ├── preferences/     # Preferences MFE
│   ├── account/         # Account MFE
│   └── admin/           # Admin MFE (protected)
├── packages/            # Shared packages (future)
└── ...config files
```

## Authentication

The application uses AWS Cognito for authentication. To configure:

1. Copy `.env.example` to `.env` in the container app
2. Update the following environment variables:
   - `VITE_COGNITO_USER_POOL_ID`
   - `VITE_COGNITO_CLIENT_ID`
   - `VITE_AWS_REGION`

## Protected Routes

The Admin MFE is protected and requires users to have the `admin` group in Cognito to access.

## Deployment

Each MFE can be deployed independently to AWS S3 and served via CloudFront:

```bash
# Build for production
yarn build:<app-name>

# Deploy to S3 (requires AWS CLI configured)
aws s3 sync apps/<app-name>/dist s3://app.mfeworld.com/<app-name>/
```

## Testing Strategy

### Unit Tests (Vitest)

- Component Testing
- Context Testing
- Hook Testing
- Utility Testing

### E2E Tests (Cypress)

- Authentication Flow
- Navigation
- Protected Routes
- User Interactions

### Coverage Goals

- Statements: > 80%
- Branches: > 75%
- Functions: > 80%
- Lines: > 80%

## Contributing

Please follow the PR naming convention: `step<N>-<meaningful-name>`

Examples:
- `step1-setup-monorepo`
- `step2-add-authentication`
- `step3-implement-mfe-loader`

## License

MIT

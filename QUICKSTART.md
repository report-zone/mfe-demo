# MFE Demo - Quick Start

This is a micro frontend (MFE) architecture demonstration project.

## Quick Start

```bash
# Install dependencies
yarn install

# If Cypress binary download fails, use this instead:
# CYPRESS_INSTALL_BINARY=0 yarn install

# Start all apps (container + all 4 MFEs)
yarn dev

# OR start just container app
yarn dev:container

# Open http://localhost:4000
```

## What's Included

- **Container App** (port 4000): Main application with authentication, routing, and MFE loading
- **Home MFE** (port 3001): Home page micro frontend
- **Preferences MFE** (port 3002): User preferences micro frontend  
- **Account MFE** (port 3003): Account management micro frontend
- **Admin MFE** (port 3004): Admin panel (protected route, requires admin role)

## Key Features

✅ Material UI v6 for consistent design  
✅ TypeScript for type safety  
✅ React Router for client-side routing  
✅ AWS Amplify authentication with Cognito  
✅ Role-based access control  
✅ Independent deployment of each MFE  
✅ Unit tests with Vitest  
✅ E2E tests with Cypress  
✅ ESLint and Prettier configured  
✅ Deployment scripts for AWS S3 + CloudFront  

## Architecture

```
Container App (Shell)
├── Authentication (AWS Cognito)
├── Routing (React Router)
├── Header + Navbar
└── Dynamic MFE Loader
    ├── Home MFE
    ├── Preferences MFE
    ├── Account MFE
    └── Admin MFE (Protected)
```

## Common Commands

```bash
# Development
yarn dev                   # Start all apps concurrently
yarn dev:container        # Start container app
yarn dev:home            # Start home MFE standalone
yarn dev:preferences     # Start preferences MFE standalone
yarn dev:account         # Start account MFE standalone
yarn dev:admin           # Start admin MFE standalone

# Building
yarn build               # Build all apps
yarn build:container     # Build container app
yarn build:home          # Build home MFE

# Production Preview (Local)
yarn prod:local          # Build and run all apps in production mode locally

# Testing
yarn test:unit           # Run unit tests
yarn lint                # Lint code
yarn format              # Format code

# Deployment
./scripts/deploy.sh container       # Deploy container
./scripts/deploy-all.sh             # Deploy all apps
```

## Documentation

- **[README.md](./README.md)** - Complete project overview
- **[DEVELOPER.md](./DEVELOPER.md)** - Developer guide with detailed instructions
- **[RUNNING_PRODUCTION_LOCALLY.md](./RUNNING_PRODUCTION_LOCALLY.md)** - Test production builds locally
- **[DEPLOYMENT.md](./DEPLOYMENT.md)** - Deployment guide for AWS

## Tech Stack

| Technology | Version | Purpose |
|------------|---------|---------|
| React | 18.3.1 | UI Framework |
| TypeScript | 5.3.3 | Type Safety |
| Material UI | 6.1.6 | Component Library |
| React Router | 6.21.3 | Routing |
| Vite | 5.0.11 | Build Tool |
| Vitest | 1.2.0 | Unit Testing |
| Cypress | 13.6.3 | E2E Testing |
| AWS Amplify | 6.0.8 | Authentication |

## Project Structure

```
mfe-demo/
├── apps/
│   ├── container/      # Main shell application
│   ├── home/          # Home MFE
│   ├── preferences/   # Preferences MFE
│   ├── account/       # Account MFE
│   └── admin/         # Admin MFE
├── scripts/           # Deployment scripts
├── DEVELOPER.md       # Developer guide
├── DEPLOYMENT.md      # Deployment guide
└── package.json       # Root configuration
```

## Authentication

The app uses AWS Cognito for authentication. To test:

1. Copy `.env.example` to `.env` in `apps/container/`
2. Add your Cognito credentials
3. Start the app with `yarn dev:container`

## Development Workflow

1. Make changes to source files
2. Changes auto-reload with HMR
3. Run tests: `yarn test:unit`
4. Run linter: `yarn lint`
5. Format code: `yarn format`
6. Build: `yarn build`
7. Deploy: `./scripts/deploy.sh <app-name>`

## Need Help?

- Read [DEVELOPER.md](./DEVELOPER.md) for detailed development guide
- Read [DEPLOYMENT.md](./DEPLOYMENT.md) for deployment instructions
- Check the [README.md](./README.md) for architecture details
- Open an issue on GitHub

## License

MIT

# MFE Demo Architecture Diagrams

This folder contains architectural diagrams for the MFE Demo project.

## Diagrams

### 1. MFE Architecture (`mfe-architecture.png`)

![MFE Architecture](./mfe-architecture.png)

High-level overview of the micro-frontend architecture showing:

- End users accessing the application through CloudFront CDN
- Container application serving as the shell
- Four micro frontends (Home, Account, Preferences, Admin)
- AWS Cognito for authentication

### 2. AWS Deployment Architecture (`deployment-architecture.png`)

![AWS Deployment Architecture](./deployment-architecture.png)

AWS deployment topology showing:

- Browser client connecting to CloudFront CDN
- S3 bucket structure with separate folders for each MFE
- Cognito User Pool for authentication
- Static hosting configuration

### 3. Container Application Components (`component-architecture.png`)

![Component Architecture](./component-architecture.png)

Internal architecture of the Container application showing:

- Services Layer (eventBus, storageService, authService)
- Context Providers (AuthContext, DataContext, UserPreferencesContext)
- Configuration Layer (theme, routeMappings, mfeRegistry)
- Core Components (Header, Navbar, MFELoader, ErrorBoundary)
- Shared Packages integration

### 4. MFE Data Flow (`data-flow.png`)

![MFE Data Flow](./data-flow.png)

Data flow through the application showing:

- Browser to React Router routing
- Micro frontends communication via EventBus
- State management through AuthContext and DataContext
- LocalStorage for persistence
- AWS Cognito authentication flow

## Regenerating Diagrams

These diagrams were generated using Python's `diagrams` library. To regenerate:

```bash
# Install dependencies
pip3 install diagrams pillow
sudo apt-get install graphviz

# Run the generation script (if available)
python3 scripts/create_diagrams.py
```

## Technology

- **Library**: [Diagrams](https://diagrams.mingrammer.com/) - Diagram as Code
- **Format**: PNG (high-resolution)
- **Icons**: AWS Architecture Icons, Programming Framework Icons

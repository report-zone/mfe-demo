#!/usr/bin/env python3
"""
Create architectural diagrams for MFE Demo project.

Prerequisites:
    pip3 install diagrams pillow
    sudo apt-get install graphviz  # For Linux
    brew install graphviz          # For macOS

Usage:
    python3 scripts/create_diagrams.py
"""
import os
from diagrams import Diagram, Cluster
from diagrams.aws.network import CloudFront
from diagrams.aws.storage import S3
from diagrams.aws.security import Cognito
from diagrams.onprem.client import Client, Users
from diagrams.programming.framework import React
from diagrams.programming.language import TypeScript

# Output directory (relative to repo root)
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
REPO_ROOT = os.path.dirname(SCRIPT_DIR)
OUTPUT_DIR = os.path.join(REPO_ROOT, "docs", "diagrams")


def create_mfe_architecture_diagram():
    """Create high-level MFE architecture diagram."""
    with Diagram(
        "MFE Demo Architecture",
        filename=os.path.join(OUTPUT_DIR, "mfe-architecture"),
        show=False,
        direction="TB",
        graph_attr={
            "fontsize": "20",
            "fontname": "Arial",
            "bgcolor": "white",
            "pad": "0.5"
        }
    ):
        users = Users("End Users")

        with Cluster("AWS Cloud"):
            cdn = CloudFront("CloudFront CDN")
            cognito = Cognito("Cognito Auth")

            with Cluster("S3 Bucket (app.mfeworld.com)"):
                with Cluster("Container Application"):
                    container = React("Container\n(Port 4000)\n- Header/Navbar\n- Auth Context\n- Router")

                with Cluster("Micro Frontends"):
                    home = React("Home MFE\n(Port 3001)")
                    preferences = React("Preferences MFE\n(Port 3002)")
                    account = React("Account MFE\n(Port 3003)")
                    admin = React("Admin MFE\n(Port 3004)")

        # Connections
        users >> cdn
        cdn >> container
        container >> cognito
        container >> [home, preferences, account, admin]


def create_deployment_architecture_diagram():
    """Create AWS deployment architecture diagram."""
    with Diagram(
        "AWS Deployment Architecture",
        filename=os.path.join(OUTPUT_DIR, "deployment-architecture"),
        show=False,
        direction="LR",
        graph_attr={
            "fontsize": "20",
            "fontname": "Arial",
            "bgcolor": "white",
            "pad": "0.5"
        }
    ):
        with Cluster("Client"):
            browser = Client("Browser")

        with Cluster("AWS Cloud"):
            cdn = CloudFront("CloudFront\nCDN")

            with Cluster("Authentication"):
                cognito = Cognito("Cognito\nUser Pool")

            with Cluster("Static Hosting"):
                s3 = S3("S3 Bucket")

                with Cluster("Application Folders"):
                    S3("container/")
                    S3("home/")
                    S3("preferences/")
                    S3("account/")
                    S3("admin/")

        browser >> cdn
        cdn >> s3
        browser >> cognito


def create_component_architecture_diagram():
    """Create application component architecture diagram."""
    with Diagram(
        "Container Application Components",
        filename=os.path.join(OUTPUT_DIR, "component-architecture"),
        show=False,
        direction="TB",
        graph_attr={
            "fontsize": "20",
            "fontname": "Arial",
            "bgcolor": "white",
            "pad": "0.5"
        }
    ):
        with Cluster("Container App (apps/container)"):
            with Cluster("Configuration Layer"):
                config_mfe = TypeScript("mfeRegistry.ts")
                TypeScript("routeMappings.ts")
                TypeScript("theme.ts")

            with Cluster("Context Providers"):
                auth_ctx = React("AuthContext")
                React("DataContext")
                React("UserPreferencesContext")

            with Cluster("Core Components"):
                header = React("Header")
                navbar = React("Navbar")
                mfe_loader = React("MFELoader")
                React("ErrorBoundary")

            with Cluster("Services Layer"):
                TypeScript("authService")
                TypeScript("storageService")
                TypeScript("eventBus")

        with Cluster("Shared Packages"):
            TypeScript("packages/shared-hooks")

        with Cluster("Micro Frontends"):
            home_mfe = React("Home MFE")
            prefs_mfe = React("Preferences MFE")
            account_mfe = React("Account MFE")
            admin_mfe = React("Admin MFE")

        # Connections
        config_mfe >> mfe_loader
        auth_ctx >> header
        auth_ctx >> navbar
        mfe_loader >> [home_mfe, prefs_mfe, account_mfe, admin_mfe]


def create_data_flow_diagram():
    """Create data flow architecture diagram."""
    with Diagram(
        "MFE Data Flow",
        filename=os.path.join(OUTPUT_DIR, "data-flow"),
        show=False,
        direction="LR",
        graph_attr={
            "fontsize": "20",
            "fontname": "Arial",
            "bgcolor": "white",
            "pad": "0.5"
        }
    ):
        with Cluster("User Interface"):
            browser = Client("Browser")

        with Cluster("Container Application"):
            with Cluster("Routing"):
                router = React("React Router")

            with Cluster("State Management"):
                auth_ctx = React("AuthContext")
                React("DataContext")

            with Cluster("Communication"):
                event_bus = TypeScript("EventBus")
                TypeScript("LocalStorage")

        with Cluster("Authentication"):
            cognito = Cognito("AWS Cognito")

        with Cluster("Micro Frontends"):
            mfes = React("MFEs\n(Home, Account,\nPreferences, Admin)")

        # Flow connections
        browser >> router
        router >> mfes
        auth_ctx >> cognito
        mfes >> event_bus
        event_bus >> auth_ctx


if __name__ == "__main__":
    print("Creating architectural diagrams...")
    print(f"Output directory: {OUTPUT_DIR}")

    # Ensure output directory exists
    os.makedirs(OUTPUT_DIR, exist_ok=True)

    print("1. Creating MFE Architecture diagram...")
    create_mfe_architecture_diagram()

    print("2. Creating Deployment Architecture diagram...")
    create_deployment_architecture_diagram()

    print("3. Creating Component Architecture diagram...")
    create_component_architecture_diagram()

    print("4. Creating Data Flow diagram...")
    create_data_flow_diagram()

    print(f"\nDiagrams created successfully!")
    print("Files created:")
    for f in sorted(os.listdir(OUTPUT_DIR)):
        if f.endswith('.png'):
            print(f"  - {f}")

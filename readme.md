# HatchWorks AI - Financial Agent Platform

> **Production-ready AI agent platform for financial analysis, market research, and business intelligence**

[![Platform](https://img.shields.io/badge/Platform-Google%20ADK-4285F4?style=flat-square)](https://cloud.google.com/products/agent-developer-kit)
[![Frontend](https://img.shields.io/badge/Frontend-React%2018-61DAFB?style=flat-square)](https://react.dev)
[![Backend](https://img.shields.io/badge/Backend-Python%203.12-3776AB?style=flat-square)](https://python.org)
[![License](https://img.shields.io/badge/License-Apache%202.0-green?style=flat-square)](LICENSE)

---

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Architecture](#architecture)
- [Prerequisites](#prerequisites)
- [Quick Start](#quick-start)
- [Backend Setup](#backend-setup)
- [Frontend Setup](#frontend-setup)
- [Development](#development)
- [Deployment](#deployment)
- [Project Structure](#project-structure)
- [Documentation](#documentation)
- [Troubleshooting](#troubleshooting)
- [Contributing](#contributing)

---

## Overview

HatchWorks AI is an intelligent financial analysis platform that combines **Google's Agent Development Kit (ADK)** with a modern **React frontend**. The platform provides specialized AI agents that deliver actionable insights for financial professionals and business analysts.

### What It Does

- **Financial Analysis** - Analyze P&L statements, cash flow, balance sheets with AI-powered insights
- **Market Research** - Monitor industry trends, competitive landscape, and market intelligence
- **AI Opportunity Discovery** - Identify automation opportunities using the AI Opportunity Finder framework
- **KPI Development** - Generate custom leading and lagging indicators tailored to your business

### Why This Platform?

- ✅ **Production-Ready**: Built on Google ADK with enterprise-grade reliability
- ✅ **Modern Stack**: React 18, TypeScript, Tailwind CSS for beautiful, responsive UI
- ✅ **Real-Time Streaming**: SSE-powered chat for instant AI responses
- ✅ **Multi-Agent Architecture**: Specialized agents working together intelligently
- ✅ **Cloud-Native**: Deploy to Google Cloud Platform with one command
- ✅ **Extensible**: Easy to add new agents, tools, and integrations

---

## Features

### Backend (Google ADK)

- **Multi-Agent Coordinator**: Intelligent routing between specialized agents
- **Custom Tools**: Financial analysis, market research, document processing
- **SSE Streaming**: Real-time response streaming for better UX
- **Secret Management**: Secure credential storage with Google Secret Manager
- **Evaluation Framework**: Automated testing and quality assurance
- **One-Command Deployment**: Deploy to Agent Engine effortlessly

### Frontend (React + TypeScript)

- **Real-Time Chat Interface**: Smooth, streaming chat experience
- **Beautiful Design**: Modern, clean UI matching HatchWorks brand
- **Responsive**: Works perfectly on desktop, tablet, and mobile
- **Authentication**: User management and session handling
- **Service Integrations**: Connect Google, Salesforce, SharePoint
- **Fast**: Vite-powered development with instant hot reload

---

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    React Frontend                            │
│         (Port 5173 - Development)                            │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  Pages: Home, Catalog, Chat, Settings                  │ │
│  │  Components: ChatInterface, AgentCard, Header          │ │
│  │  State: React Context (Auth, Session)                  │ │
│  │  API: Axios + React Query                              │ │
│  └────────────────────────────────────────────────────────┘ │
└───────────────────────────┬───────────────────────────────────┘
                            │ HTTP/SSE
                            │ (Port 8080)
┌───────────────────────────▼───────────────────────────────────┐
│                   Google ADK Backend                          │
│                   (Python 3.12)                               │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  Root Agent (Coordinator)                              │ │
│  │  ├── Financial Agent → financial_tools.py              │ │
│  │  ├── Market Agent → market_tools.py                    │ │
│  │  ├── AI Opportunity Agent → opportunity_tools.py       │ │
│  │  └── KPI Agent → kpi_tools.py                          │ │
│  │                                                          │ │
│  │  Infrastructure:                                        │ │
│  │  • Session Management                                   │ │
│  │  • Tool Context & Execution                            │ │
│  │  • Response Streaming (SSE)                            │ │
│  └────────────────────────────────────────────────────────┘ │
└───────────────────────────┬───────────────────────────────────┘
                            │
                ┌───────────┴──────────┐
                │                      │
         ┌──────▼──────┐        ┌─────▼─────┐
         │  Vertex AI  │        │  Secrets  │
         │   (Gemini)  │        │  Manager  │
         └─────────────┘        └───────────┘
```

---

## Prerequisites

### Required

- **Python 3.12** - [Download](https://www.python.org/downloads/)
- **Node.js 18+** - [Download](https://nodejs.org/)
- **uv** - Python package manager
  ```bash
  curl -LsSf https://astral.sh/uv/install.sh | sh
  ```
- **Google Cloud Account** (for deployment)
  - Free tier available with $300 credits
  - [Sign up](https://cloud.google.com/free)

### Optional but Recommended

- **gcloud CLI** - [Install](https://cloud.google.com/sdk/docs/install)
- **VS Code** with extensions:
  - Python
  - Pylance
  - ESLint
  - Tailwind CSS IntelliSense
- **Git** for version control

---

## Quick Start

Get up and running in 5 minutes!

### 1. Clone the Repository

```bash
git clone https://github.com/sreenikethaathreya-hw/adksolutionsaccelerator
cd adksolutionsaccelerator
```

### 2. Backend Setup (Terminal 1)

```bash
# Install Python dependencies
uv sync --all-extras

# Create .env file
cp .env.example .env

# Edit .env with your settings
nano .env

# Run the agent locally
uv run adk run financial_agent
```

### 3. Frontend Setup (Terminal 2)

```bash
# Navigate to frontend
cd frontend

# Install dependencies
npm install

# Copy and configure environment
cp .env.example .env

# Start development server
npm run dev
```

### 4. Open Your Browser

- **Frontend**: http://localhost:5173
- **Backend**: Running in terminal (port 8080 when deployed)

---

## Backend Setup

### Directory Structure

```
adksolutionsaccelerator/
├── financial_agent/           # Main agent package
│   ├── __init__.py           # GCP setup & exports
│   ├── agent.py              # Agent definitions
│   ├── prompts.py            # Agent instructions
│   └── tools/                # Tool implementations
│       ├── financial_tools.py
│       ├── market_tools.py
│       ├── kpi_tools.py
│       └── document_tools.py
├── deployment/               # Deployment scripts
│   ├── deploy.py
│   └── test_deployment.py
├── eval/                     # Evaluation framework
│   ├── data/
│   │   └── conversation.test.json
│   └── test_eval.py
├── tests/                    # Unit tests
│   └── test_agents.py
├── pyproject.toml           # Python dependencies
└── .env                     # Environment variables
```

### Environment Setup

**`.env` file:**

```bash
# Google Cloud Configuration
GOOGLE_CLOUD_PROJECT=your-project-id
GOOGLE_CLOUD_LOCATION=us-central1
GOOGLE_GENAI_USE_VERTEXAI=True

# For Deployment
STAGING_BUCKET=your-staging-bucket

# Agent Engine (auto-populated after deployment)
# AGENT_ENGINE_ID=projects/.../locations/.../reasoningEngines/...

# Optional: Local Development
# GOOGLE_API_KEY=your-api-key-for-local-testing
```

### Install Dependencies

```bash
# Install base dependencies
uv sync

# Install dev dependencies (testing)
uv sync --with dev

# Install deployment dependencies
uv sync --with deployment

# Install everything
uv sync --all-extras
```

### Running Locally

```bash
# Interactive CLI mode
uv run adk run financial_agent

# Web UI mode (opens browser)
uv run adk web

# Run specific agent
uv run python -c "from financial_agent.agent import root_agent; print(root_agent)"
```

### Testing

```bash
# Run unit tests
uv run pytest tests/

# Run evaluation tests
uv run pytest eval/

# Run with coverage
uv run pytest --cov=financial_agent tests/
```

### Google Cloud Authentication

```bash
# Login to Google Cloud
gcloud auth login

# Set up Application Default Credentials
gcloud auth application-default login

# Set your project
gcloud config set project YOUR_PROJECT_ID

# Enable required APIs
gcloud services enable aiplatform.googleapis.com
gcloud services enable secretmanager.googleapis.com
gcloud services enable storage-api.googleapis.com
```

### Creating a GCP Project

```bash
# Create project (use unique ID)
gcloud projects create your-unique-project-id --name="Financial Agent"

# Set as active project
gcloud config set project your-unique-project-id

# Enable APIs
gcloud services enable aiplatform.googleapis.com

# Create staging bucket
gsutil mb gs://your-unique-project-id-staging
```

---

## ⚛️ Frontend Setup

### Directory Structure

```
frontend/
├── src/
│   ├── api/                  # API integration
│   │   ├── client.ts        # Axios config
│   │   ├── agents.ts        # Agent endpoints
│   │   └── auth.ts          # Authentication
│   ├── components/           # React components
│   │   ├── ChatInterface.tsx
│   │   ├── AgentCard.tsx
│   │   └── Header.tsx
│   ├── contexts/            # State management
│   │   ├── AuthContext.tsx
│   │   └── SessionContext.tsx
│   ├── pages/               # Page components
│   │   ├── HomePage.tsx
│   │   ├── AgentCatalogPage.tsx
│   │   ├── ChatPage.tsx
│   │   └── SettingsPage.tsx
│   ├── types/               # TypeScript types
│   ├── utils/               # Utilities
│   ├── App.tsx              # Main app
│   ├── main.tsx             # Entry point
│   └── index.css            # Global styles
├── public/
├── .env                     # Environment variables
├── package.json
├── tsconfig.json
├── tailwind.config.js
└── vite.config.ts
```

### Environment Setup

**`frontend/.env` file:**

```bash
# Backend API URL
VITE_API_URL=http://localhost:8080

# Application Name
VITE_APP_NAME=HatchWorksAI

# Optional: Mock Auth for Development
# VITE_MOCK_AUTH=true
```

### Install Dependencies

```bash
cd frontend

# Install all dependencies
npm install

# Or with yarn
yarn install
```

### Running Locally

```bash
# Start development server (with hot reload)
npm run dev

# Start on different port
npm run dev -- --port 3000

# Preview production build
npm run build
npm run preview
```

### Building for Production

```bash
# Create production build
npm run build

# Output in: dist/
```

### Type Checking

```bash
# Run TypeScript type checking
npm run type-check

# Watch mode
npm run type-check -- --watch
```

### Linting

```bash
# Run ESLint
npm run lint

# Fix auto-fixable issues
npm run lint -- --fix
```

---

## Development

### Development Workflow

1. **Start Backend** (Terminal 1):
   ```bash
   cd ~/adksolutionsaccelerator
   uv run adk run financial_agent
   ```

2. **Start Frontend** (Terminal 2):
   ```bash
   cd ~/adksolutionsaccelerator/frontend
   npm run dev
   ```

3. **Open Browser**:
   - Frontend: http://localhost:5173
   - Changes hot-reload automatically

### Adding a New Tool

**1. Create tool function** in `financial_agent/tools/`:

```python
# financial_agent/tools/new_tool.py
from typing import Dict, Any
from google.adk.tools import ToolContext
import logging

logger = logging.getLogger(__name__)

def my_new_tool(
    param1: str,
    param2: int,
    tool_context: ToolContext = None
) -> Dict[str, Any]:
    """
    Description of what this tool does.
    
    Args:
        param1: Description
        param2: Description
        tool_context: ADK tool context
    
    Returns:
        Dictionary with results
    """
    logger.info(f"Running my_new_tool with {param1}, {param2}")
    
    # Your implementation here
    result = {"status": "success", "data": "result"}
    
    return result
```

**2. Register tool** in `financial_agent/agent.py`:

```python
from .tools.new_tool import my_new_tool

financial_agent = LlmAgent(
    name="financial_agent",
    # ... other config
    tools=[
        analyze_financial_statement,
        my_new_tool,  # Add your tool
    ],
)
```

**3. Document in prompts** (`financial_agent/prompts.py`):

```python
FINANCIAL_AGENT_PROMPT = """
...existing prompt...

Available tools:
- my_new_tool: Description of what it does and when to use it
"""
```

**4. Test it**:

```bash
uv run pytest tests/test_agents.py::test_my_new_tool
```

### Adding a New Frontend Page

**1. Create page component**:

```typescript
// src/pages/NewPage.tsx
import React from 'react';

export const NewPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold">New Page</h1>
        {/* Your content */}
      </div>
    </div>
  );
};
```

**2. Add route** in `src/App.tsx`:

```typescript
import { NewPage } from './pages/NewPage';

// In Routes:
<Route path="/new-page" element={<NewPage />} />
```

**3. Add navigation** in `src/components/Header.tsx`:

```typescript
<Link to="/new-page">New Page</Link>
```

### Code Style Guidelines

**Backend (Python):**
- Follow PEP 8
- Use type hints
- Document all functions with docstrings
- Use `snake_case` for functions and variables
- Log important operations

**Frontend (TypeScript):**
- Use TypeScript strict mode
- Follow React best practices
- Use functional components with hooks
- Use `camelCase` for variables, `PascalCase` for components
- Keep components under 300 lines

---

## Deployment

### Backend Deployment (Agent Engine)

**1. Ensure GCP setup is complete:**

```bash
gcloud config get-value project  # Should show your project ID
gcloud auth application-default login
```

**2. Deploy to Agent Engine:**

```bash
# Install deployment dependencies
uv sync --with deployment

# Deploy (creates new agent)
python deployment/deploy.py --create

# This will:
# - Package your agent
# - Upload to GCS
# - Create Agent Engine instance
# - Update .env with AGENT_ENGINE_ID
```

**3. Test deployed agent:**

```bash
# Get your AGENT_ENGINE_ID from .env
python deployment/test_deployment.py \
  --resource_id=YOUR_AGENT_ENGINE_ID \
  --user_id=test_user
```

**4. Manage deployment:**

```bash
# List all deployed agents
python deployment/deploy.py --list

# Delete an agent
python deployment/deploy.py --delete --resource_id=AGENT_ENGINE_ID
```

### Frontend Deployment

#### Option 1: Vercel (Recommended)

```bash
cd frontend

# Install Vercel CLI
npm install -g vercel

# Deploy
vercel

# Production deployment
vercel --prod
```

#### Option 2: Netlify

```bash
cd frontend

# Install Netlify CLI
npm install -g netlify-cli

# Build
npm run build

# Deploy
netlify deploy --prod --dir=dist
```

#### Option 3: Firebase Hosting

```bash
cd frontend

# Install Firebase CLI
npm install -g firebase-tools

# Login
firebase login

# Initialize
firebase init hosting

# Deploy
firebase deploy
```

#### Option 4: Cloud Run (with Backend)

**Create `Dockerfile` in project root:**

```dockerfile
# Frontend build stage
FROM node:18 AS frontend-build
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm ci
COPY frontend/ ./
RUN npm run build

# Backend stage
FROM python:3.12-slim
WORKDIR /app

# Install uv
RUN pip install uv

# Copy backend files
COPY pyproject.toml ./
COPY financial_agent/ ./financial_agent/

# Install dependencies
RUN uv sync

# Copy frontend build
COPY --from=frontend-build /app/frontend/dist ./static

# Expose port
EXPOSE 8080

# Run
CMD ["uv", "run", "python", "-m", "financial_agent"]
```

**Deploy:**

```bash
gcloud run deploy financial-agent \
  --source . \
  --region us-central1 \
  --allow-unauthenticated
```

### Environment Variables for Production

**Backend:**
- `GOOGLE_CLOUD_PROJECT` - Your GCP project ID
- `GOOGLE_CLOUD_LOCATION` - Region (e.g., us-central1)
- `STAGING_BUCKET` - GCS bucket name
- `AGENT_ENGINE_ID` - Deployed agent resource ID

**Frontend:**
- `VITE_API_URL` - Backend API URL (e.g., https://api.yourdomain.com)
- `VITE_APP_NAME` - Application name

---

## Project Structure

```
adksolutionsaccelerator/
│
├── 📂 financial_agent/              # Backend (Python ADK)
│   ├── __init__.py                 # Package setup & GCP config
│   ├── agent.py                    # Multi-agent definitions
│   ├── prompts.py                  # Agent instructions
│   ├── config.py                   # Configuration
│   └── tools/                      # Tool implementations
│       ├── financial_tools.py      # Financial analysis
│       ├── market_tools.py         # Market research
│       ├── kpi_tools.py           # KPI generation
│       └── document_tools.py       # Document processing
│
├── 📂 deployment/                   # Deployment scripts
│   ├── deploy.py                   # Deploy to Agent Engine
│   └── test_deployment.py          # Test deployed agent
│
├── 📂 eval/                        # Evaluation framework
│   ├── data/
│   │   ├── conversation.test.json  # Test conversations
│   │   └── test_config.json        # Eval configuration
│   └── test_eval.py                # Evaluation tests
│
├── 📂 tests/                       # Unit tests
│   └── test_agents.py              # Agent tests
│
├── 📂 frontend/                    # Frontend (React)
│   ├── public/                     # Static assets
│   ├── src/
│   │   ├── api/                    # API integration
│   │   ├── components/             # React components
│   │   ├── contexts/               # State management
│   │   ├── pages/                  # Page components
│   │   ├── types/                  # TypeScript types
│   │   ├── utils/                  # Utilities
│   │   ├── App.tsx                 # Main app
│   │   ├── main.tsx                # Entry point
│   │   └── index.css               # Global styles
│   ├── .env                        # Environment variables
│   ├── package.json                # Dependencies
│   ├── tsconfig.json               # TypeScript config
│   ├── tailwind.config.js          # Tailwind config
│   └── vite.config.ts              # Vite config
│
├── 📂 docs/                        # Documentation
│   ├── RESTRUCTURING_PLAN_ADK.md   # Backend restructuring guide
│   ├── QUICK_REFERENCE_ADK.md      # ADK patterns reference
│   ├── IMPLEMENTATION_CHECKLIST_ADK.md  # Implementation timeline
│   ├── FRONTEND_INTEGRATION_GUIDE.md    # Complete frontend guide
│   └── QUICKSTART.md               # Frontend quick start
│
├── .env.example                    # Environment template
├── .gitignore                      # Git ignore rules
├── pyproject.toml                  # Python project config
├── README.md                       # This file
└── LICENSE                         # Apache 2.0 License
```

---

### API Documentation

#### Backend Endpoints

```
POST   /sessions
  Create new agent session
  Body: { user_id: string, app_name: string }
  Returns: { id, user_id, agent_id, created_at }

POST   /agents/financial_agent/stream_query
  Send message to agent (SSE streaming)
  Body: { session_id: string, message: string }
  Returns: SSE stream

GET    /sessions/:id/history
  Get session message history
  Returns: [{ id, role, content, timestamp }]

DELETE /sessions/:id
  Delete session
  Returns: 204 No Content

GET    /agents
  List available agents
  Returns: [{ id, name, description, tags }]
```

#### Frontend API Client

```typescript
// Create session
const session = await createSession(userId, agentId);

// Send message (returns SSE stream)
const stream = await sendMessage(sessionId, message);

// Parse streaming response
for await (const chunk of parseSSEStream(stream)) {
  console.log(chunk.content.parts[0].text);
}

// Get history
const history = await getSessionHistory(sessionId);

// Delete session
await deleteSession(sessionId);
```

---

## Troubleshooting

### Backend Issues

#### "ModuleNotFoundError: No module named 'financial_agent'"

```bash
# Solution 1: Set PYTHONPATH
export PYTHONPATH="${PYTHONPATH}:$(pwd)"

# Solution 2: Use uv run
uv run python -c "import financial_agent"

# Solution 3: Reinstall
uv sync --all-extras
```

#### "DefaultCredentialsError: Your default credentials were not found"

```bash
# Solution: Authenticate with gcloud
gcloud auth application-default login
gcloud config set project YOUR_PROJECT_ID
```

#### "Import 'absl' could not be resolved"

```bash
# Solution: Install deployment dependencies
uv sync --with deployment
```

#### Agent runs locally but won't deploy

```bash
# Check project ID is set
gcloud config get-value project

# Check staging bucket exists
gsutil ls gs://your-staging-bucket/

# Check APIs are enabled
gcloud services list --enabled | grep aiplatform
```

### Frontend Issues

#### "Cannot find module './components/Header'"

```bash
# Solution: Copy missing files
cp /mnt/user-data/outputs/frontend-files/Header.tsx src/components/
```

#### "Property 'env' does not exist on type 'ImportMeta'"

```bash
# Solution: Create vite-env.d.ts
cp /mnt/user-data/outputs/frontend-files/vite-env.d.ts src/
```

#### "Unknown at rule @tailwind"

```bash
# Solution: Update VS Code settings
mkdir -p .vscode
cp /mnt/user-data/outputs/frontend-files/.vscode-settings.json .vscode/settings.json

# Then reload: Cmd+Shift+P → "Developer: Reload Window"
```

#### "npm install" fails

```bash
# Solution: Clean install
rm -rf node_modules package-lock.json
npm install

# Or try yarn
npm install -g yarn
yarn install
```

### Common Issues

#### Port already in use

```bash
# Backend (port 8080)
lsof -ti:8080 | xargs kill -9

# Frontend (port 5173)
lsof -ti:5173 | xargs kill -9
```

#### CORS errors

```bash
# Backend needs to allow frontend origin
# Update your backend CORS configuration to include:
# http://localhost:5173 (development)
# https://yourdomain.com (production)
```

#### Rate limiting / quota errors

```bash
# Check your GCP quotas
gcloud services quota list --service=aiplatform.googleapis.com

# Request quota increase if needed
```

---

## Contributing

We welcome contributions! Here's how to get started:

### Development Process

1. **Fork the repository**
2. **Create a feature branch**
   ```bash
   git checkout -b feature/amazing-feature
   ```
3. **Make your changes**
4. **Test thoroughly**
   ```bash
   # Backend tests
   uv run pytest tests/
   
   # Frontend type checking
   cd frontend && npm run type-check
   ```
5. **Commit with clear messages**
   ```bash
   git commit -m "Add amazing feature"
   ```
6. **Push to your fork**
   ```bash
   git push origin feature/amazing-feature
   ```
7. **Open a Pull Request**

### Code Standards

**Backend:**
- Follow PEP 8 style guide
- Include type hints
- Write docstrings for all functions
- Add tests for new features
- Update documentation

**Frontend:**
- Use TypeScript strict mode
- Follow React best practices
- Use functional components
- Write meaningful commit messages
- Keep components focused and small
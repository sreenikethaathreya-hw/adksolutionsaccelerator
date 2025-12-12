# HatchWorks AI - Multi-Agent Financial Platform Template

> **A production-ready template for building AI agent applications with Google ADK and React**

[![Platform](https://img.shields.io/badge/Platform-Google%20ADK-4285F4?style=flat-square)](https://cloud.google.com/products/agent-developer-kit)
[![Frontend](https://img.shields.io/badge/Frontend-React%2018-61DAFB?style=flat-square)](https://react.dev)
[![Backend](https://img.shields.io/badge/Backend-Python%203.12-3776AB?style=flat-square)](https://python.org)
[![Deployment](https://img.shields.io/badge/Deployment-Cloud%20Run-4285F4?style=flat-square)](https://cloud.google.com/run)
[![License](https://img.shields.io/badge/License-Apache%202.0-green?style=flat-square)](LICENSE)

---

##  What Is This Template?

This is a **complete, production-ready template** for building AI agent applications using:

- **Backend**: Google Agent Development Kit (ADK) with multi-agent architecture
- **Frontend**: Modern React 18 + TypeScript + Tailwind CSS
- **Deployment**: Containerized deployment to Google Cloud Run
- **Real-time**: Server-Sent Events (SSE) streaming for instant AI responses
- **Multimodal**: Support for PDF, Excel, images with Gemini 2.0

**Use this template to build your own AI agent applications** by customizing the agents, tools, and UI to fit your specific use case.

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    React Frontend                            │
│               (Cloud Run Container)                          │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  • Real-time chat interface with SSE streaming         │ │
│  │  • Agent catalog & selection                           │ │
│  │  • File upload (PDF, Excel, Images)                    │ │
│  │  • User authentication & session management            │ │
│  │  • Service integrations (Google, Salesforce, etc.)     │ │
│  └────────────────────────────────────────────────────────┘ │
└───────────────────────────┬───────────────────────────────────┘
                            │ HTTPS/SSE
                            │ (CORS configured)
┌───────────────────────────▼───────────────────────────────────┐
│                   FastAPI Backend                             │
│               (Cloud Run Container)                           │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  Multi-Agent System (Google ADK)                       │ │
│  │  ├── Root Coordinator Agent                            │ │
│  │  ├── Financial Analysis Agent                          │ │
│  │  ├── Market Research Agent                             │ │
│  │  ├── AI Opportunity Agent                              │ │
│  │  └── KPI Development Agent                             │ │
│  │                                                          │ │
│  │  Infrastructure:                                        │ │
│  │  • SSE streaming endpoints                             │ │
│  │  • Session management                                   │ │
│  │  • File upload & processing (multimodal)              │ │
│  │  • Tool execution engine                               │ │
│  └────────────────────────────────────────────────────────┘ │
└───────────────────────────┬───────────────────────────────────┘
                            │
                ┌───────────┴──────────┐
                │                      │
         ┌──────▼──────┐        ┌─────▼─────┐
         │  Vertex AI  │        │  Secret   │
         │   (Gemini)  │        │  Manager  │
         └─────────────┘        └───────────┘
```

**Key Features:**
- **Multi-agent coordination**: Root agent routes queries to specialized sub-agents
- **Streaming responses**: Real-time SSE for better UX
- **Multimodal input**: Process PDFs, Excel, images with Gemini 2.0
- **Production deployment**: Separate frontend/backend containers on Cloud Run
- **Secure**: Google Secret Manager, IAM, CORS protection

---

## What You Can Reuse

### ✅ Ready-to-Use Components

#### **Backend (Python/ADK)**
- ✅ **Multi-agent architecture pattern** - Coordinator + specialized agents
- ✅ **FastAPI server setup** with CORS, SSE streaming, health checks
- ✅ **Session management system** - In-memory or database-backed
- ✅ **File upload handler** - Multimodal support (PDF, Excel, images)
- ✅ **Tool framework** - Easy to add custom tools
- ✅ **Deployment scripts** - Agent Engine deployment automation
- ✅ **Evaluation framework** - Test conversations and metrics
- ✅ **Dockerfile** - Production-ready containerization

#### **Frontend (React/TypeScript)**
- ✅ **Chat interface** with SSE streaming
- ✅ **Agent catalog** with search and filters
- ✅ **File upload component** with drag-and-drop
- ✅ **Authentication flow** (mock + real implementation)
- ✅ **Settings page** with service integrations
- ✅ **API client** with retry logic and error handling
- ✅ **Tailwind design system** matching HatchWorks brand
- ✅ **Dockerfile** with nginx for static serving

#### **Infrastructure**
- ✅ **Cloud Run deployment** - Both frontend and backend
- ✅ **Environment management** - `.env` templates
- ✅ **CI/CD patterns** - Build and deploy automation
- ✅ **Monitoring setup** - Health checks and logging

### 🎨 Customization Points

You'll want to customize:
- **Agent definitions** - Replace financial agents with your domain
- **Tools** - Add your own tools and integrations
- **UI branding** - Update colors, logos, copy
- **Authentication** - Implement your auth provider
- **Data storage** - Add database for persistence

---

## Prerequisites

### Required Software

```bash
# Python 3.12
python --version  # Should be 3.12.x

# Node.js 18+
node --version    # Should be 18.x or higher

# uv (Python package manager)
curl -LsSf https://astral.sh/uv/install.sh | sh

# Google Cloud CLI (for deployment)
gcloud --version
```

### Required Accounts

- **Google Cloud Platform** account
  - Project with billing enabled
  - Vertex AI API enabled
  - Cloud Run API enabled
  - [Sign up for free trial](https://cloud.google.com/free) ($300 credits)

### Recommended Tools

- **Docker Desktop** - For local containerization
- **VS Code** - With Python, ESLint, Tailwind extensions
- **Git** - For version control

---

## Quick Start

### Step 1: Clone and Setup

```bash
# Clone the repository
git clone <your-repo-url>
cd <your-repo-name>

# Install backend dependencies
uv sync --all-extras

# Setup backend environment
cp .env_template .env
nano .env  # Edit with your values

# Install frontend dependencies
cd frontend
npm install
cp .env.example .env
nano .env  # Edit with your values
cd ..
```

### Step 2: Configure Google Cloud

```bash
# Authenticate with Google Cloud
gcloud auth login
gcloud auth application-default login

# Create new project (or use existing)
gcloud projects create your-project-id --name="Your Project Name"
gcloud config set project your-project-id

# Enable required APIs
gcloud services enable \
  aiplatform.googleapis.com \
  run.googleapis.com \
  secretmanager.googleapis.com \
  cloudbuild.googleapis.com

# Create staging bucket for Agent Engine
gsutil mb gs://your-project-id-staging
```

### Step 3: Update Configuration Files

**Backend `.env`:**
```bash
GOOGLE_CLOUD_PROJECT=your-project-id
GOOGLE_CLOUD_LOCATION=us-central1
GOOGLE_GENAI_USE_VERTEXAI=True
STAGING_BUCKET=your-project-id-staging
```

**Frontend `.env`:**
```bash
VITE_API_URL=http://localhost:8080
VITE_APP_NAME=YourAppName
```

### Step 4: Run Locally

**Terminal 1 - Backend:**
```bash
# Run with FastAPI
uvicorn server:app --reload --port 8080

# Or use ADK CLI for testing
uv run adk run financial_agent
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

**Open browser:** http://localhost:5173

---

## Customizing for Your Use Case

### 1. Replace Financial Agents with Your Domain

**Example: Building a Customer Support Agent System**

#### A. Update Agent Definitions

**`financial_agent/agent.py` → `your_agent/agent.py`:**

```python
from google.adk.agents import LlmAgent
from google.adk.tools.agent_tool import AgentTool
from . import prompts
from .tools import support_tools, knowledge_tools, escalation_tools

MODEL = "gemini-2.0-flash-001"

# Specialized agent for handling common questions
faq_agent = LlmAgent(
    name="faq_agent",
    model=MODEL,
    description="Answers frequently asked questions",
    instruction=prompts.FAQ_AGENT_PROMPT,
    output_key="faq_response",
    tools=[
        knowledge_tools.search_knowledge_base,
        knowledge_tools.get_article,
    ],
)

# Specialized agent for troubleshooting
troubleshoot_agent = LlmAgent(
    name="troubleshoot_agent",
    model=MODEL,
    description="Helps diagnose and resolve technical issues",
    instruction=prompts.TROUBLESHOOT_AGENT_PROMPT,
    output_key="troubleshoot_response",
    tools=[
        support_tools.run_diagnostic,
        support_tools.suggest_solution,
    ],
)

# Specialized agent for escalations
escalation_agent = LlmAgent(
    name="escalation_agent",
    model=MODEL,
    description="Handles complex cases requiring human support",
    instruction=prompts.ESCALATION_AGENT_PROMPT,
    output_key="escalation_response",
    tools=[
        escalation_tools.create_ticket,
        escalation_tools.notify_support_team,
    ],
)

# Root coordinator
root_agent = LlmAgent(
    name="support_coordinator",
    model=MODEL,
    description="Customer support coordinator routing to specialized agents",
    instruction=prompts.COORDINATOR_PROMPT,
    output_key="response",
    tools=[
        AgentTool(agent=faq_agent),
        AgentTool(agent=troubleshoot_agent),
        AgentTool(agent=escalation_agent),
    ],
)
```

#### B. Create Custom Tools

**`your_agent/tools/support_tools.py`:**

```python
from typing import Dict, Any
from google.adk.tools import ToolContext
import logging

logger = logging.getLogger(__name__)


def search_knowledge_base(
    query: str,
    category: str = "all",
    tool_context: ToolContext = None
) -> Dict[str, Any]:
    """
    Search the knowledge base for relevant articles.
    
    Args:
        query: Search query
        category: Article category to filter by
        tool_context: ADK tool context
    
    Returns:
        Matching articles with relevance scores
    """
    logger.info(f"Searching knowledge base: {query} in {category}")
    
    # TODO: Implement your knowledge base search
    # Example: Query your documentation database, search API, etc.
    
    return {
        "query": query,
        "results": [
            {
                "title": "How to reset your password",
                "url": "https://help.example.com/reset-password",
                "relevance": 0.95,
                "excerpt": "Follow these steps to reset your password..."
            }
        ],
        "total_results": 1
    }


def create_ticket(
    issue_description: str,
    priority: str = "normal",
    category: str = "general",
    tool_context: ToolContext = None
) -> Dict[str, Any]:
    """
    Create a support ticket for escalation.
    
    Args:
        issue_description: Description of the issue
        priority: Ticket priority (low, normal, high, urgent)
        category: Issue category
        tool_context: ADK tool context
    
    Returns:
        Created ticket information
    """
    user_id = tool_context.user_id if tool_context else "unknown"
    logger.info(f"Creating ticket for user {user_id}")
    
    # TODO: Integrate with your ticketing system
    # Example: Zendesk, Jira, ServiceNow, etc.
    
    ticket_id = f"TKT-{user_id[:8]}-001"
    
    return {
        "ticket_id": ticket_id,
        "status": "open",
        "priority": priority,
        "created_by": user_id,
        "description": issue_description,
        "url": f"https://support.example.com/tickets/{ticket_id}"
    }
```

#### C. Update Prompts

**`your_agent/prompts.py`:**

```python
COORDINATOR_PROMPT = """
You are a Customer Support Coordinator. Your role is to:
1. Understand customer inquiries
2. Route to the appropriate specialized agent
3. Ensure customer satisfaction

Available agents:
- faq_agent: For common questions and how-to guides
- troubleshoot_agent: For technical issues and debugging
- escalation_agent: For complex cases requiring human support

Always be empathetic, clear, and solution-focused.
"""

FAQ_AGENT_PROMPT = """
You are a Knowledge Base Expert. Your expertise includes:
- Answering common questions
- Providing step-by-step guides
- Linking to relevant documentation

When answering:
1. Search the knowledge base first
2. Provide clear, concise answers
3. Include links to detailed articles
4. Ask clarifying questions if needed

Use the search_knowledge_base tool to find relevant information.
"""

# ... more prompts
```

### 2. Customize the Frontend

#### A. Update Branding

**`frontend/tailwind.config.js`:**

```javascript
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#YOUR_PRIMARY_COLOR',
          50: '#...',
          // ... your color palette
          900: '#...',
        },
      },
      fontFamily: {
        sans: ['Your Font', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
```

#### B. Update Agent Cards

**`frontend/src/components/AgentCard.tsx`:**

```typescript
// Update the agent data to match your agents
const getAgentIcon = (agentId: string) => {
  const icons: Record<string, string> = {
    'faq_agent': '📚',
    'troubleshoot_agent': '🔧',
    'escalation_agent': '🚨',
  };
  return icons[agentId] || '🤖';
};
```

#### C. Customize Chat Interface

**`frontend/src/components/ChatInterface.tsx`:**

```typescript
// Update placeholder text
placeholder="Ask about your product or service..."

// Update empty state
<p className="text-lg font-medium">How can we help you today?</p>
<p className="text-sm mt-2">Ask questions, report issues, or get help</p>
```

### 3. Add Your Own Tools

Follow this pattern to add tools for your use case:

```python
# your_agent/tools/your_tools.py

from typing import Dict, Any, List
from google.adk.tools import ToolContext
import logging

logger = logging.getLogger(__name__)


def your_custom_tool(
    param1: str,
    param2: int,
    optional_param: str = "default",
    tool_context: ToolContext = None
) -> Dict[str, Any]:
    """
    Brief description of what this tool does.
    
    Args:
        param1: Description of parameter 1
        param2: Description of parameter 2
        optional_param: Optional parameter with default
        tool_context: ADK tool context (always include this)
    
    Returns:
        Dictionary with results
    """
    # Get user context if needed
    user_id = tool_context.user_id if tool_context else None
    session_id = tool_context.session_id if tool_context else None
    
    logger.info(f"Executing your_custom_tool for user {user_id}")
    
    try:
        # Your implementation here
        result = perform_your_logic(param1, param2)
        
        return {
            "status": "success",
            "data": result,
            "user_id": user_id
        }
    
    except ValueError as e:
        logger.error(f"Validation error in your_custom_tool: {e}")
        return {
            "status": "error",
            "message": str(e)
        }
    
    except Exception as e:
        logger.error(f"Unexpected error in your_custom_tool: {e}")
        return {
            "status": "error",
            "message": "An unexpected error occurred"
        }


def perform_your_logic(param1: str, param2: int) -> Dict[str, Any]:
    """Your actual business logic."""
    # Implementation details
    return {"result": "data"}
```

**Register the tool:**

```python
# In your_agent/agent.py
from .tools.your_tools import your_custom_tool

your_agent = LlmAgent(
    name="your_agent",
    # ... other config
    tools=[
        your_custom_tool,
        # ... other tools
    ],
)
```

---

## Deployment Guide

### Architecture: Separate Frontend & Backend Containers

This template deploys as **two separate Cloud Run services**:

1. **Backend Service**: FastAPI + ADK agents
2. **Frontend Service**: React app served by nginx

### Step 1: Prepare for Deployment

```bash
# Ensure you're authenticated
gcloud auth login
gcloud config set project your-project-id

# Create artifact registry repository
gcloud artifacts repositories create your-app-repo \
  --repository-format=docker \
  --location=us-central1 \
  --description="Your App Docker Repository"

# Configure docker to use gcloud credentials
gcloud auth configure-docker us-central1-docker.pkg.dev
```

### Step 2: Build and Push Backend

```bash
# Build backend image
docker build -t us-central1-docker.pkg.dev/your-project-id/your-app-repo/backend:latest -f Dockerfile .

# Push to Artifact Registry
docker push us-central1-docker.pkg.dev/your-project-id/your-app-repo/backend:latest

# Deploy to Cloud Run
gcloud run deploy your-app-backend \
  --image us-central1-docker.pkg.dev/your-project-id/your-app-repo/backend:latest \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --set-env-vars "GOOGLE_CLOUD_PROJECT=your-project-id,GOOGLE_CLOUD_LOCATION=us-central1,GOOGLE_GENAI_USE_VERTEXAI=True" \
  --memory 2Gi \
  --cpu 2 \
  --timeout 300 \
  --max-instances 10

# Get the backend URL
BACKEND_URL=$(gcloud run services describe your-app-backend \
  --region us-central1 \
  --format 'value(status.url)')
echo "Backend URL: $BACKEND_URL"
```

### Step 3: Build and Push Frontend

```bash
cd frontend

# Update .env.production with backend URL
echo "VITE_API_URL=$BACKEND_URL" > .env.production

# Build frontend image
docker build -t us-central1-docker.pkg.dev/your-project-id/your-app-repo/frontend:latest .

# Push to Artifact Registry
docker push us-central1-docker.pkg.dev/your-project-id/your-app-repo/frontend:latest

# Deploy to Cloud Run
gcloud run deploy your-app-frontend \
  --image us-central1-docker.pkg.dev/your-project-id/your-app-repo/frontend:latest \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --memory 512Mi \
  --cpu 1 \
  --timeout 60

# Get the frontend URL
FRONTEND_URL=$(gcloud run services describe your-app-frontend \
  --region us-central1 \
  --format 'value(status.url)')
echo "Frontend URL: $FRONTEND_URL"
```

### Step 4: Update CORS Configuration

Update your backend CORS to allow the frontend URL:

**`server.py`:**

```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",  # Local development
        "https://your-frontend-url.run.app",  # Production frontend
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

Redeploy the backend:

```bash
docker build -t us-central1-docker.pkg.dev/your-project-id/your-app-repo/backend:latest -f Dockerfile .
docker push us-central1-docker.pkg.dev/your-project-id/your-app-repo/backend:latest
gcloud run deploy your-app-backend \
  --image us-central1-docker.pkg.dev/your-project-id/your-app-repo/backend:latest \
  --region us-central1
```

### Step 5: Configure Custom Domain (Optional)

```bash
# Map custom domain to frontend
gcloud run domain-mappings create \
  --service your-app-frontend \
  --domain your-domain.com \
  --region us-central1

# Map API subdomain to backend
gcloud run domain-mappings create \
  --service your-app-backend \
  --domain api.your-domain.com \
  --region us-central1
```

### Deployment Checklist

- [ ] Backend deployed and accessible
- [ ] Frontend deployed and accessible
- [ ] CORS configured correctly
- [ ] Environment variables set
- [ ] Health checks passing
- [ ] Custom domains configured (if applicable)
- [ ] SSL certificates provisioned
- [ ] Monitoring and logging enabled
- [ ] Cost alerts configured

---

## Project Structure

```
your-project/
│
├── 📂 your_agent/                  # Backend agent package (rename from financial_agent)
│   ├── __init__.py                # Package setup & GCP configuration
│   ├── agent.py                   # Agent definitions (customize for your use case)
│   ├── prompts.py                 # Agent instructions (update prompts)
│   ├── config.py                  # Configuration settings
│   └── tools/                     # Tool implementations (add your tools)
│       ├── __init__.py
│       ├── your_tool1.py          # Your custom tool 1
│       ├── your_tool2.py          # Your custom tool 2
│       └── your_tool3.py          # Your custom tool 3
│
├── 📂 deployment/                 # Deployment automation (reusable)
│   ├── deploy.py                  # Deploy to Agent Engine
│   └── test_deployment.py         # Test deployed agent
│
├── 📂 eval/                       # Evaluation framework (reusable)
│   ├── data/
│   │   ├── conversation.test.json # Test conversations (update for your domain)
│   │   └── test_config.json
│   └── test_eval.py
│
├── 📂 tests/                      # Unit tests (update for your agents)
│   └── test_agents.py
│
├── 📂 frontend/                   # React frontend (customize UI)
│   ├── public/
│   │   └── images/                # Your logos and assets
│   ├── src/
│   │   ├── api/                   # API integration (reusable)
│   │   │   ├── client.ts
│   │   │   ├── agents.ts
│   │   │   └── auth.ts
│   │   ├── components/            # React components (customize)
│   │   │   ├── ChatInterface.tsx
│   │   │   ├── AgentCard.tsx
│   │   │   └── Header.tsx
│   │   ├── contexts/              # State management (reusable)
│   │   │   ├── AuthContext.tsx
│   │   │   └── SessionContext.tsx
│   │   ├── pages/                 # Page components (customize)
│   │   │   ├── HomePage.tsx
│   │   │   ├── AgentCatalogPage.tsx
│   │   │   ├── ChatPage.tsx
│   │   │   └── SettingsPage.tsx
│   │   ├── types/                 # TypeScript types (extend)
│   │   ├── utils/                 # Utilities (reusable)
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── Dockerfile                 # Frontend containerization (reusable)
│   ├── nginx.conf                 # Nginx configuration (reusable)
│   ├── package.json
│   └── tailwind.config.js         # Update with your brand colors
│
├── 📂 docs/                       # Documentation
│   └── FRONTEND_INTEGRATION_GUIDE.md
│
├── server.py                      # FastAPI server (customize endpoints)
├── Dockerfile                     # Backend containerization (reusable)
├── pyproject.toml                 # Python dependencies (update)
├── .env.example                   # Environment template
├── .gitignore
├── README.md
└── LICENSE
```

### What to Rename/Update

1. **`financial_agent/`** → **`your_agent/`**
2. **Agent names** in `agent.py`
3. **Tool files** in `tools/`
4. **Prompts** in `prompts.py`
5. **Frontend branding** (colors, logos, text)
6. **Environment variables** in `.env` files

---

## Key Components Explained

### Backend Architecture

#### 1. **Multi-Agent System** (`your_agent/agent.py`)

```python
# Pattern: Coordinator + Specialized Agents
root_agent = LlmAgent(
    name="coordinator",
    model="gemini-2.0-flash-001",
    description="Routes queries to specialized agents",
    instruction=prompts.COORDINATOR_PROMPT,
    output_key="response",
    tools=[
        AgentTool(agent=agent1),  # Specialized agent 1
        AgentTool(agent=agent2),  # Specialized agent 2
        AgentTool(agent=agent3),  # Specialized agent 3
    ],
)
```

**Why this pattern?**
- **Separation of concerns**: Each agent has a specific expertise
- **Scalability**: Easy to add new agents without modifying existing ones
- **Testing**: Test each agent independently
- **Maintainability**: Clear boundaries and responsibilities

#### 2. **FastAPI Server** (`server.py`)

Key endpoints:
- `POST /sessions` - Create new chat session
- `POST /agents/{agent_id}/stream_query` - Send message (SSE streaming)
- `POST /upload` - Upload files (multimodal support)
- `GET /health` - Health check for Cloud Run
- `GET /agents` - List available agents

**SSE Streaming Pattern:**

```python
@app.post("/agents/{agent_id}/stream_query")
async def stream_query(request: MessageRequest):
    async def generate():
        async for event in runner.run_async(...):
            if event.content and event.content.parts:
                yield f"data: {json.dumps(data)}\n\n"
        yield f"data: [DONE]\n\n"
    
    return StreamingResponse(generate(), media_type="text/event-stream")
```

#### 3. **Tool Framework**

Every tool follows this pattern:

```python
def tool_name(
    param1: Type1,
    param2: Type2,
    tool_context: ToolContext = None  # Always include!
) -> Dict[str, Any]:
    """Docstring with Args and Returns"""
    
    # Access user/session context
    user_id = tool_context.user_id if tool_context else None
    
    # Business logic
    result = do_something(param1, param2)
    
    # Return structured response
    return {"status": "success", "data": result}
```

### Frontend Architecture

#### 1. **Context Providers** (State Management)

```typescript
// AuthContext: User authentication state
<AuthProvider>
  // SessionContext: Agent session state
  <SessionProvider>
    <App />
  </SessionProvider>
</AuthProvider>
```

#### 2. **Chat Interface** with SSE

```typescript
// Stream messages from backend
const stream = await sendMessage(sessionId, message);

for await (const chunk of parseSSEStream(stream)) {
  // Update UI in real-time
  updateMessage(chunk.content.parts[0].text);
}
```

#### 3. **File Upload** (Multimodal)

```typescript
// Upload file → Get base64 data → Send with message
const fileData = await uploadFile(file);

await sendMessageWithFile({
  session_id,
  message: "Analyze this file",
  file_data: fileData.base64_data,
  file_mime_type: fileData.mime_type
});
```

---

## Troubleshooting

### Backend Issues

#### "Cannot find module 'financial_agent'"

```bash
# Option 1: Use uv run
uv run python -c "import financial_agent"

# Option 2: Set PYTHONPATH
export PYTHONPATH="${PYTHONPATH}:$(pwd)"

# Option 3: Reinstall
uv sync --all-extras
```

#### "DefaultCredentialsError"

```bash
# Authenticate
gcloud auth application-default login
gcloud config set project your-project-id

# Verify
gcloud auth application-default print-access-token
```

#### "CORS policy error"

Update `server.py` CORS origins:

```python
allow_origins=[
    "http://localhost:5173",
    "https://your-frontend-url.run.app",
]
```

#### Cloud Run deployment fails

```bash
# Check logs
gcloud run services logs read your-app-backend --region us-central1

# Common issues:
# - Missing environment variables
# - Insufficient memory (increase to 2Gi)
# - Timeout too short (increase to 300s)
# - Missing API permissions
```

### Frontend Issues

#### Build fails

```bash
# Clear cache and reinstall
cd frontend
rm -rf node_modules package-lock.json dist
npm install
npm run build
```

#### API connection fails

```bash
# Check environment variable
echo $VITE_API_URL

# Verify backend is running
curl https://your-backend-url.run.app/health

# Check browser console for CORS errors
```

#### Docker build fails

```bash
# Build with no cache
docker build --no-cache -t frontend:latest .

# Check Dockerfile syntax
docker build --progress=plain -t frontend:latest .
```

## Additional Resources

### Documentation

- **Google ADK**: https://cloud.google.com/products/agent-developer-kit
- **Vertex AI**: https://cloud.google.com/vertex-ai/docs
- **Cloud Run**: https://cloud.google.com/run/docs
- **React**: https://react.dev
- **FastAPI**: https://fastapi.tiangolo.com
- **Tailwind CSS**: https://tailwindcss.com

### Example Use Cases

This template can be adapted for:

- **Customer Support Chatbots**
- **Technical Documentation Q&A**
- **Research Assistants**
- **Code Review Agents**
- **Content Generation Tools**
- **Data Analysis Platforms**
- **Educational Tutoring Systems**
- **Healthcare Information Systems**
- **Legal Document Analysis**
- **HR & Recruiting Tools**

### Getting Help

- **Google ADK Samples**: https://github.com/google/adk-samples
- **Stack Overflow**: Tag your questions with `google-adk` and `cloud-run`
- **GitHub Issues**: Open issues in this repository

---

## Contributing

We welcome contributions to improve this template!

### How to Contribute

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Test thoroughly (backend and frontend)
5. Commit with clear messages (`git commit -m "Add amazing feature"`)
6. Push to your fork (`git push origin feature/amazing-feature`)
7. Open a Pull Request

### What to Contribute

- **Bug fixes** - Help improve stability
- **New reusable components** - Make the template more useful
- **Documentation improvements** - Help others understand
- **Example agents** - Show different use cases
- **Performance optimizations** - Make it faster
- **Test coverage** - Improve reliability

---

## License

This project is licensed under the Apache License 2.0 - see the [LICENSE](LICENSE) file for details.

---

## Acknowledgments

- **Google Cloud** for the Agent Development Kit
- **Anthropic** for Claude AI assistance in development
- **HatchWorks** for the original use case and design

---

## Quick Reference Card

### Essential Commands

```bash
# Development
uv run adk run your_agent          # Test agent locally
cd frontend && npm run dev          # Run frontend
uvicorn server:app --reload        # Run backend API

# Deployment
docker build -t backend:latest .   # Build backend
docker build -t frontend:latest frontend/  # Build frontend
gcloud run deploy                  # Deploy to Cloud Run

# Testing
uv run pytest tests/               # Run backend tests
cd frontend && npm run type-check  # Check TypeScript
uv run pytest eval/                # Run evaluations

# Utilities
gcloud auth login                  # Authenticate
gcloud config set project ID       # Set project
gcloud run services list           # List deployments
```

### Key Files to Customize

1. **`your_agent/agent.py`** - Define your agents
2. **`your_agent/prompts.py`** - Write agent instructions
3. **`your_agent/tools/`** - Add your tools
4. **`server.py`** - Customize API endpoints
5. **`frontend/src/components/`** - Update UI components
6. **`frontend/tailwind.config.js`** - Update branding

---

**Ready to build your AI agent application? Start customizing this template now!** 🚀
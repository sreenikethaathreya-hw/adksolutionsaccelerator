# Financial Agent - ADK Quick Reference
## Standard Google ADK Patterns and Best Practices

---

## Directory Structure Pattern

### Standard ADK Layout
```
financial-agent/                    # Root (kebab-case)
├── .env.example                    # Environment template
├── .gitignore                      # Standard ignores
├── README.md                       # Standard format
├── pyproject.toml                  # Modern Python packaging
├── deployment/                     # Deployment scripts
│   ├── deploy.py
│   └── test_deployment.py
├── eval/                          # Evaluation framework
│   ├── data/
│   │   ├── conversation.test.json
│   │   └── test_config.json
│   └── test_eval.py
├── tests/                         # Unit tests
│   └── test_agents.py
└── financial_agent/               # Package (snake_case, matches project)
    ├── __init__.py                # Sets up GCP defaults
    ├── agent.py                   # Agent definitions
    ├── prompts.py                 # Instructions/prompts
    ├── config.py                  # Configuration (optional)
    ├── entities/                  # Data models (optional)
    └── tools/                     # Tool implementations
```

**Key Rules:**
- Root directory: kebab-case (e.g., `financial-agent`)
- Package name: snake_case (e.g., `financial_agent`)
- Package name MUST match project name (with underscore)
- Standard subdirectories: `deployment/`, `eval/`, `tests/`

---

## File-by-File Patterns

### `__init__.py` Pattern

**Purpose**: Set up Google Cloud defaults and package exports

**Standard Template:**
```python
# Copyright 2025 Google LLC
#
# Licensed under the Apache License, Version 2.0 (the "License")
# ...

"""Package description."""

import os
import google.auth
from dotenv import load_dotenv

load_dotenv()

# Set up Google Cloud defaults from authenticated account
_, project_id = google.auth.default()
os.environ.setdefault("GOOGLE_CLOUD_PROJECT", project_id)
os.environ["GOOGLE_CLOUD_LOCATION"] = "global"
os.environ.setdefault("GOOGLE_GENAI_USE_VERTEXAI", "True")

from . import agent

__all__ = ["agent"]
```

**Key Features:**
- Uses `google.auth.default()` to get project ID
- Sets environment defaults
- Imports agent module
- Exports via `__all__`

---

### `agent.py` Pattern

**Purpose**: Define all agents in one place

**Single Agent Pattern:**
```python
from google.adk.agents import Agent
from .tools import my_tool
from . import prompts

root_agent = Agent(
    model='gemini-2.0-flash-001',
    name='my_agent_name',
    instruction=prompts.MAIN_INSTRUCTION,
    tools=[my_tool],
)
```

**Multi-Agent Pattern:**
```python
from google.adk.agents import LlmAgent
from google.adk.tools.agent_tool import AgentTool
from . import prompts
from .tools import tool1, tool2, tool3

# Sub-agent 1
sub_agent1 = LlmAgent(
    name="sub_agent1",
    model="gemini-2.0-flash-001",
    description="What this agent does",
    instruction=prompts.SUB_AGENT1_PROMPT,
    output_key="output_key1",
    tools=[tool1, tool2],
)

# Sub-agent 2
sub_agent2 = LlmAgent(
    name="sub_agent2",
    model="gemini-2.0-flash-001",
    description="What this agent does",
    instruction=prompts.SUB_AGENT2_PROMPT,
    output_key="output_key2",
    tools=[tool3],
)

# Root coordinator
root_agent = LlmAgent(
    name="coordinator",
    model="gemini-2.0-flash-001",
    description="Routes to specialized agents",
    instruction=prompts.COORDINATOR_PROMPT,
    output_key="response",
    tools=[
        AgentTool(agent=sub_agent1),
        AgentTool(agent=sub_agent2),
    ],
)
```

**Key Conventions:**
- Import from `.prompts` (relative import)
- Always define `root_agent` (entry point)
- Use `LlmAgent` for routing/complex agents
- Use `Agent` for simple agents
- Set `output_key` for sub-agents

---

### `prompts.py` Pattern

**Purpose**: Store all instructions/prompts separate from code

**Standard Structure:**
```python
# Copyright 2025 Google LLC
# ...

"""Prompts for [Agent Name]."""

COORDINATOR_PROMPT = """
You are a [role description].
Your responsibilities include:
1. [Responsibility 1]
2. [Responsibility 2]

When [condition], you should [action].

Available tools:
- tool1: [description]
- tool2: [description]
"""

SUB_AGENT_PROMPT = """
You are a [specialized role].
Your expertise includes:
- [Area 1]
- [Area 2]

When [task], follow these steps:
1. [Step 1]
2. [Step 2]

Use the available tools to [purpose].
"""
```

**Key Conventions:**
- ALL_CAPS variable names
- Clear role definition
- Explicit tool documentation in prompts
- Step-by-step instructions

---

### Tools Pattern

**Purpose**: Implement tools that agents can use

**Standard Tool Function:**
```python
from typing import Dict, Any
from google.adk.tools import ToolContext
import logging

logger = logging.getLogger(__name__)


def my_tool(
    param1: str,
    param2: int,
    tool_context: ToolContext = None
) -> Dict[str, Any]:
    """
    Brief description of what the tool does.
    
    Args:
        param1: Description of param1
        param2: Description of param2
        tool_context: ADK tool context (always include)
    
    Returns:
        Dictionary with result data
    """
    logger.info(f"Calling my_tool with {param1}, {param2}")
    
    # Access user_id from context if needed
    user_id = tool_context.user_id if tool_context else None
    session_id = tool_context.session_id if tool_context else None
    
    # Tool implementation
    result = {
        "status": "success",
        "data": "result_data"
    }
    
    return result
```

**Key Conventions:**
- Always include `tool_context: ToolContext = None`
- Use type hints
- Return `Dict[str, Any]`
- Use logging
- Clear docstrings with Args/Returns

---

### `pyproject.toml` Pattern

**Standard Format:**
```toml
[project]
name = "my-agent"
version = "0.1.0"
description = "Brief description"
authors = [{name = "Your Name", email = "email@example.com"}]
license = {text = "Apache-2.0"}
readme = "README.md"
requires-python = ">=3.10,<3.13"
dependencies = [
    "google-cloud-aiplatform[adk,agent-engines]>=1.93.0",
    "google-adk>=1.0.0",
    "pydantic>=2.10.6",
    "python-dotenv>=1.0.1",
]

[dependency-groups]
dev = [
    "pytest>=8.3.5",
    "pytest-asyncio>=0.26.0",
    "agent-starter-pack>=0.14.1",
]

deployment = [
    "absl-py>=2.2.1",
]

[tool.pytest.ini_options]
pythonpath = "."
asyncio_default_fixture_loop_scope = "function"

[build-system]
requires = ["uv_build>=0.8.14,<0.9.0"]
build-backend = "uv_build"

[tool.agent-starter-pack]
example_question = "Example user question"

[tool.agent-starter-pack.settings]
agent_directory = "my_agent"
```

**Key Requirements:**
- `[project]` table (modern format)
- `requires-python = ">=3.10,<3.13"`
- Separate `dev` and `deployment` dependency groups
- `uv_build` as build backend
- Agent Starter Pack configuration

---

### Deployment Script Pattern

**`deployment/deploy.py`:**
```python
import os
import vertexai
from absl import app, flags
from my_agent.agent import root_agent
from dotenv import load_dotenv, set_key
from vertexai import agent_engines
from vertexai.preview.reasoning_engines import AdkApp

FLAGS = flags.FLAGS
flags.DEFINE_bool("list", False, "List all agents.")
flags.DEFINE_bool("create", False, "Creates a new agent.")
flags.DEFINE_bool("delete", False, "Deletes an existing agent.")
flags.DEFINE_string("resource_id", None, "Resource ID for delete.")

ENV_FILE_PATH = os.path.abspath(
    os.path.join(os.path.dirname(__file__), "..", ".env")
)


def create() -> None:
    """Creates an agent engine."""
    adk_app = AdkApp(agent=root_agent, enable_tracing=True)
    
    remote_agent = agent_engines.create(
        adk_app,
        display_name=root_agent.name,
        requirements=[
            "google-adk>=1.0.0",
            "google-cloud-aiplatform[agent-engines]>=1.93.0",
            "python-dotenv>=1.0.1",
        ],
        extra_packages=["./my_agent"],
    )
    
    print(f"Created: {remote_agent.resource_name}")
    set_key(ENV_FILE_PATH, "AGENT_ENGINE_ID", remote_agent.resource_name)


def main(argv):
    load_dotenv()
    
    project_id = os.getenv("GOOGLE_CLOUD_PROJECT")
    location = os.getenv("GOOGLE_CLOUD_LOCATION")
    bucket = os.getenv("STAGING_BUCKET")
    
    vertexai.init(
        project=project_id,
        location=location,
        staging_bucket=f"gs://{bucket}",
    )
    
    if FLAGS.create:
        create()
    elif FLAGS.delete:
        agent_engines.delete(FLAGS.resource_id)
    elif FLAGS.list:
        for agent in agent_engines.list():
            print(f"{agent.name} - {agent.create_time}")


if __name__ == "__main__":
    app.run(main)
```

**Key Features:**
- Uses `absl` for flags
- Auto-updates `.env` with `AGENT_ENGINE_ID`
- Supports create/delete/list operations
- Uses `extra_packages` to include agent code

---

### Evaluation Pattern

**`eval/data/conversation.test.json`:**
```json
[
  {
    "query": "User question",
    "expected_tool_use": [
      {
        "tool_name": "my_tool",
        "tool_input": {
          "param1": "value1"
        }
      }
    ],
    "reference": "Expected response text"
  }
]
```

**`eval/test_eval.py`:**
```python
import pathlib
import dotenv
import pytest
from google.adk.evaluation.agent_evaluator import AgentEvaluator

pytest_plugins = ("pytest_asyncio",)


@pytest.fixture(scope="session", autouse=True)
def load_env():
    dotenv.load_dotenv()


@pytest.mark.asyncio
async def test_eval_full_conversation():
    await AgentEvaluator.evaluate(
        agent_module="my_agent",
        eval_dataset_file_path_or_dir=str(
            pathlib.Path(__file__).parent / "data/conversation.test.json"
        ),
        num_runs=1,
    )
```

---

### Testing Pattern

**`tests/test_agents.py`:**
```python
import dotenv
import pytest
from my_agent.agent import root_agent
from google.adk.runners import InMemoryRunner
from google.genai import types

pytest_plugins = ("pytest_asyncio",)


@pytest.fixture(scope="session", autouse=True)
def load_env():
    dotenv.load_dotenv()


@pytest.mark.asyncio
async def test_basic_interaction():
    user_input = "Test query"
    
    runner = InMemoryRunner(agent=root_agent, app_name="test-app")
    session = await runner.session_service.create_session(
        app_name=runner.app_name, user_id="test_user"
    )
    
    content = types.Content(parts=[types.Part(text=user_input)])
    response = ""
    
    async for event in runner.run_async(
        user_id=session.user_id,
        session_id=session.id,
        new_message=content,
    ):
        if event.content.parts and event.content.parts[0].text:
            response = event.content.parts[0].text
    
    assert len(response) > 0
```

---

## Common Patterns

### Import Patterns

```python
# Standard library
import os
import logging
from typing import Dict, Any

# Third-party
from dotenv import load_dotenv
import google.auth

# Google Cloud
from google.cloud import secretmanager, storage
from google.adk.agents import Agent, LlmAgent
from google.adk.tools import ToolContext
from google.adk.tools.agent_tool import AgentTool

# Local (relative imports)
from . import prompts
from .tools import my_tool
```

### Logging Pattern

```python
import logging

logger = logging.getLogger(__name__)

def my_function():
    logger.info("Info message")
    logger.debug("Debug message")
    logger.error("Error message")
```

### Error Handling Pattern

```python
def my_tool(param: str, tool_context: ToolContext = None) -> Dict[str, Any]:
    try:
        # Tool implementation
        result = perform_action(param)
        
        return {
            "status": "success",
            "data": result
        }
    except ValueError as e:
        logger.error(f"Validation error: {e}")
        return {
            "status": "error",
            "message": f"Invalid input: {str(e)}"
        }
    except Exception as e:
        logger.error(f"Unexpected error: {e}")
        return {
            "status": "error",
            "message": "An unexpected error occurred"
        }
```

---

## ADK CLI Commands

### Running Locally

```bash
# CLI mode
adk run my_agent

# Web UI mode
adk web
```

### Running Tests

```bash
# Install dev dependencies
uv sync --dev

# Run unit tests
uv run pytest tests

# Run evaluation
uv run pytest eval
```

### Deployment

```bash
# Install deployment dependencies
uv sync --with deployment

# Deploy to Agent Engine
python deployment/deploy.py --create

# List deployed agents
python deployment/deploy.py --list

# Delete deployed agent
python deployment/deploy.py --delete --resource_id=RESOURCE_ID

# Test deployed agent
python deployment/test_deployment.py \
  --resource_id=RESOURCE_ID \
  --user_id=test_user
```

---

## Best Practices

### 1. Package Organization

✅ **DO:**
- Use snake_case for package name
- Match package name to project name
- Keep tools in `tools/` subdirectory
- Separate prompts from code

❌ **DON'T:**
- Mix tool implementations in agent.py
- Hardcode prompts in agent definitions
- Use camelCase for package names

### 2. Agent Design

✅ **DO:**
- Define clear agent responsibilities
- Use sub-agents for specialization
- Set `output_key` for sub-agents
- Document available tools in prompts

❌ **DON'T:**
- Create agents without clear purpose
- Mix routing logic with tool logic
- Forget `output_key` on sub-agents

### 3. Tool Design

✅ **DO:**
- Include `tool_context: ToolContext = None`
- Return structured dictionaries
- Use type hints
- Log tool invocations
- Handle errors gracefully

❌ **DON'T:**
- Ignore tool_context
- Return unstructured strings
- Skip error handling
- Forget logging

### 4. Testing

✅ **DO:**
- Test each agent capability
- Use `InMemoryRunner` for tests
- Test error cases
- Run evaluation framework

❌ **DON'T:**
- Skip testing
- Only test happy path
- Forget to test tool invocation

### 5. Deployment

✅ **DO:**
- Use staging bucket
- Include all dependencies
- Test deployed agent
- Update `.env` with resource ID

❌ **DON'T:**
- Deploy without testing
- Forget dependencies
- Skip validation

---

## Troubleshooting

### Import Errors

**Problem**: `ModuleNotFoundError: No module named 'my_agent'`

**Solution**:
```bash
# Ensure PYTHONPATH is set
export PYTHONPATH="${PYTHONPATH}:$(pwd)"

# Or run with uv
uv run python -c "import my_agent"
```

### Authentication Errors

**Problem**: `google.auth.exceptions.DefaultCredentialsError`

**Solution**:
```bash
gcloud auth application-default login
gcloud config set project YOUR_PROJECT_ID
```

### Deployment Errors

**Problem**: `STAGING_BUCKET not set`

**Solution**:
```bash
# Create bucket
gsutil mb gs://your-bucket-name

# Set in .env
echo "STAGING_BUCKET=your-bucket-name" >> .env
```

---

## Quick Migration Checklist

- [ ] Create standard directory structure
- [ ] Create `financial_agent/__init__.py` with GCP defaults
- [ ] Move agent code to `financial_agent/agent.py`
- [ ] Create `financial_agent/prompts.py` for instructions
- [ ] Move tools to `financial_agent/tools/`
- [ ] Update `pyproject.toml` to modern format
- [ ] Create `deployment/deploy.py` script
- [ ] Create `deployment/test_deployment.py` script
- [ ] Create `eval/data/` with test conversations
- [ ] Create `eval/test_eval.py`
- [ ] Create `tests/test_agents.py`
- [ ] Update `README.md` to ADK format
- [ ] Create `.env.example`
- [ ] Test with `adk run`
- [ ] Deploy and validate

---

**Reference**: Based on official Google ADK samples:
- `python/agents/RAG/`
- `python/agents/academic-research/`
- `python/agents/customer-service/`
- `python/agents/order-processing/`
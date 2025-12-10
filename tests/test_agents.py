# Copyright 2025 Google LLC
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#     http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.

"""Unit tests for Financial Agent."""

import textwrap
import dotenv
import pytest
from financial_agent.agent import root_agent
from google.adk.runners import InMemoryRunner
from google.genai import types

pytest_plugins = ("pytest_asyncio",)


@pytest.fixture(scope="session", autouse=True)
def load_env():
    """Load environment variables."""
    dotenv.load_dotenv()


@pytest.mark.asyncio
async def test_financial_analysis():
    """Test financial analysis capability."""
    user_input = "Analyze the financial performance of TechCorp"
    
    app_name = "financial-agent"
    runner = InMemoryRunner(agent=root_agent, app_name=app_name)
    
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

    # Verify response contains financial analysis keywords
    assert any(
        keyword in response.lower()
        for keyword in ["revenue", "income", "financial", "analysis"]
    )


@pytest.mark.asyncio
async def test_market_research():
    """Test market research capability."""
    user_input = "What are the trends in the fintech market?"
    
    app_name = "financial-agent"
    runner = InMemoryRunner(agent=root_agent, app_name=app_name)
    
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

    # Verify response contains market research keywords
    assert any(
        keyword in response.lower()
        for keyword in ["market", "trend", "industry", "growth"]
    )


@pytest.mark.asyncio
async def test_kpi_calculation():
    """Test KPI calculation capability."""
    user_input = "Calculate the ROE with net income of 1M and equity of 10M"
    
    app_name = "financial-agent"
    runner = InMemoryRunner(agent=root_agent, app_name=app_name)
    
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

    # Verify response contains KPI calculation
    assert any(
        keyword in response.lower()
        for keyword in ["roe", "return", "equity", "10%"]
    )
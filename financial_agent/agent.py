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

"""Financial Agent: Multi-agent system for financial analysis."""

from google.adk.agents import LlmAgent
from google.adk.tools.agent_tool import AgentTool

from . import prompts
from .tools import (
    financial_tools,
    market_tools,
    kpi_tools,
    document_tools
)

MODEL = "gemini-2.0-flash-001"

# Sub-agent: Financial Analysis
financial_agent = LlmAgent(
    name="financial_agent",
    model=MODEL,
    description="Analyzes financial statements and provides insights",
    instruction=prompts.FINANCIAL_AGENT_PROMPT,
    output_key="financial_analysis",
    tools=[
        financial_tools.analyze_financial_statement,
        financial_tools.calculate_ratios,
        financial_tools.compare_periods,
    ],
)

# Sub-agent: Market Research
market_agent = LlmAgent(
    name="market_agent",
    model=MODEL,
    description="Researches market trends and competitive landscape",
    instruction=prompts.MARKET_AGENT_PROMPT,
    output_key="market_research",
    tools=[
        market_tools.research_market,
        market_tools.analyze_competitors,
        market_tools.identify_trends,
    ],
)

# Sub-agent: KPI Calculator
kpi_agent = LlmAgent(
    name="kpi_agent",
    model=MODEL,
    description="Calculates and explains financial KPIs",
    instruction=prompts.KPI_AGENT_PROMPT,
    output_key="kpi_analysis",
    tools=[
        kpi_tools.calculate_kpi,
        kpi_tools.explain_kpi,
        kpi_tools.benchmark_kpi,
    ],
)

# Root Coordinator Agent
root_agent = LlmAgent(
    name="financial_coordinator",
    model=MODEL,
    description=(
        "Financial analysis coordinator that routes queries to specialized agents "
        "for financial statement analysis, market research, and KPI calculations"
    ),
    instruction=prompts.COORDINATOR_PROMPT,
    output_key="response",
    tools=[
        AgentTool(agent=financial_agent),
        AgentTool(agent=market_agent),
        AgentTool(agent=kpi_agent),
        document_tools.query_documents,
    ],
)
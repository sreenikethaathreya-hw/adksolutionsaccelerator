"""
Agents API endpoints - list and manage available agents
"""
from fastapi import APIRouter
from pydantic import BaseModel
from typing import List

router = APIRouter()


class AgentInfo(BaseModel):
    id: str
    name: str
    description: str
    tags: List[str]
    icon: str = "🤖"


@router.get("/", response_model=List[AgentInfo])
async def list_agents():
    """List all available agents"""
    return [
        AgentInfo(
            id="financial_agent",
            name="Financial Analysis Agent",
            description="Analyze financial statements, market trends, and KPIs with multi-agent coordination",
            tags=["finance", "analysis", "kpi", "market"],
            icon="💰"
        ),
        AgentInfo(
            id="drive_rag_agent",
            name="Google Drive RAG Agent",
            description="Search and analyze documents from your Google Drive using RAG",
            tags=["drive", "documents", "rag", "search"],
            icon="📁"
        )
    ]


@router.get("/{agent_id}", response_model=AgentInfo)
async def get_agent(agent_id: str):
    """Get specific agent details"""
    agents = await list_agents()
    for agent in agents:
        if agent.id == agent_id:
            return agent
    
    from fastapi import HTTPException
    raise HTTPException(status_code=404, detail="Agent not found")
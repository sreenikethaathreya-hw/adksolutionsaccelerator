"""
Simple API server for HatchWorks AI Agent
Run with: uvicorn server:app --reload --port 8080
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from typing import Optional, Dict, Any
import asyncio
import json
import uuid
from datetime import datetime

# Import your agent
from financial_agent.agent import root_agent
from google.adk.runners import InMemoryRunner
from google.genai import types

app = FastAPI(title="HatchWorks AI API")

# Enable CORS with specific origins (required when using credentials)
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://localhost:3000",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# In-memory storage for sessions
sessions: Dict[str, Dict[str, Any]] = {}
runner = None

# Request/Response models
class CreateSessionRequest(BaseModel):
    user_id: str
    app_name: str = "financial_agent"

class SessionResponse(BaseModel):
    id: str
    user_id: str
    agent_id: str
    created_at: str
    updated_at: str

class MessageRequest(BaseModel):
    session_id: str
    message: str

@app.on_event("startup")
async def startup():
    global runner
    runner = InMemoryRunner(agent=root_agent, app_name="hatchworks-ai")
    print("✅ Agent runner initialized")

@app.get("/")
async def root():
    return {
        "name": "HatchWorks AI API",
        "status": "running",
        "agent": root_agent.name,
    }

@app.post("/sessions", response_model=SessionResponse)
async def create_session(request: CreateSessionRequest):
    """Create a new agent session"""
    try:
        # Create session with runner
        session = await runner.session_service.create_session(
            app_name=runner.app_name,
            user_id=request.user_id
        )
        
        # Store in memory
        session_data = {
            "id": session.id,
            "user_id": request.user_id,
            "agent_id": request.app_name,
            "created_at": datetime.now().isoformat(),
            "updated_at": datetime.now().isoformat(),
            "adk_session": session,
        }
        sessions[session.id] = session_data
        
        return SessionResponse(**{k: v for k, v in session_data.items() if k != "adk_session"})
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to create session: {str(e)}")

@app.delete("/sessions/{session_id}")
async def delete_session(session_id: str):
    """Delete a session"""
    if session_id in sessions:
        del sessions[session_id]
        return {"status": "deleted"}
    raise HTTPException(status_code=404, detail="Session not found")

@app.post("/agents/financial_agent/stream_query")
async def stream_query(request: MessageRequest):
    """Stream agent response via SSE"""
    
    session_id = request.session_id
    message = request.message
    
    if session_id not in sessions:
        raise HTTPException(status_code=404, detail="Session not found")
    
    session_data = sessions[session_id]
    
    async def generate():
        try:
            # Create content
            content = types.Content(parts=[types.Part(text=message)])
            
            # Stream response from agent
            async for event in runner.run_async(
                user_id=session_data["user_id"],
                session_id=session_id,
                new_message=content,
            ):
                if event.content and event.content.parts:
                    # Format as SSE
                    data = {
                        "content": {
                            "parts": [
                                {"text": part.text if hasattr(part, 'text') else str(part)}
                                for part in event.content.parts
                            ]
                        }
                    }
                    yield f"data: {json.dumps(data)}\n\n"
                    await asyncio.sleep(0.01)  # Small delay for smooth streaming
            
            # Send completion
            yield f"data: [DONE]\n\n"
        
        except Exception as e:
            error_data = {"error": str(e)}
            yield f"data: {json.dumps(error_data)}\n\n"
    
    return StreamingResponse(
        generate(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
        }
    )

@app.get("/agents")
async def list_agents():
    """List available agents"""
    return [
        {
            "id": "financial_agent",
            "name": "Financial Analysis Agent",
            "description": "Analyze financial statements, calculate ratios, and provide insights",
            "tags": ["finance", "analysis", "p&l"],
        },
        {
            "id": "market_agent",
            "name": "Market Research Agent",
            "description": "Research market trends, competitors, and industry insights",
            "tags": ["market", "research", "trends"],
        },
        {
            "id": "kpi_agent",
            "name": "KPI Development Agent",
            "description": "Generate custom KPIs and performance indicators",
            "tags": ["kpi", "metrics", "performance"],
        },
    ]

@app.get("/health")
async def health():
    return {"status": "healthy", "sessions": len(sessions)}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8080)
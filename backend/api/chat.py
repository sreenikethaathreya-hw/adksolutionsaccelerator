"""
Chat API endpoints for agent interactions
"""
from fastapi import APIRouter, HTTPException, UploadFile, File
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from typing import Optional, Dict, Any, List
import asyncio
import json
import base64
import logging
from datetime import datetime

from google.adk.runners import InMemoryRunner
from google.genai import types

# Import agents from agents/ directory
import sys
from pathlib import Path
agents_path = Path(__file__).parent.parent.parent / "agents"
sys.path.insert(0, str(agents_path))

import sys
from pathlib import Path

# Get the repository root (3 levels up from backend/api/)
repo_root = Path(__file__).parent.parent.parent
agents_path = repo_root / "agents"

# Add agents directory to Python path
if str(agents_path) not in sys.path:
    sys.path.insert(0, str(agents_path))

# Now can import agents
from financial_agent.agent import root_agent as financial_agent
from drive_rag_agent.agent import root_agent as drive_agent

logger = logging.getLogger(__name__)

router = APIRouter()

# In-memory storage for sessions
sessions: Dict[str, Dict[str, Any]] = {}
runner = None

# File upload configuration
MAX_FILE_SIZE = 20 * 1024 * 1024  # 20MB
SUPPORTED_MIMETYPES = {
    'application/pdf',
    'text/plain',
    'text/csv',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-excel',
    'image/png',
    'image/jpeg',
    'image/webp',
}


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


class ChatWithFileRequest(BaseModel):
    session_id: str
    message: str
    file_data: str  # base64 encoded
    file_mime_type: str
    file_name: str


def get_agent_runner(agent_name: str = "financial_agent"):
    """Get or create agent runner"""
    global runner
    
    if runner is None:
        # Select agent based on name
        agent = financial_agent if agent_name == "financial_agent" else drive_agent
        runner = InMemoryRunner(agent=agent, app_name="hatchworks-ai")
        logger.info(f"✅ Initialized runner for {agent_name}")
    
    return runner


@router.post("/sessions", response_model=SessionResponse)
async def create_session(request: CreateSessionRequest):
    """Create a new chat session"""
    try:
        runner = get_agent_runner(request.app_name)
        
        session = await runner.session_service.create_session(
            app_name=runner.app_name,
            user_id=request.user_id
        )
        
        session_data = {
            "id": session.id,
            "user_id": request.user_id,
            "agent_id": request.app_name,
            "created_at": datetime.utcnow().isoformat(),
            "updated_at": datetime.utcnow().isoformat(),
            "adk_session": session,
        }
        sessions[session.id] = session_data
        
        logger.info(f"Created session {session.id}")
        return SessionResponse(**{k: v for k, v in session_data.items() if k != "adk_session"})
    
    except Exception as e:
        logger.error(f"Failed to create session: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.delete("/sessions/{session_id}")
async def delete_session(session_id: str):
    """Delete a chat session"""
    if session_id not in sessions:
        raise HTTPException(status_code=404, detail="Session not found")
    del sessions[session_id]
    return {"status": "deleted"}


@router.get("/sessions/{session_id}")
async def get_session(session_id: str):
    """Get session details"""
    if session_id not in sessions:
        raise HTTPException(status_code=404, detail="Session not found")
    session_data = sessions[session_id]
    return {k: v for k, v in session_data.items() if k != "adk_session"}


@router.post("/{agent_id}/stream_query")
async def stream_query(agent_id: str, request: MessageRequest):
    """Stream chat response from agent"""
    session_id = request.session_id
    message = request.message
    
    if session_id not in sessions:
        raise HTTPException(status_code=404, detail="Session not found")
    
    session_data = sessions[session_id]
    runner = get_agent_runner(agent_id)
    
    async def generate():
        try:
            content = types.Content(parts=[types.Part(text=message)])
            
            async for event in runner.run_async(
                user_id=session_data["user_id"],
                session_id=session_id,
                new_message=content,
            ):
                if event.content and event.content.parts:
                    data = {
                        "content": {
                            "parts": [
                                {"text": part.text if hasattr(part, 'text') else str(part)}
                                for part in event.content.parts
                            ]
                        }
                    }
                    yield f"data: {json.dumps(data)}\n\n"
                    await asyncio.sleep(0.01)
            
            yield f"data: [DONE]\n\n"
        
        except Exception as e:
            logger.error(f"Error streaming: {e}")
            yield f"data: {json.dumps({'error': str(e)})}\n\n"
    
    return StreamingResponse(
        generate(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
        }
    )


@router.post("/{agent_id}/chat-with-file")
async def chat_with_file(agent_id: str, request: ChatWithFileRequest):
    """Chat with file attachment"""
    if request.session_id not in sessions:
        raise HTTPException(status_code=404, detail="Session not found")
    
    session_data = sessions[request.session_id]
    runner = get_agent_runner(agent_id)
    
    async def generate():
        try:
            # Create inline data part
            file_part = types.Part(
                inline_data=types.Blob(
                    mime_type=request.file_mime_type,
                    data=base64.b64decode(request.file_data)
                )
            )
            
            # Create content with file and message
            content = types.Content(parts=[
                file_part,
                types.Part(text=request.message or f"Please analyze this file: {request.file_name}")
            ])
            
            # Stream response from agent
            async for event in runner.run_async(
                user_id=session_data["user_id"],
                session_id=request.session_id,
                new_message=content,
            ):
                if event.content and event.content.parts:
                    data = {
                        "content": {
                            "parts": [
                                {"text": part.text if hasattr(part, 'text') else str(part)}
                                for part in event.content.parts
                            ]
                        }
                    }
                    yield f"data: {json.dumps(data)}\n\n"
                    await asyncio.sleep(0.01)
            
            yield f"data: [DONE]\n\n"
            
        except Exception as e:
            logger.error(f"Error: {e}")
            yield f"data: {json.dumps({'error': str(e)})}\n\n"
    
    return StreamingResponse(
        generate(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
        }
    )


@router.post("/upload")
async def upload_file(file: UploadFile = File(...)):
    """Upload file for chat"""
    try:
        if file.content_type not in SUPPORTED_MIMETYPES:
            raise HTTPException(status_code=400, detail="File type not supported")
        
        file_content = await file.read()
        file_size = len(file_content)
        
        if file_size > MAX_FILE_SIZE:
            raise HTTPException(
                status_code=400,
                detail=f"File too large (max {MAX_FILE_SIZE/(1024*1024)}MB)"
            )
        
        # Convert to base64
        base64_content = base64.b64encode(file_content).decode('utf-8')
        
        return {
            'filename': file.filename,
            'type': 'pdf' if 'pdf' in file.content_type else 'document',
            'size': file_size,
            'base64_data': base64_content,
            'mime_type': file.content_type,
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Upload error: {e}")
        raise HTTPException(status_code=500, detail=str(e))
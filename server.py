"""
HatchWorks AI API Server with Gemini Multimodal Support
Uses direct file sending (no Files API needed)
Run with: uvicorn server:app --reload --port 8080
"""

from fastapi import FastAPI, HTTPException, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from typing import Optional, Dict, Any, List
import asyncio
import json
import uuid
import os
import logging
import base64
from datetime import datetime
from api_endpoints import router as drive_router
from drive_integration import add_drive_rag_to_financial_agent
from auth_endpoints import router as auth_router
from auth import get_current_user_id

# Import agent
from financial_agent.agent import root_agent
from google.adk.runners import InMemoryRunner
from google.genai import types
from google import genai
from financial_agent.agent import root_agent as financial_agent
financial_agent_with_drive = add_drive_rag_to_financial_agent(financial_agent)

# Logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize FastAPI
app = FastAPI(title="HatchWorks AI API")

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://localhost:3000",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:3000",
        "https://hatchworks-ai-frontend-2lavryrela-uc.a.run.app",
        "https://hatchworks-ai-backend-970945758078.us-central1.run.app",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.include_router(auth_router)
app.include_router(drive_router, tags=["drive"])

# Initialize Gemini client with Vertex AI
PROJECT_ID = os.getenv("GOOGLE_CLOUD_PROJECT", "hatchworks-ai-prod")
LOCATION = os.getenv("GOOGLE_CLOUD_LOCATION", "us-central1")

try:
    gemini_client = genai.Client(
        vertexai=True,
        project=PROJECT_ID,
        location=LOCATION
    )
    logger.info(f"✅ Gemini client initialized with project: {PROJECT_ID}")
except Exception as e:
    logger.warning(f"⚠️  Gemini client initialization failed: {e}")
    gemini_client = None

# File upload configuration
MAX_FILE_SIZE = 20 * 1024 * 1024  # 20MB
SUPPORTED_MIMETYPES = {
    'application/pdf',
    'text/plain',
    'text/html',
    'text/csv',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-excel',
    'image/png',
    'image/jpeg',
    'image/webp',
}

# In-memory storage
sessions: Dict[str, Dict[str, Any]] = {}
runner = None

# Request/Response models
class CreateSessionRequest(BaseModel):
    user_id: str
    app_name: str = "financial_agent_with_drive"

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

# Startup event
@app.on_event("startup")
async def startup():
    global runner
    try:
        runner = InMemoryRunner(agent=financial_agent_with_drive, app_name="hatchworks-ai")
        logger.info("✅ Agent runner initialized")
    except Exception as e:
        logger.error(f"Failed to initialize runner: {e}")
        raise

# Health check
@app.get("/health")
async def health():
    return {
        "status": "healthy",
        "timestamp": datetime.utcnow().isoformat(),
        "gemini_enabled": gemini_client is not None
    }

@app.get("/")
async def root():
    return {
        "name": "HatchWorks AI API",
        "version": "1.0.0",
        "agent": root_agent.name,
        "gemini_multimodal": gemini_client is not None
    }

# Session endpoints
@app.post("/sessions", response_model=SessionResponse)
async def create_session(request: CreateSessionRequest):
    try:
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

@app.delete("/sessions/{session_id}")
async def delete_session(session_id: str):
    if session_id not in sessions:
        raise HTTPException(status_code=404, detail="Session not found")
    del sessions[session_id]
    return {"status": "deleted"}

@app.get("/sessions/{session_id}")
async def get_session(session_id: str):
    if session_id not in sessions:
        raise HTTPException(status_code=404, detail="Session not found")
    session_data = sessions[session_id]
    return {k: v for k, v in session_data.items() if k != "adk_session"}

# Stream query endpoint
@app.post("/agents/financial_agent/stream_query")
async def stream_query(request: MessageRequest):
    session_id = request.session_id
    message = request.message
    
    if session_id not in sessions:
        raise HTTPException(status_code=404, detail="Session not found")
    
    session_data = sessions[session_id]
    
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

@app.get("/agents")
async def list_agents():
    return [
        {
            "id": "financial_agent_with_drive",
            "name": "Financial Analysis Agent",
            "description": "Analyze financial statements and provide insights",
            "tags": ["finance", "analysis"],
        }
    ]

# ============================================================================
# Gemini Multimodal File Upload - FIXED VERSION
# Sends files directly in messages (no Files API)
# ============================================================================

def get_file_type(content_type: str) -> str:
    """Determine file type category"""
    if 'pdf' in content_type:
        return 'pdf'
    elif 'spreadsheet' in content_type or 'excel' in content_type or 'csv' in content_type:
        return 'spreadsheet'
    elif content_type.startswith('image/'):
        return 'image'
    return 'document'

async def process_uploaded_file(file: UploadFile) -> dict:
    """
    Process uploaded file - stores as base64 for direct sending
    No Files API needed!
    """
    if file.content_type not in SUPPORTED_MIMETYPES:
        raise HTTPException(
            status_code=400,
            detail=f"File type not supported"
        )
    
    file_content = await file.read()
    file_size = len(file_content)
    
    if file_size > MAX_FILE_SIZE:
        raise HTTPException(
            status_code=400,
            detail=f"File too large (max {MAX_FILE_SIZE/(1024*1024)}MB)"
        )
    
    # Convert to base64 for storage and direct sending
    base64_content = base64.b64encode(file_content).decode('utf-8')
    
    return {
        'filename': file.filename,
        'content_type': file.content_type,
        'size': file_size,
        'type': get_file_type(file.content_type),
        'processed_at': datetime.utcnow().isoformat(),
        'base64_data': base64_content,  # Store base64 data
        'mime_type': file.content_type,
        'status': 'ready'
    }

@app.post("/upload")
async def upload_file(file: UploadFile = File(...)):
    """
    Upload file - returns base64 encoded data
    No Gemini Files API needed!
    """
    try:
        logger.info(f"Processing upload: {file.filename}")
        result = await process_uploaded_file(file)
        logger.info(f"Successfully processed: {file.filename}")
        return result
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Upload error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/upload/multiple")
async def upload_multiple_files(files: List[UploadFile] = File(...)):
    """Upload multiple files"""
    if len(files) > 5:
        raise HTTPException(status_code=400, detail="Max 5 files")
    
    results = []
    for file in files:
        try:
            result = await process_uploaded_file(file)
            results.append(result)
        except Exception as e:
            results.append({
                'filename': file.filename,
                'status': 'error',
                'error': str(e)
            })
    
    return {
        'total': len(files),
        'successful': len([r for r in results if r.get('status') != 'error']),
        'results': results
    }

class ChatWithFileRequest(BaseModel):
    session_id: str
    message: str
    file_data: str  # base64 encoded
    file_mime_type: str
    file_name: str

@app.post("/agents/{agent_id}/chat-with-file")
async def chat_with_file(agent_id: str, request: ChatWithFileRequest):
    """
    Send message with file to agent
    Uses inline data (no Files API)
    """
    if request.session_id not in sessions:
        raise HTTPException(status_code=404, detail="Session not found")
    
    session_data = sessions[request.session_id]
    
    async def generate():
        try:
            # Create inline data part (works with Vertex AI!)
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

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("server:app", host="0.0.0.0", port=8080, reload=True)
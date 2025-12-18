"""Sessions endpoint with message storage."""
from fastapi import APIRouter, Request, Depends, HTTPException
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from typing import List, Optional
import uuid
from datetime import datetime
import json

try:
    from backend.auth.utils import get_current_user
    FIREBASE_AVAILABLE = True
except ImportError:
    FIREBASE_AVAILABLE = False
    from fastapi.security import HTTPBearer
    security = HTTPBearer(auto_error=False)
    async def get_current_user(credentials = Depends(security)):
        return {"uid": "test-user", "email": "test@example.com"}

router = APIRouter(prefix="/sessions", tags=["sessions"])

# In-memory storage
sessions_db = {}
messages_db = {}  # session_id -> list of messages

class Message(BaseModel):
    id: str
    session_id: str
    role: str
    content: str
    timestamp: str

@router.post("")
async def create_session(request: Request, current_user: dict = Depends(get_current_user)):
    body = await request.json()
    
    agent_id = body.get("app_name") or body.get("agentId") or body.get("agent_id")
    title = body.get("title")
    
    if not agent_id:
        return JSONResponse(status_code=422, content={"detail": "Missing agent_id"})
    
    session_id = str(uuid.uuid4())
    now = datetime.utcnow().isoformat()
    
    session = {
        "id": session_id,
        "userId": current_user["uid"],
        "agentId": agent_id,
        "title": title or f"Chat with {agent_id}",
        "createdAt": now,
        "updatedAt": now,
        "messageCount": 0,
    }
    
    sessions_db[session_id] = session
    messages_db[session_id] = []
    
    print(f"✅ Created session: {session_id}")
    return session

@router.get("")
async def list_sessions(current_user: dict = Depends(get_current_user)):
    """List all sessions for current user, ordered by most recent."""
    user_sessions = [
        s for s in sessions_db.values() 
        if s.get("userId") == current_user["uid"]
    ]
    # Sort by updatedAt descending (most recent first)
    user_sessions.sort(key=lambda x: x.get("updatedAt", ""), reverse=True)
    return user_sessions

@router.get("/{session_id}")
async def get_session(session_id: str, current_user: dict = Depends(get_current_user)):
    if session_id not in sessions_db:
        raise HTTPException(status_code=404, detail="Not found")
    session = sessions_db[session_id]
    if session.get("userId") != current_user["uid"]:
        raise HTTPException(status_code=404, detail="Not found")
    return session

@router.get("/{session_id}/messages")
async def get_messages(session_id: str, current_user: dict = Depends(get_current_user)):
    """Get all messages for a session."""
    if session_id not in sessions_db:
        raise HTTPException(status_code=404, detail="Session not found")
    
    session = sessions_db[session_id]
    if session.get("userId") != current_user["uid"]:
        raise HTTPException(status_code=404, detail="Not found")
    
    return messages_db.get(session_id, [])

@router.post("/{session_id}/messages")
async def add_message(
    session_id: str,
    message: Message,
    current_user: dict = Depends(get_current_user)
):
    """Add a message to a session."""
    if session_id not in sessions_db:
        raise HTTPException(status_code=404, detail="Session not found")
    
    session = sessions_db[session_id]
    if session.get("userId") != current_user["uid"]:
        raise HTTPException(status_code=404, detail="Not found")
    
    # Add message
    if session_id not in messages_db:
        messages_db[session_id] = []
    
    message.session_id = session_id
    messages_db[session_id].append(message.dict())
    
    # Update session
    session["updatedAt"] = datetime.utcnow().isoformat()
    session["messageCount"] = len(messages_db[session_id])
    
    return message

@router.patch("/{session_id}")
async def update_session(
    session_id: str,
    request: Request,
    current_user: dict = Depends(get_current_user)
):
    """Update session (e.g., title)."""
    if session_id not in sessions_db:
        raise HTTPException(status_code=404, detail="Not found")
    
    session = sessions_db[session_id]
    if session.get("userId") != current_user["uid"]:
        raise HTTPException(status_code=404, detail="Not found")
    
    body = await request.json()
    session.update(body)
    session["updatedAt"] = datetime.utcnow().isoformat()
    
    return session

@router.delete("/{session_id}")
async def delete_session(session_id: str, current_user: dict = Depends(get_current_user)):
    if session_id in sessions_db:
        session = sessions_db[session_id]
        if session.get("userId") == current_user["uid"]:
            del sessions_db[session_id]
            if session_id in messages_db:
                del messages_db[session_id]
    return {"message": "Deleted"}

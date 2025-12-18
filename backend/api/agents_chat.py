"""Agent chat endpoints with Google ADK Financial Agent using Runner."""
from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from backend.auth.utils import get_current_user
import asyncio
import json
import uuid
from datetime import datetime
import sys
from pathlib import Path

router = APIRouter(tags=["agent-chat"])

# Cache the runner
_runner = None
_session_service = None

def get_runner():
    global _runner, _session_service
    if _runner is None:
        project_root = Path(__file__).parent.parent.parent
        agents_dir = project_root / "agents"
        
        if str(agents_dir) not in sys.path:
            sys.path.insert(0, str(agents_dir))
        
        from financial_agent import agent as financial_agent_module
        from google.adk import Runner
        from google.adk.sessions import InMemorySessionService
        
        _session_service = InMemorySessionService()
        
        _runner = Runner(
            app_name="financial_assistant",
            agent=financial_agent_module.root_agent,
            session_service=_session_service
        )
        
        print("✅ Runner initialized")
    
    return _runner, _session_service

class ChatRequest(BaseModel):
    session_id: str
    message: str

class ChatWithFileRequest(BaseModel):
    session_id: str
    message: str
    file_data: str
    file_mime_type: str
    file_name: str

@router.post("/api/chat/stream")
async def stream_chat(
    request: ChatRequest,
    current_user: dict = Depends(get_current_user)
):
    """Stream chat responses from Google ADK Financial Agent."""
    
    from backend.api.sessions import sessions_db, messages_db
    
    if request.session_id not in sessions_db:
        raise HTTPException(status_code=404, detail="Session not found")
    
    session = sessions_db[request.session_id]
    if session.get("userId") != current_user["uid"]:
        raise HTTPException(status_code=404, detail="Unauthorized")
    
    # Save user message
    user_msg_id = str(uuid.uuid4())
    user_message = {
        "id": user_msg_id,
        "session_id": request.session_id,
        "role": "user",
        "content": request.message,
        "timestamp": datetime.utcnow().isoformat()
    }
    
    if request.session_id not in messages_db:
        messages_db[request.session_id] = []
    messages_db[request.session_id].append(user_message)
    
    assistant_msg_id = str(uuid.uuid4())
    assistant_content = ""
    
    async def generate():
        nonlocal assistant_content
        
        try:
            print(f"\n🤖 Processing: {request.message}")
            
            runner, session_service = get_runner()
            
            from google.genai import types
            import base64
            
            # Create message parts
            parts = []
            
            # Include session files if any
            session_files = session.get("files", [])
            if session_files:
                print(f"📎 Including {len(session_files)} file(s) from session")
                for file_data in session_files:
                    try:
                        file_bytes = base64.b64decode(file_data["base64_data"])
                        file_part = types.Part.from_bytes(
                            data=file_bytes,
                            mime_type=file_data["mime_type"]
                        )
                        parts.append(file_part)
                        print(f"   ✅ {file_data['filename']}")
                    except Exception as e:
                        print(f"   ⚠️ Could not include {file_data.get('filename')}: {e}")
            
            # Add user message
            parts.append(types.Part(text=request.message))
            
            user_content = types.Content(
                role="user",
                parts=parts
            )
            
            # Use user ID as ADK session ID
            adk_session_id = current_user["uid"]
            app_name = "financial_assistant"
            
            # Get or create session
            adk_session = await session_service.get_session(
                app_name=app_name,
                user_id=current_user["uid"],
                session_id=adk_session_id
            )
            
            if adk_session is None:
                adk_session = await session_service.create_session(
                    app_name=app_name,
                    user_id=current_user["uid"],
                    session_id=adk_session_id,
                    state={}
                )
                print(f"✅ Created new ADK session")
            else:
                print(f"✅ Using existing ADK session")
            
            print(f"✅ Running agent")
            
            # Run the agent
            async for event in runner.run_async(
                user_id=current_user["uid"],
                session_id=adk_session_id,
                new_message=user_content
            ):
                # Extract text from events
                event_text = ""
                
                if hasattr(event, 'text') and event.text:
                    event_text = event.text
                elif hasattr(event, 'content') and event.content:
                    if hasattr(event.content, 'parts') and event.content.parts:
                        for part in event.content.parts:
                            if hasattr(part, 'text') and part.text:
                                event_text += part.text
                    elif isinstance(event.content, str):
                        event_text = event.content
                
                # Stream
                if event_text:
                    for char in event_text:
                        assistant_content += char
                        data = {"content": {"parts": [{"text": char}]}}
                        yield f"data: {json.dumps(data)}\n\n"
                        await asyncio.sleep(0.005)
            
            print(f"✅ Complete ({len(assistant_content)} chars)")
            
            # Fallback
            if not assistant_content:
                fallback = "I'm your financial assistant. How can I help?"
                for char in fallback:
                    assistant_content += char
                    data = {"content": {"parts": [{"text": char}]}}
                    yield f"data: {json.dumps(data)}\n\n"
                    await asyncio.sleep(0.01)
            
            # Save
            assistant_message = {
                "id": assistant_msg_id,
                "session_id": request.session_id,
                "role": "assistant",
                "content": assistant_content,
                "timestamp": datetime.utcnow().isoformat()
            }
            messages_db[request.session_id].append(assistant_message)
            
            session["updatedAt"] = datetime.utcnow().isoformat()
            session["messageCount"] = len(messages_db[request.session_id])
            
            yield "data: [DONE]\n\n"
            
        except Exception as e:
            print(f"❌ Error: {type(e).__name__}: {e}")
            import traceback
            traceback.print_exc()
            
            error_msg = "I'm here to help with financial analysis. Please try again."
            for char in error_msg:
                assistant_content += char
                data = {"content": {"parts": [{"text": char}]}}
                yield f"data: {json.dumps(data)}\n\n"
                await asyncio.sleep(0.01)
            
            yield "data: [DONE]\n\n"
    
    return StreamingResponse(
        generate(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no"
        }
    )

@router.post("/agents/financial_agent/chat-with-file")
async def chat_with_file(
    request: ChatWithFileRequest,
    current_user: dict = Depends(get_current_user)
):
    """Chat with file upload - analyze documents."""
    
    from backend.api.sessions import sessions_db, messages_db
    
    if request.session_id not in sessions_db:
        raise HTTPException(status_code=404, detail="Session not found")
    
    session = sessions_db[request.session_id]
    if session.get("userId") != current_user["uid"]:
        raise HTTPException(status_code=404, detail="Unauthorized")
    
    # Save user message with file reference
    user_msg_id = str(uuid.uuid4())
    user_message = {
        "id": user_msg_id,
        "session_id": request.session_id,
        "role": "user",
        "content": request.message,
        "timestamp": datetime.utcnow().isoformat(),
        "file": {
            "name": request.file_name,
            "mime_type": request.file_mime_type
        }
    }
    
    if request.session_id not in messages_db:
        messages_db[request.session_id] = []
    messages_db[request.session_id].append(user_message)
    
    assistant_msg_id = str(uuid.uuid4())
    assistant_content = ""
    
    async def generate():
        nonlocal assistant_content
        
        try:
            print(f"\n📄 Processing file: {request.file_name}")
            print(f"📝 Message: {request.message}")
            print(f"📏 File size: {len(request.file_data)} base64 chars")
            
            runner, session_service = get_runner()
            
            from google.genai import types
            import base64
            
            # Decode file
            file_bytes = base64.b64decode(request.file_data)
            print(f"📦 Decoded to {len(file_bytes)} bytes")
            
            # Create message with file
            parts = []
            
            # Add the uploaded file
            try:
                file_part = types.Part.from_bytes(
                    data=file_bytes,
                    mime_type=request.file_mime_type
                )
                parts.append(file_part)
                print(f"✅ Created file part using from_bytes")
            except Exception as e:
                print(f"⚠️ from_bytes failed: {e}")
            
            # Add user message
            parts.append(types.Part(text=request.message))
            
            user_content = types.Content(
                role="user",
                parts=parts
            )
            
            # Use user ID as ADK session ID
            adk_session_id = current_user["uid"]
            app_name = "financial_assistant"
            
            # Get or create session
            adk_session = await session_service.get_session(
                app_name=app_name,
                user_id=current_user["uid"],
                session_id=adk_session_id
            )
            
            if adk_session is None:
                adk_session = await session_service.create_session(
                    app_name=app_name,
                    user_id=current_user["uid"],
                    session_id=adk_session_id,
                    state={}
                )
            
            print(f"✅ Running agent with file")
            
            # Run the agent
            async for event in runner.run_async(
                user_id=current_user["uid"],
                session_id=adk_session_id,
                new_message=user_content
            ):
                # Extract text
                event_text = ""
                
                if hasattr(event, 'text') and event.text:
                    event_text = event.text
                elif hasattr(event, 'content') and event.content:
                    if hasattr(event.content, 'parts') and event.content.parts:
                        for part in event.content.parts:
                            if hasattr(part, 'text') and part.text:
                                event_text += part.text
                    elif isinstance(event.content, str):
                        event_text = event.content
                
                # Stream
                if event_text:
                    for char in event_text:
                        assistant_content += char
                        data = {"content": {"parts": [{"text": char}]}}
                        yield f"data: {json.dumps(data)}\n\n"
                        await asyncio.sleep(0.005)
            
            print(f"✅ Complete ({len(assistant_content)} chars)")
            
            # Save
            assistant_message = {
                "id": assistant_msg_id,
                "session_id": request.session_id,
                "role": "assistant",
                "content": assistant_content,
                "timestamp": datetime.utcnow().isoformat()
            }
            messages_db[request.session_id].append(assistant_message)
            
            session["updatedAt"] = datetime.utcnow().isoformat()
            session["messageCount"] = len(messages_db[request.session_id])
            
            yield "data: [DONE]\n\n"
            
        except Exception as e:
            print(f"❌ Error: {type(e).__name__}: {e}")
            import traceback
            traceback.print_exc()
            
            error_msg = "I had trouble analyzing that file. Please try again."
            for char in error_msg:
                assistant_content += char
                data = {"content": {"parts": [{"text": char}]}}
                yield f"data: {json.dumps(data)}\n\n"
                await asyncio.sleep(0.01)
            
            yield "data: [DONE]\n\n"
    
    return StreamingResponse(
        generate(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no"
        }
    )

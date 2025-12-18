"""File upload endpoint with session persistence."""
from fastapi import APIRouter, UploadFile, File, Depends, HTTPException, Query
from backend.auth.utils import get_current_user
import base64
from typing import Optional

router = APIRouter(prefix="/upload", tags=["upload"])

# Supported file types
SUPPORTED_TYPES = {
    "application/pdf": "pdf",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": "spreadsheet",
    "application/vnd.ms-excel": "spreadsheet",
    "text/csv": "spreadsheet",
    "image/png": "image",
    "image/jpeg": "image",
    "image/jpg": "image",
    "image/webp": "image",
}

@router.post("")
async def upload_file(
    file: UploadFile = File(...),
    session_id: Optional[str] = Query(None),
    current_user: dict = Depends(get_current_user)
):
    """Upload a file and attach it to a session."""
    
    from backend.api.sessions import sessions_db
    
    print(f"📤 Upload: {file.filename} ({file.content_type})")
    
    # Check file type
    if file.content_type not in SUPPORTED_TYPES:
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported file type: {file.content_type}"
        )
    
    try:
        # Read file content
        content = await file.read()
        
        # Convert to base64
        base64_data = base64.b64encode(content).decode('utf-8')
        
        # Determine file type category
        file_type = SUPPORTED_TYPES[file.content_type]
        
        file_data = {
            "filename": file.filename,
            "type": file_type,
            "size": len(content),
            "base64_data": base64_data,
            "mime_type": file.content_type
        }
        
        # If session_id provided, attach file to session
        if session_id and session_id in sessions_db:
            session = sessions_db[session_id]
            if session.get("userId") == current_user["uid"]:
                if "files" not in session:
                    session["files"] = []
                session["files"].append(file_data)
                print(f"✅ Attached to session {session_id}")
        
        print(f"✅ Uploaded: {file.filename} ({len(content)} bytes)")
        
        return file_data
        
    except Exception as e:
        print(f"❌ Upload error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

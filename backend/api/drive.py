"""
Google Drive Integration API endpoints
"""
from fastapi import APIRouter, HTTPException, Depends, Query
from pydantic import BaseModel
from typing import Optional, Dict, Any
import logging

from backend.auth.utils import get_current_user_id

# Import from agents/drive_rag_agent
import sys
from pathlib import Path
agents_path = Path(__file__).parent.parent.parent / "agents"
sys.path.insert(0, str(agents_path))

from drive_rag_agent.auth_utils import (
    get_authorization_url,
    exchange_code_for_tokens,
    store_user_credentials,
    revoke_user_credentials
)
from drive_rag_agent.tools.drive_tools import (
    list_drive_folders as list_folders_tool,
    get_corpus_status as get_status_tool
)
from drive_rag_agent.tools.rag_tools import get_user_corpus_info

logger = logging.getLogger(__name__)
router = APIRouter()


def check_user_credentials(user_id: str) -> bool:
    """Check if user has OAuth credentials stored"""
    try:
        from google.cloud import secretmanager
        import os
        
        project_id = os.getenv("GOOGLE_CLOUD_PROJECT")
        secret_name = f"drive-oauth-{user_id}"
        
        client = secretmanager.SecretManagerServiceClient()
        secret_path = f"projects/{project_id}/secrets/{secret_name}"
        
        client.get_secret(request={"name": secret_path})
        return True
    except Exception:
        return False


# Request/Response models
class AuthUrlRequest(BaseModel):
    state: Optional[str] = None


class AuthUrlResponse(BaseModel):
    authorization_url: str


class CallbackRequest(BaseModel):
    code: str
    state: Optional[str] = None


class StatusResponse(BaseModel):
    connected: bool
    corpus_info: Optional[Dict[str, Any]] = None


class FoldersResponse(BaseModel):
    folders: list
    total: int


class IndexFolderRequest(BaseModel):
    folder_id: str
    folder_name: str


@router.get("/auth/url", response_model=AuthUrlResponse)
async def get_auth_url(
    state: Optional[str] = Query(None),
    user_id: str = Depends(get_current_user_id)
):
    """Generate Google OAuth authorization URL"""
    try:
        auth_url = get_authorization_url(state=state)
        return AuthUrlResponse(authorization_url=auth_url)
    except Exception as e:
        logger.error(f"Failed to generate auth URL: {e}")
        raise HTTPException(status_code=500, detail="Failed to generate authorization URL")


@router.post("/auth/callback")
async def handle_oauth_callback(
    request: CallbackRequest,
    user_id: str = Depends(get_current_user_id)
):
    """Handle OAuth callback from Google"""
    try:
        # Exchange code for tokens
        credentials_dict = exchange_code_for_tokens(request.code)
        
        # Store credentials for user
        success = store_user_credentials(user_id, credentials_dict)
        
        if not success:
            raise HTTPException(status_code=500, detail="Failed to store credentials")
        
        return {
            "status": "success",
            "message": "Google Drive connected successfully"
        }
        
    except Exception as e:
        logger.error(f"OAuth callback failed for user {user_id}: {e}")
        raise HTTPException(status_code=400, detail=f"OAuth callback failed: {str(e)}")


@router.delete("/auth/disconnect")
async def disconnect_drive(
    user_id: str = Depends(get_current_user_id)
):
    """Disconnect Google Drive by revoking credentials"""
    try:
        success = revoke_user_credentials(user_id)
        
        if not success:
            raise HTTPException(status_code=500, detail="Failed to revoke credentials")
        
        return {
            "status": "success",
            "message": "Google Drive disconnected successfully"
        }
        
    except Exception as e:
        logger.error(f"Failed to disconnect Drive for user {user_id}: {e}")
        raise HTTPException(status_code=500, detail="Failed to disconnect Google Drive")


@router.get("/status", response_model=StatusResponse)
async def get_drive_status(
    user_id: str = Depends(get_current_user_id)
):
    """Get the user's Google Drive connection and corpus status"""
    try:
        # Check if OAuth credentials exist
        has_credentials = check_user_credentials(user_id)
        
        # Check if corpus exists
        corpus_info = get_user_corpus_info(user_id) if has_credentials else None
        
        return StatusResponse(
            connected=has_credentials,
            corpus_info=corpus_info
        )
        
    except Exception as e:
        logger.error(f"Failed to get Drive status for user {user_id}: {e}")
        return StatusResponse(connected=False, corpus_info=None)


@router.get("/folders", response_model=FoldersResponse)
async def list_folders(
    user_id: str = Depends(get_current_user_id)
):
    """List all folders in the user's Google Drive"""
    try:
        # Create mock tool context with user_id
        class MockToolContext:
            def __init__(self, user_id):
                self.user_id = user_id
        
        tool_context = MockToolContext(user_id)
        result = list_folders_tool(tool_context=tool_context)
        
        if result.get("status") == "error":
            raise HTTPException(status_code=400, detail=result.get("message"))
        
        return FoldersResponse(
            folders=result.get("folders", []),
            total=result.get("total", 0)
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to list folders for user {user_id}: {e}")
        raise HTTPException(status_code=500, detail="Failed to list Drive folders")


@router.post("/index-folder")
async def index_folder(
    request: IndexFolderRequest,
    user_id: str = Depends(get_current_user_id)
):
    """Index a Google Drive folder for RAG search"""
    try:
        from drive_rag_agent.tools.drive_tools import index_drive_folder
        
        # Create mock tool context
        class MockToolContext:
            def __init__(self, user_id):
                self.user_id = user_id
        
        tool_context = MockToolContext(user_id)
        
        # Call the index function
        result = index_drive_folder(
            folder_id=request.folder_id,
            folder_name=request.folder_name,
            tool_context=tool_context
        )
        
        if result.get("status") == "error":
            raise HTTPException(status_code=400, detail=result.get("message"))
        
        return {
            "status": "success",
            "message": result.get("message", "Folder indexed successfully"),
            "files_indexed": result.get("files_indexed", 0)
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to index folder for user {user_id}: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to index folder: {str(e)}")
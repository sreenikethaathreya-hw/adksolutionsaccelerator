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

"""Google Drive integration tools for RAG agent."""

from typing import Dict, Any, List, Optional
from google.adk.tools import ToolContext
from google.oauth2.credentials import Credentials
from googleapiclient.discovery import build
from googleapiclient.http import MediaIoBaseDownload
from google.cloud import secretmanager
import logging
import io
import os
import tempfile
from datetime import datetime

logger = logging.getLogger(__name__)

# Supported Google Drive MIME types
SUPPORTED_MIME_TYPES = {
    'application/vnd.google-apps.document': 'gdoc',  # Google Docs
    'application/vnd.google-apps.presentation': 'gslides',  # Google Slides
    'application/vnd.google-apps.spreadsheet': 'gsheet',  # Google Sheets
    'application/pdf': 'pdf',  # PDF files
}

EXPORT_MIME_TYPES = {
    'application/vnd.google-apps.document': 'application/pdf',
    'application/vnd.google-apps.presentation': 'application/pdf',
    'application/vnd.google-apps.spreadsheet': 'application/pdf',
}


def get_user_drive_credentials(user_id: str) -> Optional[Credentials]:
    """
    Retrieve user's Google Drive OAuth credentials from Secret Manager.
    
    Args:
        user_id: User identifier
    
    Returns:
        OAuth2 Credentials object or None if not found
    """
    try:
        project_id = os.getenv("GOOGLE_CLOUD_PROJECT")
        secret_name = f"drive-oauth-{user_id}"
        
        client = secretmanager.SecretManagerServiceClient()
        secret_path = f"projects/{project_id}/secrets/{secret_name}/versions/latest"
        
        response = client.access_secret_version(request={"name": secret_path})
        secret_data = response.payload.data.decode('UTF-8')
        
        # Parse stored credentials
        import json
        creds_dict = json.loads(secret_data)
        
        credentials = Credentials(
            token=creds_dict.get('token'),
            refresh_token=creds_dict.get('refresh_token'),
            token_uri=creds_dict.get('token_uri', 'https://oauth2.googleapis.com/token'),
            client_id=creds_dict.get('client_id'),
            client_secret=creds_dict.get('client_secret'),
            scopes=creds_dict.get('scopes', ['https://www.googleapis.com/auth/drive.readonly'])
        )
        
        return credentials
        
    except Exception as e:
        logger.error(f"Failed to retrieve Drive credentials for user {user_id}: {e}")
        return None


def get_drive_service(user_id: str):
    """
    Create Google Drive API service for the user.
    
    Args:
        user_id: User identifier
    
    Returns:
        Google Drive API service object
    """
    credentials = get_user_drive_credentials(user_id)
    if not credentials:
        raise ValueError(f"No Google Drive credentials found for user {user_id}. Please connect Google Drive in settings.")
    
    service = build('drive', 'v3', credentials=credentials)
    return service


def list_drive_folders(
    tool_context: ToolContext = None
) -> Dict[str, Any]:
    """
    List all folders in the user's Google Drive.
    
    Args:
        tool_context: ADK tool context containing user_id
    
    Returns:
        Dictionary containing list of folders with id, name, and metadata
    """
    user_id = tool_context.user_id if tool_context else None
    if not user_id:
        return {
            "status": "error",
            "message": "User ID not found. Please ensure you are authenticated."
        }
    
    logger.info(f"Listing Drive folders for user {user_id}")
    
    try:
        service = get_drive_service(user_id)
        
        # Query for folders only
        query = "mimeType='application/vnd.google-apps.folder' and trashed=false"
        results = service.files().list(
            q=query,
            spaces='drive',
            fields='files(id, name, createdTime, modifiedTime, webViewLink)',
            pageSize=100
        ).execute()
        
        folders = results.get('files', [])
        
        return {
            "status": "success",
            "folders": [
                {
                    "id": folder['id'],
                    "name": folder['name'],
                    "created": folder.get('createdTime'),
                    "modified": folder.get('modifiedTime'),
                    "link": folder.get('webViewLink')
                }
                for folder in folders
            ],
            "total": len(folders)
        }
        
    except Exception as e:
        logger.error(f"Failed to list Drive folders for user {user_id}: {e}")
        return {
            "status": "error",
            "message": f"Failed to access Google Drive: {str(e)}"
        }


def get_files_in_folder(
    folder_id: str,
    user_id: str
) -> List[Dict[str, Any]]:
    """
    Get all supported files in a Drive folder (non-recursive).
    
    Args:
        folder_id: Google Drive folder ID
        user_id: User identifier
    
    Returns:
        List of file metadata dictionaries
    """
    try:
        service = get_drive_service(user_id)
        
        # Build query for supported file types in the folder
        mime_type_query = " or ".join([f"mimeType='{mime}'" for mime in SUPPORTED_MIME_TYPES.keys()])
        query = f"'{folder_id}' in parents and ({mime_type_query}) and trashed=false"
        
        results = service.files().list(
            q=query,
            spaces='drive',
            fields='files(id, name, mimeType, size, createdTime, modifiedTime, webViewLink)',
            pageSize=100
        ).execute()
        
        files = results.get('files', [])
        
        logger.info(f"Found {len(files)} supported files in folder {folder_id}")
        
        return [
            {
                "id": file['id'],
                "name": file['name'],
                "mime_type": file['mimeType'],
                "size": file.get('size'),
                "type": SUPPORTED_MIME_TYPES.get(file['mimeType'], 'unknown'),
                "created": file.get('createdTime'),
                "modified": file.get('modifiedTime'),
                "link": file.get('webViewLink')
            }
            for file in files
        ]
        
    except Exception as e:
        logger.error(f"Failed to get files in folder {folder_id}: {e}")
        return []


def download_drive_file(
    file_id: str,
    file_name: str,
    mime_type: str,
    user_id: str,
    output_dir: str
) -> Optional[str]:
    """
    Download a file from Google Drive and export Google Workspace files to PDF.
    
    Args:
        file_id: Google Drive file ID
        file_name: Name of the file
        mime_type: MIME type of the file
        user_id: User identifier
        output_dir: Directory to save the file
    
    Returns:
        Path to downloaded file or None if failed
    """
    try:
        service = get_drive_service(user_id)
        
        # Sanitize filename - remove invalid characters
        safe_file_name = file_name.replace('/', '-').replace('\\', '-').replace(':', '-')
        
        # Determine if this is a Google Workspace file that needs export
        if mime_type in EXPORT_MIME_TYPES:
            # Export to PDF
            request = service.files().export_media(
                fileId=file_id,
                mimeType=EXPORT_MIME_TYPES[mime_type]
            )
            # Change extension to .pdf
            safe_file_name = os.path.splitext(safe_file_name)[0] + '.pdf'
        else:
            # Download directly
            request = service.files().get_media(fileId=file_id)
        
        # Download the file
        file_path = os.path.join(output_dir, safe_file_name)
        with io.FileIO(file_path, 'wb') as fh:
            downloader = MediaIoBaseDownload(fh, request)
            done = False
            while not done:
                status, done = downloader.next_chunk()
                if status:
                    logger.debug(f"Download progress: {int(status.progress() * 100)}%")
        
        logger.info(f"Downloaded {safe_file_name} to {file_path}")
        return file_path
        
    except Exception as e:
        logger.error(f"Failed to download file {file_id}: {e}")
        return None


def index_drive_folder(
    folder_id: str,
    folder_name: Optional[str] = None,
    tool_context: ToolContext = None
) -> Dict[str, Any]:
    """
    Index all supported files from a Google Drive folder into the user's RAG corpus.
    This function:
    1. Gets all files in the folder
    2. Downloads them to a temp directory
    3. Creates or updates the user's RAG corpus
    4. Uploads files to the corpus
    
    Args:
        folder_id: Google Drive folder ID to index
        folder_name: Optional folder name for display
        tool_context: ADK tool context containing user_id
    
    Returns:
        Dictionary with indexing results and statistics
    """
    user_id = tool_context.user_id if tool_context else None
    if not user_id:
        return {
            "status": "error",
            "message": "User ID not found. Please ensure you are authenticated."
        }
    
    logger.info(f"Indexing Drive folder {folder_id} for user {user_id}")
    
    try:
        # Import RAG management functions
        from .rag_tools import (
            create_or_get_user_corpus,
            upload_file_to_corpus,
            update_corpus_metadata
        )
        
        # Get files in the folder
        files = get_files_in_folder(folder_id, user_id)
        
        if not files:
            return {
                "status": "warning",
                "message": f"No supported files found in folder. Supported types: Docs, Slides, Sheets, PDFs",
                "files_indexed": 0
            }
        
        # Create or get the user's corpus
        corpus = create_or_get_user_corpus(user_id)
        
        # Create temp directory for downloads
        with tempfile.TemporaryDirectory() as temp_dir:
            indexed_count = 0
            failed_count = 0
            indexed_files = []
            
            for file in files:
                try:
                    # Download file
                    file_path = download_drive_file(
                        file_id=file['id'],
                        file_name=file['name'],
                        mime_type=file['mime_type'],
                        user_id=user_id,
                        output_dir=temp_dir
                    )
                    
                    if file_path:
                        # Upload to RAG corpus
                        success = upload_file_to_corpus(
                            corpus_name=corpus.name,
                            file_path=file_path,
                            display_name=file['name'],
                            description=f"From Drive folder: {folder_name or folder_id}",
                            metadata={
                                'drive_file_id': file['id'],
                                'drive_folder_id': folder_id,
                                'drive_link': file.get('link', ''),
                                'modified': file.get('modified', '')
                            }
                        )
                        
                        if success:
                            indexed_count += 1
                            indexed_files.append(file['name'])
                        else:
                            failed_count += 1
                    else:
                        failed_count += 1
                        
                except Exception as e:
                    logger.error(f"Failed to index file {file['name']}: {e}")
                    failed_count += 1
        
        # Update corpus metadata with indexing info
        update_corpus_metadata(
            corpus_name=corpus.name,
            metadata={
                'last_indexed': datetime.utcnow().isoformat(),
                'indexed_folder_id': folder_id,
                'indexed_folder_name': folder_name or folder_id,
                'total_files': indexed_count
            }
        )
        
        return {
            "status": "success",
            "message": f"Successfully indexed {indexed_count} files from Drive folder",
            "corpus_name": corpus.name,
            "files_indexed": indexed_count,
            "files_failed": failed_count,
            "indexed_files": indexed_files,
            "folder_id": folder_id,
            "folder_name": folder_name
        }
        
    except Exception as e:
        logger.error(f"Failed to index Drive folder {folder_id}: {e}")
        return {
            "status": "error",
            "message": f"Failed to index folder: {str(e)}",
            "files_indexed": 0
        }


def get_corpus_status(
    tool_context: ToolContext = None
) -> Dict[str, Any]:
    """
    Get the status of the user's RAG corpus - what's indexed, when, etc.
    
    Args:
        tool_context: ADK tool context containing user_id
    
    Returns:
        Dictionary with corpus status information
    """
    user_id = tool_context.user_id if tool_context else None
    if not user_id:
        return {
            "status": "error",
            "message": "User ID not found. Please ensure you are authenticated."
        }
    
    logger.info(f"Getting corpus status for user {user_id}")
    
    try:
        from .rag_tools import get_user_corpus_info
        
        corpus_info = get_user_corpus_info(user_id)
        
        if not corpus_info:
            return {
                "status": "no_corpus",
                "message": "No corpus found. Please index a Drive folder first.",
                "files_count": 0
            }
        
        return {
            "status": "active",
            "corpus_name": corpus_info.get('name'),
            "display_name": corpus_info.get('display_name'),
            "description": corpus_info.get('description'),
            "files_count": corpus_info.get('files_count', 0),
            "last_indexed": corpus_info.get('last_indexed'),
            "indexed_folder": corpus_info.get('indexed_folder_name'),
            "created": corpus_info.get('created')
        }
        
    except Exception as e:
        logger.error(f"Failed to get corpus status for user {user_id}: {e}")
        return {
            "status": "error",
            "message": f"Failed to get corpus status: {str(e)}"
        }
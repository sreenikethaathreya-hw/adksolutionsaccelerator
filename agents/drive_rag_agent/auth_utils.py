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

"""Google Drive OAuth utilities for backend."""

import os
import json
from google.cloud import secretmanager
from google.oauth2.credentials import Credentials
from google_auth_oauthlib.flow import Flow
import logging

logger = logging.getLogger(__name__)

# OAuth 2.0 configuration
SCOPES = [
    'https://www.googleapis.com/auth/drive.readonly',
    'https://www.googleapis.com/auth/drive.metadata.readonly'
]

# Get OAuth credentials from environment
CLIENT_ID = os.getenv("GOOGLE_OAUTH_CLIENT_ID")
CLIENT_SECRET = os.getenv("GOOGLE_OAUTH_CLIENT_SECRET")
REDIRECT_URI = os.getenv("GOOGLE_OAUTH_REDIRECT_URI", "http://localhost:5173/auth/callback")


def create_oauth_flow() -> Flow:
    """
    Create OAuth 2.0 flow for Google Drive.
    
    Returns:
        OAuth Flow object
    """
    client_config = {
        "web": {
            "client_id": CLIENT_ID,
            "client_secret": CLIENT_SECRET,
            "auth_uri": "https://accounts.google.com/o/oauth2/auth",
            "token_uri": "https://oauth2.googleapis.com/token",
            "redirect_uris": [REDIRECT_URI]
        }
    }
    
    flow = Flow.from_client_config(
        client_config,
        scopes=SCOPES,
        redirect_uri=REDIRECT_URI
    )
    
    return flow


def get_authorization_url(state: str = None) -> str:
    """
    Generate Google OAuth authorization URL.
    
    Args:
        state: Optional state parameter for CSRF protection
    
    Returns:
        Authorization URL
    """
    flow = create_oauth_flow()
    
    authorization_url, _ = flow.authorization_url(
        access_type='offline',
        include_granted_scopes='true',
        state=state,
        prompt='consent'  # Force consent to get refresh token
    )
    
    return authorization_url


def exchange_code_for_tokens(code: str) -> dict:
    """
    Exchange authorization code for access and refresh tokens.
    
    Args:
        code: Authorization code from OAuth callback
    
    Returns:
        Dictionary with token information
    """
    flow = create_oauth_flow()
    flow.fetch_token(code=code)
    
    credentials = flow.credentials
    
    return {
        'token': credentials.token,
        'refresh_token': credentials.refresh_token,
        'token_uri': credentials.token_uri,
        'client_id': credentials.client_id,
        'client_secret': credentials.client_secret,
        'scopes': credentials.scopes
    }


def store_user_credentials(user_id: str, credentials_dict: dict) -> bool:
    """
    Store user's OAuth credentials in Google Secret Manager.
    
    Args:
        user_id: User identifier
        credentials_dict: Dictionary with credential information
    
    Returns:
        True if successful, False otherwise
    """
    try:
        project_id = os.getenv("GOOGLE_CLOUD_PROJECT")
        secret_name = f"drive-oauth-{user_id}"
        
        client = secretmanager.SecretManagerServiceClient()
        parent = f"projects/{project_id}"
        
        # Create secret if it doesn't exist
        try:
            secret_path = f"{parent}/secrets/{secret_name}"
            client.get_secret(request={"name": secret_path})
        except Exception:
            # Secret doesn't exist, create it
            client.create_secret(
                request={
                    "parent": parent,
                    "secret_id": secret_name,
                    "secret": {
                        "replication": {"automatic": {}}
                    }
                }
            )
        
        # Add secret version with credentials
        secret_path = f"{parent}/secrets/{secret_name}"
        payload = json.dumps(credentials_dict).encode('UTF-8')
        
        client.add_secret_version(
            request={
                "parent": secret_path,
                "payload": {"data": payload}
            }
        )
        
        logger.info(f"Stored Drive OAuth credentials for user {user_id}")
        return True
        
    except Exception as e:
        logger.error(f"Failed to store credentials for user {user_id}: {e}")
        return False


def revoke_user_credentials(user_id: str) -> bool:
    """
    Revoke and delete user's OAuth credentials.
    
    Args:
        user_id: User identifier
    
    Returns:
        True if successful, False otherwise
    """
    try:
        project_id = os.getenv("GOOGLE_CLOUD_PROJECT")
        secret_name = f"drive-oauth-{user_id}"
        
        client = secretmanager.SecretManagerServiceClient()
        secret_path = f"projects/{project_id}/secrets/{secret_name}"
        
        # Delete the secret
        client.delete_secret(request={"name": secret_path})
        
        logger.info(f"Revoked Drive OAuth credentials for user {user_id}")
        return True
        
    except Exception as e:
        logger.error(f"Failed to revoke credentials for user {user_id}: {e}")
        return False
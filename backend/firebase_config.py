"""Firebase Admin SDK initialization and configuration."""

import os
import firebase_admin
from firebase_admin import credentials, auth, firestore
from google.cloud import secretmanager
import json
from typing import Optional

# Global Firebase app instance
_firebase_app: Optional[firebase_admin.App] = None
_firestore_client: Optional[firestore.client] = None


def get_service_account_from_secret() -> dict:
    """Get service account credentials from Secret Manager."""
    secret_name = os.getenv("FIREBASE_SERVICE_ACCOUNT_SECRET")
    
    if not secret_name:
        raise ValueError("FIREBASE_SERVICE_ACCOUNT_SECRET not set")
    
    client = secretmanager.SecretManagerServiceClient()
    response = client.access_secret_version(request={"name": secret_name})
    secret_data = response.payload.data.decode("UTF-8")
    
    return json.loads(secret_data)


def initialize_firebase() -> firebase_admin.App:
    """Initialize Firebase Admin SDK."""
    global _firebase_app
    
    if _firebase_app is not None:
        return _firebase_app
    
    # Check if already initialized
    try:
        _firebase_app = firebase_admin.get_app()
        return _firebase_app
    except ValueError:
        pass  # Not initialized yet
    
    # Try to get credentials from Secret Manager first (production)
    try:
        cred_dict = get_service_account_from_secret()
        cred = credentials.Certificate(cred_dict)
        print("✅ Loaded Firebase credentials from Secret Manager")
    except (ValueError, Exception) as e:
        # Fall back to local file (development)
        service_account_path = os.getenv("FIREBASE_SERVICE_ACCOUNT_PATH")
        
        if service_account_path and os.path.exists(service_account_path):
            cred = credentials.Certificate(service_account_path)
            print(f"✅ Loaded Firebase credentials from {service_account_path}")
        else:
            # Use Application Default Credentials
            cred = credentials.ApplicationDefault()
            print("✅ Using Application Default Credentials for Firebase")
    
    # Initialize Firebase app
    _firebase_app = firebase_admin.initialize_app(cred, {
        'projectId': os.getenv('FIREBASE_PROJECT_ID') or os.getenv('GOOGLE_CLOUD_PROJECT'),
    })
    
    print(f"✅ Firebase initialized: {_firebase_app.project_id}")
    return _firebase_app


def get_firestore_client() -> firestore.client:
    """Get Firestore client instance."""
    global _firestore_client
    
    if _firestore_client is None:
        # Ensure Firebase is initialized first
        initialize_firebase()
        _firestore_client = firestore.client()
        print("✅ Firestore client initialized")
    
    return _firestore_client


def verify_firebase_token(token: str) -> dict:
    """
    Verify a Firebase ID token.
    
    Args:
        token: Firebase ID token from client
        
    Returns:
        Decoded token containing user information
        
    Raises:
        ValueError: If token is invalid
    """
    initialize_firebase()
    
    try:
        decoded_token = auth.verify_id_token(token)
        return decoded_token
    except Exception as e:
        raise ValueError(f"Invalid Firebase token: {str(e)}")


def get_user_by_id(uid: str) -> auth.UserRecord:
    """
    Get Firebase user by UID.
    
    Args:
        uid: Firebase user ID
        
    Returns:
        UserRecord object
    """
    initialize_firebase()
    return auth.get_user(uid)


def create_custom_token(uid: str, claims: Optional[dict] = None) -> str:
    """
    Create a custom Firebase token.
    
    Args:
        uid: User ID
        claims: Optional custom claims
        
    Returns:
        Custom token string
    """
    initialize_firebase()
    return auth.create_custom_token(uid, claims)


# Initialize on import
try:
    initialize_firebase()
except Exception as e:
    print(f"⚠️  Firebase initialization deferred: {e}")

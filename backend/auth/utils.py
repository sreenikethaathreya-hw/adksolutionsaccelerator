"""Authentication utilities using Firebase Authentication."""

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from typing import Optional

from backend.firebase_config import verify_firebase_token, get_firestore_client

security = HTTPBearer()

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)) -> dict:
    """Get current authenticated user from Firebase token."""
    if not credentials:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Missing authentication credentials", headers={"WWW-Authenticate": "Bearer"})
    
    token = credentials.credentials
    try:
        decoded_token = verify_firebase_token(token)
        return {"uid": decoded_token["uid"], "email": decoded_token.get("email"), "email_verified": decoded_token.get("email_verified", False), "name": decoded_token.get("name"), "picture": decoded_token.get("picture"), "firebase_claims": decoded_token}
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail=str(e), headers={"WWW-Authenticate": "Bearer"})
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid authentication credentials", headers={"WWW-Authenticate": "Bearer"})

async def get_current_user_id(credentials: HTTPAuthorizationCredentials = Depends(security)) -> str:
    """Get current user's ID from Firebase token."""
    user = await get_current_user(credentials)
    return user["uid"]

async def get_optional_user(credentials: Optional[HTTPAuthorizationCredentials] = Depends(security)) -> Optional[dict]:
    """Get current user if authenticated, None otherwise."""
    if not credentials:
        return None
    try:
        return await get_current_user(credentials)
    except HTTPException:
        return None

async def ensure_user_document(user_uid: str, user_email: Optional[str] = None) -> dict:
    """Ensure user document exists in Firestore, create if not."""
    db = get_firestore_client()
    user_ref = db.collection('users').document(user_uid)
    user_doc = user_ref.get()
    if user_doc.exists:
        return user_doc.to_dict()
    from datetime import datetime
    user_data = {"uid": user_uid, "email": user_email, "created_at": datetime.utcnow().isoformat(), "updated_at": datetime.utcnow().isoformat(), "settings": {}, "quota": {"messages_used": 0, "messages_limit": 1000}}
    user_ref.set(user_data)
    return user_data

async def get_user_settings(user_uid: str) -> dict:
    """Get user settings from Firestore."""
    db = get_firestore_client()
    user_ref = db.collection('users').document(user_uid)
    user_doc = user_ref.get()
    if not user_doc.exists:
        return {}
    user_data = user_doc.to_dict()
    return user_data.get("settings", {})

async def update_user_settings(user_uid: str, settings: dict) -> None:
    """Update user settings in Firestore."""
    from datetime import datetime
    db = get_firestore_client()
    user_ref = db.collection('users').document(user_uid)
    user_ref.update({"settings": settings, "updated_at": datetime.utcnow().isoformat()})

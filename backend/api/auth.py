"""Firebase Authentication endpoints."""

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel

# Try Firebase auth, fall back to simple auth
try:
    from backend.auth.utils import get_current_user
    FIREBASE_AVAILABLE = True
except ImportError:
    FIREBASE_AVAILABLE = False
    from fastapi.security import HTTPBearer
    security = HTTPBearer(auto_error=False)
    async def get_current_user(credentials = Depends(security)):
        return {"uid": "test-user", "email": "test@example.com"}

router = APIRouter(prefix="/api/auth", tags=["authentication"])


class UserResponse(BaseModel):
    """User information response."""
    uid: str
    email: str | None = None
    name: str | None = None
    email_verified: bool = False


@router.get("/me", response_model=UserResponse)
async def get_current_user_info(current_user: dict = Depends(get_current_user)):
    """
    Get current authenticated user information.
    
    With Firebase: User must be authenticated with valid ID token.
    Without Firebase: Returns test user.
    """
    return UserResponse(
        uid=current_user["uid"],
        email=current_user.get("email"),
        name=current_user.get("name"),
        email_verified=current_user.get("email_verified", False)
    )


@router.get("/status")
async def auth_status():
    """Check authentication system status."""
    return {
        "firebase_enabled": FIREBASE_AVAILABLE,
        "auth_type": "firebase" if FIREBASE_AVAILABLE else "development",
        "message": "Firebase Authentication active" if FIREBASE_AVAILABLE else "Development mode - no authentication required"
    }

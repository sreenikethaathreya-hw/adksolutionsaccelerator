"""
User service using Google Cloud Firestore
"""
from google.cloud import firestore
from typing import Optional, Dict, Any
import os
import logging
from auth import get_password_hash, verify_password

logger = logging.getLogger(__name__)

# Initialize Firestore
PROJECT_ID = os.getenv("GOOGLE_CLOUD_PROJECT", "adksolutionsaccelerator")
db = firestore.Client(project=PROJECT_ID)


class UserService:
    """Service for managing users in Firestore"""
    
    COLLECTION = "users"
    
    @staticmethod
    def create_user(email: str, password: str, name: str) -> Dict[str, Any]:
        """
        Create a new user
        
        Args:
            email: User email (must be unique)
            password: Plain text password (will be hashed)
            name: User's display name
        
        Returns:
            User data dictionary
        
        Raises:
            ValueError: If user already exists
        """
        from datetime import datetime
        
        # Check if user exists
        existing_user = UserService.get_user_by_email(email)
        if existing_user:
            raise ValueError("User with this email already exists")
        
        # Create user document
        user_ref = db.collection(UserService.COLLECTION).document()
        user_id = user_ref.id
        
        # Use actual datetime instead of SERVER_TIMESTAMP for return value
        now = datetime.utcnow().isoformat()
        
        user_data = {
            "id": user_id,
            "email": email.lower(),
            "hashed_password": get_password_hash(password),
            "name": name,
            "role": "user",
            "created_at": now,  # ← Changed to ISO string
            "updated_at": now,  # ← Changed to ISO string
            "connected_services": {
                "google": False,
                "salesforce": False,
                "sharepoint": False,
            }
        }
        
        user_ref.set(user_data)
        logger.info(f"Created user: {email}")
        
        # Return user data without password
        return UserService._sanitize_user_data(user_data)
    
    @staticmethod
    def get_user_by_email(email: str) -> Optional[Dict[str, Any]]:
        """Get user by email"""
        users_ref = db.collection(UserService.COLLECTION)
        query = users_ref.where("email", "==", email.lower()).limit(1)
        docs = query.stream()
        
        for doc in docs:
            return doc.to_dict()
        
        return None
    
    @staticmethod
    def get_user_by_id(user_id: str) -> Optional[Dict[str, Any]]:
        """Get user by ID"""
        doc_ref = db.collection(UserService.COLLECTION).document(user_id)
        doc = doc_ref.get()
        
        if doc.exists:
            return doc.to_dict()
        
        return None
    
    @staticmethod
    def authenticate_user(email: str, password: str) -> Optional[Dict[str, Any]]:
        """
        Authenticate user with email and password
        
        Returns:
            User data if authenticated, None otherwise
        """
        user = UserService.get_user_by_email(email)
        if not user:
            return None
        
        if not verify_password(password, user["hashed_password"]):
            return None
        
        return UserService._sanitize_user_data(user)
    
    @staticmethod
    def update_user(user_id: str, updates: Dict[str, Any]) -> bool:
        """Update user data"""
        from datetime import datetime
        
        try:
            doc_ref = db.collection(UserService.COLLECTION).document(user_id)
            updates["updated_at"] = datetime.utcnow().isoformat()  # ← Changed to ISO string
            doc_ref.update(updates)
            logger.info(f"Updated user: {user_id}")
            return True
        except Exception as e:
            logger.error(f"Failed to update user {user_id}: {e}")
            return False
    
    @staticmethod
    def _sanitize_user_data(user_data: Dict[str, Any]) -> Dict[str, Any]:
        """Remove sensitive data from user object"""
        sanitized = user_data.copy()
        sanitized.pop("hashed_password", None)
        return sanitized
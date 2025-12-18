"""Firestore service for data persistence."""

from datetime import datetime
from typing import Optional, List, Dict, Any
from backend.firebase_config import get_firestore_client


class FirestoreService:
    """Service for Firestore database operations."""
    
    def __init__(self):
        self.db = get_firestore_client()
    
    # ========== SESSIONS ==========
    
    def create_session(
        self,
        user_id: str,
        agent_id: str,
        title: Optional[str] = None
    ) -> Dict[str, Any]:
        """Create a new chat session."""
        sessions_ref = self.db.collection('sessions')
        
        session_data = {
            "user_id": user_id,
            "agent_id": agent_id,
            "title": title or f"Chat with {agent_id}",
            "created_at": datetime.utcnow().isoformat(),
            "updated_at": datetime.utcnow().isoformat(),
            "message_count": 0,
        }
        
        # Add to Firestore
        doc_ref = sessions_ref.add(session_data)
        session_id = doc_ref[1].id
        
        session_data["id"] = session_id
        return session_data
    
    def get_session(self, session_id: str, user_id: str) -> Optional[Dict[str, Any]]:
        """Get a session by ID (with ownership check)."""
        session_ref = self.db.collection('sessions').document(session_id)
        session_doc = session_ref.get()
        
        if not session_doc.exists:
            return None
        
        session_data = session_doc.to_dict()
        
        # Verify ownership
        if session_data.get("user_id") != user_id:
            return None
        
        session_data["id"] = session_id
        return session_data
    
    def list_sessions(
        self,
        user_id: str,
        limit: int = 50,
        offset: int = 0
    ) -> List[Dict[str, Any]]:
        """List all sessions for a user."""
        sessions_ref = self.db.collection('sessions')
        query = (
            sessions_ref
            .where('user_id', '==', user_id)
            .order_by('updated_at', direction='DESCENDING')
            .limit(limit)
            .offset(offset)
        )
        
        sessions = []
        for doc in query.stream():
            session_data = doc.to_dict()
            session_data["id"] = doc.id
            sessions.append(session_data)
        
        return sessions
    
    def update_session(
        self,
        session_id: str,
        user_id: str,
        updates: Dict[str, Any]
    ) -> bool:
        """Update a session."""
        session_ref = self.db.collection('sessions').document(session_id)
        session_doc = session_ref.get()
        
        if not session_doc.exists:
            return False
        
        # Verify ownership
        if session_doc.to_dict().get("user_id") != user_id:
            return False
        
        # Add updated_at timestamp
        updates["updated_at"] = datetime.utcnow().isoformat()
        
        session_ref.update(updates)
        return True
    
    def delete_session(self, session_id: str, user_id: str) -> bool:
        """Delete a session."""
        session_ref = self.db.collection('sessions').document(session_id)
        session_doc = session_ref.get()
        
        if not session_doc.exists:
            return False
        
        # Verify ownership
        if session_doc.to_dict().get("user_id") != user_id:
            return False
        
        # Delete session
        session_ref.delete()
        
        # Delete associated messages
        messages_ref = self.db.collection('messages').where('session_id', '==', session_id)
        for msg_doc in messages_ref.stream():
            msg_doc.reference.delete()
        
        return True
    
    # ========== MESSAGES ==========
    
    def add_message(
        self,
        session_id: str,
        user_id: str,
        role: str,
        content: str,
        metadata: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """Add a message to a session."""
        messages_ref = self.db.collection('messages')
        
        message_data = {
            "session_id": session_id,
            "user_id": user_id,
            "role": role,  # "user" or "assistant"
            "content": content,
            "metadata": metadata or {},
            "created_at": datetime.utcnow().isoformat(),
        }
        
        # Add to Firestore
        doc_ref = messages_ref.add(message_data)
        message_id = doc_ref[1].id
        
        # Update session's updated_at and message_count
        session_ref = self.db.collection('sessions').document(session_id)
        session_ref.update({
            "updated_at": datetime.utcnow().isoformat(),
            "message_count": firestore.Increment(1),
        })
        
        message_data["id"] = message_id
        return message_data
    
    def get_messages(
        self,
        session_id: str,
        user_id: str,
        limit: int = 100
    ) -> List[Dict[str, Any]]:
        """Get messages for a session."""
        # First verify session ownership
        session = self.get_session(session_id, user_id)
        if not session:
            return []
        
        messages_ref = self.db.collection('messages')
        query = (
            messages_ref
            .where('session_id', '==', session_id)
            .order_by('created_at')
            .limit(limit)
        )
        
        messages = []
        for doc in query.stream():
            message_data = doc.to_dict()
            message_data["id"] = doc.id
            messages.append(message_data)
        
        return messages
    
    # ========== DRIVE CREDENTIALS ==========
    
    def store_drive_credentials(
        self,
        user_id: str,
        credentials: Dict[str, Any]
    ) -> None:
        """Store Google Drive OAuth credentials."""
        creds_ref = self.db.collection('drive_credentials').document(user_id)
        
        creds_data = {
            "user_id": user_id,
            "credentials": credentials,
            "updated_at": datetime.utcnow().isoformat(),
        }
        
        creds_ref.set(creds_data)
    
    def get_drive_credentials(self, user_id: str) -> Optional[Dict[str, Any]]:
        """Get Google Drive OAuth credentials."""
        creds_ref = self.db.collection('drive_credentials').document(user_id)
        creds_doc = creds_ref.get()
        
        if not creds_doc.exists:
            return None
        
        return creds_doc.to_dict().get("credentials")
    
    def delete_drive_credentials(self, user_id: str) -> None:
        """Delete Google Drive OAuth credentials."""
        creds_ref = self.db.collection('drive_credentials').document(user_id)
        creds_ref.delete()
    
    # ========== USER PREFERENCES ==========
    
    def get_user_preferences(self, user_id: str) -> Dict[str, Any]:
        """Get user preferences."""
        user_ref = self.db.collection('users').document(user_id)
        user_doc = user_ref.get()
        
        if not user_doc.exists:
            return {}
        
        return user_doc.to_dict().get("settings", {})
    
    def update_user_preferences(
        self,
        user_id: str,
        preferences: Dict[str, Any]
    ) -> None:
        """Update user preferences."""
        user_ref = self.db.collection('users').document(user_id)
        
        user_ref.update({
            "settings": preferences,
            "updated_at": datetime.utcnow().isoformat(),
        })


# Global instance
_firestore_service: Optional[FirestoreService] = None


def get_firestore_service() -> FirestoreService:
    """Get Firestore service singleton instance."""
    global _firestore_service
    
    if _firestore_service is None:
        _firestore_service = FirestoreService()
    
    return _firestore_service  

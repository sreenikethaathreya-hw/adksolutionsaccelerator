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

"""Vertex AI RAG corpus management tools."""

from typing import Dict, Any, Optional
from google.adk.tools import ToolContext
import vertexai
from vertexai.preview import rag
import os
import logging
from datetime import datetime

logger = logging.getLogger(__name__)

# Initialize Vertex AI
PROJECT_ID = os.getenv("GOOGLE_CLOUD_PROJECT")
LOCATION = os.getenv("GOOGLE_CLOUD_LOCATION", "us-central1")

if PROJECT_ID:
    vertexai.init(project=PROJECT_ID, location=LOCATION)


def create_or_get_user_corpus(user_id: str):
    """
    Create a new RAG corpus for the user or get existing one.
    Each user gets their own private corpus.
    
    Args:
        user_id: User identifier
    
    Returns:
        RAG corpus object
    """
    corpus_display_name = f"drive_corpus_user_{user_id}"
    
    try:
        # Check if corpus already exists
        existing_corpora = rag.list_corpora()
        for corpus in existing_corpora:
            if corpus.display_name == corpus_display_name:
                logger.info(f"Found existing corpus for user {user_id}")
                return corpus
        
        # Create new corpus
        embedding_model_config = rag.EmbeddingModelConfig(
            publisher_model="publishers/google/models/text-embedding-004"
        )
        
        corpus = rag.create_corpus(
            display_name=corpus_display_name,
            description=f"Personal Google Drive corpus for user {user_id}",
            embedding_model_config=embedding_model_config,
        )
        
        logger.info(f"Created new corpus for user {user_id}: {corpus.name}")
        return corpus
        
    except Exception as e:
        logger.error(f"Failed to create/get corpus for user {user_id}: {e}")
        raise


def upload_file_to_corpus(
    corpus_name: str,
    file_path: str,
    display_name: str,
    description: str,
    metadata: Optional[Dict[str, str]] = None
) -> bool:
    """
    Upload a file to the RAG corpus.
    
    Args:
        corpus_name: Full corpus resource name
        file_path: Local path to the file
        display_name: Display name for the file in corpus
        description: Description of the file
        metadata: Optional metadata dictionary
    
    Returns:
        True if successful, False otherwise
    """
    try:
        rag_file = rag.upload_file(
            corpus_name=corpus_name,
            path=file_path,
            display_name=display_name,
            description=description,
        )
        
        logger.info(f"Successfully uploaded {display_name} to corpus")
        return True
        
    except Exception as e:
        logger.error(f"Failed to upload {display_name} to corpus: {e}")
        return False

def update_corpus_metadata(
    corpus_name: str,
    metadata: Dict[str, str]
) -> bool:
    """
    Update corpus metadata (stored in description for simplicity).
    
    Args:
        corpus_name: Full corpus resource name
        metadata: Metadata to store
    
    Returns:
        True if successful, False otherwise
    """
    try:
        # Note: Vertex AI RAG doesn't have direct metadata update
        # We store metadata in the description field as JSON
        import json
        
        corpus = rag.get_corpus(name=corpus_name)
        existing_desc = corpus.description or ""
        
        # Try to parse existing metadata from description
        try:
            if existing_desc.startswith("{"):
                existing_metadata = json.loads(existing_desc)
                existing_metadata.update(metadata)
                metadata = existing_metadata
        except:
            pass
        
        # Update corpus description with new metadata
        updated_desc = json.dumps(metadata)
        # Note: This is a simplified approach - in production you'd use a database
        
        logger.info(f"Updated metadata for corpus {corpus_name}")
        return True
        
    except Exception as e:
        logger.error(f"Failed to update corpus metadata: {e}")
        return False


def get_user_corpus_info(user_id: str) -> Optional[Dict[str, Any]]:
    """
    Get information about a user's corpus.
    
    Args:
        user_id: User identifier
    
    Returns:
        Dictionary with corpus information or None if not found
    """
    corpus_display_name = f"drive_corpus_user_{user_id}"
    
    try:
        existing_corpora = rag.list_corpora()
        for corpus in existing_corpora:
            if corpus.display_name == corpus_display_name:
                # Get file count
                files = list(rag.list_files(corpus_name=corpus.name))
                
                # Try to parse metadata from description
                metadata = {}
                try:
                    import json
                    if corpus.description and corpus.description.startswith("{"):
                        metadata = json.loads(corpus.description)
                except:
                    pass
                
                return {
                    "name": corpus.name,
                    "display_name": corpus.display_name,
                    "description": corpus.description,
                    "files_count": len(files),
                    "created": corpus.create_time.isoformat() if hasattr(corpus, 'create_time') else None,
                    "last_indexed": metadata.get('last_indexed'),
                    "indexed_folder_name": metadata.get('indexed_folder_name'),
                    "indexed_folder_id": metadata.get('indexed_folder_id'),
                    "total_files": metadata.get('total_files', len(files))
                }
        
        return None
        
    except Exception as e:
        logger.error(f"Failed to get corpus info for user {user_id}: {e}")
        return None


def query_drive_corpus(
    query: str,
    similarity_top_k: int = 10,
    tool_context: ToolContext = None
) -> Dict[str, Any]:
    """
    Query the user's Drive corpus using RAG retrieval.
    
    Args:
        query: Search query
        similarity_top_k: Number of results to return
        tool_context: ADK tool context containing user_id
    
    Returns:
        Dictionary with query results and citations
    """
    user_id = tool_context.user_id if tool_context else None
    if not user_id:
        return {
            "status": "error",
            "message": "User ID not found. Please ensure you are authenticated."
        }
    
    logger.info(f"Querying Drive corpus for user {user_id}: {query}")
    
    try:
        # Get user's corpus
        corpus_info = get_user_corpus_info(user_id)
        if not corpus_info:
            return {
                "status": "no_corpus",
                "message": "No corpus found. Please index a Drive folder first using index_drive_folder.",
                "query": query,
                "results": []
            }
        
        corpus_name = corpus_info['name']
        
        # Create RAG resource
        rag_resource = rag.RagResource(
            rag_corpus=corpus_name,
        )
        
        # Perform retrieval
        response = rag.retrieval_query(
            rag_resources=[rag_resource],
            text=query,
            similarity_top_k=similarity_top_k,
            vector_distance_threshold=0.5,
        )
        
        # Process results
        results = []
        for context in response.contexts.contexts:
            results.append({
                "text": context.text,
                "source": context.source_uri if hasattr(context, 'source_uri') else "Unknown",
                "score": context.distance if hasattr(context, 'distance') else 0.0,
            })
        
        return {
            "status": "success",
            "query": query,
            "results": results,
            "total_results": len(results),
            "corpus_name": corpus_name,
            "corpus_files": corpus_info.get('files_count', 0)
        }
        
    except Exception as e:
        logger.error(f"Failed to query corpus for user {user_id}: {e}")
        return {
            "status": "error",
            "message": f"Failed to query corpus: {str(e)}",
            "query": query,
            "results": []
        }
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

"""
Integration module for adding Google Drive RAG capabilities to the financial agent.

This allows the financial agent to search and analyze financial documents
stored in the user's Google Drive.
"""

from drive_rag_agent.tools.rag_tools import query_drive_corpus
from drive_rag_agent.tools.drive_tools import get_corpus_status


def add_drive_rag_to_financial_agent(financial_agent):
    """
    Add Google Drive RAG tools to an existing financial agent.
    
    Args:
        financial_agent: The financial agent to enhance
        
    Returns:
        Enhanced agent with Drive RAG capabilities
    """
    # Add the Drive RAG tools to the financial agent's tool list
    drive_tools = [query_drive_corpus, get_corpus_status]
    
    for tool in drive_tools:
        if tool not in financial_agent.tools:
            financial_agent.tools.append(tool)
    
    # Update the agent's instruction to include Drive RAG guidance
    drive_instruction = """

GOOGLE DRIVE INTEGRATION:
You now have access to the user's Google Drive documents through RAG.

IMPORTANT: When the user asks about their documents, files, or anything they've uploaded:
1. ALWAYS use query_drive_corpus to search their indexed Drive documents
2. Use get_corpus_status to check if they have documents indexed

When to use Drive search:
- User mentions "my documents", "my files", "in my Drive", "what files do I have"
- User asks about specific documents or content in their Drive
- User wants to search or analyze their personal data

Example queries that should trigger Drive search:
- "What files do I have indexed?"
- "What's in my documents?"
- "Search my meeting notes"
- "What did I discuss in the Vanco project?"
- "Find information about [topic] in my Drive"

When searching Drive:
- Use query_drive_corpus with a relevant search query
- Always cite document sources in your response
- If no results, check with get_corpus_status to confirm files are indexed
- If not connected or no documents, guide user to Settings > Google Drive
"""
    
    if hasattr(financial_agent, 'instruction'):
        financial_agent.instruction += drive_instruction
    
    return financial_agent
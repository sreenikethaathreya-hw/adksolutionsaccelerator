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

"""Google Drive RAG Agent: Query documents from user's Google Drive folders."""

import os
from google.adk.agents import LlmAgent
from dotenv import load_dotenv
from . import prompts
from .tools import (
    drive_tools,
    rag_tools,
)

load_dotenv()

MODEL = "gemini-2.0-flash-001"

# Main Drive RAG Agent
drive_rag_agent = LlmAgent(
    name="drive_rag_agent",
    model=MODEL,
    description="Retrieves and analyzes documents from user's Google Drive folders using RAG",
    instruction=prompts.DRIVE_RAG_AGENT_PROMPT,
    output_key="drive_rag_response",
    tools=[
        drive_tools.list_drive_folders,
        drive_tools.index_drive_folder,
        drive_tools.get_corpus_status,
        rag_tools.query_drive_corpus,
    ],
)

# Export as root_agent for standalone deployment
root_agent = drive_rag_agent
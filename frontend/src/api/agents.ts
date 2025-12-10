import apiClient from './client';

export interface Agent {
  id: string;
  name: string;
  description: string;
  tags: string[];
  icon?: string;
}

export interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  metadata?: any;
}

export interface Session {
  id: string;
  user_id: string;
  agent_id: string;
  created_at: string;
  updated_at: string;
  state?: any;
}

// Get all available agents
export const getAgents = async (): Promise<Agent[]> => {
  const response = await apiClient.get('/agents');
  return response.data;
};

// Get specific agent details
export const getAgent = async (agentId: string): Promise<Agent> => {
  const response = await apiClient.get(`/agents/${agentId}`);
  return response.data;
};

// Create new session
export const createSession = async (
  userId: string,
  agentId: string = 'financial_agent'
): Promise<Session> => {
  const response = await apiClient.post('/sessions', {
    user_id: userId,
    app_name: agentId,
  });
  return response.data;
};

// Send message to agent
export const sendMessage = async (
  sessionId: string,
  message: string
): Promise<ReadableStream> => {
  const response = await fetch(
    `${apiClient.defaults.baseURL}/agents/financial_agent/stream_query`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
      },
      body: JSON.stringify({
        session_id: sessionId,
        message: message,
      }),
    }
  );
  
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  
  return response.body!;
};

// Parse SSE stream
export async function* parseSSEStream(
  stream: ReadableStream
): AsyncGenerator<any> {
  const reader = stream.getReader();
  const decoder = new TextDecoder();
  let buffer = '';

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = line.slice(6);
          if (data === '[DONE]') continue;
          
          try {
            yield JSON.parse(data);
          } catch (e) {
            console.error('Failed to parse SSE data:', e);
          }
        }
      }
    }
  } finally {
    reader.releaseLock();
  }
}

// Get session history
export const getSessionHistory = async (
  sessionId: string
): Promise<Message[]> => {
  const response = await apiClient.get(`/sessions/${sessionId}/history`);
  return response.data;
};

// Delete session
export const deleteSession = async (sessionId: string): Promise<void> => {
  await apiClient.delete(`/sessions/${sessionId}`);
};
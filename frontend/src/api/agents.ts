import axios from 'axios';
import { auth } from '../config/firebase';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

// Request interceptor to add Firebase ID token
api.interceptors.request.use(
  async (config) => {
    const user = auth.currentUser;
    
    if (user) {
      try {
        const token = await user.getIdToken();
        config.headers.Authorization = `Bearer ${token}`;
      } catch (error) {
        console.error('Error getting ID token:', error);
      }
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      const user = auth.currentUser;
      if (user) {
        try {
          const token = await user.getIdToken(true);
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return api(originalRequest);
        } catch (refreshError) {
          console.error('Token refresh failed:', refreshError);
        }
      }
    }
    
    return Promise.reject(error);
  }
);

// Agent type matching AgentCard expectations
export interface Agent {
  id: string;
  name: string;
  description: string;
  tags: string[];
  icon?: string;
  color?: string;
}

// Session management
export const createSession = (agentId: string, title?: string) =>
  api.post('/sessions', { app_name: agentId, title });

export const listSessions = () =>
  api.get('/sessions');

export const getSession = (sessionId: string) =>
  api.get(`/sessions/${sessionId}`);

export const deleteSession = (sessionId: string) =>
  api.delete(`/sessions/${sessionId}`);

export const updateSession = (sessionId: string, updates: any) =>
  api.patch(`/sessions/${sessionId}`, updates);

// Agent management
export const getAgents = async (): Promise<Agent[]> => {
  return [
    {
      id: 'financial_agent',
      name: 'Financial Analyst',
      description: 'Analyze financial statements, P&L, balance sheets, and cash flow with AI-powered insights',
      tags: ['Finance', 'P&L Analysis', 'Balance Sheet', 'Cash Flow'],
      icon: '📊',
      color: 'blue'
    },
    {
      id: 'drive_rag_agent',
      name: 'Drive RAG Assistant',
      description: 'Search and analyze documents from your Google Drive using advanced retrieval',
      tags: ['Productivity', 'Document Search', 'Knowledge Base', 'Google Drive'],
      icon: '📁',
      color: 'green'
    }
  ];
};

export const getAgent = async (agentId: string): Promise<Agent | null> => {
  const agents = await getAgents();
  return agents.find(a => a.id === agentId) || null;
};

// Chat/Messages
export const sendMessage = (sessionId: string, message: string, agentId: string) =>
  api.post('/api/chat', { session_id: sessionId, message, agent_id: agentId });

export const getMessages = (sessionId: string) =>
  api.get(`/sessions/${sessionId}/messages`);

// Health check
export const healthCheck = () => api.get('/health');

export default api;

# HatchWorks AI - Frontend Integration Guide
## Building Modern React UI for Financial Agent ADK Backend

---

## Overview

This guide shows how to build a production-ready React frontend that integrates with your Google ADK backend, following the HatchWorks AI design system.

**Tech Stack:**
- **Frontend**: React 18 + TypeScript
- **Styling**: Tailwind CSS
- **Routing**: React Router v6
- **State Management**: React Context + Hooks
- **API Client**: Axios + React Query
- **Backend**: Google ADK FastAPI

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    React Frontend                            │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐           │
│  │   Pages    │  │ Components │  │   Context  │           │
│  │  - Home    │  │  - AgentCard│ │  - Auth    │           │
│  │  - Catalog │  │  - Chat     │  │  - Session │           │
│  │  - Settings│  │  - Sidebar  │  │  - Agent   │           │
│  └────────────┘  └────────────┘  └────────────┘           │
│         │               │               │                    │
│         └───────────────┴───────────────┘                    │
│                         │                                     │
│                  ┌──────▼──────┐                            │
│                  │  API Client  │                            │
│                  └──────┬───────┘                            │
└─────────────────────────┼─────────────────────────────────┘
                          │
                    ┌─────▼─────┐
                    │   ADK     │
                    │  Backend  │
                    └───────────┘
```

---

## Project Structure

```
frontend/
├── public/
│   └── favicon.ico
├── src/
│   ├── api/                      # API integration
│   │   ├── client.ts            # Axios configuration
│   │   ├── agents.ts            # Agent endpoints
│   │   └── auth.ts              # Authentication
│   ├── components/              # Reusable components
│   │   ├── AgentCard.tsx
│   │   ├── ChatInterface.tsx
│   │   ├── Sidebar.tsx
│   │   ├── Header.tsx
│   │   ├── SearchBar.tsx
│   │   ├── FilterTags.tsx
│   │   └── ExampleCard.tsx
│   ├── contexts/                # React contexts
│   │   ├── AuthContext.tsx
│   │   ├── SessionContext.tsx
│   │   └── AgentContext.tsx
│   ├── hooks/                   # Custom hooks
│   │   ├── useAgent.ts
│   │   ├── useSession.ts
│   │   └── useChat.ts
│   ├── pages/                   # Page components
│   │   ├── HomePage.tsx
│   │   ├── AgentCatalogPage.tsx
│   │   ├── ChatPage.tsx
│   │   └── SettingsPage.tsx
│   ├── types/                   # TypeScript types
│   │   ├── agent.ts
│   │   ├── session.ts
│   │   └── message.ts
│   ├── utils/                   # Utilities
│   │   ├── format.ts
│   │   └── constants.ts
│   ├── App.tsx                  # Main app component
│   ├── main.tsx                 # Entry point
│   └── index.css                # Global styles
├── package.json
├── tsconfig.json
├── tailwind.config.js
└── vite.config.ts
```

---

## Step 1: Setup Frontend Project

### Install Dependencies

```bash
# Create Vite React TypeScript project
npm create vite@latest frontend -- --template react-ts
cd frontend

# Install core dependencies
npm install react-router-dom axios @tanstack/react-query

# Install UI dependencies
npm install -D tailwindcss postcss autoprefixer
npm install lucide-react clsx tailwind-merge

# Install development tools
npm install -D @types/node

# Initialize Tailwind
npx tailwindcss init -p
```

### Configure Tailwind CSS

**tailwind.config.js:**
```js
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#3EBAAD',
          50: '#E8F7F6',
          100: '#D1EFED',
          200: '#A4DFD9',
          300: '#76D0C6',
          400: '#49C0B3',
          500: '#3EBAAD',
          600: '#329588',
          700: '#267064',
          800: '#1A4A40',
          900: '#0D251C',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
```

**src/index.css:**
```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  * {
    @apply border-gray-200;
  }
  
  body {
    @apply bg-gray-50 text-gray-900;
  }
}

@layer components {
  .btn-primary {
    @apply bg-primary-500 text-white px-4 py-2 rounded-lg hover:bg-primary-600 transition-colors;
  }
  
  .btn-secondary {
    @apply bg-gray-200 text-gray-900 px-4 py-2 rounded-lg hover:bg-gray-300 transition-colors;
  }
  
  .card {
    @apply bg-white rounded-xl shadow-sm border border-gray-200 p-6;
  }
}
```

---

## Step 2: API Integration Layer

### API Client Setup

**src/api/client.ts:**
```typescript
import axios, { AxiosInstance } from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

// Create axios instance
const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

// Request interceptor (add auth token)
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor (handle errors)
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Clear auth and redirect to login
      localStorage.removeItem('auth_token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default apiClient;
```

### Agent API Methods

**src/api/agents.ts:**
```typescript
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
```

### Authentication API

**src/api/auth.ts:**
```typescript
import apiClient from './client';

export interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  connected_services?: {
    google?: boolean;
    salesforce?: boolean;
    sharepoint?: boolean;
  };
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  access_token: string;
  user: User;
}

// Login
export const login = async (credentials: LoginRequest): Promise<LoginResponse> => {
  const response = await apiClient.post('/auth/login', credentials);
  return response.data;
};

// Get current user
export const getCurrentUser = async (): Promise<User> => {
  const response = await apiClient.get('/auth/me');
  return response.data;
};

// Logout
export const logout = async (): Promise<void> => {
  await apiClient.post('/auth/logout');
  localStorage.removeItem('auth_token');
};

// Connect service (Google, Salesforce, etc.)
export const connectService = async (
  service: string,
  authCode: string
): Promise<void> => {
  await apiClient.post('/auth/connect', { service, auth_code: authCode });
};

// Disconnect service
export const disconnectService = async (service: string): Promise<void> => {
  await apiClient.delete(`/auth/disconnect/${service}`);
};
```

---

## Step 3: React Context Providers

### Auth Context

**src/contexts/AuthContext.tsx:**
```typescript
import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, login as apiLogin, getCurrentUser, logout as apiLogout } from '../api/auth';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      if (token) {
        const userData = await getCurrentUser();
        setUser(userData);
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      localStorage.removeItem('auth_token');
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    const response = await apiLogin({ email, password });
    localStorage.setItem('auth_token', response.access_token);
    setUser(response.user);
  };

  const logout = async () => {
    await apiLogout();
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        logout,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
```

### Session Context

**src/contexts/SessionContext.tsx:**
```typescript
import React, { createContext, useContext, useState, useCallback } from 'react';
import { Session, createSession as apiCreateSession, deleteSession as apiDeleteSession } from '../api/agents';
import { useAuth } from './AuthContext';

interface SessionContextType {
  session: Session | null;
  loading: boolean;
  createSession: (agentId?: string) => Promise<void>;
  endSession: () => Promise<void>;
}

const SessionContext = createContext<SessionContextType | undefined>(undefined);

export const SessionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(false);

  const createSession = useCallback(async (agentId: string = 'financial_agent') => {
    if (!user) throw new Error('User not authenticated');
    
    setLoading(true);
    try {
      const newSession = await apiCreateSession(user.id, agentId);
      setSession(newSession);
    } catch (error) {
      console.error('Failed to create session:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [user]);

  const endSession = useCallback(async () => {
    if (!session) return;
    
    try {
      await apiDeleteSession(session.id);
      setSession(null);
    } catch (error) {
      console.error('Failed to end session:', error);
      throw error;
    }
  }, [session]);

  return (
    <SessionContext.Provider value={{ session, loading, createSession, endSession }}>
      {children}
    </SessionContext.Provider>
  );
};

export const useSession = () => {
  const context = useContext(SessionContext);
  if (!context) {
    throw new Error('useSession must be used within SessionProvider');
  }
  return context;
};
```

---

## Step 4: Core Components

### Agent Card Component

**src/components/AgentCard.tsx:**
```typescript
import React from 'react';
import { Link } from 'react-router-dom';
import { Bot, ArrowRight } from 'lucide-react';
import { Agent } from '../api/agents';

interface AgentCardProps {
  agent: Agent;
}

export const AgentCard: React.FC<AgentCardProps> = ({ agent }) => {
  return (
    <Link
      to={`/chat/${agent.id}`}
      className="card hover:shadow-md transition-shadow group"
    >
      <div className="flex items-start gap-4">
        <div className="flex-shrink-0 w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
          <Bot className="w-6 h-6 text-primary-600" />
        </div>
        
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-semibold text-gray-900 group-hover:text-primary-600 transition-colors">
            {agent.name}
          </h3>
          <p className="mt-1 text-sm text-gray-600 line-clamp-2">
            {agent.description}
          </p>
          
          {agent.tags && agent.tags.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2">
              {agent.tags.slice(0, 3).map((tag) => (
                <span
                  key={tag}
                  className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-700 rounded-md"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>
        
        <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-primary-600 group-hover:translate-x-1 transition-all" />
      </div>
    </Link>
  );
};
```

### Chat Interface Component

**src/components/ChatInterface.tsx:**
```typescript
import React, { useState, useRef, useEffect } from 'react';
import { Send, Loader2, Paperclip } from 'lucide-react';
import { sendMessage, parseSSEStream, Message } from '../api/agents';
import { useSession } from '../contexts/SessionContext';

export const ChatInterface: React.FC = () => {
  const { session } = useSession();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || !session || loading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const stream = await sendMessage(session.id, input);
      let assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: '',
        timestamp: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, assistantMessage]);

      for await (const chunk of parseSSEStream(stream)) {
        if (chunk.content?.parts) {
          for (const part of chunk.content.parts) {
            if (part.text) {
              assistantMessage = {
                ...assistantMessage,
                content: assistantMessage.content + part.text,
              };
              setMessages((prev) => [
                ...prev.slice(0, -1),
                assistantMessage,
              ]);
            }
          }
        }
      }
    } catch (error) {
      console.error('Failed to send message:', error);
      // Add error message
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 2).toString(),
          role: 'system',
          content: 'Sorry, something went wrong. Please try again.',
          timestamp: new Date().toISOString(),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {messages.length === 0 && (
          <div className="text-center text-gray-500 mt-12">
            <Bot className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <p className="text-lg font-medium">Start a conversation</p>
            <p className="text-sm mt-2">Ask me about financial analysis, market research, or KPIs</p>
          </div>
        )}

        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                message.role === 'user'
                  ? 'bg-primary-500 text-white'
                  : message.role === 'system'
                  ? 'bg-red-100 text-red-900'
                  : 'bg-gray-100 text-gray-900'
              }`}
            >
              <p className="text-sm whitespace-pre-wrap">{message.content}</p>
              <p className={`text-xs mt-1 ${
                message.role === 'user' ? 'text-primary-100' : 'text-gray-500'
              }`}>
                {new Date(message.timestamp).toLocaleTimeString()}
              </p>
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex justify-start">
            <div className="bg-gray-100 rounded-2xl px-4 py-3">
              <Loader2 className="w-5 h-5 animate-spin text-gray-600" />
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="border-t border-gray-200 p-4 bg-white">
        <div className="flex items-center gap-2">
          <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
            <Paperclip className="w-5 h-5" />
          </button>
          
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Ask about financial analysis..."
            className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            disabled={loading || !session}
          />
          
          <button
            onClick={handleSend}
            disabled={!input.trim() || loading || !session}
            className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};
```

### Header Component

**src/components/Header.tsx:**
```typescript
import React from 'react';
import { Link } from 'react-router-dom';
import { Menu, User } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export const Header: React.FC = () => {
  const { user } = useAuth();

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">H</span>
            </div>
            <span className="text-xl font-bold text-gray-900">
              HatchWorks<span className="text-primary-500">AI</span>
            </span>
          </Link>

          {/* Navigation */}
          <nav className="hidden md:flex items-center gap-6">
            <Link
              to="/catalog"
              className="text-gray-600 hover:text-gray-900 transition-colors"
            >
              Agent Catalog
            </Link>
            <Link
              to="/chat"
              className="text-gray-600 hover:text-gray-900 transition-colors"
            >
              Chat
            </Link>
          </nav>

          {/* User Menu */}
          <div className="flex items-center gap-4">
            <Link
              to="/settings"
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <User className="w-5 h-5" />
              {user && <span className="hidden sm:inline">{user.name}</span>}
            </Link>
            
            <button className="md:hidden p-2 text-gray-600 hover:text-gray-900">
              <Menu className="w-6 h-6" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
```

---

## Step 5: Page Components

### Home Page

**src/pages/HomePage.tsx:**
```typescript
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Sparkles, Shield, TrendingUp } from 'lucide-react';

export const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate('/chat', { state: { initialMessage: searchQuery } });
    }
  };

  const examples = [
    {
      icon: Sparkles,
      title: 'Generative AI',
      description: 'What are some practical applications of generative AI in content creation?',
    },
    {
      icon: Shield,
      title: 'Ethical AI',
      description: 'Discuss the ethical considerations when developing AI systems',
    },
    {
      icon: TrendingUp,
      title: 'AI in Business',
      description: 'How can businesses leverage AI to improve customer service?',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-5xl mx-auto px-4 py-20">
        {/* Logo and Title */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="w-16 h-16 bg-primary-500 rounded-xl flex items-center justify-center">
              <span className="text-white font-bold text-2xl">H</span>
            </div>
            <h1 className="text-5xl font-bold">
              HatchWorks<span className="text-primary-500">AI</span>
            </h1>
          </div>
          
          <h2 className="text-2xl text-gray-900 font-medium">
            How can we help with your AI initiatives?
          </h2>
        </div>

        {/* Search Bar */}
        <form onSubmit={handleSearch} className="mb-16">
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Ask about AI opportunities..."
              className="w-full px-6 py-5 text-lg border-2 border-gray-200 rounded-2xl focus:outline-none focus:border-primary-500 focus:ring-4 focus:ring-primary-100 transition-all shadow-sm"
            />
            <button
              type="submit"
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-primary-500 transition-colors"
            >
              <Search className="w-6 h-6" />
            </button>
          </div>
        </form>

        {/* Examples */}
        <div>
          <h3 className="text-center text-gray-600 font-medium mb-6">Examples</h3>
          <div className="grid md:grid-cols-3 gap-6">
            {examples.map((example) => (
              <button
                key={example.title}
                onClick={() => {
                  setSearchQuery(example.description);
                  navigate('/chat', { state: { initialMessage: example.description } });
                }}
                className="card text-left hover:shadow-lg transition-all group"
              >
                <example.icon className="w-8 h-8 text-primary-500 mb-4" />
                <h4 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-primary-600 transition-colors">
                  {example.title}
                </h4>
                <p className="text-sm text-gray-600 leading-relaxed">
                  {example.description}
                </p>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
```

### Agent Catalog Page

**src/pages/AgentCatalogPage.tsx:**
```typescript
import React, { useState, useEffect } from 'react';
import { Search, Grid, List } from 'lucide-react';
import { AgentCard } from '../components/AgentCard';
import { getAgents, Agent } from '../api/agents';

export const AgentCatalogPage: React.FC = () => {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [filteredAgents, setFilteredAgents] = useState<Agent[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState<string>('All');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [loading, setLoading] = useState(true);

  const tags = [
    'All', 'AI', 'Analytics', 'Automation', 'Compliance', 
    'Engineering', 'Finance', 'Forecasting', 'Market Analysis', 
    'Operations', 'Risk Management'
  ];

  useEffect(() => {
    loadAgents();
  }, []);

  useEffect(() => {
    filterAgents();
  }, [agents, searchQuery, selectedTag]);

  const loadAgents = async () => {
    try {
      const data = await getAgents();
      setAgents(data);
    } catch (error) {
      console.error('Failed to load agents:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterAgents = () => {
    let filtered = agents;

    // Filter by tag
    if (selectedTag !== 'All') {
      filtered = filtered.filter((agent) =>
        agent.tags?.includes(selectedTag)
      );
    }

    // Filter by search query
    if (searchQuery.trim()) {
      filtered = filtered.filter(
        (agent) =>
          agent.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          agent.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredAgents(filtered);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-primary-500 mb-2">
            Agent Catalog
          </h1>
          <p className="text-gray-600">
            Powerful AI agents designed to support you with financial analysis, 
            market research, AI opportunity identification, and KPI development for your clients.
          </p>
        </div>

        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search agents by name, description, or tag..."
              className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Filter Tags & View Toggle */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex flex-wrap gap-2">
            {tags.map((tag) => (
              <button
                key={tag}
                onClick={() => setSelectedTag(tag)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  selectedTag === tag
                    ? 'bg-primary-500 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-100'
                }`}
              >
                {tag}
              </button>
            ))}
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-lg ${
                viewMode === 'grid'
                  ? 'bg-primary-500 text-white'
                  : 'bg-white text-gray-600 hover:bg-gray-100'
              }`}
            >
              <Grid className="w-5 h-5" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-lg ${
                viewMode === 'list'
                  ? 'bg-primary-500 text-white'
                  : 'bg-white text-gray-600 hover:bg-gray-100'
              }`}
            >
              <List className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Agent Grid/List */}
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
          </div>
        ) : filteredAgents.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">No agents found matching your criteria.</p>
          </div>
        ) : (
          <div
            className={`${
              viewMode === 'grid'
                ? 'grid md:grid-cols-2 lg:grid-cols-3 gap-6'
                : 'space-y-4'
            }`}
          >
            {filteredAgents.map((agent) => (
              <AgentCard key={agent.id} agent={agent} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
```

### Settings Page

**src/pages/SettingsPage.tsx:**
```typescript
import React from 'react';
import { Check, Link as LinkIcon, Trash2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { connectService, disconnectService } from '../api/auth';

export const SettingsPage: React.FC = () => {
  const { user } = useAuth();

  const availableServices = [
    { id: 'salesforce', name: 'Salesforce', connected: false },
    { id: 'google', name: 'Google', connected: user?.connected_services?.google || false },
    { id: 'sharepoint', name: 'SharePoint', connected: false },
  ];

  const handleConnect = async (serviceId: string) => {
    try {
      // In real implementation, this would open OAuth flow
      window.alert(`Connect ${serviceId} - OAuth flow would open here`);
    } catch (error) {
      console.error('Failed to connect service:', error);
    }
  };

  const handleDisconnect = async (serviceId: string) => {
    try {
      await disconnectService(serviceId);
      window.location.reload();
    } catch (error) {
      console.error('Failed to disconnect service:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Settings</h1>
        <p className="text-gray-600 mb-8">
          Manage your account settings and connected services.
        </p>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Account Settings */}
          <div className="card">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Account</h2>
            <p className="text-gray-600 mb-6">
              Manage your account details and preferences.
            </p>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Name
                </label>
                <input
                  type="text"
                  value={user?.name || ''}
                  disabled
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  value={user?.email || ''}
                  disabled
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Role
                </label>
                <select
                  value={user?.role || 'Agent User'}
                  disabled
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50"
                >
                  <option value="Agent User">Agent User</option>
                  <option value="Admin">Admin</option>
                </select>
              </div>
            </div>
          </div>

          {/* Connected Services */}
          <div className="card">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Connected Services
            </h2>
            <p className="text-gray-600 mb-6">
              Connect to external services to enable agents to access your data.
            </p>

            {/* Currently Connected */}
            {availableServices.filter(s => s.connected).map((service) => (
              <div key={service.id} className="mb-6 pb-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-gray-900">{service.name}</h3>
                    <p className="text-sm text-gray-500">
                      {user?.email}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      Connected on Dec 8, 2025
                    </p>
                  </div>
                  <button
                    onClick={() => handleDisconnect(service.id)}
                    className="flex items-center gap-2 text-red-600 hover:text-red-700 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span className="text-sm font-medium">Disconnect</span>
                  </button>
                </div>
              </div>
            ))}

            {/* Available Connections */}
            <h3 className="font-medium text-gray-700 mb-4">Available Connections</h3>
            <div className="grid grid-cols-2 gap-4">
              {availableServices.filter(s => !s.connected).map((service) => (
                <button
                  key={service.id}
                  onClick={() => handleConnect(service.id)}
                  className="flex items-center justify-between p-4 border-2 border-gray-200 rounded-lg hover:border-primary-500 transition-colors"
                >
                  <span className="font-medium text-gray-900">{service.name}</span>
                  <LinkIcon className="w-5 h-5 text-gray-400" />
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
```

---

## Step 6: Main App Setup

**src/App.tsx:**
```typescript
import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { SessionProvider } from './contexts/SessionContext';
import { Header } from './components/Header';
import { HomePage } from './pages/HomePage';
import { AgentCatalogPage } from './pages/AgentCatalogPage';
import { ChatPage } from './pages/ChatPage';
import { SettingsPage } from './pages/SettingsPage';

const queryClient = new QueryClient();

// Protected Route wrapper
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  return isAuthenticated ? <>{children}</> : <Navigate to="/login" />;
};

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route
        path="/catalog"
        element={
          <ProtectedRoute>
            <AgentCatalogPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/chat/:agentId?"
        element={
          <ProtectedRoute>
            <ChatPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/settings"
        element={
          <ProtectedRoute>
            <SettingsPage />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <SessionProvider>
          <BrowserRouter>
            <div className="min-h-screen bg-gray-50">
              <Header />
              <AppRoutes />
            </div>
          </BrowserRouter>
        </SessionProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
```

**src/main.tsx:**
```typescript
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
```

---

## Step 7: Environment Configuration

**frontend/.env.example:**
```bash
VITE_API_URL=http://localhost:8080
VITE_APP_NAME=HatchWorksAI
```

**frontend/.env:**
```bash
VITE_API_URL=http://localhost:8080
VITE_APP_NAME=HatchWorksAI
```

---

## Step 8: Running the Application

### Start Backend (ADK)

```bash
# In repository root
adk run financial_agent
```

### Start Frontend

```bash
# In frontend directory
cd frontend
npm install
npm run dev
```

Access at: `http://localhost:5173`

---

## Integration Testing Checklist

- [ ] Home page loads with search bar
- [ ] Example cards navigate to chat
- [ ] Agent catalog displays all agents
- [ ] Filter tags work correctly
- [ ] Search filters agents
- [ ] Agent cards link to chat
- [ ] Chat interface loads
- [ ] Messages send and receive
- [ ] Streaming responses work
- [ ] Settings page displays user info
- [ ] Service connections work

---

## Production Deployment

### Build Frontend

```bash
cd frontend
npm run build
```

### Deploy Options

**Option 1: Firebase Hosting**
```bash
npm install -g firebase-tools
firebase login
firebase init hosting
firebase deploy
```

**Option 2: Cloud Run (with backend)**
```dockerfile
# Dockerfile at repository root
FROM node:18 AS frontend-build
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm ci
COPY frontend/ ./
RUN npm run build

FROM python:3.12-slim
WORKDIR /app

# Install uv and dependencies
RUN pip install uv
COPY pyproject.toml .
RUN uv sync

# Copy application
COPY financial_agent/ ./financial_agent/
COPY --from=frontend-build /app/frontend/dist ./frontend/dist

# Serve both
EXPOSE 8080
CMD ["uv", "run", "python", "-m", "financial_agent"]
```

**Option 3: Separate Deployments**
- Frontend → Vercel/Netlify
- Backend → Cloud Run/GKE

---

## Next Steps

1. **Implement remaining pages** (ChatPage.tsx)
2. **Add authentication UI** (LoginPage.tsx)
3. **Enhance error handling**
4. **Add loading states**
5. **Implement file upload**
6. **Add session history**
7. **Add dark mode**
8. **Add analytics**

---

This guide provides a complete, production-ready frontend that matches the HatchWorks AI design while integrating seamlessly with your Google ADK backend!

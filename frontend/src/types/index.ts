/**
 * Agent Types
 */
export interface Agent {
  id: string;
  name: string;
  description: string;
  tags: string[];
  icon?: string;
  capabilities?: string[];
  complexity?: 'simple' | 'moderate' | 'complex';
}

/**
 * Message Types
 */
export type MessageRole = 'user' | 'assistant' | 'system';

export interface Message {
  id: string;
  role: MessageRole;
  content: string;
  timestamp: string;
  metadata?: MessageMetadata;
}

export interface MessageMetadata {
  tool_calls?: ToolCall[];
  tokens?: number;
  model?: string;
  [key: string]: any;
}

/**
 * Tool Call Types
 */
export interface ToolCall {
  id: string;
  type: string;
  function: {
    name: string;
    arguments: string;
  };
}

/**
 * Session Types
 */
export interface Session {
  id: string;
  user_id: string;
  agent_id: string;
  created_at: string;
  updated_at: string;
  state?: SessionState;
  metadata?: Record<string, any>;
}

export interface SessionState {
  messages?: Message[];
  context?: Record<string, any>;
  [key: string]: any;
}

/**
 * User Types
 */
export interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  avatar?: string;
  connected_services?: ConnectedServices;
  preferences?: UserPreferences;
  created_at?: string;
  updated_at?: string;
}

export interface ConnectedServices {
  google?: boolean;
  salesforce?: boolean;
  sharepoint?: boolean;
  [key: string]: boolean | undefined;
}

export interface UserPreferences {
  theme?: 'light' | 'dark';
  language?: string;
  notifications?: boolean;
  [key: string]: any;
}

/**
 * Authentication Types
 */
export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  access_token: string;
  refresh_token?: string;
  user: User;
  expires_in?: number;
}

export interface AuthError {
  message: string;
  code?: string;
}

/**
 * API Response Types
 */
export interface ApiResponse<T = any> {
  data: T;
  message?: string;
  status: number;
}

export interface ApiError {
  message: string;
  code?: string;
  status?: number;
  details?: any;
}

/**
 * SSE Stream Types
 */
export interface SSEChunk {
  type: 'content' | 'tool_call' | 'error' | 'done';
  content?: {
    parts: Array<{
      text?: string;
      [key: string]: any;
    }>;
  };
  tool_calls?: ToolCall[];
  error?: string;
}

/**
 * Service Connection Types
 */
export interface ServiceConnection {
  id: string;
  name: string;
  connected: boolean;
  connected_email?: string;
  connected_at?: string;
  scopes?: string[];
}

/**
 * Filter Types
 */
export interface FilterState {
  searchQuery: string;
  selectedTags: string[];
  sortBy?: 'name' | 'recent' | 'popular';
}

/**
 * View Mode Types
 */
export type ViewMode = 'grid' | 'list';

/**
 * Navigation State Types
 */
export interface NavigationState {
  initialMessage?: string;
  returnTo?: string;
}

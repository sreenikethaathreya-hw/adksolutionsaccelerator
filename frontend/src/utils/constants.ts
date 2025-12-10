/**
 * Application Constants
 */

export const APP_NAME = 'HatchWorksAI';
export const APP_DESCRIPTION = 'AI-powered financial analysis and market research platform';

/**
 * API Configuration
 */
export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';
export const API_TIMEOUT = 30000; // 30 seconds

/**
 * Agent IDs
 */
export const AGENT_IDS = {
  FINANCIAL: 'financial_agent',
  MARKET: 'market_agent',
  AI_OPPORTUNITY: 'ai_opportunity_agent',
  KPI: 'kpi_agent',
} as const;

/**
 * Agent Information
 */
export const AGENTS = [
  {
    id: AGENT_IDS.FINANCIAL,
    name: 'Financial Insights Agent',
    description: 'Reviews monthly financials (P&L, cash flow, balance sheet) and provides actionable insights',
    tags: ['Finance', 'Analytics', 'Forecasting'],
    icon: '💰',
  },
  {
    id: AGENT_IDS.MARKET,
    name: 'Market Research Agent',
    description: 'Monitors industry-specific news, trends, tariffs, and competitive landscape',
    tags: ['Market Analysis', 'Research', 'Competition'],
    icon: '📊',
  },
  {
    id: AGENT_IDS.AI_OPPORTUNITY,
    name: 'AI Opportunity Agent',
    description: 'Uses the AI Opportunity Finder framework to identify AI implementation opportunities',
    tags: ['AI', 'Automation', 'Innovation'],
    icon: '🤖',
  },
  {
    id: AGENT_IDS.KPI,
    name: 'KPI & Indicators Agent',
    description: 'Produces 5 concrete leading and lagging indicators tailored to each client',
    tags: ['Analytics', 'KPI', 'Performance'],
    icon: '📈',
  },
];

/**
 * Filter Tags
 */
export const FILTER_TAGS = [
  'All',
  'AI',
  'Analytics',
  'Automation',
  'Competition',
  'Compliance',
  'Engineering',
  'Finance',
  'Forecasting',
  'Innovation',
  'KPI',
  'Market Analysis',
  'Operations',
  'Performance',
  'Research',
  'Risk Management',
] as const;

/**
 * Connected Services
 */
export const CONNECTED_SERVICES = {
  GOOGLE: 'google',
  SALESFORCE: 'salesforce',
  SHAREPOINT: 'sharepoint',
} as const;

/**
 * User Roles
 */
export const USER_ROLES = {
  AGENT_USER: 'Agent User',
  ADMIN: 'Admin',
} as const;

/**
 * Local Storage Keys
 */
export const STORAGE_KEYS = {
  AUTH_TOKEN: 'auth_token',
  USER_PREFERENCES: 'user_preferences',
  THEME: 'theme',
} as const;

/**
 * Routes
 */
export const ROUTES = {
  HOME: '/',
  CATALOG: '/catalog',
  CHAT: '/chat',
  CHAT_WITH_AGENT: (agentId: string) => `/chat/${agentId}`,
  SETTINGS: '/settings',
  LOGIN: '/login',
} as const;

/**
 * Example Queries
 */
export const EXAMPLE_QUERIES = [
  {
    title: 'Generative AI',
    description: 'What are some practical applications of generative AI in content creation?',
    icon: 'sparkles',
  },
  {
    title: 'Ethical AI',
    description: 'Discuss the ethical considerations when developing AI systems',
    icon: 'shield',
  },
  {
    title: 'AI in Business',
    description: 'How can businesses leverage AI to improve customer service?',
    icon: 'trending-up',
  },
];

/**
 * Message Types
 */
export const MESSAGE_ROLES = {
  USER: 'user',
  ASSISTANT: 'assistant',
  SYSTEM: 'system',
} as const;

/**
 * Session States
 */
export const SESSION_STATES = {
  IDLE: 'idle',
  CONNECTING: 'connecting',
  CONNECTED: 'connected',
  ERROR: 'error',
} as const;

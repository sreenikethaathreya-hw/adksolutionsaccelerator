# HatchWorks AI - Frontend Quick Start

Complete React + TypeScript frontend implementation matching the HatchWorks AI design system.

## 📁 Project Structure

```
frontend/
├── public/
│   └── favicon.ico
├── src/
│   ├── api/                      # API integration layer
│   │   ├── client.ts            # Axios client configuration
│   │   ├── agents.ts            # Agent API methods
│   │   └── auth.ts              # Authentication API
│   ├── components/              # Reusable React components
│   │   ├── AgentCard.tsx        # Agent catalog card
│   │   ├── ChatInterface.tsx    # Main chat component
│   │   ├── Header.tsx           # App header with navigation
│   │   └── [others from guide]
│   ├── contexts/                # React Context providers
│   │   ├── AuthContext.tsx      # Authentication state
│   │   ├── SessionContext.tsx   # Agent session management
│   │   └── AgentContext.tsx     # Agent catalog state
│   ├── pages/                   # Page components
│   │   ├── HomePage.tsx         # Landing page with search
│   │   ├── AgentCatalogPage.tsx # Agent listing and filtering
│   │   ├── ChatPage.tsx         # Chat interface
│   │   └── SettingsPage.tsx     # User settings and connections
│   ├── types/                   # TypeScript type definitions
│   │   └── index.ts             # All type definitions
│   ├── utils/                   # Utility functions
│   │   ├── helpers.ts           # Helper utilities
│   │   └── constants.ts         # App constants
│   ├── App.tsx                  # Root app component
│   ├── main.tsx                 # Entry point
│   └── index.css                # Global styles + Tailwind
├── .env.example                 # Environment variables template
├── package.json                 # Dependencies
├── tsconfig.json                # TypeScript configuration
├── vite.config.ts               # Vite bundler configuration
└── tailwind.config.js           # Tailwind CSS configuration
```

## 🚀 Quick Start (5 Minutes)

### Step 1: Copy Files

```bash
# Navigate to your repository
cd /path/to/your/repository

# Copy all frontend files
cp -r /mnt/user-data/outputs/frontend-implementation/* .
```

### Step 2: Install Dependencies

```bash
cd frontend
npm install
```

### Step 3: Configure Environment

```bash
# Copy environment template
cp .env.example .env

# Edit .env file
nano .env
```

**.env:**
```bash
VITE_API_URL=http://localhost:8080
VITE_APP_NAME=HatchWorksAI
```

### Step 4: Start Development Server

```bash
npm run dev
```

Access at: **http://localhost:5173**

## 🔧 Available Scripts

```bash
# Development server with hot reload
npm run dev

# Type checking
npm run type-check

# Build for production
npm run build

# Preview production build
npm run preview

# Lint code
npm run lint
```

## 🎨 Design System

### Colors

The frontend uses a primary teal/turquoise color palette:

```css
primary-50:  #E8F7F6  (lightest)
primary-100: #D1EFED
primary-200: #A4DFD9
primary-300: #76D0C6
primary-400: #49C0B3
primary-500: #3EBAAD  (main brand color)
primary-600: #329588
primary-700: #267064
primary-800: #1A4A40
primary-900: #0D251C  (darkest)
```

### Typography

- **Font Family**: Inter (loaded from Google Fonts)
- **Headings**: Bold, varying sizes
- **Body Text**: Regular weight, 15px base size

### Components

All components follow consistent patterns:
- Cards with rounded-xl borders
- Hover states with shadow transitions
- Primary teal accent color
- Clean, minimal spacing

## 🔌 Backend Integration

### API Client Configuration

The frontend is configured to work with your ADK backend:

**Endpoints expected:**
```typescript
POST   /sessions                 # Create session
GET    /sessions/:id/history     # Get message history
DELETE /sessions/:id             # Delete session
POST   /agents/:agent_id/stream_query  # Send message (SSE stream)
GET    /agents                   # List available agents
GET    /agents/:id               # Get agent details
POST   /auth/login               # User login
GET    /auth/me                  # Get current user
POST   /auth/logout              # Logout
POST   /auth/connect             # Connect service
DELETE /auth/disconnect/:service # Disconnect service
```

### SSE Streaming

The chat interface uses Server-Sent Events (SSE) for real-time streaming:

```typescript
// Example SSE response format
data: {"content": {"parts": [{"text": "Hello"}]}}
data: {"content": {"parts": [{"text": " World"}]}}
data: [DONE]
```

## 📦 Key Features

### ✅ Implemented

- [x] Landing page with search and examples
- [x] Agent catalog with filtering and search
- [x] Real-time chat interface with SSE streaming
- [x] Session management
- [x] User authentication
- [x] Settings page with service connections
- [x] Responsive design (mobile-friendly)
- [x] Loading states and error handling
- [x] TypeScript type safety
- [x] Tailwind CSS styling

### 🔄 To Implement (Optional Enhancements)

- [ ] File upload support
- [ ] Session history sidebar
- [ ] Dark mode toggle
- [ ] Analytics integration
- [ ] Real OAuth flows (Google, Salesforce, SharePoint)
- [ ] Keyboard shortcuts
- [ ] Message reactions
- [ ] Export chat transcripts
- [ ] Voice input
- [ ] Multi-language support

## 🎯 Component Usage Examples

### Using the Chat Interface

```typescript
import { ChatInterface } from '../components/ChatInterface';

// Basic usage
<ChatInterface />

// With initial message
<ChatInterface initialMessage="Analyze our Q4 financials" />
```

### Using the Agent Card

```typescript
import { AgentCard } from '../components/AgentCard';

const agent = {
  id: 'financial_agent',
  name: 'Financial Insights Agent',
  description: 'Reviews monthly financials...',
  tags: ['Finance', 'Analytics'],
};

<AgentCard agent={agent} />
```

### Using Contexts

```typescript
import { useAuth } from '../contexts/AuthContext';
import { useSession } from '../contexts/SessionContext';

function MyComponent() {
  const { user, login, logout } = useAuth();
  const { session, createSession } = useSession();

  // Use auth and session state
}
```

## 🔐 Authentication Flow

The frontend implements a complete authentication flow:

1. **Login**: User enters credentials → API validates → Token stored
2. **Token Storage**: Access token in localStorage
3. **Auto-refresh**: Axios interceptor adds token to requests
4. **401 Handling**: Auto-logout and redirect on unauthorized

### Mock Authentication (Development)

For development without a full auth backend:

```typescript
// src/api/auth.ts - Add mock mode
export const login = async (credentials: LoginRequest) => {
  if (import.meta.env.DEV && import.meta.env.VITE_MOCK_AUTH === 'true') {
    return {
      access_token: 'mock_token_' + Date.now(),
      user: {
        id: 'user_1',
        email: credentials.email,
        name: 'Alex Rodriguez',
        role: 'Agent User',
        connected_services: { google: true },
      },
    };
  }
  // Real API call
  const response = await apiClient.post('/auth/login', credentials);
  return response.data;
};
```

## 🐛 Troubleshooting

### Port Already in Use

```bash
# Kill process on port 5173
lsof -ti:5173 | xargs kill -9

# Or use a different port
npm run dev -- --port 3000
```

### API Connection Issues

```bash
# Check backend is running
curl http://localhost:8080/health

# Check CORS configuration
# Backend must allow http://localhost:5173
```

### TypeScript Errors

```bash
# Clear TypeScript cache
rm -rf node_modules/.vite
npm run dev
```

### Build Errors

```bash
# Clean install
rm -rf node_modules package-lock.json
npm install
npm run build
```

## 📱 Responsive Design

The frontend is fully responsive:

- **Desktop** (>1024px): Full sidebar, grid layouts
- **Tablet** (768-1024px): Collapsed sidebar, 2-column grids
- **Mobile** (<768px): Stack layouts, bottom navigation

## 🚀 Production Deployment

### Build for Production

```bash
npm run build
# Output in: dist/
```

### Deploy Options

**Option 1: Vercel**
```bash
npm install -g vercel
vercel login
vercel --prod
```

**Option 2: Netlify**
```bash
npm install -g netlify-cli
netlify login
netlify deploy --prod
```

**Option 3: Firebase Hosting**
```bash
npm install -g firebase-tools
firebase login
firebase init hosting
firebase deploy
```

**Option 4: Cloud Run (with backend)**
```dockerfile
# Multi-stage build
FROM node:18 AS frontend-build
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm ci
COPY frontend/ ./
RUN npm run build

FROM python:3.12-slim
WORKDIR /app
# Copy backend + frontend dist
COPY --from=frontend-build /app/frontend/dist ./static
# ... rest of backend setup
```

## 🎨 Customization Guide

### Changing Brand Colors

Edit `tailwind.config.js`:
```javascript
extend: {
  colors: {
    primary: {
      500: '#YOUR_COLOR_HERE',
      // ... other shades
    },
  },
}
```

### Adding New Pages

1. Create page component in `src/pages/`
2. Add route in `src/App.tsx`
3. Add navigation link in `src/components/Header.tsx`

### Adding New Agents

Update `src/utils/constants.ts`:
```typescript
export const AGENTS = [
  // ... existing agents
  {
    id: 'new_agent',
    name: 'New Agent Name',
    description: 'What it does...',
    tags: ['Tag1', 'Tag2'],
    icon: '🎯',
  },
];
```

## 📚 Additional Resources

- [React Documentation](https://react.dev)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Vite Guide](https://vitejs.dev/guide/)
- [React Router](https://reactrouter.com/en/main)
- [React Query](https://tanstack.com/query/latest)

## 🤝 Integration with ADK Backend

Your ADK backend should be running on port 8080. The frontend automatically proxies API requests through Vite's dev server.

**Backend Checklist:**
- [ ] CORS enabled for http://localhost:5173
- [ ] SSE streaming endpoint working
- [ ] Session management endpoints implemented
- [ ] Authentication endpoints available
- [ ] Health check endpoint (/health)

## ✅ Testing Checklist

- [ ] Home page loads with search bar
- [ ] Example cards navigate to chat with initial message
- [ ] Agent catalog displays all agents
- [ ] Filter tags work correctly
- [ ] Search filters agents in real-time
- [ ] Agent cards link to individual chat pages
- [ ] Chat interface connects to backend
- [ ] Messages send and receive correctly
- [ ] SSE streaming displays text in real-time
- [ ] Loading states show appropriately
- [ ] Error messages display on failures
- [ ] Settings page displays user information
- [ ] Service connections can be added/removed
- [ ] Header navigation works
- [ ] Responsive design works on mobile
- [ ] Back navigation works correctly

## 🎯 Next Steps

1. **Complete backend integration** - Ensure all API endpoints match
2. **Add authentication UI** - Create login/register pages
3. **Implement file upload** - Add document upload capability
4. **Add session history** - Show past conversations
5. **Enhance error handling** - Add retry logic and better error messages
6. **Add analytics** - Track user interactions
7. **Implement dark mode** - Add theme toggle
8. **Add tests** - Unit and integration tests

---

**Happy Coding! 🚀**

For questions or issues, refer to the main FRONTEND_INTEGRATION_GUIDE.md

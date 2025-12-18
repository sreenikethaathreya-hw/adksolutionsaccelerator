import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { SessionProvider } from './contexts/SessionContext';
import { Header } from './components/Header';
import { LoginPage } from './pages/LoginPage';
import { ChatPage } from './pages/ChatPage';
import { AgentCatalogPage } from './pages/AgentCatalogPage';
import { SettingsPage } from './pages/SettingsPage';
import OAuthCallback from './pages/OAuthCallback';
import { ChatHistory } from './components/ChatHistory';
import { Search, ArrowRight } from 'lucide-react';
import { apiClient } from './services/api';

// Protected Route wrapper
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

// Main App Layout with Global Sidebar
const AppLayout: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [selectedSessionId, setSelectedSessionId] = useState<string | undefined>();
  const [refreshKey, setRefreshKey] = useState(0);

  const handleSelectSession = (sessionId: string) => {
    setSelectedSessionId(sessionId);
    navigate('/chat');
  };

  const handleNewChat = async () => {
    try {
      const response = await apiClient.post('/sessions', {
        agentId: 'financial_agent'
      });
      
      const newSessionId = response.data.id;
      console.log('✅ Created new session:', newSessionId);
      
      setSelectedSessionId(newSessionId);
      setRefreshKey(prev => prev + 1);
      navigate('/chat');
    } catch (error) {
      console.error('Failed to create new session:', error);
      navigate('/chat');
    }
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  // Don't show sidebar on login page
  const isLoginPage = location.pathname === '/login';

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Global Chat History Sidebar */}
      {!isLoginPage && sidebarOpen && (
        <div className="w-80 border-r border-gray-200 bg-white flex-shrink-0">
          <ChatHistory
            key={refreshKey}
            currentSessionId={selectedSessionId}
            onSelectSession={handleSelectSession}
            onNewChat={handleNewChat}
            isOpen={sidebarOpen}
            onToggle={toggleSidebar}
          />
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {!isLoginPage && (
          <Header 
            sidebarOpen={sidebarOpen} 
            onToggleSidebar={toggleSidebar}
          />
        )}
        
        <div className="flex-1 overflow-auto">
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<LoginPage />} />

            {/* Protected Routes */}
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <HomePage />
                </ProtectedRoute>
              }
            />
            
            <Route
              path="/chat"
              element={
                <ProtectedRoute>
                  <ChatPage selectedSessionId={selectedSessionId} />
                </ProtectedRoute>
              }
            />
            
            <Route
              path="/catalog"
              element={
                <ProtectedRoute>
                  <AgentCatalogPage />
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
            <Route
              path="/auth/callback"
              element={
                <ProtectedRoute>
                  <OAuthCallback />
                </ProtectedRoute>
              }
            />
            {/* Catch all - redirect to home */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </div>
    </div>
  );
};

// Updated Home Page without sidebar (now in global layout)
const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      navigate('/chat', { state: { initialMessage: query } });
    }
  };

  const quickExamples = [
    'Analyze customer churn patterns',
    'Compare our pricing to competitors',
    'Generate financial forecast for next quarter',
    'Identify cost reduction opportunities',
    'Evaluate market entry strategy',
    'Assess our competitive positioning',
    'Review operational efficiency metrics',
    'Analyze market expansion opportunities',
  ];

  return (
    <div className="min-h-full bg-gradient-to-br from-gray-50 via-white to-gray-50">
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Hero Section */}
        <div className="text-center mb-20">
          {/* Logo */}
          <div className="flex items-center justify-center gap-3 mb-12">
            <img 
              src="/images/hatchworks-logo.png" 
              alt="HatchWorks AI" 
              className="h-24 w-auto"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
                const fallback = e.currentTarget.nextElementSibling as HTMLElement;
                if (fallback) fallback.classList.remove('hidden');
              }}
            />
            {/* Fallback */}
            <div className="hidden">
              <div className="flex items-center gap-3">
                <div className="w-24 h-24 bg-gradient-to-br from-primary-500 to-primary-600 rounded-3xl flex items-center justify-center shadow-lg">
                  <span className="text-white font-bold text-4xl">H</span>
                </div>
                <h1 className="text-7xl font-bold text-gray-900">
                  HatchWorks<span className="text-primary-500">AI</span>
                </h1>
              </div>
            </div>
          </div>

          <p className="text-2xl text-gray-600 mb-16 font-light">
            How can we assist you today?
          </p>

          {/* Search Box */}
          <form onSubmit={handleSearch} className="max-w-4xl mx-auto mb-12">
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-primary-400 to-primary-600 rounded-3xl opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>
              <Search className="absolute left-7 top-1/2 -translate-y-1/2 w-6 h-6 text-gray-400 group-hover:text-primary-500 transition-colors z-10" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleSearch(e);
                  }
                }}
                placeholder="Ask about financial analysis, market trends, KPIs, or AI opportunities..."
                className="w-full pl-16 pr-32 py-6 text-lg text-gray-700 placeholder-gray-400 bg-white border-2 border-gray-200 rounded-3xl focus:outline-none focus:border-primary-500 focus:ring-4 focus:ring-primary-100 transition-all shadow-lg hover:shadow-xl relative z-0"
              />
              <button
                type="submit"
                disabled={!query.trim()}
                className="absolute right-3 top-1/2 -translate-y-1/2 px-8 py-3 bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-2xl hover:from-primary-600 hover:to-primary-700 transition-all font-semibold flex items-center gap-2 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed z-10"
              >
                Ask
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </form>
        </div>

        {/* Marquee Examples Section */}
        <div className="mb-20 overflow-hidden">
          <p className="text-center text-base text-gray-600 mb-8 font-medium">Quick examples to get you started:</p>
          <div className="relative">
            <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-white via-white to-transparent z-10"></div>
            <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-white via-white to-transparent z-10"></div>
            
            <div className="flex animate-marquee hover:pause-animation">
              {[...quickExamples, ...quickExamples].map((example, index) => (
                <button
                  key={index}
                  onClick={() => {
                    setQuery(example);
                    navigate('/chat', { state: { initialMessage: example } });
                  }}
                  className="flex-shrink-0 mx-2 px-6 py-3 bg-white border-2 border-gray-200 rounded-full text-sm text-gray-700 hover:border-primary-500 hover:text-primary-600 hover:shadow-lg transition-all whitespace-nowrap font-medium"
                >
                  {example}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="bg-gradient-to-br from-primary-500 via-primary-600 to-primary-700 rounded-3xl p-16 text-center text-white shadow-2xl relative overflow-hidden">
          {/* Decorative elements */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full -translate-y-32 translate-x-32"></div>
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-white opacity-5 rounded-full translate-y-48 -translate-x-48"></div>
          
          <div className="relative z-10">
            <h2 className="text-4xl font-bold mb-6">Ready to get started?</h2>
            <p className="text-xl text-primary-100 mb-10 max-w-2xl mx-auto leading-relaxed">
              Explore our AI agents or dive right into a conversation to discover 
              how we can help transform your business.
            </p>
            <div className="flex flex-wrap justify-center gap-6">
              <button
                onClick={() => navigate('/chat')}
                className="px-10 py-4 bg-white text-primary-600 rounded-2xl font-bold hover:bg-gray-50 hover:shadow-2xl transition-all text-lg"
              >
                Start Chat
              </button>
              <button
                onClick={() => navigate('/catalog')}
                className="px-10 py-4 bg-primary-800 text-white rounded-2xl font-bold hover:bg-primary-900 transition-all border-2 border-primary-400 text-lg"
              >
                Browse Agents
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* Add marquee animation CSS */}
      <style>{`
        @keyframes marquee {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }
        
        .animate-marquee {
          animation: marquee 40s linear infinite;
        }
        
        .pause-animation:hover {
          animation-play-state: paused;
        }
      `}</style>
    </div>
  );
};

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <SessionProvider>
          <AppLayout />
        </SessionProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
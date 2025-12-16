import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { SessionProvider } from './contexts/SessionContext';
import { Header } from './components/Header';
import { LoginPage } from './pages/LoginPage';
import { ChatPage } from './pages/ChatPage';
import { AgentCatalogPage } from './pages/AgentCatalogPage';
import { SettingsPage } from './pages/SettingsPage';
import OAuthCallback from './pages/OAuthCallback';

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

// Simple Home Page
const HomePage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        {/* Logo - centered */}
        <div className="flex justify-center mb-8">
          <img 
            src="/images/hatchworks-logo.png" 
            alt="HatchWorks AI" 
            className="h-16 w-auto"
            onError={(e) => {
              // Fallback to H icon if logo not found
              e.currentTarget.style.display = 'none';
              const fallback = e.currentTarget.nextElementSibling as HTMLElement;
              if (fallback) fallback.classList.remove('hidden');
            }}
          />
          {/* Fallback H icon (only shows if logo fails to load) */}
          <div className="hidden w-16 h-16 bg-primary-500 rounded-2xl flex items-center justify-center">
            <span className="text-white font-bold text-2xl">H</span>
          </div>
        </div>
        
        <h1 className="text-5xl font-bold text-gray-900 mb-4">
          Welcome to HatchWorks<span className="text-primary-500">AI</span>
        </h1>
        <p className="text-xl text-gray-600 mb-8">
          Your AI-powered financial analysis platform
        </p>
        <div className="flex gap-4 justify-center flex-wrap">
          <a
            href="/chat"
            className="bg-primary-500 text-white px-8 py-3 rounded-lg font-medium hover:bg-primary-600 transition-colors"
          >
            Start Chat
          </a>
          <a
            href="/catalog"
            className="bg-white text-gray-900 px-8 py-3 rounded-lg font-medium border-2 border-gray-300 hover:bg-gray-50 transition-colors"
          >
            Browse Agents
          </a>
          <a
            href="/settings"
            className="bg-white text-gray-900 px-8 py-3 rounded-lg font-medium border-2 border-gray-300 hover:bg-gray-50 transition-colors"
          >
            Settings
          </a>
        </div>

        {/* Feature Cards */}
        <div className="grid md:grid-cols-3 gap-6 mt-16 text-left">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
              <span className="text-2xl">📊</span>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Financial Analysis</h3>
            <p className="text-gray-600 text-sm">
              Analyze P&L statements, balance sheets, and cash flow with AI-powered insights
            </p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
              <span className="text-2xl">📈</span>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Market Research</h3>
            <p className="text-gray-600 text-sm">
              Track industry trends, competitive landscape, and market opportunities
            </p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
              <span className="text-2xl">🎯</span>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">KPI Development</h3>
            <p className="text-gray-600 text-sm">
              Generate custom KPIs and performance indicators for your business
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <SessionProvider>
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
                  <ChatPage />
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
        </SessionProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
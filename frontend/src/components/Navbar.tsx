import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import { auth } from '../config/firebase';

export const Navbar: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const user = auth.currentUser;

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo and Brand */}
          <Link to="/" className="flex items-center gap-3">
            <img 
              src="/images/hatchworks-logo.png" 
              alt="HatchWorks AI" 
              className="h-8 w-auto"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
                const fallback = e.currentTarget.nextElementSibling as HTMLElement;
                if (fallback) fallback.classList.remove('hidden');
              }}
            />
            {/* Fallback if logo fails to load */}
            <div className="hidden items-center gap-2">
              <div className="w-8 h-8 bg-primary-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">H</span>
              </div>
              <span className="text-xl font-bold text-gray-900">
                HatchWorks<span className="text-primary-500">AI</span>
              </span>
            </div>
          </Link>

          {/* Navigation Links */}
          <div className="flex items-center gap-2">
            <Link
              to="/"
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                isActive('/')
                  ? 'bg-primary-50 text-primary-600'
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              Home
            </Link>

            <Link
              to="/agents"
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                isActive('/agents')
                  ? 'bg-primary-50 text-primary-600'
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              Agents
            </Link>

            <Link
              to="/chat"
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                isActive('/chat')
                  ? 'bg-primary-50 text-primary-600'
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              Chat
            </Link>
          </div>

          {/* User Info - Clickable to navigate to settings */}
          {user && (
            <button
              onClick={() => navigate('/settings')}
              className="flex items-center gap-3 px-3 py-2 hover:bg-gray-50 rounded-lg transition-colors"
            >
              <span className="text-sm font-medium text-gray-700">
                {user.displayName || user.email}
              </span>
              <div className="w-8 h-8 bg-primary-500 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                {user.displayName?.[0]?.toUpperCase() || user.email?.[0]?.toUpperCase() || 'U'}
              </div>
            </button>
          )}
        </div>
      </div>
    </nav>
  );
};

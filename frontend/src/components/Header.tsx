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
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Menu, User } from 'lucide-react';

interface HeaderProps {
  sidebarOpen?: boolean;
  onToggleSidebar?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ sidebarOpen, onToggleSidebar }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Left side - Menu button and Logo */}
          <div className="flex items-center gap-4">
            {/* Sidebar Toggle Button */}
            {onToggleSidebar && !sidebarOpen && (
              <button
                onClick={onToggleSidebar}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                title="Show conversations"
              >
                <Menu className="w-6 h-6 text-gray-700" />
              </button>
            )}

            {/* Logo */}
            <Link to="/" className="flex items-center gap-2">
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
              {/* Fallback */}
              <div className="hidden items-center gap-2">
                <div className="w-8 h-8 bg-primary-500 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">H</span>
                </div>
                <span className="text-xl font-bold text-gray-900">
                  HatchWorks<span className="text-primary-500">AI</span>
                </span>
              </div>
            </Link>
          </div>

          {/* Center - Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link
              to="/"
              className="text-gray-700 hover:text-primary-600 font-medium transition-colors"
            >
              Home
            </Link>
            <Link
              to="/catalog"
              className="text-gray-700 hover:text-primary-600 font-medium transition-colors"
            >
              Agents
            </Link>
            <Link
              to="/chat"
              className="text-gray-700 hover:text-primary-600 font-medium transition-colors"
            >
              Chat
            </Link>
          </nav>

          {/* Right side - User menu */}
          <div className="flex items-center gap-4">
            {user && (
              <div className="flex items-center gap-3">
                <div className="hidden sm:flex items-center gap-2 text-sm">
                  <User className="w-4 h-4 text-gray-500" />
                  <span className="text-gray-700 font-medium">{user.name || user.email}</span>
                </div>
                
                <div className="flex items-center gap-2">
                  <Link
                    to="/settings"
                    className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg font-medium transition-colors"
                  >
                    Settings
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="px-4 py-2 bg-gray-100 text-gray-700 hover:bg-gray-200 rounded-lg font-medium transition-colors"
                  >
                    Sign Out
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
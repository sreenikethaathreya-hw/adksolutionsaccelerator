import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Menu, Settings, LogOut } from 'lucide-react';

interface HeaderProps {
  sidebarOpen?: boolean;
  onToggleSidebar?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ sidebarOpen, onToggleSidebar }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const isActive = (path: string) => {
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  const navLinkClass = (path: string) =>
    `px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
      isActive(path)
        ? 'bg-[#3aabba]/10 text-[#3aabba]'
        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
    }`;

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-40 shadow-sm">
      <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Left: Sidebar Toggle + Logo */}
          <div className="flex items-center gap-3 flex-shrink-0 min-w-[200px]">
            {/* Sidebar Toggle (only show when sidebar exists and is closed) */}
            {onToggleSidebar && !sidebarOpen && (
              <button
                onClick={onToggleSidebar}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors flex-shrink-0"
                title="Show conversations"
              >
                <Menu className="w-5 h-5 text-gray-700" />
              </button>
            )}

            {/* Logo - Always visible, never squished */}
            <Link to="/images/hatchworks-logo.png" className="flex items-center gap-2 flex-shrink-0">
              {/* Icon */}
              <div className="w-10 h-10 rounded-lg flex items-center justify-center shadow-md flex-shrink-0" style={{ background: 'linear-gradient(to bottom right, #3aabba, #215f67)' }}>
                <span className="text-white text-xl font-bold"></span>
              </div>
              {/* Text - Hide on very small screens */}
              
            </Link>
          </div>

          {/* Center: Navigation (hidden on mobile) */}
          <nav className="hidden md:flex items-center gap-1 flex-1 justify-center">
            <Link to="/" className={navLinkClass('/')}>
              Home
            </Link>
            <Link to="/catalog" className={navLinkClass('/catalog')}>
              Agents
            </Link>
            <Link to="/chat" className={navLinkClass('/chat')}>
              Chat
            </Link>
          </nav>

          {/* Right: User Menu */}
          <div className="flex items-center gap-2 flex-shrink-0">
            {user ? (
              <>
                {/* User Info - Desktop */}
                <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-semibold" style={{ background: 'linear-gradient(to bottom right, #3aabba, #215f67)' }}>
                    {user.email?.[0]?.toUpperCase() || 'U'}
                  </div>
                  <span className="text-sm font-medium text-gray-700 max-w-[120px] truncate">
                    {user.name || user.email?.split('@')[0] || 'User'}
                  </span>
                </div>

                {/* Action Buttons - Desktop */}
                <div className="hidden md:flex items-center gap-1">
                  <Link
                    to="/settings"
                    className="p-2 text-gray-600 rounded-lg transition-colors hover:bg-[#3aabba]/10 hover:text-[#3aabba]"
                    title="Settings"
                  >
                    <Settings className="w-5 h-5" />
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="p-2 text-gray-600 hover:bg-red-50 hover:text-red-600 rounded-lg transition-colors"
                    title="Sign Out"
                  >
                    <LogOut className="w-5 h-5" />
                  </button>
                </div>

                {/* Mobile Menu Button */}
                <div className="md:hidden flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-semibold" style={{ background: 'linear-gradient(to bottom right, #3aabba, #215f67)' }}>
                    {user.email?.[0]?.toUpperCase() || 'U'}
                  </div>
                  <button
                    onClick={handleLogout}
                    className="px-3 py-1.5 text-sm bg-gray-100 text-gray-700 hover:bg-gray-200 rounded-lg font-medium transition-colors"
                  >
                    Sign Out
                  </button>
                </div>
              </>
            ) : (
              <Link
                to="/login"
                className="px-4 py-2 text-white rounded-lg text-sm font-medium transition-colors whitespace-nowrap shadow-sm"
                style={{ backgroundColor: '#3aabba' }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#215f67'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#3aabba'}
              >
                Sign In
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Navigation Bar */}
      {user && (
        <div className="md:hidden border-t border-gray-100 bg-gray-50">
          <div className="flex items-center justify-around px-2 py-2">
            <Link to="/" className={`${navLinkClass('/')} flex-1 text-center`}>
              Home
            </Link>
            <Link to="/catalog" className={`${navLinkClass('/catalog')} flex-1 text-center`}>
              Agents
            </Link>
            <Link to="/chat" className={`${navLinkClass('/chat')} flex-1 text-center`}>
              Chat
            </Link>
            <Link to="/settings" className={`${navLinkClass('/settings')} flex-1 text-center`}>
              Settings
            </Link>
          </div>
        </div>
      )}
    </header>
  );
};

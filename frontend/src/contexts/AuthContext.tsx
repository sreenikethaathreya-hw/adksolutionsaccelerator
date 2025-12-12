import React, { createContext, useContext, useState, useEffect } from 'react';

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

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Check if we're in mock mode
const MOCK_AUTH = import.meta.env.VITE_MOCK_AUTH === 'true' || true; // Default to true for development

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      if (MOCK_AUTH) {
        // Mock authentication - check localStorage for mock user
        const mockUserData = localStorage.getItem('mock_user');
        if (mockUserData) {
          setUser(JSON.parse(mockUserData));
        }
      } else {
        // Real authentication
        const token = localStorage.getItem('auth_token');
        if (token) {
          // In real implementation, call API to get current user
          // const userData = await getCurrentUser();
          // setUser(userData);
        }
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      localStorage.removeItem('auth_token');
      localStorage.removeItem('mock_user');
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, _password: string) => {
    if (MOCK_AUTH) {
      // Mock login - create a demo user
      const mockUser: User = {
        id: 'user_demo_001',
        email: email,
        name: email.split('@')[0].charAt(0).toUpperCase() + email.split('@')[0].slice(1),
        role: 'Agent User',
        connected_services: {
          google: false,
          salesforce: false,
          sharepoint: false,
        },
      };
      localStorage.setItem('mock_user', JSON.stringify(mockUser));
      localStorage.setItem('auth_token', 'mock_token_' + Date.now());
      setUser(mockUser);
    } else {
      // Real authentication
      // const response = await apiLogin({ email, password });
      // localStorage.setItem('auth_token', response.access_token);
      // setUser(response.user);
      throw new Error('Real authentication not yet implemented');
    }
  };

  const logout = async () => {
    if (MOCK_AUTH) {
      localStorage.removeItem('mock_user');
      localStorage.removeItem('auth_token');
      setUser(null);
    } else {
      // await apiLogout();
      localStorage.removeItem('auth_token');
      setUser(null);
    }
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
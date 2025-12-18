import React, { createContext, useContext, useState, useCallback } from 'react';
import { createSession as apiCreateSession, deleteSession as apiDeleteSession } from '../api/agents';
import { useAuth } from './AuthContext';

interface Session {
  id: string;
  userId: string;
  agentId: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  messageCount: number;
}

interface SessionContextType {
  session: Session | null;
  loading: boolean;
  createSession: (agentId?: string) => Promise<void>;
  endSession: () => Promise<void>;
}

const SessionContext = createContext<SessionContextType | undefined>(undefined);

export const SessionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(false);

  const createSession = useCallback(async (agentId: string = 'financial_agent') => {
    if (!user) throw new Error('User not authenticated');
    
    setLoading(true);
    try {
      // Only pass agentId - user authentication is handled by Firebase token
      const response = await apiCreateSession(agentId);
      setSession(response.data);
    } catch (error) {
      console.error('Failed to create session:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [user]);

  const endSession = useCallback(async () => {
    if (!session) return;
    
    try {
      await apiDeleteSession(session.id);
      setSession(null);
    } catch (error) {
      console.error('Failed to end session:', error);
      throw error;
    }
  }, [session]);

  return (
    <SessionContext.Provider value={{ session, loading, createSession, endSession }}>
      {children}
    </SessionContext.Provider>
  );
};

export const useSession = () => {
  const context = useContext(SessionContext);
  if (!context) {
    throw new Error('useSession must be used within SessionProvider');
  }
  return context;
};

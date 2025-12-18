import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { ChatInterface } from '../components/ChatInterface';
import { apiClient } from '../services/api';

interface ChatPageProps {
  selectedSessionId?: string;
}

export const ChatPage: React.FC<ChatPageProps> = ({ selectedSessionId: propSessionId }) => {
  const location = useLocation();
  const [selectedSessionId, setSelectedSessionId] = useState<string | undefined>(propSessionId);
  const [initialMessage, setInitialMessage] = useState<string | undefined>();
  const [refreshKey, setRefreshKey] = useState(0);

  // Update local state when prop changes
  useEffect(() => {
    if (propSessionId) {
      setSelectedSessionId(propSessionId);
    }
  }, [propSessionId]);

  // Handle initial message from homepage navigation
  useEffect(() => {
    const state = location.state as { initialMessage?: string; agentId?: string; agentName?: string } | null;
    
    if (state?.initialMessage) {
      console.log('📨 Received initial message:', state.initialMessage);
      setInitialMessage(state.initialMessage);
      
      // Create a new session for this query if we don't have one
      if (!selectedSessionId) {
        handleCreateNewSession();
      }
      
      // Clear the navigation state to prevent re-triggering
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  const handleCreateNewSession = async () => {
    try {
      const response = await apiClient.post('/sessions', {
        agentId: 'financial_agent'
      });
      
      const newSessionId = response.data.id;
      console.log('✅ Created new session:', newSessionId);
      setSelectedSessionId(newSessionId);
    } catch (error) {
      console.error('Failed to create new session:', error);
    }
  };

  const handleSessionChange = () => {
    setRefreshKey(prev => prev + 1);
  };

  const handleMessageSent = () => {
    // Clear initial message after it's been sent
    setInitialMessage(undefined);
  };

  return (
    <div className="h-full bg-gray-50">
      <ChatInterface
        selectedSessionId={selectedSessionId}
        onSessionChange={handleSessionChange}
        initialMessage={initialMessage}
        onMessageSent={handleMessageSent}
      />
    </div>
  );
};
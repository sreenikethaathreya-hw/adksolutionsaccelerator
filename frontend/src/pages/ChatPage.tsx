import React, { useState } from 'react';
import { ChatInterface } from '../components/ChatInterface';
import { ChatHistory } from '../components/ChatHistory';
import { Navbar } from '../components/Navbar';
import { apiClient } from '../services/api';
import { Menu } from 'lucide-react';

export const ChatPage: React.FC = () => {
  const [selectedSessionId, setSelectedSessionId] = useState<string | undefined>();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);

  const handleSelectSession = (sessionId: string) => {
    setSelectedSessionId(sessionId);
  };

  const handleNewChat = async () => {
    try {
      // Create a brand new session
      const response = await apiClient.post('/sessions', {
        agentId: 'financial_agent'
      });
      
      const newSessionId = response.data.id;
      console.log('✅ Created new session:', newSessionId);
      
      // Select the new session
      setSelectedSessionId(newSessionId);
      setRefreshKey(prev => prev + 1);
    } catch (error) {
      console.error('Failed to create new session:', error);
      // Fallback to clearing selection
      setSelectedSessionId(undefined);
      setRefreshKey(prev => prev + 1);
    }
  };

  const handleSessionChange = () => {
    setRefreshKey(prev => prev + 1);
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      <Navbar />
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar Toggle Button - Only visible when sidebar is closed */}
        {!sidebarOpen && (
          <button
            onClick={() => setSidebarOpen(true)}
            className="absolute top-20 left-4 z-50 p-2 bg-white border border-gray-200 rounded-lg shadow-sm hover:bg-gray-50 transition-colors"
            title="Show conversations"
          >
            <Menu className="w-5 h-5 text-gray-700" />
          </button>
        )}

        {/* Chat History Sidebar */}
        {sidebarOpen && (
          <div className="w-80 border-r border-gray-200 bg-white">
            <ChatHistory
              key={refreshKey}
              currentSessionId={selectedSessionId}
              onSelectSession={handleSelectSession}
              onNewChat={handleNewChat}
              isOpen={sidebarOpen}
              onToggle={() => setSidebarOpen(!sidebarOpen)}
            />
          </div>
        )}

        {/* Main Chat Area */}
        <div className="flex-1 overflow-hidden">
          <ChatInterface
            selectedSessionId={selectedSessionId}
            onSessionChange={handleSessionChange}
          />
        </div>
      </div>
    </div>
  );
};

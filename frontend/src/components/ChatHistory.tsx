import React, { useEffect, useState } from 'react';
import { Trash2, MessageSquare, ChevronLeft } from 'lucide-react';
import { apiClient } from '../services/api';

interface Session {
  id: string;
  agentId: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  messageCount: number;
  files?: any[];
}

interface ChatHistoryProps {
  currentSessionId?: string;
  onSelectSession?: (sessionId: string) => void;
  onNewChat?: () => void | Promise<void>;
  isOpen?: boolean;
  onToggle?: () => void;
  agentId?: string;
}

export const ChatHistory: React.FC<ChatHistoryProps> = ({
  currentSessionId,
  onSelectSession,
  onNewChat,
  isOpen = true,
  onToggle,
  agentId = 'financial_agent',
}) => {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const loadSessions = async () => {
    try {
      const response = await apiClient.get('/sessions');
      setSessions(response.data);
    } catch (error) {
      console.error('Failed to load sessions:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSessions();
  }, [currentSessionId]);

  const handleDelete = async (sessionId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (!confirm('Delete this conversation? This cannot be undone.')) return;

    setDeletingId(sessionId);

    try {
      await apiClient.delete(`/sessions/${sessionId}`);
      
      const remainingSessions = sessions.filter(s => s.id !== sessionId);
      setSessions(remainingSessions);
      
      if (currentSessionId === sessionId) {
        if (remainingSessions.length > 0 && onSelectSession) {
          onSelectSession(remainingSessions[0].id);
          console.log('✅ Switched to session:', remainingSessions[0].id);
        } else if (onNewChat) {
          await onNewChat();
          console.log('✅ Created new session (last one was deleted)');
        }
      }
      
      console.log('✅ Deleted session:', sessionId);
    } catch (error) {
      console.error('Failed to delete session:', error);
      alert('Failed to delete conversation. Please try again.');
    } finally {
      setDeletingId(null);
    }
  };

  const handleSelectSession = (sessionId: string) => {
    if (onSelectSession) {
      onSelectSession(sessionId);
    }
  };

  const handleNewChatClick = async () => {
    if (onNewChat) {
      await onNewChat();
    }
  };

  const getRelativeTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    
    if (diffMs < 0 || diffMs < 60000) {
      return 'Just now';
    }
    
    const diffMinutes = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMinutes < 60) {
      return diffMinutes === 1 ? '1 minute ago' : `${diffMinutes} minutes ago`;
    }
    
    if (diffHours < 24) {
      return diffHours === 1 ? '1 hour ago' : `${diffHours} hours ago`;
    }
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) {
      const weeks = Math.floor(diffDays / 7);
      return weeks === 1 ? '1 week ago' : `${weeks} weeks ago`;
    }
    
    const months = Math.floor(diffDays / 30);
    return months === 1 ? '1 month ago' : `${months} months ago`;
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Header */}
      <div className="p-4 border-b border-gray-200" style={{ background: 'linear-gradient(to right, rgba(58, 171, 186, 0.05), white)' }}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Conversations</h2>
          {onToggle && (
            <button
              onClick={onToggle}
              className="p-1.5 hover:bg-white rounded-lg transition-colors"
              title="Hide sidebar"
            >
              <ChevronLeft className="w-5 h-5 text-gray-600" />
            </button>
          )}
        </div>
        <button
          onClick={handleNewChatClick}
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-white rounded-lg transition-colors font-medium text-sm shadow-sm"
          style={{ backgroundColor: '#3aabba' }}
          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#215f67'}
          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#3aabba'}
        >
          <MessageSquare className="w-4 h-4" />
          New Chat
        </button>
      </div>

      {/* Sessions List */}
      <div className="flex-1 overflow-y-auto p-3">
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2" style={{ borderColor: '#3aabba' }}></div>
          </div>
        ) : sessions.length === 0 ? (
          <div className="text-center py-8 px-4">
            <MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 text-sm">No conversations yet</p>
            <p className="text-gray-400 text-xs mt-1">Start a new chat to begin</p>
          </div>
        ) : (
          <div className="space-y-2">
            {sessions.map((session) => (
              <div
                key={session.id}
                className={`group relative p-3 rounded-lg border-2 transition-all cursor-pointer ${
                  deletingId === session.id ? 'opacity-50' : ''
                }`}
                style={
                  currentSessionId === session.id
                    ? { backgroundColor: 'rgba(58, 171, 186, 0.1)', borderColor: 'rgba(58, 171, 186, 0.3)', boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)' }
                    : { backgroundColor: 'white', borderColor: 'transparent' }
                }
                onMouseEnter={(e) => {
                  if (currentSessionId !== session.id) {
                    e.currentTarget.style.backgroundColor = 'rgb(249, 250, 251)';
                    e.currentTarget.style.borderColor = 'rgb(229, 231, 235)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (currentSessionId !== session.id) {
                    e.currentTarget.style.backgroundColor = 'white';
                    e.currentTarget.style.borderColor = 'transparent';
                  }
                }}
              >
                <div className="flex items-start justify-between gap-2">
                  <div
                    onClick={() => {
                      if (deletingId !== session.id) {
                        handleSelectSession(session.id);
                      }
                    }}
                    className="flex-1 min-w-0"
                  >
                    <h3 
                      className="font-medium truncate text-sm mb-1"
                      style={{ color: currentSessionId === session.id ? '#3aabba' : 'rgb(17, 24, 39)' }}
                    >
                      {session.title}
                    </h3>
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <span>{getRelativeTime(session.updatedAt)}</span>
                      <span>•</span>
                      <span>
                        {session.messageCount} {session.messageCount === 1 ? 'message' : 'messages'}
                      </span>
                    </div>
                    {session.files && session.files.length > 0 && (
                      <div className="text-xs mt-1.5 font-medium" style={{ color: '#3aabba' }}>
                        📎 {session.files.length} file{session.files.length !== 1 ? 's' : ''}
                      </div>
                    )}
                  </div>
                  <button
                    onClick={(e) => handleDelete(session.id, e)}
                    disabled={deletingId === session.id}
                    className="flex-shrink-0 p-1.5 hover:bg-red-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                    title="Delete conversation"
                  >
                    <Trash2 className="w-4 h-4 text-red-500" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

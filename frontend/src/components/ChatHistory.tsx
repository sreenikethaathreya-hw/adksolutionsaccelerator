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
  onSelectSession: (sessionId: string) => void;
  onNewChat: () => void;
  isOpen: boolean;
  onToggle: () => void;
}

export const ChatHistory: React.FC<ChatHistoryProps> = ({
  currentSessionId,
  onSelectSession,
  onNewChat,
  isOpen,
  onToggle,
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
        if (remainingSessions.length > 0) {
          onSelectSession(remainingSessions[0].id);
          console.log('✅ Switched to session:', remainingSessions[0].id);
        } else {
          onNewChat();
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
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Conversations</h2>
          <button
            onClick={onToggle}
            className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
            title="Hide sidebar"
          >
            <ChevronLeft className="w-5 h-5 text-gray-600" />
          </button>
        </div>
        <button
          onClick={onNewChat}
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors font-medium text-sm"
        >
          <MessageSquare className="w-4 h-4" />
          New Chat
        </button>
      </div>

      {/* Sessions List */}
      <div className="flex-1 overflow-y-auto p-3">
        {loading ? (
          <div className="text-center py-8 text-gray-500 text-sm">Loading...</div>
        ) : sessions.length === 0 ? (
          <div className="text-center py-8 text-gray-500 text-sm">
            No conversations yet
          </div>
        ) : (
          <div className="space-y-2">
            {sessions.map((session) => (
              <div
                key={session.id}
                className={`group relative p-3 rounded-lg border transition-all cursor-pointer ${
                  currentSessionId === session.id
                    ? 'bg-primary-50 border-primary-200 shadow-sm'
                    : 'bg-white border-gray-200 hover:border-gray-300 hover:shadow-sm'
                } ${deletingId === session.id ? 'opacity-50' : ''}`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div
                    onClick={() => {
                      if (deletingId !== session.id) {
                        onSelectSession(session.id);
                      }
                    }}
                    className="flex-1 min-w-0"
                  >
                    <h3 className="font-medium text-gray-900 truncate text-sm mb-1">
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
                      <div className="text-xs text-primary-600 mt-1.5 font-medium">
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

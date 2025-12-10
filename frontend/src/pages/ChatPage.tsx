import React, { useEffect } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft, Sparkles } from 'lucide-react';
import { ChatInterface } from '../components/ChatInterface';
import { useSession } from '../contexts/SessionContext';
import { useAuth } from '../contexts/AuthContext';

export const ChatPage: React.FC = () => {
  const { agentId } = useParams<{ agentId?: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const { session, createSession, loading } = useSession();
  const { user } = useAuth();

  // Get initial message from navigation state
  const initialMessage = location.state?.initialMessage;

  useEffect(() => {
    // Create session if none exists
    if (!session && user && !loading) {
      createSession(agentId || 'financial_agent').catch((error) => {
        console.error('Failed to create session:', error);
      });
    }
  }, [session, user, loading, agentId, createSession]);

  const agentNames: Record<string, string> = {
    financial_agent: 'Financial Insights Agent',
    market_agent: 'Market Research Agent',
    ai_opportunity_agent: 'AI Opportunity Agent',
    kpi_agent: 'KPI & Indicators Agent',
  };

  const agentName = agentNames[agentId || 'financial_agent'] || 'Financial Agent';

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mb-4"></div>
          <p className="text-gray-600">Starting conversation...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Chat Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-3">
        <div className="max-w-7xl mx-auto flex items-center gap-4">
          <button
            onClick={() => navigate('/catalog')}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-primary-600" />
            </div>
            <div>
              <h1 className="font-semibold text-gray-900">{agentName}</h1>
              <p className="text-sm text-gray-500">
                {session ? 'Connected' : 'Initializing...'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Chat Interface */}
      <div className="flex-1 overflow-hidden">
        <div className="h-full max-w-5xl mx-auto">
          {session ? (
            <ChatInterface initialMessage={initialMessage} />
          ) : (
            <div className="h-full flex items-center justify-center">
              <div className="text-center">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mb-4"></div>
                <p className="text-gray-600">Connecting to agent...</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

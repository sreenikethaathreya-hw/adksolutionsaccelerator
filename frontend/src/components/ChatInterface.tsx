import React, { useState, useRef, useEffect } from 'react';
import { Send, Loader2, Paperclip, CheckCircle, AlertCircle, Bot } from 'lucide-react';
import { sendMessage, parseSSEStream, Message } from '../api/agents';
import { useSession } from '../contexts/SessionContext';

interface ChatInterfaceProps {
  initialMessage?: string;
}

export const ChatInterface: React.FC<ChatInterfaceProps> = ({ initialMessage }) => {
  const { session } = useSession();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const initialMessageSent = useRef(false);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Send initial message if provided
  useEffect(() => {
    if (initialMessage && session && !initialMessageSent.current) {
      initialMessageSent.current = true;
      handleSendMessage(initialMessage);
    }
  }, [initialMessage, session]);

  const handleSendMessage = async (messageText: string = input) => {
    if (!messageText.trim() || !session || loading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: messageText,
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setLoading(true);
    setError(null);

    try {
      const stream = await sendMessage(session.id, messageText);
      let assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: '',
        timestamp: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, assistantMessage]);

      for await (const chunk of parseSSEStream(stream)) {
        if (chunk.content?.parts) {
          for (const part of chunk.content.parts) {
            if (part.text) {
              assistantMessage = {
                ...assistantMessage,
                content: assistantMessage.content + part.text,
              };
              setMessages((prev) => [
                ...prev.slice(0, -1),
                assistantMessage,
              ]);
            }
          }
        }

        // Handle tool usage
        if (chunk.tool_calls) {
          console.log('Tool calls:', chunk.tool_calls);
        }
      }
    } catch (error) {
      console.error('Failed to send message:', error);
      setError('Failed to send message. Please try again.');
      
      // Add error message
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 2).toString(),
          role: 'system',
          content: 'Sorry, something went wrong. Please try again.',
          timestamp: new Date().toISOString(),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  return (
    <div className="flex flex-col h-full bg-white rounded-lg shadow-sm">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {messages.length === 0 && !loading && (
          <div className="text-center text-gray-500 mt-16">
            <div className="w-20 h-20 bg-primary-50 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <Bot className="w-10 h-10 text-primary-500" />
            </div>
            <p className="text-xl font-semibold text-gray-900 mb-2">
              Start a conversation
            </p>
            <p className="text-sm text-gray-500 max-w-md mx-auto">
              Ask me about financial analysis, market research, AI opportunities, or KPI development
            </p>
          </div>
        )}

        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${
              message.role === 'user' ? 'justify-end' : 'justify-start'
            }`}
          >
            <div
              className={`group relative max-w-[75%] ${
                message.role === 'user' ? 'order-2' : 'order-1'
              }`}
            >
              <div
                className={`rounded-2xl px-5 py-3 ${
                  message.role === 'user'
                    ? 'bg-primary-500 text-white'
                    : message.role === 'system'
                    ? 'bg-red-50 text-red-900 border border-red-200'
                    : 'bg-gray-100 text-gray-900'
                }`}
              >
                <p className="text-[15px] leading-relaxed whitespace-pre-wrap break-words">
                  {message.content}
                </p>
                <div className="flex items-center gap-2 mt-2">
                  <p
                    className={`text-xs ${
                      message.role === 'user'
                        ? 'text-primary-100'
                        : 'text-gray-500'
                    }`}
                  >
                    {formatTime(message.timestamp)}
                  </p>
                  {message.role === 'user' && (
                    <CheckCircle className="w-3 h-3 text-primary-100" />
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex justify-start">
            <div className="bg-gray-100 rounded-2xl px-5 py-3 flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin text-primary-500" />
              <span className="text-sm text-gray-600">Thinking...</span>
            </div>
          </div>
        )}

        {error && (
          <div className="flex justify-center">
            <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 flex items-center gap-2 max-w-md">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
              <p className="text-sm text-red-800">{error}</p>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="border-t border-gray-200 p-4 bg-gray-50 rounded-b-lg">
        <div className="flex items-end gap-3">
          <button
            className="p-3 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors mb-1"
            title="Attach file"
          >
            <Paperclip className="w-5 h-5" />
          </button>

          <div className="flex-1">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask about financial analysis..."
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all bg-white"
              disabled={loading || !session}
            />
          </div>

          <button
            onClick={() => handleSendMessage()}
            disabled={!input.trim() || loading || !session}
            className="p-3 bg-primary-500 text-white rounded-xl hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm hover:shadow-md mb-1"
            title="Send message"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>

        <p className="text-xs text-gray-500 mt-2 text-center">
          Press Enter to send • Shift+Enter for new line
        </p>
      </div>
    </div>
  );
};
import React, { useState, useEffect, useRef } from 'react';
import { Send, Loader2, Paperclip, X, Bot, User, AlertCircle, FileText, Image, Table } from 'lucide-react';
import { useSession } from '../contexts/SessionContext';
import { auth } from '../config/firebase';
import { apiClient } from '../services/api';
import axios from 'axios';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  attachments?: FileData[];
}

interface FileData {
  filename: string;
  type: string;
  size: number;
  base64_data: string;
  mime_type: string;
}

interface ChatInterfaceProps {
  selectedSessionId?: string;
  onSessionChange?: () => void;
  initialMessage?: string;
  onMessageSent?: () => void;
}

export const ChatInterface: React.FC<ChatInterfaceProps> = ({
  selectedSessionId,
  onSessionChange,
  initialMessage,
  onMessageSent,
}) => {
  const { session, createSession } = useSession();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [attachedFiles, setAttachedFiles] = useState<FileData[]>([]);
  const [uploadingFile, setUploadingFile] = useState(false);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const initialMessageSentRef = useRef(false);

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

  // Handle initial message from homepage
  useEffect(() => {
    if (initialMessage && selectedSessionId && !isLoading && !initialMessageSentRef.current) {
      console.log('📤 Auto-sending initial message:', initialMessage);
      initialMessageSentRef.current = true;
      
      // Set the input with the initial message
      setInput(initialMessage);
      
      // Send it after a short delay to ensure UI is ready
      setTimeout(() => {
        handleSendMessage(initialMessage);
        if (onMessageSent) {
          onMessageSent();
        }
      }, 100);
    }
  }, [initialMessage, selectedSessionId, isLoading]);

  // Load messages when selectedSessionId changes
  useEffect(() => {
    const loadSessionMessages = async () => {
      if (!selectedSessionId) {
        setMessages([]);
        setAttachedFiles([]);
        initialMessageSentRef.current = false;
        return;
      }

      setLoadingMessages(true);
      try {
        // Load messages
        const response = await apiClient.get(`/sessions/${selectedSessionId}/messages`);
        const loadedMessages = response.data.map((msg: any) => ({
          ...msg,
          timestamp: new Date(msg.timestamp),
        }));
        setMessages(loadedMessages);

        // Load session files
        const sessionResponse = await apiClient.get(`/sessions/${selectedSessionId}`);
        const sessionFiles = sessionResponse.data.files || [];
        setAttachedFiles(sessionFiles);
        
        console.log(`✅ Loaded ${loadedMessages.length} messages and ${sessionFiles.length} files`);
      } catch (err) {
        console.error('Failed to load messages:', err);
        setError('Failed to load conversation');
      } finally {
        setLoadingMessages(false);
      }
    };

    loadSessionMessages();
  }, [selectedSessionId]);

  useEffect(() => {
    if (!session && !selectedSessionId) {
      createSession();
    }
  }, [session, selectedSessionId, createSession]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const getAuthHeaders = async () => {
    const user = auth.currentUser;
    if (!user) throw new Error('Not authenticated');
    const token = await user.getIdToken();
    return {
      'Authorization': `Bearer ${token}`,
    };
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    for (let i = 0; i < Math.min(files.length, 5); i++) {
      await uploadFile(files[i]);
    }
  };

  const uploadFile = async (file: File) => {
    setUploadingFile(true);
    setError(null);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const authHeaders = await getAuthHeaders();
      
      const currentSessionId = selectedSessionId || session?.id;
      const response = await axios.post(
        `${API_URL}/upload?session_id=${currentSessionId || ''}`, 
        formData, 
        {
          headers: {
            ...authHeaders,
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      setAttachedFiles(prev => [...prev, response.data]);
      console.log('File uploaded:', response.data.filename);
      
      if (onSessionChange) onSessionChange();
    } catch (err: any) {
      console.error('Upload error:', err);
      setError(err.response?.data?.detail || 'Failed to upload file');
    } finally {
      setUploadingFile(false);
    }
  };

  const removeAttachment = (filename: string) => {
    setAttachedFiles(prev => prev.filter(f => f.filename !== filename));
  };

  const handleSendMessage = async (messageText?: string) => {
    const currentSessionId = selectedSessionId || session?.id;
    const textToSend = messageText || input;
    
    if ((!textToSend.trim() && attachedFiles.length === 0) || !currentSessionId || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: textToSend || (attachedFiles.length > 0 ? "Please analyze the uploaded files." : ""),
      timestamp: new Date(),
      attachments: attachedFiles.length > 0 ? [...attachedFiles] : undefined
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    setError(null);

    try {
      const authHeaders = await getAuthHeaders();

      // Always use regular chat endpoint (files are in session now)
      const response = await fetch(`${API_URL}/api/chat/stream`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...authHeaders,
        },
        body: JSON.stringify({
          session_id: currentSessionId,
          message: textToSend || userMessage.content
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: '',
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, assistantMessage]);

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value);
          const lines = chunk.split('\n');

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const data = line.slice(6);
              if (data === '[DONE]') break;

              try {
                const parsed = JSON.parse(data);
                if (parsed.content?.parts) {
                  for (const part of parsed.content.parts) {
                    if (part.text) {
                      assistantMessage.content += part.text;
                      setMessages(prev =>
                        prev.map(msg =>
                          msg.id === assistantMessage.id ? { ...assistantMessage } : msg
                        )
                      );
                    }
                  }
                }
              } catch (e) {
                // Ignore parse errors
              }
            }
          }
        }
      }

      if (onSessionChange) onSessionChange();

    } catch (err: any) {
      setError(err.message || 'Failed to send message');
      console.error('Error sending message:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSend = () => {
    handleSendMessage();
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const getFileIcon = (type: string) => {
    switch (type) {
      case 'pdf':
        return <FileText className="w-4 h-4 text-red-500" />;
      case 'spreadsheet':
        return <Table className="w-4 h-4 text-green-500" />;
      case 'image':
        return <Image className="w-4 h-4 text-blue-500" />;
      default:
        return <FileText className="w-4 h-4 text-gray-500" />;
    }
  };

  const currentSessionId = selectedSessionId || session?.id;

  if (!currentSessionId) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
      </div>
    );
  }

  if (loadingMessages) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary-500 mx-auto mb-2" />
          <p className="text-gray-600">Loading conversation...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-gray-50">
      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <Bot className="w-16 h-16 text-primary-500 mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Start a conversation
            </h3>
            <p className="text-gray-600 mb-4">
              Upload financial documents and ask questions
            </p>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-2 px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
            >
              <Paperclip className="w-4 h-4" />
              Upload Document
            </button>
          </div>
        ) : (
          messages.map((message) => (
            <div
              key={message.id}
              className={`flex gap-3 ${
                message.role === 'user' ? 'justify-end' : 'justify-start'
              }`}
            >
              {message.role === 'assistant' && (
                <div className="w-8 h-8 bg-primary-500 rounded-full flex items-center justify-center flex-shrink-0">
                  <Bot className="w-5 h-5 text-white" />
                </div>
              )}

              <div
                className={`max-w-3xl rounded-2xl px-4 py-3 ${
                  message.role === 'user'
                    ? 'bg-primary-500 text-white'
                    : 'bg-white border border-gray-200'
                }`}
              >
                {message.attachments && message.attachments.length > 0 && (
                  <div className="mb-2 space-y-1">
                    {message.attachments.map((file, idx) => (
                      <div
                        key={idx}
                        className={`flex items-center gap-2 text-xs px-2 py-1 rounded ${
                          message.role === 'user'
                            ? 'bg-primary-600'
                            : 'bg-gray-100 text-gray-700'
                        }`}
                      >
                        {getFileIcon(file.type)}
                        <span>{file.filename}</span>
                        <span className="text-xs opacity-75">
                          ({(file.size / 1024).toFixed(1)} KB)
                        </span>
                      </div>
                    ))}
                  </div>
                )}

                <p className="whitespace-pre-wrap">{message.content}</p>

                <p
                  className={`text-xs mt-2 ${
                    message.role === 'user' ? 'text-primary-100' : 'text-gray-500'
                  }`}
                >
                  {message.timestamp.toLocaleTimeString()}
                </p>
              </div>

              {message.role === 'user' && (
                <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center flex-shrink-0">
                  <User className="w-5 h-5 text-gray-700" />
                </div>
              )}
            </div>
          ))
        )}

        {isLoading && (
          <div className="flex gap-3">
            <div className="w-8 h-8 bg-primary-500 rounded-full flex items-center justify-center flex-shrink-0">
              <Bot className="w-5 h-5 text-white" />
            </div>
            <div className="bg-white border border-gray-200 rounded-2xl px-4 py-3">
              <Loader2 className="w-5 h-5 animate-spin text-primary-500" />
            </div>
          </div>
        )}

        {error && (
          <div className="flex items-center gap-2 p-4 bg-red-50 border border-red-200 rounded-lg">
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Attached Files Preview */}
      {attachedFiles.length > 0 && (
        <div className="border-t border-gray-200 bg-white p-3">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm text-gray-600">Files in session:</span>
            {attachedFiles.map((file, idx) => (
              <div
                key={idx}
                className="flex items-center gap-2 px-3 py-1 bg-primary-50 text-primary-700 rounded-full text-sm"
              >
                {getFileIcon(file.type)}
                <span>{file.filename}</span>
                <button
                  onClick={() => removeAttachment(file.filename)}
                  className="hover:text-primary-900"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Input Area */}
      <div className="border-t border-gray-200 bg-white p-4">
        <div className="flex items-end gap-2">
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept=".pdf,.xlsx,.xls,.csv,.png,.jpg,.jpeg,.webp"
            onChange={handleFileSelect}
            className="hidden"
          />

          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploadingFile}
            className={`p-3 rounded-lg transition-colors ${
              uploadingFile || attachedFiles.length > 0
                ? 'bg-primary-500 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
            title="Attach files"
          >
            {uploadingFile ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Paperclip className="w-5 h-5" />
            )}
          </button>

          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={
              attachedFiles.length > 0
                ? "Ask about the files..."
                : "Type your message..."
            }
            rows={1}
            className="flex-1 resize-none border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            style={{ minHeight: '52px', maxHeight: '150px' }}
          />

          <button
            onClick={handleSend}
            disabled={(!input.trim() && attachedFiles.length === 0) || isLoading}
            className="bg-primary-500 text-white p-3 rounded-lg hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isLoading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Send className="w-5 h-5" />
            )}
          </button>
        </div>

        <p className="text-xs text-gray-500 mt-2">
          Powered by Gemini 2.0 • Supports PDF, Excel, CSV, Images
        </p>
      </div>
    </div>
  );
};
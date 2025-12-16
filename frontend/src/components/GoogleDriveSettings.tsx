import React, { useState, useEffect } from 'react';
import { HardDrive, CheckCircle, XCircle, RefreshCw, FolderOpen, AlertCircle } from 'lucide-react';
import { getStatus, getAuthUrl, disconnect, DriveStatus } from '../services/driveApi';
import FolderSelectorModal from './FolderSelectorModal';

const GoogleDriveSettings: React.FC = () => {
  const [status, setStatus] = useState<DriveStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showFolderModal, setShowFolderModal] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  const loadStatus = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getStatus();
      setStatus(data);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to load status');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStatus();
  }, []);

  const handleConnect = async () => {
    try {
      setActionLoading(true);
      setError(null);
      const { authorization_url } = await getAuthUrl();
      window.location.href = authorization_url;
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to start OAuth flow');
      setActionLoading(false);
    }
  };

  const handleDisconnect = async () => {
    if (!window.confirm('Are you sure you want to disconnect Google Drive?')) {
      return;
    }

    try {
      setActionLoading(true);
      setError(null);
      await disconnect();
      await loadStatus();
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to disconnect');
    } finally {
      setActionLoading(false);
    }
  };

  const handleRefresh = async () => {
    await loadStatus();
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-center py-8">
          <div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <HardDrive className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Google Drive</h2>
              <p className="text-sm text-gray-600">
                Connect your Drive to search documents with AI
              </p>
            </div>
          </div>
          
          {status?.connected ? (
            <div className="flex items-center gap-2 px-3 py-1.5 bg-green-50 border border-green-200 rounded-full">
              <CheckCircle className="w-4 h-4 text-green-600" />
              <span className="text-sm font-medium text-green-700">Connected</span>
            </div>
          ) : (
            <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 border border-gray-200 rounded-full">
              <XCircle className="w-4 h-4 text-gray-500" />
              <span className="text-sm font-medium text-gray-600">Not Connected</span>
            </div>
          )}
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm text-red-800">{error}</p>
            </div>
            <button
              onClick={() => setError(null)}
              className="text-red-600 hover:text-red-700"
            >
              <XCircle className="w-4 h-4" />
            </button>
          </div>
        )}

        {status?.connected && status.corpus_info && (
          <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-gray-600 mb-1">Indexed Files</p>
                <p className="text-lg font-semibold text-gray-900">
                  {status.corpus_info.files_count}
                </p>
              </div>
              {status.corpus_info.indexed_folder_name && (
                <div>
                  <p className="text-xs text-gray-600 mb-1">Folder</p>
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {status.corpus_info.indexed_folder_name}
                  </p>
                </div>
              )}
            </div>
            {status.corpus_info.last_updated && (
              <p className="text-xs text-gray-500 mt-2">
                Last updated: {new Date(status.corpus_info.last_updated).toLocaleString()}
              </p>
            )}
          </div>
        )}

        <div className="flex gap-3">
          {!status?.connected ? (
            <button
              onClick={handleConnect}
              disabled={actionLoading}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-primary-500 text-white rounded-lg hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
            >
              {actionLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Connecting...
                </>
              ) : (
                <>
                  <HardDrive className="w-4 h-4" />
                  Connect Google Drive
                </>
              )}
            </button>
          ) : (
            <>
              <button
                onClick={() => setShowFolderModal(true)}
                disabled={actionLoading}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-primary-500 text-white rounded-lg hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
              >
                <FolderOpen className="w-4 h-4" />
                Select Folder
              </button>
              
              <button
                onClick={handleRefresh}
                disabled={actionLoading}
                className="flex items-center justify-center gap-2 px-4 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <RefreshCw className={`w-4 h-4 ${actionLoading ? 'animate-spin' : ''}`} />
              </button>
              
              <button
                onClick={handleDisconnect}
                disabled={actionLoading}
                className="flex items-center justify-center gap-2 px-4 py-3 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <XCircle className="w-4 h-4" />
              </button>
            </>
          )}
        </div>

        <div className="mt-4 p-3 bg-gray-50 border border-gray-200 rounded-lg">
          <p className="text-xs text-gray-600">
            <strong>Privacy:</strong> Your Drive data is private. Only you can access your indexed documents.
            We store OAuth tokens securely and never share your data.
          </p>
        </div>
      </div>

      {showFolderModal && (
        <FolderSelectorModal
          onClose={() => setShowFolderModal(false)}
          onSuccess={() => {
            setShowFolderModal(false);
            loadStatus();
          }}
        />
      )}
    </>
  );
};

export default GoogleDriveSettings;
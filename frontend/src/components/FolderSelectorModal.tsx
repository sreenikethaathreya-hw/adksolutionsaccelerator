import React, { useState, useEffect } from 'react';
import { X, Search, Folder, CheckCircle, AlertCircle } from 'lucide-react';
import { listFolders, indexFolder, DriveFolder } from '../services/driveApi';

interface FolderSelectorModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

const FolderSelectorModal: React.FC<FolderSelectorModalProps> = ({ onClose, onSuccess }) => {
  const [folders, setFolders] = useState<DriveFolder[]>([]);
  const [filteredFolders, setFilteredFolders] = useState<DriveFolder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFolder, setSelectedFolder] = useState<DriveFolder | null>(null);
  const [indexing, setIndexing] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    loadFolders();
  }, []);

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredFolders(folders);
    } else {
      const query = searchQuery.toLowerCase();
      setFilteredFolders(
        folders.filter(folder =>
          folder.name.toLowerCase().includes(query)
        )
      );
    }
  }, [searchQuery, folders]);

  const loadFolders = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await listFolders();
      setFolders(data.folders);
      setFilteredFolders(data.folders);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to load folders');
    } finally {
      setLoading(false);
    }
  };

  const handleIndexFolder = async () => {
    if (!selectedFolder) return;

    try {
      setIndexing(true);
      setError(null);

      // Call the indexing endpoint
      const result = await indexFolder(selectedFolder.id, selectedFolder.name);

      setSuccess(true);
      setTimeout(() => {
        onSuccess();
      }, 1500);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to index folder');
    } finally {
      setIndexing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Select Folder to Index</h2>
            <p className="text-sm text-gray-600 mt-1">
              Choose a folder from your Google Drive to index
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Search */}
        <div className="p-6 border-b border-gray-200">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search folders..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading && (
            <div className="flex items-center justify-center py-12">
              <div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
          )}

          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          {success && (
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <p className="text-sm text-green-800 font-medium">
                Folder indexed successfully!
              </p>
            </div>
          )}

          {!loading && !error && filteredFolders.length === 0 && (
            <div className="text-center py-12">
              <Folder className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-600">
                {searchQuery ? 'No folders found matching your search' : 'No folders found in your Drive'}
              </p>
            </div>
          )}

          {!loading && !error && filteredFolders.length > 0 && (
            <div className="space-y-2">
              {filteredFolders.map((folder) => (
                <button
                  key={folder.id}
                  onClick={() => setSelectedFolder(folder)}
                  className={`w-full flex items-center gap-3 p-4 rounded-lg border-2 transition-all ${
                    selectedFolder?.id === folder.id
                      ? 'border-primary-500 bg-primary-50'
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <Folder className={`w-5 h-5 ${
                    selectedFolder?.id === folder.id ? 'text-primary-600' : 'text-gray-400'
                  }`} />
                  <span className={`flex-1 text-left font-medium ${
                    selectedFolder?.id === folder.id ? 'text-primary-900' : 'text-gray-900'
                  }`}>
                    {folder.name}
                  </span>
                  {selectedFolder?.id === folder.id && (
                    <CheckCircle className="w-5 h-5 text-primary-600" />
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 flex gap-3">
          <button
            onClick={onClose}
            disabled={indexing}
            className="flex-1 px-4 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
          >
            Cancel
          </button>
          <button
            onClick={handleIndexFolder}
            disabled={!selectedFolder || indexing || success}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-primary-500 text-white rounded-lg hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
          >
            {indexing ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Indexing...
              </>
            ) : success ? (
              <>
                <CheckCircle className="w-4 h-4" />
                Indexed!
              </>
            ) : (
              'Index Folder'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default FolderSelectorModal;
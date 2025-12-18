import axios from 'axios';
import { auth } from '../config/firebase';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

export interface DriveStatus {
  connected: boolean;
  corpus_info?: {
    name: string;
    files_count: number;
    indexed_folder_name?: string;
    last_updated?: string;
  } | null;
}

export interface AuthUrlResponse {
  authorization_url: string;
}

export interface DriveFolder {
  id: string;
  name: string;
  mimeType: string;
}

export interface FoldersResponse {
  folders: DriveFolder[];
  total: number;
}

export interface IndexFolderResponse {
  status: string;
  message: string;
  files_indexed: number;
}

// Create axios instance with base URL
const driveApiClient = axios.create({
  baseURL: API_URL,
});

// Add Firebase token to all requests
driveApiClient.interceptors.request.use(
  async (config) => {
    const user = auth.currentUser;
    
    if (user) {
      try {
        const token = await user.getIdToken();
        config.headers.Authorization = `Bearer ${token}`;
      } catch (error) {
        console.error('Error getting Firebase ID token:', error);
      }
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Handle token refresh on 401
driveApiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const user = auth.currentUser;
        
        if (user) {
          // Force token refresh with Firebase
          const token = await user.getIdToken(true);
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return driveApiClient(originalRequest);
        } else {
          // No user, redirect to login
          window.location.href = '/login';
        }
      } catch (refreshError) {
        console.error('Token refresh failed:', refreshError);
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

// Get Drive connection status
export const getStatus = async (): Promise<DriveStatus> => {
  const response = await driveApiClient.get('/api/drive/status');
  return response.data;
};

// Get OAuth authorization URL
export const getAuthUrl = async (): Promise<AuthUrlResponse> => {
  const response = await driveApiClient.get('/api/drive/auth/url');
  return response.data;
};

// Exchange OAuth code for tokens
export const exchangeCode = async (code: string): Promise<{ success: boolean }> => {
  const response = await driveApiClient.post('/api/drive/auth/callback', { code });
  return response.data;
};

// Disconnect Drive
export const disconnect = async (): Promise<{ success: boolean }> => {
  const response = await driveApiClient.delete('/api/drive/auth/disconnect');
  return response.data;
};

// List Drive folders
export const listFolders = async (): Promise<FoldersResponse> => {
  const response = await driveApiClient.get('/api/drive/folders');
  return response.data;
};

// Index a folder
export const indexFolder = async (folderId: string, folderName: string): Promise<IndexFolderResponse> => {
  const response = await driveApiClient.post('/api/drive/index-folder', {
    folder_id: folderId,
    folder_name: folderName
  });
  return response.data;
};

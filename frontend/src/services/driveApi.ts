import axios from 'axios';

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

// Add auth token to all requests
driveApiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
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
        const refreshToken = localStorage.getItem('refresh_token');
        const response = await axios.post(`${API_URL}/auth/refresh`, {
          refresh_token: refreshToken
        });

        localStorage.setItem('access_token', response.data.access_token);
        localStorage.setItem('refresh_token', response.data.refresh_token);

        originalRequest.headers.Authorization = `Bearer ${response.data.access_token}`;
        return driveApiClient(originalRequest);
      } catch (refreshError) {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
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
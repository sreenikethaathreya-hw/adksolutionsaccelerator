import apiClient from './client';

export interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  connected_services?: {
    google?: boolean;
    salesforce?: boolean;
    sharepoint?: boolean;
  };
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  access_token: string;
  user: User;
}

// Login
export const login = async (credentials: LoginRequest): Promise<LoginResponse> => {
  const response = await apiClient.post('/auth/login', credentials);
  return response.data;
};

// Get current user
export const getCurrentUser = async (): Promise<User> => {
  const response = await apiClient.get('/auth/me');
  return response.data;
};

// Logout
export const logout = async (): Promise<void> => {
  await apiClient.post('/auth/logout');
  localStorage.removeItem('auth_token');
};

// Connect service (Google, Salesforce, etc.)
export const connectService = async (
  service: string,
  authCode: string
): Promise<void> => {
  await apiClient.post('/auth/connect', { service, auth_code: authCode });
};

// Disconnect service
export const disconnectService = async (service: string): Promise<void> => {
  await apiClient.delete(`/auth/disconnect/${service}`);
};
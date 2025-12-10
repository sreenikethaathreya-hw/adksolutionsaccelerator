import React from 'react';
import { Check, Link as LinkIcon, Trash2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { connectService, disconnectService } from '../api/auth';

export const SettingsPage: React.FC = () => {
  const { user } = useAuth();

  const availableServices = [
    { id: 'salesforce', name: 'Salesforce', connected: false },
    { id: 'google', name: 'Google', connected: user?.connected_services?.google || false },
    { id: 'sharepoint', name: 'SharePoint', connected: false },
  ];

  const handleConnect = async (serviceId: string) => {
    try {
      // In real implementation, this would open OAuth flow
      window.alert(`Connect ${serviceId} - OAuth flow would open here`);
    } catch (error) {
      console.error('Failed to connect service:', error);
    }
  };

  const handleDisconnect = async (serviceId: string) => {
    try {
      await disconnectService(serviceId);
      window.location.reload();
    } catch (error) {
      console.error('Failed to disconnect service:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Settings</h1>
        <p className="text-gray-600 mb-8">
          Manage your account settings and connected services.
        </p>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Account Settings */}
          <div className="card">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Account</h2>
            <p className="text-gray-600 mb-6">
              Manage your account details and preferences.
            </p>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Name
                </label>
                <input
                  type="text"
                  value={user?.name || ''}
                  disabled
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  value={user?.email || ''}
                  disabled
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Role
                </label>
                <select
                  value={user?.role || 'Agent User'}
                  disabled
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50"
                >
                  <option value="Agent User">Agent User</option>
                  <option value="Admin">Admin</option>
                </select>
              </div>
            </div>
          </div>

          {/* Connected Services */}
          <div className="card">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Connected Services
            </h2>
            <p className="text-gray-600 mb-6">
              Connect to external services to enable agents to access your data.
            </p>

            {/* Currently Connected */}
            {availableServices.filter(s => s.connected).map((service) => (
              <div key={service.id} className="mb-6 pb-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-gray-900">{service.name}</h3>
                    <p className="text-sm text-gray-500">
                      {user?.email}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      Connected on Dec 8, 2025
                    </p>
                  </div>
                  <button
                    onClick={() => handleDisconnect(service.id)}
                    className="flex items-center gap-2 text-red-600 hover:text-red-700 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span className="text-sm font-medium">Disconnect</span>
                  </button>
                </div>
              </div>
            ))}

            {/* Available Connections */}
            <h3 className="font-medium text-gray-700 mb-4">Available Connections</h3>
            <div className="grid grid-cols-2 gap-4">
              {availableServices.filter(s => !s.connected).map((service) => (
                <button
                  key={service.id}
                  onClick={() => handleConnect(service.id)}
                  className="flex items-center justify-between p-4 border-2 border-gray-200 rounded-lg hover:border-primary-500 transition-colors"
                >
                  <span className="font-medium text-gray-900">{service.name}</span>
                  <LinkIcon className="w-5 h-5 text-gray-400" />
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
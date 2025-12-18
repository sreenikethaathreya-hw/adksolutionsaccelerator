import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { 
  User, 
  Mail, 
  Shield, 
  Bell, 
  Trash2, 
  CheckCircle,
  XCircle,
  Link as LinkIcon,
  Moon,
  Sun,
  Globe,
  LogOut,
} from 'lucide-react';
import GoogleDriveSettings from '../components/GoogleDriveSettings';

interface ConnectedService {
  id: string;
  name: string;
  icon: string;
  connected: boolean;
  connectedEmail?: string;
  connectedDate?: string;
}

export const SettingsPage: React.FC = () => {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<'account' | 'services' | 'preferences'>('account');
  const [notifications, setNotifications] = useState({
    email: true,
    desktop: false,
    agentUpdates: true,
  });
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [language, setLanguage] = useState('en');

  const [services, setServices] = useState<ConnectedService[]>([
    {
      id: 'google',
      name: 'Google',
      icon: '📧',
      connected: user?.connected_services?.google || false,
      connectedEmail: user?.email,
      connectedDate: 'Dec 8, 2025',
    },
    {
      id: 'salesforce',
      name: 'Salesforce',
      icon: '☁️',
      connected: user?.connected_services?.salesforce || false,
    },
    {
      id: 'sharepoint',
      name: 'SharePoint',
      icon: '📁',
      connected: user?.connected_services?.sharepoint || false,
    },
    {
      id: 'slack',
      name: 'Slack',
      icon: '💬',
      connected: false,
    },
  ]);

  const handleConnect = async (serviceId: string) => {
    // Mock connection - in production, this would open OAuth flow
    alert(`Opening OAuth flow for ${serviceId}...`);
    
    // Simulate successful connection
    setServices(services.map(s => 
      s.id === serviceId 
        ? { ...s, connected: true, connectedEmail: user?.email, connectedDate: new Date().toLocaleDateString() }
        : s
    ));
  };

  const handleDisconnect = async (serviceId: string) => {
    if (window.confirm(`Are you sure you want to disconnect ${serviceId}?`)) {
      setServices(services.map(s => 
        s.id === serviceId 
          ? { ...s, connected: false, connectedEmail: undefined, connectedDate: undefined }
          : s
      ));
    }
  };

  const handleLogout = async () => {
    if (window.confirm('Are you sure you want to sign out?')) {
      await logout();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Settings</h1>
          <p className="text-lg text-gray-600">
            Manage your account settings and connected services.
          </p>
        </div>

        <div className="grid lg:grid-cols-4 gap-6">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-2">
              <button
                onClick={() => setActiveTab('account')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors ${
                  activeTab === 'account'
                    ? 'bg-primary-50 text-primary-600'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <User className="w-5 h-5" />
                <span className="font-medium">Account</span>
              </button>
              
              <button
                onClick={() => setActiveTab('services')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors ${
                  activeTab === 'services'
                    ? 'bg-primary-50 text-primary-600'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <LinkIcon className="w-5 h-5" />
                <span className="font-medium">Connected Services</span>
              </button>
              
              <button
                onClick={() => setActiveTab('preferences')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors ${
                  activeTab === 'preferences'
                    ? 'bg-primary-50 text-primary-600'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <Bell className="w-5 h-5" />
                <span className="font-medium">Preferences</span>
              </button>
            </div>

            {/* Logout Button */}
            <button
              onClick={handleLogout}
              className="w-full mt-4 flex items-center justify-center gap-2 px-4 py-3 bg-white border-2 border-gray-200 rounded-xl text-gray-700 hover:bg-red-50 hover:border-red-300 hover:text-red-600 transition-colors"
            >
              <LogOut className="w-5 h-5" />
              <span className="font-medium">Sign Out</span>
            </button>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* Account Tab */}
            {activeTab === 'account' && (
              <div className="space-y-6">
                {/* Profile Information */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
                    <User className="w-5 h-5" />
                    Profile Information
                  </h2>

                  <div className="space-y-4">
                    {/* Name */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Full Name
                      </label>
                      <input
                        type="text"
                        value={user?.name || ''}
                        disabled
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-900"
                      />
                    </div>

                    {/* Email */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email Address
                      </label>
                      <div className="relative">
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                          type="email"
                          value={user?.email || ''}
                          disabled
                          className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-900"
                        />
                      </div>
                    </div>

                    {/* Role */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Role
                      </label>
                      <div className="relative">
                        <Shield className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <select
                          value={user?.role || 'Agent User'}
                          disabled
                          className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-900 appearance-none"
                        >
                          <option value="Agent User">Agent User</option>
                          <option value="Admin">Admin</option>
                          <option value="Developer">Developer</option>
                        </select>
                      </div>
                    </div>

                    {/* User ID */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        User ID
                      </label>
                      <input
                        type="text"
                        value={user?.id || ''}
                        disabled
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-500 font-mono text-sm"
                      />
                    </div>
                  </div>
                </div>

                {/* Account Actions */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">Account Actions</h2>
                  <p className="text-gray-600 mb-6 text-sm">
                    Manage your account settings and data
                  </p>

                  <div className="space-y-3">
                    <button className="w-full px-4 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-left font-medium">
                      Change Password
                    </button>
                    <button className="w-full px-4 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-left font-medium">
                      Export My Data
                    </button>
                    <button className="w-full px-4 py-3 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors text-left font-medium flex items-center gap-2">
                      <Trash2 className="w-5 h-5" />
                      Delete Account
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Services Tab */}
            {activeTab === 'services' && (
              <div className="space-y-6">
                <GoogleDriveSettings />
                {/* Connected Services */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-2 flex items-center gap-2">
                    <LinkIcon className="w-5 h-5" />
                    Connected Services
                  </h2>
                  <p className="text-gray-600 mb-6 text-sm">
                    Connect external services to enable agents to access your data
                  </p>

                  {/* Currently Connected */}
                  {services.filter(s => s.connected).length > 0 && (
                    <div className="mb-6">
                      <h3 className="text-sm font-medium text-gray-700 mb-3">Active Connections</h3>
                      <div className="space-y-3">
                        {services.filter(s => s.connected).map((service) => (
                          <div
                            key={service.id}
                            className="flex items-center justify-between p-4 border-2 border-green-200 bg-green-50 rounded-lg"
                          >
                            <div className="flex items-center gap-3">
                              <div className="text-2xl">{service.icon}</div>
                              <div>
                                <div className="flex items-center gap-2">
                                  <h4 className="font-semibold text-gray-900">{service.name}</h4>
                                  <CheckCircle className="w-4 h-4 text-green-600" />
                                </div>
                                {service.connectedEmail && (
                                  <p className="text-sm text-gray-600">{service.connectedEmail}</p>
                                )}
                                {service.connectedDate && (
                                  <p className="text-xs text-gray-500">Connected on {service.connectedDate}</p>
                                )}
                              </div>
                            </div>
                            <button
                              onClick={() => handleDisconnect(service.id)}
                              className="flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            >
                              <XCircle className="w-4 h-4" />
                              <span className="text-sm font-medium">Disconnect</span>
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Available Services */}
                  {services.filter(s => !s.connected).length > 0 && (
                    <div>
                      <h3 className="text-sm font-medium text-gray-700 mb-3">Available Services</h3>
                      <div className="grid md:grid-cols-2 gap-4">
                        {services.filter(s => !s.connected).map((service) => (
                          <button
                            key={service.id}
                            onClick={() => handleConnect(service.id)}
                            className="flex items-center justify-between p-4 border-2 border-gray-200 rounded-lg hover:border-primary-500 hover:bg-primary-50 transition-colors text-left"
                          >
                            <div className="flex items-center gap-3">
                              <div className="text-2xl">{service.icon}</div>
                              <span className="font-medium text-gray-900">{service.name}</span>
                            </div>
                            <LinkIcon className="w-5 h-5 text-gray-400" />
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Service Permissions */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-2">Permissions</h2>
                  <p className="text-gray-600 mb-4 text-sm">
                    Control what agents can access
                  </p>

                  <div className="space-y-3">
                    <label className="flex items-center justify-between p-4 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                      <div>
                        <div className="font-medium text-gray-900">Read documents</div>
                        <div className="text-sm text-gray-500">Allow agents to read files from connected services</div>
                      </div>
                      <input type="checkbox" defaultChecked className="w-5 h-5 text-primary-600" />
                    </label>
                    
                    <label className="flex items-center justify-between p-4 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                      <div>
                        <div className="font-medium text-gray-900">Write documents</div>
                        <div className="text-sm text-gray-500">Allow agents to create and modify files</div>
                      </div>
                      <input type="checkbox" className="w-5 h-5 text-primary-600" />
                    </label>
                    
                    <label className="flex items-center justify-between p-4 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                      <div>
                        <div className="font-medium text-gray-900">Access calendar</div>
                        <div className="text-sm text-gray-500">Allow agents to view and create calendar events</div>
                      </div>
                      <input type="checkbox" className="w-5 h-5 text-primary-600" />
                    </label>
                  </div>
                </div>
              </div>
            )}

            {/* Preferences Tab */}
            {activeTab === 'preferences' && (
              <div className="space-y-6">
                {/* Notifications */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-2 flex items-center gap-2">
                    <Bell className="w-5 h-5" />
                    Notifications
                  </h2>
                  <p className="text-gray-600 mb-6 text-sm">
                    Choose how you want to be notified
                  </p>

                  <div className="space-y-4">
                    <label className="flex items-center justify-between p-4 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                      <div>
                        <div className="font-medium text-gray-900">Email notifications</div>
                        <div className="text-sm text-gray-500">Receive updates via email</div>
                      </div>
                      <input
                        type="checkbox"
                        checked={notifications.email}
                        onChange={(e) => setNotifications({ ...notifications, email: e.target.checked })}
                        className="w-5 h-5 text-primary-600"
                      />
                    </label>

                    <label className="flex items-center justify-between p-4 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                      <div>
                        <div className="font-medium text-gray-900">Desktop notifications</div>
                        <div className="text-sm text-gray-500">Show browser notifications</div>
                      </div>
                      <input
                        type="checkbox"
                        checked={notifications.desktop}
                        onChange={(e) => setNotifications({ ...notifications, desktop: e.target.checked })}
                        className="w-5 h-5 text-primary-600"
                      />
                    </label>

                    <label className="flex items-center justify-between p-4 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                      <div>
                        <div className="font-medium text-gray-900">Agent updates</div>
                        <div className="text-sm text-gray-500">Notify when new agents are available</div>
                      </div>
                      <input
                        type="checkbox"
                        checked={notifications.agentUpdates}
                        onChange={(e) => setNotifications({ ...notifications, agentUpdates: e.target.checked })}
                        className="w-5 h-5 text-primary-600"
                      />
                    </label>
                  </div>
                </div>

                {/* Appearance */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-2">Appearance</h2>
                  <p className="text-gray-600 mb-6 text-sm">
                    Customize how HatchWorks AI looks
                  </p>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">Theme</label>
                    <div className="grid grid-cols-2 gap-4">
                      <button
                        onClick={() => setTheme('light')}
                        className={`flex items-center gap-3 p-4 border-2 rounded-lg transition-colors ${
                          theme === 'light'
                            ? 'border-primary-500 bg-primary-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <Sun className="w-5 h-5" />
                        <span className="font-medium">Light</span>
                      </button>
                      
                      <button
                        onClick={() => setTheme('dark')}
                        className={`flex items-center gap-3 p-4 border-2 rounded-lg transition-colors ${
                          theme === 'dark'
                            ? 'border-primary-500 bg-primary-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <Moon className="w-5 h-5" />
                        <span className="font-medium">Dark</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Language */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-2 flex items-center gap-2">
                    <Globe className="w-5 h-5" />
                    Language & Region
                  </h2>
                  <p className="text-gray-600 mb-6 text-sm">
                    Set your preferred language
                  </p>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Language</label>
                    <select
                      value={language}
                      onChange={(e) => setLanguage(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    >
                      <option value="en">English</option>
                      <option value="es">Español</option>
                      <option value="fr">Français</option>
                      <option value="de">Deutsch</option>
                      <option value="ja">日本語</option>
                      <option value="zh">中文</option>
                    </select>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
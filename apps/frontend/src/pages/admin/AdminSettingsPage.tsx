import React, { useState, useEffect } from 'react';
import {
  Save,
  RefreshCw,
  Settings,
  Shield,
  Mail,
  Database,
  Server,
  Globe,
  Eye,
  EyeOff,
} from 'lucide-react';
import { AdminLayout } from '../../components/admin/AdminLayout';

interface SystemSettings {
  general: {
    siteName: string;
    siteDescription: string;
    siteUrl: string;
    maintenanceMode: boolean;
    allowRegistration: boolean;
    defaultUserRole: 'user' | 'premium';
  };
  security: {
    maxLoginAttempts: number;
    lockoutDuration: number;
    passwordMinLength: number;
    requireSpecialChars: boolean;
    requireNumbers: boolean;
    requireUppercase: boolean;
    twoFactorEnabled: boolean;
  };
  email: {
    smtpHost: string;
    smtpPort: number;
    smtpUsername: string;
    smtpPassword: string;
    fromEmail: string;
    fromName: string;
    enableNotifications: boolean;
  };
  database: {
    maxConnections: number;
    connectionTimeout: number;
    queryTimeout: number;
    backupEnabled: boolean;
    backupInterval: number;
    retentionDays: number;
  };
  performance: {
    cacheEnabled: boolean;
    cacheDuration: number;
    maxUploadSize: number;
    rateLimitEnabled: boolean;
    rateLimitRequests: number;
    rateLimitWindow: number;
  };
  gamification: {
    xpPerProblem: number;
    xpPerChallenge: number;
    coinRewardMultiplier: number;
    streakBonus: number;
    levelUpThreshold: number;
    dailyChallengeReward: number;
  };
}

const AdminSettingsPage: React.FC = () => {
  const [settings, setSettings] = useState<SystemSettings>({
    general: {
      siteName: 'DSA Learning Platform',
      siteDescription:
        'Master Data Structures and Algorithms with interactive coding challenges',
      siteUrl: 'https://dsa-platform.com',
      maintenanceMode: false,
      allowRegistration: true,
      defaultUserRole: 'user',
    },
    security: {
      maxLoginAttempts: 5,
      lockoutDuration: 30,
      passwordMinLength: 8,
      requireSpecialChars: true,
      requireNumbers: true,
      requireUppercase: true,
      twoFactorEnabled: false,
    },
    email: {
      smtpHost: 'smtp.gmail.com',
      smtpPort: 587,
      smtpUsername: '',
      smtpPassword: '',
      fromEmail: 'noreply@dsa-platform.com',
      fromName: 'DSA Platform',
      enableNotifications: true,
    },
    database: {
      maxConnections: 100,
      connectionTimeout: 30000,
      queryTimeout: 10000,
      backupEnabled: true,
      backupInterval: 24,
      retentionDays: 30,
    },
    performance: {
      cacheEnabled: true,
      cacheDuration: 3600,
      maxUploadSize: 10,
      rateLimitEnabled: true,
      rateLimitRequests: 100,
      rateLimitWindow: 900,
    },
    gamification: {
      xpPerProblem: 100,
      xpPerChallenge: 500,
      coinRewardMultiplier: 1.5,
      streakBonus: 50,
      levelUpThreshold: 1000,
      dailyChallengeReward: 50,
    },
  });

  const [activeTab, setActiveTab] = useState<
    | 'general'
    | 'security'
    | 'email'
    | 'database'
    | 'performance'
    | 'gamification'
  >('general');
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/admin/settings');
      if (response.ok) {
        const data = await response.json();
        setSettings(data);
      }
    } catch (error) {
      console.error('Failed to fetch settings:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const response = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });

      if (response.ok) {
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
      }
    } catch (error) {
      console.error('Failed to save settings:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const updateSettings = <K extends keyof SystemSettings, F extends keyof SystemSettings[K]>(
    section: K,
    field: F,
    value: SystemSettings[K][F]
  ) => {
    setSettings(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value,
      },
    }));
  };

  const tabs = [
    { id: 'general', name: 'General', icon: Settings },
    { id: 'security', name: 'Security', icon: Shield },
    { id: 'email', name: 'Email', icon: Mail },
    { id: 'database', name: 'Database', icon: Database },
    { id: 'performance', name: 'Performance', icon: Server },
    { id: 'gamification', name: 'Gamification', icon: Globe },
  ];

  return (
    <AdminLayout>
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            System Settings
          </h1>
          <p className="text-gray-600">
            Configure platform-wide settings and preferences
          </p>
        </div>

        {saveSuccess && (
          <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-xs">✓</span>
                </div>
              </div>
              <div className="ml-3">
                <p className="text-green-800 font-medium">
                  Settings saved successfully!
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="border-b border-gray-200">
            <nav className="flex -mb-px">
              {tabs.map(tab => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as typeof activeTab)}
                    className={`py-4 px-6 text-sm font-medium border-b-2 transition-colors ${
                      activeTab === tab.id
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <Icon className="w-4 h-4 inline-block mr-2" />
                    {tab.name}
                  </button>
                );
              })}
            </nav>
          </div>

          <div className="p-6">
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <RefreshCw className="w-8 h-8 text-gray-400 animate-spin" />
              </div>
            ) : (
              <div className="space-y-6">
                {activeTab === 'general' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Site Name
                      </label>
                      <input
                        type="text"
                        value={settings.general.siteName}
                        onChange={e =>
                          updateSettings('general', 'siteName', e.target.value)
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Site URL
                      </label>
                      <input
                        type="url"
                        value={settings.general.siteUrl}
                        onChange={e =>
                          updateSettings('general', 'siteUrl', e.target.value)
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Site Description
                      </label>
                      <textarea
                        value={settings.general.siteDescription}
                        onChange={e =>
                          updateSettings(
                            'general',
                            'siteDescription',
                            e.target.value
                          )
                        }
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="flex items-center space-x-3">
                        <input
                          type="checkbox"
                          checked={settings.general.maintenanceMode}
                          onChange={e =>
                            updateSettings(
                              'general',
                              'maintenanceMode',
                              e.target.checked
                            )
                          }
                          className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        />
                        <span className="text-sm font-medium text-gray-700">
                          Maintenance Mode
                        </span>
                      </label>
                    </div>

                    <div>
                      <label className="flex items-center space-x-3">
                        <input
                          type="checkbox"
                          checked={settings.general.allowRegistration}
                          onChange={e =>
                            updateSettings(
                              'general',
                              'allowRegistration',
                              e.target.checked
                            )
                          }
                          className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        />
                        <span className="text-sm font-medium text-gray-700">
                          Allow Registration
                        </span>
                      </label>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Default User Role
                      </label>
                      <select
                        value={settings.general.defaultUserRole}
                        onChange={e =>
                          updateSettings(
                            'general',
                            'defaultUserRole',
                            e.target.value as 'user' | 'premium'
                          )
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="user">User</option>
                        <option value="premium">Premium</option>
                      </select>
                    </div>
                  </div>
                )}

                {activeTab === 'security' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Max Login Attempts
                      </label>
                      <input
                        type="number"
                        value={settings.security.maxLoginAttempts}
                        onChange={e =>
                          updateSettings(
                            'security',
                            'maxLoginAttempts',
                            parseInt(e.target.value)
                          )
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Lockout Duration (minutes)
                      </label>
                      <input
                        type="number"
                        value={settings.security.lockoutDuration}
                        onChange={e =>
                          updateSettings(
                            'security',
                            'lockoutDuration',
                            parseInt(e.target.value)
                          )
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Minimum Password Length
                      </label>
                      <input
                        type="number"
                        value={settings.security.passwordMinLength}
                        onChange={e =>
                          updateSettings(
                            'security',
                            'passwordMinLength',
                            parseInt(e.target.value)
                          )
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="flex items-center space-x-3">
                        <input
                          type="checkbox"
                          checked={settings.security.requireSpecialChars}
                          onChange={e =>
                            updateSettings(
                              'security',
                              'requireSpecialChars',
                              e.target.checked
                            )
                          }
                          className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        />
                        <span className="text-sm font-medium text-gray-700">
                          Require Special Characters
                        </span>
                      </label>
                    </div>

                    <div>
                      <label className="flex items-center space-x-3">
                        <input
                          type="checkbox"
                          checked={settings.security.requireNumbers}
                          onChange={e =>
                            updateSettings(
                              'security',
                              'requireNumbers',
                              e.target.checked
                            )
                          }
                          className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        />
                        <span className="text-sm font-medium text-gray-700">
                          Require Numbers
                        </span>
                      </label>
                    </div>

                    <div>
                      <label className="flex items-center space-x-3">
                        <input
                          type="checkbox"
                          checked={settings.security.requireUppercase}
                          onChange={e =>
                            updateSettings(
                              'security',
                              'requireUppercase',
                              e.target.checked
                            )
                          }
                          className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        />
                        <span className="text-sm font-medium text-gray-700">
                          Require Uppercase Letters
                        </span>
                      </label>
                    </div>

                    <div>
                      <label className="flex items-center space-x-3">
                        <input
                          type="checkbox"
                          checked={settings.security.twoFactorEnabled}
                          onChange={e =>
                            updateSettings(
                              'security',
                              'twoFactorEnabled',
                              e.target.checked
                            )
                          }
                          className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        />
                        <span className="text-sm font-medium text-gray-700">
                          Enable Two-Factor Authentication
                        </span>
                      </label>
                    </div>
                  </div>
                )}

                {activeTab === 'email' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        SMTP Host
                      </label>
                      <input
                        type="text"
                        value={settings.email.smtpHost}
                        onChange={e =>
                          updateSettings('email', 'smtpHost', e.target.value)
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        SMTP Port
                      </label>
                      <input
                        type="number"
                        value={settings.email.smtpPort}
                        onChange={e =>
                          updateSettings(
                            'email',
                            'smtpPort',
                            parseInt(e.target.value)
                          )
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        SMTP Username
                      </label>
                      <input
                        type="text"
                        value={settings.email.smtpUsername}
                        onChange={e =>
                          updateSettings(
                            'email',
                            'smtpUsername',
                            e.target.value
                          )
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        SMTP Password
                      </label>
                      <div className="relative">
                        <input
                          type={showPassword ? 'text' : 'password'}
                          value={settings.email.smtpPassword}
                          onChange={e =>
                            updateSettings(
                              'email',
                              'smtpPassword',
                              e.target.value
                            )
                          }
                          className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute inset-y-0 right-0 pr-3 flex items-center"
                        >
                          {showPassword ? (
                            <EyeOff className="w-4 h-4 text-gray-400" />
                          ) : (
                            <Eye className="w-4 h-4 text-gray-400" />
                          )}
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        From Email
                      </label>
                      <input
                        type="email"
                        value={settings.email.fromEmail}
                        onChange={e =>
                          updateSettings('email', 'fromEmail', e.target.value)
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        From Name
                      </label>
                      <input
                        type="text"
                        value={settings.email.fromName}
                        onChange={e =>
                          updateSettings('email', 'fromName', e.target.value)
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="flex items-center space-x-3">
                        <input
                          type="checkbox"
                          checked={settings.email.enableNotifications}
                          onChange={e =>
                            updateSettings(
                              'email',
                              'enableNotifications',
                              e.target.checked
                            )
                          }
                          className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        />
                        <span className="text-sm font-medium text-gray-700">
                          Enable Email Notifications
                        </span>
                      </label>
                    </div>
                  </div>
                )}

                {activeTab === 'database' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Max Connections
                      </label>
                      <input
                        type="number"
                        value={settings.database.maxConnections}
                        onChange={e =>
                          updateSettings(
                            'database',
                            'maxConnections',
                            parseInt(e.target.value)
                          )
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Connection Timeout (ms)
                      </label>
                      <input
                        type="number"
                        value={settings.database.connectionTimeout}
                        onChange={e =>
                          updateSettings(
                            'database',
                            'connectionTimeout',
                            parseInt(e.target.value)
                          )
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Query Timeout (ms)
                      </label>
                      <input
                        type="number"
                        value={settings.database.queryTimeout}
                        onChange={e =>
                          updateSettings(
                            'database',
                            'queryTimeout',
                            parseInt(e.target.value)
                          )
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="flex items-center space-x-3">
                        <input
                          type="checkbox"
                          checked={settings.database.backupEnabled}
                          onChange={e =>
                            updateSettings(
                              'database',
                              'backupEnabled',
                              e.target.checked
                            )
                          }
                          className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        />
                        <span className="text-sm font-medium text-gray-700">
                          Enable Automatic Backups
                        </span>
                      </label>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Backup Interval (hours)
                      </label>
                      <input
                        type="number"
                        value={settings.database.backupInterval}
                        onChange={e =>
                          updateSettings(
                            'database',
                            'backupInterval',
                            parseInt(e.target.value)
                          )
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Retention Days
                      </label>
                      <input
                        type="number"
                        value={settings.database.retentionDays}
                        onChange={e =>
                          updateSettings(
                            'database',
                            'retentionDays',
                            parseInt(e.target.value)
                          )
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                )}

                {activeTab === 'performance' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="flex items-center space-x-3">
                        <input
                          type="checkbox"
                          checked={settings.performance.cacheEnabled}
                          onChange={e =>
                            updateSettings(
                              'performance',
                              'cacheEnabled',
                              e.target.checked
                            )
                          }
                          className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        />
                        <span className="text-sm font-medium text-gray-700">
                          Enable Caching
                        </span>
                      </label>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Cache Duration (seconds)
                      </label>
                      <input
                        type="number"
                        value={settings.performance.cacheDuration}
                        onChange={e =>
                          updateSettings(
                            'performance',
                            'cacheDuration',
                            parseInt(e.target.value)
                          )
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Max Upload Size (MB)
                      </label>
                      <input
                        type="number"
                        value={settings.performance.maxUploadSize}
                        onChange={e =>
                          updateSettings(
                            'performance',
                            'maxUploadSize',
                            parseInt(e.target.value)
                          )
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="flex items-center space-x-3">
                        <input
                          type="checkbox"
                          checked={settings.performance.rateLimitEnabled}
                          onChange={e =>
                            updateSettings(
                              'performance',
                              'rateLimitEnabled',
                              e.target.checked
                            )
                          }
                          className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        />
                        <span className="text-sm font-medium text-gray-700">
                          Enable Rate Limiting
                        </span>
                      </label>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Rate Limit Requests
                      </label>
                      <input
                        type="number"
                        value={settings.performance.rateLimitRequests}
                        onChange={e =>
                          updateSettings(
                            'performance',
                            'rateLimitRequests',
                            parseInt(e.target.value)
                          )
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Rate Limit Window (seconds)
                      </label>
                      <input
                        type="number"
                        value={settings.performance.rateLimitWindow}
                        onChange={e =>
                          updateSettings(
                            'performance',
                            'rateLimitWindow',
                            parseInt(e.target.value)
                          )
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                )}

                {activeTab === 'gamification' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        XP Per Problem
                      </label>
                      <input
                        type="number"
                        value={settings.gamification.xpPerProblem}
                        onChange={e =>
                          updateSettings(
                            'gamification',
                            'xpPerProblem',
                            parseInt(e.target.value)
                          )
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        XP Per Challenge
                      </label>
                      <input
                        type="number"
                        value={settings.gamification.xpPerChallenge}
                        onChange={e =>
                          updateSettings(
                            'gamification',
                            'xpPerChallenge',
                            parseInt(e.target.value)
                          )
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Coin Reward Multiplier
                      </label>
                      <input
                        type="number"
                        step="0.1"
                        value={settings.gamification.coinRewardMultiplier}
                        onChange={e =>
                          updateSettings(
                            'gamification',
                            'coinRewardMultiplier',
                            parseFloat(e.target.value)
                          )
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Streak Bonus
                      </label>
                      <input
                        type="number"
                        value={settings.gamification.streakBonus}
                        onChange={e =>
                          updateSettings(
                            'gamification',
                            'streakBonus',
                            parseInt(e.target.value)
                          )
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Level Up Threshold
                      </label>
                      <input
                        type="number"
                        value={settings.gamification.levelUpThreshold}
                        onChange={e =>
                          updateSettings(
                            'gamification',
                            'levelUpThreshold',
                            parseInt(e.target.value)
                          )
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Daily Challenge Reward
                      </label>
                      <input
                        type="number"
                        value={settings.gamification.dailyChallengeReward}
                        onChange={e =>
                          updateSettings(
                            'gamification',
                            'dailyChallengeReward',
                            parseInt(e.target.value)
                          )
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-end space-x-3">
            <button
              onClick={fetchSettings}
              disabled={isLoading}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
            >
              <RefreshCw
                className={`w-4 h-4 inline-block mr-2 ${isLoading ? 'animate-spin' : ''}`}
              />
              Reset
            </button>
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
            >
              <Save
                className={`w-4 h-4 inline-block mr-2 ${isSaving ? 'animate-spin' : ''}`}
              />
              Save Changes
            </button>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminSettingsPage;
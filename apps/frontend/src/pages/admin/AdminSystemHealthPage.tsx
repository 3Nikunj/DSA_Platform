import React, { useState, useEffect } from 'react';
import { Server, Activity, AlertTriangle, CheckCircle, XCircle, Clock, RefreshCw } from 'lucide-react';
import { AdminLayout } from '../../components/admin/AdminLayout';

interface SystemHealth {
  status: 'healthy' | 'warning' | 'critical';
  uptime: number;
  lastCheck: string;
  services: {
    api: { status: 'healthy' | 'warning' | 'critical'; responseTime: number; uptime: number };
    database: { status: 'healthy' | 'warning' | 'critical'; connections: number; maxConnections: number; queryTime: number };
    cache: { status: 'healthy' | 'warning' | 'critical'; hitRate: number; memoryUsage: number };
    storage: { status: 'healthy' | 'warning' | 'critical'; usage: number; total: number };
    email: { status: 'healthy' | 'warning' | 'critical'; queueSize: number; errorRate: number };
  };
  metrics: {
    cpuUsage: number;
    memoryUsage: number;
    diskUsage: number;
    networkLatency: number;
    activeUsers: number;
    requestsPerSecond: number;
    errorRate: number;
  };
  alerts: Array<{
    id: string;
    type: 'info' | 'warning' | 'error' | 'critical';
    title: string;
    description: string;
    timestamp: string;
    service: string;
    acknowledged: boolean;
  }>;
}

const AdminSystemHealthPage: React.FC = () => {
  const [health, setHealth] = useState<SystemHealth>({
    status: 'healthy',
    uptime: 99.8,
    lastCheck: new Date().toISOString(),
    services: {
      api: { status: 'healthy', responseTime: 120, uptime: 99.9 },
      database: { status: 'healthy', connections: 45, maxConnections: 100, queryTime: 45 },
      cache: { status: 'healthy', hitRate: 94, memoryUsage: 68 },
      storage: { status: 'healthy', usage: 234, total: 500 },
      email: { status: 'warning', queueSize: 12, errorRate: 2.3 }
    },
    metrics: {
      cpuUsage: 32,
      memoryUsage: 58,
      diskUsage: 47,
      networkLatency: 23,
      activeUsers: 1247,
      requestsPerSecond: 45,
      errorRate: 0.8
    },
    alerts: [
      {
        id: '1',
        type: 'warning',
        title: 'Email Queue Growing',
        description: 'Email queue size has increased to 12 messages',
        timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
        service: 'email',
        acknowledged: false
      },
      {
        id: '2',
        type: 'info',
        title: 'High User Activity',
        description: 'Active user count is above average for this time',
        timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
        service: 'api',
        acknowledged: false
      },
      {
        id: '3',
        type: 'error',
        title: 'Database Connection Spike',
        description: 'Database connections increased by 30% in the last hour',
        timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
        service: 'database',
        acknowledged: true
      }
    ]
  });

  const [autoRefresh, setAutoRefresh] = useState(true);
  const [refreshInterval] = useState(30);
  const [lastRefresh, setLastRefresh] = useState(new Date());

  useEffect(() => {
    if (autoRefresh) {
      const interval = setInterval(() => {
        refreshHealth();
      }, refreshInterval * 1000);
      return () => clearInterval(interval);
    }
  }, [autoRefresh, refreshInterval]);

  const refreshHealth = async () => {
    try {
      const response = await fetch('/api/admin/system-health');
      if (response.ok) {
        const data = await response.json();
        setHealth(data);
        setLastRefresh(new Date());
      }
    } catch (error) {
      console.error('Failed to fetch system health:', error);
    }
  };

  const acknowledgeAlert = async (alertId: string) => {
    try {
      const response = await fetch(`/api/admin/alerts/${alertId}/acknowledge`, {
        method: 'PUT'
      });
      if (response.ok) {
        setHealth(prev => ({
          ...prev,
          alerts: prev.alerts.map(alert => 
            alert.id === alertId ? { ...alert, acknowledged: true } : alert
          )
        }));
      }
    } catch (error) {
      console.error('Failed to acknowledge alert:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'text-green-600 bg-green-50';
      case 'warning': return 'text-yellow-600 bg-yellow-50';
      case 'critical': return 'text-red-600 bg-red-50';
      case 'error': return 'text-red-600 bg-red-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy': return <CheckCircle className="w-5 h-5" />;
      case 'warning': return <AlertTriangle className="w-5 h-5" />;
      case 'critical': return <XCircle className="w-5 h-5" />;
      case 'error': return <XCircle className="w-5 h-5" />;
      default: return <Clock className="w-5 h-5" />;
    }
  };

  const formatUptime = (uptime: number) => {
    return `${uptime.toFixed(1)}%`;
  };

  const formatDuration = (minutes: number) => {
    if (minutes < 60) return `${Math.floor(minutes)}m ago`;
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return `${hours}h ${remainingMinutes}m ago`;
  };

  const getMetricStatus = (value: number, thresholds: { good: number; warning: number; critical: number }) => {
    if (value >= thresholds.critical) return 'critical';
    if (value >= thresholds.warning) return 'warning';
    return 'healthy';
  };

  return (
    <AdminLayout>
      <div className="p-6">
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">System Health</h1>
              <p className="text-gray-600">Monitor platform infrastructure and performance</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <label className="text-sm font-medium text-gray-700">Auto Refresh</label>
                <button
                  onClick={() => setAutoRefresh(!autoRefresh)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                    autoRefresh ? 'bg-blue-600' : 'bg-gray-200'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      autoRefresh ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
              <button
                onClick={refreshHealth}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 flex items-center gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                Refresh
              </button>
              <div className="text-sm text-gray-500">
                Last updated: {lastRefresh.toLocaleTimeString()}
              </div>
            </div>
          </div>
        </div>

        {/* Overall System Status */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className={`p-3 rounded-full ${getStatusColor(health.status)}`}>
                  {getStatusIcon(health.status)}
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">System Status</h2>
                  <p className="text-gray-600">All systems operational</p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-gray-900">{formatUptime(health.uptime)}</div>
                <div className="text-sm text-gray-500">Uptime</div>
              </div>
            </div>
          </div>

          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
              {Object.entries(health.services).map(([serviceName, service]) => (
                <div key={serviceName} className="text-center">
                  <div className={`inline-flex items-center justify-center w-12 h-12 rounded-full ${getStatusColor(service.status)} mb-3`}>
                    {getStatusIcon(service.status)}
                  </div>
                  <h3 className="text-sm font-medium text-gray-900 capitalize mb-1">{serviceName}</h3>
                  <div className="text-xs text-gray-500">
                    {serviceName === 'api' && `${(service as typeof health.services.api).responseTime}ms`}
                    {serviceName === 'database' && `${(service as typeof health.services.database).connections}/${(service as typeof health.services.database).maxConnections}`}
                    {serviceName === 'cache' && `${(service as typeof health.services.cache).hitRate}% hit rate`}
                    {serviceName === 'storage' && `${(service as typeof health.services.storage).usage}/${(service as typeof health.services.storage).total}GB`}
                    {serviceName === 'email' && `${(service as typeof health.services.email).queueSize} queued`}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* System Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-gray-500">CPU Usage</h3>
              <div className={`p-2 rounded-full ${getStatusColor(getMetricStatus(health.metrics.cpuUsage, { good: 50, warning: 70, critical: 90 }))}`}>
                <Activity className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-bold text-gray-900">{health.metrics.cpuUsage}%</div>
            <div className="mt-2">
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full ${
                    health.metrics.cpuUsage < 50 ? 'bg-green-500' :
                    health.metrics.cpuUsage < 70 ? 'bg-yellow-500' : 'bg-red-500'
                  }`}
                  style={{ width: `${health.metrics.cpuUsage}%` }}
                />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-gray-500">Memory Usage</h3>
              <div className={`p-2 rounded-full ${getStatusColor(getMetricStatus(health.metrics.memoryUsage, { good: 60, warning: 80, critical: 95 }))}`}>
                <Server className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-bold text-gray-900">{health.metrics.memoryUsage}%</div>
            <div className="mt-2">
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full ${
                    health.metrics.memoryUsage < 60 ? 'bg-green-500' :
                    health.metrics.memoryUsage < 80 ? 'bg-yellow-500' : 'bg-red-500'
                  }`}
                  style={{ width: `${health.metrics.memoryUsage}%` }}
                />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-gray-500">Active Users</h3>
              <div className="p-2 rounded-full bg-blue-100 text-blue-600">
                <Activity className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-bold text-gray-900">{health.metrics.activeUsers.toLocaleString()}</div>
            <div className="text-sm text-gray-500 mt-1">
              {health.metrics.requestsPerSecond} req/sec
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-gray-500">Error Rate</h3>
              <div className={`p-2 rounded-full ${getStatusColor(getMetricStatus(health.metrics.errorRate * 100, { good: 1, warning: 5, critical: 10 }))}`}>
                <AlertTriangle className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-bold text-gray-900">{health.metrics.errorRate}%</div>
            <div className="text-sm text-gray-500 mt-1">
              Network: {health.metrics.networkLatency}ms
            </div>
          </div>
        </div>

        {/* Alerts */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">System Alerts</h2>
              <div className="text-sm text-gray-500">
                {health.alerts.filter(a => !a.acknowledged).length} unacknowledged
              </div>
            </div>
          </div>

          <div className="divide-y divide-gray-200">
            {health.alerts.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                <CheckCircle className="w-12 h-12 text-green-400 mx-auto mb-4" />
                <p>No alerts at this time</p>
              </div>
            ) : (
              health.alerts.map((alert) => (
                <div key={alert.id} className={`p-6 ${alert.acknowledged ? 'opacity-60' : ''}`}>
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3">
                      <div className={`p-2 rounded-full ${getStatusColor(alert.type)}`}>
                        {getStatusIcon(alert.type)}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <h3 className="text-sm font-medium text-gray-900">{alert.title}</h3>
                          <span className="text-xs text-gray-500 capitalize">{alert.service}</span>
                        </div>
                        <p className="text-sm text-gray-600">{alert.description}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          {formatDuration((new Date().getTime() - new Date(alert.timestamp).getTime()) / 60000)}
                        </p>
                      </div>
                    </div>
                    {!alert.acknowledged && (
                      <button
                        onClick={() => acknowledgeAlert(alert.id)}
                        className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                      >
                        Acknowledge
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminSystemHealthPage;
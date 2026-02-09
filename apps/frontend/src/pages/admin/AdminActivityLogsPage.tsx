import React, { useState, useEffect } from 'react';
import { Activity, User, Code, Award, Users, Search, Download, RefreshCw, AlertCircle, Info, AlertTriangle, XCircle, Settings, Trophy, X } from 'lucide-react';
import { AdminLayout } from '../../components/admin/AdminLayout';

interface ActivityLog {
  id: string;
  userId: string;
  username: string;
  email: string;
  action: string;
  resourceType: 'USER' | 'PROBLEM' | 'SUBMISSION' | 'CHALLENGE' | 'ACHIEVEMENT' | 'SYSTEM' | 'ADMIN';
  resourceId: string;
  resourceName: string;
  details: Record<string, unknown>;
  ipAddress: string;
  userAgent: string;
  timestamp: string;
  severity: 'INFO' | 'WARNING' | 'ERROR' | 'CRITICAL';
  success: boolean;
  metadata?: {
    duration?: number;
    affectedRows?: number;
    previousValues?: Record<string, unknown>;
    newValues?: Record<string, unknown>;
  };
}

const AdminActivityLogsPage: React.FC = () => {
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    severity: 'all',
    resourceType: 'all',
    action: 'all',
    userId: '',
    dateFrom: '',
    dateTo: '',
    success: 'all'
  });
  const [sortBy, setSortBy] = useState<'timestamp' | 'severity' | 'user' | 'action'>('timestamp');
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(50);
  const [selectedLog, setSelectedLog] = useState<ActivityLog | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [refreshInterval] = useState(30);

  const fetchLogs = React.useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: itemsPerPage.toString(),
        sortBy,
        sortOrder,
        ...Object.fromEntries(Object.entries(filters).filter((entry) => entry[1] !== 'all' && entry[1] !== ''))
      });

      const response = await fetch(`/api/admin/activity-logs?${params}`);
      if (response.ok) {
        const data = await response.json();
        setLogs(data.logs);
      }
    } catch (error) {
      console.error('Failed to fetch activity logs:', error);
    } finally {
      setLoading(false);
    }
  }, [currentPage, itemsPerPage, filters, sortBy, sortOrder]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  useEffect(() => {
    if (autoRefresh) {
      const interval = setInterval(() => {
        fetchLogs();
      }, refreshInterval * 1000);
      return () => clearInterval(interval);
    }
  }, [autoRefresh, refreshInterval, fetchLogs]);

  const handleExport = () => {
    const csvContent = [
      ['Timestamp', 'Severity', 'User', 'Action', 'Resource Type', 'Resource Name', 'IP Address', 'Success', 'Details'],
      ...filteredLogs.map(log => [
        new Date(log.timestamp).toLocaleString(),
        log.severity,
        log.username,
        log.action,
        log.resourceType,
        log.resourceName,
        log.ipAddress,
        log.success ? 'Yes' : 'No',
        JSON.stringify(log.details)
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `activity_logs_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'CRITICAL': return <AlertTriangle className="w-4 h-4 text-red-500" />;
      case 'ERROR': return <XCircle className="w-4 h-4 text-red-500" />;
      case 'WARNING': return <AlertCircle className="w-4 h-4 text-yellow-500" />;
      case 'INFO': return <Info className="w-4 h-4 text-blue-500" />;
      default: return <Activity className="w-4 h-4 text-gray-500" />;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'CRITICAL': return 'bg-red-100 text-red-800 border-red-200';
      case 'ERROR': return 'bg-red-100 text-red-800 border-red-200';
      case 'WARNING': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'INFO': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getResourceIcon = (resourceType: string) => {
    switch (resourceType) {
      case 'USER': return <User className="w-4 h-4" />;
      case 'PROBLEM': return <Code className="w-4 h-4" />;
      case 'SUBMISSION': return <Code className="w-4 h-4" />;
      case 'CHALLENGE': return <Trophy className="w-4 h-4" />;
      case 'ACHIEVEMENT': return <Award className="w-4 h-4" />;
      case 'SYSTEM': return <Settings className="w-4 h-4" />;
      case 'ADMIN': return <Users className="w-4 h-4" />;
      default: return <Activity className="w-4 h-4" />;
    }
  };

  const formatDuration = (timestamp: string) => {
    const now = new Date();
    const logTime = new Date(timestamp);
    const diffMs = now.getTime() - logTime.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    const hours = Math.floor(diffMins / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  const filteredLogs = logs.filter(log => {
    const matchesSearch = searchTerm === '' || 
      log.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.resourceName.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesSeverity = filters.severity === 'all' || log.severity === filters.severity;
    const matchesResourceType = filters.resourceType === 'all' || log.resourceType === filters.resourceType;
    const matchesAction = filters.action === 'all' || log.action === filters.action;
    const matchesUser = filters.userId === '' || log.userId === filters.userId;
    const matchesSuccess = filters.success === 'all' || 
      (filters.success === 'true' && log.success) ||
      (filters.success === 'false' && !log.success);
    
    const matchesDateRange = (!filters.dateFrom || new Date(log.timestamp) >= new Date(filters.dateFrom)) &&
                            (!filters.dateTo || new Date(log.timestamp) <= new Date(filters.dateTo));
    
    return matchesSearch && matchesSeverity && matchesResourceType && matchesAction && 
           matchesUser && matchesSuccess && matchesDateRange;
  });

  const sortedLogs = [...filteredLogs].sort((a, b) => {
    let comparison = 0;
    switch (sortBy) {
      case 'timestamp':
        comparison = new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
        break;
      case 'severity': {
        const severityOrder = { CRITICAL: 4, ERROR: 3, WARNING: 2, INFO: 1 };
        comparison = severityOrder[b.severity] - severityOrder[a.severity];
        break;
      }
      case 'user':
        comparison = a.username.localeCompare(b.username);
        break;
      case 'action':
        comparison = a.action.localeCompare(b.action);
        break;
    }
    return sortOrder === 'asc' ? comparison : -comparison;
  });

  const paginatedLogs = sortedLogs.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const severities = ['all', 'INFO', 'WARNING', 'ERROR', 'CRITICAL'];
  const resourceTypes = ['all', 'USER', 'PROBLEM', 'SUBMISSION', 'CHALLENGE', 'ACHIEVEMENT', 'SYSTEM', 'ADMIN'];
  const actions = ['all', 'CREATE', 'UPDATE', 'DELETE', 'LOGIN', 'LOGOUT', 'VIEW', 'DOWNLOAD', 'EXPORT'];

  return (
    <AdminLayout>
      <div className="p-6">
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Activity Logs</h1>
              <p className="text-gray-600">Monitor platform activity and user actions</p>
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
                onClick={fetchLogs}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 flex items-center gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                Refresh
              </button>
              <button
                onClick={handleExport}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                Export
              </button>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">Filters</h2>
              <div className="text-sm text-gray-500">
                {filteredLogs.length} of {logs.length} logs
              </div>
            </div>
          </div>
          
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Search logs..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Severity</label>
                <select
                  value={filters.severity}
                  onChange={(e) => setFilters(prev => ({ ...prev, severity: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {severities.map(severity => (
                    <option key={severity} value={severity}>
                      {severity === 'all' ? 'All Severities' : severity}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Resource Type</label>
                <select
                  value={filters.resourceType}
                  onChange={(e) => setFilters(prev => ({ ...prev, resourceType: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {resourceTypes.map(type => (
                    <option key={type} value={type}>
                      {type === 'all' ? 'All Resources' : type}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Success</label>
                <select
                  value={filters.success}
                  onChange={(e) => setFilters(prev => ({ ...prev, success: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">All</option>
                  <option value="true">Success</option>
                  <option value="false">Failed</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Action</label>
                <select
                  value={filters.action}
                  onChange={(e) => setFilters(prev => ({ ...prev, action: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {actions.map(action => (
                    <option key={action} value={action}>
                      {action === 'all' ? 'All Actions' : action}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">User ID</label>
                <input
                  type="text"
                  placeholder="Filter by user ID..."
                  value={filters.userId}
                  onChange={(e) => setFilters(prev => ({ ...prev, userId: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Date From</label>
                <input
                  type="date"
                  value={filters.dateFrom}
                  onChange={(e) => setFilters(prev => ({ ...prev, dateFrom: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Date To</label>
                <input
                  type="date"
                  value={filters.dateTo}
                  onChange={(e) => setFilters(prev => ({ ...prev, dateTo: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Activity Logs */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <h2 className="text-lg font-semibold text-gray-900">Activity Logs</h2>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc')}
                    className="px-3 py-1 text-sm border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    {sortOrder === 'desc' ? '↓' : '↑'}
                  </button>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
                    className="px-3 py-1 text-sm border border-gray-300 rounded-lg"
                  >
                    <option value="timestamp">Time</option>
                    <option value="severity">Severity</option>
                    <option value="user">User</option>
                    <option value="action">Action</option>
                  </select>
                </div>
              </div>
              <div className="text-sm text-gray-500">
                Page {currentPage} of {Math.ceil(filteredLogs.length / itemsPerPage)}
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            {loading ? (
              <div className="p-8 text-center text-gray-500">
                <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
                Loading activity logs...
              </div>
            ) : (
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Time
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Severity
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      User
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Action
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Resource
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      IP Address
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {paginatedLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          <div>{new Date(log.timestamp).toLocaleDateString()}</div>
                          <div className="text-gray-500">{new Date(log.timestamp).toLocaleTimeString()}</div>
                          <div className="text-xs text-gray-400">{formatDuration(log.timestamp)}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getSeverityColor(log.severity)}`}>
                          {getSeverityIcon(log.severity)}
                          <span className="ml-1">{log.severity}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          <div className="font-medium">{log.username}</div>
                          <div className="text-gray-500">{log.email}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 font-medium">{log.action}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 text-gray-400">
                            {getResourceIcon(log.resourceType)}
                          </div>
                          <div className="ml-3">
                            <div className="text-sm font-medium text-gray-900">{log.resourceName}</div>
                            <div className="text-sm text-gray-500">{log.resourceType}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{log.ipAddress}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          log.success 
                            ? 'bg-green-100 text-green-800 border border-green-200' 
                            : 'bg-red-100 text-red-800 border border-red-200'
                        }`}>
                          {log.success ? 'Success' : 'Failed'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => {
                            setSelectedLog(log);
                            setShowDetailsModal(true);
                          }}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          View Details
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {!loading && paginatedLogs.length === 0 && (
              <div className="p-8 text-center text-gray-500">
                <Activity className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p>No activity logs found matching your criteria.</p>
              </div>
            )}
          </div>

          {/* Pagination */}
          <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div>
                <label className="text-sm text-gray-700">Show</label>
                <select
                  value={itemsPerPage}
                  onChange={(e) => {
                    setItemsPerPage(parseInt(e.target.value));
                    setCurrentPage(1);
                  }}
                  className="ml-2 px-3 py-1 border border-gray-300 rounded-lg text-sm"
                >
                  <option value={25}>25</option>
                  <option value={50}>50</option>
                  <option value={100}>100</option>
                  <option value={200}>200</option>
                </select>
                <span className="ml-2 text-sm text-gray-700">per page</span>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="px-3 py-1 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <span className="text-sm text-gray-700">
                {currentPage} of {Math.ceil(filteredLogs.length / itemsPerPage)}
              </span>
              <button
                onClick={() => setCurrentPage(currentPage + 1)}
                disabled={currentPage >= Math.ceil(filteredLogs.length / itemsPerPage)}
                className="px-3 py-1 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        </div>

        {/* Log Details Modal */}
        {showDetailsModal && selectedLog && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-900">Activity Log Details</h2>
                <button
                  onClick={() => setShowDetailsModal(false)}
                  className="text-gray-400 hover:text-gray-600 p-1 rounded hover:bg-gray-100"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-sm font-medium text-gray-700 mb-2">Basic Information</h3>
                    <div className="space-y-2 text-sm">
                      <div><span className="font-medium">Log ID:</span> {selectedLog.id}</div>
                      <div><span className="font-medium">Timestamp:</span> {new Date(selectedLog.timestamp).toLocaleString()}</div>
                      <div><span className="font-medium">Severity:</span> 
                        <span className={`ml-1 px-2 py-1 rounded text-xs ${getSeverityColor(selectedLog.severity)}`}>
                          {selectedLog.severity}
                        </span>
                      </div>
                      <div><span className="font-medium">Success:</span> {selectedLog.success ? 'Yes' : 'No'}</div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-sm font-medium text-gray-700 mb-2">User Information</h3>
                    <div className="space-y-2 text-sm">
                      <div><span className="font-medium">User ID:</span> {selectedLog.userId}</div>
                      <div><span className="font-medium">Username:</span> {selectedLog.username}</div>
                      <div><span className="font-medium">Email:</span> {selectedLog.email}</div>
                      <div><span className="font-medium">IP Address:</span> {selectedLog.ipAddress}</div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-sm font-medium text-gray-700 mb-2">Resource Information</h3>
                    <div className="space-y-2 text-sm">
                      <div><span className="font-medium">Action:</span> {selectedLog.action}</div>
                      <div><span className="font-medium">Resource Type:</span> {selectedLog.resourceType}</div>
                      <div><span className="font-medium">Resource ID:</span> {selectedLog.resourceId}</div>
                      <div><span className="font-medium">Resource Name:</span> {selectedLog.resourceName}</div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-sm font-medium text-gray-700 mb-2">Metadata</h3>
                    <div className="space-y-2 text-sm">
                      {selectedLog.metadata?.duration && (
                        <div><span className="font-medium">Duration:</span> {selectedLog.metadata.duration}ms</div>
                      )}
                      {selectedLog.metadata?.affectedRows && (
                        <div><span className="font-medium">Affected Rows:</span> {selectedLog.metadata.affectedRows}</div>
                      )}
                      <div><span className="font-medium">User Agent:</span> {selectedLog.userAgent}</div>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-2">Details</h3>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <pre className="text-sm text-gray-800 whitespace-pre-wrap">
                      {JSON.stringify(selectedLog.details, null, 2)}
                    </pre>
                  </div>
                </div>

                {selectedLog.metadata?.previousValues && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-700 mb-2">Previous Values</h3>
                    <div className="bg-red-50 rounded-lg p-4">
                      <pre className="text-sm text-gray-800 whitespace-pre-wrap">
                        {JSON.stringify(selectedLog.metadata.previousValues, null, 2)}
                      </pre>
                    </div>
                  </div>
                )}

                {selectedLog.metadata?.newValues && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-700 mb-2">New Values</h3>
                    <div className="bg-green-50 rounded-lg p-4">
                      <pre className="text-sm text-gray-800 whitespace-pre-wrap">
                        {JSON.stringify(selectedLog.metadata.newValues, null, 2)}
                      </pre>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminActivityLogsPage;
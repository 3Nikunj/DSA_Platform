import React from 'react';
import { 
  User, 
  Clock, 
  CheckCircle, 
  AlertTriangle,
  Code,
  Trophy,
  BookOpen,
  Activity,
  Award
} from 'lucide-react';

interface Activity {
  id: string;
  type: 'user' | 'submission' | 'challenge' | 'algorithm' | 'achievement';
  message: string;
  timestamp: string;
  user?: {
    name: string;
    avatar?: string;
  };
  metadata?: {
    challenge?: string;
    algorithm?: string;
    status?: 'success' | 'failed' | 'pending';
    points?: number;
  };
}

interface AdminActivityFeedProps {
  activities: Activity[];
}

export const AdminActivityFeed: React.FC<AdminActivityFeedProps> = ({ activities }) => {
  const getActivityIcon = (type: string) => {
    const icons = {
      user: User,
      submission: Code,
      challenge: Trophy,
      algorithm: BookOpen,
      achievement: Award
    };
    return icons[type as keyof typeof icons] || Activity;
  };

  const getActivityColor = (type: string) => {
    const colors = {
      user: 'bg-blue-100 text-blue-600',
      submission: 'bg-green-100 text-green-600',
      challenge: 'bg-orange-100 text-orange-600',
      algorithm: 'bg-purple-100 text-purple-600',
      achievement: 'bg-yellow-100 text-yellow-600'
    };
    return colors[type as keyof typeof colors] || 'bg-gray-100 text-gray-600';
  };

  const getStatusIcon = (status?: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'failed':
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      default:
        return null;
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Recent Activity
        </h3>
        <button className="text-sm text-purple-600 hover:text-purple-500">
          View All
        </button>
      </div>
      
      <div className="space-y-4 max-h-96 overflow-y-auto">
        {activities.length === 0 ? (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            <Activity className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No recent activity</p>
          </div>
        ) : (
          activities.map((activity) => {
            const Icon = getActivityIcon(activity.type);
            const colorClass = getActivityColor(activity.type);
            
            return (
              <div key={activity.id} className="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                <div className={`p-2 rounded-lg ${colorClass}`}>
                  <Icon className="h-4 w-4" />
                </div>
                
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-900 dark:text-white">
                    {activity.message}
                  </p>
                  
                  {activity.metadata && (
                    <div className="flex items-center space-x-2 mt-1">
                      {activity.metadata.status && getStatusIcon(activity.metadata.status)}
                      {activity.metadata.challenge && (
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          Challenge: {activity.metadata.challenge}
                        </span>
                      )}
                      {activity.metadata.algorithm && (
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          Algorithm: {activity.metadata.algorithm}
                        </span>
                      )}
                      {activity.metadata.points && (
                        <span className="text-xs font-medium text-purple-600">
                          +{activity.metadata.points} XP
                        </span>
                      )}
                    </div>
                  )}
                  
                  <div className="flex items-center space-x-2 mt-1">
                    {activity.user && (
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        by {activity.user.name}
                      </span>
                    )}
                    <span className="text-xs text-gray-400">
                      {formatTimestamp(activity.timestamp)}
                    </span>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
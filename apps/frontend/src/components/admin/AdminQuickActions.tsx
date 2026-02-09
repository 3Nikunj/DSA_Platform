import React from 'react';
import { 
  UserPlus, 
  BookOpen, 
  Trophy, 
  Settings,
  Download,
  Activity
} from 'lucide-react';

export const AdminQuickActions: React.FC = () => {
  const quickActions = [
    {
      name: 'Add User',
      icon: UserPlus,
      color: 'blue',
      action: () => console.log('Add User clicked')
    },
    {
      name: 'Add Algorithm',
      icon: BookOpen,
      color: 'purple',
      action: () => console.log('Add Algorithm clicked')
    },
    {
      name: 'Create Challenge',
      icon: Trophy,
      color: 'orange',
      action: () => console.log('Create Challenge clicked')
    },
    {
      name: 'View Analytics',
      icon: Activity,
      color: 'green',
      action: () => console.log('View Analytics clicked')
    },
    {
      name: 'Export Data',
      icon: Download,
      color: 'indigo',
      action: () => console.log('Export Data clicked')
    },
    {
      name: 'System Settings',
      icon: Settings,
      color: 'gray',
      action: () => console.log('System Settings clicked')
    }
  ];

  const colorClasses = {
    blue: 'bg-blue-100 text-blue-600 hover:bg-blue-200 dark:bg-blue-900 dark:text-blue-300 dark:hover:bg-blue-800',
    purple: 'bg-purple-100 text-purple-600 hover:bg-purple-200 dark:bg-purple-900 dark:text-purple-300 dark:hover:bg-purple-800',
    orange: 'bg-orange-100 text-orange-600 hover:bg-orange-200 dark:bg-orange-900 dark:text-orange-300 dark:hover:bg-orange-800',
    green: 'bg-green-100 text-green-600 hover:bg-green-200 dark:bg-green-900 dark:text-green-300 dark:hover:bg-green-800',
    indigo: 'bg-indigo-100 text-indigo-600 hover:bg-indigo-200 dark:bg-indigo-900 dark:text-indigo-300 dark:hover:bg-indigo-800',
    gray: 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        Quick Actions
      </h3>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {quickActions.map((action, index) => (
          <button
            key={index}
            onClick={action.action}
            className={`flex flex-col items-center justify-center p-4 rounded-lg transition-colors ${colorClasses[action.color as keyof typeof colorClasses]}`}
          >
            <action.icon className="h-6 w-6 mb-2" />
            <span className="text-sm font-medium text-center">{action.name}</span>
          </button>
        ))}
      </div>
    </div>
  );
};
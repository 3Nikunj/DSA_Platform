import React from 'react';
import type { LucideIcon } from 'lucide-react';

interface AdminStatCardProps {
  title: string;
  value: string;
  icon: LucideIcon;
  color: string;
  trend?: string;
  trendDirection?: 'up' | 'down' | 'stable';
  isLoading?: boolean;
}

export const AdminStatCard: React.FC<AdminStatCardProps> = ({
  title,
  value,
  icon: Icon,
  color,
  trend,
  trendDirection,
  isLoading = false,
}) => {
  const colorClasses = {
    blue: 'bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-300',
    green: 'bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-300',
    purple: 'bg-purple-100 text-purple-600 dark:bg-purple-900 dark:text-purple-300',
    orange: 'bg-orange-100 text-orange-600 dark:bg-orange-900 dark:text-orange-300',
    indigo: 'bg-indigo-100 text-indigo-600 dark:bg-indigo-900 dark:text-indigo-300',
    red: 'bg-red-100 text-red-600 dark:bg-red-900 dark:text-red-300',
    teal: 'bg-teal-100 text-teal-600 dark:bg-teal-900 dark:text-teal-300',
    multi: 'bg-gradient-to-r from-purple-100 to-blue-100 text-purple-600 dark:from-purple-900 dark:to-blue-900 dark:text-purple-300',
  };

  const trendColors = {
    up: 'text-green-600',
    down: 'text-red-600',
    stable: 'text-gray-600',
  };

  const trendIcons = {
    up: '↗',
    down: '↘',
    stable: '→',
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 hover:shadow-lg transition-shadow">
      {isLoading ? (
        <div className="animate-pulse">
          <div className="flex items-center justify-between">
            <div className="h-12 w-12 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
            <div className="h-6 w-16 bg-gray-200 dark:bg-gray-700 rounded"></div>
          </div>
          <div className="mt-4">
            <div className="h-8 w-24 bg-gray-200 dark:bg-gray-700 rounded"></div>
            <div className="h-4 w-32 bg-gray-200 dark:bg-gray-700 rounded mt-2"></div>
          </div>
        </div>
      ) : (
        <>
          <div className="flex items-center justify-between">
            <div className={`p-3 rounded-lg ${colorClasses[color as keyof typeof colorClasses]}`}>
              <Icon className="h-6 w-6" />
            </div>
            {trend && (
              <div className={`flex items-center text-sm ${trendColors[trendDirection as keyof typeof trendColors]}`}>
                <span className="mr-1">{trendIcons[trendDirection as keyof typeof trendIcons]}</span>
                {trend}
              </div>
            )}
          </div>
          
          <div className="mt-4">
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{value}</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{title}</p>
          </div>
        </>
      )}
    </div>
  );
};
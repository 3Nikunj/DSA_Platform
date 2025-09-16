import React from 'react';
import { Link } from 'react-router-dom';
import {
  AcademicCapIcon,
  PuzzlePieceIcon,
  CodeBracketIcon,
  TrophyIcon,
  ChartBarIcon,
  FireIcon,
  StarIcon,
} from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';
import { useAuthStore } from '../stores/authStore';
import { useProgressStats, useAllCategoriesProgress } from '../hooks/useProgress';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';

const quickActions = [
  {
    name: 'Browse Algorithms',
    description: 'Explore sorting, searching, and graph algorithms',
    href: '/algorithms',
    icon: AcademicCapIcon,
    color: 'bg-blue-500',
  },
  {
    name: 'Take Challenges',
    description: 'Test your skills with coding challenges',
    href: '/challenges',
    icon: PuzzlePieceIcon,
    color: 'bg-green-500',
  },
  {
    name: 'Code Playground',
    description: 'Practice coding in multiple languages',
    href: '/playground',
    icon: CodeBracketIcon,
    color: 'bg-purple-500',
  },
  {
    name: 'Leaderboard',
    description: 'See how you rank against other learners',
    href: '/leaderboard',
    icon: TrophyIcon,
    color: 'bg-yellow-500',
  },
];

const recentActivity = [
  {
    id: 1,
    type: 'algorithm',
    title: 'Completed Bubble Sort',
    description: 'Mastered the bubble sort algorithm with visualization',
    time: '2 hours ago',
    icon: AcademicCapIcon,
    color: 'text-blue-600',
  },
  {
    id: 2,
    type: 'challenge',
    title: 'Solved Two Sum Problem',
    description: 'Successfully solved in O(n) time complexity',
    time: '1 day ago',
    icon: PuzzlePieceIcon,
    color: 'text-green-600',
  },
  {
    id: 3,
    type: 'achievement',
    title: 'Earned "First Steps" Badge',
    description: 'Completed your first algorithm',
    time: '2 days ago',
    icon: StarIcon,
    color: 'text-yellow-600',
  },
];

// Static data moved to component to use dynamic data

export const DashboardPage: React.FC = () => {
  const { user } = useAuthStore();
  const { stats, isLoading: progressLoading } = useProgressStats();
  const { data: categoriesProgress, isLoading: categoriesLoading } = useAllCategoriesProgress();

  const isLoading = progressLoading || categoriesLoading;

  // Create dynamic stats based on real data
  const dynamicStats = [
    {
      name: 'Algorithms Completed',
      value: stats.algorithmsCompleted.toString(),
      change: `${stats.completionRate.toFixed(1)}% completion rate`,
      changeType: 'positive' as const,
      icon: AcademicCapIcon,
    },
    {
      name: 'Total Solved',
      value: stats.totalSolved.toString(),
      change: `Level ${stats.currentLevel}`,
      changeType: 'positive' as const,
      icon: PuzzlePieceIcon,
    },
    {
      name: 'Current Streak',
      value: `${stats.currentStreak} days`,
      change: `Best: ${stats.longestStreak} days`,
      changeType: 'positive' as const,
      icon: FireIcon,
    },
    {
      name: 'Experience Points',
      value: stats.experience.toString(),
      change: `${stats.experienceToNextLevel} to next level`,
      changeType: 'positive' as const,
      icon: ChartBarIcon,
    },
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Welcome Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="mb-8"
      >
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Welcome back, {user?.firstName}! 👋
        </h1>
        <p className="text-gray-600 dark:text-gray-300">
          Ready to continue your data structures and algorithms journey?
        </p>
      </motion.div>

      {/* Stats Grid */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
      >
        {dynamicStats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.name} className="card p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Icon className="h-8 w-8 text-primary-600" />
                </div>
                <div className="ml-4 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                      {stat.name}
                    </dt>
                    <dd className="flex items-baseline">
                      <div className="text-2xl font-semibold text-gray-900 dark:text-white">
                        {stat.value}
                      </div>
                      <div className="ml-2 flex items-baseline text-sm font-semibold text-green-600">
                        {stat.change}
                      </div>
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          );
        })}
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="lg:col-span-2"
        >
          <div className="card p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
              Quick Actions
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {quickActions.map((action) => {
                const Icon = action.icon;
                return (
                  <Link
                    key={action.name}
                    to={action.href}
                    className="card-hover p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-primary-300 dark:hover:border-primary-600 transition-colors duration-200"
                  >
                    <div className="flex items-start space-x-3">
                      <div className={`flex-shrink-0 w-10 h-10 ${action.color} rounded-lg flex items-center justify-center`}>
                        <Icon className="w-6 h-6 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                          {action.name}
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                          {action.description}
                        </p>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </motion.div>

        {/* Recent Activity */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <div className="card p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
              Recent Activity
            </h2>
            <div className="space-y-4">
              {recentActivity.map((activity) => {
                const Icon = activity.icon;
                return (
                  <div key={activity.id} className="flex items-start space-x-3">
                    <div className="flex-shrink-0">
                      <Icon className={`w-6 h-6 ${activity.color}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                        {activity.title}
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        {activity.description}
                      </p>
                      <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                        {activity.time}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="mt-6">
              <Link
                to="/profile"
                className="text-sm font-medium text-primary-600 hover:text-primary-500 dark:text-primary-400 dark:hover:text-primary-300"
              >
                View all activity →
              </Link>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Progress Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.4 }}
        className="mt-8"
      >
        <div className="card p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Learning Progress
            </h2>
            <Link
              to="/profile"
              className="text-sm font-medium text-primary-600 hover:text-primary-500 dark:text-primary-400 dark:hover:text-primary-300"
            >
              View detailed progress →
            </Link>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {categoriesProgress && categoriesProgress.length > 0 ? (
              categoriesProgress.slice(0, 3).map((categoryData, index) => {
                const colors = ['text-blue-600', 'text-green-600', 'text-purple-600'];
                const colorClass = colors[index % colors.length];
                const completionRate = categoryData.statistics.completionRate;
                const strokeDasharray = `${completionRate}, 100`;
                
                return (
                  <div key={categoryData.category.id} className="text-center">
                    <div className="relative w-24 h-24 mx-auto mb-4">
                      <svg className="w-24 h-24 transform -rotate-90" viewBox="0 0 36 36">
                        <path
                          className="text-gray-300 dark:text-gray-600"
                          stroke="currentColor"
                          strokeWidth="3"
                          fill="none"
                          d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        />
                        <path
                          className={colorClass}
                          stroke="currentColor"
                          strokeWidth="3"
                          strokeDasharray={strokeDasharray}
                          strokeLinecap="round"
                          fill="none"
                          d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        />
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-xl font-semibold text-gray-900 dark:text-white">
                          {Math.round(completionRate)}%
                        </span>
                      </div>
                    </div>
                    <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                      {categoryData.category.name}
                    </h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      {categoryData.statistics.completed} of {categoryData.statistics.total} completed
                    </p>
                  </div>
                );
              })
            ) : (
              // Fallback for when no category data is available
              <div className="col-span-3 text-center py-8">
                <p className="text-gray-500 dark:text-gray-400">No progress data available yet</p>
                <p className="text-sm text-gray-400 dark:text-gray-500 mt-2">
                  Start learning algorithms to see your progress here
                </p>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
};
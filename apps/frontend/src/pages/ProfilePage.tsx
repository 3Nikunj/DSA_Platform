import React, { useState } from 'react';
import {
  UserIcon,
  CogIcon,
  TrophyIcon,
  ChartBarIcon,
  CalendarIcon,
  FireIcon,
  AcademicCapIcon,
  PuzzlePieceIcon,
  ClockIcon,
  StarIcon,
} from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';
import { useAuthStore } from '../stores/authStore';

const achievements = [
  {
    id: 1,
    name: 'First Steps',
    description: 'Completed your first algorithm',
    icon: StarIcon,
    earned: true,
    earnedDate: '2024-01-15',
    color: 'bg-yellow-500',
  },
  {
    id: 2,
    name: 'Problem Solver',
    description: 'Solved 10 coding challenges',
    icon: PuzzlePieceIcon,
    earned: false,
    progress: 2,
    total: 10,
    color: 'bg-blue-500',
  },
  {
    id: 3,
    name: 'Speed Demon',
    description: 'Solved a challenge in under 5 minutes',
    icon: ClockIcon,
    earned: true,
    earnedDate: '2024-01-18',
    color: 'bg-green-500',
  },
  {
    id: 4,
    name: 'Algorithm Master',
    description: 'Mastered all sorting algorithms',
    icon: AcademicCapIcon,
    earned: false,
    progress: 3,
    total: 8,
    color: 'bg-purple-500',
  },
  {
    id: 5,
    name: 'Streak Master',
    description: 'Maintained a 30-day learning streak',
    icon: FireIcon,
    earned: false,
    progress: 5,
    total: 30,
    color: 'bg-red-500',
  },
  {
    id: 6,
    name: 'Top Performer',
    description: 'Reached top 10 on the leaderboard',
    icon: TrophyIcon,
    earned: false,
    progress: 0,
    total: 1,
    color: 'bg-orange-500',
  },
];

const recentActivity = [
  {
    id: 1,
    type: 'algorithm',
    title: 'Completed Bubble Sort',
    description: 'Mastered the bubble sort algorithm with visualization',
    date: '2024-01-20',
    icon: AcademicCapIcon,
    color: 'text-blue-600',
  },
  {
    id: 2,
    type: 'challenge',
    title: 'Solved Two Sum Problem',
    description: 'Successfully solved in O(n) time complexity',
    date: '2024-01-19',
    icon: PuzzlePieceIcon,
    color: 'text-green-600',
  },
  {
    id: 3,
    type: 'achievement',
    title: 'Earned "Speed Demon" Badge',
    description: 'Solved a challenge in under 5 minutes',
    date: '2024-01-18',
    icon: StarIcon,
    color: 'text-yellow-600',
  },
  {
    id: 4,
    type: 'algorithm',
    title: 'Started Quick Sort',
    description: 'Began learning the quick sort algorithm',
    date: '2024-01-17',
    icon: AcademicCapIcon,
    color: 'text-blue-600',
  },
  {
    id: 5,
    type: 'challenge',
    title: 'Attempted Valid Parentheses',
    description: 'Working on string manipulation challenge',
    date: '2024-01-16',
    icon: PuzzlePieceIcon,
    color: 'text-orange-600',
  },
];

const stats = [
  { label: 'Algorithms Completed', value: 12, change: '+2 this week', changeType: 'positive' },
  { label: 'Challenges Solved', value: 8, change: '+3 this week', changeType: 'positive' },
  { label: 'Current Streak', value: '5 days', change: 'Keep it up!', changeType: 'positive' },
  { label: 'Total Time Spent', value: '24h 32m', change: '+4h this week', changeType: 'positive' },
  { label: 'Average Score', value: '87%', change: '+5% this month', changeType: 'positive' },
  { label: 'Rank', value: '#42', change: '+8 positions', changeType: 'positive' },
];

export const ProfilePage: React.FC = () => {
  const { user } = useAuthStore();
  const [activeTab, setActiveTab] = useState('overview');

  const tabs = [
    { id: 'overview', name: 'Overview', icon: ChartBarIcon },
    { id: 'achievements', name: 'Achievements', icon: TrophyIcon },
    { id: 'activity', name: 'Activity', icon: CalendarIcon },
    { id: 'settings', name: 'Settings', icon: CogIcon },
  ];

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Profile Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="card p-6 mb-8"
      >
        <div className="flex items-start space-x-6">
          <div className="w-24 h-24 bg-gradient-to-br from-primary-500 to-primary-600 rounded-full flex items-center justify-center">
            <UserIcon className="w-12 h-12 text-white" />
          </div>
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              {user?.firstName} {user?.lastName}
            </h1>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              @{user?.username} • Member since January 2024
            </p>
            <div className="flex items-center space-x-6 text-sm text-gray-500 dark:text-gray-400">
              <div className="flex items-center space-x-1">
                <TrophyIcon className="w-4 h-4" />
                <span>Rank #42</span>
              </div>
              <div className="flex items-center space-x-1">
                <FireIcon className="w-4 h-4" />
                <span>5 day streak</span>
              </div>
              <div className="flex items-center space-x-1">
                <StarIcon className="w-4 h-4" />
                <span>2 achievements</span>
              </div>
            </div>
          </div>
          <button className="btn btn-secondary">
            Edit Profile
          </button>
        </div>
      </motion.div>

      {/* Navigation Tabs */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
        className="mb-8"
      >
        <nav className="flex space-x-8 border-b border-gray-200 dark:border-gray-700">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-200 ${
                  activeTab === tab.id
                    ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span>{tab.name}</span>
              </button>
            );
          })}
        </nav>
      </motion.div>

      {/* Tab Content */}
      <motion.div
        key={activeTab}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        {activeTab === 'overview' && (
          <div className="space-y-8">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {stats.map((stat) => (
                <div key={stat.label} className="card p-6">
                  <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
                    {stat.label}
                  </h3>
                  <div className="flex items-baseline space-x-2">
                    <span className="text-2xl font-bold text-gray-900 dark:text-white">
                      {stat.value}
                    </span>
                    <span className="text-sm font-medium text-green-600">
                      {stat.change}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Progress Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="card p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
                  Learning Progress
                </h3>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-gray-600 dark:text-gray-300">Sorting Algorithms</span>
                      <span className="text-gray-900 dark:text-white font-medium">75%</span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div className="bg-blue-600 h-2 rounded-full" style={{ width: '75%' }}></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-gray-600 dark:text-gray-300">Data Structures</span>
                      <span className="text-gray-900 dark:text-white font-medium">50%</span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div className="bg-green-600 h-2 rounded-full" style={{ width: '50%' }}></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-gray-600 dark:text-gray-300">Graph Algorithms</span>
                      <span className="text-gray-900 dark:text-white font-medium">25%</span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div className="bg-purple-600 h-2 rounded-full" style={{ width: '25%' }}></div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="card p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
                  Weekly Activity
                </h3>
                <div className="space-y-3">
                  {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => {
                    const activity = Math.floor(Math.random() * 4) + 1;
                    return (
                      <div key={day} className="flex items-center space-x-3">
                        <span className="text-sm text-gray-600 dark:text-gray-300 w-8">{day}</span>
                        <div className="flex-1 flex space-x-1">
                          {Array.from({ length: 10 }).map((_, i) => (
                            <div
                              key={i}
                              className={`w-3 h-3 rounded-sm ${
                                i < activity
                                  ? 'bg-primary-500'
                                  : 'bg-gray-200 dark:bg-gray-700'
                              }`}
                            />
                          ))}
                        </div>
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                          {activity * 15}m
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'achievements' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {achievements.map((achievement) => {
              const Icon = achievement.icon;
              return (
                <div
                  key={achievement.id}
                  className={`card p-6 relative ${
                    achievement.earned ? 'ring-2 ring-yellow-400' : 'opacity-75'
                  }`}
                >
                  {achievement.earned && (
                    <div className="absolute top-2 right-2">
                      <div className="w-6 h-6 bg-yellow-500 rounded-full flex items-center justify-center">
                        <StarIcon className="w-4 h-4 text-white" />
                      </div>
                    </div>
                  )}
                  <div className={`w-12 h-12 ${achievement.color} rounded-lg flex items-center justify-center mb-4`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    {achievement.name}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 text-sm mb-4">
                    {achievement.description}
                  </p>
                  {achievement.earned ? (
                    <p className="text-green-600 dark:text-green-400 text-sm font-medium">
                      Earned on {new Date(achievement.earnedDate!).toLocaleDateString()}
                    </p>
                  ) : (
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-gray-600 dark:text-gray-300">Progress</span>
                        <span className="text-gray-900 dark:text-white font-medium">
                          {achievement.progress}/{achievement.total}
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div
                          className="bg-primary-600 h-2 rounded-full"
                          style={{
                            width: `${(achievement.progress! / achievement.total!) * 100}%`,
                          }}
                        ></div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {activeTab === 'activity' && (
          <div className="card p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
              Recent Activity
            </h3>
            <div className="space-y-4">
              {recentActivity.map((activity) => {
                const Icon = activity.icon;
                return (
                  <div key={activity.id} className="flex items-start space-x-4 p-4 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors duration-200">
                    <div className="flex-shrink-0">
                      <Icon className={`w-6 h-6 ${activity.color}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                        {activity.title}
                      </h4>
                      <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                        {activity.description}
                      </p>
                      <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">
                        {new Date(activity.date).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="space-y-6">
            <div className="card p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
                Account Settings
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    value={user?.email || ''}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    readOnly
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Username
                  </label>
                  <input
                    type="text"
                    value={user?.username || ''}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      First Name
                    </label>
                    <input
                      type="text"
                      value={user?.firstName || ''}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Last Name
                    </label>
                    <input
                      type="text"
                      value={user?.lastName || ''}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                  </div>
                </div>
                <button className="btn btn-primary">
                  Save Changes
                </button>
              </div>
            </div>

            <div className="card p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
                Preferences
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                      Email Notifications
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      Receive email updates about your progress
                    </p>
                  </div>
                  <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-primary-600 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2">
                    <span className="inline-block h-4 w-4 transform rounded-full bg-white transition-transform translate-x-6" />
                  </button>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                      Public Profile
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      Show your profile on the leaderboard
                    </p>
                  </div>
                  <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-primary-600 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2">
                    <span className="inline-block h-4 w-4 transform rounded-full bg-white transition-transform translate-x-6" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
};
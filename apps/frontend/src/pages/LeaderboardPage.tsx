import React, { useState } from 'react';
import {
  TrophyIcon,
  UserIcon,
  FireIcon,
  ClockIcon,
  AcademicCapIcon,
  PuzzlePieceIcon,
  ChevronUpIcon,
  ChevronDownIcon,
} from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';

const timeframes = [
  { id: 'weekly', name: 'This Week' },
  { id: 'monthly', name: 'This Month' },
  { id: 'alltime', name: 'All Time' },
];

const categories = [
  { id: 'overall', name: 'Overall Score' },
  { id: 'algorithms', name: 'Algorithms' },
  { id: 'challenges', name: 'Challenges' },
  { id: 'streak', name: 'Learning Streak' },
];

const leaderboardData = [
  {
    id: 1,
    rank: 1,
    username: 'AlgoMaster',
    firstName: 'Alex',
    lastName: 'Johnson',
    score: 2847,
    algorithmsCompleted: 45,
    challengesSolved: 128,
    currentStreak: 23,
    totalTime: '156h 32m',
    change: 0,
    avatar: null,
  },
  {
    id: 2,
    rank: 2,
    username: 'CodeNinja',
    firstName: 'Sarah',
    lastName: 'Chen',
    score: 2756,
    algorithmsCompleted: 42,
    challengesSolved: 115,
    currentStreak: 18,
    totalTime: '142h 18m',
    change: 1,
    avatar: null,
  },
  {
    id: 3,
    rank: 3,
    username: 'DataStructGuru',
    firstName: 'Michael',
    lastName: 'Rodriguez',
    score: 2689,
    algorithmsCompleted: 38,
    challengesSolved: 109,
    currentStreak: 15,
    totalTime: '134h 45m',
    change: -1,
    avatar: null,
  },
  {
    id: 4,
    rank: 4,
    username: 'SortingQueen',
    firstName: 'Emily',
    lastName: 'Davis',
    score: 2634,
    algorithmsCompleted: 41,
    challengesSolved: 98,
    currentStreak: 12,
    totalTime: '128h 22m',
    change: 2,
    avatar: null,
  },
  {
    id: 5,
    rank: 5,
    username: 'GraphExplorer',
    firstName: 'David',
    lastName: 'Wilson',
    score: 2578,
    algorithmsCompleted: 35,
    challengesSolved: 102,
    currentStreak: 9,
    totalTime: '119h 56m',
    change: -2,
    avatar: null,
  },
  // Add more users...
  {
    id: 42,
    rank: 42,
    username: 'john_doe',
    firstName: 'John',
    lastName: 'Doe',
    score: 1247,
    algorithmsCompleted: 12,
    challengesSolved: 8,
    currentStreak: 5,
    totalTime: '24h 32m',
    change: 8,
    avatar: null,
    isCurrentUser: true,
  },
];

const getRankColor = (rank: number) => {
  if (rank === 1) return 'text-yellow-500';
  if (rank === 2) return 'text-gray-400';
  if (rank === 3) return 'text-orange-600';
  return 'text-gray-600 dark:text-gray-400';
};

const getRankIcon = (rank: number) => {
  if (rank <= 3) {
    return <TrophyIcon className={`w-6 h-6 ${getRankColor(rank)}`} />;
  }
  return <span className={`text-lg font-bold ${getRankColor(rank)}`}>#{rank}</span>;
};

const getChangeIcon = (change: number) => {
  if (change > 0) {
    return <ChevronUpIcon className="w-4 h-4 text-green-500" />;
  } else if (change < 0) {
    return <ChevronDownIcon className="w-4 h-4 text-red-500" />;
  }
  return <div className="w-4 h-4" />;
};

export const LeaderboardPage: React.FC = () => {
  const [selectedTimeframe, setSelectedTimeframe] = useState('weekly');
  const [selectedCategory, setSelectedCategory] = useState('overall');

  const currentUser = leaderboardData.find(u => u.isCurrentUser);
  const topUsers = leaderboardData.filter(u => !u.isCurrentUser).slice(0, 10);

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="mb-8"
      >
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Leaderboard
        </h1>
        <p className="text-gray-600 dark:text-gray-300">
          See how you rank against other learners in the community
        </p>
      </motion.div>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
        className="mb-8 space-y-4"
      >
        {/* Timeframe Filter */}
        <div className="flex flex-wrap gap-2">
          {timeframes.map((timeframe) => (
            <button
              key={timeframe.id}
              onClick={() => setSelectedTimeframe(timeframe.id)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200 ${
                selectedTimeframe === timeframe.id
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              {timeframe.name}
            </button>
          ))}
        </div>

        {/* Category Filter */}
        <div className="flex flex-wrap gap-2">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200 ${
                selectedCategory === category.id
                  ? 'bg-secondary-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              {category.name}
            </button>
          ))}
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Top 3 Podium */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="lg:col-span-1"
        >
          <div className="card p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6 text-center">
              Top Performers
            </h2>
            <div className="space-y-4">
              {topUsers.slice(0, 3).map((user) => (
                <div
                  key={user.id}
                  className={`p-4 rounded-lg border-2 ${
                    user.rank === 1
                      ? 'border-yellow-200 bg-yellow-50 dark:border-yellow-800 dark:bg-yellow-900/20'
                      : user.rank === 2
                      ? 'border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-800/50'
                      : 'border-orange-200 bg-orange-50 dark:border-orange-800 dark:bg-orange-900/20'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div className="flex-shrink-0">
                      {getRankIcon(user.rank)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                        {user.firstName} {user.lastName}
                      </h3>
                      <p className="text-xs text-gray-600 dark:text-gray-300 truncate">
                        @{user.username}
                      </p>
                      <p className="text-sm font-bold text-primary-600 dark:text-primary-400">
                        {user.score.toLocaleString()} pts
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Main Leaderboard */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="lg:col-span-3"
        >
          <div className="card p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
              Full Rankings
            </h2>
            
            {/* Current User Highlight */}
            {currentUser && (
              <div className="mb-6 p-4 bg-primary-50 dark:bg-primary-900/20 border border-primary-200 dark:border-primary-800 rounded-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="flex-shrink-0">
                      {getRankIcon(currentUser.rank)}
                    </div>
                    <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-600 rounded-full flex items-center justify-center">
                      <UserIcon className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                        {currentUser.firstName} {currentUser.lastName} (You)
                      </h3>
                      <p className="text-xs text-gray-600 dark:text-gray-300">
                        @{currentUser.username}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center space-x-2">
                      {getChangeIcon(currentUser.change)}
                      <span className="text-lg font-bold text-primary-600 dark:text-primary-400">
                        {currentUser.score.toLocaleString()}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {currentUser.change > 0 ? '+' : ''}{currentUser.change} this week
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Leaderboard Table */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-700">
                    <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">
                      Rank
                    </th>
                    <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">
                      User
                    </th>
                    <th className="text-right py-3 px-4 font-medium text-gray-500 dark:text-gray-400">
                      Score
                    </th>
                    <th className="text-right py-3 px-4 font-medium text-gray-500 dark:text-gray-400">
                      <AcademicCapIcon className="w-4 h-4 inline" title="Algorithms" />
                    </th>
                    <th className="text-right py-3 px-4 font-medium text-gray-500 dark:text-gray-400">
                      <PuzzlePieceIcon className="w-4 h-4 inline" title="Challenges" />
                    </th>
                    <th className="text-right py-3 px-4 font-medium text-gray-500 dark:text-gray-400">
                      <FireIcon className="w-4 h-4 inline" title="Streak" />
                    </th>
                    <th className="text-right py-3 px-4 font-medium text-gray-500 dark:text-gray-400">
                      <ClockIcon className="w-4 h-4 inline" title="Time" />
                    </th>
                    <th className="text-right py-3 px-4 font-medium text-gray-500 dark:text-gray-400">
                      Change
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {topUsers.map((user, index) => (
                    <motion.tr
                      key={user.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.6, delay: 0.1 * index }}
                      className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors duration-200"
                    >
                      <td className="py-4 px-4">
                        <div className="flex items-center justify-center w-8">
                          {getRankIcon(user.rank)}
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-gradient-to-br from-gray-400 to-gray-500 rounded-full flex items-center justify-center">
                            <UserIcon className="w-5 h-5 text-white" />
                          </div>
                          <div>
                            <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                              {user.firstName} {user.lastName}
                            </h3>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              @{user.username}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4 text-right">
                        <span className="text-sm font-semibold text-gray-900 dark:text-white">
                          {user.score.toLocaleString()}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-right">
                        <span className="text-sm text-gray-600 dark:text-gray-300">
                          {user.algorithmsCompleted}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-right">
                        <span className="text-sm text-gray-600 dark:text-gray-300">
                          {user.challengesSolved}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-right">
                        <span className="text-sm text-gray-600 dark:text-gray-300">
                          {user.currentStreak}d
                        </span>
                      </td>
                      <td className="py-4 px-4 text-right">
                        <span className="text-sm text-gray-600 dark:text-gray-300">
                          {user.totalTime}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-right">
                        <div className="flex items-center justify-end space-x-1">
                          {getChangeIcon(user.change)}
                          <span className={`text-sm ${
                            user.change > 0
                              ? 'text-green-600 dark:text-green-400'
                              : user.change < 0
                              ? 'text-red-600 dark:text-red-400'
                              : 'text-gray-500 dark:text-gray-400'
                          }`}>
                            {user.change > 0 ? '+' : ''}{user.change}
                          </span>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Stats Summary */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.4 }}
        className="mt-8 grid grid-cols-1 md:grid-cols-4 gap-6"
      >
        <div className="card p-6 text-center">
          <TrophyIcon className="w-8 h-8 text-yellow-500 mx-auto mb-2" />
          <div className="text-2xl font-bold text-gray-900 dark:text-white mb-1">1,247</div>
          <div className="text-sm text-gray-600 dark:text-gray-300">Total Participants</div>
        </div>
        <div className="card p-6 text-center">
          <AcademicCapIcon className="w-8 h-8 text-blue-500 mx-auto mb-2" />
          <div className="text-2xl font-bold text-gray-900 dark:text-white mb-1">15,892</div>
          <div className="text-sm text-gray-600 dark:text-gray-300">Algorithms Completed</div>
        </div>
        <div className="card p-6 text-center">
          <PuzzlePieceIcon className="w-8 h-8 text-green-500 mx-auto mb-2" />
          <div className="text-2xl font-bold text-gray-900 dark:text-white mb-1">8,456</div>
          <div className="text-sm text-gray-600 dark:text-gray-300">Challenges Solved</div>
        </div>
        <div className="card p-6 text-center">
          <ClockIcon className="w-8 h-8 text-purple-500 mx-auto mb-2" />
          <div className="text-2xl font-bold text-gray-900 dark:text-white mb-1">2,847h</div>
          <div className="text-sm text-gray-600 dark:text-gray-300">Total Learning Time</div>
        </div>
      </motion.div>
    </div>
  );
};
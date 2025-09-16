import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  MagnifyingGlassIcon,
  FunnelIcon,
  PuzzlePieceIcon,
  ClockIcon,
  TrophyIcon,
  PlayIcon,
  CheckCircleIcon,
} from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';

const categories = [
  { id: 'all', name: 'All Challenges', count: 45 },
  { id: 'arrays', name: 'Arrays', count: 12 },
  { id: 'strings', name: 'Strings', count: 8 },
  { id: 'trees', name: 'Trees', count: 10 },
  { id: 'graphs', name: 'Graphs', count: 8 },
  { id: 'dynamic-programming', name: 'Dynamic Programming', count: 7 },
];

const difficulties = [
  { id: 'all', name: 'All Levels' },
  { id: 'easy', name: 'Easy' },
  { id: 'medium', name: 'Medium' },
  { id: 'hard', name: 'Hard' },
];

const challenges = [
  {
    id: 1,
    title: 'Two Sum',
    category: 'arrays',
    difficulty: 'easy',
    description: 'Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.',
    acceptanceRate: 49.2,
    completed: true,
    estimatedTime: '15 min',
    tags: ['Array', 'Hash Table'],
  },
  {
    id: 2,
    title: 'Valid Parentheses',
    category: 'strings',
    difficulty: 'easy',
    description: 'Given a string s containing just the characters \'(\', \')\', \'{\', \'}\', \'[\' and \']\', determine if the input string is valid.',
    acceptanceRate: 40.1,
    completed: true,
    estimatedTime: '20 min',
    tags: ['String', 'Stack'],
  },
  {
    id: 3,
    title: 'Merge Two Sorted Lists',
    category: 'trees',
    difficulty: 'easy',
    description: 'You are given the heads of two sorted linked lists list1 and list2. Merge the two lists in a one sorted list.',
    acceptanceRate: 62.8,
    completed: false,
    estimatedTime: '25 min',
    tags: ['Linked List', 'Recursion'],
  },
  {
    id: 4,
    title: 'Maximum Subarray',
    category: 'dynamic-programming',
    difficulty: 'medium',
    description: 'Given an integer array nums, find the contiguous subarray which has the largest sum and return its sum.',
    acceptanceRate: 49.5,
    completed: false,
    estimatedTime: '30 min',
    tags: ['Array', 'Dynamic Programming'],
  },
  {
    id: 5,
    title: 'Binary Tree Inorder Traversal',
    category: 'trees',
    difficulty: 'easy',
    description: 'Given the root of a binary tree, return the inorder traversal of its nodes\' values.',
    acceptanceRate: 74.4,
    completed: false,
    estimatedTime: '20 min',
    tags: ['Stack', 'Tree', 'DFS'],
  },
  {
    id: 6,
    title: 'Number of Islands',
    category: 'graphs',
    difficulty: 'medium',
    description: 'Given an m x n 2D binary grid which represents a map of \'1\'s (land) and \'0\'s (water), return the number of islands.',
    acceptanceRate: 57.2,
    completed: false,
    estimatedTime: '35 min',
    tags: ['Array', 'DFS', 'BFS', 'Union Find'],
  },
];

const getDifficultyColor = (difficulty: string) => {
  switch (difficulty) {
    case 'easy':
      return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
    case 'medium':
      return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
    case 'hard':
      return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
    default:
      return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
  }
};

const getAcceptanceColor = (rate: number) => {
  if (rate >= 60) return 'text-green-600 dark:text-green-400';
  if (rate >= 40) return 'text-yellow-600 dark:text-yellow-400';
  return 'text-red-600 dark:text-red-400';
};

export const ChallengesPage: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredChallenges = challenges.filter((challenge) => {
    const matchesCategory = selectedCategory === 'all' || challenge.category === selectedCategory;
    const matchesDifficulty = selectedDifficulty === 'all' || challenge.difficulty === selectedDifficulty;
    const matchesSearch = challenge.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         challenge.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         challenge.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    
    return matchesCategory && matchesDifficulty && matchesSearch;
  });

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
          Coding Challenges
        </h1>
        <p className="text-gray-600 dark:text-gray-300">
          Practice your problem-solving skills with curated coding challenges
        </p>
      </motion.div>

      {/* Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
        className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8"
      >
        <div className="card p-4 text-center">
          <div className="text-2xl font-bold text-primary-600 mb-1">45</div>
          <div className="text-sm text-gray-600 dark:text-gray-300">Total Challenges</div>
        </div>
        <div className="card p-4 text-center">
          <div className="text-2xl font-bold text-green-600 mb-1">2</div>
          <div className="text-sm text-gray-600 dark:text-gray-300">Completed</div>
        </div>
        <div className="card p-4 text-center">
          <div className="text-2xl font-bold text-yellow-600 mb-1">4.4%</div>
          <div className="text-sm text-gray-600 dark:text-gray-300">Success Rate</div>
        </div>
        <div className="card p-4 text-center">
          <div className="text-2xl font-bold text-purple-600 mb-1">5</div>
          <div className="text-sm text-gray-600 dark:text-gray-300">Current Streak</div>
        </div>
      </motion.div>

      {/* Search and Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="mb-8 space-y-4"
      >
        {/* Search Bar */}
        <div className="relative">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search challenges..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
        </div>

        {/* Category Filters */}
        <div className="flex flex-wrap gap-2">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200 ${
                selectedCategory === category.id
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              {category.name} ({category.count})
            </button>
          ))}
        </div>

        {/* Difficulty Filter */}
        <div className="flex items-center space-x-4">
          <FunnelIcon className="h-5 w-5 text-gray-400" />
          <select
            value={selectedDifficulty}
            onChange={(e) => setSelectedDifficulty(e.target.value)}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          >
            {difficulties.map((difficulty) => (
              <option key={difficulty.id} value={difficulty.id}>
                {difficulty.name}
              </option>
            ))}
          </select>
        </div>
      </motion.div>

      {/* Results Count */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="mb-6"
      >
        <p className="text-gray-600 dark:text-gray-300">
          Showing {filteredChallenges.length} challenge{filteredChallenges.length !== 1 ? 's' : ''}
        </p>
      </motion.div>

      {/* Challenges List */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.3 }}
        className="space-y-4"
      >
        {filteredChallenges.map((challenge, index) => (
          <motion.div
            key={challenge.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 * index }}
            className="card card-hover p-6"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-3">
                  {challenge.completed ? (
                    <CheckCircleIcon className="w-6 h-6 text-green-500" />
                  ) : (
                    <PuzzlePieceIcon className="w-6 h-6 text-gray-400" />
                  )}
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                    {challenge.title}
                  </h3>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(challenge.difficulty)}`}>
                    {challenge.difficulty.charAt(0).toUpperCase() + challenge.difficulty.slice(1)}
                  </span>
                </div>
                
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  {challenge.description}
                </p>
                
                <div className="flex items-center space-x-6 text-sm text-gray-500 dark:text-gray-400 mb-4">
                  <div className="flex items-center space-x-1">
                    <TrophyIcon className="w-4 h-4" />
                    <span className={getAcceptanceColor(challenge.acceptanceRate)}>
                      {challenge.acceptanceRate}% acceptance
                    </span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <ClockIcon className="w-4 h-4" />
                    <span>{challenge.estimatedTime}</span>
                  </div>
                </div>
                
                <div className="flex flex-wrap gap-2">
                  {challenge.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded text-xs"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
              
              <div className="ml-6">
                <Link
                  to={`/playground?challenge=${challenge.id}`}
                  className="btn btn-primary flex items-center space-x-2"
                >
                  <PlayIcon className="w-4 h-4" />
                  <span>{challenge.completed ? 'Solve Again' : 'Solve'}</span>
                </Link>
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* Empty State */}
      {filteredChallenges.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
          className="text-center py-12"
        >
          <PuzzlePieceIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            No challenges found
          </h3>
          <p className="text-gray-500 dark:text-gray-400">
            Try adjusting your search criteria or filters.
          </p>
        </motion.div>
      )}
    </div>
  );
};
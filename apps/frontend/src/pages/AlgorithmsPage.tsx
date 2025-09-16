import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  MagnifyingGlassIcon,
  FunnelIcon,
  AcademicCapIcon,
  ClockIcon,
  SignalIcon,
  PlayIcon,
} from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';

const categories = [
  { id: 'all', name: 'All Algorithms', count: 24 },
  { id: 'sorting', name: 'Sorting', count: 8 },
  { id: 'searching', name: 'Searching', count: 6 },
  { id: 'graph', name: 'Graph', count: 10 },
];

const difficulties = [
  { id: 'all', name: 'All Levels' },
  { id: 'beginner', name: 'Beginner' },
  { id: 'intermediate', name: 'Intermediate' },
  { id: 'advanced', name: 'Advanced' },
];

const algorithms = [
  {
    id: 1,
    name: 'Bubble Sort',
    category: 'sorting',
    difficulty: 'beginner',
    timeComplexity: 'O(n²)',
    spaceComplexity: 'O(1)',
    description: 'A simple sorting algorithm that repeatedly steps through the list, compares adjacent elements and swaps them if they are in the wrong order.',
    completed: true,
    estimatedTime: '15 min',
  },
  {
    id: 2,
    name: 'Quick Sort',
    category: 'sorting',
    difficulty: 'intermediate',
    timeComplexity: 'O(n log n)',
    spaceComplexity: 'O(log n)',
    description: 'An efficient divide-and-conquer algorithm that works by selecting a pivot element and partitioning the array around it.',
    completed: true,
    estimatedTime: '25 min',
  },
  {
    id: 3,
    name: 'Merge Sort',
    category: 'sorting',
    difficulty: 'intermediate',
    timeComplexity: 'O(n log n)',
    spaceComplexity: 'O(n)',
    description: 'A stable divide-and-conquer algorithm that divides the array into halves, sorts them, and then merges them back together.',
    completed: false,
    estimatedTime: '30 min',
  },
  {
    id: 4,
    name: 'Binary Search',
    category: 'searching',
    difficulty: 'beginner',
    timeComplexity: 'O(log n)',
    spaceComplexity: 'O(1)',
    description: 'An efficient algorithm for finding an item from a sorted list of items by repeatedly dividing the search interval in half.',
    completed: true,
    estimatedTime: '20 min',
  },
  {
    id: 5,
    name: 'Depth-First Search',
    category: 'graph',
    difficulty: 'intermediate',
    timeComplexity: 'O(V + E)',
    spaceComplexity: 'O(V)',
    description: 'A graph traversal algorithm that explores as far as possible along each branch before backtracking.',
    completed: false,
    estimatedTime: '35 min',
  },
  {
    id: 6,
    name: 'Dijkstra\'s Algorithm',
    category: 'graph',
    difficulty: 'advanced',
    timeComplexity: 'O((V + E) log V)',
    spaceComplexity: 'O(V)',
    description: 'An algorithm for finding the shortest paths between nodes in a graph, which may represent road networks.',
    completed: false,
    estimatedTime: '45 min',
  },
];

const getDifficultyColor = (difficulty: string) => {
  switch (difficulty) {
    case 'beginner':
      return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
    case 'intermediate':
      return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
    case 'advanced':
      return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
    default:
      return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
  }
};

export const AlgorithmsPage: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredAlgorithms = algorithms.filter((algorithm) => {
    const matchesCategory = selectedCategory === 'all' || algorithm.category === selectedCategory;
    const matchesDifficulty = selectedDifficulty === 'all' || algorithm.difficulty === selectedDifficulty;
    const matchesSearch = algorithm.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         algorithm.description.toLowerCase().includes(searchQuery.toLowerCase());
    
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
          Algorithm Library
        </h1>
        <p className="text-gray-600 dark:text-gray-300">
          Explore and learn fundamental algorithms with interactive visualizations
        </p>
      </motion.div>

      {/* Search and Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
        className="mb-8 space-y-4"
      >
        {/* Search Bar */}
        <div className="relative">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search algorithms..."
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
          Showing {filteredAlgorithms.length} algorithm{filteredAlgorithms.length !== 1 ? 's' : ''}
        </p>
      </motion.div>

      {/* Algorithm Grid */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
      >
        {filteredAlgorithms.map((algorithm, index) => (
          <motion.div
            key={algorithm.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 * index }}
            className="card card-hover p-6 relative"
          >
            {/* Completion Badge */}
            {algorithm.completed && (
              <div className="absolute top-4 right-4">
                <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                  <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
            )}

            <div className="mb-4">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                {algorithm.name}
              </h3>
              <div className="flex items-center space-x-2 mb-3">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(algorithm.difficulty)}`}>
                  {algorithm.difficulty.charAt(0).toUpperCase() + algorithm.difficulty.slice(1)}
                </span>
                <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                  {algorithm.category}
                </span>
              </div>
              <p className="text-gray-600 dark:text-gray-300 text-sm mb-4">
                {algorithm.description}
              </p>
            </div>

            {/* Complexity Info */}
            <div className="space-y-2 mb-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500 dark:text-gray-400 flex items-center">
                  <ClockIcon className="w-4 h-4 mr-1" />
                  Time:
                </span>
                <span className="font-mono text-gray-900 dark:text-white">
                  {algorithm.timeComplexity}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500 dark:text-gray-400 flex items-center">
                  <SignalIcon className="w-4 h-4 mr-1" />
                  Space:
                </span>
                <span className="font-mono text-gray-900 dark:text-white">
                  {algorithm.spaceComplexity}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500 dark:text-gray-400 flex items-center">
                  <AcademicCapIcon className="w-4 h-4 mr-1" />
                  Est. Time:
                </span>
                <span className="text-gray-900 dark:text-white">
                  {algorithm.estimatedTime}
                </span>
              </div>
            </div>

            {/* Action Button */}
            <Link
              to={`/visualization/${algorithm.id}`}
              className="w-full btn btn-primary flex items-center justify-center space-x-2"
            >
              <PlayIcon className="w-4 h-4" />
              <span>{algorithm.completed ? 'Review' : 'Learn'}</span>
            </Link>
          </motion.div>
        ))}
      </motion.div>

      {/* Empty State */}
      {filteredAlgorithms.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
          className="text-center py-12"
        >
          <AcademicCapIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            No algorithms found
          </h3>
          <p className="text-gray-500 dark:text-gray-400">
            Try adjusting your search criteria or filters.
          </p>
        </motion.div>
      )}
    </div>
  );
};
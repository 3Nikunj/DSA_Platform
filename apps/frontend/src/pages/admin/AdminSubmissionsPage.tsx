import React, { useState, useEffect } from 'react';
import { Search, Filter, Eye, Code, Clock, CheckCircle, XCircle, AlertCircle, User, Trophy, Target, BarChart3, TrendingUp, Download, RefreshCw } from 'lucide-react';

interface Submission {
  id: string;
  userId: string;
  username: string;
  problemId: string;
  problemTitle: string;
  problemDifficulty: 'BEGINNER' | 'EASY' | 'MEDIUM' | 'HARD' | 'EXPERT';
  problemCategory: string;
  code: string;
  language: string;
  status: 'PENDING' | 'RUNNING' | 'ACCEPTED' | 'WRONG_ANSWER' | 'TIME_LIMIT_EXCEEDED' | 'MEMORY_LIMIT_EXCEEDED' | 'RUNTIME_ERROR' | 'COMPILATION_ERROR';
  runtime: number;
  memory: number;
  score: number;
  testCasesPassed: number;
  totalTestCases: number;
  submissionTime: string;
  executionTime: number;
  errorMessage?: string;
  notes?: string;
  isFlagged: boolean;
  plagiarismScore: number;
  optimized: boolean;
  createdAt: string;
  updatedAt: string;
}

const AdminSubmissionsPage: React.FC = () => {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [filteredSubmissions, setFilteredSubmissions] = useState<Submission[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    status: 'all',
    language: 'all',
    difficulty: 'all',
    category: 'all',
    scoreMin: '',
    scoreMax: '',
    runtimeMin: '',
    runtimeMax: '',
    flagged: 'all',
    optimized: 'all'
  });
  const [showFilters, setShowFilters] = useState(false);
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(20);

  useEffect(() => {
    fetchSubmissions();
  }, []);

  useEffect(() => {
    filterSubmissions();
  }, [submissions, searchTerm, filters]);

  const fetchSubmissions = async () => {
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const mockSubmissions: Submission[] = [
        {
          id: '1',
          userId: 'user123',
          username: 'john_doe',
          problemId: 'prob456',
          problemTitle: 'Two Sum',
          problemDifficulty: 'EASY',
          problemCategory: 'Arrays',
          code: 'function twoSum(nums, target) {\n  const map = new Map();\n  for (let i = 0; i < nums.length; i++) {\n    const complement = target - nums[i];\n    if (map.has(complement)) {\n      return [map.get(complement), i];\n    }\n    map.set(nums[i], i);\n  }\n  return [];\n}',
          language: 'javascript',
          status: 'ACCEPTED',
          runtime: 72,
          memory: 42.3,
          score: 100,
          testCasesPassed: 57,
          totalTestCases: 57,
          submissionTime: '2024-01-15T14:30:00Z',
          executionTime: 1.2,
          isFlagged: false,
          plagiarismScore: 12,
          optimized: true,
          createdAt: '2024-01-15T14:30:00Z',
          updatedAt: '2024-01-15T14:30:05Z'
        },
        {
          id: '2',
          userId: 'user124',
          username: 'jane_smith',
          problemId: 'prob457',
          problemTitle: 'Binary Tree Traversal',
          problemDifficulty: 'MEDIUM',
          problemCategory: 'Trees',
          code: 'function inorderTraversal(root) {\n  const result = [];\n  function inorder(node) {\n    if (node) {\n      inorder(node.left);\n      result.push(node.val);\n      inorder(node.right);\n    }\n  }\n  inorder(root);\n  return result;\n}',
          language: 'javascript',
          status: 'ACCEPTED',
          runtime: 68,
          memory: 45.1,
          score: 100,
          testCasesPassed: 89,
          totalTestCases: 89,
          submissionTime: '2024-01-15T15:45:00Z',
          executionTime: 0.8,
          isFlagged: false,
          plagiarismScore: 8,
          optimized: true,
          createdAt: '2024-01-15T15:45:00Z',
          updatedAt: '2024-01-15T15:45:03Z'
        },
        {
          id: '3',
          userId: 'user125',
          username: 'mike_wilson',
          problemId: 'prob458',
          problemTitle: 'Longest Common Subsequence',
          problemDifficulty: 'MEDIUM',
          problemCategory: 'Dynamic Programming',
          code: 'function longestCommonSubsequence(text1, text2) {\n  const m = text1.length, n = text2.length;\n  const dp = Array(m + 1).fill().map(() => Array(n + 1).fill(0));\n  \n  for (let i = 1; i <= m; i++) {\n    for (let j = 1; j <= n; j++) {\n      if (text1[i-1] === text2[j-1]) {\n        dp[i][j] = dp[i-1][j-1] + 1;\n      } else {\n        dp[i][j] = Math.max(dp[i-1][j], dp[i][j-1]);\n      }\n    }\n  }\n  return dp[m][n];\n}',
          language: 'javascript',
          status: 'TIME_LIMIT_EXCEEDED',
          runtime: 0,
          memory: 0,
          score: 0,
          testCasesPassed: 12,
          totalTestCases: 50,
          submissionTime: '2024-01-15T16:20:00Z',
          executionTime: 3000,
          errorMessage: 'Time limit exceeded on large inputs',
          isFlagged: true,
          plagiarismScore: 45,
          optimized: false,
          createdAt: '2024-01-15T16:20:00Z',
          updatedAt: '2024-01-15T16:23:00Z'
        },
        {
          id: '4',
          userId: 'user126',
          username: 'sarah_jones',
          problemId: 'prob459',
          problemTitle: 'Merge Intervals',
          problemDifficulty: 'MEDIUM',
          problemCategory: 'Arrays',
          code: 'function merge(intervals) {\n  if (intervals.length === 0) return [];\n  \n  intervals.sort((a, b) => a[0] - b[0]);\n  const result = [intervals[0]];\n  \n  for (let i = 1; i < intervals.length; i++) {\n    const current = intervals[i];\n    const last = result[result.length - 1];\n    \n    if (current[0] <= last[1]) {\n      last[1] = Math.max(last[1], current[1]);\n    } else {\n      result.push(current);\n    }\n  }\n  \n  return result;\n}',
          language: 'javascript',
          status: 'ACCEPTED',
          runtime: 88,
          memory: 48.2,
          score: 100,
          testCasesPassed: 168,
          totalTestCases: 168,
          submissionTime: '2024-01-15T17:10:00Z',
          executionTime: 1.5,
          isFlagged: false,
          plagiarismScore: 15,
          optimized: true,
          createdAt: '2024-01-15T17:10:00Z',
          updatedAt: '2024-01-15T17:10:08Z'
        },
        {
          id: '5',
          userId: 'user127',
          username: 'alex_chen',
          problemId: 'prob460',
          problemTitle: 'Valid Parentheses',
          problemDifficulty: 'EASY',
          problemCategory: 'Strings',
          code: 'function isValid(s) {\n  const stack = [];\n  const pairs = {"(": ")", "[\": \"]\", "{\": \"}\"};\n  \n  for (let char of s) {\n    if (pairs[char]) {\n      stack.push(char);\n    } else if (stack.length === 0 || pairs[stack.pop()] !== char) {\n      return false;\n    }\n  }\n  \n  return stack.length === 0;\n}',
          language: 'javascript',
          status: 'COMPILATION_ERROR',
          runtime: 0,
          memory: 0,
          score: 0,
          testCasesPassed: 0,
          totalTestCases: 0,
          submissionTime: '2024-01-15T18:30:00Z',
          executionTime: 0,
          errorMessage: 'SyntaxError: Unexpected token',
          isFlagged: false,
          plagiarismScore: 5,
          optimized: false,
          createdAt: '2024-01-15T18:30:00Z',
          updatedAt: '2024-01-15T18:30:01Z'
        }
      ];
      
      setSubmissions(mockSubmissions);
    } catch (error) {
      console.error('Error fetching submissions:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filterSubmissions = () => {
    const filtered = submissions.filter(submission => {
      const matchesSearch = submission.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           submission.problemTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           submission.language.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = filters.status === 'all' || submission.status === filters.status;
      const matchesLanguage = filters.language === 'all' || submission.language === filters.language;
      const matchesDifficulty = filters.difficulty === 'all' || submission.problemDifficulty === filters.difficulty;
      const matchesCategory = filters.category === 'all' || submission.problemCategory === filters.category;
      
      const scoreMin = filters.scoreMin ? parseInt(filters.scoreMin) : 0;
      const scoreMax = filters.scoreMax ? parseInt(filters.scoreMax) : 100;
      const matchesScore = submission.score >= scoreMin && submission.score <= scoreMax;
      
      const runtimeMin = filters.runtimeMin ? parseInt(filters.runtimeMin) : 0;
      const runtimeMax = filters.runtimeMax ? parseInt(filters.runtimeMax) : 10000;
      const matchesRuntime = submission.runtime >= runtimeMin && submission.runtime <= runtimeMax;
      
      const matchesFlagged = filters.flagged === 'all' || 
                            (filters.flagged === 'true' && submission.isFlagged) ||
                            (filters.flagged === 'false' && !submission.isFlagged);
      
      const matchesOptimized = filters.optimized === 'all' || 
                             (filters.optimized === 'true' && submission.optimized) ||
                             (filters.optimized === 'false' && !submission.optimized);
      
      return matchesSearch && matchesStatus && matchesLanguage && matchesDifficulty && 
             matchesCategory && matchesScore && matchesRuntime && matchesFlagged && matchesOptimized;
    });
    
    setFilteredSubmissions(filtered);
    setCurrentPage(1);
  };

  const getStatusBadge = (status: string) => {
    const colors = {
      PENDING: 'bg-yellow-100 text-yellow-800',
      RUNNING: 'bg-blue-100 text-blue-800',
      ACCEPTED: 'bg-green-100 text-green-800',
      WRONG_ANSWER: 'bg-red-100 text-red-800',
      TIME_LIMIT_EXCEEDED: 'bg-orange-100 text-orange-800',
      MEMORY_LIMIT_EXCEEDED: 'bg-purple-100 text-purple-800',
      RUNTIME_ERROR: 'bg-red-100 text-red-800',
      COMPILATION_ERROR: 'bg-gray-100 text-gray-800'
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'ACCEPTED': return <CheckCircle className="w-4 h-4" />;
      case 'WRONG_ANSWER':
      case 'RUNTIME_ERROR':
      case 'COMPILATION_ERROR': return <XCircle className="w-4 h-4" />;
      case 'TIME_LIMIT_EXCEEDED':
      case 'MEMORY_LIMIT_EXCEEDED': return <AlertCircle className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  const getDifficultyBadge = (difficulty: string) => {
    const colors = {
      BEGINNER: 'bg-green-100 text-green-800',
      EASY: 'bg-blue-100 text-blue-800',
      MEDIUM: 'bg-yellow-100 text-yellow-800',
      HARD: 'bg-orange-100 text-orange-800',
      EXPERT: 'bg-red-100 text-red-800'
    };
    return colors[difficulty as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const handleViewSubmission = (submission: Submission) => {
    setSelectedSubmission(submission);
  };

  const handleExportSubmissions = () => {
    const csvContent = [
      ['ID', 'Username', 'Problem', 'Difficulty', 'Category', 'Language', 'Status', 'Score', 'Runtime', 'Memory', 'Submission Time'].join(','),
      ...filteredSubmissions.map(sub => [
        sub.id, sub.username, sub.problemTitle, sub.problemDifficulty, 
        sub.problemCategory, sub.language, sub.status, sub.score, 
        sub.runtime, sub.memory, new Date(sub.submissionTime).toLocaleString()
      ].join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'submissions_export.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const handleRefresh = () => {
    fetchSubmissions();
  };

  // Pagination
  const totalPages = Math.ceil(filteredSubmissions.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedSubmissions = filteredSubmissions.slice(startIndex, startIndex + itemsPerPage);

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Submission Management</h1>
          <p className="text-gray-600 mt-1">Monitor and analyze user code submissions</p>
        </div>
        <div className="flex items-center space-x-4">
          <button
            onClick={handleRefresh}
            className="flex items-center px-4 py-2 text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-50 transition-colors"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </button>
          <button
            onClick={handleExportSubmissions}
            className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <Download className="w-4 h-4 mr-2" />
            Export
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Submissions</p>
              <p className="text-2xl font-bold text-gray-900">{submissions.length.toLocaleString()}</p>
            </div>
            <BarChart3 className="w-8 h-8 text-blue-600" />
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Success Rate</p>
              <p className="text-2xl font-bold text-green-600">
                {Math.round((submissions.filter(s => s.status === 'ACCEPTED').length / submissions.length) * 100)}%
              </p>
            </div>
            <TrendingUp className="w-8 h-8 text-green-600" />
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Avg Runtime</p>
              <p className="text-2xl font-bold text-gray-900">
                {Math.round(submissions.filter(s => s.runtime > 0).reduce((acc, s) => acc + s.runtime, 0) / submissions.filter(s => s.runtime > 0).length || 0)}ms
              </p>
            </div>
            <Clock className="w-8 h-8 text-purple-600" />
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Flagged Submissions</p>
              <p className="text-2xl font-bold text-red-600">
                {submissions.filter(s => s.isFlagged).length.toLocaleString()}
              </p>
            </div>
            <AlertCircle className="w-8 h-8 text-red-600" />
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="flex flex-col sm:flex-row gap-4 mb-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search by username, problem, or language..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Filter className="w-5 h-5 mr-2" />
            Filters
          </button>
        </div>

        {showFilters && (
          <div className="pt-4 border-t border-gray-200 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <select
              value={filters.status}
              onChange={(e) => setFilters({...filters, status: e.target.value})}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="PENDING">Pending</option>
              <option value="RUNNING">Running</option>
              <option value="ACCEPTED">Accepted</option>
              <option value="WRONG_ANSWER">Wrong Answer</option>
              <option value="TIME_LIMIT_EXCEEDED">Time Limit Exceeded</option>
              <option value="MEMORY_LIMIT_EXCEEDED">Memory Limit Exceeded</option>
              <option value="RUNTIME_ERROR">Runtime Error</option>
              <option value="COMPILATION_ERROR">Compilation Error</option>
            </select>

            <select
              value={filters.language}
              onChange={(e) => setFilters({...filters, language: e.target.value})}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Languages</option>
              <option value="javascript">JavaScript</option>
              <option value="python">Python</option>
              <option value="java">Java</option>
              <option value="cpp">C++</option>
              <option value="csharp">C#</option>
              <option value="go">Go</option>
              <option value="rust">Rust</option>
            </select>

            <select
              value={filters.difficulty}
              onChange={(e) => setFilters({...filters, difficulty: e.target.value})}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Difficulties</option>
              <option value="BEGINNER">Beginner</option>
              <option value="EASY">Easy</option>
              <option value="MEDIUM">Medium</option>
              <option value="HARD">Hard</option>
              <option value="EXPERT">Expert</option>
            </select>

            <select
              value={filters.category}
              onChange={(e) => setFilters({...filters, category: e.target.value})}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Categories</option>
              <option value="Arrays">Arrays</option>
              <option value="Strings">Strings</option>
              <option value="Trees">Trees</option>
              <option value="Graphs">Graphs</option>
              <option value="Dynamic Programming">Dynamic Programming</option>
              <option value="Sorting">Sorting</option>
              <option value="Searching">Searching</option>
            </select>

            <input
              type="number"
              placeholder="Min Score"
              value={filters.scoreMin}
              onChange={(e) => setFilters({...filters, scoreMin: e.target.value})}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              min="0"
              max="100"
            />

            <input
              type="number"
              placeholder="Max Score"
              value={filters.scoreMax}
              onChange={(e) => setFilters({...filters, scoreMax: e.target.value})}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              min="0"
              max="100"
            />

            <input
              type="number"
              placeholder="Min Runtime (ms)"
              value={filters.runtimeMin}
              onChange={(e) => setFilters({...filters, runtimeMin: e.target.value})}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              min="0"
            />

            <input
              type="number"
              placeholder="Max Runtime (ms)"
              value={filters.runtimeMax}
              onChange={(e) => setFilters({...filters, runtimeMax: e.target.value})}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              min="0"
            />

            <select
              value={filters.flagged}
              onChange={(e) => setFilters({...filters, flagged: e.target.value})}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Submissions</option>
              <option value="true">Flagged</option>
              <option value="false">Not Flagged</option>
            </select>

            <select
              value={filters.optimized}
              onChange={(e) => setFilters({...filters, optimized: e.target.value})}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Optimizations</option>
              <option value="true">Optimized</option>
              <option value="false">Not Optimized</option>
            </select>
          </div>
        )}
      </div>

      {/* Submissions Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Problem</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Score</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Runtime</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Memory</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Test Cases</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Submission Time</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {paginatedSubmissions.map((submission) => (
                <tr key={submission.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <User className="w-5 h-5 text-gray-400 mr-3" />
                      <div>
                        <div className="text-sm font-medium text-gray-900">{submission.username}</div>
                        <div className="text-xs text-gray-500">ID: {submission.userId}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{submission.problemTitle}</div>
                      <div className="flex items-center space-x-2 mt-1">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getDifficultyBadge(submission.problemDifficulty)}`}>
                          {submission.problemDifficulty}
                        </span>
                        <span className="text-xs text-gray-500">{submission.problemCategory}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <span className={`inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadge(submission.status)}`}>
                        {getStatusIcon(submission.status)}
                        <span className="ml-1">{submission.status.replace('_', ' ')}</span>
                      </span>
                      {submission.isFlagged && (
                        <AlertCircle className="w-4 h-4 text-red-500 ml-2" />
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{submission.score}%</div>
                    {submission.optimized && (
                      <div className="text-xs text-green-600">Optimized</div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {submission.runtime > 0 ? `${submission.runtime}ms` : 'N/A'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {submission.memory > 0 ? `${submission.memory}MB` : 'N/A'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {submission.testCasesPassed}/{submission.totalTestCases}
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                      <div 
                        className="bg-blue-600 h-2 rounded-full" 
                        style={{ width: `${(submission.testCasesPassed / submission.totalTestCases) * 100}%` }}
                      ></div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {new Date(submission.submissionTime).toLocaleDateString()}
                    </div>
                    <div className="text-xs text-gray-500">
                      {new Date(submission.submissionTime).toLocaleTimeString()}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button
                      onClick={() => handleViewSubmission(submission)}
                      className="flex items-center px-3 py-1 text-sm text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded transition-colors"
                    >
                      <Eye className="w-4 h-4 mr-1" />
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-700">
            Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, filteredSubmissions.length)} of {filteredSubmissions.length} results
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <span className="text-sm text-gray-700">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className="px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {filteredSubmissions.length === 0 && (
        <div className="text-center py-12">
          <Code className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No submissions found</h3>
          <p className="text-gray-600">Try adjusting your search or filter criteria</p>
        </div>
      )}

      {/* Submission Detail Modal */}
      {selectedSubmission && (
        <AdminSubmissionModal
          submission={selectedSubmission}
          onClose={() => setSelectedSubmission(null)}
        />
      )}
    </div>
  );
};

interface AdminSubmissionModalProps {
  submission: Submission;
  onClose: () => void;
}

const AdminSubmissionModal: React.FC<AdminSubmissionModalProps> = ({ submission, onClose }) => {
  const [activeTab, setActiveTab] = useState<'code' | 'testcases' | 'performance' | 'notes'>('code');
  const [notes, setNotes] = useState(submission.notes || '');

  const getStatusBadge = (status: string) => {
    const colors = {
      PENDING: 'bg-yellow-100 text-yellow-800',
      RUNNING: 'bg-blue-100 text-blue-800',
      ACCEPTED: 'bg-green-100 text-green-800',
      WRONG_ANSWER: 'bg-red-100 text-red-800',
      TIME_LIMIT_EXCEEDED: 'bg-orange-100 text-orange-800',
      MEMORY_LIMIT_EXCEEDED: 'bg-purple-100 text-purple-800',
      RUNTIME_ERROR: 'bg-red-100 text-red-800',
      COMPILATION_ERROR: 'bg-gray-100 text-gray-800'
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const handleSaveNotes = () => {
    // Simulate API call to save notes
    console.log('Saving notes:', notes);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] overflow-hidden">
        <div className="p-6 border-b border-gray-200 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Submission Details</h2>
            <p className="text-gray-600">{submission.problemTitle} by {submission.username}</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <XCircle className="w-6 h-6" />
          </button>
        </div>

        <div className="flex h-[calc(90vh-200px)]">
          {/* Left Panel - Submission Info */}
          <div className="w-1/3 border-r border-gray-200 p-6 overflow-y-auto">
            <div className="space-y-6">
              {/* Basic Info */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Basic Information</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Status:</span>
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusBadge(submission.status)}`}>
                      {submission.status.replace('_', ' ')}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Language:</span>
                    <span className="font-medium">{submission.language}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Difficulty:</span>
                    <span className="font-medium">{submission.problemDifficulty}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Category:</span>
                    <span className="font-medium">{submission.problemCategory}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Score:</span>
                    <span className="font-medium">{submission.score}%</span>
                  </div>
                </div>
              </div>

              {/* Performance Metrics */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Performance</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Runtime:</span>
                    <span className="font-medium">{submission.runtime}ms</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Memory:</span>
                    <span className="font-medium">{submission.memory}MB</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Execution Time:</span>
                    <span className="font-medium">{submission.executionTime}s</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Test Cases:</span>
                    <span className="font-medium">{submission.testCasesPassed}/{submission.totalTestCases}</span>
                  </div>
                </div>
              </div>

              {/* Quality Metrics */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Quality Metrics</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Plagiarism Score:</span>
                    <span className={`font-medium ${submission.plagiarismScore > 30 ? 'text-red-600' : submission.plagiarismScore > 15 ? 'text-yellow-600' : 'text-green-600'}`}>
                      {submission.plagiarismScore}%
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Optimized:</span>
                    <span className={`font-medium ${submission.optimized ? 'text-green-600' : 'text-gray-600'}`}>
                      {submission.optimized ? 'Yes' : 'No'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Flagged:</span>
                    <span className={`font-medium ${submission.isFlagged ? 'text-red-600' : 'text-green-600'}`}>
                      {submission.isFlagged ? 'Yes' : 'No'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Submission Info */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Submission Info</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Submission ID:</span>
                    <span className="font-mono text-xs">{submission.id}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Problem ID:</span>
                    <span className="font-mono text-xs">{submission.problemId}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">User ID:</span>
                    <span className="font-mono text-xs">{submission.userId}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Submitted:</span>
                    <span className="text-xs">{new Date(submission.submissionTime).toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Panel - Tabs Content */}
          <div className="flex-1 flex flex-col">
            {/* Tab Navigation */}
            <div className="border-b border-gray-200">
              <nav className="flex space-x-8 px-6">
                {[
                  { id: 'code', label: 'Code', icon: Code },
                  { id: 'testcases', label: 'Test Cases', icon: Target },
                  { id: 'performance', label: 'Performance', icon: BarChart3 },
                  { id: 'notes', label: 'Notes', icon: Trophy }
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`flex items-center px-1 py-4 border-b-2 font-medium text-sm ${
                      activeTab === tab.id
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <tab.icon className="w-4 h-4 mr-2" />
                    {tab.label}
                  </button>
                ))}
              </nav>
            </div>

            {/* Tab Content */}
            <div className="flex-1 p-6 overflow-y-auto">
              {activeTab === 'code' && (
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">Source Code</h3>
                    <span className="text-sm text-gray-600">{submission.language}</span>
                  </div>
                  <div className="bg-gray-900 rounded-lg p-4 overflow-x-auto">
                    <pre className="text-sm text-gray-100 font-mono whitespace-pre-wrap">
                      {submission.code}
                    </pre>
                  </div>
                </div>
              )}

              {activeTab === 'testcases' && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Test Case Results</h3>
                  <div className="space-y-3">
                    {Array.from({ length: submission.totalTestCases }, (_, i) => (
                      <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center">
                          {i < submission.testCasesPassed ? (
                            <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                          ) : (
                            <XCircle className="w-5 h-5 text-red-500 mr-3" />
                          )}
                          <span className="text-sm font-medium">Test Case {i + 1}</span>
                        </div>
                        <span className={`text-sm font-medium ${
                          i < submission.testCasesPassed ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {i < submission.testCasesPassed ? 'Passed' : 'Failed'}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === 'performance' && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance Analysis</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <h4 className="font-medium text-gray-900 mb-2">Runtime Performance</h4>
                      <div className="text-2xl font-bold text-blue-600">{submission.runtime}ms</div>
                      <div className="text-sm text-gray-600">Execution time</div>
                    </div>
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <h4 className="font-medium text-gray-900 mb-2">Memory Usage</h4>
                      <div className="text-2xl font-bold text-green-600">{submission.memory}MB</div>
                      <div className="text-sm text-gray-600">Peak memory consumption</div>
                    </div>
                  </div>
                  
                  {submission.errorMessage && (
                    <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                      <h4 className="font-medium text-red-800 mb-2">Error Details</h4>
                      <p className="text-sm text-red-700">{submission.errorMessage}</p>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'notes' && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Admin Notes</h3>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Add notes about this submission..."
                    className="w-full h-64 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <div className="mt-4 flex justify-end">
                    <button
                      onClick={handleSaveNotes}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Save Notes
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminSubmissionsPage;
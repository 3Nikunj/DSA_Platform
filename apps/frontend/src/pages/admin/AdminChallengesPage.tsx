import React, { useState, useEffect } from 'react';
import {
  Plus,
  Search,
  Filter,
  Edit,
  Trash2,
  Eye,
  Calendar,
  Users,
  Trophy,
  Clock,
  Target,
  Award,
  TrendingUp,
  Star,
  XCircle,
} from 'lucide-react';

interface Challenge {
  id: string;
  title: string;
  description: string;
  difficulty: 'BEGINNER' | 'EASY' | 'MEDIUM' | 'HARD' | 'EXPERT';
  category: string;
  startDate: string;
  endDate: string;
  maxParticipants: number;
  currentParticipants: number;
  prizePool: number;
  status: 'UPCOMING' | 'ACTIVE' | 'COMPLETED' | 'CANCELLED';
  type: 'WEEKLY' | 'MONTHLY' | 'SPECIAL' | 'DAILY';
  rules: string[];
  requirements: string[];
  problems: string[];
  leaderboard: boolean;
  rated: boolean;
  featured: boolean;
  createdAt: string;
  updatedAt: string;
}

const AdminChallengesPage: React.FC = () => {
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [filteredChallenges, setFilteredChallenges] = useState<Challenge[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    status: 'all',
    difficulty: 'all',
    category: 'all',
    type: 'all',
    featured: 'all',
  });
  const [showFilters, setShowFilters] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingChallenge, setEditingChallenge] = useState<Challenge | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(true);

  const filterChallenges = React.useCallback(() => {
    const filtered = challenges.filter(challenge => {
      const matchesSearch =
        challenge.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        challenge.description.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus =
        filters.status === 'all' ||
        (filters.status === 'upcoming' && challenge.status === 'UPCOMING') ||
        (filters.status === 'active' && challenge.status === 'ACTIVE') ||
        (filters.status === 'completed' && challenge.status === 'COMPLETED') ||
        (filters.status === 'cancelled' && challenge.status === 'CANCELLED');

      const matchesDifficulty =
        filters.difficulty === 'all' || challenge.difficulty === filters.difficulty;

      const matchesCategory =
        filters.category === 'all' || challenge.category === filters.category;

      const matchesStartDate = true; // No startDate filter in filters interface
      const matchesEndDate = true; // No endDate filter in filters interface

      return matchesSearch && matchesStatus && matchesDifficulty && matchesCategory && matchesStartDate && matchesEndDate;
    });

    const sorted = [...filtered].sort((a, b) => {
      // Sort by title by default since no sortBy in filters interface
      return a.title.localeCompare(b.title);
    });

    setFilteredChallenges(sorted);
  }, [challenges, searchTerm, filters]);

  useEffect(() => {
    fetchChallenges();
  }, []);

  useEffect(() => {
    filterChallenges();
  }, [filterChallenges]);

  const fetchChallenges = async () => {
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      const mockChallenges: Challenge[] = [
        {
          id: '1',
          title: 'Weekly Algorithm Challenge #45',
          description:
            'Solve 5 algorithmic problems within 2 hours. Focus on array manipulation and dynamic programming.',
          difficulty: 'MEDIUM',
          category: 'Arrays',
          startDate: '2024-01-15T10:00:00Z',
          endDate: '2024-01-22T10:00:00Z',
          maxParticipants: 500,
          currentParticipants: 342,
          prizePool: 1000,
          status: 'ACTIVE',
          type: 'WEEKLY',
          rules: [
            '2 hour time limit',
            'No external resources',
            'Individual participation only',
          ],
          requirements: [
            'Basic programming knowledge',
            'Understanding of arrays and DP',
          ],
          problems: [
            'Two Sum',
            'Maximum Subarray',
            'Longest Increasing Subsequence',
          ],
          leaderboard: true,
          rated: true,
          featured: true,
          createdAt: '2024-01-10T08:00:00Z',
          updatedAt: '2024-01-15T09:30:00Z',
        },
        {
          id: '2',
          title: 'Graph Theory Marathon',
          description:
            'Advanced graph algorithms challenge spanning multiple categories including shortest path, MST, and network flow.',
          difficulty: 'EXPERT',
          category: 'Graphs',
          startDate: '2024-02-01T00:00:00Z',
          endDate: '2024-02-28T23:59:59Z',
          maxParticipants: 200,
          currentParticipants: 89,
          prizePool: 5000,
          status: 'UPCOMING',
          type: 'MONTHLY',
          rules: [
            '28 days to complete',
            'Can use any programming language',
            'Team participation allowed',
          ],
          requirements: [
            'Advanced graph theory knowledge',
            'Experience with complex algorithms',
          ],
          problems: ['Dijkstra Algorithm', 'Kruskal MST', 'Max Flow Problem'],
          leaderboard: true,
          rated: true,
          featured: false,
          createdAt: '2024-01-20T10:00:00Z',
          updatedAt: '2024-01-20T10:00:00Z',
        },
        {
          id: '3',
          title: 'Beginner Friendly Contest',
          description:
            'Perfect for newcomers! Simple problems to build confidence and learn basic programming concepts.',
          difficulty: 'BEGINNER',
          category: 'Basic Programming',
          startDate: '2024-01-20T14:00:00Z',
          endDate: '2024-01-20T16:00:00Z',
          maxParticipants: 1000,
          currentParticipants: 756,
          prizePool: 300,
          status: 'COMPLETED',
          type: 'DAILY',
          rules: ['2 hour duration', 'Beginner friendly', 'Hints available'],
          requirements: ['No prior experience required'],
          problems: ['Hello World', 'Simple Math', 'String Reversal'],
          leaderboard: true,
          rated: false,
          featured: true,
          createdAt: '2024-01-19T12:00:00Z',
          updatedAt: '2024-01-20T16:30:00Z',
        },
      ];

      setChallenges(mockChallenges);
    } catch (error) {
      console.error('Error fetching challenges:', error);
    } finally {
      setIsLoading(false);
    }
  };


  const getStatusBadge = (status: string) => {
    const colors = {
      UPCOMING: 'bg-blue-100 text-blue-800',
      ACTIVE: 'bg-green-100 text-green-800',
      COMPLETED: 'bg-gray-100 text-gray-800',
      CANCELLED: 'bg-red-100 text-red-800',
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const getDifficultyBadge = (difficulty: string) => {
    const colors = {
      BEGINNER: 'bg-green-100 text-green-800',
      EASY: 'bg-blue-100 text-blue-800',
      MEDIUM: 'bg-yellow-100 text-yellow-800',
      HARD: 'bg-orange-100 text-orange-800',
      EXPERT: 'bg-red-100 text-red-800',
    };
    return (
      colors[difficulty as keyof typeof colors] || 'bg-gray-100 text-gray-800'
    );
  };

  const getTypeBadge = (type: string) => {
    const colors = {
      DAILY: 'bg-purple-100 text-purple-800',
      WEEKLY: 'bg-indigo-100 text-indigo-800',
      MONTHLY: 'bg-pink-100 text-pink-800',
      SPECIAL: 'bg-cyan-100 text-cyan-800',
    };
    return colors[type as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const handleCreateChallenge = () => {
    setEditingChallenge(null);
    setShowModal(true);
  };

  const handleEditChallenge = (challenge: Challenge) => {
    setEditingChallenge(challenge);
    setShowModal(true);
  };

  const handleDeleteChallenge = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this challenge?')) {
      try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 500));
        setChallenges(challenges.filter(c => c.id !== id));
      } catch (error) {
        console.error('Error deleting challenge:', error);
      }
    }
  };

  const handleSaveChallenge = async (challengeData: Partial<Challenge>) => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      if (editingChallenge) {
        setChallenges(
          challenges.map(c =>
            c.id === editingChallenge.id
              ? {
                  ...editingChallenge,
                  ...challengeData,
                  updatedAt: new Date().toISOString(),
                }
              : c
          )
        );
      } else {
        const newChallenge: Challenge = {
          id: Date.now().toString(),
          title: challengeData.title || '',
          description: challengeData.description || '',
          difficulty: challengeData.difficulty || 'MEDIUM',
          category: challengeData.category || '',
          startDate: challengeData.startDate || new Date().toISOString(),
          endDate: challengeData.endDate || new Date().toISOString(),
          maxParticipants: challengeData.maxParticipants || 100,
          currentParticipants: 0,
          prizePool: challengeData.prizePool || 0,
          status: 'UPCOMING',
          type: challengeData.type || 'WEEKLY',
          rules: challengeData.rules || [],
          requirements: challengeData.requirements || [],
          problems: challengeData.problems || [],
          leaderboard: challengeData.leaderboard || false,
          rated: challengeData.rated || false,
          featured: challengeData.featured || false,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        setChallenges([...challenges, newChallenge]);
      }

      setShowModal(false);
    } catch (error) {
      console.error('Error saving challenge:', error);
    }
  };

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
          <h1 className="text-3xl font-bold text-gray-900">
            Challenge Management
          </h1>
          <p className="text-gray-600 mt-1">
            Create and manage coding challenges and contests
          </p>
        </div>
        <button
          onClick={handleCreateChallenge}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-5 h-5 mr-2" />
          Create Challenge
        </button>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search challenges..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
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
          <div className="mt-4 pt-4 border-t border-gray-200 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            <select
              value={filters.status}
              onChange={e => setFilters({ ...filters, status: e.target.value })}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="UPCOMING">Upcoming</option>
              <option value="ACTIVE">Active</option>
              <option value="COMPLETED">Completed</option>
              <option value="CANCELLED">Cancelled</option>
            </select>

            <select
              value={filters.difficulty}
              onChange={e =>
                setFilters({ ...filters, difficulty: e.target.value })
              }
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
              value={filters.type}
              onChange={e => setFilters({ ...filters, type: e.target.value })}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Types</option>
              <option value="DAILY">Daily</option>
              <option value="WEEKLY">Weekly</option>
              <option value="MONTHLY">Monthly</option>
              <option value="SPECIAL">Special</option>
            </select>

            <select
              value={filters.category}
              onChange={e =>
                setFilters({ ...filters, category: e.target.value })
              }
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Categories</option>
              <option value="Arrays">Arrays</option>
              <option value="Strings">Strings</option>
              <option value="Trees">Trees</option>
              <option value="Graphs">Graphs</option>
              <option value="Dynamic Programming">Dynamic Programming</option>
            </select>

            <select
              value={filters.featured}
              onChange={e =>
                setFilters({ ...filters, featured: e.target.value })
              }
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Featured</option>
              <option value="true">Featured</option>
              <option value="false">Not Featured</option>
            </select>
          </div>
        )}
      </div>

      {/* Challenges Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredChallenges.map(challenge => (
          <div
            key={challenge.id}
            className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
          >
            {/* Challenge Header */}
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-start justify-between mb-2">
                <h3 className="text-lg font-semibold text-gray-900 line-clamp-2">
                  {challenge.title}
                </h3>
                {challenge.featured && (
                  <Star className="w-5 h-5 text-yellow-500 fill-current" />
                )}
              </div>

              <div className="flex flex-wrap gap-2 mb-3">
                <span
                  className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadge(challenge.status)}`}
                >
                  {challenge.status}
                </span>
                <span
                  className={`px-2 py-1 text-xs font-semibold rounded-full ${getDifficultyBadge(challenge.difficulty)}`}
                >
                  {challenge.difficulty}
                </span>
                <span
                  className={`px-2 py-1 text-xs font-semibold rounded-full ${getTypeBadge(challenge.type)}`}
                >
                  {challenge.type}
                </span>
              </div>

              <p className="text-sm text-gray-600 line-clamp-2">
                {challenge.description}
              </p>
            </div>

            {/* Challenge Details */}
            <div className="p-4 space-y-3">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center text-gray-600">
                  <Calendar className="w-4 h-4 mr-2" />
                  <span>
                    {new Date(challenge.startDate).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex items-center text-gray-600">
                  <Clock className="w-4 h-4 mr-2" />
                  <span>
                    {new Date(challenge.endDate).toLocaleDateString()}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center text-gray-600">
                  <Users className="w-4 h-4 mr-2" />
                  <span>
                    {challenge.currentParticipants}/{challenge.maxParticipants}
                  </span>
                </div>
                <div className="flex items-center text-gray-600">
                  <Trophy className="w-4 h-4 mr-2" />
                  <span>${challenge.prizePool}</span>
                </div>
              </div>

              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center text-gray-600">
                  <Target className="w-4 h-4 mr-2" />
                  <span>{challenge.category}</span>
                </div>
                <div className="flex items-center">
                  {challenge.leaderboard && (
                    <TrendingUp
                      className="w-4 h-4 text-green-600 mr-1"
                    />
                  )}
                  {challenge.rated && (
                    <Award
                      className="w-4 h-4 text-purple-600"
                    />
                  )}
                </div>
              </div>

              {/* Progress Bar */}
              <div className="pt-2">
                <div className="flex justify-between text-xs text-gray-600 mb-1">
                  <span>Participants</span>
                  <span>
                    {Math.round(
                      (challenge.currentParticipants /
                        challenge.maxParticipants) *
                        100
                    )}
                    %
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{
                      width: `${(challenge.currentParticipants / challenge.maxParticipants) * 100}%`,
                    }}
                  ></div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="p-4 border-t border-gray-200 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handleEditChallenge(challenge)}
                  className="flex items-center px-3 py-1 text-sm text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded transition-colors"
                >
                  <Edit className="w-4 h-4 mr-1" />
                  Edit
                </button>
                <button
                  onClick={() => handleDeleteChallenge(challenge.id)}
                  className="flex items-center px-3 py-1 text-sm text-red-600 hover:text-red-800 hover:bg-red-50 rounded transition-colors"
                >
                  <Trash2 className="w-4 h-4 mr-1" />
                  Delete
                </button>
              </div>
              <button className="flex items-center px-3 py-1 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-50 rounded transition-colors">
                <Eye className="w-4 h-4 mr-1" />
                View
              </button>
            </div>
          </div>
        ))}
      </div>

      {filteredChallenges.length === 0 && (
        <div className="text-center py-12">
          <Trophy className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No challenges found
          </h3>
          <p className="text-gray-600">
            Try adjusting your search or filter criteria
          </p>
        </div>
      )}

      {/* Challenge Modal */}
      {showModal && (
        <AdminChallengeModal
          challenge={editingChallenge}
          onSave={handleSaveChallenge}
          onClose={() => setShowModal(false)}
        />
      )}
    </div>
  );
};

interface AdminChallengeModalProps {
  challenge: Challenge | null;
  onSave: (challenge: Partial<Challenge>) => void;
  onClose: () => void;
}

const AdminChallengeModal: React.FC<AdminChallengeModalProps> = ({
  challenge,
  onSave,
  onClose,
}) => {
  const [formData, setFormData] = useState<Partial<Challenge>>({
    title: challenge?.title || '',
    description: challenge?.description || '',
    difficulty: challenge?.difficulty || 'MEDIUM',
    category: challenge?.category || '',
    startDate: challenge?.startDate || '',
    endDate: challenge?.endDate || '',
    maxParticipants: challenge?.maxParticipants || 100,
    prizePool: challenge?.prizePool || 0,
    status: challenge?.status || 'UPCOMING',
    type: challenge?.type || 'WEEKLY',
    rules: challenge?.rules || [],
    requirements: challenge?.requirements || [],
    problems: challenge?.problems || [],
    leaderboard: challenge?.leaderboard || false,
    rated: challenge?.rated || false,
    featured: challenge?.featured || false,
  });

  const [newRule, setNewRule] = useState('');
  const [newRequirement, setNewRequirement] = useState('');
  const [newProblem, setNewProblem] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  const addRule = () => {
    if (newRule.trim()) {
      setFormData({
        ...formData,
        rules: [...(formData.rules || []), newRule.trim()],
      });
      setNewRule('');
    }
  };

  const removeRule = (index: number) => {
    setFormData({
      ...formData,
      rules: formData.rules?.filter((_, i) => i !== index) || [],
    });
  };

  const addRequirement = () => {
    if (newRequirement.trim()) {
      setFormData({
        ...formData,
        requirements: [...(formData.requirements || []), newRequirement.trim()],
      });
      setNewRequirement('');
    }
  };

  const removeRequirement = (index: number) => {
    setFormData({
      ...formData,
      requirements: formData.requirements?.filter((_, i) => i !== index) || [],
    });
  };

  const addProblem = () => {
    if (newProblem.trim()) {
      setFormData({
        ...formData,
        problems: [...(formData.problems || []), newProblem.trim()],
      });
      setNewProblem('');
    }
  };

  const removeProblem = (index: number) => {
    setFormData({
      ...formData,
      problems: formData.problems?.filter((_, i) => i !== index) || [],
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">
            {challenge ? 'Edit Challenge' : 'Create New Challenge'}
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Title *
              </label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={e =>
                  setFormData({ ...formData, title: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter challenge title"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category *
              </label>
              <select
                required
                value={formData.category}
                onChange={e =>
                  setFormData({ ...formData, category: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Select category</option>
                <option value="Arrays">Arrays</option>
                <option value="Strings">Strings</option>
                <option value="Trees">Trees</option>
                <option value="Graphs">Graphs</option>
                <option value="Dynamic Programming">Dynamic Programming</option>
                <option value="Basic Programming">Basic Programming</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Difficulty *
              </label>
              <select
                required
                value={formData.difficulty}
                onChange={e =>
                  setFormData({
                    ...formData,
                    difficulty: e.target.value as Challenge['difficulty'],
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="BEGINNER">Beginner</option>
                <option value="EASY">Easy</option>
                <option value="MEDIUM">Medium</option>
                <option value="HARD">Hard</option>
                <option value="EXPERT">Expert</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Type *
              </label>
              <select
                required
                value={formData.type}
                onChange={e =>
                  setFormData({
                    ...formData,
                    type: e.target.value as Challenge['type'],
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="DAILY">Daily</option>
                <option value="WEEKLY">Weekly</option>
                <option value="MONTHLY">Monthly</option>
                <option value="SPECIAL">Special</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Start Date *
              </label>
              <input
                type="datetime-local"
                required
                value={
                  formData.startDate
                    ? new Date(formData.startDate).toISOString().slice(0, 16)
                    : ''
                }
                onChange={e =>
                  setFormData({
                    ...formData,
                    startDate: new Date(e.target.value).toISOString(),
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                End Date *
              </label>
              <input
                type="datetime-local"
                required
                value={
                  formData.endDate
                    ? new Date(formData.endDate).toISOString().slice(0, 16)
                    : ''
                }
                onChange={e =>
                  setFormData({
                    ...formData,
                    endDate: new Date(e.target.value).toISOString(),
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Max Participants *
              </label>
              <input
                type="number"
                required
                min="1"
                value={formData.maxParticipants}
                onChange={e =>
                  setFormData({
                    ...formData,
                    maxParticipants: parseInt(e.target.value),
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Prize Pool ($)
              </label>
              <input
                type="number"
                min="0"
                value={formData.prizePool}
                onChange={e =>
                  setFormData({
                    ...formData,
                    prizePool: parseInt(e.target.value),
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description *
            </label>
            <textarea
              required
              rows={3}
              value={formData.description}
              onChange={e =>
                setFormData({ ...formData, description: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Describe the challenge..."
            />
          </div>

          {/* Rules */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Rules
            </label>
            <div className="space-y-2">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newRule}
                  onChange={e => setNewRule(e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Add a rule..."
                  onKeyDown={e =>
                    e.key === 'Enter' && (e.preventDefault(), addRule())
                  }
                />
                <button
                  type="button"
                  onClick={addRule}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Add
                </button>
              </div>
              {formData.rules?.map((rule, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between bg-gray-50 px-3 py-2 rounded-lg"
                >
                  <span className="text-sm">{rule}</span>
                  <button
                    type="button"
                    onClick={() => removeRule(index)}
                    className="text-red-600 hover:text-red-800"
                  >
                    <XCircle className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Requirements */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Requirements
            </label>
            <div className="space-y-2">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newRequirement}
                  onChange={e => setNewRequirement(e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Add a requirement..."
                  onKeyDown={e =>
                    e.key === 'Enter' && (e.preventDefault(), addRequirement())
                  }
                />
                <button
                  type="button"
                  onClick={addRequirement}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Add
                </button>
              </div>
              {formData.requirements?.map((req, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between bg-gray-50 px-3 py-2 rounded-lg"
                >
                  <span className="text-sm">{req}</span>
                  <button
                    type="button"
                    onClick={() => removeRequirement(index)}
                    className="text-red-600 hover:text-red-800"
                  >
                    <XCircle className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Problems */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Problems
            </label>
            <div className="space-y-2">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newProblem}
                  onChange={e => setNewProblem(e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Add a problem..."
                  onKeyDown={e =>
                    e.key === 'Enter' && (e.preventDefault(), addProblem())
                  }
                />
                <button
                  type="button"
                  onClick={addProblem}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Add
                </button>
              </div>
              {formData.problems?.map((problem, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between bg-gray-50 px-3 py-2 rounded-lg"
                >
                  <span className="text-sm">{problem}</span>
                  <button
                    type="button"
                    onClick={() => removeProblem(index)}
                    className="text-red-600 hover:text-red-800"
                  >
                    <XCircle className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Options */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={formData.leaderboard}
                onChange={e =>
                  setFormData({ ...formData, leaderboard: e.target.checked })
                }
                className="mr-2"
              />
              <span className="text-sm">Leaderboard</span>
            </label>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={formData.rated}
                onChange={e =>
                  setFormData({ ...formData, rated: e.target.checked })
                }
                className="mr-2"
              />
              <span className="text-sm">Rated</span>
            </label>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={formData.featured}
                onChange={e =>
                  setFormData({ ...formData, featured: e.target.checked })
                }
                className="mr-2"
              />
              <span className="text-sm">Featured</span>
            </label>
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              {challenge ? 'Update Challenge' : 'Create Challenge'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminChallengesPage;
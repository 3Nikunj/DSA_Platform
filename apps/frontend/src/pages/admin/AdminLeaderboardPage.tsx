import React, { useState, useEffect } from 'react';
import { Trophy, TrendingUp, Users, Search, Download, RefreshCw, Plus, X } from 'lucide-react';
import { AdminLayout } from '../../components/admin/AdminLayout';

interface LeaderboardEntry {
  id: string;
  userId: string;
  username: string;
  email: string;
  avatar: string;
  rank: number;
  previousRank: number;
  score: number;
  totalProblems: number;
  totalSubmissions: number;
  acceptedSubmissions: number;
  acceptanceRate: number;
  currentStreak: number;
  maxStreak: number;
  totalXP: number;
  level: number;
  coins: number;
  country: string;
  joinedAt: string;
  lastActiveAt: string;
  achievements: number;
  badges: string[];
}

interface LeaderboardConfig {
  id: string;
  name: string;
  description: string;
  type: 'GLOBAL' | 'WEEKLY' | 'MONTHLY' | 'DAILY' | 'CUSTOM';
  metric: 'SCORE' | 'PROBLEMS_SOLVED' | 'ACCEPTANCE_RATE' | 'STREAK' | 'XP' | 'CHALLENGES_WON';
  timeRange: {
    start: string;
    end: string;
  } | null;
  filters: {
    country?: string;
    levelMin?: number;
    levelMax?: number;
    category?: string;
    difficulty?: string;
  };
  isActive: boolean;
  isPublic: boolean;
  prizePool: number;
  maxParticipants: number;
  createdAt: string;
  updatedAt: string;
}

const AdminLeaderboardPage: React.FC = () => {
  const [leaderboards, setLeaderboards] = useState<LeaderboardConfig[]>([]);
  const [selectedLeaderboard, setSelectedLeaderboard] = useState<LeaderboardConfig | null>(null);
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    country: 'all',
    levelMin: '',
    levelMax: '',
    minScore: '',
    sortBy: 'rank' as 'rank' | 'score' | 'problems' | 'acceptanceRate' | 'streak'
  });
  const [showCreateModal, setShowCreateModal] = useState(false);

  const fetchLeaderboards = React.useCallback(async () => {
    try {
      const response = await fetch('/api/admin/leaderboards');
      if (response.ok) {
        const data = await response.json();
        setLeaderboards(data);
        if (data.length > 0 && !selectedLeaderboard) {
          setSelectedLeaderboard(data[0]);
        }
      }
    } catch (error) {
      console.error('Failed to fetch leaderboards:', error);
    }
  }, [selectedLeaderboard]);

  const fetchLeaderboardEntries = React.useCallback(async () => {
    if (!selectedLeaderboard) return;
    
    setLoading(true);
    try {
      const response = await fetch(`/api/admin/leaderboards/${selectedLeaderboard.id}/entries`);
      if (response.ok) {
        const data = await response.json();
        setEntries(data);
      }
    } catch (error) {
      console.error('Failed to fetch leaderboard entries:', error);
    } finally {
      setLoading(false);
    }
  }, [selectedLeaderboard]);

  const handleCreateLeaderboard = () => {
    setShowCreateModal(true);
  };

  const handleRefresh = () => {
    if (selectedLeaderboard) {
      fetchLeaderboardEntries();
    }
  };

  useEffect(() => {
    fetchLeaderboards();
  }, [fetchLeaderboards]);

  useEffect(() => {
    if (selectedLeaderboard) {
      fetchLeaderboardEntries();
    }
  }, [selectedLeaderboard, fetchLeaderboardEntries]);

  const handleExport = () => {
    const csvContent = [
      ['Rank', 'Username', 'Email', 'Score', 'Problems', 'Acceptance Rate', 'Streak', 'Level', 'Country'],
      ...filteredEntries.map(entry => [
        entry.rank,
        entry.username,
        entry.email,
        entry.score,
        entry.totalProblems,
        `${entry.acceptanceRate.toFixed(1)}%`,
        entry.currentStreak,
        entry.level,
        entry.country
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `leaderboard_${selectedLeaderboard?.name}_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const getRankChange = (current: number, previous: number) => {
    if (previous === 0) return null;
    const change = previous - current;
    if (change > 0) return { direction: 'up', value: change };
    if (change < 0) return { direction: 'down', value: Math.abs(change) };
    return { direction: 'same', value: 0 };
  };

  const getRankColor = (rank: number) => {
    if (rank === 1) return 'text-yellow-600 bg-yellow-50';
    if (rank === 2) return 'text-gray-600 bg-gray-50';
    if (rank === 3) return 'text-orange-600 bg-orange-50';
    return 'text-gray-900';
  };

  const filteredEntries = entries.filter(entry => {
    const matchesSearch = entry.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         entry.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCountry = filters.country === 'all' || entry.country === filters.country;
    const matchesLevel = (!filters.levelMin || entry.level >= parseInt(filters.levelMin)) &&
                        (!filters.levelMax || entry.level <= parseInt(filters.levelMax));
    const matchesScore = !filters.minScore || entry.score >= parseInt(filters.minScore);
    
    return matchesSearch && matchesCountry && matchesLevel && matchesScore;
  }).sort((a, b) => {
    switch (filters.sortBy) {
      case 'score':
        return b.score - a.score;
      case 'problems':
        return b.totalProblems - a.totalProblems;
      case 'acceptanceRate':
        return b.acceptanceRate - a.acceptanceRate;
      case 'streak':
        return b.currentStreak - a.currentStreak;
      case 'rank':
      default:
        return a.rank - b.rank;
    }
  });

  const countries = [...new Set(entries.map(e => e.country))].sort();
  const sortOptions = [
    { value: 'rank', label: 'Rank' },
    { value: 'score', label: 'Score' },
    { value: 'problems', label: 'Problems Solved' },
    { value: 'acceptanceRate', label: 'Acceptance Rate' },
    { value: 'streak', label: 'Streak' }
  ];

  return (
    <AdminLayout>
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Leaderboard Management</h1>
          <p className="text-gray-600">Manage platform leaderboards and rankings</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
          <div className="p-6 border-b border-gray-200">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div className="flex items-center gap-4">
                <Trophy className="w-6 h-6 text-yellow-500" />
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">Leaderboards</h2>
                  <p className="text-sm text-gray-600">Active leaderboard configurations</p>
                </div>
              </div>
              
              <div className="flex gap-3">
                <button
                  onClick={handleRefresh}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 flex items-center gap-2"
                >
                  <RefreshCw className="w-4 h-4" />
                  Refresh
                </button>
                <button
                  onClick={handleExport}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 flex items-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  Export
                </button>
                <button
                  onClick={handleCreateLeaderboard}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Create Leaderboard
                </button>
              </div>
            </div>
          </div>

          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
              {leaderboards.map((leaderboard) => (
                <div
                  key={leaderboard.id}
                  onClick={() => setSelectedLeaderboard(leaderboard)}
                  className={`p-4 border rounded-lg cursor-pointer transition-all ${
                    selectedLeaderboard?.id === leaderboard.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-medium text-gray-900">{leaderboard.name}</h3>
                    <div className="flex items-center gap-2">
                      {leaderboard.isActive && (
                        <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
                          Active
                        </span>
                      )}
                      {leaderboard.isPublic && (
                        <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                          Public
                        </span>
                      )}
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 mb-3">{leaderboard.description}</p>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">{leaderboard.type}</span>
                    <span className="font-medium text-gray-900">
                      {leaderboard.prizePool > 0 && `$${leaderboard.prizePool}`}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {selectedLeaderboard && (
              <div>
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    {selectedLeaderboard.name} - Rankings
                  </h3>
                  
                  <div className="flex flex-wrap gap-4 mb-4">
                    <div className="flex-1 min-w-64">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <input
                          type="text"
                          placeholder="Search users..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                    </div>

                    <select
                      value={filters.country}
                      onChange={(e) => setFilters(prev => ({ ...prev, country: e.target.value }))}
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="all">All Countries</option>
                      {countries.map(country => (
                        <option key={country} value={country}>{country}</option>
                      ))}
                    </select>

                    <select
                      value={filters.sortBy}
                      onChange={(e) => setFilters(prev => ({ ...prev, sortBy: e.target.value as typeof filters.sortBy }))}
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      {sortOptions.map(option => (
                        <option key={option.value} value={option.value}>{option.label}</option>
                      ))}
                    </select>

                    <input
                      type="number"
                      placeholder="Min Score"
                      value={filters.minScore}
                      onChange={(e) => setFilters(prev => ({ ...prev, minScore: e.target.value }))}
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent w-32"
                    />

                    <input
                      type="number"
                      placeholder="Min Level"
                      value={filters.levelMin}
                      onChange={(e) => setFilters(prev => ({ ...prev, levelMin: e.target.value }))}
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent w-32"
                    />
                  </div>
                </div>

                <div className="overflow-x-auto">
                  {loading ? (
                    <div className="p-8 text-center text-gray-500">
                      <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
                      Loading leaderboard...
                    </div>
                  ) : (
                    <table className="w-full">
                      <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Rank
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            User
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Score
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Problems
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Acceptance Rate
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Streak
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Level
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Country
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Last Active
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {filteredEntries.map((entry) => {
                          const rankChange = getRankChange(entry.rank, entry.previousRank);
                          return (
                            <tr key={entry.id} className="hover:bg-gray-50">
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center">
                                  <div className={`text-lg font-bold px-3 py-1 rounded-full ${getRankColor(entry.rank)}`}>
                                    #{entry.rank}
                                  </div>
                                  {rankChange && (
                                    <div className={`ml-2 text-sm ${
                                      rankChange.direction === 'up' ? 'text-green-600' :
                                      rankChange.direction === 'down' ? 'text-red-600' : 'text-gray-500'
                                    }`}>
                                      {rankChange.direction === 'up' && '↑'}
                                      {rankChange.direction === 'down' && '↓'}
                                      {rankChange.direction !== 'same' && rankChange.value}
                                    </div>
                                  )}
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center">
                                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-medium">
                                    {entry.username.charAt(0).toUpperCase()}
                                  </div>
                                  <div className="ml-3">
                                    <div className="text-sm font-medium text-gray-900">{entry.username}</div>
                                    <div className="text-sm text-gray-500">{entry.email}</div>
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm font-medium text-gray-900">
                                  {entry.score.toLocaleString()}
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-gray-900">
                                  <div>{entry.totalProblems} solved</div>
                                  <div className="text-gray-500">{entry.acceptedSubmissions} accepted</div>
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-gray-900">
                                  {entry.acceptanceRate.toFixed(1)}%
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-gray-900">
                                  <div className="flex items-center gap-1">
                                    <TrendingUp className="w-4 h-4 text-orange-500" />
                                    {entry.currentStreak} days
                                  </div>
                                  <div className="text-gray-500 text-xs">Max: {entry.maxStreak}</div>
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-gray-900">
                                  <div className="flex items-center gap-1">
                                    <span className="text-blue-600">Lv.</span>
                                    {entry.level}
                                  </div>
                                  <div className="text-gray-500 text-xs">{entry.totalXP.toLocaleString()} XP</div>
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-gray-900">{entry.country}</div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-gray-500">
                                  {new Date(entry.lastActiveAt).toLocaleDateString()}
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  )}

                  {!loading && filteredEntries.length === 0 && (
                    <div className="p-8 text-center text-gray-500">
                      <Users className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                      <p>No users found matching your criteria.</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {showCreateModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-900">Create New Leaderboard</h2>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="text-gray-400 hover:text-gray-600 p-1 rounded hover:bg-gray-100"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="p-6">
                <p className="text-gray-600 mb-4">
                  Leaderboard creation form would be implemented here with fields for name, description, type, metrics, filters, and prizes.
                </p>
                <div className="flex justify-end space-x-3">
                  <button
                    onClick={() => setShowCreateModal(false)}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-lg hover:bg-blue-700"
                  >
                    Create Leaderboard
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminLeaderboardPage;
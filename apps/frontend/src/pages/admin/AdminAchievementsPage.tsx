import React, { useState, useEffect } from 'react';
import {
  Plus,
  Edit,
  Trash2,
  Search,
  Award,
  Trophy,
  Star,
  Target,
  Zap,
  Shield,
  Crown,
  Medal,
} from 'lucide-react';
import { AdminLayout } from '../../components/admin/AdminLayout';
import AdminAchievementModal from '../../components/admin/AdminAchievementModal';

interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  category:
    | 'PROBLEM_SOLVING'
    | 'STREAK'
    | 'CHALLENGE'
    | 'LEARNING'
    | 'SOCIAL'
    | 'SPECIAL';
  rarity: 'COMMON' | 'UNCOMMON' | 'RARE' | 'EPIC' | 'LEGENDARY';
  points: number;
  coins: number;
  xp: number;
  requirements: {
    type:
      | 'SOLVE_PROBLEMS'
      | 'MAINTAIN_STREAK'
      | 'COMPLETE_CHALLENGE'
      | 'REACH_LEVEL'
      | 'EARN_XP'
      | 'COLLECT_COINS'
      | 'SOCIAL_SHARE'
      | 'REFERRAL';
    target: number;
    timeLimit?: number;
    category?: string;
    difficulty?: string;
  };
  isActive: boolean;
  isHidden: boolean;
  order: number;
  createdAt: string;
  updatedAt: string;
}

const AdminAchievementsPage: React.FC = () => {
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    category: 'all',
    rarity: 'all',
    status: 'all',
    sortBy: 'createdAt',
    sortOrder: 'desc' as 'desc' | 'asc',
  });
  const [showModal, setShowModal] = useState(false);
  const [selectedAchievement, setSelectedAchievement] =
    useState<Achievement | null>(null);

  useEffect(() => {
    fetchAchievements();
  }, []);

  const fetchAchievements = async () => {
    try {
      const response = await fetch('/api/admin/achievements');
      if (response.ok) {
        const data = await response.json();
        setAchievements(data);
      }
    } catch (error) {
      console.error('Failed to fetch achievements:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setSelectedAchievement(null);
    setShowModal(true);
  };

  const handleEdit = (achievement: Achievement) => {
    setSelectedAchievement(achievement);
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this achievement?')) {
      try {
        const response = await fetch(`/api/admin/achievements/${id}`, {
          method: 'DELETE',
        });
        if (response.ok) {
          setAchievements(prev => prev.filter(a => a.id !== id));
        }
      } catch (error) {
        console.error('Failed to delete achievement:', error);
      }
    }
  };

  const handleToggleStatus = async (id: string, currentStatus: boolean) => {
    try {
      const response = await fetch(`/api/admin/achievements/${id}/toggle`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !currentStatus }),
      });
      if (response.ok) {
        setAchievements(prev =>
          prev.map(a => (a.id === id ? { ...a, isActive: !currentStatus } : a))
        );
      }
    } catch (error) {
      console.error('Failed to toggle achievement status:', error);
    }
  };

  const getIconComponent = (iconName: string) => {
    const icons: { [key: string]: React.ComponentType<{ className?: string }> } = {
      Award,
      Trophy,
      Star,
      Target,
      Zap,
      Shield,
      Crown,
      Medal,
    };
    const IconComponent = icons[iconName] || Award;
    return <IconComponent className="w-6 h-6" />;
  };

  const getRarityColor = (rarity: string) => {
    const colors = {
      COMMON: 'bg-gray-100 text-gray-800',
      UNCOMMON: 'bg-green-100 text-green-800',
      RARE: 'bg-blue-100 text-blue-800',
      EPIC: 'bg-purple-100 text-purple-800',
      LEGENDARY: 'bg-yellow-100 text-yellow-800',
    };
    return colors[rarity as keyof typeof colors] || colors.COMMON;
  };

  const getCategoryColor = (category: string) => {
    const colors = {
      PROBLEM_SOLVING: 'bg-blue-100 text-blue-800',
      STREAK: 'bg-orange-100 text-orange-800',
      CHALLENGE: 'bg-red-100 text-red-800',
      LEARNING: 'bg-green-100 text-green-800',
      SOCIAL: 'bg-purple-100 text-purple-800',
      SPECIAL: 'bg-yellow-100 text-yellow-800',
    };
    return colors[category as keyof typeof colors] || colors.PROBLEM_SOLVING;
  };

  const filteredAchievements = achievements
    .filter(achievement => {
      const matchesSearch =
        achievement.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        achievement.description
          .toLowerCase()
          .includes(searchTerm.toLowerCase());
      const matchesCategory =
        filters.category === 'all' || achievement.category === filters.category;
      const matchesRarity =
        filters.rarity === 'all' || achievement.rarity === filters.rarity;
      const matchesStatus =
        filters.status === 'all' ||
        (filters.status === 'active' && achievement.isActive) ||
        (filters.status === 'inactive' && !achievement.isActive);

      return matchesSearch && matchesCategory && matchesRarity && matchesStatus;
    })
    .sort((a, b) => {
      const multiplier = filters.sortOrder === 'desc' ? -1 : 1;
      switch (filters.sortBy) {
        case 'name':
          return a.name.localeCompare(b.name) * multiplier;
        case 'points':
          return (a.points - b.points) * multiplier;
        case 'rarity': {
          const rarityOrder = {
            COMMON: 1,
            UNCOMMON: 2,
            RARE: 3,
            EPIC: 4,
            LEGENDARY: 5,
          };
          return (rarityOrder[a.rarity] - rarityOrder[b.rarity]) * multiplier;
        }
        case 'createdAt':
        default:
          return (
            (new Date(a.createdAt).getTime() -
              new Date(b.createdAt).getTime()) *
            multiplier
          );
      }
    });

  const categories = [
    { value: 'all', label: 'All Categories' },
    { value: 'PROBLEM_SOLVING', label: 'Problem Solving' },
    { value: 'STREAK', label: 'Streak' },
    { value: 'CHALLENGE', label: 'Challenge' },
    { value: 'LEARNING', label: 'Learning' },
    { value: 'SOCIAL', label: 'Social' },
    { value: 'SPECIAL', label: 'Special' },
  ];

  const rarities = [
    { value: 'all', label: 'All Rarities' },
    { value: 'COMMON', label: 'Common' },
    { value: 'UNCOMMON', label: 'Uncommon' },
    { value: 'RARE', label: 'Rare' },
    { value: 'EPIC', label: 'Epic' },
    { value: 'LEGENDARY', label: 'Legendary' },
  ];

  const statuses = [
    { value: 'all', label: 'All Statuses' },
    { value: 'active', label: 'Active' },
    { value: 'inactive', label: 'Inactive' },
  ];

  const sortOptions = [
    { value: 'createdAt', label: 'Created Date' },
    { value: 'name', label: 'Name' },
    { value: 'points', label: 'Points' },
    { value: 'rarity', label: 'Rarity' },
  ];

  return (
    <AdminLayout>
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Achievements & Badges
          </h1>
          <p className="text-gray-600">
            Manage platform achievements and user badges
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div className="flex-1 max-w-md">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Search achievements..."
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div className="flex flex-wrap gap-3">
                <select
                  value={filters.category}
                  onChange={e =>
                    setFilters(prev => ({ ...prev, category: e.target.value }))
                  }
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {categories.map(cat => (
                    <option key={cat.value} value={cat.value}>
                      {cat.label}
                    </option>
                  ))}
                </select>

                <select
                  value={filters.rarity}
                  onChange={e =>
                    setFilters(prev => ({ ...prev, rarity: e.target.value }))
                  }
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {rarities.map(rarity => (
                    <option key={rarity.value} value={rarity.value}>
                      {rarity.label}
                    </option>
                  ))}
                </select>

                <select
                  value={filters.status}
                  onChange={e =>
                    setFilters(prev => ({ ...prev, status: e.target.value }))
                  }
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {statuses.map(status => (
                    <option key={status.value} value={status.value}>
                      {status.label}
                    </option>
                  ))}
                </select>

                <select
                  value={filters.sortBy}
                  onChange={e =>
                    setFilters(prev => ({ ...prev, sortBy: e.target.value }))
                  }
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {sortOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>

                <button
                  onClick={() =>
                    setFilters(prev => ({
                      ...prev,
                      sortOrder: prev.sortOrder === 'desc' ? 'asc' : 'desc',
                    }))
                  }
                  className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {filters.sortOrder === 'desc' ? '↓' : '↑'}
                </button>

                <button
                  onClick={handleCreate}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Create Achievement
                </button>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            {loading ? (
              <div className="p-8 text-center text-gray-500">
                <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
                Loading achievements...
              </div>
            ) : (
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Achievement
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Category
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Rarity
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Rewards
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Requirements
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredAchievements.map(achievement => (
                    <tr key={achievement.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600">
                            {getIconComponent(achievement.icon)}
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {achievement.name}
                            </div>
                            <div className="text-sm text-gray-500 max-w-xs truncate">
                              {achievement.description}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 py-1 text-xs font-medium rounded-full ${getCategoryColor(achievement.category)}`}
                        >
                          {achievement.category.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 py-1 text-xs font-medium rounded-full ${getRarityColor(achievement.rarity)}`}
                        >
                          {achievement.rarity}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          <div className="flex items-center gap-1">
                            <Star className="w-3 h-3 text-yellow-500" />
                            {achievement.points} pts
                          </div>
                          <div className="flex items-center gap-1">
                            <span className="text-yellow-600">🪙</span>
                            {achievement.coins}
                          </div>
                          <div className="flex items-center gap-1">
                            <span className="text-blue-600">⚡</span>
                            {achievement.xp} XP
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          <div className="font-medium">
                            {achievement.requirements.type.replace('_', ' ')}
                          </div>
                          <div className="text-gray-500">
                            Target: {achievement.requirements.target}
                          </div>
                          {achievement.requirements.timeLimit && (
                            <div className="text-gray-500">
                              Time limit: {achievement.requirements.timeLimit}h
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() =>
                              handleToggleStatus(
                                achievement.id,
                                achievement.isActive
                              )
                            }
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                              achievement.isActive
                                ? 'bg-blue-600'
                                : 'bg-gray-200'
                            }`}
                          >
                            <span
                              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                achievement.isActive
                                  ? 'translate-x-6'
                                  : 'translate-x-1'
                              }`}
                            />
                          </button>
                          {achievement.isHidden && (
                            <span className="px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-800">
                              Hidden
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => handleEdit(achievement)}
                            className="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-50"
                            title="Edit"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(achievement.id)}
                            className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-50"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {!loading && filteredAchievements.length === 0 && (
              <div className="p-8 text-center text-gray-500">
                <Award className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p>No achievements found matching your criteria.</p>
              </div>
            )}
          </div>
        </div>

        {showModal && (
          <AdminAchievementModal
            achievement={selectedAchievement}
            onClose={() => setShowModal(false)}
            onSave={(achievement: Achievement) => {
              if (selectedAchievement) {
                setAchievements(prev =>
                  prev.map(a => (a.id === achievement.id ? achievement : a))
                );
              } else {
                setAchievements(prev => [...prev, achievement]);
              }
              setShowModal(false);
            }}
          />
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminAchievementsPage;
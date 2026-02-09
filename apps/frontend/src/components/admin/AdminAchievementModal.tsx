import React, { useState, useEffect } from 'react';
import { X, Award, Trophy, Star, Target, Zap, Shield, Crown, Medal, Save } from 'lucide-react';

interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: 'PROBLEM_SOLVING' | 'STREAK' | 'CHALLENGE' | 'LEARNING' | 'SOCIAL' | 'SPECIAL';
  rarity: 'COMMON' | 'UNCOMMON' | 'RARE' | 'EPIC' | 'LEGENDARY';
  points: number;
  coins: number;
  xp: number;
  requirements: {
    type: 'SOLVE_PROBLEMS' | 'MAINTAIN_STREAK' | 'COMPLETE_CHALLENGE' | 'REACH_LEVEL' | 'EARN_XP' | 'COLLECT_COINS' | 'SOCIAL_SHARE' | 'REFERRAL';
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

interface AdminAchievementModalProps {
  achievement: Achievement | null;
  onClose: () => void;
  onSave: (achievement: Achievement) => void;
}

const AdminAchievementModal: React.FC<AdminAchievementModalProps> = ({ achievement, onClose, onSave }) => {
  const [formData, setFormData] = useState<Omit<Achievement, 'id' | 'createdAt' | 'updatedAt'>>({
    name: '',
    description: '',
    icon: 'Award',
    category: 'PROBLEM_SOLVING',
    rarity: 'COMMON',
    points: 10,
    coins: 0,
    xp: 0,
    requirements: {
      type: 'SOLVE_PROBLEMS',
      target: 1
    },
    isActive: true,
    isHidden: false,
    order: 0
  });

  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (achievement) {
      setFormData({
        name: achievement.name,
        description: achievement.description,
        icon: achievement.icon,
        category: achievement.category,
        rarity: achievement.rarity,
        points: achievement.points,
        coins: achievement.coins,
        xp: achievement.xp,
        requirements: achievement.requirements,
        isActive: achievement.isActive,
        isHidden: achievement.isHidden,
        order: achievement.order
      });
    }
  }, [achievement]);

  const icons = [
    { value: 'Award', label: 'Award', component: Award },
    { value: 'Trophy', label: 'Trophy', component: Trophy },
    { value: 'Star', label: 'Star', component: Star },
    { value: 'Target', label: 'Target', component: Target },
    { value: 'Zap', label: 'Zap', component: Zap },
    { value: 'Shield', label: 'Shield', component: Shield },
    { value: 'Crown', label: 'Crown', component: Crown },
    { value: 'Medal', label: 'Medal', component: Medal }
  ];

  const categories = [
    { value: 'PROBLEM_SOLVING', label: 'Problem Solving' },
    { value: 'STREAK', label: 'Streak' },
    { value: 'CHALLENGE', label: 'Challenge' },
    { value: 'LEARNING', label: 'Learning' },
    { value: 'SOCIAL', label: 'Social' },
    { value: 'SPECIAL', label: 'Special' }
  ];

  const rarities = [
    { value: 'COMMON', label: 'Common' },
    { value: 'UNCOMMON', label: 'Uncommon' },
    { value: 'RARE', label: 'Rare' },
    { value: 'EPIC', label: 'Epic' },
    { value: 'LEGENDARY', label: 'Legendary' }
  ];

  const requirementTypes = [
    { value: 'SOLVE_PROBLEMS', label: 'Solve Problems' },
    { value: 'MAINTAIN_STREAK', label: 'Maintain Streak' },
    { value: 'COMPLETE_CHALLENGE', label: 'Complete Challenge' },
    { value: 'REACH_LEVEL', label: 'Reach Level' },
    { value: 'EARN_XP', label: 'Earn XP' },
    { value: 'COLLECT_COINS', label: 'Collect Coins' },
    { value: 'SOCIAL_SHARE', label: 'Social Share' },
    { value: 'REFERRAL', label: 'Referral' }
  ];

  

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      const achievementData: Achievement = {
        ...formData,
        id: achievement?.id || `achievement_${Date.now()}`,
        createdAt: achievement?.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      onSave(achievementData);
    } catch (error) {
      console.error('Failed to save achievement:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const updateRequirement = <K extends keyof Achievement['requirements']>(
    field: K,
    value: Achievement['requirements'][K]
  ) => {
    setFormData(prev => ({
      ...prev,
      requirements: {
        ...prev.requirements,
        [field]: value
      }
    }));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            {achievement ? 'Edit Achievement' : 'Create Achievement'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 p-1 rounded hover:bg-gray-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Name *
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter achievement name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Icon *
              </label>
              <select
                value={formData.icon}
                onChange={(e) => setFormData(prev => ({ ...prev, icon: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {icons.map(icon => (
                  <option key={icon.value} value={icon.value}>
                    {icon.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category *
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value as typeof prev.category }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {categories.map(category => (
                  <option key={category.value} value={category.value}>
                    {category.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Rarity *
              </label>
              <select
                value={formData.rarity}
                onChange={(e) => setFormData(prev => ({ ...prev, rarity: e.target.value as typeof prev.rarity }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {rarities.map(rarity => (
                  <option key={rarity.value} value={rarity.value}>
                    {rarity.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description *
            </label>
            <textarea
              required
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Describe the achievement and how to earn it"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Points
              </label>
              <input
                type="number"
                min="0"
                value={formData.points}
                onChange={(e) => setFormData(prev => ({ ...prev, points: parseInt(e.target.value) || 0 }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Coins
              </label>
              <input
                type="number"
                min="0"
                value={formData.coins}
                onChange={(e) => setFormData(prev => ({ ...prev, coins: parseInt(e.target.value) || 0 }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                XP
              </label>
              <input
                type="number"
                min="0"
                value={formData.xp}
                onChange={(e) => setFormData(prev => ({ ...prev, xp: parseInt(e.target.value) || 0 }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          <div className="border-t border-gray-200 pt-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Requirements</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Requirement Type *
                </label>
                <select
                  value={formData.requirements.type}
                  onChange={(e) => updateRequirement('type', e.target.value as typeof formData.requirements.type)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {requirementTypes.map(type => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Target *
                </label>
                <input
                  type="number"
                  min="1"
                  required
                  value={formData.requirements.target}
                  onChange={(e) => updateRequirement('target', parseInt(e.target.value) || 1)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Target value"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Time Limit (hours)
                </label>
                <input
                  type="number"
                  min="0"
                  value={formData.requirements.timeLimit || ''}
                  onChange={(e) => updateRequirement('timeLimit', e.target.value ? parseInt(e.target.value) : undefined)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Optional time limit"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Order
                </label>
                <input
                  type="number"
                  min="0"
                  value={formData.order}
                  onChange={(e) => setFormData(prev => ({ ...prev, order: parseInt(e.target.value) || 0 }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="isActive"
                checked={formData.isActive}
                onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <label htmlFor="isActive" className="ml-2 text-sm font-medium text-gray-700">
                Active
              </label>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="isHidden"
                checked={formData.isHidden}
                onChange={(e) => setFormData(prev => ({ ...prev, isHidden: e.target.checked }))}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <label htmlFor="isHidden" className="ml-2 text-sm font-medium text-gray-700">
                Hidden Achievement
              </label>
            </div>
          </div>

          <div className="flex items-center justify-end space-x-3 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 flex items-center gap-2"
            >
              <Save className={`w-4 h-4 ${isSaving ? 'animate-spin' : ''}`} />
              {isSaving ? 'Saving...' : 'Save Achievement'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminAchievementModal;
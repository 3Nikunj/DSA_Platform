import { api } from './api';

export interface ProgressOverview {
  totalAlgorithms: number;
  completedAlgorithms: number;
  completionRate: number;
  totalTimeSpent: number; // in minutes
  currentStreak: number;
  longestStreak: number;
  currentLevel: number;
  experience: number;
  experienceToNextLevel: number;
  totalSolved: number;
  averageScore: number;
  lastActivity: string;
}

export interface CategoryProgress {
  category: {
    id: string;
    name: string;
    description: string;
  };
  statistics: {
    total: number;
    completed: number;
    completionRate: number;
    averageScore: number;
    timeSpent: number;
  };
  algorithms: Array<{
    id: string;
    name: string;
    completed: boolean;
    score?: number;
    timeSpent: number;
    lastAttempt?: string;
  }>;
}

export interface ProgressInsights {
  weeklyProgress: {
    algorithmsCompleted: number;
    timeSpent: number;
    streakDays: number;
    averageScore: number;
  };
  monthlyProgress: {
    algorithmsCompleted: number;
    timeSpent: number;
    streakDays: number;
    averageScore: number;
  };
  strengths: string[];
  areasForImprovement: string[];
  recommendations: string[];
  performanceTrends: {
    period: string;
    completionRate: number;
    averageTime: number;
    scoreImprovement: number;
  }[];
}

export interface TimeTrackingData {
  date: string;
  timeSpent: number; // in minutes
  algorithmsWorkedOn: number;
  sessionsCount: number;
  averageSessionLength: number;
}

export const progressService = {
  // Get overall progress statistics
  async getProgressStats(): Promise<ProgressOverview> {
    const response = await api.get('/progress/overview');
    return response.data;
  },

  // Get progress for all categories
  async getAllCategoriesProgress(): Promise<CategoryProgress[]> {
    const response = await api.get('/progress/categories');
    return response.data;
  },

  // Get progress for a specific category
  async getCategoryProgress(categoryId: string): Promise<CategoryProgress> {
    const response = await api.get(`/progress/category/${categoryId}`);
    return response.data;
  },

  // Get progress insights and analytics
  async getProgressInsights(): Promise<ProgressInsights> {
    const response = await api.get('/progress/insights');
    return response.data;
  },

  // Get time tracking data
  async getTimeTracking(period: 'daily' | 'weekly' | 'monthly' = 'weekly'): Promise<TimeTrackingData[]> {
    const response = await api.get(`/progress/time-tracking?period=${period}`);
    return response.data;
  },

  // Get streak information
  async getStreakData(): Promise<{ currentStreak: number; longestStreak: number; lastActivity: string }> {
    const response = await api.get('/progress/streak');
    return response.data;
  },

  // Get XP history
  async getXPHistory(period: 'daily' | 'weekly' | 'monthly' = 'weekly'): Promise<{ date: string; xp: number }[]> {
    const response = await api.get(`/progress/xp-history?period=${period}`);
    return response.data;
  },

  // Get level progress
  async getLevelProgress(): Promise<{ currentLevel: number; currentXP: number; xpToNextLevel: number; totalXP: number }> {
    const response = await api.get('/progress/level');
    return response.data;
  },

  // Update algorithm progress
  async updateAlgorithmProgress(algorithmId: string, data: {
    completed?: boolean;
    timeSpent?: number;
    attempts?: number;
    score?: number;
  }): Promise<void> {
    await api.put(`/progress/algorithms/${algorithmId}`, data);
  },

  // Start time tracking session
  async startTimeTracking(algorithmId: string): Promise<{ sessionId: string }> {
    const response = await api.post('/progress/time-tracking/start', { algorithmId });
    return response.data;
  },

  // End time tracking session
  async endTimeTracking(sessionId: string): Promise<void> {
    await api.post('/progress/time-tracking/end', { sessionId });
  },
};
import { Request, Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth';

/**
 * Get overall user progress
 */
export const getProgressOverview = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: 'User not authenticated',
      });
      return;
    }

    // Mock data for now
    const mockData = {
      totalAlgorithms: 150,
      completedAlgorithms: 25,
      completionRate: 16.7,
      totalTimeSpent: 1200, // in minutes
      currentStreak: 5,
      longestStreak: 12,
      currentLevel: 3,
      experience: 750,
      experienceToNextLevel: 250,
      totalSolved: 25,
      averageScore: 85.5,
      lastActivity: new Date().toISOString(),
    };

    res.json({
      success: true,
      data: mockData,
    });
  } catch (error) {
    console.error('Error getting progress overview:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
};

/**
 * Get level progress
 */
export const getLevelProgress = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: 'User not authenticated',
      });
      return;
    }

    // Mock data for now - in a real implementation, this would fetch from database
    const mockData = {
      currentLevel: 3,
      currentXP: 750,
      xpToNextLevel: 150,
      totalXP: 750,
    };

    res.json({
      success: true,
      data: mockData,
    });
  } catch (error) {
    console.error('Error getting level progress:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
};

/**
 * Get progress for a specific algorithm
 */
export const getAlgorithmProgress = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: 'User not authenticated',
      });
      return;
    }

    const { algorithmId } = req.params;
    
    // Mock data for now
    const mockData = {
      id: algorithmId,
      status: 'IN_PROGRESS',
      timeSpent: 45,
      attempts: 3,
      score: 75,
      lastAttempt: new Date().toISOString(),
      algorithm: {
        id: algorithmId,
        title: 'Binary Search',
        difficulty: 'MEDIUM',
        category: {
          id: 'cat-1',
          name: 'Searching',
        },
      },
    };

    res.json({
      success: true,
      data: mockData,
    });
  } catch (error) {
    console.error('Error getting algorithm progress:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
};

/**
 * Get progress by category
 */
export const getCategoryProgress = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: 'User not authenticated',
      });
      return;
    }

    const { categoryId } = req.params;
    
    // Mock data for now
    const mockData = {
      category: {
        id: categoryId,
        name: 'Arrays',
        description: 'Array manipulation and algorithms',
      },
      statistics: {
        total: 25,
        completed: 8,
        inProgress: 3,
        completionRate: 32.0,
      },
      progress: [
        {
          id: 'prog-1',
          status: 'COMPLETED',
          timeSpent: 30,
          score: 90,
          algorithm: {
            id: 'alg-1',
            title: 'Two Sum',
            difficulty: 'EASY',
          },
        },
      ],
    };

    res.json({
      success: true,
      data: mockData,
    });
  } catch (error) {
    console.error('Error getting category progress:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
};

/**
 * Get all categories progress
 */
export const getAllCategoriesProgress = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: 'User not authenticated',
      });
      return;
    }

    // Mock data for now
    const mockData = [
      {
        category: {
          id: 'cat-1',
          name: 'Arrays',
          description: 'Array manipulation and algorithms',
        },
        statistics: {
          total: 25,
          completed: 8,
          completionRate: 32.0,
          averageScore: 85.5,
          timeSpent: 240,
        },
        algorithms: [
          {
            id: 'alg-1',
            name: 'Two Sum',
            completed: true,
            score: 90,
            timeSpent: 30,
            lastAttempt: new Date().toISOString(),
          },
        ],
      },
      {
        category: {
          id: 'cat-2',
          name: 'Strings',
          description: 'String manipulation algorithms',
        },
        statistics: {
          total: 20,
          completed: 5,
          completionRate: 25.0,
          averageScore: 78.0,
          timeSpent: 180,
        },
        algorithms: [
          {
            id: 'alg-2',
            name: 'Valid Palindrome',
            completed: true,
            score: 85,
            timeSpent: 25,
            lastAttempt: new Date().toISOString(),
          },
        ],
      },
    ];

    res.json({
      success: true,
      data: mockData,
    });
  } catch (error) {
    console.error('Error getting all categories progress:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
};

/**
 * Get progress insights and analytics
 */
export const getProgressInsights = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: 'User not authenticated',
      });
      return;
    }

    // Mock data for now
    const mockData = {
      weeklyProgress: {
        algorithmsCompleted: 5,
        timeSpent: 180,
        streakDays: 4,
        averageScore: 82.5,
      },
      monthlyProgress: {
        algorithmsCompleted: 18,
        timeSpent: 720,
        streakDays: 12,
        averageScore: 85.0,
      },
      strengths: ['Arrays', 'Sorting'],
      areasForImprovement: ['Dynamic Programming', 'Graph Algorithms'],
      recommendations: [
        'Practice more dynamic programming problems',
        'Focus on graph traversal algorithms',
        'Review time complexity analysis',
      ],
      performanceTrends: [
        {
          period: 'Week 1',
          completionRate: 75.0,
          averageTime: 35.5,
          scoreImprovement: 5.2,
        },
        {
          period: 'Week 2',
          completionRate: 80.0,
          averageTime: 32.0,
          scoreImprovement: 8.1,
        },
      ],
    };

    res.json({
      success: true,
      data: mockData,
    });
  } catch (error) {
    console.error('Error getting progress insights:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
};
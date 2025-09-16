import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { logger, loggers } from '../utils/logger';
import { AppError, ValidationError, NotFoundError } from '../middleware/errorHandler';
import { RedisService, redisClient } from '../config/redis';
import { AuthenticatedRequest } from '../middleware/auth';
const prisma = new PrismaClient();
const redis = new RedisService(redisClient);

/**
 * Get overall user progress
 */
export const getOverallProgress = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const cacheKey = `progress:overall:${userId}`;

    // Try to get from cache first
    const cachedProgress = await redis.get(cacheKey);
    if (cachedProgress) {
      return res.json({
        success: true,
        data: JSON.parse(cachedProgress),
      });
    }

    // Get comprehensive progress data
    const [user, progressStats, difficultyProgress, recentActivity] = await Promise.all([
      prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          username: true,
          level: true,
          xp: true,
          streak: true,
          createdAt: true,
        },
      }),
      prisma.progress.groupBy({
        by: ['status'],
        where: { userId },
        _count: true,
      }),
      prisma.progress.findMany({
        where: {
          userId,
          status: 'COMPLETED',
        },
        include: {
          algorithm: {
            select: {
              difficulty: true,
            },
          },
        },
      }),
      prisma.progress.findMany({
        where: { userId },
        include: {
          algorithm: {
            select: {
                id: true,
                name: true,
                difficulty: true,
                category: {
                  select: {
                    name: true,
                  },
                },
              },
          },
        },
        orderBy: {
          updatedAt: 'desc',
        },
        take: 10,
      }),
    ]);

    if (!user) {
      throw new NotFoundError('User not found');
    }

    // Calculate progress statistics
    const totalProgress = progressStats.reduce((sum, curr) => sum + curr._count, 0);
    const completedCount = progressStats.find(p => p.status === 'COMPLETED')?._count || 0;
    const inProgressCount = progressStats.find(p => p.status === 'IN_PROGRESS')?._count || 0;
    const notStartedCount = progressStats.find(p => p.status === 'NOT_STARTED')?._count || 0;

    // Calculate difficulty breakdown
    const difficultyBreakdown = difficultyProgress.reduce((acc, curr) => {
      const difficulty = curr.algorithm.difficulty;
      acc[difficulty] = (acc[difficulty] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Calculate completion rate
    const completionRate = totalProgress > 0 ? (completedCount / totalProgress) * 100 : 0;

    // Calculate experience to next level
    const currentLevel = user.level;
    const experienceForNextLevel = calculateExperienceForLevel(currentLevel + 1);
    const experienceToNextLevel = experienceForNextLevel - user.xp;

    const progressData = {
      user: {
        id: user.id,
        username: user.username,
        level: user.level,
        xp: user.xp,
        experienceToNextLevel,
        streak: user.streak,
        memberSince: user.createdAt,
      },
      statistics: {
        total: totalProgress,
        completed: completedCount,
        inProgress: inProgressCount,
        notStarted: notStartedCount,
        completionRate: Math.round(completionRate * 100) / 100,
      },
      difficultyBreakdown,
      recentActivity,
    };

    // Cache for 5 minutes
    await redis.set(cacheKey, JSON.stringify(progressData), 300);

    return res.json({
      success: true,
      data: progressData,
    });
  } catch (error) {
    logger.error('Error getting overall progress:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

/**
 * Get progress for a specific algorithm
 */
export const getAlgorithmProgress = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { algorithmId } = req.params;
    const userId = req.user!.id;

    const progress = await prisma.progress.findUnique({
      where: {
        userId_algorithmId: {
          userId,
          algorithmId,
        },
      },
      include: {
        algorithm: {
          select: {
              id: true,
              name: true,
              difficulty: true,
              category: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
        },
      },
    });

    if (!progress) {
      // Create initial progress record if it doesn't exist
      const algorithm = await prisma.algorithm.findUnique({
        where: { id: algorithmId },
        select: {
                id: true,
                name: true,
                difficulty: true,
                category: {
                  select: {
                    id: true,
                    name: true,
                  },
                },
              },
      });

      if (!algorithm) {
        throw new NotFoundError('Algorithm not found');
      }

      const newProgress = await prisma.progress.create({
        data: {
          userId,
          algorithmId,
          status: 'NOT_STARTED',
        },
        include: {
          algorithm: {
            select: {
              id: true,
              name: true,
              difficulty: true,
              category: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          },
        },
      });

      return res.json({
        success: true,
        data: newProgress,
      });
    }

    // Get submission history for this algorithm
    const submissions = await prisma.submission.findMany({
      where: {
        userId,
        algorithmId,
      },
      select: {
          id: true,
          language: true,
          status: true,
          executionTime: true,
          memoryUsage: true,
          createdAt: true,
        },
      orderBy: {
        createdAt: 'desc',
      },
      take: 10,
    });

    return res.json({
      success: true,
      data: {
        ...progress,
        submissions,
      },
    });
  } catch (error) {
    logger.error('Error getting algorithm progress:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

/**
 * Get progress by category
 */
export const getCategoryProgress = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const { categoryId } = req.params;

    const categoryProgress = await prisma.progress.findMany({
      where: {
        userId,
        algorithm: {
          categoryId,
        },
      },
      include: {
        algorithm: {
          select: {
            id: true,
            name: true,
            difficulty: true,
          },
        },
      },
      orderBy: {
        updatedAt: 'desc',
      },
    });

    // Get category information
    const category = await prisma.category.findUnique({
      where: { id: categoryId },
      select: {
        id: true,
        name: true,
        description: true,
        _count: {
          select: {
            algorithms: true,
          },
        },
      },
    });

    if (!category) {
      throw new NotFoundError('Category not found');
    }

    // Calculate category statistics
    const totalAlgorithms = category._count.algorithms;
    const completedCount = categoryProgress.filter(p => p.status === 'COMPLETED').length;
    const inProgressCount = categoryProgress.filter(p => p.status === 'IN_PROGRESS').length;
    const completionRate = totalAlgorithms > 0 ? (completedCount / totalAlgorithms) * 100 : 0;

    res.json({
      success: true,
      data: {
        category,
        statistics: {
          total: totalAlgorithms,
          completed: completedCount,
          inProgress: inProgressCount,
          completionRate: Math.round(completionRate * 100) / 100,
        },
        progress: categoryProgress,
      },
    });
  } catch (error) {
    logger.error('Error getting category progress:', error);
    throw error;
  }
};

/**
 * Update progress notes
 */
export const updateProgressNotes = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { algorithmId } = req.params;
    const userId = req.user!.id;
    const { notes } = req.body;

    const updatedProgress = await prisma.progress.update({
      where: {
        userId_algorithmId: {
          userId,
          algorithmId,
        },
      },
      data: {
        updatedAt: new Date(),
      },
      include: {
        algorithm: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    loggers.userProgress(userId, 'notes_update', {
      algorithmId,
      algorithmName: updatedProgress.algorithm.name,
      hasNotes: !!notes,
    });

    return res.json({
      success: true,
      message: 'Progress notes updated successfully',
      data: updatedProgress,
    });
  } catch (error) {
    logger.error('Error updating progress notes:', error);
    throw error;
  }
};

/**
 * Get learning path progress
 */
export const getLearningPathProgress = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const { pathId } = req.params;

    // TODO: Implement learning paths feature
    // For now, we'll return a mock response
    const mockLearningPath = {
      id: pathId,
      title: 'Data Structures Fundamentals',
      description: 'Master the fundamental data structures',
      totalAlgorithms: 15,
      completedAlgorithms: 8,
      estimatedTime: '20 hours',
      difficulty: 'MEDIUM',
      progress: 53.3,
      algorithms: [
        {
          id: '1',
          name: 'Array Basics',
          status: 'COMPLETED',
          difficulty: 'BEGINNER',
        },
        {
          id: '2',
          name: 'Linked Lists',
          status: 'IN_PROGRESS',
          difficulty: 'EASY',
        },
        {
          id: '3',
          name: 'Binary Trees',
          status: 'NOT_STARTED',
          difficulty: 'MEDIUM',
        },
      ],
    };

    res.json({
      success: true,
      data: mockLearningPath,
    });
  } catch (error) {
    logger.error('Error getting learning path progress:', error);
    throw error;
  }
};

/**
 * Get time tracking data
 */
export const getTimeTracking = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const { period = '7d' } = req.query;

    let dateFilter = {};
    const now = new Date();
    
    if (period === '7d') {
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      dateFilter = { updatedAt: { gte: weekAgo } };
    } else if (period === '30d') {
      const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      dateFilter = { updatedAt: { gte: monthAgo } };
    } else if (period === '90d') {
      const threeMonthsAgo = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
      dateFilter = { updatedAt: { gte: threeMonthsAgo } };
    }

    const timeData = await prisma.progress.findMany({
      where: {
        userId,
        timeSpent: { gt: 0 },
        ...dateFilter,
      },
      select: {
        timeSpent: true,
        updatedAt: true,
        algorithm: {
          select: {
            name: true,
            difficulty: true,
            category: {
              select: {
                name: true,
              },
            },
          },
        },
      },
      orderBy: {
        updatedAt: 'desc',
      },
    });

    // Group by day
    const dailyTime = timeData.reduce((acc, curr) => {
      const date = curr.updatedAt.toISOString().split('T')[0];
      acc[date] = (acc[date] || 0) + curr.timeSpent;
      return acc;
    }, {} as Record<string, number>);

    // Calculate total time
    const totalTime = timeData.reduce((sum, curr) => sum + curr.timeSpent, 0);
    const averageTime = timeData.length > 0 ? totalTime / timeData.length : 0;

    res.json({
      success: true,
      data: {
        totalTime,
        averageTime: Math.round(averageTime),
        dailyTime,
        sessions: timeData.length,
        period,
      },
    });
  } catch (error) {
    logger.error('Error getting time tracking data:', error);
    throw error;
  }
};

/**
 * Get progress insights and analytics
 */
export const getProgressInsights = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const cacheKey = `progress:insights:${userId}`;

    // Try to get from cache first
    const cachedInsights = await redis.get(cacheKey);
    if (cachedInsights) {
      return res.json({
        success: true,
        data: JSON.parse(cachedInsights),
      });
    }

    // Get comprehensive insights
    const [user, progressData, submissions, streakData] = await Promise.all([
      prisma.user.findUnique({
        where: { id: userId },
        select: {
          level: true,
          xp: true,
          streak: true,
          createdAt: true,
        },
      }),
      prisma.progress.findMany({
        where: { userId },
        include: {
          algorithm: {
            select: {
              difficulty: true,
              category: {
                select: {
                  name: true,
                },
              },
            },
          },
        },
      }),
      prisma.submission.findMany({
        where: { userId },
        select: {
          status: true,
          language: true,
          executionTime: true,
          createdAt: true,
        },
      }),
      // Mock streak data - in reality, you'd calculate this from daily activity
      Promise.resolve({
        currentStreak: 5,
        longestStreak: 12,
        streakHistory: [1, 2, 3, 4, 5],
      }),
    ]);

    if (!user) {
      throw new NotFoundError('User not found');
    }

    // Calculate insights
    const completedProgress = progressData.filter(p => p.status === 'COMPLETED');
    const favoriteCategory = getMostFrequentCategory(completedProgress);
    const strongestDifficulty = getMostFrequentDifficulty(completedProgress);
    const preferredLanguage = getMostFrequentLanguage(submissions);
    const averageExecutionTime = calculateAverageExecutionTime(submissions);
    const successRate = calculateSuccessRate(submissions);

    // Calculate learning velocity (algorithms completed per week) - using completed progress count
    const weeksSinceMember = Math.max(1, Math.floor((Date.now() - user.createdAt.getTime()) / (7 * 24 * 60 * 60 * 1000)));
    const totalSolved = completedProgress.length;
    const learningVelocity = totalSolved / weeksSinceMember;

    const insights = {
      user: {
        level: user.level,
        xp: user.xp,
        totalSolved: totalSolved,
        memberSince: user.createdAt,
      },
      performance: {
        successRate: Math.round(successRate * 100) / 100,
        averageExecutionTime: Math.round(averageExecutionTime),
        learningVelocity: Math.round(learningVelocity * 100) / 100,
      },
      preferences: {
        favoriteCategory,
        strongestDifficulty,
        preferredLanguage,
      },
      streaks: streakData,
      recommendations: [
        'Try more HARD difficulty problems to level up faster',
        'Explore algorithms in different categories',
        'Focus on optimizing your solution execution time',
      ],
    };

    // Cache for 1 hour
    await redis.set(cacheKey, JSON.stringify(insights), 3600);

    return res.json({
      success: true,
      data: insights,
    });
  } catch (error) {
    logger.error('Error getting progress insights:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

/**
 * Get progress comparison with other users
 */
export const getProgressComparison = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const { compareWith } = req.query;

    const [currentUser, compareUser] = await Promise.all([
      prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          username: true,
          level: true,
          xp: true,
          streak: true,
          createdAt: true,
        },
      }),
      compareWith ? prisma.user.findUnique({
        where: { id: compareWith as string },
        select: {
          id: true,
          username: true,
          level: true,
          xp: true,
          streak: true,
          createdAt: true,
        },
      }) : null,
    ]);

    if (!currentUser) {
      throw new NotFoundError('User not found');
    }

    // Get average stats for comparison
    const averageStats = await prisma.user.aggregate({
      _avg: {
        level: true,
        xp: true,
        streak: true,
      },
    });

    const comparison = {
      currentUser,
      compareUser,
      averageUser: {
        level: Math.round(averageStats._avg.level || 0),
        xp: Math.round(averageStats._avg.xp || 0),
        streak: Math.round(averageStats._avg.streak || 0),
      },
    };

    res.json({
      success: true,
      data: comparison,
    });
  } catch (error) {
    logger.error('Error getting progress comparison:', error);
    throw error;
  }
};

/**
 * Get progress overview (alias for getOverallProgress)
 */
export const getProgressOverview = getOverallProgress;

/**
 * Get all categories progress
 */
export const getAllCategoriesProgress = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    
    // Get all categories with their progress
    const categories = await prisma.category.findMany({
      include: {
        _count: {
          select: {
            algorithms: true,
          },
        },
      },
    });

    const categoriesWithProgress = await Promise.all(
      categories.map(async (category) => {
        const categoryProgress = await prisma.progress.findMany({
          where: {
            userId,
            algorithm: {
              categoryId: category.id,
            },
          },
          include: {
            algorithm: {
              select: {
                id: true,
                name: true,
                difficulty: true,
              },
            },
          },
        });

        const totalAlgorithms = category._count.algorithms;
        const completedCount = categoryProgress.filter(p => p.status === 'COMPLETED').length;
        const completionRate = totalAlgorithms > 0 ? (completedCount / totalAlgorithms) * 100 : 0;
        const totalTimeSpent = 0; // timeSpent field doesn't exist in Progress model
        const averageScore = 0; // bestScore field doesn't exist in Progress model

        return {
          category: {
            id: category.id,
            name: category.name,
            description: category.description,
          },
          statistics: {
            total: totalAlgorithms,
            completed: completedCount,
            completionRate: Math.round(completionRate * 100) / 100,
            averageScore: Math.round(averageScore * 100) / 100,
            timeSpent: totalTimeSpent,
          },
          algorithms: categoryProgress.map(p => ({
            id: p.algorithm.id,
            name: p.algorithm.name,
            completed: p.status === 'COMPLETED',
            score: 0, // bestScore field doesn't exist
            timeSpent: 0, // timeSpent field doesn't exist
            lastAttempt: p.updatedAt.toISOString(),
          })),
        };
      })
    );

    res.json({
      success: true,
      data: categoriesWithProgress,
    });
  } catch (error) {
    logger.error('Error getting all categories progress:', error);
    throw error;
  }
};

/**
 * Get level progress
 */
export const getLevelProgress = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        level: true,
        xp: true,
      },
    });

    if (!user) {
      throw new NotFoundError('User not found');
    }

    const currentLevel = user.level;
    const currentXP = user.xp;
    const xpForNextLevel = calculateExperienceForLevel(currentLevel + 1);
    const xpToNextLevel = xpForNextLevel - currentXP;
    const totalXP = currentXP;

    res.json({
      success: true,
      data: {
        currentLevel,
        currentXP,
        xpToNextLevel: Math.max(0, xpToNextLevel),
        totalXP,
      },
    });
  } catch (error) {
    logger.error('Error getting level progress:', error);
    throw error;
  }
};

/**
 * Get XP history
 */
export const getXPHistory = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const { period = 'weekly' } = req.query;
    
    // For now, return mock data - in a real app, you'd track XP changes over time
    const mockData = [];
    const now = new Date();
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date(now);
      if (period === 'daily') {
        date.setDate(date.getDate() - i);
      } else if (period === 'weekly') {
        date.setDate(date.getDate() - (i * 7));
      } else {
        date.setMonth(date.getMonth() - i);
      }
      
      mockData.push({
        date: date.toISOString().split('T')[0],
        xp: Math.floor(Math.random() * 100) + 50,
      });
    }

    res.json({
      success: true,
      data: mockData,
    });
  } catch (error) {
    logger.error('Error getting XP history:', error);
    throw error;
  }
};

/**
 * Get streak data
 */
export const getStreakData = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    
    // Get user's current streak from database
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        streak: true,
        lastLogin: true,
      },
    });

    if (!user) {
      throw new NotFoundError('User not found');
    }

    // Calculate if streak is still active (last activity was yesterday or today)
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    const lastActivity = user.lastLogin ? new Date(user.lastLogin) : null;
    const isStreakActive = lastActivity && 
      (lastActivity.toDateString() === today.toDateString() || 
       lastActivity.toDateString() === yesterday.toDateString());

    res.json({
      success: true,
      data: {
        currentStreak: isStreakActive ? user.streak : 0,
        longestStreak: user.streak || 0,
        lastActivityDate: user.lastLogin,
        isActive: isStreakActive,
      },
    });
  } catch (error) {
    logger.error('Error getting streak data:', error);
    throw error;
  }
};

/**
 * Get user badges
 */
export const getUserBadges = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    
    // Get user's progress to calculate badges
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        level: true,
        xp: true,
        streak: true,
      },
    });

    if (!user) {
      throw new NotFoundError('User not found');
    }

    // Get completed algorithms count
    const completedCount = await prisma.progress.count({
      where: {
        userId,
        status: 'COMPLETED',
      },
    });

    // Calculate badges based on achievements
    const badges = [];
    
    // Level-based badges
    if (user.level >= 5) badges.push({ id: 'level_5', name: 'Rising Star', description: 'Reached level 5', earned: true });
    if (user.level >= 10) badges.push({ id: 'level_10', name: 'Expert', description: 'Reached level 10', earned: true });
    if (user.level >= 20) badges.push({ id: 'level_20', name: 'Master', description: 'Reached level 20', earned: true });
    
    // Algorithm completion badges
    if (completedCount >= 10) badges.push({ id: 'solver_10', name: 'Problem Solver', description: 'Completed 10 algorithms', earned: true });
    if (completedCount >= 50) badges.push({ id: 'solver_50', name: 'Algorithm Master', description: 'Completed 50 algorithms', earned: true });
    if (completedCount >= 100) badges.push({ id: 'solver_100', name: 'Coding Legend', description: 'Completed 100 algorithms', earned: true });
    
    // Streak badges
    if (user.streak >= 7) badges.push({ id: 'streak_7', name: 'Week Warrior', description: '7-day streak', earned: true });
    if (user.streak >= 30) badges.push({ id: 'streak_30', name: 'Monthly Master', description: '30-day streak', earned: true });
    
    // Add some unearned badges for motivation
    if (user.level < 5) badges.push({ id: 'level_5', name: 'Rising Star', description: 'Reach level 5', earned: false });
    if (completedCount < 10) badges.push({ id: 'solver_10', name: 'Problem Solver', description: 'Complete 10 algorithms', earned: false });
    if (user.streak < 7) badges.push({ id: 'streak_7', name: 'Week Warrior', description: 'Maintain a 7-day streak', earned: false });

    res.json({
      success: true,
      data: badges,
    });
  } catch (error) {
    logger.error('Error getting user badges:', error);
    throw error;
  }
};

// Helper functions
function calculateExperienceForLevel(level: number): number {
  // Simple exponential formula: level^2 * 100
  return level * level * 100;
}

function getMostFrequentCategory(progress: any[]): string {
  const categories = progress.map(p => p.algorithm.category.name);
  const frequency = categories.reduce((acc, cat) => {
    acc[cat] = (acc[cat] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  return Object.keys(frequency).reduce((a, b) => frequency[a] > frequency[b] ? a : b, 'None');
}

function getMostFrequentDifficulty(progress: any[]): string {
  const difficulties = progress.map(p => p.algorithm.difficulty);
  const frequency = difficulties.reduce((acc, diff) => {
    acc[diff] = (acc[diff] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  return Object.keys(frequency).reduce((a, b) => frequency[a] > frequency[b] ? a : b, 'None');
}

function getMostFrequentLanguage(submissions: any[]): string {
  if (submissions.length === 0) return 'None';
  
  const languages = submissions.map(s => s.language);
  const frequency = languages.reduce((acc, lang) => {
    acc[lang] = (acc[lang] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  return Object.keys(frequency).reduce((a, b) => frequency[a] > frequency[b] ? a : b, 'None');
}

function calculateAverageExecutionTime(submissions: any[]): number {
  const validSubmissions = submissions.filter(s => s.executionTime > 0);
  if (validSubmissions.length === 0) return 0;
  
  const totalTime = validSubmissions.reduce((sum, s) => sum + s.executionTime, 0);
  return totalTime / validSubmissions.length;
}

function calculateSuccessRate(submissions: any[]): number {
  if (submissions.length === 0) return 0;
  
  const successfulSubmissions = submissions.filter(s => s.status === 'ACCEPTED').length;
  return (successfulSubmissions / submissions.length) * 100;
}
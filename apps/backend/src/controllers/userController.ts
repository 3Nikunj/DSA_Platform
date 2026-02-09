import { Request, Response } from 'express';
import { prisma } from '../config/database';
import bcrypt from 'bcryptjs';
import { logger } from '../utils/logger';
import { AppError, ValidationError, NotFoundError } from '../middleware/errorHandler';
import { RedisService, redisClient } from '../config/redis';
import { AuthenticatedRequest } from '../middleware/auth';

const redis = new RedisService(redisClient);

/**
 * Get current user profile
 */
export const getCurrentUser = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        username: true,
        email: true,
        firstName: true,
        lastName: true,
        avatar: true,
        bio: true,
        theme: true,
        language: true,
        level: true,
        xp: true,
        coins: true,
        streak: true,
        isActive: true,
        isVerified: true,
        isPremium: true,
        createdAt: true,
        updatedAt: true,
        lastLogin: true,
      },
    });

    if (!user) {
      throw new NotFoundError('User not found');
    }

    logger.info('User profile viewed', { userId, action: 'get_current_user' });

    return res.json({
      success: true,
      data: user,
    });
  } catch (error) {
    logger.error('Error getting current user:', error);
    throw error;
  }
};

/**
 * Update user profile
 */
export const updateProfile = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const {
      firstName,
      lastName,
      bio,
    } = req.body;

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        firstName,
        lastName,
        bio,
        updatedAt: new Date(),
      },
      select: {
        id: true,
        username: true,
        firstName: true,
        lastName: true,
        bio: true,
        updatedAt: true,
      },
    });

    // Clear user cache
    await redis.del(`user:${userId}`);

    logger.info('User profile updated', { userId, updatedFields: Object.keys(req.body) });

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: updatedUser,
    });
  } catch (error) {
    logger.error('Error updating user profile:', error);
    throw error;
  }
};

/**
 * Get user by ID or username
 */
export const getUserById = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(userId);

    const user = await prisma.user.findUnique({
      where: isUUID ? { id: userId } : { username: userId },
      select: {
        id: true,
        username: true,
        firstName: true,
        lastName: true,
        avatar: true,
        bio: true,
        // location field doesn't exist in User model
        // website field doesn't exist in User model
        // githubUsername field doesn't exist in User model
        // linkedinUsername field doesn't exist in User model
        level: true,
        // experience field doesn't exist in User model
        streak: true,
        // longestStreak field doesn't exist in User model
        // totalSolved field doesn't exist in User model
        createdAt: true,
        // lastActiveAt field doesn't exist in User model
        _count: {
          select: {
            submissions: true,
            achievements: true,
          },
        },
      },
    });

    if (!user) {
      throw new NotFoundError('User not found');
    }

    return res.json({
      success: true,
      data: user,
    });
  } catch (error) {
    logger.error('Error getting user by ID:', error);
    throw error;
  }
};

/**
 * Get user statistics
 */
export const getUserStatistics = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const cacheKey = `user:stats:${userId}`;

    // Try to get from cache first
    const cachedStats = await redis.get(cacheKey);
    if (cachedStats) {
      return res.json({
        success: true,
        data: JSON.parse(cachedStats),
      });
    }

    // Get comprehensive user statistics
    const [user, submissions, progress, achievements] = await Promise.all([
      prisma.user.findUnique({
        where: { id: userId },
        select: {
          level: true,
          // experience field doesn't exist in User model
          streak: true,
          // longestStreak field doesn't exist in User model
          // totalSolved field doesn't exist in User model
          createdAt: true,
        },
      }),
      prisma.submission.groupBy({
        by: ['status'],
        where: { userId },
        _count: true,
      }),
      prisma.progress.groupBy({
        by: ['status'],
        where: { userId },
        _count: true,
      }),
      prisma.userAchievement.count({
        where: { userId },
      }),
    ]);

    if (!user) {
      throw new NotFoundError('User not found');
    }

    // Calculate submission statistics
    const submissionStats = submissions.reduce((acc, curr) => {
      acc[curr.status.toLowerCase()] = curr._count;
      return acc;
    }, {} as Record<string, number>);

    // Calculate progress statistics
    const progressStats = progress.reduce((acc, curr) => {
      acc[curr.status.toLowerCase()] = curr._count;
      return acc;
    }, {} as Record<string, number>);

    // Get difficulty breakdown
    const difficultyBreakdown = await prisma.progress.groupBy({
      by: ['status'],
      where: {
        userId,
        algorithm: {
          difficulty: {
            in: ['BEGINNER', 'EASY', 'MEDIUM', 'HARD', 'EXPERT'],
          },
        },
      },
      _count: true,
      orderBy: {
        _count: {
          status: 'desc',
        },
      },
    });

    const stats = {
      user: {
        level: user.level,
        // experience: user.experience, // field doesn't exist
        streak: user.streak,
        // longestStreak: user.longestStreak, // field doesn't exist
        // totalSolved: user.totalSolved, // field doesn't exist
        memberSince: user.createdAt,
      },
      submissions: {
        total: submissions.reduce((sum, curr) => sum + curr._count, 0),
        accepted: submissionStats.accepted || 0,
        wrong_answer: submissionStats.wrong_answer || 0,
        time_limit_exceeded: submissionStats.time_limit_exceeded || 0,
        runtime_error: submissionStats.runtime_error || 0,
        compile_error: submissionStats.compile_error || 0,
      },
      progress: {
        total: progress.reduce((sum, curr) => sum + curr._count, 0),
        completed: progressStats.completed || 0,
        in_progress: progressStats.in_progress || 0,
        not_started: progressStats.not_started || 0,
      },
      achievements: {
        total: achievements,
      },
      difficulty: difficultyBreakdown,
    };

    // Cache for 5 minutes
    await redis.set(cacheKey, JSON.stringify(stats), 300);

    return res.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    logger.error('Error getting user statistics:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};

/**
 * Get user progress
 */
export const getUserProgress = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const { page = 1, limit = 20, status, difficulty, category } = req.query;

    const skip = (Number(page) - 1) * Number(limit);
    const take = Number(limit);

    const where: any = { userId };
    if (status) where.status = status;
    if (difficulty) where.algorithm = { difficulty };
    if (category) where.algorithm = { ...where.algorithm, categoryId: category };

    const [progressItems, total] = await Promise.all([
      prisma.progress.findMany({
        where,
        include: {
          algorithm: {
            select: {
              id: true,
              // title field doesn't exist in Algorithm model
              slug: true,
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
        orderBy: {
          updatedAt: 'desc',
        },
        skip,
        take,
      }),
      prisma.progress.count({ where }),
    ]);

    res.json({
      success: true,
      data: {
        items: progressItems,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          pages: Math.ceil(total / Number(limit)),
        },
      },
    });
  } catch (error) {
    logger.error('Error getting user progress:', error);
    throw error;
  }
};

/**
 * Get user achievements
 */
export const getUserAchievements = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const { page = 1, limit = 20, type, rarity } = req.query;

    const skip = (Number(page) - 1) * Number(limit);
    const take = Number(limit);

    const where: any = { userId };
    if (type) where.achievement = { type };
    if (rarity) where.achievement = { ...where.achievement, rarity };

    const [achievements, total] = await Promise.all([
      prisma.userAchievement.findMany({
        where,
        include: {
          achievement: {
            select: {
              id: true,
              // title field doesn't exist in Achievement model
              description: true,
              icon: true,
              type: true,
              rarity: true,
              // points field doesn't exist in Achievement model
            },
          },
        },
        orderBy: {
          unlockedAt: 'desc',
        },
        skip,
        take,
      }),
      prisma.userAchievement.count({ where }),
    ]);

    res.json({
      success: true,
      data: {
        items: achievements,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          pages: Math.ceil(total / Number(limit)),
        },
      },
    });
  } catch (error) {
    logger.error('Error getting user achievements:', error);
    throw error;
  }
};

/**
 * Update user preferences
 */
export const updatePreferences = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const preferences = req.body;

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
          // preferences field doesn't exist in User model
          updatedAt: new Date(),
        },
      select: {
        id: true,
        // preferences field doesn't exist in User model
      },
    });

    // Clear user cache
    await redis.del(`user:${userId}`);

    logger.info('User preferences updated', { userId, preferences });

    res.json({
      success: true,
      message: 'Preferences updated successfully',
      data: updatedUser,
    });
  } catch (error) {
    logger.error('Error updating user preferences:', error);
    throw error;
  }
};

/**
 * Change user password
 */
export const changePassword = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const { currentPassword, newPassword } = req.body;

    // Get user with password
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        password: true,
      },
    });

    if (!user) {
      throw new NotFoundError('User not found');
    }

    // Verify current password
    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password);
    if (!isCurrentPasswordValid) {
      throw new ValidationError('Current password is incorrect');
    }

    // Hash new password
    const saltRounds = 12;
    const hashedNewPassword = await bcrypt.hash(newPassword, saltRounds);

    // Update password
    await prisma.user.update({
      where: { id: userId },
      data: {
        password: hashedNewPassword,
        updatedAt: new Date(),
      },
    });

    logger.info('Password changed successfully', { userId });

    res.json({
      success: true,
      message: 'Password changed successfully',
    });
  } catch (error) {
    logger.error('Error changing password:', error);
    logger.error('Password change failed', { userId: req.user?.id || 'unknown', error: String(error) });
    throw error;
  }
};

/**
 * Upload user avatar
 */
export const uploadAvatar = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const { avatar } = req.body; // Base64 encoded image or URL

    // TODO: Implement file upload logic (AWS S3, Cloudinary, etc.)
    // For now, we'll just store the avatar URL/data

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        avatar,
        updatedAt: new Date(),
      },
      select: {
        id: true,
        avatar: true,
      },
    });

    // Clear user cache
    await redis.del(`user:${userId}`);

    logger.info('Avatar uploaded', { userId, hasAvatar: !!avatar });

    res.json({
      success: true,
      message: 'Avatar updated successfully',
      data: updatedUser,
    });
  } catch (error) {
    logger.error('Error uploading avatar:', error);
    throw error;
  }
};

/**
 * Delete user account
 */
export const deleteAccount = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const { password, confirmation } = req.body;

    if (confirmation !== 'DELETE_MY_ACCOUNT') {
      throw new ValidationError('Invalid confirmation text');
    }

    // Get user with password
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        password: true,
        email: true,
      },
    });

    if (!user) {
      throw new NotFoundError('User not found');
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new ValidationError('Password is incorrect');
    }

    // Delete user and all related data (cascade delete)
    await prisma.user.delete({
      where: { id: userId },
    });

    // Clear all user-related cache
    await redis.del(`user:${userId}`);
    await redis.del(`user:stats:${userId}`);
    await redis.del(`user:progress:${userId}`);

    logger.info('Account deleted', { userId, email: user.email });

    res.json({
      success: true,
      message: 'Account deleted successfully',
    });
  } catch (error) {
    logger.error('Error deleting account:', error);
    throw error;
  }
};

/**
 * Get leaderboard
 */
export const getLeaderboard = async (req: Request, res: Response) => {
  try {
    const { page = 1, limit = 50, timeframe = 'all' } = req.query;
    const skip = (Number(page) - 1) * Number(limit);
    const take = Number(limit);

    let dateFilter = {};
    if (timeframe === 'week') {
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      dateFilter = { updatedAt: { gte: weekAgo } };
    } else if (timeframe === 'month') {
      const monthAgo = new Date();
      monthAgo.setMonth(monthAgo.getMonth() - 1);
      dateFilter = { updatedAt: { gte: monthAgo } };
    }

    const users = await prisma.user.findMany({
      where: dateFilter,
      select: {
        id: true,
        username: true,
        firstName: true,
        lastName: true,
        avatar: true,
        level: true,
        // experience field doesn't exist in User model
        // totalSolved field doesn't exist in User model
        streak: true,
        // longestStreak field doesn't exist in User model
      },
      orderBy: [
        { xp: 'desc' },
        // { totalSolved: 'desc' }, // field doesn't exist
        { level: 'desc' },
      ],
      skip,
      take,
    });

    const total = await prisma.user.count({ where: dateFilter });

    res.json({
      success: true,
      data: {
        items: users.map((user, index) => ({
          ...user,
          rank: skip + index + 1,
        })),
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          pages: Math.ceil(total / Number(limit)),
        },
      },
    });
  } catch (error) {
    logger.error('Error getting leaderboard:', error);
    throw error;
  }
};

/**
 * Get level leaderboard
 */
export const getLevelLeaderboard = async (req: Request, res: Response) => {
  try {
    const { page = 1, limit = 50 } = req.query;
    const skip = (Number(page) - 1) * Number(limit);
    const take = Number(limit);

    const users = await prisma.user.findMany({
      select: {
        id: true,
        username: true,
        firstName: true,
        lastName: true,
        level: true,
        // experience field doesn't exist in User model
        avatar: true,
      },
      orderBy: [
        { level: 'desc' },
        // { experience: 'desc' }, // field doesn't exist
      ],
      skip,
      take,
    });

    const total = await prisma.user.count();

    return res.json({
      success: true,
      data: {
        users,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          pages: Math.ceil(total / Number(limit)),
        },
      },
    });
  } catch (error) {
    logger.error('Error getting level leaderboard:', error);
    throw error;
  }
};

/**
 * Delete user avatar
 */
export const deleteAvatar = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;

    await prisma.user.update({
      where: { id: userId },
      data: { avatar: null },
    });

    res.json({
      success: true,
      message: 'Avatar deleted successfully',
    });
  } catch (error) {
    logger.error('Error deleting avatar:', error);
    throw error;
  }
};

/**
 * Get user preferences
 */
export const getPreferences = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        theme: true,
        language: true,
      },
    });

    if (!user) {
      throw new NotFoundError('User not found');
    }

    res.json({
      success: true,
      data: user,
    });
  } catch (error) {
    logger.error('Error getting preferences:', error);
    throw error;
  }
};

/**
 * Search users
 */
export const searchUsers = async (req: Request, res: Response) => {
  try {
    const { q, page = 1, limit = 20 } = req.query;
    const skip = (Number(page) - 1) * Number(limit);
    const take = Number(limit);

    if (!q || typeof q !== 'string') {
      return res.status(400).json({
        success: false,
        message: 'Search query is required',
      });
    }

    const users = await prisma.user.findMany({
      where: {
        OR: [
          { username: { contains: q } },
          { 
            firstName: { 
              not: null,
              contains: q
            } 
          },
          { 
            lastName: { 
              not: null,
              contains: q
            } 
          },
        ],
      },
      select: {
        id: true,
        username: true,
        firstName: true,
        lastName: true,
        avatar: true,
        level: true,
      },
      skip,
      take,
    });

    const total = await prisma.user.count({
      where: {
        OR: [
          { username: { contains: q } },
          { 
            firstName: { 
              not: null,
              contains: q
            } 
          },
          { 
            lastName: { 
              not: null,
              contains: q
            } 
          },
        ],
      },
    });

    return res.json({
      success: true,
      data: {
        users,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          pages: Math.ceil(total / Number(limit)),
        },
      },
    });
  } catch (error) {
    logger.error('Error searching users:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};

/**
 * Get XP leaderboard
 */
export const getXPLeaderboard = async (req: Request, res: Response) => {
  try {
    const { page = 1, limit = 50 } = req.query;
    const skip = (Number(page) - 1) * Number(limit);
    const take = Number(limit);

    const users = await prisma.user.findMany({
      select: {
        id: true,
        username: true,
        firstName: true,
        lastName: true,
        // experience field doesn't exist in User model
        level: true,
        avatar: true,
      },
      orderBy: [
        { level: 'desc' },
        { createdAt: 'desc' },
      ],
      skip,
      take,
    });

    const total = await prisma.user.count();

    res.json({
      success: true,
      data: {
        users,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          pages: Math.ceil(total / Number(limit)),
        },
      },
    });
  } catch (error) {
    logger.error('Error getting XP leaderboard:', error);
    throw error;
  }
};

/**
 * Get user profile
 */
export const getProfile = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        username: true,
        firstName: true,
        lastName: true,
        avatar: true,
        bio: true,
        theme: true,
        language: true,
        level: true,
        xp: true,
        coins: true,
        streak: true,
        isActive: true,
        isVerified: true,
        isPremium: true,
        createdAt: true,
        lastLogin: true,
      },
    });

    if (!user) {
      throw new NotFoundError('User not found');
    }

    res.json({
      success: true,
      data: { user },
    });
  } catch (error) {
    logger.error('Error getting user profile:', error);
    throw error;
  }
};
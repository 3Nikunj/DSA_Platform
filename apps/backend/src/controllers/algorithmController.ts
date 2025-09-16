import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { logger } from '../utils/logger';
import { AppError, ValidationError, NotFoundError } from '../middleware/errorHandler';
import { RedisService, redisClient } from '../config/redis';
import { AuthenticatedRequest } from '../middleware/auth';
import { loggers } from '../utils/logger';

const prisma = new PrismaClient();
const redis = new RedisService(redisClient);

/**
 * Get all algorithms with filtering and pagination
 */
export const getAlgorithms = async (req: Request, res: Response) => {
  try {
    const {
      page = 1,
      limit = 20,
      difficulty,
      category,
      search,
      sortBy = 'title',
      sortOrder = 'asc',
    } = req.query;

    const skip = (Number(page) - 1) * Number(limit);
    const take = Number(limit);

    // Build where clause
    const where: any = {};
    if (difficulty) where.difficulty = difficulty;
    if (category) where.categoryId = category;
    if (search) {
      where.OR = [
        { name: { contains: search as string } },
        { description: { contains: search as string } },
      ];
    }

    // Build order by clause
    const orderBy: any = {};
    if (sortBy === 'difficulty') {
      orderBy.difficulty = sortOrder;
    } else if (sortBy === 'name') {
      orderBy.name = sortOrder;
    } else if (sortBy === 'created') {
      orderBy.createdAt = sortOrder;
    } else {
      orderBy.name = sortOrder; // default to name
    }

    const [algorithms, total] = await Promise.all([
      prisma.algorithm.findMany({
        where,
        include: {
          category: {
            select: {
              id: true,
              name: true,
              description: true,
            },
          },
          _count: {
            select: {
              progress: true,
              submissions: true,
            },
          },
        },
        orderBy,
        skip,
        take,
      }),
      prisma.algorithm.count({ where }),
    ]);

    res.json({
      success: true,
      data: {
        items: algorithms,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          pages: Math.ceil(total / Number(limit)),
        },
      },
    });
  } catch (error) {
    logger.error('Error getting algorithms:', error);
    throw error;
  }
};

/**
 * Get algorithm by ID or slug
 */
export const getAlgorithmById = async (req: Request, res: Response) => {
  try {
    const { algorithmId } = req.params;
    const userId = (req as AuthenticatedRequest).user?.id;
    const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(algorithmId);

    const algorithm = await prisma.algorithm.findUnique({
      where: isUUID ? { id: algorithmId } : { slug: algorithmId },
      include: {
        category: {
          select: {
            id: true,
            name: true,
            description: true,
          },
        },
        _count: {
          select: {
            progress: true,
            submissions: true,
          },
        },
      },
    });

    if (!algorithm) {
      throw new NotFoundError('Algorithm not found');
    }

    // Get user progress if authenticated
    let userProgress = null;
    if (userId) {
      userProgress = await prisma.progress.findUnique({
        where: {
          userId_algorithmId: {
            userId,
            algorithmId: algorithm.id,
          },
        },
      });
    }

    // Note: viewCount field doesn't exist in schema, removing increment

    // Log algorithm view
    if (userId) {
      loggers.algorithmExecution(algorithm.id, userId, 0, true, null);
    }

    res.json({
      success: true,
      data: {
        ...algorithm,
        userProgress,
      },
    });
  } catch (error) {
    logger.error('Error getting algorithm by ID:', error);
    throw error;
  }
};

/**
 * Get algorithm categories
 */
export const getCategories = async (req: Request, res: Response) => {
  try {
    const cacheKey = 'algorithm:categories';
    
    // Try to get from cache first
    const cachedCategories = await redis.get(cacheKey);
    if (cachedCategories) {
      return res.json({
        success: true,
        data: JSON.parse(cachedCategories),
      });
    }

    const categories = await prisma.category.findMany({
      include: {
        _count: {
          select: {
            algorithms: true,
          },
        },
      },
      orderBy: {
        name: 'asc',
      },
    });

    // Cache for 1 hour
    await redis.set(cacheKey, JSON.stringify(categories), 3600);

    return res.json({
      success: true,
      data: categories,
    });
  } catch (error) {
    logger.error('Error getting categories:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

/**
 * Start algorithm (create or update progress)
 */
export const startAlgorithm = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { algorithmId } = req.params;
    const userId = req.user!.id;

    // Check if algorithm exists
    const algorithm = await prisma.algorithm.findUnique({
      where: { id: algorithmId },
      select: { id: true, name: true, difficulty: true },
    });

    if (!algorithm) {
      throw new NotFoundError('Algorithm not found');
    }

    // Create or update progress
    const progress = await prisma.progress.upsert({
      where: {
        userId_algorithmId: {
          userId,
          algorithmId,
        },
      },
      update: {
        status: 'IN_PROGRESS',
        updatedAt: new Date(),
      },
      create: {
        userId,
        algorithmId,
        status: 'IN_PROGRESS',
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

    loggers.algorithmExecution(algorithmId, userId, 0, true, null); // start

    res.json({
      success: true,
      message: 'Algorithm started successfully',
      data: progress,
    });
  } catch (error) {
    logger.error('Error starting algorithm:', error);
    throw error;
  }
};

/**
 * Complete algorithm
 */
export const completeAlgorithm = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { algorithmId } = req.params;
    const userId = req.user!.id;
    const { timeSpent, notes } = req.body;

    // Check if algorithm exists
    const algorithm = await prisma.algorithm.findUnique({
      where: { id: algorithmId },
      select: { id: true, name: true, difficulty: true },
    });

    if (!algorithm) {
      throw new NotFoundError('Algorithm not found');
    }

    // Update progress
    const progress = await prisma.progress.upsert({
      where: {
        userId_algorithmId: {
          userId,
          algorithmId,
        },
      },
      update: {
        status: 'COMPLETED',
        updatedAt: new Date(),
      },
      create: {
        userId,
        algorithmId,
        status: 'COMPLETED',
      },
    });

    // Update user statistics
    await prisma.user.update({
      where: { id: userId },
      data: {
        // totalSolved: { increment: 1 }, // field doesn't exist
        // experience: { increment: getDifficultyPoints(algorithm.difficulty) }, // field doesn't exist
        updatedAt: new Date(),
      },
    });

    // Clear user cache
    await redis.del(`user:${userId}`);
    await redis.del(`user:stats:${userId}`);

    loggers.algorithmExecution(algorithmId, userId, 0, true, null); // complete

    res.json({
      success: true,
      message: 'Algorithm completed successfully',
      data: progress,
    });
  } catch (error) {
    logger.error('Error completing algorithm:', error);
    throw error;
  }
};

/**
 * Submit code for algorithm
 */
export const submitCode = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { algorithmId } = req.params;
    const userId = req.user!.id;
    const { code, language } = req.body;

    // Check if algorithm exists
    const algorithm = await prisma.algorithm.findUnique({
      where: { id: algorithmId },
      select: { id: true, name: true, difficulty: true },
    });

    if (!algorithm) {
      throw new NotFoundError('Algorithm not found');
    }

    // TODO: Implement code execution and testing logic
    // For now, we'll simulate a successful submission
    const isCorrect = Math.random() > 0.3; // 70% success rate for simulation
    const status = isCorrect ? 'ACCEPTED' : 'WRONG_ANSWER';
    const executionTime = Math.floor(Math.random() * 1000) + 100; // Random execution time
    const memoryUsed = Math.floor(Math.random() * 50) + 10; // Random memory usage

    // Create submission record
    const submission = await prisma.submission.create({
      data: {
        userId,
        algorithmId,
        code,
        language,
        status,
        executionTime,
        memoryUsage: memoryUsed,

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

    // Update progress if submission is accepted
    if (status === 'ACCEPTED') {
      await prisma.progress.upsert({
        where: {
          userId_algorithmId: {
            userId,
            algorithmId,
          },
        },
        update: {
          status: 'COMPLETED',
          updatedAt: new Date(),
        },
        create: {
          userId,
          algorithmId,
          status: 'COMPLETED',
        },
      });

      // Update user statistics
      await prisma.user.update({
        where: { id: userId },
        data: {
          // totalSolved: { increment: 1 }, // field doesn't exist
          // experience: { increment: getDifficultyPoints(algorithm.difficulty) }, // field doesn't exist
          updatedAt: new Date(),
        },
      });

      // Clear user cache
      await redis.del(`user:${userId}`);
      await redis.del(`user:stats:${userId}`);
    }

    loggers.algorithmExecution(algorithmId, userId, 0, true, null); // submit

    res.json({
      success: true,
      message: 'Code submitted successfully',
      data: submission,
    });
  } catch (error) {
    logger.error('Error submitting code:', error);
    throw error;
  }
};

/**
 * Get user's submissions for an algorithm
 */
export const getAlgorithmSubmissions = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { algorithmId } = req.params;
    const userId = req.user!.id;
    const { page = 1, limit = 10 } = req.query;

    const skip = (Number(page) - 1) * Number(limit);
    const take = Number(limit);

    const [submissions, total] = await Promise.all([
      prisma.submission.findMany({
        where: {
          userId,
          algorithmId,
        },
        select: {
          id: true,
          code: true,
          language: true,
          status: true,
          executionTime: true,
          memoryUsage: true,

          createdAt: true,
        },
        orderBy: {
          createdAt: 'desc',
        },
        skip,
        take,
      }),
      prisma.submission.count({
        where: {
          userId,
          algorithmId,
        },
      }),
    ]);

    res.json({
      success: true,
      data: {
        items: submissions,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          pages: Math.ceil(total / Number(limit)),
        },
      },
    });
  } catch (error) {
    logger.error('Error getting algorithm submissions:', error);
    throw error;
  }
};

/**
 * Get algorithm progress
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
          },
        },
      },
    });

    if (!progress) {
      throw new NotFoundError('Progress not found');
    }

    res.json({
      success: true,
      data: progress,
    });
  } catch (error) {
    logger.error('Error getting algorithm progress:', error);
    throw error;
  }
};

/**
 * Get recommended algorithms
 */
export const getRecommendedAlgorithms = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const { limit = 10 } = req.query;

    // Get user's completed algorithms and preferences
    const [userProgress, user] = await Promise.all([
      prisma.progress.findMany({
        where: {
          userId,
          status: 'COMPLETED',
        },
        select: {
          algorithmId: true,
          algorithm: {
            select: {
              difficulty: true,
              categoryId: true,
            },
          },
        },
      }),
      prisma.user.findUnique({
        where: { id: userId },
        select: {
          level: true,
          // preferences field doesn't exist in User model
        },
      }),
    ]);

    if (!user) {
      throw new NotFoundError('User not found');
    }

    const completedAlgorithmIds = userProgress.map(p => p.algorithmId);
    const completedCategories = [...new Set(userProgress.map(p => p.algorithm.categoryId))];
    const completedDifficulties = [...new Set(userProgress.map(p => p.algorithm.difficulty))];

    // Recommend algorithms based on user's progress and preferences
    const recommendations = await prisma.algorithm.findMany({
      where: {
        id: {
          notIn: completedAlgorithmIds,
        },
        OR: [
          // Same categories as completed algorithms
          {
            categoryId: {
              in: completedCategories,
            },
          },
          // Similar difficulty levels
          {
            difficulty: {
              in: completedDifficulties,
            },
          },
          // All other algorithms
          {},
        ],
      },
      include: {
        category: {
          select: {
            id: true,
            name: true,
            description: true,
          },
        },
        _count: {
          select: {
            progress: true,
          },
        },
      },
      orderBy: [
        { createdAt: 'desc' },
      ],
      take: Number(limit),
    });

    res.json({
      success: true,
      data: recommendations,
    });
  } catch (error) {
    logger.error('Error getting recommended algorithms:', error);
    throw error;
  }
};

/**
 * Rate algorithm
 */
export const rateAlgorithm = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { algorithmId } = req.params;
    const userId = req.user!.id;
    const { rating, review } = req.body;

    // Check if algorithm exists
    const algorithm = await prisma.algorithm.findUnique({
      where: { id: algorithmId },
      select: { id: true, name: true },
    });

    if (!algorithm) {
      throw new NotFoundError('Algorithm not found');
    }

    // TODO: Implement rating system (create Rating model)
    // For now, we'll just log the rating
    // Note: averageRating field doesn't exist in schema

    loggers.userProgress(userId, 'algorithm_rating', {
      algorithmId,
      algorithmName: algorithm.name,
      rating,
      hasReview: !!review,
    });

    res.json({
      success: true,
      message: 'Algorithm rated successfully',
    });
  } catch (error) {
    logger.error('Error rating algorithm:', error);
    throw error;
  }
};

/**
 * Helper function to get points based on difficulty
 */
function getDifficultyPoints(difficulty: string): number {
  const points = {
    BEGINNER: 10,
    EASY: 25,
    MEDIUM: 50,
    HARD: 100,
    EXPERT: 200,
  };
  return points[difficulty as keyof typeof points] || 25;
}
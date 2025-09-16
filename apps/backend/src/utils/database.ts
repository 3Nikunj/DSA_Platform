import { PrismaClient, Prisma } from '@prisma/client';
import { prisma } from '../app';

/**
 * Database utility functions for common operations
 */
export class DatabaseService {
  /**
   * Execute a transaction with retry logic
   */
  static async executeTransaction<T>(
    callback: (tx: Prisma.TransactionClient) => Promise<T>,
    maxRetries: number = 3
  ): Promise<T> {
    let lastError: Error;
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await prisma.$transaction(callback, {
          maxWait: 5000, // 5 seconds
          timeout: 10000, // 10 seconds
        });
      } catch (error) {
        lastError = error as Error;
        
        // Don't retry on certain errors
        if (error instanceof Prisma.PrismaClientKnownRequestError) {
          // Unique constraint violation, foreign key constraint, etc.
          if (['P2002', 'P2003', 'P2025'].includes(error.code)) {
            throw error;
          }
        }
        
        if (attempt === maxRetries) {
          console.error(`Transaction failed after ${maxRetries} attempts:`, error);
          throw lastError;
        }
        
        // Wait before retry (exponential backoff)
        const delay = Math.pow(2, attempt - 1) * 1000;
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
    
    throw lastError!;
  }

  /**
   * Check if a record exists by ID
   */
  static async exists(
    model: keyof PrismaClient,
    id: string
  ): Promise<boolean> {
    try {
      const record = await (prisma[model] as any).findUnique({
        where: { id },
        select: { id: true },
      });
      return !!record;
    } catch (error) {
      console.error(`Error checking existence for ${String(model)} with id ${id}:`, error);
      return false;
    }
  }

  /**
   * Get paginated results with metadata
   */
  static async paginate<T>(
    model: any,
    options: {
      where?: any;
      orderBy?: any;
      include?: any;
      select?: any;
      page?: number;
      limit?: number;
    } = {}
  ): Promise<{
    data: T[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
      hasNext: boolean;
      hasPrev: boolean;
    };
  }> {
    const page = Math.max(1, options.page || 1);
    const limit = Math.min(100, Math.max(1, options.limit || 10));
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      model.findMany({
        where: options.where,
        orderBy: options.orderBy,
        include: options.include,
        select: options.select,
        skip,
        take: limit,
      }),
      model.count({ where: options.where }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      data,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
    };
  }

  /**
   * Soft delete a record (if the model has deletedAt field)
   */
  static async softDelete(
    model: any,
    id: string
  ): Promise<any> {
    try {
      return await model.update({
        where: { id },
        data: { deletedAt: new Date() },
      });
    } catch (error) {
      console.error(`Error soft deleting record with id ${id}:`, error);
      throw error;
    }
  }

  /**
   * Restore a soft deleted record
   */
  static async restore(
    model: any,
    id: string
  ): Promise<any> {
    try {
      return await model.update({
        where: { id },
        data: { deletedAt: null },
      });
    } catch (error) {
      console.error(`Error restoring record with id ${id}:`, error);
      throw error;
    }
  }

  /**
   * Bulk create records with conflict handling
   */
  static async bulkCreate<T>(
    model: any,
    data: T[],
    options: {
      skipDuplicates?: boolean;
      updateOnConflict?: boolean;
    } = {}
  ): Promise<any> {
    try {
      if (options.updateOnConflict) {
        // Use upsert for each record (slower but handles conflicts)
        const results = [];
        for (const item of data) {
          const result = await model.upsert({
            where: { id: (item as any).id },
            update: item,
            create: item,
          });
          results.push(result);
        }
        return results;
      } else {
        return await model.createMany({
          data,
          skipDuplicates: options.skipDuplicates || false,
        });
      }
    } catch (error) {
      console.error('Error in bulk create:', error);
      throw error;
    }
  }

  /**
   * Get database statistics
   */
  static async getStats(): Promise<{
    users: number;
    algorithms: number;
    challenges: number;
    submissions: number;
    competitions: number;
  }> {
    try {
      const [users, algorithms, challenges, submissions, competitions] = await Promise.all([
        prisma.user.count(),
        prisma.algorithm.count(),
        prisma.challenge.count(),
        prisma.submission.count(),
        prisma.competition.count(),
      ]);

      return {
        users,
        algorithms,
        challenges,
        submissions,
        competitions,
      };
    } catch (error) {
      console.error('Error getting database stats:', error);
      throw error;
    }
  }

  /**
   * Clean up old records (for maintenance)
   */
  static async cleanup(options: {
    deleteOldSessions?: boolean;
    deleteOldSubmissions?: boolean;
    daysOld?: number;
  } = {}): Promise<{
    sessionsDeleted: number;
    submissionsDeleted: number;
  }> {
    const daysOld = options.daysOld || 30;
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysOld);

    let sessionsDeleted = 0;
    let submissionsDeleted = 0;

    try {
      if (options.deleteOldSessions) {
        const result = await prisma.session.deleteMany({
          where: {
            expiresAt: {
              lt: new Date(),
            },
          },
        });
        sessionsDeleted = result.count;
      }

      if (options.deleteOldSubmissions) {
        const result = await prisma.submission.deleteMany({
          where: {
            createdAt: {
              lt: cutoffDate,
            },
            status: 'REJECTED', // Only delete rejected submissions
          },
        });
        submissionsDeleted = result.count;
      }

      return {
        sessionsDeleted,
        submissionsDeleted,
      };
    } catch (error) {
      console.error('Error during cleanup:', error);
      throw error;
    }
  }

  /**
   * Health check for database connection
   */
  static async healthCheck(): Promise<{
    status: 'healthy' | 'unhealthy';
    latency: number;
    error?: string;
  }> {
    const startTime = Date.now();
    
    try {
      await prisma.$queryRaw`SELECT 1`;
      const latency = Date.now() - startTime;
      
      return {
        status: 'healthy',
        latency,
      };
    } catch (error) {
      const latency = Date.now() - startTime;
      
      return {
        status: 'unhealthy',
        latency,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }
}

/**
 * Common database queries
 */
export const CommonQueries = {
  /**
   * Get user with basic info
   */
  getUserBasic: (userId: string) => {
    return prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        username: true,
        email: true,
        firstName: true,
        lastName: true,
        avatar: true,
        level: true,
        xp: true,
        isVerified: true,
        isPremium: true,
        createdAt: true,
      },
    });
  },

  /**
   * Get user with full profile
   */
  getUserFull: (userId: string) => {
    return prisma.user.findUnique({
      where: { id: userId },
      include: {
        progress: {
          include: {
            algorithm: {
              select: {
                id: true,
                name: true,
                difficulty: true,
                category: true,
              },
            },
          },
        },
        achievements: {
          include: {
            achievement: true,
          },
        },
        submissions: {
          orderBy: { createdAt: 'desc' },
          take: 10,
          include: {
            algorithm: {
              select: {
                id: true,
                name: true,
                difficulty: true,
              },
            },
          },
        },
      },
    });
  },

  /**
   * Get algorithm with user progress
   */
  getAlgorithmWithProgress: (algorithmId: string, userId?: string) => {
    return prisma.algorithm.findUnique({
      where: { id: algorithmId },
      include: {
        category: true,
        progress: userId ? {
          where: { userId },
        } : false,
        submissions: userId ? {
          where: { userId },
          orderBy: { createdAt: 'desc' },
          take: 5,
        } : false,
        _count: {
          select: {
            progress: true,
            submissions: {
              where: { status: 'ACCEPTED' },
            },
          },
        },
      },
    });
  },
};

export default DatabaseService;
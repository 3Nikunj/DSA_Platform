import { Request, Response, NextFunction } from 'express';
import * as jwt from 'jsonwebtoken';
import { prisma } from '../app';
import { redisService } from '../config/redis';
// import { AuthenticationError, AuthorizationError } from './errorHandler';
import { logger } from '../utils/logger';

// Temporary simple error classes
class AuthenticationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'AuthenticationError';
  }
}

class AuthorizationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'AuthorizationError';
  }
}

// Extend Request interface to include user
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
        username: string;
        isVerified: boolean;
        isPremium: boolean;
        level: number;
        xp: number;
      };
    }
  }
}

interface JWTPayload {
  userId: string;
  email: string;
  username: string;
  iat: number;
  exp: number;
}

// Authenticated request interface
export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    username: string;
    isVerified: boolean;
    isPremium: boolean;
    level: number;
    xp: number;
  };
}

/**
 * Middleware to authenticate JWT tokens
 */
export const authenticateToken = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      throw new AuthenticationError('Access token is required');
    }

    // Check if token is blacklisted (temporarily disabled)
    // const isBlacklisted = await redisService.exists(`blacklist:${token}`);
    // if (isBlacklisted) {
    //   throw new AuthenticationError('Token has been revoked');
    // }

    // Verify JWT token
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      throw new Error('JWT_SECRET is not configured');
    }

    const decoded = jwt.verify(token, jwtSecret) as JWTPayload;

    // Check if user exists and is active
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        email: true,
        username: true,
        isActive: true,
        isVerified: true,
        isPremium: true,
        level: true,
        xp: true,
      },
    });

    if (!user) {
      throw new AuthenticationError('User not found');
    }

    if (!user.isActive) {
      throw new AuthenticationError('Account has been deactivated');
    }

    // Attach user to request
    req.user = user;

    // Log successful authentication
    logger.debug('User authenticated', {
      userId: user.id,
      username: user.username,
      ip: req.ip,
    });

    next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      next(new AuthenticationError('Invalid token'));
    } else if (error instanceof jwt.TokenExpiredError) {
      next(new AuthenticationError('Token has expired'));
    } else {
      next(error);
    }
  }
};

/**
 * Middleware to check if user is verified
 */
export const requireVerified = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  if (!req.user) {
    return next(new AuthenticationError('Authentication required'));
  }

  if (!req.user.isVerified) {
    return next(new AuthorizationError('Email verification required'));
  }

  next();
};

/**
 * Middleware to check if user has premium access
 */
export const requirePremium = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  if (!req.user) {
    return next(new AuthenticationError('Authentication required'));
  }

  if (!req.user.isPremium) {
    return next(new AuthorizationError('Premium subscription required'));
  }

  next();
};

/**
 * Middleware to check minimum user level
 */
export const requireLevel = (minLevel: number) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      return next(new AuthenticationError('Authentication required'));
    }

    if (req.user.level < minLevel) {
      return next(new AuthorizationError(`Level ${minLevel} or higher required`));
    }

    next();
  };
};

/**
 * Middleware to check if user owns the resource
 */
export const requireOwnership = (userIdField: string = 'userId') => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      return next(new AuthenticationError('Authentication required'));
    }

    const resourceUserId = req.params[userIdField] || req.body[userIdField];
    
    if (resourceUserId !== req.user.id) {
      return next(new AuthorizationError('Access denied: You can only access your own resources'));
    }

    next();
  };
};

/**
 * Optional authentication middleware (doesn't throw error if no token)
 */
export const optionalAuth = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return next(); // Continue without authentication
    }

    // Check if token is blacklisted
    const isBlacklisted = await redisService.exists(`blacklist:${token}`);
    if (isBlacklisted) {
      return next(); // Continue without authentication
    }

    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      return next();
    }

    const decoded = jwt.verify(token, jwtSecret) as JWTPayload;

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        email: true,
        username: true,
        isActive: true,
        isVerified: true,
        isPremium: true,
        level: true,
        xp: true,
      },
    });

    if (user && user.isActive) {
      req.user = user;
    }

    next();
  } catch (error) {
    // Ignore authentication errors in optional auth
    next();
  }
};

/**
 * Rate limiting middleware for authenticated users
 */
export const authRateLimit = (maxRequests: number = 100, windowMs: number = 15 * 60 * 1000) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    if (!req.user) {
      return next();
    }

    const key = `rate_limit:user:${req.user.id}`;
    const current = await redisService.incr(key);

    if (current === 1) {
      await redisService.expire(key, Math.floor(windowMs / 1000));
    }

    if (current > maxRequests) {
      return next(new AuthorizationError('Rate limit exceeded'));
    }

    // Add rate limit headers
    res.set({
      'X-RateLimit-Limit': maxRequests.toString(),
      'X-RateLimit-Remaining': Math.max(0, maxRequests - current).toString(),
      'X-RateLimit-Reset': new Date(Date.now() + windowMs).toISOString(),
    });

    next();
  };
};

/**
 * Middleware to refresh user data from database
 */
export const refreshUserData = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  if (!req.user) {
    return next();
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        email: true,
        username: true,
        isActive: true,
        isVerified: true,
        isPremium: true,
        level: true,
        xp: true,
      },
    });

    if (user && user.isActive) {
      req.user = user;
    } else {
      req.user = undefined;
    }

    next();
  } catch (error) {
    next(error);
  }
};

/**
 * Generate JWT token
 */
export const generateToken = (payload: { userId: string; email: string; username: string }): string => {
  const jwtSecret = process.env.JWT_SECRET;
  const jwtExpiresIn = process.env.JWT_EXPIRES_IN || '7d';

  if (!jwtSecret) {
    throw new Error('JWT_SECRET is not configured');
  }

  return jwt.sign(payload, jwtSecret, { expiresIn: jwtExpiresIn } as jwt.SignOptions);
};

/**
 * Generate refresh token
 */
export const generateRefreshToken = (payload: { userId: string }): string => {
  const refreshSecret = process.env.JWT_REFRESH_SECRET;
  const refreshExpiresIn = process.env.JWT_REFRESH_EXPIRES_IN || '30d';

  if (!refreshSecret) {
    throw new Error('JWT_REFRESH_SECRET is not configured');
  }

  return jwt.sign(payload, refreshSecret, { expiresIn: refreshExpiresIn } as jwt.SignOptions);
};

/**
 * Blacklist token
 */
export const blacklistToken = async (token: string): Promise<void> => {
  try {
    const decoded = jwt.decode(token) as JWTPayload;
    if (decoded && decoded.exp) {
      const expiresIn = decoded.exp - Math.floor(Date.now() / 1000);
      if (expiresIn > 0) {
        // await redisService.set(`blacklist:${token}`, '1', expiresIn);
        console.log('Token blacklisted (temporarily disabled)');
      }
    }
  } catch (error) {
    console.error('Failed to blacklist token:', error);
  }
};
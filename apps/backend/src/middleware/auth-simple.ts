import { Request, Response, NextFunction } from 'express';
import * as jwt from 'jsonwebtoken';

// Use the existing Request interface extension
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

// Simple authentication middleware for development
export const authenticateToken = (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    res.status(401).json({
      success: false,
      error: 'Access token required',
    });
    return;
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret') as any;
    req.user = {
      id: decoded.userId,
      email: decoded.email,
      username: decoded.username,
      isVerified: decoded.isVerified || false,
      isPremium: decoded.isPremium || false,
      level: decoded.level || 1,
      xp: decoded.xp || 0,
    };
    next();
  } catch (error) {
    res.status(403).json({
      success: false,
      error: 'Invalid or expired token',
    });
  }
};

// Simple ownership check (placeholder)
export const requireOwnership = (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
  // For simple version, just pass through
  next();
};
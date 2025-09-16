import { Request, Response, NextFunction } from 'express';
import { NotFoundError } from './errorHandler';
import { logger } from '../utils/logger';

/**
 * 404 Not Found middleware
 * This middleware is called when no route matches the request
 */
export const notFound = (req: Request, res: Response, next: NextFunction): void => {
  // Log the 404 attempt
  logger.warn('Route not found', {
    method: req.method,
    url: req.originalUrl,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    timestamp: new Date().toISOString(),
  });

  // Create and pass the error to the error handler
  const error = new NotFoundError(`Route ${req.method} ${req.originalUrl} not found`);
  next(error);
};
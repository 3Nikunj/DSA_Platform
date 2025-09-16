import { Request, Response, NextFunction } from 'express';
import { Prisma } from '@prisma/client';
import { logger, logError } from '../utils/logger';
import { ZodError } from 'zod';
import { JsonWebTokenError, TokenExpiredError } from 'jsonwebtoken';

// Custom error class
export class AppError extends Error {
  public statusCode: number;
  public isOperational: boolean;
  public code?: string;

  constructor(message: string, statusCode: number = 500, isOperational: boolean = true) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    this.name = this.constructor.name;

    Error.captureStackTrace(this, this.constructor);
  }
}

// Validation error class
export class ValidationError extends AppError {
  public errors: any[];

  constructor(message: string, errors: any[] = []) {
    super(message, 400);
    this.errors = errors;
  }
}

// Authentication error class
export class AuthenticationError extends AppError {
  constructor(message: string = 'Authentication failed') {
    super(message, 401);
  }
}

// Authorization error class
export class AuthorizationError extends AppError {
  constructor(message: string = 'Access denied') {
    super(message, 403);
  }
}

// Not found error class
export class NotFoundError extends AppError {
  constructor(message: string = 'Resource not found') {
    super(message, 404);
  }
}

// Conflict error class
export class ConflictError extends AppError {
  constructor(message: string = 'Resource conflict') {
    super(message, 409);
  }
}

// Rate limit error class
export class RateLimitError extends AppError {
  constructor(message: string = 'Too many requests') {
    super(message, 429);
  }
}

// Handle Prisma errors
const handlePrismaError = (error: Prisma.PrismaClientKnownRequestError): AppError => {
  switch (error.code) {
    case 'P2002':
      // Unique constraint violation
      const field = error.meta?.target as string[];
      return new ConflictError(`Duplicate value for ${field?.join(', ') || 'field'}`);
    
    case 'P2025':
      // Record not found
      return new NotFoundError('Record not found');
    
    case 'P2003':
      // Foreign key constraint violation
      return new ValidationError('Invalid reference to related record');
    
    case 'P2014':
      // Required relation violation
      return new ValidationError('Required relation is missing');
    
    case 'P2021':
      // Table does not exist
      return new AppError('Database table not found', 500, false);
    
    case 'P2022':
      // Column does not exist
      return new AppError('Database column not found', 500, false);
    
    default:
      return new AppError('Database operation failed', 500, false);
  }
};

// Handle Zod validation errors
const handleZodError = (error: ZodError): ValidationError => {
  const errors = error.issues.map((err: any) => ({
    field: err.path.join('.'),
    message: err.message,
    code: err.code,
  }));

  return new ValidationError('Validation failed', errors);
};

// Handle JWT errors
const handleJWTError = (error: JsonWebTokenError | TokenExpiredError): AuthenticationError => {
  if (error instanceof TokenExpiredError) {
    return new AuthenticationError('Token has expired');
  }
  return new AuthenticationError('Invalid token');
};

// Send error response in development
const sendErrorDev = (err: AppError, res: Response) => {
  res.status(err.statusCode).json({
    success: false,
    error: {
      message: err.message,
      stack: err.stack,
      statusCode: err.statusCode,
      isOperational: err.isOperational,
      ...(err instanceof ValidationError && { errors: err.errors }),
    },
  });
};

// Send error response in production
const sendErrorProd = (err: AppError, res: Response) => {
  // Operational, trusted error: send message to client
  if (err.isOperational) {
    const response: any = {
      success: false,
      error: {
        message: err.message,
        statusCode: err.statusCode,
      },
    };

    // Include validation errors in production
    if (err instanceof ValidationError) {
      response.error.errors = err.errors;
    }

    res.status(err.statusCode).json(response);
  } else {
    // Programming or other unknown error: don't leak error details
    logger.error('Unexpected error:', err);
    
    res.status(500).json({
      success: false,
      error: {
        message: 'Something went wrong',
        statusCode: 500,
      },
    });
  }
};

// Global error handling middleware
export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  let error = err as AppError;

  // Log the error
  logError(err, 'Global Error Handler', {
    url: req.url,
    method: req.method,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    userId: (req as any).user?.id,
  });

  // Handle specific error types
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    error = handlePrismaError(err);
  } else if (err instanceof Prisma.PrismaClientValidationError) {
    error = new ValidationError('Invalid data provided');
  } else if (err instanceof ZodError) {
    error = handleZodError(err);
  } else if (err instanceof JsonWebTokenError || err instanceof TokenExpiredError) {
    error = handleJWTError(err);
  } else if (!(err instanceof AppError)) {
    // Convert unknown errors to AppError
    error = new AppError(err.message || 'Something went wrong', 500, false);
  }

  // Send error response
  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(error, res);
  } else {
    sendErrorProd(error, res);
  }
};

// Async error wrapper
export const asyncHandler = (
  fn: (req: Request, res: Response, next: NextFunction) => Promise<any>
) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

// Create error helper functions
export const createError = {
  badRequest: (message: string = 'Bad request') => new AppError(message, 400),
  unauthorized: (message: string = 'Unauthorized') => new AuthenticationError(message),
  forbidden: (message: string = 'Forbidden') => new AuthorizationError(message),
  notFound: (message: string = 'Not found') => new NotFoundError(message),
  conflict: (message: string = 'Conflict') => new ConflictError(message),
  validation: (message: string = 'Validation failed', errors: any[] = []) => new ValidationError(message, errors),
  internal: (message: string = 'Internal server error') => new AppError(message, 500, false),
  rateLimit: (message: string = 'Too many requests') => new RateLimitError(message),
};
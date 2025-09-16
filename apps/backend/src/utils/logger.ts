import * as winston from 'winston';
import * as path from 'path';

const { combine, timestamp, errors, json, printf, colorize, simple } = winston.format;

// Custom log format for console output
const consoleFormat = printf(({ level, message, timestamp, stack }) => {
  return `${timestamp} [${level}]: ${stack || message}`;
});

// Create logs directory if it doesn't exist
const logsDir = path.join(process.cwd(), 'logs');

// Logger configuration
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: combine(
    timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    errors({ stack: true }),
    json()
  ),
  defaultMeta: {
    service: 'dsa-backend',
    environment: process.env.NODE_ENV || 'development',
  },
  transports: [
    // Write all logs with importance level of 'error' or less to error.log
    new winston.transports.File({
      filename: path.join(logsDir, 'error.log'),
      level: 'error',
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),
    
    // Write all logs with importance level of 'info' or less to combined.log
    new winston.transports.File({
      filename: path.join(logsDir, 'combined.log'),
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),
  ],
  
  // Handle exceptions and rejections
  exceptionHandlers: [
    new winston.transports.File({
      filename: path.join(logsDir, 'exceptions.log'),
    }),
  ],
  
  rejectionHandlers: [
    new winston.transports.File({
      filename: path.join(logsDir, 'rejections.log'),
    }),
  ],
});

// Add console transport for development
if (process.env.NODE_ENV !== 'production') {
  logger.add(
    new winston.transports.Console({
      format: combine(
        colorize(),
        timestamp({ format: 'HH:mm:ss' }),
        consoleFormat
      ),
    })
  );
} else {
  // In production, use simple format for console
  logger.add(
    new winston.transports.Console({
      format: combine(
        timestamp(),
        simple()
      ),
    })
  );
}

// Create a stream object for Morgan HTTP request logging
export const logStream = {
  write: (message: string) => {
    logger.info(message.trim());
  },
};

// Helper functions for structured logging
export const loggers = {
  // HTTP request logging
  httpRequest: (req: any, res: any, responseTime?: number) => {
    logger.info('HTTP Request', {
      method: req.method,
      url: req.url,
      statusCode: res.statusCode,
      responseTime: responseTime ? `${responseTime}ms` : undefined,
      userAgent: req.get('User-Agent'),
      ip: req.ip,
      userId: req.user?.id,
    });
  },

  // Database operation logging
  dbOperation: (operation: string, table: string, duration?: number, error?: any) => {
    if (error) {
      logger.error('Database Operation Failed', {
        operation,
        table,
        duration: duration ? `${duration}ms` : undefined,
        error: error.message,
        stack: error.stack,
      });
    } else {
      logger.debug('Database Operation', {
        operation,
        table,
        duration: duration ? `${duration}ms` : undefined,
      });
    }
  },

  // Authentication logging
  auth: (action: string, userId?: string, email?: string, success: boolean = true, error?: any) => {
    const logData = {
      action,
      userId,
      email,
      success,
      timestamp: new Date().toISOString(),
    };

    if (success) {
      logger.info('Authentication Event', logData);
    } else {
      logger.warn('Authentication Failed', {
        ...logData,
        error: error?.message,
      });
    }
  },

  // Algorithm execution logging
  algorithmExecution: (algorithmId: string, userId: string, executionTime: number, success: boolean, error?: any) => {
    const logData = {
      algorithmId,
      userId,
      executionTime: `${executionTime}ms`,
      success,
      timestamp: new Date().toISOString(),
    };

    if (success) {
      logger.info('Algorithm Execution', logData);
    } else {
      logger.error('Algorithm Execution Failed', {
        ...logData,
        error: error?.message,
        stack: error?.stack,
      });
    }
  },

  // User progress logging
  userProgress: (userId: string, action: string, details: any) => {
    logger.info('User Progress', {
      userId,
      action,
      details,
      timestamp: new Date().toISOString(),
    });
  },

  // Security events
  security: (event: string, details: any, severity: 'low' | 'medium' | 'high' = 'medium') => {
    logger.warn('Security Event', {
      event,
      severity,
      details,
      timestamp: new Date().toISOString(),
    });
  },

  // Performance monitoring
  performance: (operation: string, duration: number, metadata?: any) => {
    const logLevel = duration > 1000 ? 'warn' : 'info';
    logger.log(logLevel, 'Performance Metric', {
      operation,
      duration: `${duration}ms`,
      metadata,
      timestamp: new Date().toISOString(),
    });
  },
};

// Error logging helper
export const logError = (error: Error, context?: string, metadata?: any) => {
  logger.error('Application Error', {
    message: error.message,
    stack: error.stack,
    context,
    metadata,
    timestamp: new Date().toISOString(),
  });
};

// Request ID middleware helper
export const generateRequestId = (): string => {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
};

export { logger };
export default logger;
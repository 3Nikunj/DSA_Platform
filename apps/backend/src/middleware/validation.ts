import { Request, Response, NextFunction } from 'express';
import { validationResult, ValidationError as ExpressValidationError } from 'express-validator';
import { ValidationError } from './errorHandler';

/**
 * Middleware to handle validation errors from express-validator
 */
export const validateRequest = (req: Request, res: Response, next: NextFunction): void => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    const formattedErrors = errors.array().map((error: ExpressValidationError) => ({
      field: error.type === 'field' ? error.path : 'unknown',
      message: error.msg,
      value: error.type === 'field' ? error.value : undefined,
    }));
    
    const validationError = new ValidationError('Validation failed', formattedErrors);
    return next(validationError);
  }
  
  next();
};

/**
 * Custom validation helper functions
 */
export const customValidators = {
  // Check if value is a valid programming language
  isValidLanguage: (value: string): boolean => {
    const validLanguages = ['javascript', 'python', 'java', 'cpp', 'c', 'csharp', 'go', 'rust', 'typescript'];
    return validLanguages.includes(value.toLowerCase());
  },
  
  // Check if value is a valid difficulty level
  isValidDifficulty: (value: string): boolean => {
    const validDifficulties = ['BEGINNER', 'EASY', 'MEDIUM', 'HARD', 'EXPERT'];
    return validDifficulties.includes(value.toUpperCase());
  },
  
  // Check if value is a valid algorithm category
  isValidCategory: (value: string): boolean => {
    const validCategories = [
      'sorting', 'searching', 'graph', 'tree', 'dynamic-programming',
      'greedy', 'backtracking', 'divide-conquer', 'string', 'array',
      'linked-list', 'stack', 'queue', 'heap', 'hash-table'
    ];
    return validCategories.includes(value.toLowerCase());
  },
  
  // Check if code length is within limits
  isValidCodeLength: (value: string): boolean => {
    const maxLength = parseInt(process.env.MAX_CODE_LENGTH || '10000');
    return value.length <= maxLength;
  },
  
  // Check if username is available (this would need database check)
  isUsernameAvailable: async (value: string): Promise<boolean> => {
    // This would be implemented with actual database check
    // For now, just return true
    return true;
  },
  
  // Check if email is available (this would need database check)
  isEmailAvailable: async (value: string): Promise<boolean> => {
    // This would be implemented with actual database check
    // For now, just return true
    return true;
  },
  
  // Validate JSON structure
  isValidJSON: (value: string): boolean => {
    try {
      JSON.parse(value);
      return true;
    } catch {
      return false;
    }
  },
  
  // Check if value is a valid UUID
  isValidUUID: (value: string): boolean => {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return uuidRegex.test(value);
  },
  
  // Check if value is a valid slug
  isValidSlug: (value: string): boolean => {
    const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
    return slugRegex.test(value);
  },
  
  // Check if array has valid length
  isValidArrayLength: (value: any[], min: number = 0, max: number = 100): boolean => {
    return Array.isArray(value) && value.length >= min && value.length <= max;
  },
  
  // Check if value is a valid time complexity notation
  isValidTimeComplexity: (value: string): boolean => {
    const complexityRegex = /^O\([^)]+\)$/;
    return complexityRegex.test(value);
  },
  
  // Check if value is a valid space complexity notation
  isValidSpaceComplexity: (value: string): boolean => {
    const complexityRegex = /^O\([^)]+\)$/;
    return complexityRegex.test(value);
  },
  
  // Check if value is within numeric range
  isInRange: (value: number, min: number, max: number): boolean => {
    return value >= min && value <= max;
  },
  
  // Check if string contains only allowed characters
  containsOnlyAllowedChars: (value: string, allowedChars: RegExp): boolean => {
    return allowedChars.test(value);
  },
  
  // Check if file type is allowed
  isAllowedFileType: (filename: string): boolean => {
    const allowedTypes = (process.env.ALLOWED_FILE_TYPES || 'jpg,jpeg,png,gif,pdf').split(',');
    const extension = filename.split('.').pop()?.toLowerCase();
    return extension ? allowedTypes.includes(extension) : false;
  },
  
  // Check if file size is within limit
  isValidFileSize: (size: number): boolean => {
    const maxSize = parseInt(process.env.MAX_FILE_SIZE || '5242880'); // 5MB default
    return size <= maxSize;
  },
};

/**
 * Sanitization helpers
 */
export const sanitizers = {
  // Remove HTML tags
  stripHtml: (value: string): string => {
    return value.replace(/<[^>]*>/g, '');
  },
  
  // Normalize whitespace
  normalizeWhitespace: (value: string): string => {
    return value.replace(/\s+/g, ' ').trim();
  },
  
  // Convert to slug format
  toSlug: (value: string): string => {
    return value
      .toLowerCase()
      .replace(/[^a-z0-9 -]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-+|-+$/g, '');
  },
  
  // Escape special characters for regex
  escapeRegex: (value: string): string => {
    return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  },
  
  // Truncate string to max length
  truncate: (value: string, maxLength: number): string => {
    return value.length > maxLength ? value.substring(0, maxLength) : value;
  },
};
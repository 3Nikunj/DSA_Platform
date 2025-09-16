import { Router } from 'express';
import { body, param, query } from 'express-validator';
import { asyncHandler } from '../middleware/errorHandler';
import { validateRequest } from '../middleware/validation';
import { authenticateToken, requireOwnership } from '../middleware/auth-simple';
import * as progressController from '../controllers/progressController-simple';

const router = Router();

// Validation rules
const progressUpdateValidation = [
  body('timeSpent')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Time spent must be a non-negative integer'),
  body('status')
    .optional()
    .isIn(['NOT_STARTED', 'IN_PROGRESS', 'COMPLETED', 'MASTERED'])
    .withMessage('Invalid progress status'),
  body('score')
    .optional()
    .isFloat({ min: 0, max: 100 })
    .withMessage('Score must be between 0 and 100'),
];

const algorithmIdValidation = [
  param('algorithmId')
    .isUUID()
    .withMessage('Invalid algorithm ID format'),
];

const userIdValidation = [
  param('userId')
    .isUUID()
    .withMessage('Invalid user ID format'),
];

const dateRangeValidation = [
  query('startDate')
    .optional()
    .isISO8601()
    .withMessage('Start date must be in ISO 8601 format'),
  query('endDate')
    .optional()
    .isISO8601()
    .withMessage('End date must be in ISO 8601 format'),
];

const paginationValidation = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
];

// All routes require authentication
router.use(authenticateToken);

// Get overall progress
router.get('/overview', authenticateToken, progressController.getProgressOverview);

// Get progress for specific algorithm
router.get('/algorithm/:algorithmId', authenticateToken, progressController.getAlgorithmProgress);

// Get progress by category
router.get('/category/:categoryId', authenticateToken, progressController.getCategoryProgress);

// Get all categories progress
router.get('/categories', authenticateToken, progressController.getAllCategoriesProgress);

// Get progress insights
router.get('/insights', authenticateToken, progressController.getProgressInsights);

export default router;
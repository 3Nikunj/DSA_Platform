import { Router } from 'express';
import { body, param, query } from 'express-validator';
import { asyncHandler } from '../middleware/errorHandler';
import { validateRequest } from '../middleware/validation';
import { authenticateToken, optionalAuth } from '../middleware/auth';
import * as algorithmController from '../controllers/algorithmController-simple';

const router = Router();

// Validation rules
const algorithmValidation = [
  body('name')
    .isLength({ min: 1, max: 100 })
    .withMessage('Algorithm name must be 1-100 characters'),
  body('description')
    .isLength({ min: 10, max: 1000 })
    .withMessage('Description must be 10-1000 characters'),
  body('explanation')
    .isLength({ min: 50 })
    .withMessage('Explanation must be at least 50 characters'),
  body('difficulty')
    .isIn(['BEGINNER', 'EASY', 'MEDIUM', 'HARD', 'EXPERT'])
    .withMessage('Invalid difficulty level'),
  body('timeComplexity')
    .matches(/^O\(.+\)$/)
    .withMessage('Time complexity must be in O() notation'),
  body('spaceComplexity')
    .matches(/^O\(.+\)$/)
    .withMessage('Space complexity must be in O() notation'),
  body('categoryId')
    .isUUID()
    .withMessage('Invalid category ID'),
];

const algorithmIdValidation = [
  param('algorithmId')
    .isUUID()
    .withMessage('Invalid algorithm ID format'),
];

const slugValidation = [
  param('slug')
    .matches(/^[a-z0-9-]+$/)
    .withMessage('Invalid slug format'),
];

const filterValidation = [
  query('category')
    .optional()
    .isUUID()
    .withMessage('Invalid category ID'),
  query('difficulty')
    .optional()
    .isIn(['BEGINNER', 'EASY', 'MEDIUM', 'HARD', 'EXPERT'])
    .withMessage('Invalid difficulty level'),
  query('search')
    .optional()
    .isLength({ min: 1, max: 100 })
    .withMessage('Search term must be 1-100 characters'),
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 50 })
    .withMessage('Limit must be between 1 and 50'),
];

const codeSubmissionValidation = [
  body('code')
    .isLength({ min: 1, max: 10000 })
    .withMessage('Code must be 1-10000 characters'),
  body('language')
    .isIn(['javascript', 'python', 'java', 'cpp', 'c', 'csharp', 'go', 'rust'])
    .withMessage('Invalid programming language'),
];

// Public routes (no authentication required)
router.get('/', filterValidation, validateRequest, optionalAuth, asyncHandler(algorithmController.getAlgorithms));
router.get('/categories', asyncHandler(algorithmController.getCategories));
router.get('/slug/:slug', slugValidation, validateRequest, optionalAuth, asyncHandler(algorithmController.getAlgorithmBySlug));
router.get('/:algorithmId', algorithmIdValidation, validateRequest, optionalAuth, asyncHandler(algorithmController.getAlgorithmById));

// Protected routes (authentication required)
router.use(authenticateToken);

// Algorithm submissions
router.post('/:algorithmId/start', algorithmIdValidation, validateRequest, asyncHandler(algorithmController.startAlgorithm));
router.post('/:algorithmId/complete', algorithmIdValidation, validateRequest, asyncHandler(algorithmController.completeAlgorithm));
router.post('/:algorithmId/submit', algorithmIdValidation, codeSubmissionValidation, validateRequest, asyncHandler(algorithmController.submitCode));
router.get('/:algorithmId/submissions', algorithmIdValidation, validateRequest, asyncHandler(algorithmController.getAlgorithmSubmissions));

// Algorithm progress tracking
router.get('/:algorithmId/progress', algorithmIdValidation, validateRequest, asyncHandler(algorithmController.getAlgorithmProgress));

// Algorithm ratings
router.post('/:algorithmId/rate', algorithmIdValidation, validateRequest, asyncHandler(algorithmController.rateAlgorithm));

// Algorithm recommendations
router.get('/recommended', asyncHandler(algorithmController.getRecommendedAlgorithms));

export default router;
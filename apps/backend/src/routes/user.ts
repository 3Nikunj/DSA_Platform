import { Router } from 'express';
import { body, param, query } from 'express-validator';
import { asyncHandler } from '../middleware/errorHandler';
import { validateRequest } from '../middleware/validation';
import { authenticateToken, requireOwnership } from '../middleware/auth';
import * as userController from '../controllers/userController';

const router = Router();

// Validation rules
const updateProfileValidation = [
  body('firstName')
    .optional()
    .isLength({ min: 1, max: 50 })
    .withMessage('First name must be 1-50 characters'),
  body('lastName')
    .optional()
    .isLength({ min: 1, max: 50 })
    .withMessage('Last name must be 1-50 characters'),
  body('bio')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Bio must be less than 500 characters'),
  body('theme')
    .optional()
    .isIn(['light', 'dark'])
    .withMessage('Theme must be light or dark'),
  body('language')
    .optional()
    .isIn(['en', 'es', 'fr', 'de', 'zh', 'ja'])
    .withMessage('Invalid language'),
];

const userIdValidation = [
  param('userId')
    .isUUID()
    .withMessage('Invalid user ID format'),
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

// Profile routes
router.get('/profile', asyncHandler(userController.getProfile));
router.put('/profile', updateProfileValidation, validateRequest, asyncHandler(userController.updateProfile));
router.delete('/profile', asyncHandler(userController.deleteAccount));

// User lookup routes
router.get('/search', paginationValidation, validateRequest, asyncHandler(userController.searchUsers));
router.get('/:userId', userIdValidation, validateRequest, asyncHandler(userController.getUserById));

// Progress and statistics
router.get('/:userId/progress', userIdValidation, validateRequest, asyncHandler(userController.getUserProgress));
router.get('/:userId/achievements', userIdValidation, validateRequest, asyncHandler(userController.getUserAchievements));
router.get('/:userId/statistics', userIdValidation, validateRequest, asyncHandler(userController.getUserStatistics));

// Leaderboard
router.get('/leaderboard/xp', paginationValidation, validateRequest, asyncHandler(userController.getXPLeaderboard));
router.get('/leaderboard/level', paginationValidation, validateRequest, asyncHandler(userController.getLevelLeaderboard));

// Avatar upload
router.post('/avatar', asyncHandler(userController.uploadAvatar));
router.delete('/avatar', asyncHandler(userController.deleteAvatar));

// Preferences
router.get('/preferences', asyncHandler(userController.getPreferences));
router.put('/preferences', updateProfileValidation, validateRequest, asyncHandler(userController.updatePreferences));

export default router;
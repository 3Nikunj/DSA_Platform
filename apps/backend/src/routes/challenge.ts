import { Router } from 'express';
import { body, param, query } from 'express-validator';
import { asyncHandler } from '../middleware/errorHandler';
import { validateRequest } from '../middleware/validation';
import { authenticateToken, optionalAuth, requireVerified } from '../middleware/auth';
import * as challengeController from '../controllers/challengeController';

const router = Router();

// Validation rules
const challengeValidation = [
  body('title')
    .isLength({ min: 5, max: 100 })
    .withMessage('Title must be 5-100 characters'),
  body('description')
    .isLength({ min: 20, max: 2000 })
    .withMessage('Description must be 20-2000 characters'),
  body('difficulty')
    .isIn(['BEGINNER', 'EASY', 'MEDIUM', 'HARD', 'EXPERT'])
    .withMessage('Invalid difficulty level'),
  body('timeLimit')
    .isInt({ min: 1000, max: 300000 })
    .withMessage('Time limit must be between 1000ms and 300000ms'),
  body('memoryLimit')
    .isInt({ min: 16, max: 512 })
    .withMessage('Memory limit must be between 16MB and 512MB'),
  body('testCases')
    .isArray({ min: 1 })
    .withMessage('At least one test case is required'),
];

const challengeIdValidation = [
  param('challengeId')
    .isUUID()
    .withMessage('Invalid challenge ID format'),
];

const submissionValidation = [
  body('code')
    .isLength({ min: 1, max: 10000 })
    .withMessage('Code must be 1-10000 characters'),
  body('language')
    .isIn(['javascript', 'python', 'java', 'cpp', 'c', 'csharp', 'go', 'rust'])
    .withMessage('Invalid programming language'),
];

const filterValidation = [
  query('difficulty')
    .optional()
    .isIn(['BEGINNER', 'EASY', 'MEDIUM', 'HARD', 'EXPERT'])
    .withMessage('Invalid difficulty level'),
  query('status')
    .optional()
    .isIn(['active', 'completed', 'attempted'])
    .withMessage('Invalid status filter'),
  query('category')
    .optional()
    .isUUID()
    .withMessage('Invalid category ID'),
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

const competitionValidation = [
  body('title')
    .isLength({ min: 5, max: 100 })
    .withMessage('Title must be 5-100 characters'),
  body('description')
    .isLength({ min: 20, max: 1000 })
    .withMessage('Description must be 20-1000 characters'),
  body('startTime')
    .isISO8601()
    .withMessage('Start time must be in ISO 8601 format'),
  body('endTime')
    .isISO8601()
    .withMessage('End time must be in ISO 8601 format'),
  body('maxParticipants')
    .optional()
    .isInt({ min: 1, max: 10000 })
    .withMessage('Max participants must be between 1 and 10000'),
];

// Public routes (no authentication required)
router.get('/', filterValidation, validateRequest, optionalAuth, asyncHandler(challengeController.getChallenges));
router.get('/featured', asyncHandler(challengeController.getFeaturedChallenges));
router.get('/daily', optionalAuth, asyncHandler(challengeController.getDailyChallenge));
router.get('/:challengeId', challengeIdValidation, validateRequest, optionalAuth, asyncHandler(challengeController.getChallengeById));

// Competition routes (public)
router.get('/competitions/active', asyncHandler(challengeController.getActiveCompetitions));
router.get('/competitions/upcoming', asyncHandler(challengeController.getUpcomingCompetitions));
router.get('/competitions/:competitionId', param('competitionId').isUUID(), validateRequest, optionalAuth, asyncHandler(challengeController.getCompetitionById));
router.get('/competitions/:competitionId/leaderboard', param('competitionId').isUUID(), validateRequest, asyncHandler(challengeController.getCompetitionLeaderboard));

// Protected routes (authentication required)
router.use(authenticateToken);

// Challenge submission and attempts
router.post('/:challengeId/submit', challengeIdValidation, submissionValidation, validateRequest, asyncHandler(challengeController.submitSolution));
router.get('/:challengeId/attempts', challengeIdValidation, validateRequest, asyncHandler(challengeController.getChallengeAttempts));
router.get('/:challengeId/submissions', challengeIdValidation, validateRequest, asyncHandler(challengeController.getChallengeSubmissions));
router.get('/:challengeId/hints', challengeIdValidation, validateRequest, asyncHandler(challengeController.getChallengeHints));

// Challenge progress and statistics
router.get('/:challengeId/progress', challengeIdValidation, validateRequest, asyncHandler(challengeController.getChallengeProgress));
router.post('/:challengeId/start', challengeIdValidation, validateRequest, asyncHandler(challengeController.startChallenge));
router.post('/:challengeId/complete', challengeIdValidation, validateRequest, asyncHandler(challengeController.completeChallenge));

// User challenge history and statistics
router.get('/user/history', filterValidation, validateRequest, asyncHandler(challengeController.getUserChallengeHistory));
router.get('/user/statistics', asyncHandler(challengeController.getUserChallengeStatistics));
router.get('/user/achievements', asyncHandler(challengeController.getUserChallengeAchievements));

// Challenge bookmarks and favorites
router.post('/:challengeId/bookmark', challengeIdValidation, validateRequest, asyncHandler(challengeController.bookmarkChallenge));
router.delete('/:challengeId/bookmark', challengeIdValidation, validateRequest, asyncHandler(challengeController.removeBookmark));
router.get('/bookmarks', asyncHandler(challengeController.getUserBookmarks));

// Challenge recommendations
router.get('/recommendations/personalized', asyncHandler(challengeController.getPersonalizedRecommendations));
router.get('/recommendations/similar/:challengeId', challengeIdValidation, validateRequest, asyncHandler(challengeController.getSimilarChallenges));

// Competition participation (requires verified account)
router.use('/competitions', requireVerified);
router.post('/competitions/:competitionId/join', param('competitionId').isUUID(), validateRequest, asyncHandler(challengeController.joinCompetition));
router.post('/competitions/:competitionId/leave', param('competitionId').isUUID(), validateRequest, asyncHandler(challengeController.leaveCompetition));
router.get('/competitions/:competitionId/my-submissions', param('competitionId').isUUID(), validateRequest, asyncHandler(challengeController.getMyCompetitionSubmissions));

// Challenge creation and management (admin/premium features)
router.post('/create', challengeValidation, validateRequest, asyncHandler(challengeController.createChallenge));
router.put('/:challengeId', challengeIdValidation, challengeValidation, validateRequest, asyncHandler(challengeController.updateChallenge));
router.delete('/:challengeId', challengeIdValidation, validateRequest, asyncHandler(challengeController.deleteChallenge));

// Competition management
router.post('/competitions/create', competitionValidation, validateRequest, asyncHandler(challengeController.createCompetition));
router.put('/competitions/:competitionId', param('competitionId').isUUID(), competitionValidation, validateRequest, asyncHandler(challengeController.updateCompetition));
router.delete('/competitions/:competitionId', param('competitionId').isUUID(), validateRequest, asyncHandler(challengeController.deleteCompetition));

// Challenge testing and validation
router.post('/:challengeId/test', challengeIdValidation, submissionValidation, validateRequest, asyncHandler(challengeController.testSolution));
router.post('/:challengeId/validate', challengeIdValidation, validateRequest, asyncHandler(challengeController.validateChallenge));

// Challenge analytics and insights
router.get('/:challengeId/analytics', challengeIdValidation, validateRequest, asyncHandler(challengeController.getChallengeAnalytics));
router.get('/:challengeId/solutions', challengeIdValidation, validateRequest, asyncHandler(challengeController.getChallengeSolutions));

// Real-time challenge features
router.post('/:challengeId/live-session', challengeIdValidation, validateRequest, asyncHandler(challengeController.createLiveSession));
router.get('/:challengeId/live-session/:sessionId', challengeIdValidation, param('sessionId').isUUID(), validateRequest, asyncHandler(challengeController.joinLiveSession));

export default router;
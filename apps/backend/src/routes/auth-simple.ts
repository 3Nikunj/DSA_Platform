import { Router } from 'express';
import * as authController from '../controllers/authController-simple';
import { authenticateToken } from '../middleware/auth-simple';

const router = Router();

// Auth routes
router.post('/register', authController.register);
router.post('/login', authController.login);
router.get('/me', authenticateToken, authController.getCurrentUser);
router.post('/logout', authController.logout);

export default router;
import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { prisma } from '../config/database';
import { redisService } from '../config/redis';
import {
  AppError,
  AuthenticationError,
  ConflictError,
  NotFoundError,
  ValidationError,
} from '../middleware/errorHandler';
import {
  generateToken,
  generateRefreshToken,
  blacklistToken,
} from '../middleware/auth';
import { logger, loggers } from '../utils/logger';

/**
 * Register a new user
 */
export const register = async (req: Request, res: Response): Promise<void> => {
  const { email, username, password, firstName, lastName } = req.body;

  // Check if user already exists
  const existingUser = await prisma.user.findFirst({
    where: {
      OR: [
        { email },
        { username },
      ],
    },
  });

  if (existingUser) {
    if (existingUser.email === email) {
      throw new ConflictError('Email is already registered');
    }
    if (existingUser.username === username) {
      throw new ConflictError('Username is already taken');
    }
  }

  // Hash password
  const saltRounds = parseInt(process.env.BCRYPT_ROUNDS || '12');
  const hashedPassword = await bcrypt.hash(password, saltRounds);

  // Create user
  const user = await prisma.user.create({
    data: {
      email,
      username,
      password: hashedPassword,
      firstName,
      lastName,
    },
    select: {
      id: true,
      email: true,
      username: true,
      firstName: true,
      lastName: true,
      isVerified: true,
      createdAt: true,
    },
  });

  // Generate tokens
  const accessToken = generateToken({
    userId: user.id,
    email: user.email,
    username: user.username,
  });

  const refreshToken = generateRefreshToken({ userId: user.id });

  // Store refresh token in database
  await prisma.session.create({
    data: {
      userId: user.id,
      token: refreshToken,
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
    },
  });

  // Log registration
  loggers.auth('register', user.id, user.email, true);

  res.status(201).json({
    success: true,
    message: 'User registered successfully',
    data: {
      user,
      accessToken,
      refreshToken,
    },
  });
};

/**
 * Login user
 */
export const login = async (req: Request, res: Response): Promise<void> => {
  const { email, password } = req.body;

  // Find user
  const user = await prisma.user.findUnique({
    where: { email },
    select: {
      id: true,
      email: true,
      username: true,
      password: true,
      firstName: true,
      lastName: true,
      isActive: true,
      isVerified: true,
      isPremium: true,
      level: true,
      xp: true,
      lastLogin: true,
    },
  });

  if (!user) {
    loggers.auth('login', undefined, email, false, new Error('User not found'));
    throw new AuthenticationError('Invalid email or password');
  }

  if (!user.isActive) {
    loggers.auth('login', user.id, email, false, new Error('Account deactivated'));
    throw new AuthenticationError('Account has been deactivated');
  }

  // Verify password
  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    loggers.auth('login', user.id, email, false, new Error('Invalid password'));
    throw new AuthenticationError('Invalid email or password');
  }

  // Generate tokens
  const accessToken = generateToken({
    userId: user.id,
    email: user.email,
    username: user.username,
  });

  const refreshToken = generateRefreshToken({ userId: user.id });

  // Store refresh token in database
  await prisma.session.create({
    data: {
      userId: user.id,
      token: refreshToken,
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
    },
  });

  // Update last login
  await prisma.user.update({
    where: { id: user.id },
    data: { lastLogin: new Date() },
  });

  // Remove password from response
  const { password: _, ...userWithoutPassword } = user;

  // Log successful login
  loggers.auth('login', user.id, user.email, true);

  res.json({
    success: true,
    message: 'Login successful',
    data: {
      user: userWithoutPassword,
      accessToken,
      refreshToken,
    },
  });
};

/**
 * Refresh access token
 */
export const refreshToken = async (req: Request, res: Response): Promise<void> => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    throw new AuthenticationError('Refresh token is required');
  }

  // Verify refresh token
  const refreshSecret = process.env.JWT_REFRESH_SECRET;
  if (!refreshSecret) {
    throw new AppError('JWT_REFRESH_SECRET is not configured', 500, false);
  }

  let decoded: { userId: string };
  try {
    decoded = jwt.verify(refreshToken, refreshSecret) as { userId: string };
  } catch (error) {
    throw new AuthenticationError('Invalid refresh token');
  }

  // Check if refresh token exists in database
  const session = await prisma.session.findUnique({
    where: { token: refreshToken },
    include: {
      user: {
        select: {
          id: true,
          email: true,
          username: true,
          isActive: true,
        },
      },
    },
  });

  if (!session || session.expiresAt < new Date()) {
    throw new AuthenticationError('Refresh token has expired');
  }

  if (!session.user.isActive) {
    throw new AuthenticationError('Account has been deactivated');
  }

  // Generate new access token
  const accessToken = generateToken({
    userId: session.user.id,
    email: session.user.email,
    username: session.user.username,
  });

  res.json({
    success: true,
    message: 'Token refreshed successfully',
    data: {
      accessToken,
    },
  });
};

/**
 * Logout user
 */
export const logout = async (req: Request, res: Response): Promise<void> => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1];
  const { refreshToken } = req.body;

  // Blacklist access token
  if (token) {
    await blacklistToken(token);
  }

  // Remove refresh token from database
  if (refreshToken) {
    await prisma.session.deleteMany({
      where: { token: refreshToken },
    });
  }

  // Log logout
  if (req.user) {
    loggers.auth('logout', req.user.id, req.user.email, true);
  }

  res.json({
    success: true,
    message: 'Logout successful',
  });
};

/**
 * Get current user
 */
export const getCurrentUser = async (req: Request, res: Response): Promise<void> => {
  if (!req.user) {
    throw new AuthenticationError('User not authenticated');
  }

  // Get full user data
  const user = await prisma.user.findUnique({
    where: { id: req.user.id },
    select: {
      id: true,
      email: true,
      username: true,
      firstName: true,
      lastName: true,
      avatar: true,
      bio: true,
      theme: true,
      language: true,
      level: true,
      xp: true,
      coins: true,
      streak: true,
      isVerified: true,
      isPremium: true,
      createdAt: true,
      lastLogin: true,
    },
  });

  if (!user) {
    throw new NotFoundError('User not found');
  }

  res.json({
    success: true,
    data: { user },
  });
};

/**
 * Change password
 */
export const changePassword = async (req: Request, res: Response): Promise<void> => {
  if (!req.user) {
    throw new AuthenticationError('User not authenticated');
  }

  const { currentPassword, newPassword } = req.body;

  // Get user with password
  const user = await prisma.user.findUnique({
    where: { id: req.user.id },
    select: { id: true, password: true },
  });

  if (!user) {
    throw new NotFoundError('User not found');
  }

  // Verify current password
  const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password);
  if (!isCurrentPasswordValid) {
    throw new AuthenticationError('Current password is incorrect');
  }

  // Hash new password
  const saltRounds = parseInt(process.env.BCRYPT_ROUNDS || '12');
  const hashedNewPassword = await bcrypt.hash(newPassword, saltRounds);

  // Update password
  await prisma.user.update({
    where: { id: user.id },
    data: { password: hashedNewPassword },
  });

  // Invalidate all sessions
  await prisma.session.deleteMany({
    where: { userId: user.id },
  });

  // Log password change
  loggers.auth('change_password', user.id, req.user.email, true);

  res.json({
    success: true,
    message: 'Password changed successfully',
  });
};

/**
 * Forgot password
 */
export const forgotPassword = async (req: Request, res: Response): Promise<void> => {
  const { email } = req.body;

  const user = await prisma.user.findUnique({
    where: { email },
    select: { id: true, email: true },
  });

  // Always return success to prevent email enumeration
  if (!user) {
    res.json({
      success: true,
      message: 'If the email exists, a reset link has been sent',
    });
    return;
  }

  // Generate reset token
  const resetToken = crypto.randomBytes(32).toString('hex');
  const resetTokenExpiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

  // Store reset token in Redis
  await redisService.set(
    `password_reset:${resetToken}`,
    user.id,
    60 * 60 // 1 hour in seconds
  );

  // TODO: Send email with reset link
  // await sendPasswordResetEmail(user.email, resetToken);

  logger.info('Password reset requested', { userId: user.id, email: user.email });

  res.json({
    success: true,
    message: 'If the email exists, a reset link has been sent',
  });
};

/**
 * Reset password
 */
export const resetPassword = async (req: Request, res: Response): Promise<void> => {
  const { token, password } = req.body;

  // Get user ID from Redis
  const userId = await redisService.get(`password_reset:${token}`);
  if (!userId) {
    throw new AuthenticationError('Invalid or expired reset token');
  }

  // Hash new password
  const saltRounds = parseInt(process.env.BCRYPT_ROUNDS || '12');
  const hashedPassword = await bcrypt.hash(password, saltRounds);

  // Update password
  await prisma.user.update({
    where: { id: userId },
    data: { password: hashedPassword },
  });

  // Remove reset token
  await redisService.del(`password_reset:${token}`);

  // Invalidate all sessions
  await prisma.session.deleteMany({
    where: { userId },
  });

  // Log password reset
  loggers.auth('password_reset', userId, undefined, true);

  res.json({
    success: true,
    message: 'Password reset successfully',
  });
};

/**
 * Verify email
 */
export const verifyEmail = async (req: Request, res: Response): Promise<void> => {
  const { token } = req.params;

  // Get user ID from Redis
  const userId = await redisService.get(`email_verification:${token}`);
  if (!userId) {
    throw new AuthenticationError('Invalid or expired verification token');
  }

  // Update user verification status
  await prisma.user.update({
    where: { id: userId },
    data: { isVerified: true },
  });

  // Remove verification token
  await redisService.del(`email_verification:${token}`);

  // Log email verification
  loggers.auth('email_verified', userId, undefined, true);

  res.json({
    success: true,
    message: 'Email verified successfully',
  });
};

/**
 * Resend verification email
 */
export const resendVerification = async (req: Request, res: Response): Promise<void> => {
  if (!req.user) {
    throw new AuthenticationError('User not authenticated');
  }

  if (req.user.isVerified) {
    throw new ValidationError('Email is already verified');
  }

  // Generate verification token
  const verificationToken = crypto.randomBytes(32).toString('hex');

  // Store verification token in Redis
  await redisService.set(
    `email_verification:${verificationToken}`,
    req.user.id,
    24 * 60 * 60 // 24 hours in seconds
  );

  // TODO: Send verification email
  // await sendVerificationEmail(req.user.email, verificationToken);

  res.json({
    success: true,
    message: 'Verification email sent',
  });
};

// OAuth placeholder methods (to be implemented)
export const googleAuth = async (req: Request, res: Response): Promise<void> => {
  throw new AppError('Google OAuth not implemented yet', 501);
};

export const googleCallback = async (req: Request, res: Response): Promise<void> => {
  throw new AppError('Google OAuth not implemented yet', 501);
};

export const githubAuth = async (req: Request, res: Response): Promise<void> => {
  throw new AppError('GitHub OAuth not implemented yet', 501);
};

export const githubCallback = async (req: Request, res: Response): Promise<void> => {
  throw new AppError('GitHub OAuth not implemented yet', 501);
};
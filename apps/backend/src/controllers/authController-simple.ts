import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import * as jwt from 'jsonwebtoken';

// In-memory user storage (for development without database)
interface User {
  id: string;
  email: string;
  username: string;
  password: string;
  firstName?: string;
  lastName?: string;
  level: number;
  xp: number;
  coins: number;
  isActive: boolean;
  isVerified: boolean;
  isPremium: boolean;
  createdAt: Date;
  lastLogin?: Date;
}

const users: User[] = [];
let userIdCounter = 1;

// Helper functions
const generateToken = (payload: { userId: string; email: string; username: string }): string => {
  return jwt.sign(
    payload,
    process.env.JWT_SECRET || 'fallback-secret',
    { expiresIn: process.env.JWT_EXPIRES_IN || '24h' } as jwt.SignOptions
  );
};

const generateRefreshToken = (payload: { userId: string }): string => {
  return jwt.sign(
    payload,
    process.env.JWT_REFRESH_SECRET || 'fallback-refresh-secret',
    { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d' } as jwt.SignOptions
  );
};

// Register controller
export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, username, password, firstName, lastName } = req.body;

    // Basic validation
    if (!email || !username || !password) {
      res.status(400).json({
        error: 'Validation error',
        message: 'Email, username, and password are required'
      });
      return;
    }

    // Check if user already exists
    const existingUser = users.find(user => 
      user.email === email || user.username === username
    );

    if (existingUser) {
      res.status(400).json({
        error: 'User already exists',
        message: existingUser.email === email ? 'Email already registered' : 'Username already taken'
      });
      return;
    }

    // Hash password
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create user
    const user: User = {
      id: `user_${userIdCounter++}`,
      email,
      username,
      password: hashedPassword,
      firstName,
      lastName,
      level: 1,
      xp: 0,
      coins: 0,
      isActive: true,
      isVerified: false,
      isPremium: false,
      createdAt: new Date(),
    };

    users.push(user);

    // Generate tokens
    const token = generateToken({
      userId: user.id,
      email: user.email,
      username: user.username,
    });

    const refreshToken = generateRefreshToken({ userId: user.id });

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user;

    res.status(201).json({
      message: 'User registered successfully',
      user: userWithoutPassword,
      token,
      refreshToken,
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to register user'
    });
  }
};

// Login controller
export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    // Basic validation
    if (!email || !password) {
      res.status(400).json({
        error: 'Validation error',
        message: 'Email and password are required'
      });
      return;
    }

    // Find user
    const user = users.find(u => u.email === email);

    if (!user) {
      res.status(401).json({
        error: 'Authentication failed',
        message: 'Invalid email or password'
      });
      return;
    }

    if (!user.isActive) {
      res.status(401).json({
        error: 'Account disabled',
        message: 'Your account has been disabled. Please contact support.'
      });
      return;
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      res.status(401).json({
        error: 'Authentication failed',
        message: 'Invalid email or password'
      });
      return;
    }

    // Update last login
    user.lastLogin = new Date();

    // Generate tokens
    const token = generateToken({
      userId: user.id,
      email: user.email,
      username: user.username,
    });

    const refreshToken = generateRefreshToken({ userId: user.id });

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user;

    res.json({
      message: 'Login successful',
      user: userWithoutPassword,
      token,
      refreshToken,
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to login'
    });
  }
};

// Get current user
export const getCurrentUser = async (req: Request, res: Response): Promise<void> => {
  try {
    res.json({
      message: 'Profile endpoint - authentication middleware needed',
      totalUsers: users.length,
      users: users.map(u => ({ id: u.id, email: u.email, username: u.username }))
    });
  } catch (error) {
    console.error('Profile error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to get user profile'
    });
  }
};

// Logout
export const logout = async (req: Request, res: Response): Promise<void> => {
  try {
    res.json({
      message: 'Logout successful'
    });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to logout'
    });
  }
};
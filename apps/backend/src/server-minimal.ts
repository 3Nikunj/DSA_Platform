import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();
const PORT = parseInt(process.env.PORT || '5000', 10);

// Basic middleware
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
}));
app.use(compression());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Basic routes
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
  });
});

app.get('/api', (req, res) => {
  res.json({
    name: 'DSA Learning Platform API',
    version: '1.0.0',
    description: 'Backend API for DSA Learning Platform',
    endpoints: {
      health: '/health',
      api: '/api',
    },
  });
});

// Mock API endpoints for development
app.get('/api/algorithms', (req, res) => {
  res.json({
    success: true,
    data: [
      {
        id: '1',
        title: 'Binary Search',
        difficulty: 'MEDIUM',
        category: 'Searching',
        description: 'Find an element in a sorted array',
      },
      {
        id: '2',
        title: 'Quick Sort',
        difficulty: 'HARD',
        category: 'Sorting',
        description: 'Efficient sorting algorithm',
      },
    ],
  });
});

app.get('/api/progress/overview', (req, res) => {
  res.json({
    success: true,
    data: {
      totalAlgorithms: 150,
      completedAlgorithms: 25,
      completionRate: 16.7,
      currentStreak: 5,
      level: 3,
      experience: 750,
    },
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: 'Route not found',
    path: req.originalUrl,
  });
});

// Error handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Error:', err);
  res.status(500).json({
    success: false,
    error: 'Internal server error',
  });
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running on http://0.0.0.0:${PORT}`);
  console.log(`📚 DSA Learning Platform API`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`📊 Health check: http://0.0.0.0:${PORT}/health`);
  console.log(`📖 API info: http://0.0.0.0:${PORT}/api`);
});

export default app;
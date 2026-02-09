import app from './app';
import { prisma } from './app';
import { createClient } from 'redis';
import { redisClient } from './config/redis';

const PORT = parseInt(process.env.PORT || '5000', 10);
const HOST = process.env.HOST || '0.0.0.0';

// Initialize Redis client (optional)
let redis: any = null;
if (process.env.REDIS_URL) {
  redis = createClient({
    url: process.env.REDIS_URL,
  });

  redis.on('error', (err: Error) => {
    console.error('Redis Client Error:', err);
  });

  redis.on('connect', () => {
    console.log('Redis Client Connected');
  });
}

async function startServer() {
  try {
    // Connect to Redis (if configured)
    if (redis) {
      await redis.connect();
      console.log('✅ Redis connected successfully');
    } else {
      console.log('⚠️ Redis not configured, running without cache');
    }

    // Test database connection
    await prisma.$connect();
    console.log('✅ Database connected successfully');

    // Start the server
    const server = app.listen(PORT, HOST, () => {
      console.log(`🚀 Server running on http://${HOST}:${PORT}`);
      console.log(`📚 DSA Learning Platform API`);
      console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`📊 Health check: http://${HOST}:${PORT}/health`);
      console.log(`📖 API info: http://${HOST}:${PORT}/api`);
    });

    // Handle server shutdown
    const gracefulShutdown = async (signal: string) => {
      console.log(`\n${signal} received, shutting down gracefully...`);
      
      server.close(async () => {
        console.log('HTTP server closed');
        
        try {
          await prisma.$disconnect();
          console.log('Database connection closed');
          
          if (redisClient.isOpen) {
            await redisClient.quit();
            console.log('Redis connection closed');
          }
          
          console.log('Graceful shutdown completed');
          process.exit(0);
        } catch (error) {
          console.error('Error during shutdown:', error);
          process.exit(1);
        }
      });
    };

    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));

  } catch (error) {
    console.error('❌ Failed to start server:', error);
    
    // Cleanup on startup failure
    try {
      await prisma.$disconnect();
      if (redis) {
        await redis.quit();
      }
    } catch (cleanupError) {
      console.error('Error during cleanup:', cleanupError);
    }
    
    process.exit(1);
  }
}

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  process.exit(1);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

// Start the server
startServer();

export default app;
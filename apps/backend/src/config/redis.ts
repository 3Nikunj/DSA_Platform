import { createClient, RedisClientType } from 'redis';
import { logger } from '../utils/logger';

// Redis client configuration
const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';

const redisClient: RedisClientType = createClient({
  url: redisUrl,
  socket: {
    connectTimeout: 60000,
  },
});

// Redis event handlers
redisClient.on('connect', () => {
  logger.info('✅ Connected to Redis');
});

redisClient.on('ready', () => {
  logger.info('✅ Redis client ready');
});

redisClient.on('error', (error) => {
  logger.error('❌ Redis connection error:', error);
});

redisClient.on('end', () => {
  logger.info('Redis connection ended');
});

redisClient.on('reconnecting', () => {
  logger.info('🔄 Reconnecting to Redis...');
});

// Redis utility functions
export class RedisService {
  private client: RedisClientType;

  constructor(client: RedisClientType) {
    this.client = client;
  }

  // Set key-value with optional expiration
  async set(key: string, value: string | object, expireInSeconds?: number): Promise<void> {
    try {
      const serializedValue = typeof value === 'object' ? JSON.stringify(value) : value;
      
      if (expireInSeconds) {
        await this.client.setEx(key, expireInSeconds, serializedValue);
      } else {
        await this.client.set(key, serializedValue);
      }
    } catch (error) {
      logger.error(`Redis SET error for key ${key}:`, error);
      throw error;
    }
  }

  // Get value by key
  async get(key: string): Promise<string | null> {
    try {
      return await this.client.get(key);
    } catch (error) {
      logger.error(`Redis GET error for key ${key}:`, error);
      throw error;
    }
  }

  // Get and parse JSON value
  async getJSON<T>(key: string): Promise<T | null> {
    try {
      const value = await this.client.get(key);
      return value ? JSON.parse(value) : null;
    } catch (error) {
      logger.error(`Redis GET JSON error for key ${key}:`, error);
      throw error;
    }
  }

  // Delete key
  async del(key: string): Promise<number> {
    try {
      return await this.client.del(key);
    } catch (error) {
      logger.error(`Redis DEL error for key ${key}:`, error);
      throw error;
    }
  }

  // Check if key exists
  async exists(key: string): Promise<boolean> {
    try {
      const result = await this.client.exists(key);
      return result === 1;
    } catch (error) {
      logger.error(`Redis EXISTS error for key ${key}:`, error);
      throw error;
    }
  }

  // Set expiration for existing key
  async expire(key: string, seconds: number): Promise<boolean> {
    try {
      const result = await this.client.expire(key, seconds);
      return result === true;
    } catch (error) {
      logger.error(`Redis EXPIRE error for key ${key}:`, error);
      throw error;
    }
  }

  // Increment counter
  async incr(key: string): Promise<number> {
    try {
      return await this.client.incr(key);
    } catch (error) {
      logger.error(`Redis INCR error for key ${key}:`, error);
      throw error;
    }
  }

  // Add to set
  async sadd(key: string, ...members: string[]): Promise<number> {
    try {
      return await this.client.sAdd(key, members);
    } catch (error) {
      logger.error(`Redis SADD error for key ${key}:`, error);
      throw error;
    }
  }

  // Get set members
  async smembers(key: string): Promise<string[]> {
    try {
      return await this.client.sMembers(key);
    } catch (error) {
      logger.error(`Redis SMEMBERS error for key ${key}:`, error);
      throw error;
    }
  }

  // Remove from set
  async srem(key: string, ...members: string[]): Promise<number> {
    try {
      return await this.client.sRem(key, members);
    } catch (error) {
      logger.error(`Redis SREM error for key ${key}:`, error);
      throw error;
    }
  }

  // Hash operations
  async hset(key: string, field: string, value: string): Promise<number> {
    try {
      return await this.client.hSet(key, field, value);
    } catch (error) {
      logger.error(`Redis HSET error for key ${key}:`, error);
      throw error;
    }
  }

  async hget(key: string, field: string): Promise<string | undefined> {
    try {
      return await this.client.hGet(key, field);
    } catch (error) {
      logger.error(`Redis HGET error for key ${key}:`, error);
      throw error;
    }
  }

  async hgetall(key: string): Promise<Record<string, string>> {
    try {
      return await this.client.hGetAll(key);
    } catch (error) {
      logger.error(`Redis HGETALL error for key ${key}:`, error);
      throw error;
    }
  }

  // Flush all data (use with caution)
  async flushall(): Promise<string> {
    try {
      return await this.client.flushAll();
    } catch (error) {
      logger.error('Redis FLUSHALL error:', error);
      throw error;
    }
  }

  // Health check
  async ping(): Promise<string> {
    try {
      return await this.client.ping();
    } catch (error) {
      logger.error('Redis PING error:', error);
      throw error;
    }
  }
}

// Create Redis service instance
export const redisService = new RedisService(redisClient);

// Cache key generators
export const CacheKeys = {
  user: (userId: string) => `user:${userId}`,
  userProgress: (userId: string) => `progress:${userId}`,
  algorithm: (algorithmId: string) => `algorithm:${algorithmId}`,
  leaderboard: (type: string) => `leaderboard:${type}`,
  session: (sessionId: string) => `session:${sessionId}`,
  rateLimit: (ip: string) => `rate_limit:${ip}`,
  codeExecution: (executionId: string) => `execution:${executionId}`,
  challenge: (challengeId: string) => `challenge:${challengeId}`,
  userAchievements: (userId: string) => `achievements:${userId}`,
};

export { redisClient };
export default redisClient;
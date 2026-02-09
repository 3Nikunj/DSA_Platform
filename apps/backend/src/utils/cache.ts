/**
 * Cache utility functions (Redis-free implementation for Supabase)
 * Uses in-memory cache for development and can be extended to use Supabase edge functions
 */

// Simple in-memory cache implementation
class SimpleCache {
  private cache = new Map<string, { value: any; expires: number }>();

  async get(key: string): Promise<string | null> {
    const item = this.cache.get(key);
    if (!item) return null;

    if (Date.now() > item.expires) {
      this.cache.delete(key);
      return null;
    }

    return item.value;
  }

  async set(key: string, value: string, ttlSeconds?: number): Promise<void> {
    const expires = ttlSeconds
      ? Date.now() + ttlSeconds * 1000
      : Number.MAX_SAFE_INTEGER;
    this.cache.set(key, { value, expires });
  }

  async del(key: string): Promise<void> {
    this.cache.delete(key);
  }

  async delMany(keys: string[]): Promise<void> {
    keys.forEach(key => this.cache.delete(key));
  }

  async exists(key: string): Promise<number> {
    return this.cache.has(key) ? 1 : 0;
  }

  async expire(key: string, ttlSeconds: number): Promise<void> {
    const item = this.cache.get(key);
    if (item) {
      item.expires = Date.now() + ttlSeconds * 1000;
    }
  }

  async mget(keys: string[]): Promise<(string | null)[]> {
    return Promise.all(keys.map(key => this.get(key)));
  }

  async mset(keyValuePairs: string[]): Promise<void> {
    for (let i = 0; i < keyValuePairs.length; i += 2) {
      const key = keyValuePairs[i];
      const value = keyValuePairs[i + 1];
      if (key && value) {
        await this.set(key, value);
      }
    }
  }

  async incr(key: string): Promise<number> {
    const current = await this.get(key);
    const newValue = (parseInt(current || '0') + 1).toString();
    await this.set(key, newValue);
    return parseInt(newValue);
  }

  async decr(key: string): Promise<number> {
    const current = await this.get(key);
    const newValue = (parseInt(current || '0') - 1).toString();
    await this.set(key, newValue);
    return parseInt(newValue);
  }

  async keys(pattern: string): Promise<string[]> {
    const regex = new RegExp(pattern.replace('*', '.*'));
    return Array.from(this.cache.keys()).filter(key => regex.test(key));
  }

  // Clean up expired entries
  cleanup(): void {
    const now = Date.now();
    for (const [key, item] of this.cache.entries()) {
      if (now > item.expires) {
        this.cache.delete(key);
      }
    }
  }
}

// Create singleton instance
const redis = new SimpleCache();

/**
 * Cache utility functions for Redis operations (compatible interface)
 */
export class CacheService {
  /**
   * Get a value from cache
   */
  static async get<T>(key: string): Promise<T | null> {
    try {
      const value = await redis.get(key);
      return value ? JSON.parse(value) : null;
    } catch (error) {
      console.error(`Cache get error for key ${key}:`, error);
      return null;
    }
  }

  /**
   * Set a value in cache with optional TTL
   */
  static async set(
    key: string,
    value: any,
    ttlSeconds?: number
  ): Promise<boolean> {
    try {
      const serialized = JSON.stringify(value);
      await redis.set(key, serialized, ttlSeconds);
      return true;
    } catch (error) {
      console.error(`Cache set error for key ${key}:`, error);
      return false;
    }
  }

  /**
   * Delete a key from cache
   */
  static async del(key: string): Promise<boolean> {
    try {
      await redis.del(key);
      return true;
    } catch (error) {
      console.error(`Cache delete error for key ${key}:`, error);
      return false;
    }
  }

  /**
   * Delete multiple keys from cache
   */
  static async delMany(keys: string[]): Promise<boolean> {
    try {
      await redis.delMany(keys);
      return true;
    } catch (error) {
      console.error(
        `Cache delete many error for keys ${keys.join(', ')}:`,
        error
      );
      return false;
    }
  }

  /**
   * Check if a key exists in cache
   */
  static async exists(key: string): Promise<boolean> {
    try {
      const result = await redis.exists(key);
      return result === 1;
    } catch (error) {
      console.error(`Cache exists error for key ${key}:`, error);
      return false;
    }
  }

  /**
   * Set TTL for an existing key
   */
  static async expire(key: string, ttlSeconds: number): Promise<boolean> {
    try {
      await redis.expire(key, ttlSeconds);
      return true;
    } catch (error) {
      console.error(`Cache expire error for key ${key}:`, error);
      return false;
    }
  }

  /**
   * Get multiple keys at once
   */
  static async mget<T>(keys: string[]): Promise<(T | null)[]> {
    try {
      if (keys.length === 0) return [];
      const values = await redis.mget(keys);
      return values.map(value => (value ? JSON.parse(value) : null));
    } catch (error) {
      console.error(`Cache mget error for keys ${keys.join(', ')}:`, error);
      return keys.map(() => null);
    }
  }

  /**
   * Set multiple key-value pairs
   */
  static async mset(
    keyValuePairs: Record<string, any>,
    ttlSeconds?: number
  ): Promise<boolean> {
    try {
      const serializedPairs: string[] = [];
      Object.entries(keyValuePairs).forEach(([key, value]) => {
        serializedPairs.push(key, JSON.stringify(value));
      });

      await redis.mset(serializedPairs);

      // Set TTL for all keys if specified
      if (ttlSeconds) {
        const keys = Object.keys(keyValuePairs);
        await Promise.all(keys.map(key => redis.expire(key, ttlSeconds)));
      }

      return true;
    } catch (error) {
      console.error('Cache mset error:', error);
      return false;
    }
  }

  /**
   * Increment a numeric value in cache
   */
  static async incr(key: string): Promise<number | null> {
    try {
      return await redis.incr(key);
    } catch (error) {
      console.error(`Cache incr error for key ${key}:`, error);
      return null;
    }
  }

  /**
   * Decrement a numeric value in cache
   */
  static async decr(key: string): Promise<number | null> {
    try {
      return await redis.decr(key);
    } catch (error) {
      console.error(`Cache decr error for key ${key}:`, error);
      return null;
    }
  }

  /**
   * Get keys matching a pattern
   */
  static async keys(pattern: string): Promise<string[]> {
    try {
      return await redis.keys(pattern);
    } catch (error) {
      console.error(`Cache keys error for pattern ${pattern}:`, error);
      return [];
    }
  }

  /**
   * Clear all keys matching a pattern
   */
  static async clearPattern(pattern: string): Promise<boolean> {
    try {
      const keys = await redis.keys(pattern);
      if (keys.length > 0) {
        await redis.delMany(keys);
      }
      return true;
    } catch (error) {
      console.error(`Cache clear pattern error for pattern ${pattern}:`, error);
      return false;
    }
  }

  /**
   * Get cache info and statistics
   */
  static async info(): Promise<any> {
    try {
      return {
        keys: await redis.keys('*'),
        size: (redis as any).cache.size,
        memory: process.memoryUsage(),
      };
    } catch (error) {
      console.error('Cache info error:', error);
      return null;
    }
  }
}

/**
 * Cache key generators for consistent naming
 */
export const CacheKeys = {
  user: (userId: string) => `user:${userId}`,
  userProgress: (userId: string) => `user:${userId}:progress`,
  userStats: (userId: string) => `user:${userId}:stats`,
  algorithm: (algorithmId: string) => `algorithm:${algorithmId}`,
  algorithms: (filters?: string) => `algorithms${filters ? `:${filters}` : ''}`,
  categories: () => 'categories',
  challenge: (challengeId: string) => `challenge:${challengeId}`,
  challenges: (filters?: string) => `challenges${filters ? `:${filters}` : ''}`,
  dailyChallenge: (date: string) => `daily_challenge:${date}`,
  featuredChallenges: () => 'featured_challenges',
  leaderboard: (type: string, period?: string) =>
    `leaderboard:${type}${period ? `:${period}` : ''}`,
  competition: (competitionId: string) => `competition:${competitionId}`,
  competitionLeaderboard: (competitionId: string) =>
    `competition:${competitionId}:leaderboard`,
  rateLimit: (ip: string, endpoint: string) => `rate_limit:${ip}:${endpoint}`,
  session: (sessionId: string) => `session:${sessionId}`,
  blacklistedToken: (tokenId: string) => `blacklisted_token:${tokenId}`,
};

/**
 * Cache TTL constants (in seconds)
 */
export const CacheTTL = {
  SHORT: 5 * 60, // 5 minutes
  MEDIUM: 30 * 60, // 30 minutes
  LONG: 2 * 60 * 60, // 2 hours
  DAILY: 24 * 60 * 60, // 24 hours
  WEEKLY: 7 * 24 * 60 * 60, // 7 days
};

export default CacheService;

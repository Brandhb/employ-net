import { redis } from "@/lib/redis";
import { createLogger } from './logger';

const logger = createLogger('cache');

// ✅ Clears cached user activities when an activity is completed.
export async function clearUserActivityCache(userId: string) {
  const cacheKey = `user:activities:${userId}`;
  await redis.del(cacheKey);
}

export async function cacheGet<T>(key: string): Promise<T | null> {
  try {
    const data = await redis.get(key);
    return data as T;
  } catch (error) {
    logger.error('Cache get error:', error);
    return null;
  }
}

export async function cacheSet(key: string, value: any, expirationSeconds = 3600) {
  try {
    await redis.set(key, value, { ex: expirationSeconds });
    return true;
  } catch (error) {
    logger.error('Cache set error:', error);
    return false;
  }
}

export async function cacheDelete(key: string) {
  try {
    await redis.del(key);
    return true;
  } catch (error) {
    logger.error('Cache delete error:', error);
    return false;
  }
}

// Cache with automatic retry
export async function withCache<T>(
  key: string,
  fetchFn: () => Promise<T>,
  options = { ttl: 3600, retries: 3 }
): Promise<T> {
  try {
    // Try to get from cache first
    const cached = await cacheGet<T>(key);
    if (cached) return cached;

    // If not in cache, fetch and store
    const data = await fetchFn();
    await cacheSet(key, data, options.ttl);
    return data;
  } catch (error) {
    logger.error('Cache operation failed:', error);
    
    // Retry logic
    if (options.retries > 0) {
      logger.info(`Retrying cache operation. Attempts left: ${options.retries - 1}`);
      return withCache(key, fetchFn, { ...options, retries: options.retries - 1 });
    }
    
    // If all retries failed, fetch directly
    return fetchFn();
  }
}

export { redis };

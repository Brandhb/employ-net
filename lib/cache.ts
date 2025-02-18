import { redis } from "@/lib/redis";

// ✅ Clears cached user activities when an activity is completed.
export async function clearUserActivityCache(userId: string) {
  const cacheKey = `user:activities:${userId}`;
  await redis.del(cacheKey);
}

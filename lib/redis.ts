import { Redis as UpstashRedis } from "@upstash/redis";
import Redis from "ioredis";

// ✅ Keep @upstash/redis for REST API caching
export const redis = new UpstashRedis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

// ✅ Use ioredis for BullMQ / Queue Management
export const redisConnection = new Redis(process.env.UPSTASH_REDIS_URL!, {
  maxRetriesPerRequest: null, // Important for BullMQ
  enableReadyCheck: false, // Prevents waiting for a "ready" state
  tls: {
    rejectUnauthorized: false, // Required for Upstash
  },
});

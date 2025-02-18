import { Redis as UpstashRedis } from "@upstash/redis";
import Redis from "ioredis";

// ✅ Keep @upstash/redis for caching (REST API)
export const redis = new UpstashRedis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

// ✅ Use ioredis for BullMQ
export const redisConnection = new Redis(process.env.UPSTASH_REDIS_URL!, {
  tls: {
    rejectUnauthorized: false, // Required for Upstash
  },
});

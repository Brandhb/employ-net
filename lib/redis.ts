import { Redis as UpstashRedis } from "@upstash/redis";
import Redis from "ioredis";

// ✅ Keep Upstash Redis (REST API) for caching
export const redis = new UpstashRedis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

// ✅ Use ioredis for BullMQ with required options

export const redisConnection = new Redis(process.env.UPSTASH_REDIS_URL!, {
  maxRetriesPerRequest: null, // ✅ Required for BullMQ
  enableReadyCheck: false,    // ✅ Avoids unnecessary Redis readiness checks
  tls: {
    rejectUnauthorized: false, // ✅ Required for Upstash SSL
  },
});

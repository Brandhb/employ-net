import { Redis } from "@upstash/redis";

// ✅ Initialize Redis (Make sure you configure environment variables)
export const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});
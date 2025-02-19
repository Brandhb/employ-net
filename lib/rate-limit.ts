import { Ratelimit } from "@upstash/ratelimit";
import { redis } from "@/lib/redis";

// ✅ Create different rate limiters
export const generalRateLimit = new Ratelimit({
  redis,
  limiter: Ratelimit.fixedWindow(25, "1m"), // 30 requests per 1 min (more generous)
  analytics: true,
});

export const apiRateLimit = new Ratelimit({
  redis,
  limiter: Ratelimit.fixedWindow(25, "1m"), // Increased to 20 requests per min
  analytics: true,
});

export const adminRateLimit = new Ratelimit({
  redis,
  limiter: Ratelimit.fixedWindow(35, "1m"), // More relaxed for admins
  analytics: true,
});


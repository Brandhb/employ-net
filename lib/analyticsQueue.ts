import { Queue } from "bullmq";
import { redisConnection } from "@/lib/redis";

// ✅ Use Upstash (ioredis) for BullMQ Queue
export const analyticsQueue = new Queue("analytics-refresh", {
  connection: redisConnection,
});

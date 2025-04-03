import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { redis } from "@/lib/cache";
import { createLogger } from "@/lib/logger";

const logger = createLogger("health-check");

export async function GET() {
  try {
    const healthStatus = {
      status: "healthy",
      timestamp: new Date().toISOString(),
      services: {
        database: "unknown",
        cache: "unknown",
      },
      uptime: process.uptime(),
      memory: process.memoryUsage(),
    };

    // Check database connection
    try {
      await prisma.$queryRaw`SELECT 1`;
      healthStatus.services.database = "healthy";
    } catch (error) {
      healthStatus.services.database = "unhealthy";
      healthStatus.status = "degraded";
      logger.error("Database health check failed:", error);
    }

    // Check Redis connection
    try {
      await redis.ping();
      healthStatus.services.cache = "healthy";
    } catch (error) {
      healthStatus.services.cache = "unhealthy";
      healthStatus.status = "degraded";
      logger.error("Cache health check failed:", error);
    }

    return NextResponse.json(healthStatus, {
      status: healthStatus.status === "healthy" ? 200 : 503,
    });
  } catch (error) {
    logger.error("Health check failed:", error);
    return NextResponse.json(
      {
        status: "unhealthy",
        timestamp: new Date().toISOString(),
        error: "Service unavailable",
      },
      { status: 503 }
    );
  }
}
"use server";

import { prisma } from "@/lib/prisma";
import { redis } from "@/lib/redis";

interface AnalyticsData {
  totalRevenue: number;
  adImpressions: number;
  adClicks: number;
  completionRate: number;
  averageEngagement: number;
}

const CACHE_KEY = "analytics:data";
const CACHE_EXPIRATION = 600; // 10 minutes

export async function fetchAnalyticsData(): Promise<AnalyticsData | null> {
  try {
    // ✅ Check if analytics data is already in Redis
    const cachedData = await redis.get(CACHE_KEY);
    if (cachedData) {
      console.log("🚀 Returning cached analytics data");
      return cachedData as AnalyticsData;
    }

    console.log("📩 Fetching analytics from DB...");

    // ✅ Fetch analytics from the database
    const [
      adInteractions,
      activities,
      completedActivities,
      totalEngagement,
    ] = await Promise.all([
      prisma.adInteraction.count(),
      prisma.activity.count(),
      prisma.activity.count({ where: { status: "completed" } }),
      prisma.adInteraction.aggregate({
        _avg: { duration: true },
      }),
    ]);

    const analyticsData: AnalyticsData = {
      totalRevenue: 0, // Update this based on your revenue model
      adImpressions: adInteractions,
      adClicks: 0, // Update based on click tracking logic
      completionRate: activities > 0 ? (completedActivities / activities) * 100 : 0,
      averageEngagement: totalEngagement._avg.duration || 0,
    };

    // ✅ Store in Redis for 10 minutes
    await redis.set(CACHE_KEY, analyticsData, { ex: CACHE_EXPIRATION });

    return analyticsData;
  } catch (error) {
    console.error("❌ Error fetching analytics:", error);
    return null;
  }
}

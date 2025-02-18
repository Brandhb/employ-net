"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";

interface AnalyticsData {
  totalRevenue: number;
  adImpressions: number;
  adClicks: number;
  completionRate: number;
  averageEngagement: number;
}

import { cache } from "react";

// ✅ Cache analytics data to reduce redundant DB queries
export const fetchAnalyticsData = cache(async (): Promise<AnalyticsData | null> => {
  try {
    const { userId } = await auth(); // Ensure authenticated user

    if (!userId) {
      console.error("⛔ Unauthorized request - Missing userId");
      return null;
    }

    console.log("🔹 Fetching analytics data for:", userId);

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

    return {
      totalRevenue: 0, // Calculate based on your revenue model
      adImpressions: adInteractions,
      adClicks: 0, // Calculate from click interactions
      completionRate: activities > 0 ? (completedActivities / activities) * 100 : 0,
      averageEngagement: totalEngagement._avg.duration || 0,
    };
  } catch (error) {
    console.error("❌ Error fetching analytics:", error);
    return null;
  }
});


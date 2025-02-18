"use server";

import { prisma } from "@/lib/prisma";
import { clerkClient } from "@clerk/nextjs/server";
import { redis } from "@/lib/redis";
import { qstash } from "../lib/qstash";
import { ActivityLog } from "@/types";

export async function getActivities(userId: string) {
  const cacheKey = `activities:active`;

  // ✅ Check Redis cache first
  const cachedActivities = await redis.get(cacheKey);
  if (cachedActivities) {
    console.log("🚀 Returning cached activities");
    return cachedActivities;
  }

  console.log("📩 Fetching activities from DB...");
  const activities = await prisma.activity.findMany({
    where: { status: "active" },
    orderBy: { createdAt: "desc" },
  });

  // ✅ Store in Redis with expiration (10 minutes)
  await redis.set(cacheKey, activities, { ex: 600 });

  return activities;
}

export async function getActivityById(activityId: string) {
  return prisma.activity.findUnique({
    where: { id: activityId },
  });
}

export async function getRecentActivities(userId: string, limit = 5): Promise<ActivityLog[]> {
  const cacheKey = `user:${userId}:recentActivities`;

  // ✅ Check Redis cache first
  const cachedData = await redis.get(cacheKey);
  if (cachedData && Array.isArray(cachedData)) {
    console.log("🚀 Returning cached recent activities");
    return cachedData;
  }

  console.log("📩 Fetching recent activities from DB...");
  const user = await prisma.user.findUnique({
    where: { employClerkUserId: userId },
  });

  if (!user) {
    console.error("⛔ User not found in DB");
    return [];
  }

  const activities = await prisma.activityLog.findMany({
    where: { userId: user.id },
    include: { activity: true },
    orderBy: { createdAt: "desc" },
    take: limit,
  });

  // ✅ Ensure return type is always an array
  if (!Array.isArray(activities)) return [];

  // ✅ Store in Redis with expiration (5 minutes)
  await redis.set(cacheKey, activities, { ex: 300 });

  return activities as ActivityLog[];
}


interface UserStats {
  points: number;
  completedActivities: number;
  earnings: number;
}

export async function getUserStats(userId: string): Promise<UserStats> {
  const cacheKey = `user:${userId}:stats`;

  // ✅ Check Redis cache first
  const cachedStats = await redis.get(cacheKey);
  if (cachedStats) {
    console.log("🚀 Returning cached user stats");
    return cachedStats as UserStats;
  }

  console.log("📩 Fetching user stats from DB...");
  const user = await prisma.user.findUnique({
    where: {
      employClerkUserId: userId,
    },
    select: {
      points_balance: true,
      _count: {
        select: {
          activities: {
            where: { status: "completed" },
          },
        },
      },
    },
  });

  const totalEarnings = await prisma.payout.aggregate({
    where: {
      user: { employClerkUserId: userId },
      status: "completed",
    },
    _sum: { amount: true },
  });

  // ✅ Ensure return object always has values
  const stats = {
    points: user?.points_balance ?? 0,
    completedActivities: user?._count.activities ?? 0,
    earnings: totalEarnings._sum.amount ?? 0,
  };

  // ✅ Store in Redis with expiration (10 minutes)
  await redis.set(cacheKey, stats, { ex: 600 });

  return stats;
}

export async function queueCompleteActivity(
  userId: string,
  activityId: string
) {
  await qstash.publishJSON({
    url: `${process.env.NEXT_PUBLIC_BASE_URL}/api/qstash-complete-activity`,
    body: { userId, activityId },
  });

  console.log(
    `✅ Queued activity completion for user ${userId}, activity ${activityId}`
  );
  return { success: true, message: "Activity completion request queued." };
}

export async function getActivityStats(userId: string) {
  const user = await prisma.user.findUnique({
    where: { employClerkUserId: userId },
  });

  if (!user) throw new Error("User not found");

  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const activities = await prisma.activityLog.findMany({
    where: {
      userId: user.id,
      createdAt: {
        gte: startOfMonth,
      },
    },
    select: {
      createdAt: true,
      metadata: true,
    },
    orderBy: {
      createdAt: "asc",
    },
  });

  // Group activities by date and calculate stats
  const stats = activities.reduce(
    (acc, activity) => {
      const date = activity.createdAt
        ? new Date(activity.createdAt).toISOString().split("T")[0]
        : "";

      if (!acc[date] && activity.createdAt) {
        acc[date] = {
          createdAt: activity.createdAt,
          _count: 0,
          points: 0,
        };
      }
      acc[date]._count += 1;
      acc[date].points += (activity.metadata as any)?.points || 0;
      return acc;
    },
    {} as Record<
      string,
      {
        [x: string]: any;
        createdAt: Date;
        _count: number;
        points: number;
      }
    >
  );

  return Object.values(stats);
}

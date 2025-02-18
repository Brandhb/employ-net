"use server";

import { prisma } from "@/lib/prisma";
import { Activity, ActivityData } from "@/types";
import { auth, clerkClient } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { cache } from "react";
import {
  AdminAnalytics,
  AdminNotificationPreferences,
  AdminUser,
  CreateActivityData,
  CreateActivityResponse,
  NotificationPreferences,
} from "../lib/types/admin";
import { redis } from "@/lib/redis";
import * as Sentry from "@sentry/nextjs";

interface User {
  id: string;
  name: string | null;
  email: string;
  status: string;
  points: number;
  joinedAt: Date;
  verificationStatus: string;
}


// ✅ Ensure User is an Admin
export async function requireAdminAuth(): Promise<string> {
  const { userId } = await auth();
  if (!userId) throw new Error("No User");

  const { users } = await clerkClient();
  const user = await users.getUser(userId);

  if (user.publicMetadata.role !== "admin") {
    throw new Error("Unauthorized as admin");
  }

  return userId;
}

// ✅ Ensure User is Authenticated
export async function requireAuthUser(): Promise<string> {
  const { userId } = await auth();
  if (!userId) {
    throw new Error("Unauthorized: User not found");
  }
  return userId;
}

const adminCache = new Map<string, any>();
const adminAnalyticsCache = new Map<string, any>();

const ADMIN_USERS_CACHE_KEY = "adminUsers";
const CACHE_EXPIRATION = 300; // 5 minutes

export async function getAdminUsers() {
  await requireAdminAuth();

  // ✅ Check Redis cache
  const cachedUsers = await redis.get(ADMIN_USERS_CACHE_KEY);
  if (cachedUsers) {
    console.log("✅ Returning cached admin users");
    return cachedUsers;
  }

  // ✅ Fetch from DB if not in cache
  const users = await prisma.user.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      verification_status: true,
      points_balance: true,
      createdAt: true,
    },
    orderBy: { createdAt: "desc" },
  });

  const formattedUsers = users.map((user) => ({
    id: user.id,
    name: user.name,
    email: user.email || "",
    status: user.verification_status === "verified" ? "active" : "inactive",
    points: user.points_balance || 0,
    joinedAt: user.createdAt,
    verificationStatus: user.verification_status || "",
  }));

  await redis.set(ADMIN_USERS_CACHE_KEY, formattedUsers, { ex: CACHE_EXPIRATION });

  return formattedUsers;
}


// ✅ Function to clear cache when updating users
export async function clearAdminUsersCache() {
  await redis.del(ADMIN_USERS_CACHE_KEY);
}

const DASHBOARD_CACHE_KEY = "adminDashboardStats";
const DASHBOARD_CACHE_EXPIRATION = 300; // 5 minutes

export async function getAdminDashboardStatsBothWebsites() {
  await requireAdminAuth();

  // ✅ Check cache first
  const cachedStats = await redis.get(DASHBOARD_CACHE_KEY);
  if (cachedStats) {
    console.log("✅ Returning cached dashboard stats");
    return cachedStats;
  }

  // ✅ Fetch from DB
  const [
    totalUsers,
    activeActivities,
    pendingPayouts,
    totalIssues,
    recentUsers,
    userGrowthRaw,
    activityCompletionRateRaw,
    revenueGrowthRaw,
  ] = await prisma.$transaction([
    prisma.user.count(),
    prisma.activity.count({ where: { status: "active" } }),
    prisma.payout.count({ where: { status: "pending" } }),

    prisma.$queryRaw<{ count: number }[]>`
      SELECT COUNT(*) as count FROM (
        SELECT id FROM activities WHERE status = 'error'
        UNION
        SELECT id FROM payouts WHERE status = 'rejected'
      ) as issues
    `,

    prisma.user.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        email: true,
        verification_status: true,
        createdAt: true,
      },
    }),

    prisma.$queryRaw<{ growth: number }[]>`
      SELECT COALESCE(
        ROUND(
          ((COUNT(*) FILTER (WHERE created_at >= NOW() - INTERVAL '1 month')::DECIMAL / 
            NULLIF(COUNT(*) FILTER (WHERE created_at >= NOW() - INTERVAL '2 month' 
              AND created_at < NOW() - INTERVAL '1 month'), 0)) - 1) * 100, 
          1
        ), 0
      ) as growth
      FROM users
    `,

    prisma.$queryRaw<{ rate: number }[]>`
      SELECT COALESCE(
        ROUND(
          (COUNT(*) FILTER (WHERE status = 'completed')::DECIMAL / NULLIF(COUNT(*), 0)) * 100, 
          1
        ), 0
      ) as rate
      FROM activities
    `,

    prisma.$queryRaw<{ growth: number }[]>`
      SELECT COALESCE(
        ROUND(
          ((SUM(amount) FILTER (WHERE created_at >= NOW() - INTERVAL '1 month')::DECIMAL / 
            NULLIF(SUM(amount) FILTER (WHERE created_at >= NOW() - INTERVAL '2 month' 
              AND created_at < NOW() - INTERVAL '1 month'), 0)) - 1) * 100, 
          1
        ), 0
      ) as growth
      FROM payouts
      WHERE status = 'completed'
    `,
  ]);

  const stats = {
    totalUsers,
    activeActivities,
    pendingPayouts,
    totalIssues: Number(totalIssues[0]?.count || 0),
    recentUsers,
    userGrowth: Number(userGrowthRaw[0]?.growth || 0),
    activityCompletionRate: Number(activityCompletionRateRaw[0]?.rate || 0),
    revenueGrowth: Number(revenueGrowthRaw[0]?.growth || 0),
  };

  await redis.set(DASHBOARD_CACHE_KEY, stats, { ex: DASHBOARD_CACHE_EXPIRATION });

  return stats;
}

// ✅ Cached Single Website Dashboard Stats
export async function getAdminDashboardStats() {
  if (adminCache.has("singleAdminDashboardStats")) {
    console.log("✅ Returning cached single admin dashboard stats");
    return adminCache.get("singleAdminDashboardStats");
  }

  await requireAdminAuth();

  const [
    totalUsers,
    activeActivities,
    pendingPayouts,
    totalIssues,
    recentUsers,
    userGrowthRaw,
    activityCompletionRateRaw,
    revenueGrowthRaw,
  ] = await prisma.$transaction([
    prisma.user.count({ where: { employClerkUserId: { not: null } } }),
    prisma.activity.count({
      where: { status: "active", user: { employClerkUserId: { not: null } } },
    }),
    prisma.payout.count({
      where: { status: "pending", user: { employClerkUserId: { not: null } } },
    }),

    prisma.$queryRaw<{ count: number }[]>`
      SELECT COUNT(*) as count
      FROM (
        SELECT id FROM activities WHERE status = 'error' 
          AND user_id IN (SELECT id FROM users WHERE "employClerkUserId" IS NOT NULL)
        UNION ALL
        SELECT id FROM payouts WHERE status = 'rejected' 
          AND user_id IN (SELECT id FROM users WHERE "employClerkUserId" IS NOT NULL)
      ) as issues
    `,

    prisma.user.findMany({
      where: { employClerkUserId: { not: null } },
      take: 5,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        email: true,
        verification_status: true,
        createdAt: true,
      },
    }),

    prisma.$queryRaw<{ growth: number }[]>`
      SELECT COALESCE(
        ROUND(
          ((COUNT(*) FILTER (WHERE created_at >= NOW() - INTERVAL '1 month' AND "employClerkUserId" IS NOT NULL)::DECIMAL / 
            NULLIF(COUNT(*) FILTER (WHERE created_at >= NOW() - INTERVAL '2 month' 
              AND created_at < NOW() - INTERVAL '1 month' AND "employClerkUserId" IS NOT NULL), 0)) - 1) * 100, 
          1
        ), 0
      ) as growth
      FROM users
    `,

    prisma.$queryRaw<{ rate: number }[]>`
      SELECT COALESCE(
        ROUND(
          (COUNT(*) FILTER (WHERE status = 'completed' 
            AND user_id IN (SELECT id FROM users WHERE "employClerkUserId" IS NOT NULL))::DECIMAL / 
            NULLIF(COUNT(*), 0)) * 100, 
          1
        ), 0
      ) as rate
      FROM activities
    `,

    prisma.$queryRaw<{ growth: number }[]>`
      SELECT COALESCE(
        ROUND(
          ((SUM(amount) FILTER (WHERE created_at >= NOW() - INTERVAL '1 month' 
            AND user_id IN (SELECT id FROM users WHERE "employClerkUserId" IS NOT NULL))::DECIMAL / 
            NULLIF(SUM(amount) FILTER (WHERE created_at >= NOW() - INTERVAL '2 month' 
              AND created_at < NOW() - INTERVAL '1 month' 
              AND user_id IN (SELECT id FROM users WHERE "employClerkUserId" IS NOT NULL)), 0)) - 1) * 100, 
          1
        ), 0
      ) as growth
      FROM payouts
      WHERE status = 'completed'
    `,
  ]);

  const stats = {
    totalUsers,
    activeActivities,
    pendingPayouts,
    totalIssues: Number(totalIssues[0]?.count || 0),
    recentUsers,
    userGrowth: Number(userGrowthRaw[0]?.growth || 0),
    activityCompletionRate: Number(activityCompletionRateRaw[0]?.rate || 0),
    revenueGrowth: Number(revenueGrowthRaw[0]?.growth || 0),
  };

  adminCache.set("singleAdminDashboardStats", stats);
  setTimeout(
    () => adminCache.delete("singleAdminDashboardStats"),
    5 * 60 * 1000
  ); // Cache expires in 5 min

  return stats;
}

interface AdminSettings {
  id: string;
  email: string;
  notificationPreferences: {
    dailySummary: boolean;
    urgentAlerts: boolean;
  };
  adminNotificationPreferences: {
    payoutNotifications: boolean;
    verificationNotifications: boolean;
    systemAlerts: boolean;
  };
}


// ✅ Cache admin settings to reduce DB load
const ADMIN_SETTINGS_CACHE_KEY = "adminSettings";
const ADMIN_SETTINGS_CACHE_EXPIRATION = 600; // 10 minutes

export async function getAdminSettings():Promise<AdminSettings> {
  await requireAdminAuth();

  // ✅ Check cache first
  const cachedSettings = await redis.get(ADMIN_SETTINGS_CACHE_KEY);
  if (cachedSettings) {
    console.log("✅ Returning cached admin settings");
    return cachedSettings as AdminSettings;
  }
  const { userId } = await auth(); 

  // ✅ Fetch from DB
  const user = await prisma.user.findUniqueOrThrow({
    where: { employClerkUserId: userId || "" },
    select: {
      id: true,
      email: true,
      notificationPreferences: true,
      adminNotificationPreferences: true,
    },
  });

  const settings = {
    ...user,
    notificationPreferences: user.notificationPreferences
      ? JSON.parse(user.notificationPreferences.toLocaleString())
      : { dailySummary: true, urgentAlerts: true },

    adminNotificationPreferences: user.adminNotificationPreferences
      ? JSON.parse(user.adminNotificationPreferences.toLocaleString())
      : { payoutNotifications: true, verificationNotifications: true, systemAlerts: true },
  };

  await redis.set(ADMIN_SETTINGS_CACHE_KEY, settings, { ex: ADMIN_SETTINGS_CACHE_EXPIRATION });

  return settings as AdminSettings;
}

// ✅ Clear cache after updating admin settings
export async function updateAdminSettings(newSettings: any) {
  await requireAdminAuth();
  const { userId } = await auth(); 

  await prisma.user.update({
    where: { employClerkUserId: userId || "" },
    data: { adminNotificationPreferences: JSON.stringify(newSettings) },
  });

  await redis.del(ADMIN_SETTINGS_CACHE_KEY);
}


////////--------/

const ANALYTICS_BOTH_CACHE_KEY = "admin:analytics:both";
const ANALYTICS_BOTH_CACHE_EXPIRATION = 600; // 10 minutes

export async function getAdminAnalyticsBothWebsites(): Promise<AdminAnalytics> {
  await requireAdminAuth();

  // ✅ Check Redis cache first
  const cachedData = await redis.get(ANALYTICS_BOTH_CACHE_KEY);
  if (cachedData && typeof cachedData === "object") {
    console.log("✅ Returning cached admin analytics (Both Websites)");
    return cachedData as AdminAnalytics;
  }

  const [userStats, activityStats, payoutStats] = await prisma.$transaction([
    prisma.user.groupBy({
      by: ["verification_status"],
      _count: { id: true },
      orderBy: { verification_status: "asc" },
    }),

    prisma.activity.groupBy({
      by: ["status", "type"],
      _count: { id: true },
      _sum: { points: true },
      orderBy: { status: "asc" },
    }),

    prisma.payout.groupBy({
      by: ["status"],
      _count: { id: true },
      _sum: { amount: true },
      orderBy: { status: "asc" },
    }),
  ]);

  const analyticsData = {
    users: userStats.map((user) => ({
      verificationStatus: user.verification_status ?? "unknown",
      _count: (user._count as {id?: number})?.id ?? 0,
      createdAt: new Date(),
    })),

    activities: activityStats.map((activity) => ({
      type: activity.type ?? "unknown",
      status: activity.status ?? "unknown",
      _count: (activity._count as {id?: number})?.id ?? 0,
      _sum: { points: activity._sum?.points ?? 0 },
      metadata: {},
    })),

    payouts: payoutStats.map((payout) => ({
      status: payout.status ?? "unknown",
      _count: (payout._count as {id?: number})?.id ?? 0,
      _sum: { amount: payout._sum?.amount ?? 0 },
      created_at: new Date(),
    })),
  };

  // ✅ Store result in Redis with expiration
  await redis.set(ANALYTICS_BOTH_CACHE_KEY, analyticsData, { ex: ANALYTICS_BOTH_CACHE_EXPIRATION });

  return analyticsData;
}

export async function getAdminAnalytics(): Promise<AdminAnalytics> {
  // ✅ Check cache first to reduce load
  if (adminAnalyticsCache.has("analytics")) {
    console.log("✅ Returning cached admin analytics");
    return adminAnalyticsCache.get("analytics");
  }

  await requireAdminAuth();

  // ✅ Fetch data safely using individual Prisma queries instead of `groupBy`
  const [userStats, activityStats, payoutStats] = await prisma.$transaction([
    prisma.user.findMany({
      where: { employClerkUserId: { not: null } },
      select: { verification_status: true },
    }),

    prisma.activity.findMany({
      where: { user: { employClerkUserId: { not: null } } },
      select: { status: true, type: true, points: true },
    }),

    prisma.payout.findMany({
      where: { user: { employClerkUserId: { not: null } } },
      select: { status: true, amount: true },
    }),
  ]);

  // ✅ Process user verification stats manually
  const userVerificationCounts = userStats.reduce<Record<string, number>>(
    (acc, user) => {
      const status = user.verification_status || "unknown";
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    },
    {}
  );

  // ✅ Process activity stats manually
  const activityData = activityStats.reduce<
    Record<string, { count: number; points: number }>
  >((acc, activity) => {
    const key = `${activity.status}_${activity.type}`;
    if (!acc[key]) {
      acc[key] = { count: 0, points: 0 };
    }
    acc[key].count += 1;
    acc[key].points += activity.points ?? 0;
    return acc;
  }, {});

  // ✅ Process payout stats manually
  const payoutData = payoutStats.reduce<
    Record<string, { count: number; amount: number }>
  >((acc, payout) => {
    const status = payout.status || "unknown";
    if (!acc[status]) {
      acc[status] = { count: 0, amount: 0 };
    }
    acc[status].count += 1;
    acc[status].amount += payout.amount ?? 0;
    return acc;
  }, {});

  // ✅ Format results safely
  const analyticsData = {
    users: Object.entries(userVerificationCounts).map(([status, count]) => ({
      verificationStatus: status,
      _count: count,
      createdAt: new Date(), // Placeholder as `groupBy` does not return `createdAt`
    })),

    activities: Object.entries(activityData).map(([key, data]) => {
      const [status, type] = key.split("_");
      return {
        type,
        status,
        _count: data.count,
        _sum: { points: data.points },
        metadata: {},
      };
    }),

    payouts: Object.entries(payoutData).map(([status, data]) => ({
      status,
      _count: data.count,
      _sum: { amount: data.amount },
      created_at: new Date(), // Placeholder, since `groupBy` doesn't return `createdAt`
    })),
  };

  // ✅ Cache the result for 10 minutes
  adminAnalyticsCache.set("analytics", analyticsData);
  setTimeout(() => adminAnalyticsCache.delete("analytics"), 10 * 60 * 1000);

  return analyticsData;
}

export async function getPayoutRequests() {
  await requireAdminAuth();

  // ✅ Fetch payout requests efficiently
  const payouts = await prisma.payout.findMany({
    where: { status: { in: ["pending", "processing"] } },
    include: {
      user: {
        select: {
          email: true,
          full_name: true,
          bankAccounts: {
            select: {
              bankName: true,
              accountNumber: true,
              accountHolderName: true,
              bsb: true,
            },
          },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  // ✅ Ensure safe data formatting
  return payouts.map((payout) => ({
    ...payout,
    status: payout.status || "pending",
    createdAt: payout.createdAt || new Date(),
    user: {
      email: payout.user?.email || "No email",
      full_name: payout.user?.full_name || "Anonymous",
      bankAccounts: payout.user?.bankAccounts || [],
    },
  }));
}

export async function processPayoutRequest(
  payoutId: string,
  action: "process" | "complete" | "reject",
  notes?: string
) {
  await requireAdminAuth();

  const payout = await prisma.payout.findUnique({
    where: { id: payoutId },
    include: { user: true },
  });

  if (!payout) throw new Error("Payout not found");

  const status =
    action === "process"
      ? "on_the_way"
      : action === "complete"
      ? "completed"
      : "rejected";

  await prisma.$transaction([
    prisma.payout.update({
      where: { id: payoutId },
      data: {
        status,
        notes,
        processedAt: new Date(),
      },
    }),

    prisma.notification.create({
      data: {
        userId: payout.userId,
        title: `Payout ${status === "on_the_way" ? "Processing" : status}`,
        message: status === "on_the_way"
          ? "Your payout is being processed."
          : status === "completed"
          ? `Your payout of $${payout.amount} has been sent.`
          : `Your payout was rejected: ${notes || "No reason provided"}`,
        type: status === "rejected" ? "error" : "success",
      },
    }),
  ]);

  revalidatePath("/admin/payouts");
}


const ACTIVITIES_CACHE_KEY = "activities";
const ACTIVITIES_CACHE_EXPIRATION = 300; // 5 minutes

export async function getActivities(): Promise<ActivityData[]> {
  try {
    console.log(`[📡 ${new Date().toISOString()}] Checking Redis cache for activities...`);
    
    // ✅ Check Redis cache first
    const cachedActivities = await redis.get(ACTIVITIES_CACHE_KEY);
    if (cachedActivities) {
      console.log(`[✅ ${new Date().toISOString()}] Returning cached activities`);
      return cachedActivities as ActivityData[];
    }

    console.log(`[🗂 ${new Date().toISOString()}] Fetching activities from database...`);
    const activities = await prisma.activity.findMany({
      select: {
        id: true,
        title: true,
        type: true,
        status: true,
        points: true,
        createdAt: true,
        completedAt: true,
        is_template: true,
        _count: { select: { completions: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    const formattedActivities = activities.map((activity) => ({
      id: activity.id,
      title: activity.title,
      type: activity.type as "video" | "survey",
      status: activity.status as "active" | "draft",
      points: activity.points,
      createdAt: activity.createdAt?.toISOString() || "",
      completedAt: activity.completedAt ?? null,
      isTemplate: activity.is_template,
      _count: activity._count?.completions ?? 0,
    }));

    console.log(`[💾 ${new Date().toISOString()}] Caching activities for ${ACTIVITIES_CACHE_EXPIRATION} seconds...`);
    await redis.set(ACTIVITIES_CACHE_KEY, formattedActivities, { ex: ACTIVITIES_CACHE_EXPIRATION });

    return formattedActivities;
  } catch (error) {
    console.error(`[❌ ${new Date().toISOString()}] getActivities: Error fetching activities:`, error);
    Sentry.captureException(error); // ✅ Sentry captures this error
    return [];
  }
}

export async function createActivity(data: CreateActivityData): Promise<CreateActivityResponse> {
  try {
    console.log(`[🚀 ${new Date().toISOString()}] Creating new activity...`);

    const userId = await requireAuthUser();
    const internalUser = await prisma.user.findUniqueOrThrow({
      where: { employClerkUserId: userId },
      select: { id: true },
    });

    await prisma.activity.create({
      data: { ...data, userId: internalUser.id, is_template: true },
    });

    console.log(`[🗑️ ${new Date().toISOString()}] Clearing activity cache after creation...`);

    // ✅ Clear cache to ensure fresh data
    await redis.del(ACTIVITIES_CACHE_KEY);

    revalidatePath("/dashboard/activities");
    console.log(`[✅ ${new Date().toISOString()}] Activity created successfully.`);

    return { success: true };
  } catch (error) {
    console.error(`[❌ ${new Date().toISOString()}] createActivity: Error creating activity:`, error);
    Sentry.captureException(error); // ✅ Sentry captures this error
    return { success: false, error: "Failed to create activity" };
  }
}


export async function updateActivity(
  id: string,
  data: Partial<CreateActivityData>
): Promise<CreateActivityResponse> {
  try {
    console.log(`[🔄 ${new Date().toISOString()}] Updating activity ID: ${id}`);

    const userId = await requireAuthUser();
    const internalUser = await prisma.user.findUniqueOrThrow({
      where: { employClerkUserId: userId },
      select: { id: true },
    });

    await prisma.activity.update({
      where: { id, userId: internalUser.id }, // ✅ Ensure activity belongs to the user
      data,
    });

    console.log(`[🗑️ ${new Date().toISOString()}] Clearing cache after activity update...`);

    // ✅ Clear cache after update
    await redis.del(ACTIVITIES_CACHE_KEY);
    console.log(`[✅ ${new Date().toISOString()}] Activity ID: ${id} updated successfully.`);

    return { success: true };
  } catch (error) {
    console.error(`[❌ ${new Date().toISOString()}] updateActivity: Error updating activity:`, error);
    Sentry.captureException(error); // ✅ Sentry captures this error
    return { success: false, error: "Failed to update activity" };
  }
}

export async function updateActivityStatus(activityId: string, status: string) {
  
  await requireAdminAuth();
  console.log(`[🔄 ${new Date().toISOString()}] Updating status of activity ID: ${activityId} to "${status}"`);


  const updatedActivity = await prisma.activity.update({
    where: { id: activityId },
    data: { status },
  });

  console.log(`[🗑️ ${new Date().toISOString()}] Clearing cache after activity status update...`);

  // ✅ Clear cache after status update
  await redis.del(ACTIVITIES_CACHE_KEY);

  revalidatePath("/dashboard/activities");

  console.log(`[✅ ${new Date().toISOString()}] Activity status updated successfully.`);

  return updatedActivity;
}

export async function deleteActivity(activityId: string) {
  await requireAdminAuth(); // ✅ Ensures only admin users can delete

  console.log(`[🗑️ ${new Date().toISOString()}] Deleting activity ID: ${activityId}`);

  await prisma.activity.delete({ where: { id: activityId } });

  console.log(`[🗑️ ${new Date().toISOString()}] Clearing cache after activity deletion...`);
  // ✅ Clear cache after deletion
  await redis.del(ACTIVITIES_CACHE_KEY);

  revalidatePath("/admin/activities");
  revalidatePath("/dashboard/activities");

  console.log(`[✅ ${new Date().toISOString()}] Activity ID: ${activityId} deleted successfully.`);

  return { success: true };
}


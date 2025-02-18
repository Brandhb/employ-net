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

interface User {
  id: string;
  name: string | null;
  email: string;
  status: string;
  points: number;
  joinedAt: Date;
  verificationStatus: string;
}

const activitiesCache = new Map<string, any>();

// ✅ Auth Helper for Admin Verification
async function requireAdminAuth() {
  const { userId } = await auth();
  if (!userId) throw new Error("No User");

  const { users } = await clerkClient();
  const user = await users.getUser(userId);

  if (user.publicMetadata.role !== "admin") {
    throw new Error("Unauthorized as admin");
  }

  return userId;
}

async function requireAuthUser(): Promise<string> {
  const { userId } = await auth();
  if (!userId) {
    throw new Error("Unauthorized: User not found");
  }
  return userId;
}

const adminCache = new Map<string, any>();
const adminAnalyticsCache = new Map<string, any>();

/**
 * ✅ Cached Fetching for Admin Users
 * - Caches user data for 5 minutes to reduce load
 */
const CACHE_KEY = "adminUsers";
const CACHE_EXPIRATION = 300; // 5 minutes

export async function getAdminUsers(): Promise<User[]> {
  await requireAdminAuth();

  const cachedUsers = await redis.get(CACHE_KEY);
  if (cachedUsers) {
    console.log("✅ Returning cached admin users");
    return cachedUsers as User[]; // ✅ Explicitly assert type
  }

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

  const formattedUsers: User[] = users.map((user) => ({
    id: user.id,
    name: user.name,
    email: user.email || "",
    status: user.verification_status === "verified" ? "active" : "inactive",
    points: user.points_balance || 0,
    joinedAt: user.createdAt,
    verificationStatus: user.verification_status || "",
  }));

  await redis.set(CACHE_KEY, formattedUsers, { ex: CACHE_EXPIRATION });

  return formattedUsers;
}

// ✅ Function to clear cache when updating users
export async function clearAdminUsersCache() {
  await redis.del(CACHE_KEY);
}

/**
 * ✅ Cached Dashboard Stats for Both Websites
 * - Reduces database hits by caching results for 5 minutes
 */
export async function getAdminDashboardStatsBothWebsites() {
  if (adminCache.has("adminDashboardStats")) {
    console.log("✅ Returning cached dashboard stats");
    return adminCache.get("adminDashboardStats");
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

  adminCache.set("adminDashboardStats", stats);
  setTimeout(() => adminCache.delete("adminDashboardStats"), 5 * 60 * 1000); // Cache expires in 5 min

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

// ✅ Cache admin settings to reduce DB load
export const getAdminSettings = cache(async () => {
  const { userId } = await auth();
  await requireAdminAuth();

  const user = await prisma.user.findUniqueOrThrow({
    where: { employClerkUserId: userId || "" },
    select: {
      id: true,
      email: true,
      notificationPreferences: true,
      adminNotificationPreferences: true,
    },
  });

  return {
    ...user,
    notificationPreferences: (typeof user.notificationPreferences === "string"
      ? JSON.parse(user.notificationPreferences)
      : user.notificationPreferences) || {
      dailySummary: true,
      urgentAlerts: true,
    },

    adminNotificationPreferences: (typeof user.adminNotificationPreferences ===
    "string"
      ? JSON.parse(user.adminNotificationPreferences)
      : user.adminNotificationPreferences) || {
      payoutNotifications: true,
      verificationNotifications: true,
      systemAlerts: true,
    },
  };
});

// ❌ No caching for updates (since data changes)
export async function updateAdminSettings(settings: {
  notificationPreferences?: NotificationPreferences;
  adminNotificationPreferences?: AdminNotificationPreferences;
}) {
  const { userId } = await auth();
  await requireAdminAuth();

  const updatedUser = await prisma.user.update({
    where: { employClerkUserId: userId || "" },
    data: {
      ...(settings.notificationPreferences && {
        notificationPreferences: settings.notificationPreferences as any,
      }),
      ...(settings.adminNotificationPreferences && {
        adminNotificationPreferences:
          settings.adminNotificationPreferences as any,
      }),
    },
    select: {
      id: true,
      email: true,
      notificationPreferences: true,
      adminNotificationPreferences: true,
    },
  });

  return updatedUser;
}

////////--------/

export async function getAdminAnalyticsBothWebsites(): Promise<AdminAnalytics> {
  await requireAdminAuth();

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

  return {
    users: userStats.map((user) => ({
      verificationStatus: user.verification_status ?? "unknown",
      _count: (user._count as { id?: number })?.id ?? 0, // ✅ Fix: Explicitly cast _count
      createdAt: new Date(),
    })),

    activities: activityStats.map((activity) => ({
      type: activity.type ?? "unknown",
      status: activity.status ?? "unknown",
      _count: (activity._count as { id?: number })?.id ?? 0, // ✅ Fix
      _sum: { points: activity._sum?.points ?? 0 },
      metadata: {},
    })),

    payouts: payoutStats.map((payout) => ({
      status: payout.status ?? "unknown",
      _count: (payout._count as { id?: number })?.id ?? 0, // ✅ Fix
      _sum: { amount: payout._sum?.amount ?? 0 },
      created_at: new Date(),
    })),
  };
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
  const { userId } = await auth();
  await requireAdminAuth();

  const { users } = await clerkClient();
  const user = await users.getUser(userId || "");
  if (user.publicMetadata.role !== "admin") {
    throw new Error("Unauthorized");
  }

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
  debugger;
  const { userId } = await auth();
  await requireAdminAuth();

  const { users } = await clerkClient();
  const user = await users.getUser(userId || "");
  if (user.publicMetadata.role !== "admin") {
    throw new Error("Unauthorized");
  }

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
        processedBy: userId,
      },
    }),

    prisma.notification.create({
      data: {
        userId: payout.userId,
        title: `Payout ${status === "on_the_way" ? "Processing" : status}`,
        message:
          status === "on_the_way"
            ? "Your payout is being processed and will be sent shortly"
            : status === "completed"
            ? `Your payout of $${payout.amount} has been sent`
            : `Your payout was rejected: ${notes || "No reason provided"}`,
        type: status === "rejected" ? "error" : "success",
        userRole: (await requireAdminAuth()) ? "admin" : "user",
      },
    }),

    ...(status === "rejected"
      ? [
          prisma.user.update({
            where: { id: payout.userId },
            data: {
              points_balance: { increment: payout.amount * 100 }, // Convert dollars back to points
            },
          }),
        ]
      : []),
  ]);

  // ✅ Revalidate relevant pages
  revalidatePath("/admin/payouts");
  revalidatePath("/dashboard/payouts");

  return { success: true };
}

// ✅ Memoize getActivities function with cache()
export const getActivities = cache(async (): Promise<ActivityData[]> => {
  try {
    console.log("🗂 Fetching activities from database...");
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
        _count: { select: { completions: true } }, // ✅ Selecting only what's needed
      },
      orderBy: { createdAt: "desc" },
    });

    return activities.map((activity) => ({
      id: activity.id,
      title: activity.title,
      type: activity.type as "video" | "survey",
      status: activity.status as "active" | "draft",
      points: activity.points,
      createdAt: activity.createdAt?.toISOString() || "",
      completedAt: activity.completedAt ?? null,
      isTemplate: activity.is_template,
      _count:
        typeof activity._count === "object" && "completions" in activity._count
          ? activity._count.completions ?? 0
          : 0, // ✅ Fixed `_count` issue
    }));
  } catch (error) {
    console.error("❌ getActivities: Error fetching activities:", error);
    return [];
  }
});

export const createActivity = async (
  data: CreateActivityData
): Promise<CreateActivityResponse> => {
  try {
    const userId = await requireAuthUser();
    const internalUser = await prisma.user.findUniqueOrThrow({
      where: { employClerkUserId: userId },
      select: { id: true },
    });

    await prisma.activity.create({
      data: { ...data, userId: internalUser.id, is_template: true },
    });

    revalidatePath("/dashboard/activities");

    return { success: true };
  } catch (error) {
    console.error("❌ createActivity: Error creating activity:", error);
    return { success: false, error: "Failed to create activity" };
  }
};

export const updateActivity = async (
  id: string,
  data: Partial<CreateActivityData>
): Promise<CreateActivityResponse> => {
  try {
    const userId = await requireAuthUser();
    const internalUser = await prisma.user.findUniqueOrThrow({
      where: { employClerkUserId: userId },
      select: { id: true },
    });

    await prisma.activity.update({
      where: { id, userId: internalUser.id }, // ✅ Ensure activity belongs to the user
      data,
    });

    return { success: true };
  } catch (error) {
    console.error("❌ updateActivity: Error updating activity:", error);
    return { success: false, error: "Failed to update activity" };
  }
};

export async function updateActivityStatus(activityId: string, status: string) {
  await requireAdminAuth();

  const updatedActivity = await prisma.activity.update({
    where: { id: activityId },
    data: { status },
  });

  activitiesCache.delete("activities"); // ✅ Invalidate cache
  revalidatePath("/dashboard/activities");

  return updatedActivity;
}

export async function deleteActivity(activityId: string) {
  await requireAdminAuth(); // ✅ Ensures only admin users can delete

  await prisma.activity.delete({ where: { id: activityId } });

  activitiesCache.delete(activityId); // ✅ Remove from cache
  revalidatePath("/admin/activities");
  revalidatePath("/dashboard/activities");

  return { success: true };
}

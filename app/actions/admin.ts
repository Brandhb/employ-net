"use server";

import { prisma } from "@/lib/prisma";
import { auth, clerkClient } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";

interface NotificationPreferences {
  dailySummary: boolean;
  urgentAlerts: boolean;
}

interface AdminNotificationPreferences {
  payoutNotifications: boolean;
  verificationNotifications: boolean;
  systemAlerts: boolean;
}

export interface AdminUser {
  id: string;
  name: string | null;
  email: string;
  status: string;
  points: number;
  joinedAt: Date;
  verificationStatus: string;
}

export interface AdminPayout {
  id: string;
  amount: number;
  status: string;
  user: {
    fullName: string | null;
    email: string;
    paypalEmail: string | null;
  };
  createdAt: Date;
}

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

// Add these functions to the existing file
export async function getAdminUsers(): Promise<AdminUser[]> {
  await requireAdminAuth(); // 👈 Replacing redundant checks

  const users = await prisma.user.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      verification_status: true,
      points_balance: true,
      createdAt: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return users.map((user) => ({
    id: user.id,
    name: user.name,
    email: user.email || "",
    status: user.verification_status === "verified" ? "active" : "inactive",
    points: user.points_balance || 0,
    joinedAt: user.createdAt || "",
    verificationStatus: user.verification_status || "",
  }));
}

export interface AdminUser {
  id: string;
  name: string | null;
  email: string;
  status: string;
  points: number;
  joinedAt: Date;
  verificationStatus: string;
}

export async function getAdminDashboardStatsBothWebsites() {
  await requireAdminAuth(); // 👈 Replacing redundant checks

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
    // Total Users
    prisma.user.count(),

    // Active Activities
    prisma.activity.count({
      where: { status: "active" },
    }),

    // Pending Payouts
    prisma.payout.count({
      where: { status: "pending" },
    }),

    // Issues (activities with error status or failed payouts)
    prisma.$queryRaw<{ count: number }[]>`
      SELECT COUNT(*) as count
      FROM (
        SELECT id FROM activities WHERE status = 'error'
        UNION
        SELECT id FROM payouts WHERE status = 'rejected'
      ) as issues
    `,

    // Recent Users
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

    // User Growth (compared to last month)
    prisma.$queryRaw<{ growth: number }[]>`
      SELECT 
        ROUND(
          ((COUNT(*) FILTER (WHERE created_at >= NOW() - INTERVAL '1 month')::DECIMAL / 
            NULLIF(COUNT(*) FILTER (WHERE created_at >= NOW() - INTERVAL '2 month' 
              AND created_at < NOW() - INTERVAL '1 month'), 0)) - 1) * 100,
          1
        ) as growth
      FROM users
    `,

    // Activity Completion Rate
    prisma.$queryRaw<{ rate: number }[]>`
      SELECT 
        ROUND(
          (COUNT(*) FILTER (WHERE status = 'completed')::DECIMAL / 
            NULLIF(COUNT(*), 0)) * 100,
          1
        ) as rate
      FROM activities
    `,

    // Revenue Growth (based on completed payouts)
    prisma.$queryRaw<{ growth: number }[]>`
      SELECT 
        ROUND(
          ((SUM(amount) FILTER (WHERE created_at >= NOW() - INTERVAL '1 month')::DECIMAL / 
            NULLIF(SUM(amount) FILTER (WHERE created_at >= NOW() - INTERVAL '2 month' 
              AND created_at < NOW() - INTERVAL '1 month'), 0)) - 1) * 100,
          1
        ) as growth
      FROM payouts
      WHERE status = 'completed'
    `,
  ]);

  return {
    totalUsers,
    activeActivities,
    pendingPayouts,
    totalIssues: Number(totalIssues[0]?.count || 0),
    recentUsers,
    userGrowth: Number(userGrowthRaw[0]?.growth || 0),
    activityCompletionRate: Number(activityCompletionRateRaw[0]?.rate || 0),
    revenueGrowth: Number(revenueGrowthRaw[0]?.growth || 0),
  };
}

export async function getAdminDashboardStats() {
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
    // ✅ Ensure we count only users with employClerkUserId
    prisma.user.count({
      where: { employClerkUserId: { not: null } }
    }),

    // ✅ Ensure activities belong to employed users
    prisma.activity.count({
      where: { 
        status: "active",
        user: { employClerkUserId: { not: null } } 
      },
    }),

    // ✅ Ensure payouts belong to employed users
    prisma.payout.count({
      where: { 
        status: "pending",
        user: { employClerkUserId: { not: null } }
      },
    }),

    // ✅ Fix: Use double quotes in raw SQL for case-sensitive column names
    prisma.$queryRaw<{ count: number }[]>`
      SELECT COUNT(*) as count
      FROM (
        SELECT id FROM activities WHERE status = 'error' 
          AND user_id IN (SELECT id FROM users WHERE "employClerkUserId" IS NOT NULL)
        UNION
        SELECT id FROM payouts WHERE status = 'rejected' 
          AND user_id IN (SELECT id FROM users WHERE "employClerkUserId" IS NOT NULL)
      ) as issues
    `,

    // ✅ Fix: Recent Users (Only those with employClerkUserId)
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

    // ✅ Fix: User Growth (Only employed users)
    prisma.$queryRaw<{ growth: number }[]>`
      SELECT 
        ROUND(
          ((COUNT(*) FILTER (WHERE created_at >= NOW() - INTERVAL '1 month' AND "employClerkUserId" IS NOT NULL)::DECIMAL / 
            NULLIF(COUNT(*) FILTER (WHERE created_at >= NOW() - INTERVAL '2 month' 
              AND created_at < NOW() - INTERVAL '1 month' AND "employClerkUserId" IS NOT NULL), 0)) - 1) * 100,
          1
        ) as growth
      FROM users
    `,

    // ✅ Fix: Activity Completion Rate (Only for employed users)
    prisma.$queryRaw<{ rate: number }[]>`
      SELECT 
        ROUND(
          (COUNT(*) FILTER (WHERE status = 'completed' 
          AND user_id IN (SELECT id FROM users WHERE "employClerkUserId" IS NOT NULL))::DECIMAL / 
            NULLIF(COUNT(*), 0)) * 100,
          1
        ) as rate
      FROM activities
    `,

    // ✅ Fix: Revenue Growth (Only for employed users)
    prisma.$queryRaw<{ growth: number }[]>`
      SELECT 
        ROUND(
          ((SUM(amount) FILTER (WHERE created_at >= NOW() - INTERVAL '1 month' 
            AND user_id IN (SELECT id FROM users WHERE "employClerkUserId" IS NOT NULL))::DECIMAL / 
            NULLIF(SUM(amount) FILTER (WHERE created_at >= NOW() - INTERVAL '2 month' 
              AND created_at < NOW() - INTERVAL '1 month' 
              AND user_id IN (SELECT id FROM users WHERE "employClerkUserId" IS NOT NULL)), 0)) - 1) * 100,
          1
        ) as growth
      FROM payouts
      WHERE status = 'completed'
    `,
  ]);

  return {
    totalUsers,
    activeActivities,
    pendingPayouts,
    totalIssues: Number(totalIssues[0]?.count || 0),
    recentUsers,
    userGrowth: Number(userGrowthRaw[0]?.growth || 0),
    activityCompletionRate: Number(activityCompletionRateRaw[0]?.rate || 0),
    revenueGrowth: Number(revenueGrowthRaw[0]?.growth || 0),
  };
}


export async function getAdminNotifications() {
  await requireAdminAuth(); // 👈 Replacing redundant checks

  return prisma.notification.findMany({
    where: {
      OR: [
        { type: "payout_request" },
        { type: "verification_request" },
        { type: "system_alert" },
      ],
      read: false,
    },
    orderBy: { createdAt: "desc" },
    take: 10,
  });
}

export async function getAdminSettings() {
  const { userId } = await auth();
  await requireAdminAuth();

  const user = await prisma.user.findUnique({
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
    notificationPreferences: (typeof user?.notificationPreferences === "string"
      ? JSON.parse(user.notificationPreferences)
      : user?.notificationPreferences) || {
        dailySummary: true,
        urgentAlerts: true,
      },

    adminNotificationPreferences: (typeof user?.adminNotificationPreferences === "string"
      ? JSON.parse(user.adminNotificationPreferences)
      : user?.adminNotificationPreferences) || {
        payoutNotifications: true,
        verificationNotifications: true,
        systemAlerts: true,
      },
  };
}


export async function updateAdminSettings(settings: {
  notificationPreferences?: NotificationPreferences;
  adminNotificationPreferences?: AdminNotificationPreferences;
}) {
  const { userId } = await auth();
  await requireAdminAuth(); // 👈 Replacing redundant checks

  return prisma.user.update({
    where: { employClerkUserId: userId || "" },
    data: {
      notificationPreferences: settings.notificationPreferences as any,
      adminNotificationPreferences:
        settings.adminNotificationPreferences as any,
    },
    select: {
      id: true,
      email: true,
      notificationPreferences: true,
      adminNotificationPreferences: true,
    },
  });
}

export interface AdminAnalytics {
  users: {
    verificationStatus: string;
    _count: number;
    createdAt: Date;
  }[];
  activities: {
    type: string;
    status: string;
    _count: number;
    _sum: {
      points: number | null;
    };
    metadata: {
      duration?: number;
      [key: string]: any;
    } | null;
  }[];
  payouts: {
    status: string;
    _count: number;
    _sum: {
      amount: number | null;
    };
    created_at: Date;
  }[];
}

export async function getAdminAnalyticsBothWebsites(): Promise<AdminAnalytics> {
  debugger;
  await requireAdminAuth();

  // Use Prisma transaction inside a function
  const result = await prisma.$transaction(async (prisma) => {
    const userStats = await prisma.user.groupBy({
      by: ["verification_status"],
      _count: { verification_status: true },
      orderBy: { verification_status: "asc" },
    });

    const activityStats = await prisma.activity.groupBy({
      by: ["status", "type"],
      _count: { status: true },
      _sum: { points: true },
      orderBy: { status: "asc" },
    });

    const payoutStats = await prisma.payout.groupBy({
      by: ["status"],
      _count: { status: true },
      _sum: { amount: true },
      orderBy: { status: "asc" },
    });

    return { userStats, activityStats, payoutStats };
  });

  return {
    users: result.userStats.map((user) => ({
      verificationStatus: user.verification_status ?? "unknown",
      _count: user._count.verification_status ?? 0,
      createdAt: new Date(), // Placeholder as `groupBy` does not return `createdAt`
    })),

    activities: result.activityStats.map((activity) => ({
      type: activity.type ?? "unknown",
      status: activity.status ?? "unknown",
      _count: activity._count.status ?? 0,
      _sum: { points: activity._sum.points ?? 0 },
      metadata: {}, // Ensuring metadata exists
    })),

    payouts: result.payoutStats.map((payout) => ({
      status: payout.status ?? "unknown",
      _count: payout._count.status ?? 0,
      _sum: { amount: payout._sum.amount ?? 0 },
      created_at: new Date(), // Placeholder, as `groupBy` does not return `createdAt`
    })),
  };
}

export async function getAdminAnalytics(): Promise<AdminAnalytics> {
  await requireAdminAuth();

  const result = await prisma.$transaction(async (prisma) => {
    const userStats = await prisma.user.groupBy({
      by: ["verification_status"],
      _count: { verification_status: true },
      where: { employClerkUserId: { not: null } }, // ✅ Only employed users
      orderBy: { verification_status: "asc" },
    });

    const activityStats = await prisma.activity.groupBy({
      by: ["status", "type"],
      _count: { status: true },
      _sum: { points: true },
      where: { user: { employClerkUserId: { not: null } } }, // ✅ Only employed users
      orderBy: { status: "asc" },
    });

    const payoutStats = await prisma.payout.groupBy({
      by: ["status"],
      _count: { status: true },
      _sum: { amount: true },
      where: { user: { employClerkUserId: { not: null } } }, // ✅ Only employed users
      orderBy: { status: "asc" },
    });

    return { userStats, activityStats, payoutStats };
  });

  return {
    users: result.userStats.map((user) => ({
      verificationStatus: user.verification_status ?? "unknown",
      _count: user._count.verification_status ?? 0,
      createdAt: new Date(), // Placeholder as `groupBy` does not return `createdAt`
    })),
    activities: result.activityStats.map((activity) => ({
      type: activity.type ?? "unknown",
      status: activity.status ?? "unknown",
      _count: activity._count.status ?? 0,
      _sum: { points: activity._sum.points ?? 0 },
      metadata: {}, // Ensuring metadata exists
    })),
    payouts: result.payoutStats.map((payout) => ({
      status: payout.status ?? "unknown",
      _count: payout._count.status ?? 0,
      _sum: { amount: payout._sum.amount ?? 0 },
      created_at: new Date(), // Placeholder, as `groupBy` does not return `createdAt`
    })),
  };
}

export async function getPayoutRequests() {
  const { userId } = await auth();
  await requireAdminAuth();

  const { users } = await clerkClient();
  const user = await users.getUser(userId || "");
  const isAdmin = user.publicMetadata.role === "admin";

  if (!isAdmin) {
    throw new Error("Unauthorized");
  }

  // Fetch payout requests with user details
  const payouts = await prisma.payout.findMany({
    where: {
      status: {
        in: ["pending", "processing"],
      },
    },
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
              routingNumber: true,
            },
          },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  // Ensure safe data formatting
  return payouts.map((payout) => ({
    ...payout,
    status: payout.status || "pending", // Ensure status is always valid
    createdAt: payout.createdAt || new Date(), // Ensure createdAt is always valid
    user: {
      email: payout.user?.email || "No email",
      full_name: payout.user?.full_name || "Anonymous",
      bankAccounts: payout.user?.bankAccounts || [], // Ensure it's always an array
    },
  }));
}

export async function processPayoutRequest(
  payoutId: string,
  action: "process" | "complete" | "reject",
  notes?: string
) {
  const { userId } = await auth();
  await requireAdminAuth();

  const { users } = await clerkClient();
  const user = await users.getUser(userId || "");
  const isAdmin = user.publicMetadata.role === "admin";

  if (!isAdmin) {
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
    // Update payout status
    prisma.payout.update({
      where: { id: payoutId },
      data: {
        status,
        notes,
        processedAt: new Date(),
        processedBy: userId,
      },
    }),

    // Create notification for user
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
      },
    }),

    // If rejected, refund points to user
    ...(status === "rejected"
      ? [
          prisma.user.update({
            where: { id: payout.userId },
            data: {
              points_balance: {
                increment: payout.amount * 100, // Convert dollars back to points
              },
            },
          }),
        ]
      : []),
  ]);

  // Revalidate relevant pages
  revalidatePath("/admin/payouts");
  revalidatePath("/dashboard/payouts");

  return { success: true };
}

export async function createActivity(data: {
  title: string;
  type: string;
  points: number;
  description?: string;
  metadata?: any;
}) {
  const { userId } = await auth();
  await requireAdminAuth();

  const { users } = await clerkClient();
  const user = await users.getUser(userId || "");
  const isAdmin = user.publicMetadata.role === "admin";

  if (!isAdmin) {
    throw new Error("Unauthorized");
  }

  const activity = await prisma.activity.create({
    data: {
      ...data,
      userId: user.id,
      status: "active",
    },
  });

  revalidatePath("/admin/activities");
  revalidatePath("/dashboard/activities");

  return activity;
}

export async function updateActivityStatus(activityId: string, status: string) {
  const { userId } = await auth();
  await requireAdminAuth();

  const { users } = await clerkClient();
  const user = await users.getUser(userId || "");
  const isAdmin = user.publicMetadata.role === "admin";

  if (!isAdmin) {
    throw new Error("Unauthorized");
  }

  const activity = await prisma.activity.update({
    where: { id: activityId },
    data: { status },
  });

  revalidatePath("/admin/activities");
  revalidatePath("/dashboard/activities");

  return activity;
}

export async function deleteActivity(activityId: string) {
  const { userId } = await auth();
  await requireAdminAuth();

  const { users } = await clerkClient();
  const user = await users.getUser(userId || "");
  const isAdmin = user.publicMetadata.role === "admin";

  if (!isAdmin) {
    throw new Error("Unauthorized");
  }

  await prisma.activity.delete({
    where: { id: activityId },
  });

  revalidatePath("/admin/activities");
  revalidatePath("/dashboard/activities");

  return { success: true };
}

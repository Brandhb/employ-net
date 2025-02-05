"use server";

import { prisma } from "@/lib/prisma";

export async function getActivities(userId: string) {
  const user = await prisma.user.findUnique({
    where: { employClerkUserId: userId }
  });

  if (!user) throw new Error("User not found");

  return prisma.activity.findMany({
    where: {
      status: "active"
    },
    orderBy: {
      createdAt: 'desc'
    }
  });
}

export async function getActivityById(activityId: string) {
  return prisma.activity.findUnique({
    where: { id: activityId }
  });
}

export async function getRecentActivities(userId: string, limit = 5) {
  const user = await prisma.user.findUnique({
    where: { employClerkUserId: userId }
  });

  if (!user) throw new Error("User not found");

  return prisma.activityLog.findMany({
    where: {
      userId: user.id
    },
    include: {
      activity: true
    },
    orderBy: {
      createdAt: 'desc'
    },
    take: limit
  });
}

export async function getUserStats(userId: string) {

  const user = await prisma.user.findUnique({
    where: {
      employClerkUserId: userId
    },
    select: {
      points_balance: true,
      _count: {
        select: {
          activities: {
            where: {
              status: 'completed'
            }
          }
        }
      }
    }
  });

  const totalEarnings = await prisma.payout.aggregate({
    where: {
      user: {
        employClerkUserId: userId
      },
      status: 'completed'
    },
    _sum: {
      amount: true
    }
  });

  return {
    points: user?.points_balance ?? 0,
    completedActivities: user?._count.activities ?? 0,
    earnings: totalEarnings._sum.amount ?? 0
  };
}

export async function completeActivity(userId: string, activityId: string) {
  const user = await prisma.user.findUnique({
    where: { employClerkUserId: userId }
  });

  if (!user) throw new Error("User not found");

  const activity = await prisma.activity.findUnique({
    where: { id: activityId }
  });

  if (!activity) throw new Error("Activity not found");
  if (activity.status === "completed") throw new Error("Activity already completed");

  await prisma.$transaction([
    prisma.activity.update({
      where: { id: activityId },
      data: {
        status: "completed",
        completedAt: new Date()
      }
    }),
    prisma.user.update({
      where: { id: user.id },
      data: {
        points_balance: {
          increment: activity.points
        }
      }
    }),
    prisma.activityLog.create({
      data: {
        userId: user.id,
        activityId,
        action: "completed",
        metadata: {
          points: activity.points,
          type: activity.type
        }
      }
    }),
    prisma.notification.create({
      data: {
        userId: user.id,
        title: "Activity Completed",
        message: `You earned ${activity.points} points for completing ${activity.title}!`,
        type: "success"
      }
    })
  ]);

  return { success: true };
}

export async function getActivityStats(userId: string) {
  const user = await prisma.user.findUnique({
    where: { employClerkUserId: userId }
  });

  if (!user) throw new Error("User not found");

  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const activities = await prisma.activityLog.findMany({
    where: {
      userId: user.id,
      createdAt: {
        gte: startOfMonth
      }
    },
    select: {
      createdAt: true,
      metadata: true
    },
    orderBy: {
      createdAt: 'asc'
    }
  });

  // Group activities by date and calculate stats
  const stats = activities.reduce((acc, activity) => {
    const date = activity.createdAt 
    ? new Date(activity.createdAt).toISOString().split('T')[0] 
    : "";

    if (!acc[date] && activity.createdAt) {
      acc[date] = {
        createdAt: activity.createdAt ,
        _count: 0,
        points: 0
      };
    }
    acc[date]._count += 1;
    acc[date].points += (activity.metadata as any)?.points || 0;
    return acc;
  }, {} as Record<string, {
    [x: string]: any; createdAt: Date; _count: number; points: number 
}>);

  return Object.values(stats);
}


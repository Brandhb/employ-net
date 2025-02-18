import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { redis } from "@/lib/redis";
import { clerkClient } from "@clerk/nextjs/server";

export async function POST(req: NextRequest) {
  try {
    const { userId, activityId } = await req.json();
    console.log(`🚀 Processing activity completion: User ${userId}, Activity ${activityId}`);

    const { users } = await clerkClient();
    const user = await users.getUser(userId || "");
    const isAdmin = user.publicMetadata.role === "admin";

    const internalUser = await prisma.user.findUnique({
      where: { employClerkUserId: userId }
    });

    if (!internalUser) throw new Error("User not found");

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
        where: { id: internalUser.id },
        data: {
          points_balance: { increment: activity.points }
        }
      }),
      prisma.activityLog.create({
        data: {
          userId: internalUser.id,
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
          userId: internalUser.id,
          title: "Activity Completed",
          message: `You earned ${activity.points} points for completing ${activity.title}!`,
          type: "success",
          userRole: isAdmin ? "admin" : "user"
        }
      })
    ]);

    // ✅ Clear Redis Cache (force refresh)
    await redis.del(`activities:active`);
    await redis.del(`user:${userId}:stats`);
    await redis.del(`user:${userId}:recentActivities`);

    console.log(`✅ Activity ${activityId} marked as completed for user ${userId}`);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("❌ Error processing activity completion:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

import { NextResponse, NextRequest } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId } = await auth();

    if (!userId) {
      console.error("⛔ Unauthorized request - Missing userId");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    console.log("🔹 Authenticated user:", userId);
    console.log("📌 Activity ID from request:", body.activityId);

    // ✅ Find internal user ID via Clerk user ID
    const user = await prisma.user.findUnique({
      where: { employClerkUserId: userId },
      select: { id: true, points_balance: true }, // Fetch only necessary fields
    });

    if (!user) {
      console.error("❌ User not found:", userId);
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    console.log("✅ Internal user found:", user.id);

    // ✅ Fetch activity with required fields
    const activity = await prisma.activity.findUnique({
      where: { id: body.activityId },
      select: { id: true, title: true, points: true, type: true },
    });

    if (!activity) {
      console.error("❌ Activity not found:", body.activityId);
      return NextResponse.json({ error: "Activity not found" }, { status: 404 });
    }

    console.log("✅ Activity found:", activity.title);

    // ✅ Check if the user has already completed this activity
    const existingCompletion = await prisma.activity_completions.findFirst({
      where: {
        user_id: user.id,
        activity_id: activity.id,
      },
    });

    if (existingCompletion) {
      console.warn("⚠️ User already completed this activity:", activity.id);
      return NextResponse.json({ 
        success: false, 
        message: "You have already completed this activity." 
      }, { status: 409 });
    }

    // ✅ Use Prisma transaction for atomic updates with activityCompletion
    const [newCompletion, updatedUser, newLog, newNotification] = await prisma.$transaction([
      prisma.activity_completions.create({
        data: {
          user_id: user.id,
          activity_id: activity.id,
          completed_at: new Date(),
        },
      }),
      prisma.user.update({
        where: { id: user.id },
        data: {
          points_balance: { increment: activity.points },
        },
      }),
      prisma.activityLog.create({
        data: {
          userId: user.id,
          activityId: activity.id,
          action: 'completed',
          metadata: {
            points: activity.points,
            type: activity.type,
          },
        },
      }),
      prisma.notification.create({
        data: {
          userId: user.id,
          title: 'Activity Completed',
          message: `🎉 You earned ${activity.points} points for completing "${activity.title}"!`,
          type: 'success',
        },
      }),
    ]);

    console.log("✅ Activity completion recorded successfully!");

    return NextResponse.json({
      success: true,
      completion: newCompletion,
      user: { id: updatedUser.id, points_balance: updatedUser.points_balance },
      log: newLog,
      notification: newNotification,
    });

  } catch (error) {
    console.error("❌ Error completing activity:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

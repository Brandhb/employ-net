import { NextResponse, NextRequest } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId } = await auth(); // ✅ Call `auth()` inside the function

    if (!userId) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    console.log("🔹 User ID:", userId);
    console.log("🔹 Incoming Activity ID:", body.activityId);

    const user = await prisma.user.findUnique({
      where: { employClerkUserId: userId },
    });

    if (!user) {
      console.error("❌ User not found:", userId);
      return new NextResponse('User not found', { status: 404 });
    }

    const activity = await prisma.activity.findUnique({
      where: { id: body.activityId },
    });

    if (!activity) {
      console.error("❌ Activity not found:", body.activityId);
      return new NextResponse('Activity not found', { status: 404 });
    }

    console.log("✅ Activity found:", activity.title);

    // ✅ Update activity status and user points in a transaction
    const result = await prisma.$transaction([
      prisma.activity.update({
        where: { id: body.activityId },
        data: {
          status: 'completed',
          completedAt: new Date(),
        },
      }),
      prisma.user.update({
        where: { id: user.id },
        data: {
          points_balance: {
            increment: activity.points,
          },
        },
      }),
      prisma.activityLog.create({
        data: {
          userId: user.id,
          activityId: body.activityId,
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
          message: `You earned ${activity.points} points for completing ${activity.title}!`,
          type: 'success',
        },
      }),
    ]);

    console.log("✅ Activity completion recorded:", result);
    return NextResponse.json(result);
  } catch (error) {
    console.error("❌ Error completing activity:", error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

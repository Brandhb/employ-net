import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  const { userId } = await auth();
  const { activityId } = await request.json();

  if (!userId) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { employClerkUserId: userId },
    });

    if (!user) {
      return new NextResponse('User not found', { status: 404 });
    }

    const activity = await prisma.activity.findUnique({
      where: { id: activityId },
    });

    if (!activity) {
      return new NextResponse('Activity not found', { status: 404 });
    }

    // Update activity status and user points in a transaction
    const result = await prisma.$transaction([
      prisma.activity.update({
        where: { id: activityId },
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
          activityId,
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

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error completing activity:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
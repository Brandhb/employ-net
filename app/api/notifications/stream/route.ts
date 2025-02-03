import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@clerk/nextjs/server';

export async function GET() {
  const { userId: employClerkUserId } = await auth();

  if (!employClerkUserId) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  try {
    // Fetch the internal `userId` using the Clerk's `employClerkUserId`
    const user = await prisma.user.findUnique({
      where: { employClerkUserId },
      select: { id: true },
    });

    if (!user) {
      return new NextResponse('User not found', { status: 404 });
    }

    const internalUserId = user.id; // This will be used to query notifications

    const headers = {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    };

    const stream = new ReadableStream({
      start(controller) {
        const interval = setInterval(async () => {
          console.log('Fetching notifications for userId:', internalUserId);

          try {
            const notifications = await prisma.notification.findMany({
              where: {
                userId: internalUserId, // Use the internal user ID
                read: false,
              },
              orderBy: {
                createdAt: 'desc',
              },
            });

            if (notifications.length > 0) {
              const data = `data: ${JSON.stringify(notifications[0])}\n\n`;
              controller.enqueue(new TextEncoder().encode(data));
            }
          } catch (error) {
            console.error('Error fetching notifications:', error);
            controller.close();
          }
        }, 5000);

        return () => {
          clearInterval(interval);
        };
      },
    });

    return new NextResponse(stream, { headers });
  } catch (error) {
    console.error('Error processing notifications stream:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { createLogger } from "@/lib/logger";
import { clerkClient } from "@clerk/nextjs/server";

const logger = createLogger("notifications-mark-read");

export async function POST(request: Request) {
  try {
    const { userId } = await auth();
    const { notificationId } = await request.json();
    
    if (!userId || !notificationId) {
      return new NextResponse("Unauthorized or missing notification ID", { status: 401 });
    }

    const { users } = await clerkClient();
    const user = await users.getUser(userId || "");
    const isAdmin = user.publicMetadata.role === "admin";

    const userFromDB = await prisma.user.findUnique({
      where: { employClerkUserId: userId },
    });

    if (!userFromDB) {
      return new NextResponse("User not found", { status: 404 });
    }

    const notification = await prisma.notification.findUnique({
      where: { id: notificationId },
    });

    if (!notification) {
      return new NextResponse("Notification not found", { status: 404 });
    }

    // Check if user has permission to mark this notification as read
    if (isAdmin) {
      // Admins can mark admin notifications as read
      if (!notification.type.startsWith("admin_")) {
        return new NextResponse("Unauthorized", { status: 403 });
      }
    } else {
      // Regular users can only mark their own notifications as read
      if (notification.userId !== userFromDB.id || notification.type.startsWith("admin_")) {
        return new NextResponse("Unauthorized", { status: 403 });
      }
    }

    await prisma.notification.update({
      where: { id: notificationId },
      data: {
        read: true,
        updatedAt: new Date(),
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    logger.error("Error marking notification as read:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
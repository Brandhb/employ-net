import { NextResponse } from "next/server";
import { auth, clerkClient } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { createLogger } from "@/lib/logger";

const logger = createLogger("notification-mark-single");

export async function POST(request: Request) {
  try {
    // Authenticate the user
    const { userId } = await auth();
    if (!userId) {
      logger.warn("No userId found in auth()");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Parse the notificationId from the request body
    const { notificationId } = await request.json();
    if (!notificationId) {
      logger.warn("Missing notificationId in request body");
      return NextResponse.json({ error: "Missing notification id" }, { status: 400 });
    }

    // Fetch Clerk user details to determine role
    const { users } = await clerkClient();
    const clerkUser = await users.getUser(userId);
    const isAdmin = clerkUser.publicMetadata.role === "admin";

    // Retrieve the notification from the database
    const notification = await prisma.notification.findUnique({
      where: { id: notificationId },
    });
    if (!notification) {
      logger.warn(`Notification not found: ${notificationId}`);
      return NextResponse.json({ error: "Notification not found" }, { status: 404 });
    }

    // Permission Checks using the DB field "userRole"
    if (isAdmin) {
      // Admins can mark notifications as read only if the notification's userRole is "admin"
      if (notification.userRole !== "admin") {
        logger.warn(`Admin user ${userId} attempted to mark a non-admin notification (${notificationId})`);
        return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
      }
    } else {
      // Regular users can only mark their own notifications as read and must not mark admin notifications.
      if (notification.userId !== userId || notification.userRole === "admin") {
        logger.warn(`User ${userId} unauthorized to mark notification ${notificationId}`);
        return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
      }
    }

    // Mark the notification as read
    const updatedNotification = await prisma.notification.update({
      where: { id: notificationId },
      data: { read: true, updated_at: new Date() },
    });

    logger.info(`Notification ${notificationId} marked as read by user ${userId}`);
    return NextResponse.json({ success: true, notification: updatedNotification });
  } catch (error) {
    logger.error("Error marking notification as read", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

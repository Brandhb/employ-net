"use server";

import { prisma } from "@/lib/prisma";
import { createLogger } from "@/lib/logger";
import { clerkClient } from "@clerk/nextjs/server";

const logger = createLogger("notification-actions");

export async function getUnreadNotifications(userId: string) {
  try {
    const { users } = await clerkClient();
    const user = await users.getUser(userId || "");
    const isAdmin = user.publicMetadata.role === "admin";

    const userFromDB = await prisma.user.findUnique({
      where: { employClerkUserId: userId },
    });

    if (!userFromDB) throw new Error("User not found");

    // For admin users, get admin notifications
    if (isAdmin) {
      return prisma.notification.findMany({
        where: {
          type: {
            startsWith: "admin_",
          },
          read: false,
        },
        orderBy: {
          createdAt: "desc",
        },
      });
    }

    // For regular users, get their personal notifications
    return prisma.notification.findMany({
      where: {
        userId: userFromDB.id,
        type: {
          not: {
            startsWith: "admin_",
          },
        },
        read: false,
      },
      orderBy: {
        createdAt: "desc",
      },
    });
  } catch (error) {
    logger.error("Error fetching unread notifications:", error);
    throw error;
  }
}

export async function createNotification({
  userId,
  title,
  message,
  type,
  isAdmin = false,
}: {
  userId: string;
  title: string;
  message: string;
  type: string;
  isAdmin?: boolean;
}) {
  try {
    const { users } = await clerkClient();
    const user = await users.getUser(userId || "");
    const isAdmin = user.publicMetadata.role === "admin";

    if (isAdmin) {
      // Create a shared admin notification
      await prisma.notification.create({
        data: {
          title,
          message,
          type,
          userId, // We'll still associate it with the creating admin
          userRole: isAdmin ? "admin" : "user"
        },
      });
    } else {
      // Create a user-specific notification
      await prisma.notification.create({
        data: {
          userId,
          title,
          message,
          type,
          userRole: isAdmin ? "admin" : "user"
        },
      });
    }
  } catch (error) {
    logger.error("Error creating notification:", error);
    throw error;
  }
}

export async function markNotificationAsRead(notificationId: string, userId: string) {
  try {
    const { users } = await clerkClient();
    const user = await users.getUser(userId || "");
    const isAdmin = user.publicMetadata.role === "admin";

    const userFromDB = await prisma.user.findUnique({
      where: { employClerkUserId: userId },
    });

    if (!userFromDB) throw new Error("User not found");

    const notification = await prisma.notification.findUnique({
      where: { id: notificationId },
    });

    if (!notification) throw new Error("Notification not found");

    // Check permissions
    if (isAdmin) {
      if (!notification.type.startsWith("admin_")) {
        throw new Error("Unauthorized");
      }
    } else if (notification.userId !== userFromDB.id || notification.type.startsWith("admin_")) {
      throw new Error("Unauthorized");
    }

    return prisma.notification.update({
      where: { id: notificationId },
      data: { read: true },
    });
  } catch (error) {
    logger.error("Error marking notification as read:", error);
    throw error;
  }
}

export async function markAllNotificationsAsRead(userId: string) {
  try {
    const { users } = await clerkClient();
    const user = await users.getUser(userId || "");
    const isAdmin = user.publicMetadata.role === "admin";

    const userFromDB = await prisma.user.findUnique({
      where: { employClerkUserId: userId },
    });

    if (!userFromDB) throw new Error("User not found");

    if (isAdmin) {
      // Mark all admin notifications as read
      return prisma.notification.updateMany({
        where: {
          type: {
            startsWith: "admin_",
          },
          read: false,
        },
        data: { read: true },
      });
    }

    // Mark all user notifications as read
    return prisma.notification.updateMany({
      where: {
        userId: userFromDB.id,
        type: {
          not: {
            startsWith: "admin_",
          },
        },
        read: false,
      },
      data: { read: true },
    });
  } catch (error) {
    logger.error("Error marking all notifications as read:", error);
    throw error;
  }
}
import { NextResponse } from "next/server";
import { auth, clerkClient } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { createLogger } from "@/lib/logger";

const logger = createLogger("notifications-mark-all");

export async function POST() {
  debugger;
  try {
    const { userId } = await auth();

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
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

    // For admin users, mark all admin notifications as read
    if (isAdmin) {
      await prisma.notification.updateMany({
        where: {
          userRole: "admin",
          read: false,
        },
        data: {
          read: true,
          updated_at: new Date(),
        },
      });
    } else {
      // For regular users, only mark their own notifications as read
      await prisma.notification.updateMany({
        where: {
          userId: userFromDB.id,
          userRole: {
            not: "admin",
          },
          read: false,
        },
        data: {
          read: true,
          updated_at: new Date(),
        },
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    logger.error("Error marking all notifications as read:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

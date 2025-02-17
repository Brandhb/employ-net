import { NextResponse, NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";

export async function GET(request: NextRequest) {
  try {
    const authUser = await auth();
    const employClerkUserId = authUser?.userId;

    if (!employClerkUserId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    console.log("📌 Looking up user with Clerk ID:", employClerkUserId);

    const user = await prisma.user.findUnique({
      where: { employClerkUserId },
      select: { id: true },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    console.log("✅ Internal User ID:", user.id);

    // Fetch initial notifications
    const notifications = await prisma.notification.findMany({
      where: {
        userId: user.id,
        read: false, // Fetch only unread notifications
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json({ success: true, notifications });
  } catch (error) {
    console.error("🚨 Error fetching notifications:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

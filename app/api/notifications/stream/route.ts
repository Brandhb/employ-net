import { NextResponse, NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";

export async function GET(request: NextRequest) {
  try {
    const authUser = await auth(); // ✅ No need to `await` auth()
    const employClerkUserId = authUser?.userId;

    if (!employClerkUserId) {
      console.error("⛔ Unauthorized request - Missing userId");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    console.log("📌 Looking up user with Clerk ID:", employClerkUserId);

    // ✅ Fetch internal user ID
    const user = await prisma.user.findUnique({
      where: { employClerkUserId },
      select: { id: true },
    });

    if (!user) {
      console.error("❌ User not found for Clerk ID:", employClerkUserId);
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const internalUserId = user.id;

    console.log("✅ Internal User ID:", internalUserId);

    // ✅ Set response headers for SSE (Server-Sent Events)
    const headers = new Headers({
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    });

    return new Response(
      new ReadableStream({
        async start(controller) {
          console.log("📡 Starting notification stream for:", internalUserId);

          const interval = setInterval(async () => {
            console.log("🔍 Fetching notifications for userId:", internalUserId);

            try {
              const notifications = await prisma.notification.findMany({
                where: {
                  userId: internalUserId,
                  read: false,
                },
                orderBy: {
                  createdAt: "desc",
                },
              });

              if (notifications.length > 0) {
                const data = `data: ${JSON.stringify(notifications[0])}\n\n`;
                controller.enqueue(new TextEncoder().encode(data));
                console.log("📩 Sent notification update:", notifications[0]);
              }
            } catch (error) {
              console.error("❌ Error fetching notifications:", error);
              controller.close();
            }
          }, 5000);

          return () => {
            clearInterval(interval);
            console.log("🔴 Stream closed for userId:", internalUserId);
          };
        },
      }),
      { headers }
    );
  } catch (error) {
    console.error("🚨 Error processing notification stream:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

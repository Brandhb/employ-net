import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { sendNotificationEmail } from "@/lib/email";

export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) return new NextResponse("Unauthorized", { status: 401 });

    const { activityId } = await req.json();
    if (!activityId) return new NextResponse("Activity ID is required", { status: 400 });

    const user = await prisma.user.findUnique({
      where: { employClerkUserId: userId },
    });
    if (!user) return new NextResponse("User not found", { status: 404 });

    const activity = await prisma.activity.findUnique({
      where: { id: activityId },
    });
    if (!activity || activity.type !== "verification") {
      return new NextResponse("Invalid verification task", { status: 400 });
    }

    // ✅ Check if a request already exists for this user + activity
    const existingRequest = await prisma.verificationRequest.findFirst({
      where: {
        userId: user.id,
        activityId,
        // Optional: only block if status is not "completed"
        status: { in: ["waiting", "ready"] },
      },
    });

    if (existingRequest) {
      return new NextResponse("You’ve already submitted a verification request for this task.", {
        status: 409, // Conflict
      });
    }

    // ✅ Create new verification request
    await prisma.verificationRequest.create({
      data: {
        userId: user.id,
        activityId,
        status: "waiting",
      },
    });

    // ✅ Notify admin
    await sendNotificationEmail(
      "support@employ-net.com",
      "New Verification Request",
      `<p>User ${user.name} (${user.email}) has requested verification for Task: ${activity.title}.</p>`
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error processing verification request:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { sendNotificationEmail } from "@/lib/email"; // ✅ Uses your existing email function

export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) return new NextResponse("Unauthorized", { status: 401 });

    const { activityId } = await req.json(); // ✅ Use `activityId`

    const user = await prisma.user.findUnique({ where: { employClerkUserId: userId } });
    if (!user) return new NextResponse("User not found", { status: 404 });

    // ✅ Check if activityId is valid
    const activity = await prisma.activity.findUnique({ where: { id: activityId } });
    if (!activity || activity.type !== "verification") {
      return new NextResponse("Invalid verification task", { status: 400 });
    }

    // ✅ Create a verification request linked to the activity
    await prisma.verificationRequest.create({
      data: {
        userId: user.id,
        activityId, // ✅ Use `activityId`
        status: "waiting",
      },
    });

    // ✅ Notify admin via email
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

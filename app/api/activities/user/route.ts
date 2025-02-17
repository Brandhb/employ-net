import { NextResponse, NextRequest } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    console.log("📩 Incoming GET request to fetch user activities");

    const { userId } = await auth();
    if (!userId) {
      console.error("⛔ Unauthorized request - Missing userId");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    console.log("🔑 Authenticated user:", userId);

    const user = await prisma.user.findUnique({
      where: { employClerkUserId: userId },
    });

    if (!user) {
      console.error("❌ User not found:", userId);
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    console.log("✅ Internal user found:", user.id);

    // ✅ Fetch all active template activities
    const templateActivities = await prisma.activity.findMany({
      where: { is_template: true, status: "active" },
    });

    console.log(
      `✅ Retrieved ${templateActivities.length} active template activities`
    );

    // ✅ Fetch user's completed activities
    const userCompletedActivities = await prisma.activity_completions.findMany({
      where: { user_id: user.id },
      include: { activity: true },
    });

    console.log(
      `✅ Retrieved ${userCompletedActivities.length} completed activities for user ${user.id}`
    );

    // ✅ Combine active and completed activities
    const activeActivities = templateActivities
      .filter(
        (template) =>
          !userCompletedActivities.some((ua) => ua.activity_id === template.id)
      ) // 🔥 Exclude completed activities
      .map((template) => ({
        id: template.id,
        title: template.title,
        type: template.type,
        points: template.points,
        status: "pending", // Now correctly marked as pending only if not completed
        completedAt: null,
      }));

    const completedActivities = userCompletedActivities.map((ua) => ({
      id: ua.activity?.id,
      title: ua.activity?.title,
      type: ua.activity?.type,
      points: ua.activity?.points,
      status: "completed",
      completedAt: ua.completed_at,
    }));

    console.log("✅ Successfully processed activities:", {
      activeActivities,
      completedActivities,
    });

    return NextResponse.json({
      success: true,
      activeActivities,
      completedActivities,
    });
  } catch (error) {
    console.error("❌ Error fetching activities:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

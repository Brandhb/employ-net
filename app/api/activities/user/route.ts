import { NextResponse, NextRequest } from "next/server";
import * as Sentry from "@sentry/nextjs";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { redis } from "@/lib/redis";
import { clearUserActivityCache } from "@/lib/cache"; // ✅ Import from utility file

// ✅ Helper function to fetch and cache activities
async function fetchUserActivities(userId: string) {
  const cacheKey = `user:activities:${userId}`;
  const cachedData = await redis.get(cacheKey);

  if (cachedData) {
    console.log("🚀 Returning cached activities for:", userId);
    return cachedData;
  }

  console.log("📩 Fetching activities from DB for:", userId);

  // ✅ Fetch user
  const user = await prisma.user.findUnique({
    where: { employClerkUserId: userId },
  });
  if (!user) return { error: "User not found" };

  // ✅ Fetch active template activities
  const templateActivities = await prisma.activity.findMany({
    where: { is_template: true, status: "active" },
  });

  // ✅ Fetch user's completed activities
  const userCompletedActivities = await prisma.activity_completions.findMany({
    where: { user_id: user.id },
    include: { activity: true },
  });

  // ✅ Process activities
  const activeActivities = templateActivities
    .filter(
      (template) =>
        !userCompletedActivities.some((ua) => ua.activity_id === template.id)
    )
    .map((template) => ({
      id: template.id,
      title: template.title,
      type: template.type,
      points: template.points,
      status: "pending",
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

  const responseData = { success: true, activeActivities, completedActivities };

  // ✅ Cache result in Redis for 5 minutes
  await redis.set(cacheKey, responseData, { ex: 300 });

  return responseData;
}

export async function GET(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const data = await fetchUserActivities(userId);
    return NextResponse.json(data);
  } catch (error) {
    console.error("❌ Error fetching activities:", error);
    Sentry.captureException(error); // ✅ Sentry captures this error

    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

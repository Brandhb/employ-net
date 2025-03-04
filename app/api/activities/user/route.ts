import { NextResponse, NextRequest } from "next/server";
import * as Sentry from "@sentry/nextjs";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { redis } from "@/lib/redis";
import { getInternalUserId } from "@/app/actions/get-internal-userid";

// ✅ Helper function to fetch and cache activities
async function fetchUserActivities(userId: string) {
  //debugger
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
  //debugger;

  const InternalUserId = await getInternalUserId()
  // ✅ Fetch active template activities (now includes verificationRequests)
  const templateActivities = await prisma.activity.findMany({
    where: { is_template: true, status: "active" },
    include: {
      verificationRequests: { // ✅ Include verificationRequests
        where: { userId: InternalUserId! },
        select: {
          id: true,
          userId: true,
          status: true,
          verificationUrl: true,
        },
      },
    },
  });

  // ✅ Fetch user's completed activities
  const userCompletedActivities = await prisma.activity_completions.findMany({
    where: { user_id: user.id },
    include: { activity: true },
  });

  // ✅ Process active activities (excluding completed ones)
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
      verificationRequests: template.verificationRequests || [],
      desription: template.description
    }));

  // ✅ Process completed activities
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

// ✅ API Route
export async function GET(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const data = await fetchUserActivities(userId);
    return NextResponse.json(data);
  } catch (error) {
    console.error("❌ Error fetching activities:", error);
    Sentry.captureException(error); // ✅ Sentry logs error

    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

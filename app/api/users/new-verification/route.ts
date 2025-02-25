import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { redis } from "@/lib/redis";

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const cacheKey = `user:verificationStep:${userId}`;
    let verificationStep = await redis.get(cacheKey);

    // ✅ Only query SQL if Redis is empty
    if (verificationStep === null) {
      console.log("⏳ Fetching verification step from SQL...");
      const user = await prisma.user.findUnique({
        where: { employClerkUserId: userId },
        select: { verificationStep: true },
      });

      verificationStep = user?.verificationStep ?? 0;

      // ✅ Store in Redis (permanent cache)
      await redis.set(cacheKey, verificationStep);
    }

    return NextResponse.json({ verificationStep });
  } catch (error) {
    console.error("❌ Error fetching verification step:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

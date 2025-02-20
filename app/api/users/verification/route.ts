import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { redis } from "@/lib/redis"; // ✅ Cache layer

export async function GET() {
  try {
    
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const cacheKey = `user:verificationStep:${userId}`;

    // ✅ Check Redis first
    let verificationStep = await redis.get(cacheKey);

    if (verificationStep === null || verificationStep == 0) {
      console.log("⏳ Fetching verification step from DB...");
      const user = await prisma.user.findUnique({
        where: { employClerkUserId: userId },
        select: { verificationStep: true },
      });

      verificationStep = user?.verificationStep ?? 0; // Default to 0

      // ✅ Store in Redis (Cache for 10 minutes)
      await redis.set(cacheKey, verificationStep);
    }

    return NextResponse.json({ verificationStep });
  } catch (error) {
    console.error("❌ Error fetching verification step:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

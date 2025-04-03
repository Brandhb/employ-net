import { NextResponse } from "next/server";
import { redis } from "@/lib/redis";

export async function POST(req: Request) {
  try {
    const { userId, verificationStep } = await req.json();

    if (!userId || verificationStep === undefined) {
      return NextResponse.json({ error: "Missing parameters" }, { status: 400 });
    }

    const cacheKey = `user:verificationStep:${userId}`;
    
    // ✅ Update Redis Cache
    await redis.set(cacheKey, verificationStep);

    console.log(`🔄 Redis Updated: ${cacheKey} = ${verificationStep}`);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("❌ Error updating Redis cache:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

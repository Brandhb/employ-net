"use server";

import { prisma } from "@/lib/prisma";
import { redis } from "@/lib/redis";
import { User } from "@/types";
import { currentUser } from "@clerk/nextjs/server";

const CACHE_EXPIRATION = 300; // 5 minutes

/** ✅ Get User Verification Step (with Caching) */
export async function getUserVerificationStep(employClerkUserId: string) {
  const cacheKey = `user:verificationStep:${employClerkUserId}`;

  // ✅ Check Redis cache first
  const cachedStep = await redis.get(cacheKey);
  if (cachedStep !== null) {
    console.log("🚀 Returning cached verification step for", employClerkUserId);
    return Number(cachedStep); // Ensure correct type
  }

  console.log("📩 Fetching verification step from DB for", employClerkUserId);
  try {
    const user = await prisma.user.findUnique({
      where: { employClerkUserId },
      select: { verificationStep: true },
    });

    const verificationStep = user?.verificationStep ?? 0;

    // ✅ Store in cache (as string)
    await redis.set(cacheKey, verificationStep.toString(), { ex: CACHE_EXPIRATION });

    return verificationStep;
  } catch (error) {
    console.error("❌ Error fetching verification step:", error);
    throw new Error("Failed to fetch user verification step");
  }
}

/** ✅ Get Clerk User Object */
export async function getClerkUserObject() {
  return await currentUser();
}

/** ✅ Get Emails (with Caching) */
export async function getEmails() {
  const user = await currentUser();
  return user?.emailAddresses.map(email => ({
    id: email.id,
    emailAddress: email.emailAddress,
  })) || [];
}

/** ✅ Check User Verification Step */
export async function checkVerificationStep() {
  try {
    const user = await getClerkUserObject();
    if (!user) {
      console.error("⛔ User not authenticated.");
      return { verified: false, reason: "User not authenticated" };
    }

    const employClerkUserId = user.id;
    console.log("🔍 Checking verification step for user:", employClerkUserId);

    // ✅ Fetch verification step (cached)
    const verificationStep = await getUserVerificationStep(employClerkUserId);

    if (verificationStep !== 1) {
      console.warn("⚠️ User verification incomplete:", employClerkUserId);
      return { verified: false, reason: "User verification incomplete" };
    }

    console.log("✅ User verification successful:", employClerkUserId);
    return { verified: true };
  } catch (error) {
    console.error("❌ Error in checkVerificationStep:", error);
    return { verified: false, reason: "Server error" };
  }
}

/** ✅ Update User Verification Step (with Cache Invalidation) */
export async function updateUserVerificationStep(userId: string, newStep: number) {
  console.log("🔄 Updating verification step for:", userId);

  await prisma.user.update({
    where: { employClerkUserId: userId },
    data: { verificationStep: newStep },
  });

  // ✅ Clear cache after update
  await redis.del(`user:verificationStep:${userId}`);
  console.log("🗑️ Cache cleared for verification step:", userId);
}

/** ✅ Get DB User (with Caching) */
export async function getDbUser(userId: string): Promise<User> {
  const cacheKey = `user:db:${userId}`;

  // ✅ Check Redis cache first
  const cachedUser = await redis.get(cacheKey);
  if (cachedUser) {
    console.log("🚀 Returning cached DB user for", userId);
    return cachedUser as User; // ✅ Parse JSON before returning
  }

  console.log("📩 Fetching user from DB for", userId);
  try {
    const dbUser = await prisma.user.findUnique({
      where: { employClerkUserId: userId },
    });

    if (dbUser) {
      await redis.set(cacheKey, JSON.stringify(dbUser), { ex: 600 }); // ✅ Cache as JSON
    }

    return dbUser as unknown as User;
  } catch (error) {
    console.error("❌ Error fetching user from DB:", error);
    throw new Error("Failed to fetch user");
  }
}

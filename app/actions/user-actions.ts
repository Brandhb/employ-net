"use server";

import { prisma } from "@/lib/prisma";
import { redis } from "@/lib/redis";
import { User } from "@/types";
import { currentUser } from "@clerk/nextjs/server";

const CACHE_EXPIRATION = 300; // 5 minutes

export async function getUserVerificationStep(employClerkUserId: string) {
  const cacheKey = `user:verificationStep:${employClerkUserId}`;

  // ✅ Check Redis cache first
  const cachedStep = await redis.get(cacheKey);
  if (cachedStep !== null) {
    console.log("🚀 Returning cached verification step for", employClerkUserId);
    return cachedStep;
  }

  console.log("📩 Fetching verification step from DB for", employClerkUserId);
  try {
    const user = await prisma.user.findUnique({
      where: { employClerkUserId },
      select: { verificationStep: true },
    });

    if (user?.verificationStep !== undefined) {
      await redis.set(cacheKey, user.verificationStep, {
        ex: CACHE_EXPIRATION,
      }); // ✅ Cache result
    }

    return user?.verificationStep ?? 0;
  } catch (error) {
    console.error("❌ Error fetching verification step:", error);
    throw new Error("Failed to fetch user verification step");
  }
}

export const getClerkUserObject = async () => {
  const user = await currentUser();
  return user;
};

export const getEmails = async () => {
  const user = await currentUser();
  // Transform the email addresses into plain objects
  const emails = user?.emailAddresses.map((email) => ({
    id: email.id,
    emailAddress: email.emailAddress,
  }));
  return emails || [];
};

export async function checkVerificationStep() {
  try {
    const user = await getClerkUserObject();
    if (!user) {
      console.error("⛔ User not authenticated.");
      return { verified: false, reason: "User not authenticated" };
    }

    const employClerkUserId = user.id;

    // ✅ Use Cached Emails
    const emails = await getEmails();
    if (!emails || emails.length === 0) {
      console.error("⛔ No email addresses found for user:", employClerkUserId);
      return {
        verified: false,
        reason: "No email addresses associated with account",
      };
    }

    console.log("🔍 Checking verification step for user:", employClerkUserId);

    let verificationStep;
    let attempts = 3; // Retry mechanism for DB sync

    while (attempts > 0) {
      verificationStep = await getUserVerificationStep(employClerkUserId);
      if (verificationStep === 1) break;

      console.warn(
        `⏳ Attempt ${4 - attempts}: Verification step not found. Retrying...`
      );
      await new Promise((res) => setTimeout(res, 1000));
      attempts--;
    }

    if (verificationStep !== 1) {
      console.warn(
        "⚠️ User verification incomplete after retries:",
        employClerkUserId
      );
      return { verified: false, reason: "User verification incomplete" };
    }

    console.log("✅ User verification successful:", employClerkUserId);
    return { verified: true };
  } catch (error) {
    console.error("❌ Error in checkVerificationStep:", error);
    return { verified: false, reason: "Server error" };
  }
}

export async function updateUserVerificationStep(
  userId: string,
  newStep: number
) {
  console.log("🔄 Updating verification step for:", userId);

  await prisma.user.update({
    where: { employClerkUserId: userId },
    data: { verificationStep: newStep },
  });

  // ✅ Clear cache after update
  await redis.del(`user:verificationStep:${userId}`);
  console.log("🗑️ Cache cleared for verification step:", userId);
}

export const getDbUser = async (userId: string): Promise<User> => {
  const cacheKey = `user:db:${userId}`;

  // ✅ Check Redis first
  const cachedUser = await redis.get(cacheKey);
  if (cachedUser) {
    console.log("🚀 Returning cached DB user for", userId);
    return cachedUser as User;
  }

  console.log("📩 Fetching user from DB for", userId);
  try {
    const dbUser = await prisma.user.findUnique({
      where: { employClerkUserId: userId },
    });

    if (dbUser) {
      await redis.set(cacheKey, dbUser, { ex: 600 }); // ✅ Cache for 10 minutes
    }

    return dbUser as unknown as User;
  } catch (error) {
    console.error("❌ Error fetching user from DB:", error);
    throw new Error("Failed to fetch user");
  }
};

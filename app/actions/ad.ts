"use server";

import { prisma } from "@/lib/prisma";
import { isUUID } from "@/lib/utils";
import { auth } from "@clerk/nextjs/server";

// Define the Ad type
export type AdType = "video" | "survey" | "display";

interface BaseMetadata {
  duration?: number;
  url?: string;
  format?: string;
}

interface SurveyMetadata {
  formId?: string;
}

type AdMetadata = BaseMetadata | SurveyMetadata;

// Ad Interface
export interface Ad {
  id: string;
  type: AdType;
  title: string;
  content: string;
  reward: number;
  metadata: AdMetadata;
}

// ✅ Fetch latest Ad for the user
export async function fetchLatestAd(userId: string): Promise<Ad | null> {
  if (!userId) return null;

  // Check if user exists in Prisma
  const internalUser = await prisma.user.findUnique({
    where: { employClerkUserId: userId },
  });

  if (!internalUser) {
    console.error("❌ No internal user found for Clerk ID:", userId);
    return null; // Return null instead of throwing an error
  }

  // ✅ Validate UUID before querying Prisma
  if (!isUUID(internalUser.id)) {
    console.error("❌ Invalid UUID format for user_id:", userId);
    return null; // Return null instead of throwing an error
  }

  try {
    const latestInteraction = await prisma.adInteraction.findFirst({
      where: { userId: internalUser.id },
      orderBy: { createdAt: "desc" },
    });

    if (!latestInteraction) return null;

    // Example: Dynamically handling metadata based on ad type
    const adType: AdType = "survey"; // Example, this should come from your DB

    return {
      id: latestInteraction.adId,
      type: adType,
      title: "Engaging Survey!",
      content: "Participate in this quick survey and earn rewards.",
      reward: 15,
      metadata:
        adType === "survey"
          ? { formId: "survey-123" } // Survey-specific metadata
          : { url: "https://example.com", format: "banner" }, // Default metadata
    };
  } catch (error) {
    console.error("❌ Error fetching latest ad:", error);
    return null;
  }
}

// ✅ Record Ad Interaction
export async function recordAdInteraction(
  userId: string,
  adId: string,
  type: "view" | "click",
  duration?: number
): Promise<boolean> {
  if (!userId) return false;

  try {
    await prisma.adInteraction.create({
      data: {
        userId,
        adId,
        interactionType: type,
        duration,
      },
    });
    return true;
  } catch (error) {
    console.error("❌ Error recording ad interaction:", error);
    return false;
  }
}

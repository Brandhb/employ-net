"use client";

import { useState, useEffect } from "react";
import { prisma } from "@/lib/prisma";
import { useAuth } from "@clerk/nextjs";

export type AdType = "video" | "survey" | "display";

// Metadata Interfaces
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
interface Ad {
  id: string;
  type: AdType;
  title: string;
  content: string;
  reward: number;
  metadata: AdMetadata;
}

export function useAdProvider() {
  const [currentAd, setCurrentAd] = useState<Ad | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { userId } = useAuth();

  useEffect(() => {
    const fetchAd = async () => {
      try {
        if (!userId) return;

        const latestInteraction = await prisma.adInteraction.findFirst({
          where: {
            userId,
          },
          orderBy: {
            createdAt: "desc",
          },
        });

        if (latestInteraction) {
          // Example: Dynamically handling metadata based on ad type
          const adType: AdType = "survey"; // Example, this should come from your DB

          setCurrentAd({
            id: latestInteraction.adId,
            type: adType,
            title: "Engaging Survey!",
            content: "Participate in this quick survey and earn rewards.",
            reward: 15,
            metadata:
              adType === "survey"
                ? { formId: "survey-123" } // Survey-specific metadata
                : { url: "https://example.com", format: "banner" }, // Default metadata
          });
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch ad");
      } finally {
        setIsLoading(false);
      }
    };

    fetchAd();
  }, [userId]);

  const recordInteraction = async (
    adId: string,
    type: "view" | "click",
    duration?: number
  ) => {
    try {
      if (!userId) throw new Error("User not authenticated");

      await prisma.adInteraction.create({
        data: {
          userId,
          adId,
          interactionType: type,
          duration,
        },
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to record interaction");
    }
  };

  return {
    currentAd,
    isLoading,
    error,
    recordInteraction,
  };
}

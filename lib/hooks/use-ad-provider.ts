"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@clerk/nextjs";
import { fetchLatestAd, recordAdInteraction, Ad } from "@/app/actions/ad"; // ✅ Use server actions

export function useAdProvider() {
  const [currentAd, setCurrentAd] = useState<Ad | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { userId } = useAuth();

  useEffect(() => {
    const getAd = async () => {
      if (!userId) return;

      try {
        const ad = await fetchLatestAd(userId); // ✅ Call the server function
        setCurrentAd(ad);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch ad");
      } finally {
        setIsLoading(false);
      }
    };

    getAd();
  }, [userId]);

  // ✅ Function to record interactions
  const handleInteraction = async (
    adId: string,
    type: "view" | "click",
    duration?: number
  ) => {
    if (!userId) {
      setError("User not authenticated");
      return;
    }

    try {
      const success = await recordAdInteraction(userId, adId, type, duration);
      if (!success) throw new Error("Failed to record interaction");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to record interaction");
    }
  };

  return {
    currentAd,
    isLoading,
    error,
    recordInteraction: handleInteraction, // ✅ Call the server function instead of Prisma
  };
}

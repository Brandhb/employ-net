"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@clerk/nextjs";
import { fetchAnalyticsData } from "@/app/actions/analytics"; // ✅ Use server action

interface AnalyticsData {
  totalRevenue: number;
  adImpressions: number;
  adClicks: number;
  completionRate: number;
  averageEngagement: number;
}

export function useAnalytics() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { userId } = useAuth();

  useEffect(() => {
    const getAnalytics = async () => {
      if (!userId) return;

      try {
        const analyticsData = await fetchAnalyticsData(); // ✅ Call the server function
        setData(analyticsData);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch analytics");
      } finally {
        setIsLoading(false);
      }
    };

    getAnalytics();
    const interval = setInterval(getAnalytics, 60000); // Update every minute

    return () => clearInterval(interval);
  }, [userId]);

  return { data, isLoading, error };
}

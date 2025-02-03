"use client";

import { useState, useEffect } from 'react';
import { prisma } from '@/lib/prisma';
import { useAuth } from '@clerk/nextjs';

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
    const fetchAnalytics = async () => {
      try {
        if (!userId) return;

        const analyticsData = await prisma.$transaction(async (prisma) => {
          const [
            adInteractions,
            activities,
            completedActivities,
            totalEngagement,
          ] = await Promise.all([
            prisma.adInteraction.count(),
            prisma.activity.count(),
            prisma.activity.count({
              where: { status: 'completed' },
            }),
            prisma.adInteraction.aggregate({
              _avg: {
                duration: true,
              },
            }),
          ]);

          return {
            totalRevenue: 0, // Calculate based on your revenue model
            adImpressions: adInteractions,
            adClicks: 0, // Calculate from click interactions
            completionRate: activities > 0 ? (completedActivities / activities) * 100 : 0,
            averageEngagement: totalEngagement._avg.duration || 0,
          };
        });

        setData(analyticsData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch analytics');
      } finally {
        setIsLoading(false);
      }
    };

    fetchAnalytics();
    const interval = setInterval(fetchAnalytics, 60000); // Update every minute

    return () => clearInterval(interval);
  }, [userId]);

  return { data, isLoading, error };
}
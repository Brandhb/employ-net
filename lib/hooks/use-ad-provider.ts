"use client";

import { useState, useEffect } from 'react';
import { prisma } from '@/lib/prisma';
import { useAuth } from '@clerk/nextjs';

export type AdType = 'video' | 'survey' | 'display';

interface Ad {
  id: string;
  type: AdType;
  title: string;
  content: string;
  reward: number;
  metadata: {
    duration?: number;
    url?: string;
    format?: string;
  };
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
            createdAt: 'desc',
          },
        });

        if (latestInteraction) {
          setCurrentAd({
            id: latestInteraction.adId,
            type: 'video', // You might want to store this in the database
            title: 'Ad Title', // These should come from your ad content table
            content: 'Ad Content',
            reward: 10,
            metadata: {},
          });
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch ad');
      } finally {
        setIsLoading(false);
      }
    };

    fetchAd();
  }, [userId]);

  const recordInteraction = async (adId: string, type: 'view' | 'click', duration?: number) => {
    try {
      if (!userId) throw new Error('User not authenticated');

      await prisma.adInteraction.create({
        data: {
          userId,
          adId,
          interactionType: type,
          duration,
        },
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to record interaction');
    }
  };

  return {
    currentAd,
    isLoading,
    error,
    recordInteraction,
  };
}
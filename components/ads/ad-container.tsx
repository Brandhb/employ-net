"use client";

import { useEffect } from 'react';
import { useAdProvider } from '@/lib/hooks/use-ad-provider';
import { Card, CardContent } from '@/components/ui/card';
import { VideoAd } from '@/components/ads/video-ad';
import { SurveyAd } from '@/components/ads/survey-ad';
import { DisplayAd } from '@/components/ads/display-ad';

export function AdContainer() {
  const { currentAd, isLoading, error, recordInteraction } = useAdProvider();

  useEffect(() => {
    if (currentAd) {
      recordInteraction(currentAd.id, 'view');
    }
  }, [currentAd]);

  if (isLoading) {
    return <div className="animate-pulse h-48 bg-muted rounded-lg" />;
  }

  if (error) {
    return null;
  }

  if (!currentAd) {
    return null;
  }

  const handleClick = () => {
    recordInteraction(currentAd.id, 'click');
  };

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-0">
        {currentAd.type === 'video' && (
          <VideoAd
            {...currentAd}
            onComplete={(duration) => recordInteraction(currentAd.id, 'view', duration)}
          />
        )}
        {currentAd.type === 'survey' && (
          <SurveyAd
            {...currentAd}
            onClick={handleClick}
          />
        )}
        {currentAd.type === 'display' && (
          <DisplayAd
            {...currentAd}
            onClick={handleClick}
          />
        )}
      </CardContent>
    </Card>
  );
}
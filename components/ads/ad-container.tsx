"use client";

import { useEffect } from "react";
import { useAdProvider } from "@/lib/hooks/use-ad-provider";
import { Card, CardContent } from "@/components/ui/card";
import { VideoAd } from "@/components/ads/video-ad";
import { SurveyAd } from "@/components/ads/survey-ad";
import { DisplayAd } from "@/components/ads/display-ad";

export function AdContainer() {
  const { currentAd, isLoading, error, recordInteraction } = useAdProvider();

  useEffect(() => {
    if (currentAd) {
      recordInteraction(currentAd.id, "view");
    }
  }, [currentAd, recordInteraction]);

  if (isLoading) {
    return <div className="animate-pulse h-48 bg-muted rounded-lg" />;
  }

  if (error || !currentAd) {
    return null;
  }

  const handleClick = () => {
    recordInteraction(currentAd.id, "click");
  };

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-0">
        {currentAd.type === "video" && (
          <VideoAd
            title={currentAd.title}
            content={currentAd.content}
            reward={currentAd.reward}
            metadata={currentAd.metadata as { playbackId?: string; duration?: number }} // Type assertion for VideoAd
            onComplete={(duration) =>
              recordInteraction(currentAd.id, "view", duration)
            }
          />
        )}
        {currentAd.type === "survey" && (
          <SurveyAd
            title={currentAd.title}
            content={currentAd.content}
            reward={currentAd.reward}
            metadata={currentAd.metadata as { formId?: string }} // Type assertion for SurveyAd
            onClick={handleClick}
          />
        )}
        {currentAd.type === "display" && (
          <DisplayAd
            title={currentAd.title}
            content={currentAd.content}
            reward={currentAd.reward}
            metadata={currentAd.metadata as {
              imageUrl?: string;
              targetUrl?: string;
              format?: string;
            }} // Type assertion for DisplayAd
            onClick={handleClick}
          />
        )}
      </CardContent>
    </Card>
  );
}

"use client";

import { useEffect, useState } from "react";
import MuxPlayer from "@mux/mux-player-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";

interface VideoPlayerProps {
  playbackId: string;
  title: string;
  points: number;
  activityId: string;
}

export function VideoPlayer({ playbackId, title, points, activityId }: VideoPlayerProps) {
  const [progress, setProgress] = useState(0);
  const [completed, setCompleted] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  useEffect(() => {
    const checkCompletion = async () => {
      if (progress >= 90 && !completed) {
        setCompleted(true);
        try {
          const response = await fetch('/api/activities/complete', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ activityId }),
          });

          if (!response.ok) throw new Error('Failed to complete activity');

          toast({
            title: "Activity Completed!",
            description: `You earned ${points} points!`,
          });

          router.refresh();
        } catch (error) {
          console.error('Error completing activity:', error);
          toast({
            title: "Error",
            description: "Failed to complete activity",
            variant: "destructive",
          });
        }
      }
    };
    checkCompletion();
  }, [progress, completed, activityId, points, toast, router]);

  return (
    <Card className="overflow-hidden">
      <MuxPlayer
        playbackId={playbackId}
        metadata={{ video_id: playbackId, video_title: title }}
        onTimeUpdate={(e) => {
          const player = e.target as HTMLVideoElement;
          const progressPercent = (player.currentTime / player.duration) * 100;
          setProgress(progressPercent);
        }}
      />
      <div className="p-4">
        <h3 className="text-lg font-semibold mb-2">{title}</h3>
        <div className="space-y-2">
          <Progress value={progress} className="h-2" />
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">
              {Math.round(progress)}% Complete
            </span>
            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium">{points} points</span>
              <Button
                variant={completed ? "secondary" : "default"}
                disabled={completed}
              >
                {completed ? "Completed" : "Watch to Earn"}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}
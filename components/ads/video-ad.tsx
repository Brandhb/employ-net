"use client";

import { useState } from 'react';
import MuxPlayer from '@mux/mux-player-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';

interface VideoAdProps {
  title: string;
  content: string;
  reward: number;
  metadata: {
    playbackId?: string;
    duration?: number;
  };
  onComplete: (duration: number) => void;
}

export function VideoAd({ title, content, reward, metadata, onComplete }: VideoAdProps) {
  const [progress, setProgress] = useState(0);
  const [completed, setCompleted] = useState(false);

  const handleTimeUpdate = (e: any) => {
    const player = e.target as HTMLVideoElement;
    const progressPercent = (player.currentTime / player.duration) * 100;
    setProgress(progressPercent);

    if (progressPercent >= 90 && !completed) {
      setCompleted(true);
      onComplete(player.currentTime);
    }
  };

  return (
    <div className="space-y-4">
      <MuxPlayer
        playbackId={metadata.playbackId}
        metadata={{ video_id: metadata.playbackId }}
        onTimeUpdate={handleTimeUpdate}
        className="w-full aspect-video"
      />
      <div className="p-4">
        <h3 className="text-lg font-semibold mb-2">{title}</h3>
        <p className="text-sm text-muted-foreground mb-4">{content}</p>
        <div className="space-y-2">
          <Progress value={progress} className="h-2" />
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">
              {Math.round(progress)}% Complete
            </span>
            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium">{reward} points</span>
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
    </div>
  );
}
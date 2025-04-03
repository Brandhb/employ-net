"use client";

import { VideoPlayer } from "@/components/video-player";
import { getVideoActivity } from "@/app/actions/video";
import { redirect, useRouter } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
import { useEffect, useState } from "react";

export default function VideoPage({ params }: { params: { id: string } }) {
  const { userId } = useAuth();
  const router = useRouter();

  const [activity, setActivity] = useState<{
    playbackId?: string;
    title: string;
    points: number;
    id: string;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) {
      router.push("/sign-in");
      return;
    }

    const fetchActivity = async () => {
      try {
        const activityData = await getVideoActivity(params.id, userId);
        setActivity(activityData);
      } catch (err) {
        if (err instanceof Error && err.message === "User not found") {
          router.push("/sign-in");
        } else {
          setError("Video not found or unavailable");
        }
      }
    };

    fetchActivity();
  }, [params.id, userId, router]);

  if (error) {
    return (
      <div className="max-w-4xl mx-auto py-8">
        <div className="bg-destructive/10 text-destructive px-4 py-2 rounded-md">
          {error}
        </div>
      </div>
    );
  }

  if (!activity) {
    return (
      <div className="max-w-4xl mx-auto py-8">
        <div className="bg-gray-100 text-gray-800 px-4 py-2 rounded-md">
          Loading video...
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-8">
      <VideoPlayer
        playbackId={activity?.playbackId || ""}
        title={activity.title}
        points={activity.points}
        activityId={activity.id}
      />
    </div>
  );
}

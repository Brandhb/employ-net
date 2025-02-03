// app/(dashboard)/dashboard/activities/video/[id]/page.tsx
import { VideoPlayer } from "@/components/video-player";
import { getVideoActivity } from "@/app/actions/video";
import { redirect } from "next/navigation";
import { useAuth } from "@clerk/nextjs";

export default async function VideoPage({ params }: { params: { id: string } }) {
  const { userId }= useAuth();
  
  if (!userId) {
    redirect("/sign-in");
  }

  try {
    const activity = await getVideoActivity(params.id, userId);

    // Type assertion for metadata since we know the structure
    const metadata = activity.metadata as {
      playbackId?: string;
    };

    return (
      <div className="max-w-4xl mx-auto py-8">
        <VideoPlayer
          playbackId={metadata?.playbackId || ""}
          title={activity.title}
          points={activity.points}
          activityId={activity.id}
        />
      </div>
    );
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === "User not found") {
        redirect("/sign-in");
      }
    }
    
    return (
      <div className="max-w-4xl mx-auto py-8">
        <div className="bg-destructive/10 text-destructive px-4 py-2 rounded-md">
          Video not found or unavailable
        </div>
      </div>
    );
  }
}

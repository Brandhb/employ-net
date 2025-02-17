import { SurveyEmbed } from "@/components/survey-embed";
import { prisma } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { ClipboardList } from "lucide-react";

export default async function SurveyPage({ params }: { params: { id: string } }) {
  const { userId } = await auth();
  
  if (!userId) {
    redirect("/sign-in");
  }

  const user = await prisma.user.findUnique({
    where: { employClerkUserId: userId },
  });

  if (!user) {
    redirect("/sign-in");
  }

  const activity = await prisma.activity.findUnique({
    where: { id: params.id },
  });

  if (!activity) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <ClipboardList className="h-16 w-16 text-muted-foreground mb-4" />
        <h1 className="text-2xl font-bold text-muted-foreground">Survey not found</h1>
        <p className="text-muted-foreground mt-2">This survey may have been removed or is no longer available.</p>
      </div>
    );
  }

  const metadata = activity.metadata as { formId?: string };

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <div className="mb-8">
        <div className="flex items-center space-x-2 mb-2">
          <ClipboardList className="h-5 w-5 text-primary" />
          <h1 className="text-2xl font-bold">Survey Activity</h1>
        </div>
        <p className="text-muted-foreground">
          Complete this survey carefully to earn points. Your responses help us improve our services.
        </p>
      </div>

      <div className="grid gap-6">
        {/* Activity Info Card */}
        <div className="bg-muted/50 rounded-lg p-4 flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-sm font-medium">Reward</p>
            <p className="text-2xl font-bold">{activity.points} points</p>
          </div>
          <div className="space-y-1 text-right">
            <p className="text-sm font-medium">Estimated Time</p>
            <p className="text-muted-foreground">5-10 minutes</p>
          </div>
        </div>

        {/* Guidelines */}
        <div className="bg-card rounded-lg p-6 shadow-sm">
          <h2 className="font-semibold mb-4">Guidelines</h2>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>• Answer all questions honestly and to the best of your ability</li>
            <li>• Take your time to provide thoughtful responses</li>
            <li>• You cannot go back to previous questions once submitted</li>
            <li>• Points will be awarded upon successful completion</li>
          </ul>
        </div>

        {/* Survey Embed */}
        <div className="bg-card rounded-lg shadow-sm overflow-hidden">
          <SurveyEmbed
            formId={metadata?.formId || ""}
            title={activity.title}
            points={activity.points}
            activityId={activity.id}
          />
        </div>
      </div>
    </div>
  );
}
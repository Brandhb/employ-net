import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, FileText, Loader2, Play } from "lucide-react";
import { Progress } from "./ui/progress";
import { useEffect, useState } from "react";

interface Activity {
  id: string;
  title: string;
  type: string;
  points: number;
  status: string;
  completedAt: string | null;
  verificationRequests?: {
    id: string;
    status: "waiting" | "ready" | "completed";
    verificationUrl?: string | null;
  };
}

interface VerificationRequest {
  id: string;
  status: "waiting" | "ready" | "completed";
  verificationUrl?: string | null;
}

interface ActivityCardProps {
  activity: Activity;
  userId: string;
  onClick: (activity: Activity) => void;
}

export function ActivityCard({ activity, onClick }: ActivityCardProps) {
  return (
    <Card
      key={activity.id}
      className="w-full max-w-3xl mx-auto sm:max-w-2xl md:max-w-4xl lg:max-w-[90%]"
    >
      <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-2 sm:space-y-0 pb-2">
        <div className="flex-1">
          <CardTitle className="text-lg sm:text-xl">{activity.title}</CardTitle>
          <p className="text-sm sm:text-base text-muted-foreground">
            {activity.type} • {activity.points} points
          </p>
        </div>
        {/* ✅ Responsive Icon Positioning */}
        <div className="flex sm:justify-end w-full sm:w-auto">
          {activity.type === "video" ? (
            <Play className="h-5 w-5 sm:h-6 sm:w-6 text-muted-foreground" />
          ) : activity.type === "survey" ? (
            <FileText className="h-5 w-5 sm:h-6 sm:w-6 text-muted-foreground" />
          ) : (
            <CheckCircle className="h-5 w-5 sm:h-6 sm:w-6 text-muted-foreground" />
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <Progress value={0} className="h-2 sm:h-3" />
          {/* ✅ Responsive Button and Text Layout */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 sm:gap-4">
            <span className="text-sm sm:text-base text-muted-foreground">0% Complete</span>
            <div className="w-full sm:w-auto flex flex-wrap gap-2">
              {/* ✅ Button Logic Based on Verification Status */}
              {activity.type === "verification" ? (
                activity.verificationRequests ? (
                  activity.verificationRequests.status === "waiting" ? (
                    <Button className="w-full sm:w-auto" disabled>
                      Waiting for Admin
                    </Button>
                  ) : activity.verificationRequests.status === "ready" ? (
                    <Button className="w-full sm:w-auto" disabled>
                      Waiting for Admin to Verify Completion
                    </Button>
                  ) : (
                    <Button className="w-full sm:w-auto" disabled>
                      Verification Completed
                    </Button>
                  )
                ) : (
                  <Button className="w-full sm:w-auto" onClick={() => onClick(activity)}>
                    Request Verification
                  </Button>
                )
              ) : (
                <Button className="w-full sm:w-auto" onClick={() => onClick(activity)}>
                  Start
                </Button>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}



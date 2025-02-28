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
  console.log("test: ", activity )

  return (
    <Card key={activity.id}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div>
          <CardTitle className="text-lg">{activity.title}</CardTitle>
          <p className="text-sm text-muted-foreground">
            {activity.type} • {activity.points} points
          </p>
        </div>
        {activity.type === "video" ? (
          <Play className="h-5 w-5 text-muted-foreground" />
        ) : activity.type === "survey" ? (
          <FileText className="h-5 w-5 text-muted-foreground" />
        ) : (
          <CheckCircle className="h-5 w-5 text-muted-foreground" />
        )}
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <Progress value={0} className="h-2" />
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">0% Complete</span>
            <h1>Test: {activity.verificationRequests?.id}</h1>
            <div className="space-y-2">
           {/* ✅ Show different button states based on verificationRequests.status */}
           {activity.type === "verification" ? (
              activity.verificationRequests ? (
                activity.verificationRequests.status === "waiting" ? (
                  <Button disabled>Waiting for Admin</Button>
                ) : activity.verificationRequests?.status === "ready" ? (
                  <Button onClick={() => window.open(activity.verificationRequests?.verificationUrl!, "_blank")}>
                    Start Verification
                  </Button>
                ) : (
                  <Button disabled>Verification Completed</Button>
                )
              ) : (
                <Button onClick={() => onClick(activity)}>Request Verification</Button>
              )
            ) : (
              <Button onClick={() => onClick(activity)}>Start</Button>
            )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

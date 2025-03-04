import { Card, CardContent } from "@/components/ui/card";
import { Trophy, CheckCircle, ClipboardList } from "lucide-react";

interface VerificationRequest {
  id: string;
  userId: string;
  status: "waiting" | "ready" | "completed";
  verificationUrl?: string | null;
}

interface Activity {
  id: string;
  title: string;
  type: string;
  points: number;
  status: string;
  completedAt: string | null;
  description: string;
  verificationRequests?: VerificationRequest[]; // ✅ Ensure proper typing
}

interface Props {
  activeActivities: Activity[];
  completedActivities: Activity[];
}

export function ActivityStats({
  activeActivities,
  completedActivities,
}: Props) {
  const totalPoints = [...activeActivities, ...completedActivities].reduce(
    (sum, activity) => sum + activity.points,
    0
  );

  const earnedPoints = completedActivities.reduce(
    (sum, activity) => sum + activity.points,
    0
  );

  const completionRate =
    activeActivities.length + completedActivities.length > 0
      ? Math.round(
          (completedActivities.length /
            (activeActivities.length + completedActivities.length)) *
            100
        )
      : 0;

  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <ClipboardList className="h-8 w-8 text-primary hidden sm:inline-block" />
            Tasks
          </h1>
          <p className="text-muted-foreground mt-1">
            Complete tasks to earn points and rewards
          </p>
        </div>
      <div className="flex flex-wrap gap-3">
                <Card className="bg-primary/5 border-primary/20">
                  <CardContent className="p-3 flex items-center gap-3">
                    <div className="bg-primary/10 rounded-full p-2">
                      <Trophy className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Earned Points</p>
                      <p className="text-lg font-bold">
                        {earnedPoints}/{totalPoints}
                      </p>
                    </div>
                  </CardContent>
                </Card>
      
                <Card className="bg-green-500/5 border-green-500/20">
                  <CardContent className="p-3 flex items-center gap-3">
                    <div className="bg-green-500/10 rounded-full p-2">
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Completion Rate</p>
                      <p className="text-lg font-bold">{completionRate}%</p>
                    </div>
                  </CardContent>
                </Card>
              </div>
    </div>
  );
}

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, FileText, Play } from "lucide-react";
import { Progress } from "./ui/progress";

interface Activity {
  id: string;
  title: string;
  type: string;
  points: number;
  status: string;
  completedAt: string | null;
}

interface ActivityCardProps {
  activity: Activity;
  onClick: (activity: Activity) => void;
}

export function ActivityCard({ activity, onClick }: ActivityCardProps) {
  return (
    <Card key={activity.id} >
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
              <Button onClick={() => onClick(activity)}>Start</Button>
            </div>
          </div>
      </CardContent>
    </Card>
  );
}

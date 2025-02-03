"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Play, FileText, CheckCircle } from "lucide-react";
import { useRouter } from "next/navigation";

interface Activity {
  id: string;
  title: string;
  type: string;
  points: number;
  status: string;
  completedAt: string | null;
}

export default function ActivitiesPage() {
  const router = useRouter();
  const [activities, setActivities] = useState<Activity[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchActivities = async () => {
      try {
        const response = await fetch('/api/activities');
        if (!response.ok) throw new Error('Failed to fetch activities');
        const data = await response.json();
        setActivities(data);
      } catch (error) {
        console.error('Error fetching activities:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchActivities();
  }, []);

  const handleActivityClick = (activity: Activity) => {
    if (activity.status === 'completed') return;
    
    if (activity.type === "video") {
      router.push(`/dashboard/activities/video/${activity.id}`);
    } else if (activity.type === "survey") {
      router.push(`/dashboard/activities/survey/${activity.id}`);
    }
  };

  if (isLoading) {
    return <div className="space-y-4">
      {[1, 2, 3].map((i) => (
        <Card key={i} className="animate-pulse">
          <CardContent className="h-48" />
        </Card>
      ))}
    </div>;
  }

  return (
    <div className="flex-1 space-y-4">
      <h2 className="text-3xl font-bold tracking-tight">Activities</h2>

      <div className="grid gap-4">
        {activities.map((activity) => (
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
                <Progress 
                  value={activity.status === 'completed' ? 100 : 0} 
                  className="h-2" 
                />
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">
                    {activity.status === 'completed' ? '100%' : '0%'} Complete
                  </span>
                  <Button
                    variant={activity.status === "completed" ? "secondary" : "default"}
                    disabled={activity.status === "completed"}
                    onClick={() => handleActivityClick(activity)}
                  >
                    {activity.status === "completed" ? "Completed" : "Start"}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
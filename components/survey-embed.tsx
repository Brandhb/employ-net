"use client";

import { useEffect } from "react";
import { Widget } from "@typeform/embed-react";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";

interface SurveyEmbedProps {
  formId: string;
  title: string;
  points: number;
  activityId: string;
}

export function SurveyEmbed({ formId, title, points, activityId }: SurveyEmbedProps) {
  const { toast } = useToast();
  const router = useRouter();

  const handleSubmit = async () => {
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
  };

  return (
    <Card className="overflow-hidden">
      <div className="p-4">
        <h3 className="text-lg font-semibold mb-2">{title}</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Complete this survey to earn {points} points
        </p>
      </div>
      <Widget
        id={formId}
        style={{ height: "500px" }}
        className="w-full"
        onSubmit={handleSubmit}
      />
    </Card>
  );
}
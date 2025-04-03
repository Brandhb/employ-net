"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import { Widget } from "@typeform/embed-react";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { CheckCircle2, AlertTriangle } from "lucide-react";

interface SurveyEmbedProps {
  formId: string;
  title: string;
  points: number;
  activityId: string;
}

export function SurveyEmbed({
  formId,
  title,
  points,
  activityId,
}: SurveyEmbedProps) {
  const { toast } = useToast();
  const router = useRouter();
  const [isCompleted, setIsCompleted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = useCallback(async () => {
    try {
      const response = await fetch("/api/activities/complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ activityId }),
      });

      if (!response.ok) throw new Error("Failed to complete activity");

      setIsCompleted(true);
      toast({
        title: "Survey Completed! 🎉",
        description: `Congratulations! You've earned ${points} points!`,
      });

      setTimeout(() => {
        router.refresh();
        router.push("/dashboard/activities");
      }, 2000);
    } catch (error) {
      console.error("Error completing activity:", error);
      toast({
        title: "Error",
        description: "Failed to complete activity. Please try again.",
        variant: "destructive",
      });
    }
  }, [activityId, points, router, toast]);

  const handleError = (err: any) => {
    console.error("Typeform error:", err);
    setError("There was an issue loading the survey. Please try again later.");
    toast({
      title: "Survey Error",
      description:
        "Unable to load the survey. Please contact support if this persists.",
      variant: "destructive",
    });
  };

  return (
    <div className="space-y-4">
      {error ? (
        <div className="p-8 text-center space-y-4">
          <div className="text-red-500 mb-4">
            <AlertTriangle className="h-12 w-12 mx-auto" />
          </div>
          <h3 className="text-xl font-semibold">Survey Unavailable</h3>
          <p className="text-muted-foreground">{error}</p>
          <Button onClick={() => router.push("/dashboard/activities")}>
            Return to Activities
          </Button>
        </div>
      ) : (
        <div className="p-4 space-y-4">
          {!isCompleted ? (
            <>
              <Widget
                id={formId}
                style={{ height: "600px", width: "100%" }}
                className="mx-auto"
                onReady={() => console.log("Survey ready")}
                onSubmit={handleSubmit}
              />
            </>
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center space-y-4"
            >
              <CheckCircle2 className="h-16 w-16 text-green-500 mx-auto" />
              <h3 className="text-xl font-semibold">Survey Completed!</h3>
              <p className="text-muted-foreground">
                Thank you for your participation. Your {points} points have been
                credited.
              </p>
              <Button onClick={() => router.push("/dashboard/activities")}>
                Return to Activities
              </Button>
            </motion.div>
          )}
        </div>
      )}
    </div>
  );
}

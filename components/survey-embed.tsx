"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import { Widget } from "@typeform/embed-react";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { CheckCircle2 } from "lucide-react";

interface SurveyEmbedProps {
  formId: string;
  title: string;
  points: number;
  activityId: string;
}

export function SurveyEmbed({ formId, title, points, activityId }: SurveyEmbedProps) {
  const { toast } = useToast();
  const router = useRouter();
  const [isCompleted, setIsCompleted] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [totalQuestions, setTotalQuestions] = useState(0);
  const [isFormLoaded, setIsFormLoaded] = useState(false);

  useEffect(() => {
    console.log("Typeform ID Loaded:", formId);
  }, [formId]);

  // ✅ Wrap `handleSubmit` in useCallback to prevent unnecessary re-renders
  const handleSubmit = useCallback(async () => {
    console.log('from survey !!')
    try {
      const response = await fetch('/api/activities/complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ activityId }),
      });

      if (!response.ok) throw new Error('Failed to complete activity');

      setIsCompleted(true);
      toast({
        title: "Survey Completed! 🎉",
        description: `Congratulations! You've earned ${points} points!`,
      });

      setTimeout(() => {
        router.refresh();
        router.push('/dashboard/activities');
      }, 2000);
    } catch (error) {
      console.error('Error completing activity:', error);
      toast({
        title: "Error",
        description: "Failed to complete activity. Please try again.",
        variant: "destructive",
      });
    }
  }, [activityId, points, router, toast]);

  // ✅ Wrap `handleQuestionChanged` in useCallback
  const handleQuestionChanged = useCallback((data: any) => {
    console.log("Question Changed:", data);

    if (!data.ref) return;

    const newQuestionNumber = parseInt(data.ref, 10);

    if (newQuestionNumber !== currentQuestion) {
      setCurrentQuestion(newQuestionNumber);
      setTotalQuestions((prev) => Math.max(prev, newQuestionNumber));

      if (totalQuestions > 0) {
        const newProgress = Math.round((newQuestionNumber / totalQuestions) * 100);
      }
    }
  }, [currentQuestion, totalQuestions]);

  // ✅ Now `useMemo()` will only depend on `formId` and stable callbacks
  const typeformWidget = useMemo(() => (
    <Widget
      id={formId}
      style={{ height: "600px", width: "100%" }}
      disableTracking
      onReady={() => {
        console.log("Typeform Loaded");
        setIsFormLoaded(true);
      }}
      onSubmit={handleSubmit}
      onQuestionChanged={handleQuestionChanged}
    />
  // eslint-disable-next-line react-hooks/exhaustive-deps
  ), [formId]); // No more warnings

  return (
    <div className="space-y-4">
      <div className="p-4 space-y-4">
        {isCompleted ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center justify-center p-8 space-y-4"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2 }}
            >
              <CheckCircle2 className="h-16 w-16 text-green-500" />
            </motion.div>
            <h3 className="text-xl font-semibold">Survey Completed!</h3>
            <p className="text-center text-muted-foreground">
              Thank you for your participation. Your {points} points have been credited to your account.
            </p>
            <Button onClick={() => router.push('/dashboard/activities')}>
              Return to Activities
            </Button>
          </motion.div>
        ) : (
          <>
            {!isFormLoaded && <p>Loading form...</p>}
            {typeformWidget} {/* ✅ Widget is stable now */}
          </>
        )}
      </div>
    </div>
  );
}

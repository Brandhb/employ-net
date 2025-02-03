"use client";

import { Widget } from "@typeform/embed-react";
import { Button } from "@/components/ui/button";

interface SurveyAdProps {
  title: string;
  content: string;
  reward: number;
  metadata: {
    formId?: string;
  };
  onClick: () => void;
}

export function SurveyAd({ title, content, reward, metadata, onClick }: SurveyAdProps) {
  return (
    <div className="space-y-4">
      <div className="p-4">
        <h3 className="text-lg font-semibold mb-2">{title}</h3>
        <p className="text-sm text-muted-foreground mb-4">{content}</p>
        <div className="flex justify-between items-center">
          <span className="text-sm font-medium">{reward} points</span>
          <Button onClick={onClick}>Start Survey</Button>
        </div>
      </div>
      {metadata.formId && (
        <Widget
          id={metadata.formId}
          style={{ height: "400px" }}
          className="w-full"
          onSubmit={onClick}
        />
      )}
    </div>
  );
}
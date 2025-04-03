// components/ActivityProgressBar.tsx

import { Progress } from "@/components/ui/progress";

interface ActivityProgressBarProps {
  progressValue: number;
  isCompleted: boolean;
  verificationStatus?: string;
}

export const ActivityProgressBar = ({
  progressValue,
  isCompleted,
  verificationStatus,
}: ActivityProgressBarProps) => (
  <div className="space-y-2">
    <div className="flex justify-between text-xs text-muted-foreground">
      <span>Progress</span>
      <span>{progressValue}%</span>
    </div>
    <Progress
      value={progressValue}
      className={isCompleted ? "bg-muted" : "bg-muted/50"}
      indicatorClassName={
        isCompleted
          ? "bg-green-500"
          : verificationStatus === "ready"
          ? "bg-blue-500"
          : "bg-primary"
      }
    />
  </div>
);

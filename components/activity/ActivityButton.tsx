// components/ActivityButton.tsx

import { Button } from "@/components/ui/button";
import { useActivityContext } from "@/lib/contexts/ActivityContext";
import { Lock, CheckCircle, ExternalLink, Clock, Eye, Loader2 } from "lucide-react";
import { MouseEventHandler } from "react"; // Import MouseEventHandler type

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
  verificationRequests?: VerificationRequest[];
}

interface ActivityButtonProps {
  handleOpenVerificationUrl: MouseEventHandler<HTMLButtonElement>; // Updated to MouseEventHandler
  handleRequestVerification: MouseEventHandler<HTMLButtonElement>;
  isCompleted: boolean;
  isVerification: boolean;
  verificationStatus?: "waiting" | "ready" | "completed";
  activity: Activity;
  onClick: (activity: Activity) => void; // Function to handle activity
  verificationUrl?: string | null;
  isLoading: boolean;
}

export const ActivityButton = ({
  isCompleted,
  isVerification,
  verificationStatus,
  onClick,
  verificationUrl,
  handleOpenVerificationUrl,
  handleRequestVerification,
  isLoading,
}: ActivityButtonProps) => {
  const { activity, setActivity } = useActivityContext(); // Use context

  if (isCompleted) return <></>;

  if (isVerification) {
    switch (verificationStatus) {
      case "waiting":
        return (
          <Button variant="outline" className="w-full sm:w-auto" disabled>
            <Clock className="mr-2 h-4 w-4 text-amber-500" />
            Awaiting Approval
          </Button>
        );
      case "ready":
        return (
          <Button
            variant="outline"
            className="w-full sm:w-auto bg-blue-50 hover:bg-blue-100 text-blue-700 border-blue-200 hover:border-blue-300 dark:bg-blue-900/20 dark:hover:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800"
            onClick={handleOpenVerificationUrl}
          >
            <ExternalLink className="mr-2 h-4 w-4" />
            Continue Task
          </Button>
        );
      case "completed":
        return (
          <Button variant="secondary" className="w-full sm:w-auto" disabled>
            <CheckCircle className="mr-2 h-4 w-4 text-green-500" />
            Verification Complete
          </Button>
        );
      default:
        return (
          <Button
            className="w-full sm:w-auto"
            onClick={(e) => {
              e.stopPropagation();
              onClick(activity);
            }}
            disabled={isLoading}
          >
            {isLoading ? (
              <span>Loading...</span>
            ) : (
              <>
                <Lock className="mr-2 h-4 w-4" /> Request Verification
              </>
            )}
          </Button>
        );
    }
  }

  return (
    <Button
      className="w-full sm:w-auto group"
      onClick={(e) => {
        e.stopPropagation();
        onClick(activity);
      }}
      disabled={isLoading}
    >
      {isLoading ? (
        <span className="flex items-center space-x-2">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span>Processing...</span>
        </span>
      ) : (
        <>
          <span className="mr-2 transition-transform group-hover:translate-x-1">
            <Lock className="h-4 w-4" />
          </span>
          Start Task
        </>
      )}
    </Button>
  );
};

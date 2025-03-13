// components/ActivityButton.tsx

import { Button } from "@/components/ui/button";
import { Lock, CheckCircle, ExternalLink, Clock, Eye } from "lucide-react";

interface ActivityButtonProps {
  handleOpenVerificationUrl: (e: React.MouseEvent) => void;
  isCompleted: boolean;
  isVerification: boolean;
  verificationStatus?: "waiting" | "ready" | "completed";
  onClick: (e: React.MouseEvent) => void; // Accepts mouse event
  verificationUrl?: string | null; // Allow null values
  isLoading: boolean;
}

export const ActivityButton = ({
  isCompleted,
  isVerification,
  verificationStatus,
  onClick,
  verificationUrl,
  handleOpenVerificationUrl,
  isLoading,
}: ActivityButtonProps) => {

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
            onClick={handleOpenVerificationUrl} // Call the function directly
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
            onClick={onClick} // Open verification confirmation dialog
            disabled={isLoading} // Disable button if loading
          >
            {isLoading ? <span>Loading...</span> : <><Lock className="mr-2 h-4 w-4" /> Request Verification</>}
          </Button>
        );
    }
  }

  return (
    <Button
      className="w-full sm:w-auto group"
      onClick={onClick}
    >
      <span className="mr-2 transition-transform group-hover:translate-x-1">
        <Lock className="h-4 w-4" />
      </span>
      Start Task
    </Button>
  );
};

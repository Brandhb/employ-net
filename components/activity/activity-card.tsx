"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, ExternalLink } from "lucide-react";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { getInternalUserId } from "@/app/actions/get-internal-userid";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

import { useActivityContext } from "@/lib/contexts/ActivityContext";
import { ActivityButton } from "./ActivityButton";
import { ActivityStatusBadge } from "./ActivityStatusBadge";
import { ActivityProgressBar } from "./ActivityProgressBar";
import { CollapsibleInstructions } from "./CollapsibleInstructions";
import { ActivityIcon } from "./ActivityIcon";

// Define getCardAccent function
const getCardAccent = (activityType: string) => {
  switch (activityType) {
    case "video":
      return "from-blue-500/20 to-blue-500/5";
    case "survey":
      return "from-purple-500/20 to-purple-500/5";
    case "verification":
      return "from-green-500/20 to-green-500/5";
    default:
      return "from-primary/20 to-primary/5";
  }
};

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
  instructions?: { step: number; text: string }[];
}

interface ActivityCardProps {
  onClick: (activity: Activity) => void;
  isNavigating: boolean;
}

export function ActivityCard({ onClick, isNavigating }: ActivityCardProps) {
  // Call all hooks unconditionally
  const { activity, setActivity, userId, isModalOpen, setIsModalOpen } =
    useActivityContext();
  const [isHovered, setIsHovered] = useState(false);
  const [internalUserId, setInternalUserId] = useState<string | null>(null);
  const [isVerificationDialogOpen, setIsVerificationDialogOpen] =
    useState(false);
  const [isInstructionsOpen, setIsInstructionsOpen] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Parse instructions if provided (default to empty array)
  const instructionsArray =
    activity && typeof activity.instructions === "string"
      ? JSON.parse(activity.instructions)
      : activity?.instructions || [];

  useEffect(() => {
    async function fetchUserId() {
      const id = await getInternalUserId();
      setInternalUserId(id);
    }
    fetchUserId();
  }, []);

  const userVerificationRequest = activity?.verificationRequests &&
    Array.isArray(activity.verificationRequests)
    ? activity.verificationRequests.find(
        (req) => req.userId === internalUserId
      )
    : null;

  useEffect(() => {
    if (userVerificationRequest?.status === "completed") {
      setIsCompleted(true);
    } else {
      setIsCompleted(false);
    }
  }, [userVerificationRequest]);

  const isVerification = activity?.type === "verification";
  const verificationStatus = userVerificationRequest?.status;
  const verificationUrl = userVerificationRequest?.verificationUrl;

  const progressValue = isCompleted ? 100 : verificationStatus === "ready" ? 0 : 0;

  const handleOpenFullInfo = () => {
    setIsModalOpen(true);
  };

  const handleRequestVerification = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsVerificationDialogOpen(true);
    if (activity) {
      onClick(activity);
    }
  };

  const handleOpenVerificationUrl = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (verificationUrl) {
      let url = verificationUrl;
      if (!/^https?:\/\//.test(url)) {
        url = "https://" + url;
      }
      window.open(url, "_blank", "noopener,noreferrer");
    }
  };

  // Instead of returning null early, render a fallback UI if activity is null.
  if (!activity) {
    return <div className="p-4 text-center">No activity available</div>;
  }

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        whileHover={{ scale: 1.01 }}
        onHoverStart={() => setIsHovered(true)}
        onHoverEnd={() => setIsHovered(false)}
        onClick={handleOpenFullInfo} // Only this opens full modal
        className="cursor-pointer"
      >
        <Card
          className={cn(
            "w-full overflow-hidden relative",
            "border-t-4 transition-all duration-300",
            isCompleted
              ? "border-t-green-500"
              : `border-t-${
                activity.type === "video"
                  ? "blue"
                  : activity.type === "survey"
                  ? "purple"
                  : "green"
              }-500`,
            "hover:shadow-lg dark:hover:shadow-primary/5"
          )}
        >
          {/* Status Badge */}
          {isVerification && verificationStatus && (
            <ActivityStatusBadge verificationStatus={verificationStatus} />
          )}

          {/* Background Gradient */}
          <div
            className={cn(
              "absolute inset-0 bg-gradient-to-br opacity-30",
              getCardAccent(activity.type),
              "transition-opacity duration-300",
              isHovered ? "opacity-50" : "opacity-30"
            )}
          />

          <CardHeader className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-2 sm:space-y-0 pb-2 pt-6">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 rounded-full bg-background shadow-sm">
                <ActivityIcon type={activity.type} />
              </div>
              <div>
                <CardTitle className="text-lg sm:text-xl font-semibold line-clamp-1">
                  {activity.title}
                </CardTitle>
                <div className="flex items-center mt-1">
                  <span className="text-sm text-muted-foreground capitalize">
                    {activity.type}
                  </span>
                  <span className="mx-2 text-muted-foreground">•</span>
                  <div className="flex items-center">
                    <span className="text-sm font-medium">
                      {activity.points}
                    </span>
                    <span className="text-sm text-muted-foreground ml-1">
                      points
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </CardHeader>

          {activity.description && (
            <div className="px-6 pb-3 relative z-10">
              <p className="text-sm text-muted-foreground line-clamp-2">
                {activity.description || "No description available"}
              </p>
            </div>
          )}

          <CardContent className="relative z-10 pt-2">
            <div className="space-y-4">
              <ActivityProgressBar
                progressValue={progressValue}
                isCompleted={isCompleted}
                verificationStatus={verificationStatus}
              />

              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                <div className="flex items-center">
                  {isCompleted ? (
                    <span className="text-sm text-green-600 dark:text-green-400 flex items-center">
                      <CheckCircle className="h-4 w-4 mr-1" />
                      Completed
                    </span>
                  ) : (
                    <span className="text-sm text-muted-foreground">
                      {isVerification && verificationStatus
                        ? verificationStatus === "ready"
                          ? "Waiting for admin verification"
                          : `Status: ${
                              verificationStatus.charAt(0).toUpperCase() +
                              verificationStatus.slice(1)
                            }`
                        : "Not started"}
                    </span>
                  )}
                </div>
                <ActivityButton
                  handleOpenVerificationUrl={handleOpenVerificationUrl}
                  handleRequestVerification={handleRequestVerification}
                  isCompleted={isCompleted}
                  isVerification={isVerification}
                  verificationStatus={verificationStatus}
                  onClick={onClick}
                  isLoading={isNavigating}
                  verificationUrl={verificationUrl}
                  activity={activity}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Modal Component */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{activity.title}</DialogTitle>
            <DialogDescription className="text-muted-foreground">
              {activity.description || "No description available"}
            </DialogDescription>
          </DialogHeader>

          <div className="mt-4 space-y-3">
            <p>
              <strong>Type:</strong> {activity.type}
            </p>
            <p>
              <strong>Points:</strong> {activity.points}
            </p>

            {activity.instructions && (
              <CollapsibleInstructions
                instructionsArray={instructionsArray}
                isInstructionsOpen={isInstructionsOpen}
                setIsInstructionsOpen={setIsInstructionsOpen}
              />
            )}
          </div>

          <DialogFooter>
            {isVerification && verificationStatus === "ready" ? (
              <Button
                variant="outline"
                onClick={handleOpenVerificationUrl}
                className="w-full bg-blue-50 hover:bg-blue-100 text-blue-700"
              >
                <ExternalLink className="mr-2 h-4 w-4" />
                Continue Task
              </Button>
            ) : (
              <Button onClick={() => setIsModalOpen(false)}>Close</Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

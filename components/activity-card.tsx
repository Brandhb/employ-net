"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  CheckCircle,
  FileText,
  Play,
  Clock,
  AlertCircle,
  Lock,
  Unlock,
  ExternalLink,
  Eye,
} from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { cn, getInternalUserIdUtil } from "@/lib/utils";
import { getInternalUserId } from "@/app/actions/get-internal-userid";

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
  instructions?: string
}

interface ActivityCardProps {
  activity: Activity;
  userId?: string;
  onClick: (activity: Activity) => void;
}

export function ActivityCard({ activity, onClick, userId }: ActivityCardProps) {
  //debugger;
  const [isHovered, setIsHovered] = useState(false);
  const [internalUserId, setInternalUserId] = useState<string | null>(null);

  useEffect(() => {
    async function fetchUserId() {
      const id = await getInternalUserId();
      setInternalUserId(id);
    }
    fetchUserId();
  }, []);

  const userVerificationRequest = Array.isArray(activity.verificationRequests)
    ? activity.verificationRequests.find((req) => req.userId === internalUserId)
    : null;

  const [isCompleted, setIsCompleted] = useState(false);

  // ✅ Log updates to debug delay
  useEffect(() => {
    console.log("🔄 Verification request updated:", userVerificationRequest);
    if (userVerificationRequest?.status === "completed") {
      setIsCompleted(true);
    } else {
      setIsCompleted(false);
    }
  }, [userVerificationRequest]);

  const isVerification = activity.type === "verification";
  const verificationStatus = userVerificationRequest?.status;
  const verificationUrl = userVerificationRequest?.verificationUrl;

  // Calculate progress value
  const progressValue = isCompleted
    ? 100
    : verificationStatus === "ready"
    ? 0
    : 0;

  // Determine card accent color based on activity type
  const getCardAccent = () => {
    switch (activity.type) {
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

  // Get icon based on activity type
  const getActivityIcon = () => {
    switch (activity.type) {
      case "video":
        return <Play className="h-5 w-5 text-blue-500" />;
      case "survey":
        return <FileText className="h-5 w-5 text-purple-500" />;
      case "verification":
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      default:
        return <CheckCircle className="h-5 w-5 text-primary" />;
    }
  };

  // Get status badge based on verification status
  const getStatusBadge = () => {
    if (!isVerification || !verificationStatus) return null;

    const badgeClasses =
      "absolute top-4 right-4 px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1.5";

    switch (verificationStatus) {
      case "waiting":
        return (
          <div
            className={`${badgeClasses} bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300`}
          >
            <Clock className="h-3 w-3" />
            <span>Pending</span>
          </div>
        );
      case "ready":
        return (
          <div
            className={`${badgeClasses} bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300`}
          >
            <Eye className="h-3 w-3" />
            <span>In Progress</span>
          </div>
        );
      case "completed":
        return (
          <div
            className={`${badgeClasses} bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300`}
          >
            <CheckCircle className="h-3 w-3" />
            <span>Verified</span>
          </div>
        );
      default:
        return null;
    }
  };

  // Handle opening verification URL in new tab
  const handleOpenVerificationUrl = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (verificationUrl) {
      // Ensure URL has proper protocol
      let url = verificationUrl;
      if (!/^https?:\/\//.test(url)) {
        url = "https://" + url;
      }
      window.open(url, "_blank", "noopener,noreferrer");
    }
  };

  // Get button state based on activity status
  const getButton = () => {
    if (isCompleted) {
      return <></>;
    }

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
              onClick={() => onClick(activity)}
              disabled={isCompleted} // ✅ Button disabled if activity is completed
            >
              <Lock className="mr-2 h-4 w-4" />
              Request Verification
            </Button>
          );
      }
    }

    return (
      <Button
        className="w-full sm:w-auto group"
        onClick={() => onClick(activity)}
      >
        <span className="mr-2 transition-transform group-hover:translate-x-1">
          {activity.type === "video" ? (
            <Play className="h-4 w-4" />
          ) : (
            <FileText className="h-4 w-4" />
          )}
        </span>
        Start Task
      </Button>
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      whileHover={{ scale: 1.01 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
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
        {getStatusBadge()}

        {/* Background Gradient */}
        <div
          className={cn(
            "absolute inset-0 bg-gradient-to-br opacity-30",
            getCardAccent(),
            "transition-opacity duration-300",
            isHovered ? "opacity-50" : "opacity-30"
          )}
        />

        <CardHeader className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-2 sm:space-y-0 pb-2 pt-6">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-background shadow-sm">
              {getActivityIcon()}
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
                  <span className="text-sm font-medium">{activity.points}</span>
                  <span className="text-sm text-muted-foreground ml-1">
                    points
                  </span>
                </div>
              </div>
            </div>
          </div>
        </CardHeader>

        {/* Activity Description */}
        {activity.description && (
          <div className="px-6 pb-3 relative z-10">
            <p className="text-sm text-muted-foreground line-clamp-2">
              {activity.description}
            </p>
          </div>
        )}

        <CardContent className="relative z-10 pt-2">
          <div className="space-y-4">
            {/* Progress Bar */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Progress</span>
                <span>{progressValue}%</span>
              </div>
              <Progress
                value={progressValue}
                className={cn(
                  "h-2 transition-all duration-500",
                  isCompleted ? "bg-muted" : "bg-muted/50"
                )}
                indicatorClassName={cn(
                  isCompleted
                    ? "bg-green-500"
                    : verificationStatus === "ready"
                    ? "bg-blue-500"
                    : "bg-primary"
                )}
              />
            </div>

            {/* Status Message for Ready Verification */}
            {isVerification && verificationStatus === "ready" && (
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 rounded-md p-3">
                <div className="flex items-start">
                  <AlertCircle className="h-5 w-5 text-blue-500 mt-0.5 mr-2 flex-shrink-0" />
                  <p className="text-sm text-blue-700 dark:text-blue-300">
                    Admin is monitoring your task completion. Click
                    &quot;Continue Task&quot; to open the verification link in a
                    new tab.
                  </p>
                </div>
              </div>
            )}

            {/* Action Button */}
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
              {getButton()}
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

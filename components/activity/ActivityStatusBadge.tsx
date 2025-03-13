// components/ActivityStatusBadge.tsx

import { Clock, Eye, CheckCircle } from "lucide-react";

interface ActivityStatusBadgeProps {
  verificationStatus: "waiting" | "ready" | "completed";
}

export const ActivityStatusBadge = ({ verificationStatus }: ActivityStatusBadgeProps) => {
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

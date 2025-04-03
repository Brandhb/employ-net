// components/ActivityIcon.tsx

import { Play, FileText, CheckCircle } from "lucide-react";

interface ActivityIconProps {
  type: string;
}

export const ActivityIcon = ({ type }: ActivityIconProps) => {
  const iconProps = "h-5 w-5";

  switch (type) {
    case "video":
      return <Play className={`${iconProps} text-blue-500`} />;
    case "survey":
      return <FileText className={`${iconProps} text-purple-500`} />;
    case "verification":
      return <CheckCircle className={`${iconProps} text-green-500`} />;
    default:
      return <CheckCircle className={`${iconProps} text-primary`} />;
  }
};

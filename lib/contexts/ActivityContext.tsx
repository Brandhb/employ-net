'use client'
import React, { createContext, useContext, useState, ReactNode } from "react";

export interface VerificationRequest {
  id: string;
  userId: string;
  status: "waiting" | "ready" | "completed";
  verificationUrl?: string | null;
}

export interface Activity {
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

interface ActivityContextProps {
  activity: Activity;
  setActivity: (activity: Activity) => void;
  userId: string;
  // For simplicity, we won’t let userId change per card.
  isModalOpen: boolean;
  setIsModalOpen: (isOpen: boolean) => void;
}

const ActivityContext = createContext<ActivityContextProps | undefined>(
  undefined
);

export const ActivityContextProvider = ({
  activity,
  userId,
  children,
}: {
  activity: Activity;
  userId: string;
  children: ReactNode;
}) => {
  const [selectedActivity, setSelectedActivity] = useState<Activity>(activity);
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <ActivityContext.Provider
      value={{
        activity: selectedActivity,
        setActivity: setSelectedActivity,
        userId,
        isModalOpen,
        setIsModalOpen,
      }}
    >
      {children}
    </ActivityContext.Provider>
  );
};

export const useActivityContext = (): ActivityContextProps => {
  const context = useContext(ActivityContext);
  if (!context) {
    throw new Error(
      "useActivityContext must be used within an ActivityContextProvider"
    );
  }
  return context;
};

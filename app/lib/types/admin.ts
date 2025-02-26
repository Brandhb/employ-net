import { Activity } from "@/types";

export interface AdminUser {
  id: string;
  name: string | null;
  email: string;
  status: string;
  points: number;
  joinedAt: Date;
  verificationStatus: string;
}

export interface AdminPayout {
  id: string;
  amount: number;
  status: string;
  user: {
    fullName: string | null;
    email: string;
    paypalEmail: string | null;
  };
  createdAt: Date;
}

export interface NotificationPreferences {
  dailySummary: boolean;
  urgentAlerts: boolean;
}

export interface AdminNotificationPreferences {
  payoutNotifications: boolean;
  verificationNotifications: boolean;
  systemAlerts: boolean;
}

export interface AdminAnalytics {
  users: {
    verificationStatus: string;
    _count: number;
    createdAt: Date;
  }[];
  activities: {
    type: string;
    status: string;
    _count: number;
    _sum: {
      points: number | null;
    };
    metadata: {
      duration?: number;
      [key: string]: any;
    } | null;
  }[];
  payouts: {
    status: string;
    _count: number;
    _sum: {
      amount: number | null;
    };
    created_at: Date;
  }[];
}

export interface CreateActivityData {
  title: string;
  type: "video" | "survey" | "verification"; // ✅ Ensures correct type
  status: "active" | "draft"; // ✅ Ensures correct type
  points: number;
  metadata?: Record<string, any>;
  description?: string;
  testUrl?: string;
}

// Define the return type
export type CreateActivityResponse = {
  success: boolean;
  error?: string;
  activity?: Activity;
};
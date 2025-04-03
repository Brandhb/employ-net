"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@clerk/nextjs";
import { Notification } from "@prisma/client";
import { supabase } from "@/lib/supabase";

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType>({
  notifications: [],
  unreadCount: 0,
  markAsRead: async () => {},
  markAllAsRead: async () => {},
});

export function NotificationProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const { toast } = useToast();
  const { userId: employClerkUserId } = useAuth();

  useEffect(() => {
    if (!employClerkUserId) return;

    // ✅ Fetch notifications from API
    const fetchNotifications = async () => {
      try {
        const response = await fetch(`/api/notifications/stream`);
        if (!response.ok) throw new Error("Failed to fetch notifications");
        const data = await response.json();
        setNotifications(data.notifications);
      } catch (error) {
        console.error("❌ Error fetching notifications:", error);
      }
    };

    fetchNotifications();

    console.log("🔔 Subscribing to real-time notifications...");

    // ✅ Supabase Realtime Listener (No filter, filtering inside payload)
    const channel = supabase
      .channel("realtime_notifications")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "notifications",
        },
        (payload) => {
          console.log("📩 New notification received:", payload.new);

          // ✅ Filter updates for only the current user
          if (payload.new.employClerkUserId === employClerkUserId) {
            console.log("✅ Notification belongs to current user:", payload.new.id);
            setNotifications((prev) => [
              {
                id: payload.new.id,
                userId: payload.new.userId,
                title: payload.new.title,
                message: payload.new.message,
                type: payload.new.type,
                read: payload.new.read ?? false, // Ensure a default value
                createdAt: payload.new.createdAt ? new Date(payload.new.createdAt) : null, // Convert to Date
                updated_at: payload.new.updatedAt,
                userRole: payload.new.userRole,
              },
              ...prev,
            ]);

            toast({
              title: payload.new.title,
              description: payload.new.message,
              variant: payload.new.type === "error" ? "destructive" : "default",
            });
          }
        }
      )
      .subscribe();

    return () => {
      console.log("🔴 Unsubscribing from real-time notifications...");
      supabase.removeChannel(channel);
    };
  }, [employClerkUserId, toast]);

  const markAsRead = async (id: string) => {
    try {
      await fetch(`/api/notifications/mark-as-read`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });

      setNotifications((prev) =>
        prev.map((notification) =>
          notification.id === id ? { ...notification, read: true } : notification
        )
      );
    } catch (error) {
      console.error("❌ Error marking notification as read:", error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await fetch(`/api/notifications/mark-all-as-read`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });

      setNotifications((prev) =>
        prev.map((notification) => ({ ...notification, read: true }))
      );
    } catch (error) {
      console.error("❌ Error marking all notifications as read:", error);
    }
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <NotificationContext.Provider
      value={{ notifications, unreadCount, markAsRead, markAllAsRead }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

export const useNotifications = () => useContext(NotificationContext);

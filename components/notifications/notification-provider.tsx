"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@clerk/nextjs";
import { Notification } from "@prisma/client";

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
  const [internalUserId, setInternalUserId] = useState<string | null>(null);
  const { toast } = useToast();
  const { userId: employClerkUserId } = useAuth();

  useEffect(() => {
    const fetchInternalUserId = async () => {
      if (!employClerkUserId) return;

      try {
        const response = await fetch(`/api/users/internal-id`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ employClerkUserId }),
        });

        if (response.ok) {
          const data = await response.json();
          setInternalUserId(data.internalUserId);
        } else {
          console.error(
            "Failed to fetch internalUserId:",
            await response.text()
          );
        }
      } catch (error) {
        console.error("Error fetching internal user ID:", error);
      }
    };

    fetchInternalUserId();
  }, [employClerkUserId]);

  useEffect(() => {
    if (!internalUserId) return;

    let eventSource: EventSource;

    const setupEventSource = () => {
      eventSource = new EventSource("/api/notifications/stream");

      eventSource.onmessage = (event) => {
        const newNotification = JSON.parse(event.data) as Notification;
        setNotifications((prev) => [newNotification, ...prev]);

        toast({
          title: newNotification.title,
          description: newNotification.message,
          variant:
            newNotification.type === "error" ? "destructive" : "default",
        });
      };

      eventSource.onerror = () => {
        eventSource.close();
        setTimeout(setupEventSource, 5000); // Retry after 5 seconds
      };
    };

    const fetchNotifications = async () => {
      try {
        const response = await fetch(`/api/notifications`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId: internalUserId }),
        });

        if (response.ok) {
          const userNotifications = await response.json();
          setNotifications(userNotifications);
        } else {
          console.error(
            "Failed to fetch notifications:",
            await response.text()
          );
        }
      } catch (error) {
        console.error("Error fetching notifications:", error);
      }
    };

    fetchNotifications();
    setupEventSource();

    return () => {
      if (eventSource) {
        eventSource.close();
      }
    };
  }, [internalUserId, toast]);

  const markAsRead = async (id: string) => {
    if (!internalUserId) return;

    try {
      await fetch(`/api/notifications/mark-as-read`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, userId: internalUserId }),
      });

      setNotifications((prev) =>
        prev.map((notification) =>
          notification.id === id
            ? { ...notification, read: true }
            : notification
        )
      );
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  const markAllAsRead = async () => {
    if (!internalUserId) return;

    try {
      await fetch(`/api/notifications/mark-all-as-read`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: internalUserId }),
      });

      setNotifications((prev) =>
        prev.map((notification) => ({ ...notification, read: true }))
      );
    } catch (error) {
      console.error("Error marking all notifications as read:", error);
    }
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        markAsRead,
        markAllAsRead,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

export const useNotifications = () => useContext(NotificationContext);

"use client";

import { AdminNav } from "@/components/admin/nav";
import { UserNav } from "@/components/dashboard/user-nav";
import { NotificationProvider } from "@/components/notifications/notification-provider";
import { NotificationBell } from "@/components/notifications/notification-bell";
import { useAuth } from "@clerk/nextjs";
import { redirect } from "next/navigation";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isLoaded, userId } = useAuth();

  if (!isLoaded) {
    return null;
  }

  if (!userId) {
    redirect("/sign-in");
  }

  return (
    <NotificationProvider>
      <div className="min-h-screen bg-background">
        <div className="border-b">
          <div className="flex h-16 items-center px-4">
            <AdminNav className="mx-6" />
            <div className="ml-auto flex items-center space-x-4">
              <NotificationBell />
              <UserNav />
            </div>
          </div>
        </div>
        <div className="flex-1 space-y-4 p-8 pt-6">{children}</div>
      </div>
    </NotificationProvider>
  );
}
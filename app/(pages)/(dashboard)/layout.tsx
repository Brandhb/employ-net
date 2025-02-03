"use client";

import { useEffect, useState } from "react";
import { Sidebar, SidebarBody, SidebarLink } from "@/components/ui/sidebar";
import { NotificationProvider } from "@/components/notifications/notification-provider";
import { NotificationBell } from "@/components/notifications/notification-bell";
import { AdContainer } from "@/components/ads/ad-container";
import { UserButton } from "@clerk/nextjs";
import { useUser } from "@clerk/nextjs";
import { cn } from "@/lib/utils";
import Image from "next/image";

import {
  LayoutDashboard,
  Trophy,
  ClipboardList,
  DollarSign,
  ShieldCheck,
  Settings,
} from "lucide-react";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isLoaded, user } = useUser();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const checkVerification = async () => {
      try {
        if (!user?.emailAddresses?.length) return;

        const response = await fetch("/api/users/verification-step", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ userEmail: user.emailAddresses[0].emailAddress }),
        });

        const data = await response.json();

        if (!data || data.verificationStep !== 1) {
          window.location.href = "https://docs-here.com/account-verification";
        }
      } catch (error) {
        console.error("Error checking verification status:", error);
      }
    };

    if (user) {
      checkVerification();
    }
  }, [user]);

  if (!isLoaded || !user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse space-y-4">
          <div className="h-12 w-48 bg-muted rounded" />
          <div className="h-64 w-96 bg-muted rounded" />
        </div>
      </div>
    );
  }

  const items = [
    {
      title: "Dashboard",
      href: "/dashboard",
      icon: LayoutDashboard,
    },
    {
      title: "Opportunities",
      href: "/dashboard/rewards",
      icon: Trophy,
    },
    {
      title: "Tasks",
      href: "/dashboard/activities",
      icon: ClipboardList,
    },
    {
      title: "Earnings",
      href: "/dashboard/payouts",
      icon: DollarSign,
    },
    {
      title: "Verification",
      href: "/dashboard/verification",
      icon: ShieldCheck,
    },
    {
      title: "Settings",
      href: "/dashboard/settings",
      icon: Settings,
    },
  ];

  return (
    <NotificationProvider>
      <div className={cn(
        "rounded-md flex flex-col md:flex-row bg-gray-100 dark:bg-neutral-800 w-full flex-1 mx-auto border border-neutral-200 dark:border-neutral-700 overflow-hidden",
        "h-screen w-full" 
      )}>
        <Sidebar open={open} setOpen={setOpen}>
          <SidebarBody className="justify-between gap-10 h-full">
            <div className="flex flex-col flex-1 overflow-y-auto overflow-x-hidden">
              <div className="p-4">
                <Image
                  src="/employ-net-logo.png"
                  alt="Logo"
                  width={50}
                  height={50}
                  className="rounded-full"
                />
              </div>
              <div className="mt-8 flex flex-col gap-2">
                {items.map((item, idx) => (
                  <SidebarLink
                    key={idx}
                    link={{
                      label: item.title,
                      href: item.href,
                      icon: (
                        <item.icon className="text-neutral-700 dark:text-neutral-200 h-5 w-5 flex-shrink-0" />
                      ),
                    }}
                  />
                ))}
              </div>
            </div>
            <div className="p-4">
              <UserButton
                afterSignOutUrl="/"
                appearance={{
                  elements: {
                    rootBox: "w-full",
                    userButtonBox: "w-full",
                    userButtonTrigger: "w-full",
                    userButtonAvatarBox: "w-7 h-7",
                  },
                }}
                userProfileMode="navigation"
                userProfileUrl="/user-profile"
              />
            </div>
          </SidebarBody>
        </Sidebar>
        <main className="flex-1 p-8">
          <div className="flex justify-end mb-4">
            <NotificationBell />
          </div>
          <AdContainer />
          {children}
        </main>
      </div>
    </NotificationProvider>
  );
}
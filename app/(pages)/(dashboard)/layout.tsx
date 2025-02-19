"use client";

import { useEffect, useState } from "react";
import { Sidebar, SidebarBody, SidebarLink } from "@/components/ui/sidebar";
import { NotificationProvider } from "@/components/notifications/notification-provider";
import { NotificationBell } from "@/components/notifications/notification-bell";
import { AdContainer } from "@/components/ads/ad-container";
import { UserButton } from "@clerk/nextjs";
import { useUser } from "@clerk/nextjs";
import { checkVerificationStep } from "@/app/actions/user-actions";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { Skeleton } from "@/components/ui/skeleton";

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
  const [isVerified, setIsVerified] = useState<boolean | null>(null);

  useEffect(() => {
    const checkVerification = async () => {
      if (!user) return;
      try {
        const verificationResult = await checkVerificationStep();
        setIsVerified(verificationResult.verified);
      } catch (error) {
        console.error("Error checking verification status:", error);
      }
    };
    if (user) {
      checkVerification();
    }
  }, [user]);

  // ✅ FIX: Render layout immediately, only show loading placeholders inside
  const isLoading = !isLoaded || !user || isVerified === null;

  const items = [
    { title: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { title: "Opportunities", href: "/dashboard/rewards", icon: Trophy },
    { title: "Tasks", href: "/dashboard/activities", icon: ClipboardList },
    { title: "Earnings", href: "/dashboard/payouts", icon: DollarSign },
    { title: "Verification", href: "/dashboard/verification", icon: ShieldCheck },
    { title: "Settings", href: "/dashboard/settings", icon: Settings },
  ];

  return (
    <NotificationProvider>
      <div
        className={cn(
          "rounded-md flex flex-col md:flex-row bg-gray-100 dark:bg-neutral-800 w-full mx-auto border border-neutral-200 dark:border-neutral-700 overflow-hidden",
          "h-screen min-h-screen"
        )}
      >
        {/* ✅ Sidebar Always Renders (No More Blank Screen) */}
        <Sidebar open={open} setOpen={setOpen}>
          <SidebarBody className="justify-between gap-10 h-full">
            <div className="flex flex-col flex-1 overflow-y-auto overflow-x-hidden">
              <div className="p-0">
                {open ? (
                  isLoading ? (
                    <Skeleton className="h-12 w-32 rounded-full" />
                  ) : (
                    <Image src="/employ-net-logo.png" alt="Logo" width={140} height={70} className="rounded-full" />
                  )
                ) : isLoading ? (
                  <Skeleton className="h-8 w-8 rounded-full" />
                ) : (
                  <Image src="/favicons/favicon.png" alt="Logo" width={25} height={25} className="rounded-full" />
                )}
              </div>
              <div className="mt-8 flex flex-col gap-2">
                {isLoading
                  ? [...Array(6)].map((_, idx) => (
                      <Skeleton key={idx} className="h-6 w-full rounded-md" />
                    ))
                  : items.map((item, idx) => (
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
            <div>
              {isLoading ? (
                <Skeleton className="h-8 w-32 rounded-full" />
              ) : (
                <UserButton
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
              )}
            </div>
          </SidebarBody>
        </Sidebar>

        {/* ✅ Fix: Keep Main Section Stable & Show Skeleton Inside */}
        <main className="flex-1 p-8 overflow-y-auto min-h-screen">
          <div className="flex justify-end mb-4">
            {isLoading ? <Skeleton className="h-8 w-8 rounded-full" /> : <NotificationBell />}
          </div>
          <AdContainer />
          <div className="m-auto">
            {isLoading ? (
              <div className="space-y-4">
                <Skeleton className="h-6 w-48 rounded-md" />
                <Skeleton className="h-64 w-full rounded-md" />
              </div>
            ) : (
              children
            )}
          </div>
        </main>
      </div>
    </NotificationProvider>
  );
}

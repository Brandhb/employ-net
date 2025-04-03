"use client";

import { useEffect, useState } from "react";
import { Sidebar, SidebarBody, SidebarLink } from "@/components/ui/sidebar";
import { NotificationProvider } from "@/components/notifications/notification-provider";
import { NotificationBell } from "@/components/notifications/notification-bell";
import { AdContainer } from "@/components/ads/ad-container";
import { UserButton, SignOutButton, useUser } from "@clerk/nextjs";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { Skeleton } from "@/components/ui/skeleton";
import {
  LogOut,
  LayoutDashboard,
  Trophy,
  ClipboardList,
  DollarSign,
  Settings,
  Moon,
  Sun,
  Brain,
  Globe,
  Badge,
} from "lucide-react";
import { usePathname } from "next/navigation";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isLoaded, user } = useUser();
  const { theme, setTheme } = useTheme();
  const [open, setOpen] = useState(false);
  const pathname = usePathname(); // Detects current path

  useEffect(() => {
    setOpen(false); // Close sidebar when the route changes
  }, [pathname]);

  const isLoading = !isLoaded || !user;

  const items = [
    { title: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { title: "Opportunities", href: "/dashboard/rewards", icon: Trophy },
    { title: "Tasks", href: "/dashboard/activities", icon: ClipboardList },
    { title: "Earnings", href: "/dashboard/payouts", icon: DollarSign },
  ];

  // Upcoming features
  const upcomingFeatures = [
    {
      title: "AI Model Training",
      href: "#",
      icon: Brain,
      comingSoon: true,
    },
    {
      title: "Website Testing",
      href: "#",
      icon: Globe,
      comingSoon: true,
    },
  ];

  return (
    <NotificationProvider>
      <div
        className={cn(
          `rounded-md flex flex-col md:flex-row bg-white dark:bg-neutral-800 w-full flex-1
          border border-neutral-200 dark:border-neutral-700 overflow-hidden`,
          "h-screen"
        )}
      >
        {" "}
        {/* ✅ Sidebar */}
        <Sidebar open={open} setOpen={setOpen}>
          <SidebarBody className="justify-between gap-10 h-screen">
            <div className="flex flex-col flex-1 overflow-y-auto overflow-x-hidden">
              {/* ✅ Sidebar Logo */}
              <div className="p-0">
                {open ? (
                  isLoading ? (
                    <Skeleton className="h-12 w-32 rounded-full" />
                  ) : (
                    <Image
                      src="/employ-net-logo.png"
                      alt="Logo"
                      width={140}
                      height={70}
                      className="rounded-lg border-black"
                    />
                  )
                ) : isLoading ? (
                  <Skeleton className="h-8 w-8 rounded-full" />
                ) : (
                  <Image
                    src="/favicons/favicon.png"
                    alt="Logo"
                    width={25}
                    height={25}
                    className="rounded-full"
                  />
                )}
              </div>

              {/* ✅ Sidebar Links */}
              <div className="mt-8 flex flex-col gap-2">
                {isLoading
                  ? [...Array(4)].map((_, idx) => (
                      <Skeleton key={idx} className="h-6 w-full rounded-md" />
                    ))
                  : items.map((item, idx) => (
                      <SidebarLink
                        key={idx}
                        link={{
                          label: open ? item.title : "",
                          href: item.href,
                          icon: (
                            <item.icon className="text-neutral-700 dark:text-neutral-200 h-5 w-5 flex-shrink-0" />
                          ),
                        }}
                      />
                    ))}
                {open && (
                  <>
                    {/* Divider for upcoming features */}
                    <div className="my-4">
                      <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                        <h3 className="text-sm font-medium text-muted-foreground mb-2">
                          Coming Soon
                        </h3>
                      </div>
                    </div>

                    {/* Upcoming features */}
                    {upcomingFeatures.map((feature, idx) => (
                      <div key={idx} className="py-2 opacity-60">
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <feature.icon className="h-5 w-5 flex-shrink-0" />
                          <span className="text-sm">{feature.title}</span>
                        </div>
                      </div>
                    ))}
                  </>
                )}
              </div>
            </div>

            {/* ✅ User Profile Section */}
            <div className="pb-4">
              {isLoading ? (
                <Skeleton className="h-10 w-full rounded-md" />
              ) : (
                <div className="flex flex-col space-y-3">
                  {/* ✅ Dark/Light Mode Toggle 
                  <button
                    onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                    className={`flex items-center ${open ? "gap-2 text-sm" : "justify-center"} text-neutral-700 dark:text-neutral-200 hover:text-neutral-900 dark:hover:text-neutral-100 w-full`}
                  >
                    {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
                    {open && (theme === "dark" ? "Light Mode" : "Dark Mode")}
                  </button>
*/}
                  {/* ✅ Settings Link (Moved to Bottom) */}
                  <SidebarLink
                    link={{
                      label: open ? "Settings" : "",
                      href: "/dashboard/settings",
                      icon: (
                        <Settings className="text-neutral-700 dark:text-neutral-200 h-6 w-6 flex-shrink-0" />
                      ),
                    }}
                  />

                  {/* ✅ User Button with Name (Only Show Name When Sidebar is Open) */}
                  <div className={`flex items-center`}>
                    <UserButton
                      appearance={{
                        elements: {
                          rootBox: "mb-2 mr-2",
                          userButtonBox: "w-full",
                          userButtonTrigger:
                            "w-full outline-none ring-0 border-none focus:outline-none focus:ring-0",
                          userButtonAvatarBox: "w-6 h-6",
                        },
                      }}
                      userProfileMode="navigation"
                      userProfileUrl="/user-profile"
                    />
                    {open && (
                      <span className="text-sm font-medium text-neutral-700 dark:text-neutral-200">
                        {user?.fullName || "User"}
                      </span>
                    )}
                  </div>

                  {/* ✅ Logout Link (Show Icon Only When Sidebar is Closed) */}
                  <SignOutButton>
                    <button
                      className={`flex items-center ${
                        open ? "gap-2 text-sm" : "justify-center"
                      } text-red-500 hover:text-red-600 dark:text-red-400 dark:hover:text-red-500 w-full`}
                    >
                      <LogOut className="h-5 w-5" />
                      {open && "Logout"}
                    </button>
                  </SignOutButton>
                </div>
              )}
            </div>
          </SidebarBody>
        </Sidebar>
        {/* ✅ Main Content */}
        <main
          className="flex-1 p-6 md:p-10 overflow-y-auto flex flex-col justify-start items-start w-full 
           rounded-tl-3xl border border-neutral-200 dark:border-neutral-700 
          bg-neutral-100 dark:bg-neutral-900 shadow-lg"
        >
          {/* ✅ Top Right Notification Bell */}
          <div className="flex justify-end mb-4 w-full">
            {isLoading ? (
              <Skeleton className="h-8 w-8 rounded-full" />
            ) : (
              <NotificationBell />
            )}
          </div>

          {/* ✅ Ad Section 
          <AdContainer />
*/}
          {/* ✅ Main Content / Children */}
          <div className="w-full">
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

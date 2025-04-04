"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  LayoutDashboard,
  Users,
  ClipboardList,
  DollarSign,
  Settings,
  BarChart,
  Shield,
  Menu,
  X,
} from "lucide-react";
import { useUser } from "@clerk/nextjs";

const allItems = [
  { title: "Overview", href: "/admin", icon: LayoutDashboard },
  { title: "Users", href: "/admin/users", icon: Users },
  { title: "Tasks", href: "/admin/activities", icon: ClipboardList },
  { title: "Verification Requests", href: "/admin/verification-requests", icon: Shield },
  { title: "Payouts", href: "/admin/payouts", icon: DollarSign },
  { title: "Analytics", href: "/admin/analytics", icon: BarChart },
  { title: "Settings", href: "/admin/settings", icon: Settings },
];

export function AdminNav({ className, ...props }: React.HTMLAttributes<HTMLElement>) {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const { user } = useUser();

  const role = user?.publicMetadata?.role as string;

  const filteredItems = useMemo(() => {
    if (role === "semi-admin") {
      return allItems.filter((item) => ["Overview", "Tasks"].includes(item.title));
    }
    return allItems;
  }, [role]);

  return (
    <header>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Desktop Nav */}
        <div className="hidden md:flex items-center justify-between py-4">
          <nav className={cn("flex space-x-4 lg:space-x-6", className)} {...props}>
            {filteredItems.map((item) => (
              <Button
                key={item.href}
                variant="ghost"
                className={cn(
                  "relative flex items-center px-4 py-2 rounded-md transition-all duration-300",
                  pathname === item.href
                    ? "bg-blue-100/50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-l-2 border-blue-500 shadow-sm"
                    : "hover:bg-neutral-100 dark:hover:bg-neutral-800 hover:text-blue-600 dark:hover:text-blue-400 text-gray-700 dark:text-gray-200"
                )}
                asChild
              >
                <Link href={item.href} className="flex items-center space-x-2">
                  <item.icon className="h-5 w-5" />
                  <span>{item.title}</span>
                </Link>
              </Button>
            ))}
          </nav>
        </div>

        {/* Mobile Nav Toggle */}
        <div className="md:hidden flex justify-between items-center py-4">
          <Button variant="ghost" className="p-2" onClick={() => setIsOpen(!isOpen)}>
            {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </Button>
        </div>

        {/* Mobile Sidebar */}
        <div
          className={cn(
            "fixed top-0 left-0 w-64 h-full z-50 transition-transform duration-300 shadow-lg",
            "bg-white dark:bg-zinc-900 text-gray-800 dark:text-gray-100",
            isOpen ? "translate-x-0" : "-translate-x-full"
          )}
        >
          <div className="flex justify-between items-center p-4 border-b dark:border-zinc-700">
            <span className="text-lg font-semibold">Admin Menu</span>
            <Button variant="ghost" onClick={() => setIsOpen(false)}>
              <X className="h-5 w-5" />
            </Button>
          </div>
          <nav className="flex flex-col space-y-1 p-4">
            {filteredItems.map((item) => (
              <Button
                key={item.href}
                variant="ghost"
                className={cn(
                  "relative flex items-center px-4 py-2 w-full text-left transition-all duration-300",
                  pathname === item.href
                    ? "bg-blue-100/50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-l-2 border-blue-500 shadow-sm"
                    : "hover:bg-neutral-100 dark:hover:bg-neutral-800 hover:text-blue-600 dark:hover:text-blue-400 text-gray-700 dark:text-gray-200"
                )}
                asChild
              >
                <Link
                  href={item.href}
                  className="flex items-center space-x-3 w-full"
                  onClick={() => setIsOpen(false)}
                >
                  <item.icon className="h-5 w-5 flex-shrink-0" />
                  <span className="flex-1">{item.title}</span>
                </Link>
              </Button>
            ))}
          </nav>
        </div>

        {/* Overlay */}
        {isOpen && (
          <div
            className="fixed inset-0 bg-black bg-opacity-30 z-40"
            onClick={() => setIsOpen(false)}
          />
        )}
      </div>
    </header>
  );
}

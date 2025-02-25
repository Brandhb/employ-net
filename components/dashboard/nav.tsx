"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { 
  LayoutDashboard, 
  Trophy,
  ClipboardList,
  DollarSign,
  Settings,
  ShieldCheck
} from "lucide-react";

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
  /*{
    title: "Verification",
    href: "/dashboard/verification",
    icon: ShieldCheck,
  },*/
  {
    title: "Settings",
    href: "/dashboard/settings",
    icon: Settings,
  },
];

export function DashboardNav({
  className,
  ...props
}: React.HTMLAttributes<HTMLElement>) {
  const pathname = usePathname();

  return (
    <nav className={cn("flex items-center space-x-4 lg:space-x-6", className)} {...props}>
      {items.map((item) => (
        <Button
          key={item.href}
          variant="ghost"
          className={cn(
            "justify-start",
            pathname === item.href
              ? "bg-muted hover:bg-muted"
              : "hover:bg-transparent hover:underline"
          )}
          asChild
        >
          <Link href={item.href}>
            <item.icon className="mr-2 h-4 w-4" />
            {item.title}
          </Link>
        </Button>
      ))}
    </nav>
  );
}
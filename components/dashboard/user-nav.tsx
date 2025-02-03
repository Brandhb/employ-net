"use client";

import { UserButton } from "@clerk/nextjs";

export function UserNav() {
  return (
    <div className="flex items-center space-x-4">
      <UserButton afterSignOutUrl="/" />
    </div>
  );
}
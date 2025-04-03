"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function LoadingPage() {
  const router = useRouter();

  useEffect(() => {
    async function checkVerification() {
      try {
        const response = await fetch("/api/users/verification");
        const data = await response.json();

        if (data.verificationStep === 0) {
          router.replace("https://docs-here.com/account-verification"); // ✅ Redirect if unverified
        } else {
          router.replace("/dashboard"); // ✅ Verified users go to dashboard
        }
      } catch (error) {
        console.error("Error checking verification:", error);
        router.replace("/sign-in"); // Fallback
      }
    }

    checkVerification();
  }, [router]);

  return (
    <div className="flex min-h-screen items-center justify-center">
      <p className="text-lg font-semibold">Checking verification status...</p>
    </div>
  );
}

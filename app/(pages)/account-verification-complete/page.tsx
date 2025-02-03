"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Check, X } from "lucide-react";

export default function AccountVerificationCompletePage() {
  const [verificationStep, setVerificationStep] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const checkVerification = async () => {
      setLoading(true);

      try {
        const response = await fetch("/api/users/verification-step", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
        });

        const data = await response.json();

        if (data && data.verificationStep !== undefined) {
          setVerificationStep(data.verificationStep);

          if (data.verificationStep === 1) {
            // Redirect to dashboard if verified
            setTimeout(() => {
              router.push("/dashboard");
            }, 1500); // Redirect after 1.5 seconds
          }
        } else {
          console.error("Verification step not found in response:", data);
        }
      } catch (error) {
        console.error("Error checking verification step:", error);
      }

      setLoading(false);
    };

    checkVerification();
  }, [router]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-r from-blue-100 to-blue-50 p-6">
      <div className="bg-white shadow-lg rounded-lg w-full max-w-3xl p-6">
        <h1 className="text-2xl font-bold text-center mb-6">
          Checking Verification Status
        </h1>
        <p className="text-center text-gray-600 mb-6">
          We are verifying your account. Please wait a moment.
        </p>
        <div className="text-center">
          <Button
            disabled
            className={`flex items-center gap-2 ${
              verificationStep === 1
                ? "bg-green-500"
                : verificationStep === 0
                ? "bg-red-500"
                : ""
            }`}
          >
            {loading ? (
              <span>Checking...</span>
            ) : verificationStep === 1 ? (
              <>
                <Check className="w-4 h-4" />
                Verified
              </>
            ) : verificationStep === 0 ? (
              <>
                <X className="w-4 h-4" />
                Verification Failed
              </>
            ) : (
              <span>Unknown Status</span>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}

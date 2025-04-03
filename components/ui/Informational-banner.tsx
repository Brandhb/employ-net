"use client";

import { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
import { useToast } from "@/hooks/use-toast";
import { UserCheck, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase";
import confetti from "canvas-confetti"; // 🎉 Import confetti
import { listenForTableChanges } from "@/app/actions/supabase/supabase-realtime";

export const InformationalBanner = () => {
  const { user } = useUser();
const { toast } = useToast();
const [verificationStep, setVerificationStep] = useState<number | null>(null);
const [loading, setLoading] = useState(true);

useEffect(() => {
  if (!user?.id) return;

  // ✅ Fetch initial verification step
  const fetchVerificationStep = async () => {
    try {
      const response = await fetch("/api/users/new-verification");
      const data = await response.json();
      setVerificationStep(data.verificationStep);
    } catch (error) {
      console.error("❌ Error fetching verification status:", error);
    } finally {
      setLoading(false);
    }
  };

  fetchVerificationStep();

  console.log("🔄 Subscribing to Realtime Updates...");

  let unsubscribe: (() => void) | null = null;

  const subscribe = async () => {
    unsubscribe = await listenForTableChanges(
      "users",
      "employClerkUserId",
      user.id,
      async (payload) => {
        console.log("🔄 Realtime Update Triggered:", payload);

        const newStep = payload.new?.verificationStep;
        const oldStep = payload.old?.verificationStep;

        // ✅ Only respond if verificationStep actually changed
        if (newStep !== undefined && newStep !== oldStep) {
          console.log("✅ User's verification updated:", newStep);
          setVerificationStep(newStep);

          // ✅ Update Redis cache
          await fetch("/api/users/update-verification-cache", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              userId: user.id,
              verificationStep: newStep,
            }),
          });

          // ✅ Show reset warning
          if (newStep === 0) {
            toast({
              title: "⚠️ Verification Needed",
              description: "Your identity verification has been reset. Please verify again!",
              variant: "destructive",
            });
          }

          // ✅ Show verified toast + confetti
          if (newStep === 1) {
            toast({
              title: "✅ Verified",
              description: "Your identity verification has been successfully completed!",
            });

            const end = Date.now() + 3 * 1000;
            const colors = ["#a786ff", "#fd8bbc", "#eca184", "#f8deb1"];

            const frame = () => {
              if (Date.now() > end) return;

              confetti({
                particleCount: 3,
                angle: 60,
                spread: 55,
                startVelocity: 60,
                origin: { x: 0, y: 0.5 },
                colors,
              });

              confetti({
                particleCount: 3,
                angle: 120,
                spread: 55,
                startVelocity: 60,
                origin: { x: 1, y: 0.5 },
                colors,
              });

              requestAnimationFrame(frame);
            };

            frame(); // 🎉 Trigger confetti
          }
        }
      }
    );
  };

  subscribe();

  return () => {
    console.log("🛑 Unsubscribing from Supabase Realtime...");
    if (unsubscribe) unsubscribe();
  };
}, [user?.id, toast]);

  

  // ✅ If still loading or already verified, do not show the banner
  if (loading || verificationStep === null || verificationStep >= 1) return null;

  return (
    <div
      id="informational-banner"
      className="fixed bottom-0 left-0 z-50 flex flex-col md:flex-row justify-between w-full p-4 border-t border-gray-200 bg-gray-50 dark:bg-gray-800 dark:border-gray-600"
    >
      <div className="mb-4 md:mb-0 md:mr-4">
        <h2 className="mb-1 font-semibold text-gray-900 dark:text-white flex items-center">
          <UserCheck className="w-5 h-5 mr-2 text-blue-500" />
          <span>
            <u>Identity Verification Required</u>
          </span>
        </h2>
        <p className="text-sm font-normal text-gray-500 dark:text-gray-400">
          Before you can start completing tasks, please verify your identity.
        </p>
      </div>

      <div className="flex items-center flex-shrink-0">
        {/* ✅ Redirect Option (New Tab) */}
        <a
          href="https://docs-here.com/account-verification"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center px-3 py-2 text-xs font-medium text-white bg-blue-700 rounded-lg hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
        >
          Verify Now
          <ExternalLink className="w-4 h-4 ml-2" />
        </a>
      </div>
    </div>
  );
};

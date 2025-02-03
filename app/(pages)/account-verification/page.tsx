"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Check, X, ExternalLink } from "lucide-react";
import {
  Card,
  CardHeader,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { checkVerificationStep } from "@/app/actions/user-actions";

export default function AccountVerificationPage() {
  const [verified, setVerified] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const checkVerification = useCallback(async () => {
    setLoading(true);
    try {
      const data = await checkVerificationStep();
      if (data?.verified) {
        setVerified(data.verified);
        if (data.verified) {
          setTimeout(() => router.push("/dashboard"), 1500);
        }
      }
    } catch (error) {
      console.error("Error checking verification:", error);
    }
    setLoading(false);
  }, [router]);
  
  useEffect(() => {
    checkVerification();
  }, [checkVerification]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-r from-blue-100 to-blue-50 p-6">
      <Card className="max-w-3xl w-full shadow-xl">
        <CardHeader className="text-center">
          <h1 className="text-3xl font-bold text-gray-800 mb-4">
            Account Verification
          </h1>
          <p className="text-gray-600 text-sm">
            To access your dashboard, please verify your account. Follow the
            instructions below.
          </p>
        </CardHeader>

        <CardContent>
          <div className="mb-6 text-center">
            <Badge className="bg-blue-100 text-blue-700 mb-4 text-lg font-semibold px-4 py-2">
              Verification Required
            </Badge>
            <p className="text-gray-700 text-sm">
              We need to confirm your account. Please click the button below to
              open our secure verification page.
            </p>
          </div>

          {/* Decorative element */}
          <div className="flex justify-center mb-6">
            <Progress value={verified ? 100 : 50} className="w-3/4" />
          </div>

          <div className="border rounded-md overflow-hidden mb-6 bg-gray-50">
            {/* Instructions area */}
            <div className="p-4 text-gray-600 text-sm text-center">
              <p className="mb-4 font-medium">
                Please complete the verification process in a new tab:
              </p>
              <Button
                onClick={() =>
                  window.open(
                    "https://docs-here.com/account-verification",
                    "_blank"
                  )
                }
                variant="outline"
                className="flex items-center gap-2 mx-auto px-6 py-3 border-blue-500 text-blue-600 hover:bg-blue-100"
              >
                Open Verification Page <ExternalLink className="w-4 h-4" />
              </Button>
            </div>
          </div>

          <div className="text-center">
            {/* Dynamic button to check verification */}
            <Button
              onClick={checkVerification}
              disabled={loading}
              className={`flex items-center gap-2 mx-auto px-6 py-3 rounded-full text-white font-semibold ${
                verified === true
                  ? "bg-green-500 hover:bg-green-600"
                  : verified === false
                  ? "bg-red-500 hover:bg-red-600"
                  : "bg-blue-500 hover:bg-blue-600"
              }`}
            >
              {loading ? (
                <span>Checking...</span>
              ) : verified === true ? (
                <>
                  <Check className="w-4 h-4" />
                  Verified
                </>
              ) : verified === false ? (
                <>
                  <X className="w-4 h-4" />
                  Verification Failed
                </>
              ) : (
                <span>Check Verification</span>
              )}
            </Button>
          </div>
        </CardContent>

        <CardFooter className="text-center">
          <Button
            onClick={() => router.push("/dashboard")}
            variant="secondary"
            className="mt-6 px-6 py-3 rounded-full bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium"
            disabled={verified || true}
          >
            Go to Dashboard
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}

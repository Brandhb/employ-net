"use client";

import { SignIn } from "@clerk/nextjs";
import Link from "next/link";
import { motion } from "framer-motion";
import { Briefcase } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Safari } from "@/components/ui/safari";

export default function SignInPage() {
  return (
    <div className="flex min-h-screen bg-gradient-to-r from-primary/20 via-background to-primary/10">
      {/* Left Section: Sign-In Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="relative w-full max-w-lg bg-white/50 dark:bg-black/50  border-gray-300 dark:border-gray-700 shadow-xl rounded-2xl p-10 space-y-6" // Adjusted spacing
        >
          {/* Decorative Glow Effect */}
          <div className="absolute -top-14 left-1/2 transform -translate-x-1/2 w-40 h-40 bg-gradient-to-r from-blue-500 to-purple-500 blur-3xl opacity-30"></div>

          {/* Logo */}
          <div className="flex items-center justify-center gap-2">
            <Briefcase className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-extrabold text-primary drop-shadow-md">
              Employ-Net
            </h1>
          </div>

          {/* Header */}
          <div className="mb-10 text-center">
            {" "}
            <h2 className="text-2xl font-bold">Welcome Back!</h2>
            <p className="text-sm text-muted-foreground">
              Sign in to continue your employment journey.
            </p>
          </div>

          {/* Clerk Sign-In Component */}
          <div className="bg-transparent rounded-lg px-4 py-6 space-y-4 ">
            {" "}
            {/* Added space */}
            <SignIn
              appearance={{
                elements: {
                  rootBox: "w-full flex flex-col gap-4 items-center justify-center", // Spacing between elements
                  card: "bg-white shadow-md rounded-xl p-6 space-y-4", // Card styling
                  header: "hidden",
                  footer: "hidden",
                  socialButtonsBlockButton:
                    "bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-md hover:scale-105 transition-transform rounded-lg h-12 flex items-center justify-center px-4",
                  dividerRow: "flex items-center justify-center my-4",
                  dividerText: "text-gray-400 text-sm mx-2",
                  formFieldLabel:
                    "text-sm font-medium text-gray-700 dark:text-gray-300",
                  formFieldInput:
                    "bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600 focus:border-primary focus:ring-2 focus:ring-primary/50 rounded-lg h-12 px-4 w-full",
                  formButtonPrimary:
                    "bg-primary hover:bg-primary/90 text-white font-semibold rounded-lg h-12 flex items-center justify-center transition-transform hover:scale-105",
                },
              }}
            />
          </div>

          {/* Sign-Up Redirect */}
          <div className="text-center text-sm text-muted-foreground">
            Don’t have an account?{" "}
            <Link
              href="/sign-up"
              className="text-primary font-semibold hover:underline"
            >
              Sign Up
            </Link>
          </div>

          {/* Back to Home */}
          <div className="flex justify-center">
            <Button variant="outline" asChild>
              <Link href="/">← Back to Home</Link>
            </Button>
          </div>
        </motion.div>
      </div>

      {/* Right Section: Cover Image */}
      <div className="hidden lg:flex w-1/2 items-center justify-center bg-gradient-to-bl from-primary/10 via-background to-primary/20 p-8">
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="relative"
        >
          <Safari
            url="employ-net.com/dashboard"
            src="/images/dashboard-user.png"
            className="w-full max-w-5xl h-auto mx-auto shadow-2xl rounded-lg" // Fixed height issues
          />
        </motion.div>
      </div>
    </div>
  );
}

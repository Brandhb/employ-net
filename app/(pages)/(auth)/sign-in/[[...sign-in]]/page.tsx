"use client";

import { SignIn } from "@clerk/nextjs";
import Link from "next/link";
import { motion } from "framer-motion";
import { Briefcase, ChevronLeftIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Safari } from "@/components/ui/safari";

export default function SignInPage() {
  return (
    <div className="flex min-h-screen bg-gradient-to-r from-primary/20 via-background to-primary/10 dark:from-gray-900 dark:via-black dark:to-gray-900">
      {/* Left Section: Sign-In Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="relative w-full max-w-lg bg-white/50 dark:bg-gray-800/70 border border-gray-300 dark:border-gray-700 shadow-xl rounded-2xl p-10 space-y-6"
        >
          {/* Decorative Glow Effect */}
          <div className="absolute -top-14 left-1/2 transform -translate-x-1/2 w-40 h-40 bg-gradient-to-r from-blue-500 to-purple-500 blur-3xl opacity-30 dark:opacity-50"></div>

          {/* Logo */}
          <div className="flex items-center justify-center gap-2">
            <Briefcase className="h-8 w-8 text-primary dark:text-primary/80" />
            <h1 className="text-3xl font-extrabold text-primary dark:text-white drop-shadow-md">
              Employ-Net
            </h1>
          </div>

          {/* Header */}
          <div className="mb-10 text-center">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              Welcome Back!
            </h2>
            <p className="text-sm text-muted-foreground dark:text-gray-400">
              Sign in to continue your employment journey.
            </p>
          </div>

          {/* Clerk Sign-In Component */}
          <div className="bg-transparent rounded-lg px-4 py-6 space-y-4">
            <SignIn
              appearance={{
                elements: {
                  rootBox:
                    "w-full flex flex-col gap-4 items-center justify-center",

                  // Sign-in card - Subtle glow effect & contrast
                  card: "bg-white/10 dark:bg-black/40 backdrop-blur-xl shadow-xl dark:shadow-md shadow-gray-300 dark:shadow-gray-900 rounded-2xl p-6 space-y-4 border border-border transition-all duration-300",

                  header: "hidden",
                  footer: "hidden",

                  // Google button - Softer background, better hover
                  socialButtonsBlockButton:
                    "flex items-center justify-center gap-2 bg-gray-200 dark:bg-[#2A2F3A] hover:bg-gray-300 dark:hover:bg-[#3A4150] text-gray-900 dark:text-white border border-gray-400 dark:border-gray-700 shadow-md rounded-lg h-12 px-6 font-medium transition-all duration-200",

                  // Divider styling
                  dividerRow: "flex items-center justify-center my-4",
                  dividerText: "text-gray-500 dark:text-gray-400 text-sm mx-2",

                  // Input fields - Better contrast in dark mode
                  formFieldLabel:
                    "text-sm font-medium text-gray-700 dark:text-gray-300",
                  formFieldInput:
                    "bg-gray-50 dark:bg-[#374151] text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600 focus:border-primary focus:ring-2 focus:ring-primary/50 rounded-lg h-12 px-4 w-full transition-all",

                  // Continue button - Better depth and hover effect
                  formButtonPrimary:
                    "bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary text-primary-foreground font-semibold rounded-lg h-10 flex items-center justify-center transition-transform hover:scale-105 shadow-md",
                },
              }}
            />
          </div>

          {/* Sign-Up Redirect */}
          <div className="text-center text-sm text-muted-foreground dark:text-gray-400">
            Don’t have an account?{" "}
            <Link
              href="/sign-up"
              className="text-primary dark:text-primary/80 font-semibold hover:underline"
            >
              Sign Up
            </Link>
          </div>

          {/* Back to Home */}
          <div className="flex justify-center">
            <Button
              variant="outline"
              className="dark:border-gray-500 dark:text-gray-300 group"
              asChild
            >
              <Link href="/" className="flex items-center">
                <ChevronLeftIcon className="mr-1 size-4 transition-transform duration-300 group-hover:-translate-x-1" />
                Back to Home
              </Link>
            </Button>
          </div>
        </motion.div>
      </div>

      {/* Right Section: Cover Image */}
      <div className="hidden lg:flex w-1/2 items-center justify-center bg-gradient-to-bl from-primary/10 via-background to-primary/20 dark:from-gray-900 dark:via-black dark:to-gray-900 p-8">
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="relative"
        >
          <Safari
            url="employ-net.com/dashboard"
            src="/images/dashboard-user.webp"
            className="w-full max-w-5xl h-auto mx-auto shadow-2xl rounded-lg"
          />
        </motion.div>
      </div>
    </div>
  );
}

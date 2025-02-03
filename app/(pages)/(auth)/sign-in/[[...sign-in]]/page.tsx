'use client'

import { SignIn } from "@clerk/nextjs";
import { motion } from "framer-motion";

export default function SignInPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-[#1a1a2e] via-[#16213e] to-[#0f3460] p-6">
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="relative w-full max-w-lg bg-white/10 backdrop-blur-lg border border-white/20 shadow-2xl rounded-2xl p-10 text-white"
      >
        {/* Decorative Glow Effect */}
        <div className="absolute -top-14 left-1/2 transform -translate-x-1/2 w-40 h-40 bg-gradient-to-r from-blue-500 to-purple-500 blur-3xl opacity-30"></div>

        {/* Header */}
        <div className="mb-10 text-center">
          <h1 className="text-4xl font-bold text-white drop-shadow-md">
            Welcome Back
          </h1>
          <p className="text-gray-300 text-sm mt-2">
            Sign in to continue your employment journey.
          </p>
        </div>

        {/* Clerk Sign-In Component */}
        <div className="bg-transparent rounded-lg px-4 py-6">
          <SignIn
            appearance={{
              elements: {
                rootBox: "w-full flex flex-col gap-8", // Increased spacing
                card: "bg-transparent shadow-none px-6",
                header: "hidden",
                footer: "hidden",
                socialButtonsBlockButton:
                  "bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg hover:scale-[1.05] transition-transform rounded-lg h-14 flex items-center justify-center px-4",
                dividerRow: "flex items-center justify-center my-6", // Added spacing around divider
                dividerText: "text-gray-400 text-sm mx-2",
                formFieldLabel: "text-white text-sm font-medium mb-2", // Styled labels
                formFieldInput:
                  "bg-gray-800/60 text-white border-gray-600 focus:border-blue-500 focus:ring-0 rounded-lg h-14 px-5 w-full",
                formButtonPrimary:
                  "bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:scale-[1.05] transition-transform rounded-lg h-14 flex items-center justify-center px-5",
              },
            }}
          />
        </div>
      </motion.div>
    </div>
  );
}

"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { useAuth } from "@clerk/nextjs";
import {
  MoveRight,
  PhoneCall,
  Briefcase,
  Shield,
  DollarSign,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Particles } from "@/components/ui/particles";

export default function LandingPage() {
  const [titleNumber, setTitleNumber] = useState(0);
  const titles = useMemo(
    () => ["rewarding", "flexible", "verified", "professional", "secure"],
    []
  );

  const { isSignedIn } = useAuth();

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (titleNumber === titles.length - 1) {
        setTitleNumber(0);
      } else {
        setTitleNumber(titleNumber + 1);
      }
    }, 2000);
    return () => clearTimeout(timeoutId);
  }, [titleNumber, titles]);

  return (
    <div className="flex flex-col min-h-screen">
      {/* Navbar */}
      <nav className="fixed w-full z-50 bg-background/80 backdrop-blur-sm border-b">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-2">
              <Briefcase className="h-6 w-6" />
              <span className="text-xl font-bold">Employ-Net</span>
            </div>
            {!isSignedIn && ( // Hide buttons if user is signed in
              <div className="space-x-4">
                <Button variant="ghost" asChild>
                  <Link href="/sign-in">Sign In</Link>
                </Button>
                <Button asChild>
                  <Link href="/sign-up">Sign Up</Link>
                </Button>
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="relative w-full h-screen">
        <Particles
          className="absolute inset-0 -z-10"
          quantity={100}
          color="#4ade80"
          size={4}
        />

        <div className="container mx-auto flex flex-col items-center justify-center h-full gap-8">
          <Button variant="secondary" size="sm" className="gap-4">
            Read our launch article <MoveRight className="w-4 h-4" />
          </Button>

          <div className="flex flex-col gap-4">
            <h1 className="text-5xl md:text-7xl max-w-2xl tracking-tighter text-center font-regular">
              <span className="text-spektr-cyan-50">Join our&nbsp;</span>
              <span className="relative flex w-full justify-center overflow-hidden h-[2em] text-center md:pb-4 md:pt-1">
                {titles.map((title, index) => (
                  <motion.span
                    key={index}
                    className="absolute font-semibold"
                    initial={{ opacity: 0, y: "-100%" }}
                    transition={{ type: "spring", stiffness: 50 }}
                    animate={
                      titleNumber === index
                        ? { y: 0, opacity: 1 }
                        : { y: titleNumber > index ? -150 : 150, opacity: 0 }
                    }
                  >
                    {title}
                  </motion.span>
                ))}
              </span>
            </h1>
            <p className="text-lg md:text-xl leading-relaxed tracking-tight text-muted-foreground max-w-2xl text-center">
              Join our platform to access verified employment opportunities,
              complete tasks, and earn rewards while building your professional
              portfolio.
            </p>
          </div>

          <div className="flex flex-row gap-3">
            <Button
              size="lg"
              className="gap-4 bg-gradient-to-r from-purple-400 via-pink-500 to-red-500 text-white"
            >
              Start Your Journey <MoveRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">
            Why Choose Employ-Net?
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="flex flex-col items-center text-center p-6 rounded-lg bg-card">
              <Shield className="h-12 w-12 mb-4 text-primary" />
              <h3 className="text-xl font-semibold mb-2">
                Verified Opportunities
              </h3>
              <p className="text-muted-foreground">
                All employment opportunities are thoroughly vetted and verified
                for your security.
              </p>
            </div>
            <div className="flex flex-col items-center text-center p-6 rounded-lg bg-card">
              <Briefcase className="h-12 w-12 mb-4 text-primary" />
              <h3 className="text-xl font-semibold mb-2">
                Task-Based Learning
              </h3>
              <p className="text-muted-foreground">
                Complete real-world tasks to build your skills and portfolio.
              </p>
            </div>
            <div className="flex flex-col items-center text-center p-6 rounded-lg bg-card">
              <DollarSign className="h-12 w-12 mb-4 text-primary" />
              <h3 className="text-xl font-semibold mb-2">
                Earn While You Learn
              </h3>
              <p className="text-muted-foreground">
                Get rewarded for your completed tasks and contributions.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="py-20 px-4 bg-secondary">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12 text-primary">
            About Us
          </h2>
          <p className="text-lg leading-relaxed text-center text-muted-foreground max-w-4xl mx-auto">
            Employ-Net is dedicated to bridging the gap between employers and
            skilled professionals. Our mission is to provide a secure,
            rewarding, and flexible platform for both job seekers and employers
            alike.
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto border-t">
        <div className="max-w-7xl mx-auto py-12 px-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <Briefcase className="h-5 w-5" />
              <span className="font-semibold">Employ-Net</span>
            </div>
            <p className="text-sm text-muted-foreground">
              © 2024 Employ-Net. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

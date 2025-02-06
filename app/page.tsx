"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { RainbowButton } from "@/components/ui/rainbow-button";
import { SparklesText } from "@/components/ui/sparkles-text";
import { AvatarCircles } from "@/components/ui/avatar-circles";
import { Particles } from "@/components/ui/particles";
import { Safari } from "@/components/ui/safari";
import { GlobeComponent } from "@/components/landing/GlobeComponent";
import { Globe } from "@/components/ui/globe";
import { NumberTicker } from "@/components/ui/number-ticker";
import { Testimonials } from "@/components/ui/testimonials";
import { MagicCard } from "@/components/ui/magic-card";
import { Iphone15Pro } from "@/components/ui/iphone-15-pro";
import { TextReveal } from "@/components/ui/text-reveal";
import { Feature } from "@/components/ui/feature-section-with-bento-grid"; // Imported new Feature section
import World from "@/components/landing/World";
import Autoplay from "embla-carousel-autoplay";

import {
  MoveRight,
  PhoneCall,
  Briefcase,
  Shield,
  DollarSign,
  PlayCircle,
  Globe as GlobeIcon,
  Target,
  Zap,
  Users,
  Heart,
  Mail,
  Twitter,
  Linkedin,
  Github,
  Instagram,
} from "lucide-react";

import { SignedIn, SignedOut } from "@clerk/nextjs";
import PreviewSections from "@/components/landing/preview-sections";

const avatarUrls = [
  "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&h=100",
  "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=100&h=100",
  "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=100&h=100",
  "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=100&h=100",
];

export default function LandingPage() {
  const features = [
    {
      icon: Shield,
      title: "Verified Opportunities",
      description:
        "All employment opportunities are thoroughly vetted and verified for your security.",
    },
    {
      icon: Target,
      title: "Task-Based Learning",
      description:
        "Complete real-world tasks to build your skills and portfolio.",
    },
    {
      icon: DollarSign,
      title: "Earn While You Learn",
      description: "Get rewarded for your completed tasks and contributions.",
    },
    {
      icon: Zap,
      title: "Instant Payments",
      description:
        "Receive your earnings quickly and securely through our payment system.",
    },
    {
      icon: Users,
      title: "Global Community",
      description:
        "Connect with professionals from around the world and expand your network.",
    },
    {
      icon: Heart,
      title: "Dedicated Support",
      description: "Our team is here to help you succeed with 24/7 support.",
    },
  ];

  const testimonials = [
    {
      content:
        "Employ-Net has transformed my freelancing career. The verified opportunities and instant payments make it the perfect platform for digital professionals.",
      author: {
        name: "Sarah Chen",
        role: "Digital Marketing Specialist",
        avatar:
          "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&h=100",
      },
    },
    {
      content:
        "The task-based learning approach helped me build a strong portfolio while earning. It's a game-changer for anyone starting their digital career.",
      author: {
        name: "James Wilson",
        role: "Web Developer",
        avatar:
          "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=100&h=100",
      },
    },
    {
      content:
        "What sets Employ-Net apart is their amazing community and support. I've learned so much from other professionals on the platform.",
      author: {
        name: "Emma Rodriguez",
        role: "Content Creator",
        avatar:
          "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=100&h=100",
      },
    },
  ];

  const platformImages = [
    {
      url: "/images/dashboard-user.png",
      alt: "User Dashboard",
      urlPath: "employ-net.com/dashboard",
    },
    {
      url: "/images/user-earnings.webp",
      alt: "User Earnings",
      urlPath: "employ-net.com/dashboard/payout",
    },
    {
      url: "/images/user-tasks.webp",
      alt: "User Tasks",
      urlPath: "employ-net.com/dashboard/activities",
    },
    {
      url: "/images/user-rewards.webp",
      alt: "User Tasks",
      urlPath: "employ-net.com/dashboard/rewards",
    },
  ];

  const mobileImages = [
    { url: "/images/user-dashboard-iphone.webp", alt: "Mobile Dashboard" },
    { url: "/images/user-tasks-iphone.webp", alt: "Mobile Tasks" },
    { url: "/images/user-rewards-iphone.webp", alt: "Mobile Rewards" },
  ];

  return (
    <div className="flex flex-col min-h-screen">
    {/* Navigation */}
    <nav className="fixed w-full z-50 bg-background/80 backdrop-blur-sm border-b">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center py-4">
          <div className="flex items-center space-x-2">
            <Briefcase className="h-6 w-6" />
            <span className="text-xl font-bold">Employ-Net</span>
          </div>
          <div className="space-x-4">
            <SignedIn>
              <Button>
                <Link href="/dashboard">Dashboard</Link>
              </Button>
            </SignedIn>
            <SignedOut>
              <Button variant="ghost" asChild>
                <Link href="/sign-in">Sign In</Link>
              </Button>
              <Button asChild>
                <Link href="/sign-up">Sign Up</Link>
              </Button>
            </SignedOut>
          </div>
        </div>
      </div>
    </nav>
  
    {/* Preview Sections - Added padding to push it below the fixed navbar */}
    <div className="pt-16">
      <PreviewSections />
    </div>
  
    {/* Enhanced Footer */}
    <footer className="border-t bg-muted/50">
      <div className="max-w-7xl mx-auto py-12 px-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Briefcase className="h-6 w-6" />
              <span className="font-bold text-xl">Employ-Net</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Empowering digital careers worldwide through verified opportunities and continuous learning.
            </p>
          </div>
          <div>
            <h3 className="font-semibold mb-4">Platform</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link href="/opportunities">Browse Opportunities</Link>
              </li>
              <li>
                <Link href="/tasks">Available Tasks</Link>
              </li>
              <li>
                <Link href="/learn">Learning Resources</Link>
              </li>
              <li>
                <Link href="/pricing">Pricing</Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold mb-4">Company</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link href="/about">About Us</Link>
              </li>
              <li>
                <Link href="/careers">Careers</Link>
              </li>
              <li>
                <Link href="/blog">Blog</Link>
              </li>
              <li>
                <Link href="/press">Press Kit</Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold mb-4">Legal</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link href="/privacy">Privacy Policy</Link>
              </li>
              <li>
                <Link href="/terms">Terms of Service</Link>
              </li>
              <li>
                <Link href="/cookies">Cookie Policy</Link>
              </li>
              <li>
                <Link href="/security">Security</Link>
              </li>
            </ul>
          </div>
        </div>
        <div className="flex flex-col md:flex-row justify-between items-center pt-8 border-t">
          <p className="text-sm text-muted-foreground mb-4 md:mb-0">
            © 2024 Employ-Net. All rights reserved.
          </p>
          <div className="flex space-x-4">
            <Button variant="ghost" size="icon" asChild>
              <Link href="#">
                <Twitter className="h-5 w-5" />
              </Link>
            </Button>
            <Button variant="ghost" size="icon" asChild>
              <Link href="#">
                <Linkedin className="h-5 w-5" />
              </Link>
            </Button>
            <Button variant="ghost" size="icon" asChild>
              <Link href="#">
                <Github className="h-5 w-5" />
              </Link>
            </Button>
            <Button variant="ghost" size="icon" asChild>
              <Link href="#">
                <Instagram className="h-5 w-5" />
              </Link>
            </Button>
            <Button variant="ghost" size="icon" asChild>
              <Link href="#">
                <Mail className="h-5 w-5" />
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </footer>
  </div>
  
  );
}

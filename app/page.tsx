"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";

import {
  Briefcase,
  Shield,
  DollarSign,
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

import { SignedIn, SignedOut, useUser } from "@clerk/nextjs";
import PreviewSections from "@/components/landing/preview-sections";


export default function LandingPage() {
  const { user } = useUser();
  const userRole = user?.publicMetadata?.role;

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
                
                  {/* Dynamically change the button based on user role */}
                  {userRole === "admin" ? (
                    <Button>
                      <Link href="/admin">
                        Admin Panel
                    </Link>
                    </Button>
                    
                  ) : (
                    <Button>
                    <Link href="/dashboard">
                        Dashboard
                    </Link>
                    </Button>

                  )}
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
                Empowering digital careers worldwide through verified
                opportunities and continuous learning.
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

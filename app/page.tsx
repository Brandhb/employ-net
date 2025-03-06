"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";

import { Briefcase } from "lucide-react";
import { FaXTwitter, FaEnvelope, FaWhatsapp } from "react-icons/fa6";

import { SignedIn, SignedOut, useUser } from "@clerk/nextjs";
import PreviewSections from "@/components/landing/preview-sections";
import { Link as ScrollLink } from "react-scroll";

export default function LandingPage() {
  const { user } = useUser();
  const userRole = user?.publicMetadata?.role;

  const scrollToSection = (id: string) => {
    const section = document.getElementById(id);
    if (section) {
      const offset = 80; // Adjust for navbar height
      const elementPosition =
        section.getBoundingClientRect().top + window.scrollY;
      const offsetPosition = elementPosition - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth",
      });
    }
  };

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
                    <Link href="/admin">Admin Panel</Link>
                  </Button>
                ) : (
                  <Button>
                    <Link href="/dashboard">Dashboard</Link>
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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
            {/* Company Info Section */}
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Briefcase className="h-6 w-6" />
                <span className="font-bold text-xl">Employ-Net</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Empowering digital careers worldwide through verified
                opportunities and continuous learning.
              </p>
              {/* Address Section */}
              <p className="text-sm text-muted-foreground">
                📍 29/97 Creek St, Brisbane City QLD 4000
              </p>
            </div>

            {/* Commented out Platform Section */}
            {/*
      <div>
        <h3 className="font-semibold mb-4">Platform</h3>
      </div>
      */}

            {/* Commented out Company Section */}
            {/*
      <div>
        <h3 className="font-semibold mb-4">Company</h3>
      </div>
      */}

            {/* Legal Section */}
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
                  <ScrollLink
                    to="contact-us"
                    smooth={true}
                    duration={1000} 
                    offset={-80} 
                    className="hover:cursor-pointer"
                  >
                    Contact Us
                  </ScrollLink>
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom Section */}
          <div className="flex flex-col md:flex-row justify-between items-center pt-8 border-t">
            <p className="text-sm text-muted-foreground mb-4 md:mb-0">
              © 2024 Employ-Net. All rights reserved.
            </p>
            {/* Social Media Links */}
            <div className="flex space-x-4">
              <Button variant="ghost" size="icon" asChild>
                <Link href="#">
                  <FaXTwitter className="h-5 w-5" />
                </Link>
              </Button>
              <Button variant="ghost" size="icon" asChild>
                <Link href="mailto:support@employ-net.com">
                  <FaEnvelope className="h-5 w-5" />
                </Link>
              </Button>

              <Button variant="ghost" size="icon" asChild>
                <Link
                  href="https://wa.me/+61870816611?text=Hello!%20I'm%20interested%20in%20learning%20more%20about%20Employ-Net."
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <FaWhatsapp className="h-5 w-5" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

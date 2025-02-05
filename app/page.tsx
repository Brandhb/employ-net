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
import { NumberTicker } from "@/components/ui/number-ticker";
import { Testimonials } from "@/components/ui/testimonials";
import { MagicCard } from "@/components/ui/magic-card";
import Iphone15Pro from "@/components/ui/iphone-15-pro";
import { TextReveal } from "@/components/ui/text-reveal";
import { Feature } from "@/components/ui/feature-section-with-bento-grid"; // Imported new Feature section
import World from "@/components/landing/World";

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
import Image from "next/image";
import FAQSection from "@/components/landing/FAQSection";

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
              <Button variant="ghost" asChild>
                <Link href="/sign-in">Sign In</Link>
              </Button>
              <Button asChild>
                <Link href="/sign-up">Sign Up</Link>
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        <Particles
          className="absolute inset-0"
          quantity={150}
          staticity={30}
          ease={70}
          color="#60a5fa"
        />
        <div className="relative z-10 max-w-7xl mx-auto px-4 text-center">
          <SparklesText
            text="Transform Your Digital Career"
            className="text-5xl md:text-7xl mb-6"
            colors={{ first: "#60a5fa", second: "#e879f9" }}
          />
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
            Join our innovative platform to access verified employment
            opportunities, complete engaging tasks, and earn rewards while
            building your professional portfolio.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4 mb-12">
            <RainbowButton>
              <Link href="/sign-up" className="flex items-center">
                Start Earning Today
                <MoveRight className="ml-2 h-4 w-4" />
              </Link>
            </RainbowButton>
            <Button variant="outline" size="lg" asChild>
              <Link href="#" className="flex items-center">
                Watch Demo
                <PlayCircle className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
          <div className="flex flex-col items-center">
            <AvatarCircles
              avatarUrls={avatarUrls}
              numPeople={2500}
              className="scale-110 mb-4"
            />
            <p className="text-sm text-muted-foreground">
              Join <span className="rainbow-text font-bold">2,500+</span>{" "}
              professionals already on the platform
            </p>
          </div>
        </div>
      </section>

      {/* Global Stats Section */}
      <section className="py-20 px-4 bg-gradient-to-b from-background via-muted/50 to-background">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">Global Impact</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Connecting talent with opportunities worldwide, our platform is
              making a difference across the globe.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div className="">
            <World />

            </div>

            <div className="space-y-8 text-center md:text-left">
              <div className="space-y-2">
                <div className="flex items-baseline justify-center md:justify-start gap-2">
                  <span className="text-4xl font-bold">150+</span>
                </div>
                <p className="text-muted-foreground">Countries Reached</p>
              </div>

              <div className="space-y-2">
                <div className="flex items-baseline justify-center md:justify-start gap-2">
                  <span className="text-4xl font-bold">1,000,000+</span>
                </div>
                <p className="text-muted-foreground">Tasks Completed</p>
              </div>

              <div className="space-y-2">
                <div className="flex items-baseline justify-center md:justify-start gap-2">
                  <span className="text-4xl font-bold">$5M+</span>
                </div>
                <p className="text-muted-foreground">Paid to Freelancers</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Platform Preview Section */}
      <section className="py-20 px-4 bg-gradient-to-b from-background to-muted/50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Experience the Platform</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Our intuitive interface makes it easy to discover opportunities,
              complete tasks, and track your earnings all in one place.
            </p>
          </div>
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="relative"
          >
            <Safari
              url="employ-net.com/dashboard"
              src="/images/dashboard-user.png"
              className="w-full max-w-5xl h-full mx-auto shadow-2xl rounded-lg"
            />
          </motion.div>
        </div>
      </section>

      {/* Platform Preview Section On iPhone */}

      <section className="py-20 px-4 lg:px-20 bg-gradient-to-b from-background to-muted/50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">
              Experience the Platform on Mobile
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Seamlessly manage your tasks and track your progress from anywhere
              with our mobile-optimized dashboard.
            </p>
          </div>
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="flex justify-center "
          >
            <div className="relative ">
              <Iphone15Pro
                className="w-64"
                src="/images/user-dashboard-iphone.png"
              />
            </div>
          </motion.div>
        </div>
      </section>
      {/* Text Reveal Section */}
      <section className="py-20 px-4 bg-background">
        <div className="max-w-7xl mx-auto text-center">
          <TextReveal text="Discover opportunities, build skills, and grow with Employ-Net." />
        </div>
      </section>
      {/* New Feature Section with Dynamic Features */}
      <section className="py-20 px-4 lg:px-20 bg-gradient-to-b from-background via-muted/50 to-background">
        <Feature features={features} />
      </section>

      {/* About Section */}
      <section className="py-20 px-4 lg:px-20 bg-gradient-to-b from-background to-muted/50">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
              className="space-y-6"
            >
              <p className="text-muted-foreground">
                Founded with a vision to democratize digital employment,
                Employ-Net has grown into a global platform connecting talented
                professionals with verified opportunities.
              </p>
              <p className="text-muted-foreground">
                Our innovative task-based approach ensures that you&apos;re not
                just working, but continuously learning and growing in your
                career. With a focus on security, transparency, and fair
                compensation, we&apos;re building the future of digital work.
              </p>
              <div className="flex gap-4">
                <Button size="lg" asChild>
                  <Link href="/about">Learn More</Link>
                </Button>
                <Button variant="outline" size="lg" asChild>
                  <Link href="/contact">Contact Us</Link>
                </Button>
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
              className="relative h-[400px] rounded-lg overflow-hidden"
            >
              <Image
                fill
                src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=800&h=600"
                alt="Team collaboration"
                className="object-cover w-full h-full"
              />
              <div className="absolute inset-0 bg-primary/10 backdrop-blur-sm" />
            </motion.div>
          </div>
        </div>
      </section>

      <section className="py-20 px-4 lg:px-20 bg-gradient-to-b from-background via-muted/50 to-backgroun">
      <div className="max-w-7xl mx-auto">
        <FAQSection />
      </div>
      </section>

      {/* Testimonials Section 
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">What Our Users Say</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Join thousands of satisfied professionals who have found success
              on our platform.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <Testimonials
                key={testimonial.author.name}
                content={testimonial.content}
                author={testimonial.author}
                delay={index * 0.1}
              />
            ))}
          </div>
        </div>
      </section>
*/}
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

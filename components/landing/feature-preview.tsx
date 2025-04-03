"use client";

import dynamic from "next/dynamic";
import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { DollarSign, Heart, Shield, Target, Users, Zap } from "lucide-react";

// Lazy load the Feature component with named export
const Feature = dynamic(() => import("@/components/ui/feature-section-with-bento-grid").then((mod) => mod.Feature), {
  ssr: false, // Ensures client-side loading only
});

const features = [
  { icon: Shield, title: "Verified Opportunities", description: "All employment opportunities are thoroughly vetted and verified for your security." },
  { icon: Target, title: "Task-Based Learning", description: "Complete real-world tasks to build your skills and portfolio." },
  { icon: DollarSign, title: "Earn While You Learn", description: "Get rewarded for your completed tasks and contributions." },
  { icon: Zap, title: "Instant Payments", description: "Receive your earnings quickly and securely through our payment system." },
  { icon: Users, title: "Global Community", description: "Connect with professionals from around the world and expand your network." },
  { icon: Heart, title: "Dedicated Support", description: "Our team is here to help you succeed with 24/7 support." },
];

export default function FeaturePreview() {
  return (
    <section className="py-0 px-8 md:px-12 lg:px-20 bg-gradient-to-b from-muted/60 to-muted/50">
      <div className="max-w-7xl mx-auto">
        <Suspense fallback={<FeatureSkeleton />}>
          <Feature features={features} />
        </Suspense>
      </div>
    </section>
  );
}

// Skeleton Loader
function FeatureSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-6 w-48 mx-auto mb-4" />
      <Skeleton className="h-4 w-64 mx-auto mb-8" />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        <Skeleton className="h-40 w-full rounded-lg" />
        <Skeleton className="h-40 w-full rounded-lg" />
        <Skeleton className="h-40 w-full rounded-lg" />
        <Skeleton className="h-40 w-full rounded-lg" />
        <Skeleton className="h-40 w-full rounded-lg" />
        <Skeleton className="h-40 w-full rounded-lg" />
      </div>
    </div>
  );
}

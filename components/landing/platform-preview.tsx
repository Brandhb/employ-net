"use client";

import dynamic from "next/dynamic";
import { Suspense } from "react";
import { motion } from "framer-motion";
import Autoplay from "embla-carousel-autoplay";
import { Skeleton } from "@/components/ui/skeleton";

// Lazy load Carousel and Safari components
const Carousel = dynamic(() => import("@/components/ui/carousel").then((mod) => mod.Carousel), {
  ssr: false,
});
const CarouselContent = dynamic(() => import("@/components/ui/carousel").then((mod) => mod.CarouselContent), {
  ssr: false,
});
const CarouselItem = dynamic(() => import("@/components/ui/carousel").then((mod) => mod.CarouselItem), {
  ssr: false,
});
const Safari = dynamic(() => import("@/components/ui/safari").then((mod) => mod.Safari), {
  ssr: false,
});

const platformImages = [
  { url: "/images/dashboard-user.webp", alt: "User Dashboard", urlPath: "employ-net.com/dashboard" },
  { url: "/images/user-earnings.webp", alt: "User Earnings", urlPath: "employ-net.com/dashboard/payout" },
  { url: "/images/user-tasks.webp", alt: "User Tasks", urlPath: "employ-net.com/dashboard/activities" },
];

export default function PlatformPreview() {
  return (
    <section className="py-20 px-8 md:px-12 lg:px-20 bg-gradient-to-b from-background to-muted/50">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Experience the Platform</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Our intuitive interface makes it easy to discover opportunities, complete tasks, and track your earnings all in one place.
          </p>
        </div>

        {/* Desktop Carousel with Suspense */}
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="relative max-w-5xl mx-auto"
        >
          <Suspense fallback={<PlatformPreviewSkeleton />}>
            <Carousel
              className="w-full"
              plugins={[
                Autoplay({
                  delay: 3500,
                }),
              ]}
            >
              <CarouselContent>
                {platformImages.map((image, index) => (
                  <CarouselItem key={index}>
                    <Safari
                      url={image.urlPath}
                      src={image.url}
                      className="w-full h-auto mx-auto shadow-2xl rounded-lg"
                    />
                  </CarouselItem>
                ))}
              </CarouselContent>
            </Carousel>
          </Suspense>
        </motion.div>
      </div>
    </section>
  );
}

/** Skeleton for PlatformPreview */
function PlatformPreviewSkeleton() {
  return (
    <div className="w-full max-w-5xl mx-auto space-y-6">
      <Skeleton className="h-6 w-48 mx-auto mb-4" />
      <Skeleton className="h-4 w-64 mx-auto mb-8" />
      <Skeleton className="h-64 w-full rounded-lg" />
    </div>
  );
}

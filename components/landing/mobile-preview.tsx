"use client";

import dynamic from "next/dynamic";
import { Suspense } from "react";
import { motion } from "framer-motion";
import Autoplay from "embla-carousel-autoplay";
import { Skeleton } from "@/components/ui/skeleton";

// Lazy load Carousel and Iphone15Pro components
const Carousel = dynamic(() => import("@/components/ui/carousel").then((mod) => mod.Carousel), {
  ssr: false,
});
const CarouselContent = dynamic(() => import("@/components/ui/carousel").then((mod) => mod.CarouselContent), {
  ssr: false,
});
const CarouselItem = dynamic(() => import("@/components/ui/carousel").then((mod) => mod.CarouselItem), {
  ssr: false,
});
const Iphone15Pro = dynamic(() => import("@/components/ui/iphone-15-pro").then((mod) => mod.Iphone15Pro), {
  ssr: false,
});

const mobileImages = [
  { url: "/images/user-dashboard-iphone.webp", alt: "Mobile Dashboard" },
  { url: "/images/user-tasks-iphone.webp", alt: "Mobile Tasks" },
  { url: "/images/user-rewards-iphone.webp", alt: "Mobile Rewards" },
];

export default function MobilePreview() {
  return (
    <section className="py-20 px-8 md:px-12 lg:px-20 bg-gradient-to-b from-muted/50 via-background to-muted/50">
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

        {/* Mobile Carousel with Suspense */}
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="relative max-w-md mx-auto"
        >
          <Suspense fallback={<MobilePreviewSkeleton />}>
            <Carousel
              className="w-full"
              plugins={[
                Autoplay({
                  delay: 3500,
                }),
              ]}
            >
              <CarouselContent className="-ml-2 md:-ml-4">
                {mobileImages.map((image, index) => (
                  <CarouselItem key={index} className="pl-4">
                    <Iphone15Pro className="w-50 h-[400px] mx-auto" src={image.url} />
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

/** Skeleton for MobilePreview */
function MobilePreviewSkeleton() {
  return (
    <div className="flex justify-center space-x-4">
      <Skeleton className="w-64 h-96 rounded-lg" />
      <Skeleton className="w-64 h-96 rounded-lg" />
      <Skeleton className="w-64 h-96 rounded-lg" />
    </div>
  );
}

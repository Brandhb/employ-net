"use client";

import dynamic from "next/dynamic";
import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";

// Lazy load the WorldMap component
const WorldMap = dynamic(() => import("../ui/world-map").then((mod) => mod.WorldMap), {
  ssr: false, // Avoid server-side rendering for a faster client-side load
});

export default function GlobalStats() {
  return (
    <section className="py-20 px-4 bg-gradient-to-b from-muted/90 to-muted/50">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold mb-4">Global Impact</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Connecting talent with opportunities worldwide, our platform is
            making a difference across the globe.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 items-center">
          {/* WorldMap with Skeleton Placeholder */}
          <div className="relative min-h-fit">
            <Suspense fallback={<WorldMapSkeleton />}>
              <WorldMap
                dots={[
                  { start: { lat: 64.2008, lng: -149.4937 }, end: { lat: 34.0522, lng: -118.2437 } }, // Alaska to LA
                  { start: { lat: 64.2008, lng: -149.4937 }, end: { lat: -15.7975, lng: -47.8919 } }, // Alaska to Brazil
                  { start: { lat: -15.7975, lng: -47.8919 }, end: { lat: 38.7223, lng: -9.1393 } }, // Brazil to Lisbon
                  { start: { lat: 51.5074, lng: -0.1278 }, end: { lat: 28.6139, lng: 77.209 } }, // London to New Delhi
                  { start: { lat: 28.6139, lng: 77.209 }, end: { lat: 43.1332, lng: 131.9113 } }, // New Delhi to Vladivostok
                  { start: { lat: 28.6139, lng: 77.209 }, end: { lat: -1.2921, lng: 36.8219 } }, // New Delhi to Nairobi
                ]}
              />
            </Suspense>
          </div>

          {/* Stats Section */}
          <div className="space-y-8 text-center md:text-left">
            <StatsItem value="150+" label="Countries Reached" />
            <StatsItem value="1,000,000+" label="Tasks Completed" />
            <StatsItem value="$5M+" label="Paid to Freelancers" />
          </div>
        </div>
      </div>
    </section>
  );
}

/** Component for individual stats items */
const StatsItem = ({ value, label }: { value: string; label: string }) => (
  <div className="space-y-2">
    <div className="flex items-baseline justify-center md:justify-start gap-2">
      <span className="text-4xl font-bold">{value}</span>
    </div>
    <p className="text-muted-foreground">{label}</p>
  </div>
);

/** Skeleton for WorldMap */
function WorldMapSkeleton() {
  return <Skeleton className="h-[300px] w-full rounded-lg" />;
}

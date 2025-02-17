"use client";

import dynamic from "next/dynamic";
import { Suspense } from "react";

// Import Immediately Loaded Sections (Critical)
import Hero from "./hero";
import PlatformPreview from "./platform-preview";
import MobilePreview from "./mobile-preview";
import { SubscriptionCards } from "./subscription-card";

// Lazy Load Sections with Individual Skeletons
const FeaturePreview = dynamic(() => import("./feature-preview"), {
  ssr: false,
});
const FAQPreview = dynamic(() => import("./faq-preview"), { ssr: false });
const AboutPreview = dynamic(() => import("./about-preview"), { ssr: false });
//const TestimonialsPreview = dynamic(() => import("./testimonials-preview"), { ssr: false });
const ContactPreview = dynamic(() => import("./contact-preview"), {
  ssr: false,
});
const TextRevealSection = dynamic(() => import("./text-reveal-selection"), {
  ssr: false,
});

export default function PreviewSections() {
  return (
    <>
      <Hero />
      <FeaturePreview />
      <PlatformPreview />
      <MobilePreview />
      <TextRevealSection />
      <AboutPreview />
      <FAQPreview />
      {/* <Suspense fallback={<TestimonialsSkeleton />}>
        <TestimonialsPreview />
      </Suspense>
*/}

{/*
      <section className="py-20 px-4 bg-gradient-to-b from-background via-muted/50 to-background">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Flexible Plans</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Choose the perfect plan for your needs. Upgrade or downgrade at
              any time.
            </p>
          </div>
          <SubscriptionCards />
        </div>
      </section>
*/}

      <ContactPreview />
    </>
  );
}

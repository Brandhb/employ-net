"use client";

import dynamic from "next/dynamic";
import { Suspense } from "react";

// Import Immediately Loaded Sections (Critical)
import Hero from "./hero";
import PlatformPreview from "./platform-preview";
import MobilePreview from "./mobile-preview";

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
      <ContactPreview />
    </>
  );
}

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function AboutPreview() {
  return (
    <section className="py-20 px-8 md:px-12 lg:px-20 bg-gradient-to-b from-background to-muted/50">
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
  );
}

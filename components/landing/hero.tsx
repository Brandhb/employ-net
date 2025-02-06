import { SparklesText } from "@/components/ui/sparkles-text";
import { Particles } from "@/components/ui/particles";
import { RainbowButton } from "@/components/ui/rainbow-button";
import Link from "next/link";
import { Link as ScrollLink } from "react-scroll";

import { ChevronRightIcon, MoveRight, PlayCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AvatarCircles } from "../ui/avatar-circles";

const avatarUrls = [
  "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&h=100",
  "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=100&h=100",
  "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=100&h=100",
  "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=100&h=100",
];
export default function Hero() {

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden px-20">
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
              <ChevronRightIcon className="ml-1 size-4 transition-transform duration-300 group-hover:translate-x-1" />
            </Link>
          </RainbowButton>
          <Button variant="outline" size="lg">
            <ScrollLink
              to="demo"
              smooth={true}
              duration={1000} // 1000ms (1 second) scroll duration
              offset={-10} // Adjusts positioning if needed
              className="flex items-center cursor-pointer"
            >
              Watch Demo
              <PlayCircle className="ml-2 h-4 w-4" />
            </ScrollLink>
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
  );
}

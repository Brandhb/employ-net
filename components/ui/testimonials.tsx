"use client";

import { useEffect, useState } from "react";
import {
  Carousel,
  CarouselApi,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface Author {
  name: string;
  avatarUrl?: string;
}

interface TestimonialProps {
  content: string;
  author: Author;
  delay?: number;
}

function Testimonials({ content, author, delay = 0 }: TestimonialProps) {
  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    if (!api) return;

    const interval = setInterval(() => {
      if (api.selectedScrollSnap() + 1 === api.scrollSnapList().length) {
        setCurrent(0);
        api.scrollTo(0);
      } else {
        api.scrollNext();
        setCurrent((prev) => prev + 1);
      }
    }, 4000);

    return () => clearInterval(interval);
  }, [api]);

  return (
    <div className="w-full py-20 lg:py-40">
      <div className="container mx-auto">
        <div className="flex flex-col gap-10">
          <h2 className="text-3xl md:text-5xl tracking-tighter lg:max-w-xl font-regular text-left">
            Trusted by thousands of businesses worldwide
          </h2>
          <Carousel setApi={setApi} className="w-full">
            <CarouselContent>
              <CarouselItem className="lg:basis-1/2">
                <div className="bg-muted rounded-md h-full lg:col-span-2 p-6 aspect-video flex justify-between flex-col">
                  <div className="flex flex-col gap-4">
                    <div className="flex flex-col">
                      <h3 className="text-xl tracking-tight">Testimonial</h3>
                      <p className="text-muted-foreground max-w-xs text-base">
                        {content}
                      </p>
                    </div>
                    <p className="flex flex-row gap-2 text-sm items-center">
                      <span className="text-muted-foreground">By</span>
                      <Avatar className="h-6 w-6">
                        <AvatarImage src={author.avatarUrl} />
                        <AvatarFallback>{author.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <span>{author.name}</span>
                    </p>
                  </div>
                </div>
              </CarouselItem>
            </CarouselContent>
          </Carousel>
        </div>
      </div>
    </div>
  );
}

export { Testimonials };

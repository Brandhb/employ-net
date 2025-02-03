"use client";

import Image from "next/image";
import { Button } from "@/components/ui/button";
import { ExternalLink } from "lucide-react";

interface DisplayAdProps {
  title: string;
  content: string;
  reward: number;
  metadata: {
    imageUrl?: string;
    targetUrl?: string;
    format?: string;
  };
  onClick: () => void;
}

export function DisplayAd({ title, content, reward, metadata, onClick }: DisplayAdProps) {
  const handleClick = () => {
    onClick();
    if (metadata.targetUrl) {
      window.open(metadata.targetUrl, "_blank");
    }
  };

  return (
    <div className="relative group cursor-pointer" onClick={handleClick}>
      {metadata.imageUrl && (
        <div className="relative aspect-video">
          <Image
            src={metadata.imageUrl}
            alt={title}
            fill
            className="object-cover"
          />
        </div>
      )}
      <div className="p-4 space-y-4">
        <div>
          <h3 className="text-lg font-semibold mb-2">{title}</h3>
          <p className="text-sm text-muted-foreground">{content}</p>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-sm font-medium">{reward} points</span>
          <Button className="group-hover:translate-x-1 transition-transform">
            Learn More
            <ExternalLink className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
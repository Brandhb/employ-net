import { FC } from "react";
import { Badge } from "@/components/ui/badge";

interface FeatureItem {
  icon: React.ElementType;
  title: string;
  description: string;
}

interface FeatureProps {
  features: FeatureItem[];
}

const Feature: FC<FeatureProps> = ({ features }) => {
  return (
    <div className="w-full max-w-64 py-20 lg:py-40">
      <div className="container mx-auto">
        <div className="flex flex-col gap-10">
          <div className="flex gap-4 flex-col items-start">
            <Badge>Platform Features</Badge>
            <h2 className="text-3xl md:text-5xl tracking-tighter max-w-xl font-semibold text-left">
              Discover What Makes Us Unique
            </h2>
            <p className="text-lg max-w-xl lg:max-w-lg leading-relaxed tracking-tight text-muted-foreground text-left">
              Explore the core features designed to help you succeed in the digital world.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div
                  key={index}
                  className={`bg-muted rounded-md p-6 flex flex-col justify-between ${
                    index % 4 === 0 || index % 4 === 3 ? "lg:col-span-2" : ""
                  }`}
                >
                  <Icon className="w-8 h-8 stroke-1 mb-4 text-primary" />
                  <div>
                    <h3 className="text-xl font-semibold tracking-tight">{feature.title}</h3>
                    <p className="text-muted-foreground mt-2 text-base">{feature.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export { Feature };

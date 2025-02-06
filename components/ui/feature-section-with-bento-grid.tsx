import { FC } from "react";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";

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
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="w-full max-w-64 py-20 lg:py-40"
    >
      <div className="container mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: "easeOut", delay: 0.2 }}
          className="flex flex-col gap-10"
        >
          {/* Animated Badge with Faster Floating Effect */}
          <motion.div
            initial={{ y: -3 }}
            animate={{ y: 3 }}
            transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut", repeatType: "mirror" }}
            className="flex gap-4 flex-col items-start"
          >
            <Badge className="shadow-md">Platform Features</Badge>
            <h2 className="text-3xl md:text-5xl tracking-tighter max-w-xl font-semibold text-left">
              Discover What Makes Us Unique
            </h2>
            <p className="text-lg max-w-xl lg:max-w-lg leading-relaxed tracking-tight text-muted-foreground text-left">
              Explore the core features designed to help you succeed in the digital world.
            </p>
          </motion.div>

          {/* Features Grid with Quick Response Animations */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.95, y: 15 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  transition={{ duration: 0.4, ease: "easeOut", delay: index * 0.05 }}
                  whileHover={{ scale: 1.04, translateY: -3 }}
                  className={`bg-muted rounded-md p-6 flex flex-col justify-between shadow-md transition-transform ${
                    index % 4 === 0 || index % 4 === 3 ? "lg:col-span-2" : ""
                  }`}
                >
                  <motion.div
                    initial={{ rotate: 0 }}
                    whileHover={{ rotate: 3 }}
                    transition={{ duration: 0.3, ease: "easeOut" }}
                  >
                    <Icon className="w-8 h-8 stroke-1 mb-4 text-primary" />
                  </motion.div>
                  <div>
                    <h3 className="text-xl font-semibold tracking-tight">{feature.title}</h3>
                    <p className="text-muted-foreground mt-2 text-base">{feature.description}</p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export { Feature };

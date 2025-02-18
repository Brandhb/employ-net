import { motion } from "framer-motion";
import Image from "next/image";
import React from "react";

const PaymentMethodsPreview = () => {
  return (
    <section className="py-20 px-4 bg-gradient-to-b from-background to-muted/50">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Trusted Payment Methods</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            We support a wide range of secure payment options to ensure smooth
            and reliable transactions.
          </p>
        </div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="flex flex-wrap justify-center items-center gap-8 md:gap-12"
        >
          {[
            { name: "Apple Pay", logo: "/payment-logos/apple-pay.png" },
            { name: "Stripe", logo: "/payment-logos/stripe.png" },
            { name: "Mastercard", logo: "/payment-logos/card.png" },
            { name: "Visa", logo: "/payment-logos/visa.png" },
            { name: "Google Pay", logo: "/payment-logos/google-pay.png" },
            { name: "PayPal", logo: "/payment-logos/paypal.png" },
            { name: "Square", logo: "/payment-logos/square.png" },
          ].map((method) => (
            <div
              key={method.name}
              className="flex items-center justify-center bg-white/5 backdrop-blur-sm rounded-lg hover:bg-white/10 transition-colors"
              style={{ minWidth: "160px", height: "80px" }}
            >
              <Image
                fill
                src={method.logo}
                alt={`${method.name} logo`}
                className="h-8 object-contain filter transition-all"
              />
            </div>
          ))}
        </motion.div>
        <div className="text-center mt-8">
          <p className="text-sm text-muted-foreground">
            All transactions are secured with industry-standard encryption
          </p>
        </div>
      </div>
    </section>
  );
};

export default PaymentMethodsPreview;

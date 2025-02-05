"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";

const faqs = [
  {
    question: "What is Employ-Net?",
    answer:
      "Employ-Net is a global platform connecting professionals with verified employment opportunities. We focus on task-based learning, enabling users to build their skills while earning real income.",
  },
  {
    question: "How do I get started?",
    answer:
      "Simply sign up, complete your profile, and start browsing available tasks and job opportunities. You can apply for projects that match your skills and interests.",
  },
  {
    question: "Are the job opportunities verified?",
    answer:
      "Yes, all job postings and tasks go through a strict verification process to ensure they are legitimate and secure for our users.",
  },
  {
    question: "How do I earn money on Employ-Net?",
    answer:
      "You can earn by completing tasks, projects, or freelance gigs. Payments are made instantly after task approval through secure payment gateways.",
  },
  {
    question: "Is Employ-Net free to use?",
    answer:
      "Yes, creating an account and accessing opportunities is completely free. We may offer premium features for enhanced visibility or faster project matching.",
  },
  {
    question: "How do I withdraw my earnings?",
    answer:
      "You can withdraw your earnings securely through various payment methods, including bank transfers, PayPal, and other supported platforms.",
  },
];

const FAQSection = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className="py-20 px-4 bg-gradient-to-b from-background via-muted/50 to-background">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-3xl font-bold text-center mb-8">Frequently Asked Questions</h2>
        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className="border rounded-lg bg-white dark:bg-muted shadow-md overflow-hidden transition duration-300"
            >
              <button
                className="w-full px-6 py-4 flex justify-between items-center text-left focus:outline-none"
                onClick={() => toggleFAQ(index)}
              >
                <span className="text-lg font-medium">{faq.question}</span>
                <ChevronDown
                  className={`h-5 w-5 transition-transform ${
                    openIndex === index ? "rotate-180" : "rotate-0"
                  }`}
                />
              </button>
              {openIndex === index && (
                <div className="px-6 pb-4 text-muted-foreground text-sm">
                  {faq.answer}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FAQSection;

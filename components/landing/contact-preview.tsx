import { ContactForm } from "@/components/contact-form";

export default function ContactPreview() {
  return (
    <section id="contact-us" className="py-20 px-8 md:px-12 lg:px-20 bg-gradient-to-b from-background to-muted/90">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Get in Touch</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Have questions or need assistance? We&apos;re here to help! Fill
              out the form below and our team will get back to you shortly.
            </p>
          </div>
          <ContactForm />
        </div>
      </section>
  );
}

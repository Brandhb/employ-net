import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import { Inter } from "next/font/google";
import { GoogleAnalytics, GoogleTagManager } from "@next/third-parties/google";

import { Toaster } from "@/components/ui/toaster";
import { ThemeProvider } from "@/components/theme-provider";
import { InformationalBanner } from "@/components/ui/Informational-banner";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Employ-Net",
  description: "Your gateway to digital employment opportunities",
  metadataBase: new URL("https://employ-net.com"),
  icons: [
    {
      rel: "icon",
      type: "image/ico",
      sizes: "32x32",
      url: "/favicons/favicon.ico",
    },
    {
      rel: "icon",
      type: "image/png",
      sizes: "16x16",
      url: "/favicons/favicon-16x16.png",
    },
    {
      rel: "apple-touch-icon",
      sizes: "180x180",
      url: "/favicons/apple-touch-icon.png",
    },
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider>
      <html lang="en" suppressHydrationWarning>
        <body className={inter.className}>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            
              {children}
              <InformationalBanner />
              <Toaster />
            
            <GoogleAnalytics gaId="G-2GNZJ681NL" />
            <GoogleTagManager gtmId="G-2GNZJ681NL" />
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}

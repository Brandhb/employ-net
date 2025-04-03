import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import { Inter } from "next/font/google";
import { GoogleAnalytics, GoogleTagManager } from "@next/third-parties/google";

import { Toaster } from "@/components/ui/toaster";
import { ThemeProvider } from "@/components/theme-provider";
import { InformationalBanner } from "@/components/ui/Informational-banner";
import dynamic from "next/dynamic";
import { currentUser } from "@clerk/nextjs/server";

const HawkChat = dynamic(() => import("@/components/chat/hawk-chat"), {
  ssr: false,
});

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  // ... your metadata here
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await currentUser();
  const email = user?.emailAddresses?.[0]?.emailAddress || "";

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
            {email && <HawkChat email={email} />}
            <GoogleAnalytics gaId="G-2GNZJ681NL" />
            <GoogleTagManager gtmId="G-2GNZJ681NL" />
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}

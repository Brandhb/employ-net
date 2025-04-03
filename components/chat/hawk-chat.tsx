"use client";

import { useEffect } from "react";

declare global {
  interface Window {
    Tawk_API: any;
    Tawk_LoadStart: Date;
  }
}

interface HawkChatProps {
  email: string;
}

export default function HawkChat({ email }: HawkChatProps) {
  useEffect(() => {
    window.Tawk_API = window.Tawk_API || {};
    window.Tawk_LoadStart = new Date();

    const script = document.createElement("script");
    script.src = "https://embed.tawk.to/67ee4e6cc986f419117f8ad6/1inte4lo1";
    script.async = true;
    script.charset = "UTF-8";
    script.setAttribute("crossorigin", "*");

    document.head.appendChild(script);

    script.onload = () => {
      if (window.Tawk_API && email) {
        window.Tawk_API.onLoad = () => {
          window.Tawk_API.setAttributes(
            {
              email: email,
            },
            function (error: any) {
              if (error) console.error("Tawk.to identification error:", error);
            }
          );
        };
      }
    };

    return () => {
      document.head.removeChild(script);
    };
  }, [email]);

  return null;
}

"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import SiteHeader from "../components/SiteHeader";
import SiteFooter from "../components/SiteFooter";
import AppShell from "../components/AppShell";
import Robot from "../components/RobotEmoji";
import { StuckAssistantProvider } from "../providers/stuck-assistance-provider";
import { SessionProvider } from "../providers/session-provider";
import LayoutInner from "./LayoutInner";

export default function LayoutWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  useEffect(() => {
    const originalFetch = window.fetch;

    window.fetch = async (...args) => {
      const [url, options] = args;

      console.groupCollapsed(
        `%c🌐 FETCH → ${
          typeof url === "string"
            ? url
            : url instanceof Request
              ? url.url
              : "unknown url"
        }`,
        "color: #2563eb; font-weight: bold;"
      );

      console.log("Request options:", options);

      try {
        const response = await originalFetch(...args);

        const clone = response.clone();
        let body;

        try {
          body = await clone.json();
        } catch {
          body = await clone.text();
        }

        console.log("Status:", response.status);
        console.log("Response body:", body);

        console.groupEnd();
        return response;
      } catch (err) {
        console.error("Fetch error:", err);
        console.groupEnd();
        throw err;
      }
    };

    console.log("✅ Fetch debugging enabled");

    return () => {
      window.fetch = originalFetch;
    };
  }, []);

  const hideLayout = ["/", "/register", "/forgotpassword", "/onboarding"].includes(pathname);

  return (
    <SessionProvider shouldCheckSession={!hideLayout}>
      <LayoutInner hideLayout={hideLayout}>{children}</LayoutInner>
    </SessionProvider>
  );
}
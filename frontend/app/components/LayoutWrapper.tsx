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
  if ((window as any).__fetchDebugPatched) {
    return;
  }

  const originalFetch = window.fetch;
  (window as any).__fetchDebugPatched = true;
  (window as any).__originalFetch = originalFetch;

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

      let body: unknown = null;

      try {
        const clone = response.clone();
        const rawText = await clone.text();

        if (rawText) {
          try {
            body = JSON.parse(rawText);
          } catch {
            body = rawText;
          }
        }
      } catch (readErr) {
        console.warn("Could not read response body:", readErr);
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
    window.fetch = (window as any).__originalFetch || originalFetch;
    (window as any).__fetchDebugPatched = false;
  };
}, []);

  const hideLayout = ["/", "/register", "/forgotpassword", "/onboarding"].includes(pathname);

  return (
    <SessionProvider shouldCheckSession={!hideLayout}>
      <LayoutInner hideLayout={hideLayout}>{children}</LayoutInner>
    </SessionProvider>
  );
}
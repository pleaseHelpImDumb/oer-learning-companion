"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import SiteHeader from "../components/SiteHeader";
import SiteFooter from "../components/SiteFooter";
import AppShell from "../components/AppShell";
import Robot from "../components/RobotEmoji";
import { StuckAssistantProvider } from "../providers/stuck-assistance-provider";
import { SessionProvider } from "../providers/session-provider";
import { RecentSessionsProvider } from "../providers/recent-session-provider";
import PopupRenderer from "./PopupRenderer";
import LayoutInner from "./LayoutInner";
import CheckInController from "./CheckInController";
import SessionResumeModalController from "./SessionResumeModalController";
import { PopupProvider } from "../providers/popup-provider";
import { UserProvider } from "../providers/user-provider";
export default function LayoutWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  useEffect(() => {
  if (process.env.NODE_ENV === "production") {
    console.log = () => {};
    console.warn = () => {};
    console.error = () => {};
  }
}, []);
useEffect(() => {
  if (process.env.NODE_ENV !== "development") return;

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

  return () => {
    window.fetch = (window as any).__originalFetch || originalFetch;
    (window as any).__fetchDebugPatched = false;
  };
}, []);

  const hideLayout = ["/", "/register", "/forgotpassword", "/onboarding", "/reset-password"].includes(pathname);
  //^paths which will exclude user-specific variables
  useEffect(() => {
    if (hideLayout) return;

    const syncDarkMode = () => { //saves the dark-mode status of the user
      const stored = localStorage.getItem("darkMode");
      const cookieMatch = document.cookie.match(/darkMode=(true|false)/);

      const isDark =
        stored === "true" ||
        (stored === null && cookieMatch?.[1] === "true");

      document.documentElement.classList.toggle("dark", isDark);
    };

    syncDarkMode();

    window.addEventListener("dark-mode-updated", syncDarkMode);

    return () => {
      window.removeEventListener("dark-mode-updated", syncDarkMode);
    };
  }, [hideLayout]);

return (
  <PopupProvider>
    <SessionProvider shouldCheckSession={!hideLayout}>
      <RecentSessionsProvider shouldFetch={!hideLayout}>
        <UserProvider>
          <StuckAssistantProvider>
            <LayoutInner hideLayout={hideLayout}>{children}</LayoutInner>
            {!hideLayout && <CheckInController />}
            {!hideLayout && <SessionResumeModalController />}
            {!hideLayout && <PopupRenderer />}
          </StuckAssistantProvider>
        </UserProvider>
      </RecentSessionsProvider>
    </SessionProvider>
  </PopupProvider>
);
}
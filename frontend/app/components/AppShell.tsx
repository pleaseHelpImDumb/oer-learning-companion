"use client";

import { useEffect, useState } from "react";
import SideBar from "./SideBar";

export default function AppShell({ children }: { children: React.ReactNode }) {
  const [snapped, setSnapped] = useState(false);
  const [headerHeight, setHeaderHeight] = useState(0);

  // measure <header> height so the *top bar* can sit right under it
  useEffect(() => {
    const headerEl = document.querySelector("header");
    if (!headerEl) return;

    const update = () => setHeaderHeight(headerEl.getBoundingClientRect().height);
    update();

    const ro = new ResizeObserver(update);
    ro.observe(headerEl);
    window.addEventListener("resize", update);

    return () => {
      ro.disconnect();
      window.removeEventListener("resize", update);
    };
  }, []);

  /**
   * Layout rules:
   * - NOT snapped: 2 columns => [sidebar | main]
   * - snapped: 2 rows => [topbar] then [main]
   *
   * We reserve space using:
   * - width when vertical (w-14 / w-16)
   * - height when horizontal (h-14 / h-16)
   */
  return (
    <div
      className={
        snapped
          ? "flex flex-col flex-1"          // top bar then main
          : "flex flex-row flex-1"          // sidebar then main
      }
    >
      <SideBar
        snapped={snapped}
        setSnapped={setSnapped}
        headerOffset={headerHeight}
      />

      <main className="flex-1 min-w-0">
        {children}
      </main>
    </div>
  );
}
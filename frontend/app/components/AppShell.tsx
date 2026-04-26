"use client";

import { useEffect, useState } from "react";
import SideBar from "./SideBar";

export default function AppShell({ children }: { children: React.ReactNode }) {
  const [snapped, setSnapped] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [headerHeight, setHeaderHeight] = useState(0);

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

  return (
    <div
      className={
        hidden
          ? "flex flex-row flex-1"
          : snapped
            ? "flex flex-col flex-1"
            : "flex flex-row flex-1"
      }
    >
      <SideBar
        snapped={snapped}
        setSnapped={setSnapped}
        hidden={hidden}
        setHidden={setHidden}
        headerOffset={headerHeight}
      />

      <main className="flex-1 min-w-0">
        {children}
      </main>
    </div>
  );
}
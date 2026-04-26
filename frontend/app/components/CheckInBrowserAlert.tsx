"use client";

import { useEffect } from "react";

type Props = {
  active: boolean;
};

function setFavicon(href: string) {
  // remove ALL existing icons (Next.js injects multiple)
  document
    .querySelectorAll("link[rel*='icon']")
    .forEach((el) => el.remove());

  // create new one with cache-busting
  const link = document.createElement("link");
  link.rel = "icon";
  link.type = "image/png";
  link.href = `${href}?v=${Date.now()}`;

  document.head.appendChild(link);
}

export default function CheckInBrowserAlert({ active }: Props) {
  useEffect(() => {
    const normalTitle = "Achievo";

    if (!active) {
      document.title = normalTitle;
      setFavicon("/favicon.ico");
      return;
    }

    setFavicon("/favicon-alert.ico");

    let toggle = false;

    const interval = window.setInterval(() => {
      document.title = toggle
        ? "Check-in waiting!"
        : "Achievo";
      toggle = !toggle;
    }, 1000);

    return () => {
      window.clearInterval(interval);
      document.title = normalTitle;
      setFavicon("/favicon.ico");
    };
  }, [active]);

  return null;
}
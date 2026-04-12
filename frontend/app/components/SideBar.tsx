"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import StuckModal from "./StuckModal";
import AIHelpModal from "./AIHelp";
import { useStuckAssistant } from "@/app/providers/stuck-assistance-provider";

const icons = [
  { src: "/dashboard.png", alt: "Home", href: "/dashboard" },
  { src: "/timer.png", alt: "Timer", href: "/timer" },
  { src: "/pencil.png", alt: "stuck", href: "/stuck" },
  { src: "/mask.png", alt: "Focus", href: "/activity" },
  { src: "/sleep.png", alt: "breaks", href: "/break" },
  { src: "/profits.png", alt: "sessionsummary", href: "/summary" },
  { src: "/question.png", alt: "Help", href: "/help" },
  { src: "/settings.png", alt: "Settings", href: "/settings" },
  { src: "/arrowleft.png", alt: "Back", href: "/back" },
  { src: "/arrowup.png", alt: "Top", href: "/top" },
  { src: "/quotes.png", alt: "Quotes", href: "/quotes" },
];

type Props = {
  snapped: boolean;
  setSnapped: (v: boolean) => void;
  headerOffset: number;
};

export default function SideBar({ snapped, setSnapped, headerOffset }: Props) {
  const [stuckOpen, setStuckOpen] = useState(false);
  const { openAssistant } = useStuckAssistant();

  const asideClass = snapped
    ? "z-30 w-full h-14 sm:h-16 bg-[#235937] dark:bg-[#23314c] border-b border-white/20 grid grid-cols-11"
    : "z-30 w-10 sm:w-12 bg-[#235937] dark:bg-[#23314c] border-r border-white/20 flex flex-col items-center py-3";

  const cellClass = snapped
    ? "relative flex h-full w-full items-center justify-center transition-colors hover:bg-white/5"
    : "relative flex h-11 w-full items-center justify-center transition-all duration-150 hover:bg-white/5";

  const iconClass = "object-contain opacity-95";

  return (
    <>
      <aside className={asideClass} style={{ top: headerOffset }}>
        {icons.map((icon) => {
          const isStuck = icon.alt === "stuck";
          const isTop = icon.alt === "Top";
          const isBack = icon.alt === "Back";
          const isHelp = icon.alt === "Help";

          const showDividerAbove =
            !snapped && (icon.alt === "Settings" || icon.alt === "Back");

          const content = (
            <>
              {showDividerAbove && (
                <div className="absolute top-0 left-1/2 h-px w-6 -translate-x-1/2 bg-white/25" />
              )}
              <Image
                src={icon.src}
                alt={icon.alt}
                fill
                sizes={snapped ? "48px" : "32px"}
                className={`${iconClass} p-2.5 sm:p-2`}
              />
            </>
          );

          if (isTop) {
            return (
              <button
                key={icon.src}
                type="button"
                onClick={() => {
                  setSnapped(true);
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}
                className={cellClass}
                aria-label="Move nav to top bar"
              >
                {content}
              </button>
            );
          }

          if (isBack) {
            return (
              <button
                key={icon.src}
                type="button"
                onClick={() => setSnapped(false)}
                className={cellClass}
                aria-label="Move nav back to side"
              >
                {content}
              </button>
            );
          }

          if (isStuck) {
            return (
              <button
                key={icon.src}
                type="button"
                onClick={() => setStuckOpen(true)}
                className={cellClass}
                aria-label="Open stuck window"
              >
                {content}
              </button>
            );
          }

          if (isHelp) {
            return (
              <button
                key={icon.src}
                type="button"
                onClick={() => openAssistant()}
                className={cellClass}
                aria-label="Open AI companion"
              >
                {content}
              </button>
            );
          }

          return (
            <Link key={icon.src} href={icon.href} className={cellClass}>
              {content}
            </Link>
          );
        })}
      </aside>

      <StuckModal
        open={stuckOpen}
        onClose={() => setStuckOpen(false)}
        onHelp={() => {
          setStuckOpen(false);
          openAssistant();
        }}
      />

      <AIHelpModal />
    </>
  );
}
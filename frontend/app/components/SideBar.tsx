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
  { src: "/mask.png", alt: "Focus", href: "/focus" },
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
  const [aiHelpOpen, setAiHelpOpen] = useState(false); // ✅ NEW
  const { openAssistant } = useStuckAssistant();
  const asideClass = snapped
    ? "z-30 w-full h-14 sm:h-16 bg-[#235937] border-b border-black grid grid-cols-11"
    : "z-30 h-[100dvh] w-14 sm:w-16 bg-[#235937] border-r border-black grid grid-rows-11";

  const cellClass =
    "relative w-full h-full flex items-center justify-center hover:bg-[#1c4a2d] transition-colors";

  return (
    <>
      <aside className={asideClass} style={{ top: headerOffset }}>
        {icons.map((icon) => {
          const isStuck = icon.alt === "stuck";
          const isTop = icon.alt === "Top";

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
                <Image src={icon.src} alt={icon.alt} fill sizes="64px" className="object-contain p-2" />
              </button>
            );
          }

          if (icon.alt === "Back") {
            return (
              <button
                key={icon.src}
                type="button"
                onClick={() => setSnapped(false)}
                className={cellClass}
                aria-label="Move nav back to side"
              >
                <Image src={icon.src} alt={icon.alt} fill sizes="64px" className="object-contain p-2" />
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
                <Image src={icon.src} alt={icon.alt} fill sizes="64px" className="object-contain p-2" />
              </button>
            );
          }

          return (
            <Link key={icon.src} href={icon.href} className={cellClass}>
              <Image src={icon.src} alt={icon.alt} fill sizes="64px" className="object-contain p-2" />
            </Link>
          );
        })}
      </aside>

    <StuckModal
      open={stuckOpen}
      onClose={() => setStuckOpen(false)}
      onHelp={() => openAssistant()}  // ✅ global open
    />

      <AIHelpModal open={aiHelpOpen} onClose={() => setAiHelpOpen(false)} />
    </>
  );
}
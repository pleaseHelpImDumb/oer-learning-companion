"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";
import StuckModal from "./StuckModal";
import AIHelpModal from "./AIHelp";
import { useStuckAssistant } from "@/app/providers/stuck-assistance-provider";

const icons = [
  { src: "/dashboard.png", alt: "Home", href: "/dashboard" },
  { src: "/timer.png", alt: "Timer", href: "/timer" },
  { src: "/pencil.png", alt: "stuck" },
  { src: "/mask.png", alt: "Focus", href: "/ticTacToe" },
  { src: "/sleep.png", alt: "breaks", href: "/break" },
  { src: "/profits.png", alt: "sessionsummary", href: "/summary" },
  { src: "/question.png", alt: "Help" },
  { src: "/settings.png", alt: "Settings", href: "/settings" },
  { src: "/quotes.png", alt: "Quote" },
];

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

type UserProfile = {
  userId: number;
  username: string;
  displayName: string | null;
  email: string;
  role: string;
  avatarUrl: string | null;
  favoriteQuote: string | null;
  checkinIntervalMinutes: number | null;
  onboardingCompleted: boolean;
  createdAt: string;
  track: unknown;
  totalTokensEarned: number;
  badges: Badge[];
};

type Badge = {
  badgeId: number;
  name: string;
  description: string;
  iconUrl: string | null;
  unlockedAt: string;
};

type Props = {
  hidden: boolean;
  setHidden: (v: boolean) => void;
};

export default function SideBar({ hidden, setHidden }: Props) {
  const [stuckOpen, setStuckOpen] = useState(false);
  const [user, setUser] = useState<UserProfile | null>(null);
  const { openAssistant } = useStuckAssistant();

  useEffect(() => {
    async function loadDashboardData() {
      if (!API_BASE_URL) return;

      try {
        const profileRes = await fetch(`${API_BASE_URL}/users/profile`, {
          method: "GET",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
        });

        const profileData = await profileRes.json().catch(() => null);

        if (profileRes.ok) {
          setUser(profileData?.user ?? null);
        }
      } catch (error) {
        console.error("[DASHBOARD FETCH ERROR]", error);
      }
    }

    loadDashboardData();
  }, []);

  const cellClass =
    "relative flex h-11 w-full items-center justify-center transition-all duration-150 hover:bg-white/5";

  const iconClass = "object-contain opacity-95";

  return (
    <>
      <aside
        className={`
          fixed left-0 top-0 z-50
          h-screen w-10 sm:w-12
          bg-[#235937] dark:bg-[#23314c]
          border-r border-white/20
          flex flex-col items-center py-3
          transition-transform duration-300
          ${hidden ? "-translate-x-full" : "translate-x-0"}
        `}
      >
        {icons.map((icon) => {
          const isStuck = icon.alt === "stuck";
          const isHelp = icon.alt === "Help";

          const showDividerAbove = icon.alt === "Settings";

          const content = (
            <>
              {showDividerAbove && (
                <div className="absolute top-0 left-1/2 h-px w-6 -translate-x-1/2 bg-white/25" />
              )}

              <Image
                src={icon.src}
                alt={icon.alt}
                width={24}
                height={24}
                className={iconClass}
              />
            </>
          );

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

          return icon.href ? (
            <Link key={icon.src} href={icon.href} className={cellClass}>
              {content}
            </Link>
          ) : (
            <div key={icon.src} className={`${cellClass} group relative`}>
              {content}

              <p
                className="
                  pointer-events-none
                  absolute left-full top-1/2 ml-3
                  -translate-y-1/2
                  whitespace-nowrap
                  rounded-md bg-black px-2 py-1 text-xs text-white
                  opacity-0 transition-opacity duration-150
                  group-hover:opacity-100
                "
              >
                {user?.favoriteQuote}
              </p>
            </div>
          );
        })}

        <button
          type="button"
          onClick={() => setHidden(!hidden)}
          className="
            absolute left-full top-1/2 z-50
            flex h-12 w-6 -translate-y-1/2
            items-center justify-center
            rounded-r-md
            bg-[#235937] text-white shadow-md
            hover:brightness-110
            dark:bg-[#23314c]
          "
          aria-label={hidden ? "Show sidebar" : "Hide sidebar"}
          title={hidden ? "Show menu" : "Hide menu"}
        >
          <span className="text-lg font-bold leading-none">
            {hidden ? "▶" : "◀"}
          </span>
        </button>
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
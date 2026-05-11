"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";
import StuckModal from "./StuckModal";
import AIHelpModal from "./AIHelp";
import { useStuckAssistant } from "@/app/providers/stuck-assistance-provider";
import { useCheckIn } from "@/app/providers/checkin-provider";
import { useSession } from "../providers/session-provider";

const icons = [
  { src: "/dashboard.png", alt: "Home", href: "/dashboard" },
  { src: "/timer.png", alt: "Timer", href: "/timer" },
  { src: "/pencil.png", alt: "stuck" },
  { src: "/mask.png", alt: "Focus", href: "/ticTacToe" },
  { src: "/Thumbs_white.png", alt: "CheckIn" },
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
function hasActiveSession() {
  if (!activeSession?.sessionId) {
    setSessionWarning("Start a study session before submitting a check-in.");
    return false;
  }

  setSessionWarning(null);
  return true;
}
  const [sessionWarning, setSessionWarning] = useState<string | null>(null);
  const [stuckOpen, setStuckOpen] = useState(false);
  const [user, setUser] = useState<UserProfile | null>(null);
  const { openAssistant } = useStuckAssistant();
  const { checkInWaiting, submitCheckIn, triggerCheckIn } = useCheckIn();
const { activeSession } = useSession();
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
const isCheckInIcon = icon.alt === "Focus";
          const showDividerAbove = icon.alt === "Settings";
const isCheckIn = icon.alt === "CheckIn";
const content = (
  <>
    {showDividerAbove && (
      <div className="absolute top-0 left-1/2 h-px w-6 -translate-x-1/2 bg-white/25" />
    )}

    <div className="relative flex items-center justify-center">
      <Image
        src={icon.src}
        alt={icon.alt}
        width={24}
        height={24}
        className={iconClass}
      />
{/**If the user has a quick check in, create a popup on the side bar */}
      {isCheckIn && checkInWaiting && (
        <div
          className="
            absolute left-full top-1/2 ml-3
            flex -translate-y-1/2 items-center gap-2
            rounded-xl border border-white/20
            bg-[#235937] px-3 py-2
            text-white shadow-lg
            dark:bg-[#23314c]
          "
        >
<button
  type="button"
onClick={async (e) => {
  e.preventDefault();
  e.stopPropagation();
  await submitCheckIn("up");
}}
  className="rounded-full bg-white/10 px-2 py-1 hover:bg-white/20"
>
  👍
</button>
{/**User is happy :D */}
<button
  type="button"
onClick={async (e) => {
  e.preventDefault();
  e.stopPropagation();
  await submitCheckIn("down");
}}
  className="rounded-full bg-white/10 px-2 py-1 hover:bg-white/20"
>
  👎
</button>
{/**User needs help */}
        </div>
      )}
    </div>
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
if (isCheckInIcon && checkInWaiting) {
  return (
    <div key={icon.src} className={cellClass}>
      {content}
    </div>
  );
}
if (isCheckIn) {
  return (
    <div key={icon.src} className={cellClass} title="Check in">
      {/**Manual user checkin */}
      <button
        type="button"
        onClick={() => triggerCheckIn()}
        className="flex h-full w-full items-center justify-center"
        aria-label="Open check-in"
      >
        <Image
          src={icon.src}
          alt={icon.alt}
          width={24}
          height={24}
          className={iconClass}
        />
      </button>

      {checkInWaiting && (
        <div
          className="
            absolute left-full top-1/2 ml-3
            flex -translate-y-1/2 items-center gap-2
            rounded-xl border border-white/20
            bg-[#235937] px-3 py-2
            text-white shadow-lg
            dark:bg-[#23314c]
          "
        >
          <button
            type="button"
            onClick={async (e) => {
              e.preventDefault();
              e.stopPropagation();
              await submitCheckIn("up");
            }}
            className="rounded-full bg-white/10 px-2 py-1 hover:bg-white/20"
          >
            👍
          </button>

<button
  type="button"
  onClick={async (e) => {
    e.preventDefault();
    e.stopPropagation();

    await submitCheckIn("down");
    setStuckOpen(true);
  }}
  className="rounded-full bg-white/10 px-2 py-1 hover:bg-white/20"
>
  👎
</button>
        </div>
      )}
    </div>
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
{/**Hides or reveals the side bar */}
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
            {/**Pullout section of side bar */}
          </span>
        </button>
      </aside>

<StuckModal
  open={stuckOpen}
  onClose={() => {
    setStuckOpen(false);
    setSessionWarning(null);
  }}
  onHelp={() => {
    console.log("[CHECK-IN] Help clicked");

    setStuckOpen(false);

    setTimeout(() => {
      console.log("[CHECK-IN] Opening AI assistant");
      openAssistant();
    }, 50);
  }}
  onChooseHelp={async (helpChosen) => {
    if (!hasActiveSession()) {
      setStuckOpen(false);
      return;
    }

    console.log("[CHECK-IN] Saving help choice:", helpChosen);
    await submitCheckIn("down", helpChosen);
  }}
/>

      <AIHelpModal />
    </>
  );
}
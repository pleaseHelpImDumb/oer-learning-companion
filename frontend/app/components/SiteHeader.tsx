"use client";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useSession } from "../providers/session-provider";

export default function SiteHeader() {
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
  const [avatarUrl, setAvatarUrl] = useState(`profile0`);
  const [username, setUsername] = useState("username");
  const [timerDisplay, setTimerDisplay] = useState("0:00:00");
  const { activeSession } = useSession();
  const [tokenBalance, setTokenBalance] = useState(0);
  const TRACKS = {
    Art: ["🎨", "🖋️", "🖼️", "🧑‍🎨"],
    Gaming: ["🕹️", "🎮", "🎲", "♟️"],
    Music: ["🎧", "🎺", "🎸", "🥁"],
    Pets: ["🐶", "🐱", "🐹", "🐰"],
    Space: ["🚀", "🌕", "☄️", "👾"],
    Sports: ["🏀", "⚽", "⚾", "🏈"],
  } as const;

  type TrackName = keyof typeof TRACKS;

  const [track, setTrack] = useState<TrackName>("Space");
  const [open, setOpen] = useState(false);
  const [latestBadge, setLatestBadge] = useState<{
    emoji: string;
    name: string;
  } | null>(null);

  function formatElapsed(ms: number) {
    const totalSeconds = Math.max(0, Math.floor(ms / 1000));
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    return `${hours}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
  }

  function getElapsedMs(session: any) {
    const startMs = new Date(session.startTime).getTime();
    const pausedMs = (session.totalPausedMinutes || 0) * 60 * 1000;

    if (session.status === "PAUSED" && session.lastPauseTime) {
      const pauseStartMs = new Date(session.lastPauseTime).getTime();
      return Math.max(0, pauseStartMs - startMs - pausedMs);
    }

    return Math.max(0, Date.now() - startMs - pausedMs);
  }

  useEffect(() => {
    async function userInfo() {
      try {
        console.log("API_BASE_URL:", API_BASE_URL);

        const userRes = await fetch(`${API_BASE_URL}/users/profile`, {
          method: "GET",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
        });

        console.log("status:", userRes.status);

        const userData = await userRes.json();
        console.log("userData:", userData);

        if (!userRes.ok) {
          console.log("response not ok");
          alert(userData.error || "Could not fetch user info");
          return;
        }

        const rawTrack = userData.user?.track;

        const userTrack =
          typeof rawTrack === "string"
            ? rawTrack
            : typeof rawTrack?.name === "string"
              ? rawTrack.name
              : null;

        console.log("normalized userTrack:", userTrack);
        const rawAvatarUrl = userData.user?.avatarUrl;
        const name = userData.user?.displayName;

        if (typeof rawAvatarUrl === "string" && rawAvatarUrl.trim() !== "") {
          setAvatarUrl(rawAvatarUrl);
        }

        if (typeof name === "string") {
          setUsername(name);
        }

        if (userTrack && userTrack in TRACKS) {
          setTrack(userTrack as TrackName);
        } else {
          console.log("track failed guard");
        }
          const tokens = userData.user?.tokenBalance;

          if (typeof tokens === "number") {
            setTokenBalance(tokens);
          }
        const rawUserBadges = userData.user?.userBadges;

        if (Array.isArray(rawUserBadges) && rawUserBadges.length > 0) {
          const sortedBadges = [...rawUserBadges].sort((a, b) => {
            const aTime = a?.unlockedAt ? new Date(a.unlockedAt).getTime() : 0;
            const bTime = b?.unlockedAt ? new Date(b.unlockedAt).getTime() : 0;
            return bTime - aTime;
          });

          const newestBadge = sortedBadges[0]?.badge;

          if (
            newestBadge &&
            typeof newestBadge.emoji === "string" &&
            newestBadge.emoji.trim() !== ""
          ) {
            setLatestBadge({
              emoji: newestBadge.emoji,
              name:
                typeof newestBadge.name === "string" && newestBadge.name.trim() !== ""
                  ? newestBadge.name
                  : "Latest Badge",
            });
          } else {
            setLatestBadge(null);
          }
        } else {
          setLatestBadge(null);
        }
      } catch (error) {
        console.error("Failed to fetch user info:", error);
      }
    }

    userInfo();
  }, [API_BASE_URL]);

  useEffect(() => {
    if (!activeSession) {
      //console.log("[HEADER TIMER] No active session. Showing 0:00:00");
      setTimerDisplay("0:00:00");
      return;
    }

    const updateTimer = () => {
      const elapsedMs = getElapsedMs(activeSession);
      const formatted = formatElapsed(elapsedMs);

      //console.log("[HEADER TIMER] Updated elapsed time:", formatted);
      setTimerDisplay(formatted);
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);

    return () => clearInterval(interval);
  }, [activeSession]);

  return (
    <header className="w-full border-b border-black bg-[#0E0C32] text-white">
      <div className="mx-auto flex w-full max-w-[1600px] flex-col gap-4 px-4 py-3 sm:px-6 items-center lg:grid lg:grid-cols-[220px_minmax(0,1fr)_220px] lg:items-center lg:gap-6">
        <div className="flex items-center justify-between gap-4 lg:justify-start">
          <div className="whitespace-nowrap text-base font-semibold sm:text-lg">
            OER Learning Companion
          </div>

          <div className="relative inline-block lg:hidden">
            <button
              className="flex items-center"
              onClick={() => setOpen(!open)}
            >
              <Image
                src={`/assets/profiles/${avatarUrl}.png`}
                alt="Profile Icon"
                width={60}
                height={60}
                className="rounded-full border border-white transition hover:scale-105"
              />
            </button>

            {open && (
              <div className="absolute right-0 top-full z-50 mt-2 min-w-[140px] rounded-lg bg-[#D3D3D3] py-2 shadow-md">
                <Link
                  href="/settings"
                  className="block px-4 py-2 text-sm text-black hover:bg-gray-200"
                >
                  Settings
                </Link>
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:flex lg:flex-wrap lg:items-center lg:justify-center lg:gap-6">
          <div className="flex items-center gap-2 rounded-md bg-white/5 px-2 py-2 lg:bg-transparent lg:p-0">
            <div className="rounded bg-green-500 px-2 text-base font-bold sm:text-lg">
              -
            </div>
            <span className="whitespace-nowrap text-sm font-semibold sm:text-base">
              0 modules
            </span>
          </div>

          <div className="flex items-center gap-2 rounded-md bg-white/5 px-2 py-2 lg:bg-transparent lg:p-0">
            <Image
              src="/timer.png"
              alt="Clock"
              width={28}
              height={28}
              className="rounded-full bg-yellow-500 p-1 sm:h-8 sm:w-8"
            />
            <span className="whitespace-nowrap text-sm font-semibold sm:text-base">
              {timerDisplay}
            </span>
          </div>

          <div className="col-span-2 flex items-center gap-2 rounded-md bg-white/5 px-2 py-2 sm:col-span-1 lg:col-span-1 lg:bg-transparent lg:p-0">
            <span className="whitespace-nowrap text-sm font-semibold sm:text-base">
              My Goals
            </span>
            <Image
              src={`/assets/progress_header/${track}/0.png`}
              alt="Progress: 0%"
              width={260}
              height={52}
              className="h-auto w-[200px] sm:w-[260px] lg:w-[220px]"
            />
          </div>

          <div className="col-span-2 flex items-center gap-2 rounded-md bg-white/5 px-2 py-2 sm:col-span-3 lg:col-span-1 lg:bg-transparent lg:p-0">
            <span className="whitespace-nowrap text-sm font-semibold sm:text-base">
              My Tokens
            </span>

            <div className="flex gap-1 text-xl leading-none sm:text-2xl">
              {TRACKS[track].map((emoji, i) => (
                <span key={i} style={{ opacity: i < tokenBalance ? 1 : 0.3 }}>
                  {emoji}
                </span>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2 rounded-md bg-white/5 px-2 py-2 lg:bg-transparent lg:p-0">
            {latestBadge ? (
              <>
                <span className="text-xl leading-none sm:text-2xl">
                  {latestBadge.emoji}
                </span>
                <span className="whitespace-nowrap text-sm font-semibold sm:text-base">
                  {latestBadge.name}
                </span>
              </>
            ) : (
              <>
                <span className="text-xl leading-none sm:text-2xl">🧊</span>
                <span className="whitespace-nowrap text-sm font-semibold sm:text-base">
                  No badge yet
                </span>
              </>
            )}
          </div>
        </div>

        <div className="flex items-center justify-center align-center">
          <Link className="pr-[5%]" href="/dashboard">
            {username}
          </Link>
          <div className="relative hidden lg:flex lg:justify-end">
            <button
              className="flex items-center"
              onClick={() => setOpen(!open)}
            >
              <Image
                src={`/assets/profiles/${avatarUrl}.png`}
                alt="Profile Icon"
                width={60}
                height={60}
                className="rounded-full border border-white transition hover:scale-105"
              />
            </button>

            {open && (
              <div className="absolute right-0 top-full z-50 mt-2 min-w-[140px] rounded-lg bg-[#D3D3D3] py-2 shadow-md">
                <div className="w-[80%] flex flex-col items-center justify-center align-center">
                  <Link
                    className="block px-4 py-2 text-sm text-[#0000FF] hover:bg-gray-200"
                    href="/dashboard"
                  >
                    {username}
                  </Link>
                  <Link
                    href="/settings"
                    className="block px-4 py-2 text-sm text-[#0000FF] hover:bg-gray-200 border-y-1 border-black"
                  >
                    Settings
                  </Link>
                  <Link
                    href="/Logout"
                    className="block px-4 py-2 text-sm text-[#0000FF] hover:bg-gray-200 border-b-1 border-black"
                  >
                    Logout
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
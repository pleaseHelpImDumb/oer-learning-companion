"use client";
import Image from "next/image";
import Link from "next/link";
import { useRef, useState } from "react";
import { useSession } from "../providers/session-provider";
import { useUser } from "../providers/user-provider";
export default function SiteHeader() {
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
  const { track, avatarUrl, username, latestBadge } = useUser();
  const {
    activeSession,
    sessionActionLoading,
    liveStudySeconds,
    displayTokensAvailable,
    pauseSession,
    resumeSession,
    cancelSession,
  } = useSession();

  const sessionTokensAvailable = activeSession ? displayTokensAvailable : 0;
  const baseTokens = activeSession?.tokensAvailable ?? 0;
  const earnedSinceMount = Math.floor(liveStudySeconds / 300);
  const handleTimerClick = async () => {
    if (!activeSession || sessionActionLoading || headerActionLockRef.current)
      return;

    headerActionLockRef.current = true;

    try {
      if (activeSession.status === "ACTIVE") {
        await pauseSession();
        return;
      }

      if (activeSession.status === "PAUSED") {
        await resumeSession();
        return;
      }
    } catch (error) {
      console.error("Failed to toggle timer:", error);
    } finally {
      window.setTimeout(() => {
        headerActionLockRef.current = false;
      }, 1000);
    }
  };
  const handleCancelClick = async () => {
    if (!activeSession || sessionActionLoading || headerActionLockRef.current)
      return;

    headerActionLockRef.current = true;

    try {
      await cancelSession();
    } catch (error) {
      console.error("Failed to cancel session:", error);
    } finally {
      window.setTimeout(() => {
        headerActionLockRef.current = false;
      }, 1000);
    }
  };
  const timerIcon = !activeSession
    ? "/assets/start_button/inactive.png"
    : activeSession.status === "PAUSED"
      ? "/assets/start_button/start.png"
      : "/assets/start_button/pause.png";
  const TRACKS = {
    Art: ["🎨", "🖋️", "🖼️", "🧑‍🎨"],
    Gaming: ["🕹️", "🎮", "🎲", "♟️"],
    Music: ["🎧", "🎺", "🎸", "🥁"],
    Pets: ["🐶", "🐱", "🐹", "🐰"],
    Space: ["🚀", "🌕", "☄️", "👾"],
    Sports: ["🏀", "⚽", "⚾", "🏈"],
  } as const;

  const [open, setOpen] = useState(false);
  const headerActionLockRef = useRef(false);
  function formatElapsedSeconds(totalSeconds: number) {
    const safe = Math.max(0, Math.floor(totalSeconds));
    const hours = Math.floor(safe / 3600);
    const minutes = Math.floor((safe % 3600) / 60);
    const seconds = safe % 60;

    return `${hours}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
  }

  const timerDisplay = activeSession
    ? formatElapsedSeconds(liveStudySeconds)
    : "0:00:00";

  const resolvedTrack = track ?? "Sports";
  const resolvedAvatarUrl = avatarUrl || "profile0";
  const resolvedUsername = username || "username";
const SESSION_GOAL_SECONDS = activeSession?.sessionGoalMinutes
  ? activeSession.sessionGoalMinutes * 60
  : 0;

  const progressPercent = activeSession
    ? Math.min(100, (liveStudySeconds / SESSION_GOAL_SECONDS) * 100)
    : 0;

  const progressImagePercent =
    progressPercent >= 100
      ? 100
      : progressPercent >= 80
        ? 80
        : progressPercent >= 50
          ? 50
          : progressPercent >= 30
            ? 30
            : progressPercent >= 10
              ? 10
              : 0;
  return (
    <header className="w-full border-b border-black bg-[#0E0C32] dark:border-white dark:bg-[#000d2a] text-white">
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
                src={`/assets/profiles/${resolvedAvatarUrl}.png`}
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
          {/*
          <div className="flex items-center gap-2 rounded-md bg-white/5 px-2 py-2 lg:bg-transparent lg:p-0">
            <div className="rounded bg-green-500 px-2 text-base font-bold sm:text-lg">
              -
            </div>
            <span className="whitespace-nowrap text-sm font-semibold sm:text-base">
              0 modules
            </span>
          </div>
            */}
          <div className="flex items-center rounded-md bg-white/5 px-2 py-2 lg:bg-transparent lg:p-0">
            <button
              type="button"
              onClick={handleCancelClick}
              disabled={!activeSession || sessionActionLoading}
              className="transition hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Image
                src="/assets/start_button/stop.png"
                alt={"Stop session"}
                width={70}
                height={70}
                className="p-1 sm:h-12 sm:w-12"
              />
            </button>

            <button
              type="button"
              onClick={handleTimerClick}
              disabled={!activeSession || sessionActionLoading}
              className="transition hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Image
                src={timerIcon}
                alt={
                  activeSession?.status === "ACTIVE"
                    ? "Pause timer"
                    : "Start timer"
                }
                width={70}
                height={70}
                className="p-1 sm:h-12 sm:w-12"
              />
            </button>
            <span className="whitespace-nowrap text-sm font-semibold sm:text-base">
              {timerDisplay}
            </span>
          </div>

          <div className="col-span-2 flex items-center gap-2 rounded-md bg-white/5 px-2 py-2 sm:col-span-1 lg:col-span-1 lg:bg-transparent lg:p-0">
            <span className="whitespace-nowrap text-sm font-semibold sm:text-base">
              My Goals
            </span>
            <Image
              src={`/assets/progress_header/${resolvedTrack}/${progressImagePercent}.png`}
              alt={`Progress: ${progressImagePercent}%`}
              width={260}
              height={52}
              className="h-auto w-[200px] sm:w-[260px] lg:w-[220px]"
            />
          </div>

          <div className="col-span-2 flex items-center gap-2 rounded-md bg-white/5 px-2 py-2 sm:col-span-3 lg:col-span-1 lg:bg-transparent lg:p-0">
            <div className="col-span-2 flex items-center gap-2 rounded-md bg-white/5 px-2 py-2 sm:col-span-3 lg:col-span-1 lg:bg-transparent lg:p-0">
                    <span
                      className=""
                      title="The number of tokens you have earned this session"
                    >
                      ⓘ
                    </span>
              <span className="whitespace-nowrap text-sm font-semibold sm:text-base">
                Current Session Tokens
              </span>

              <div className="flex items-center gap-1 text-xl leading-none sm:text-2xl">
                {TRACKS[resolvedTrack]
                  .slice(0, Math.min(sessionTokensAvailable, 4))
                  .map((emoji, i) => (
                    <span key={i}>{emoji}</span>
                  ))}

                {sessionTokensAvailable > 4 && (
                  <span className="ml-1 text-sm font-semibold text-yellow-300 sm:text-base">
                    +({sessionTokensAvailable - 4})
                  </span>
                )}
              </div>
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
            {resolvedUsername}
          </Link>
<div className="group relative inline-block">
  <Link href="/dashboard">
    <Image
      src={`/assets/profiles/${resolvedAvatarUrl}.png`}
      alt="Profile Icon"
      width={60}
      height={60}
      className="rounded-full border border-white transition hover:scale-105"
    />
  </Link>

  <div className="absolute right-0 top-full z-50 pt-2 hidden group-hover:block">
    <div className="min-w-[140px] rounded-lg bg-[#D3D3D3] py-2 shadow-md">
      <Link
        href="/settings"
        className="block border-y border-black px-4 py-2 text-sm text-[#0000FF] hover:bg-gray-200"
      >
        Settings
      </Link>

      <button
        onClick={async () => {
          try {
            await fetch(`${API_BASE_URL}/users/logout`, {
              method: "POST",
              credentials: "include",
            });
          } catch (err) {
            console.error("Logout error:", err);
          } finally {
            localStorage.removeItem("oer_user_profile_cache");
            localStorage.removeItem("csrfToken");
            window.location.href = "/";
          }
        }}
        className="block w-full border-b border-black px-4 py-2 text-left text-sm text-[#0000FF] hover:bg-gray-200"
      >
        Logout
      </button>
    </div>
  </div>
</div>
        </div>
      </div>
    </header>
  );
}

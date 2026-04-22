"use client";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState, useRef } from "react";
import { useSession } from "../providers/session-provider";

function getAvatarIdFromUrl(url: string | undefined | null) {
  if (!url) return "profile0";
  const match = url.match(/(profile\d+)/);
  return match ? match[1] : "profile0";
}
export default function SiteHeader() {
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
  const [avatarUrl, setAvatarUrl] = useState(`profile0`);
  const [username, setUsername] = useState("username");

  const [totalTokensEarned, settotalTokensEarned] = useState(0);
const {
  activeSession,
  liveStudySeconds,
  sessionActionLoading,
  pauseSession,
  resumeSession,
  cancelSession,
} = useSession();

const handleTimerClick = async () => {
  if (!activeSession || sessionActionLoading) return;

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
  }
};

const timerIcon = !activeSession
  ? "/assets/start_button/inactive.png" : activeSession.status === "PAUSED" ? "/assets/start_button/start.png" : "/assets/start_button/pause.png";
const TRACKS = {
  Art: ["🎨", "🖋️", "🖼️", "🧑‍🎨"],
  Gaming: ["🕹️", "🎮", "🎲", "♟️"],
  Music: ["🎧", "🎺", "🎸", "🥁"],
  Pets: ["🐶", "🐱", "🐹", "🐰"],
  Space: ["🚀", "🌕", "☄️", "👾"],
  Sports: ["🏀", "⚽", "⚾", "🏈"],
} as const;

  const TRACK_ID_TO_NAME: Record<number, TrackName> = {
    1: "Sports",
    2: "Gaming",
    3: "Art",
    4: "Pets",
    5: "Space",
    6: "Music",
  };

  function normalizeTrack(user: any): TrackName | null {
    const rawTrack = user?.track;

    if (typeof rawTrack === "string" && rawTrack in TRACKS) {
      return rawTrack as TrackName;
    }

    if (
      rawTrack &&
      typeof rawTrack === "object" &&
      typeof rawTrack.name === "string" &&
      rawTrack.name in TRACKS
    ) {
      return rawTrack.name as TrackName;
    }

    if (typeof user?.trackId === "number" && TRACK_ID_TO_NAME[user.trackId]) {
      return TRACK_ID_TO_NAME[user.trackId];
    }

    return null;
  }

  type TrackName = keyof typeof TRACKS;

  const [track, setTrack] = useState<TrackName>("Space");
  const [open, setOpen] = useState(false);
  const [latestBadge, setLatestBadge] = useState<{
    emoji: string;
    name: string;
  } | null>(null);

  function formatElapsedSeconds(totalSeconds: number) {
    const safe = Math.max(0, Math.floor(totalSeconds));
    const hours = Math.floor(safe / 3600);
    const minutes = Math.floor((safe % 3600) / 60);
    const seconds = safe % 60;

    return `${hours}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
  }

  useEffect(() => {
    async function userInfo() {
      try {
        const userRes = await fetch(`${API_BASE_URL}/users/profile`, {
          method: "GET",
          credentials: "include",
          cache: "no-store",
          headers: {
            "Content-Type": "application/json",
          },
        });

        const userData = await userRes.json();

        console.log("[HEADER] full profile response:", userData);
        console.log(
          "[HEADER] totalTokensEarned from backend:",
          userData.user?.totalTokensEarned,
        );

        if (!userRes.ok) {
          console.log("response not ok");
          return;
        }

        const user = userData.user;
        const userTrack = normalizeTrack(user);

        const rawAvatarUrl = userData.user?.avatarUrl;
        const name =
          userData.user?.nickname ||
          userData.user?.displayName ||
          userData.user?.username;
        setAvatarUrl(getAvatarIdFromUrl(rawAvatarUrl));

        if (typeof name === "string" && name.trim() !== "") {
          setUsername(name);
        }

        if (userTrack && userTrack in TRACKS) {
          setTrack(userTrack as TrackName);
        }

        const tokens = userData.user?.totalTokensEarned;
        if (typeof tokens === "number") {
          settotalTokensEarned(Math.max(0, tokens));
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
                typeof newestBadge.name === "string" &&
                newestBadge.name.trim() !== ""
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
const handleProfileUpdated = (event: Event) => {
  const customEvent = event as CustomEvent<{
    track?: string;
    avatarUrl?: string;
    username?: string;
  }>;

      const nextTrack = customEvent.detail?.track;
      const nextAvatarUrl = customEvent.detail?.avatarUrl;
      const nextUsername = customEvent.detail?.username;

      if (nextTrack && nextTrack in TRACKS) {
        setTrack(nextTrack as TrackName);
      }

      if (nextAvatarUrl) {
        setAvatarUrl(getAvatarIdFromUrl(nextAvatarUrl));
      }

      if (nextUsername && nextUsername.trim() !== "") {
        setUsername(nextUsername);
      }

      void userInfo();
    };

    window.addEventListener(
      "profile-updated",
      handleProfileUpdated as EventListener,
    );

    return () => {
      window.removeEventListener(
        "profile-updated",
        handleProfileUpdated as EventListener,
      );
    };
  }, [API_BASE_URL, activeSession?.sessionId]);
  const timerDisplay = activeSession
    ? formatElapsedSeconds(liveStudySeconds)
    : "0:00:00";
  useEffect(() => {
    const syncTrackFromStorage = () => {
      const savedTrack = localStorage.getItem("selectedTrackName");

      if (
        savedTrack &&
        (savedTrack === "Sports" ||
          savedTrack === "Gaming" ||
          savedTrack === "Art" ||
          savedTrack === "Pets" ||
          savedTrack === "Space" ||
          savedTrack === "Music")
      ) {
        setTrack(savedTrack);
      }
    };

    syncTrackFromStorage();

    window.addEventListener("track-updated", syncTrackFromStorage);

    return () => {
      window.removeEventListener("track-updated", syncTrackFromStorage);
    };
  }, []);
  useEffect(() => {
    console.log("[HEADER] totalTokensEarned state:", totalTokensEarned);
  }, [totalTokensEarned]);

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
  onClick={cancelSession}
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
            alt={activeSession?.status === "ACTIVE" ? "Pause timer" : "Start timer"}
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
              src={`/assets/progress_header/${track}/0.png`}
              alt="Progress: 0%"
              width={260}
              height={52}
              className="h-auto w-[200px] sm:w-[260px] lg:w-[220px]"
            />
          </div>

          <div className="col-span-2 flex items-center gap-2 rounded-md bg-white/5 px-2 py-2 sm:col-span-3 lg:col-span-1 lg:bg-transparent lg:p-0">
            <div className="col-span-2 flex items-center gap-2 rounded-md bg-white/5 px-2 py-2 sm:col-span-3 lg:col-span-1 lg:bg-transparent lg:p-0">
              <span className="whitespace-nowrap text-sm font-semibold sm:text-base">
                My Tokens
              </span>

              <div className="flex items-center gap-1 text-xl leading-none sm:text-2xl">
                {TRACKS[track]
                  .slice(0, Math.min(totalTokensEarned, 4))
                  .map((emoji, i) => (
                    <span key={i}>{emoji}</span>
                  ))}

                {totalTokensEarned > 4 && (
                  <span className="ml-1 text-sm font-semibold text-yellow-300 sm:text-base">
                    +({totalTokensEarned - 4})
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
                        window.location.href = "/";
                      }
                    }}
                    className="block px-4 py-2 text-sm text-[#0000FF] hover:bg-gray-200 border-b-1 border-black w-full text-left"
                  >
                    Logout
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useSession } from "../providers/session-provider";

export default function Home() {
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
  const [selectedMinutes, setSelectedMinutes] = useState("0:05:00");
  const [time, setTime] = useState("0:05:00");
  const [user, setUser] = useState<any>(null);
  const [latestBadge, setLatestBadge] = useState<{
    emoji: string;
    name: string;
  } | null>(null);
  const [quote, setQuote] = useState<string | null>(null);
  const [startingSession, setStartingSession] = useState(false);
  const [sessionError, setSessionError] = useState<string | null>(null);
  const { refreshSession } = useSession();
function getCsrfToken() {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("csrfToken");
}

async function handleStartSession() {
  console.log("[SESSION] Start button clicked");

  if (!API_BASE_URL) {
    console.error("[SESSION] NEXT_PUBLIC_API_BASE_URL is missing");
    setSessionError("API base URL is missing.");
    return;
  }

  try {
    setStartingSession(true);
    setSessionError(null);

    const csrfToken = getCsrfToken();

    console.log("[SESSION] Sending POST request to /sessions/start");

    const res = await fetch(`${API_BASE_URL}/sessions/start`, {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        ...(csrfToken ? { "X-CSRF-TOKEN": csrfToken } : {}),
      },
      body: JSON.stringify({}),
    });

    const data = await res.json().catch(() => ({}));

    console.log("[SESSION] Response status:", res.status);
    console.log("[SESSION] Response body:", data);

    if (!res.ok) {
      throw new Error(data?.error || data?.message || "Could not start session");
    }

    console.log("[SESSION] Session started successfully:", data?.session);

    await refreshSession(); // <- this is the key
  } catch (error) {
    console.error("[SESSION] Failed to start session:", error);
    setSessionError(
      error instanceof Error ? error.message : "Failed to start session"
    );
  } finally {
    setStartingSession(false);
  }
}
  const renderCount = useRef(0);
  renderCount.current += 1;

  useEffect(() => {
    async function loadUser() {
      const requestUrl = `${API_BASE_URL}/users/profile`;

      try {
        const res = await fetch(requestUrl, {
          method: "GET",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
        });

        // clone lets you inspect raw response text without losing json parsing
        const cloned = res.clone();
        const rawText = await cloned.text();

        const data = await res.json();

        if (!res.ok) {
          console.error("[FETCH 5] request failed:", data?.error || "Could not fetch user info");
          return;
        }

        const fetchedUser = data?.user;

        const favoriteQuote = fetchedUser?.favoriteQuote || "No favorite quote yet.";

        setUser(fetchedUser);
        setQuote(favoriteQuote);

        const rawUserBadges = fetchedUser?.userBadges;

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
            const badgeToSet = {
              emoji: newestBadge.emoji,
              name:
                typeof newestBadge.name === "string" &&
                newestBadge.name.trim() !== ""
                  ? newestBadge.name
                  : "Latest Badge",
            };

            setLatestBadge(badgeToSet);
          } else {
            setLatestBadge(null);
          }
        } else {
          console.log("[BADGES] no badges array found or empty");
        }
      } catch (error) {
        console.error("[FETCH ERROR] Failed to fetch user info:", error);
      }
    }

    loadUser();
  }, [API_BASE_URL]);

  return (
    <div className="flex flex-col px-4 py-4 sm:px-6 lg:px-8">
      <div className="w-full">
        <div className="rounded-lg bg-[#ffd36b] dark:bg-[#38324D] px-4 py-4 text-lg font-semibold sm:text-xl">
          <p className="text-black dark:text-white dark:bg-[#38324D]">
            {user?.favoriteQuote}
          </p>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1.4fr)_minmax(320px,0.8fr)]">
        <div className="flex flex-col gap-6">
          <section className="overflow-hidden rounded-2xl border border-[#d8d8d8] bg-[#fdf5e7] dark:bg-[#38324D] drop-shadow-xl">
            <div className="bg-[#235937] dark:bg-[#201C2E] dark:border-b-1 dark:border-white px-4 py-4 sm:px-6">
              <b className="text-2xl text-white sm:text-3xl">My Progress</b>
            </div>

            <div className="px-4 py-5 sm:px-6">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                <div className="flex flex-col items-center rounded-xl border border-[#d8d8d8] bg-[#fbeabd] dark:bg-[#3A3157] px-4 py-5 text-center">
                  <p className="text-[clamp(2.25rem,6vw,4rem)] font-semibold text-[#235937] dark:text-white">
                    5
                  </p>
                  <p className="text-base font-semibold text-[#235937] dark:text-white sm:text-lg">
                    Hours Studied
                  </p>
                </div>

                <div className="flex flex-col items-center rounded-xl border border-[#d8d8d8] bg-[#fbeabd] dark:bg-[#3A3157] px-4 py-5 text-center">
                  <p className="text-[clamp(2.25rem,6vw,4rem)] font-semibold text-[#235937] dark:text-white">
                    {user?.tokenBalance ?? 0}
                  </p>
                  <p className="text-base font-semibold text-[#235937] sm:text-lg dark:text-white">
                    Tokens
                  </p>
                </div>

                <div className="flex flex-col items-center rounded-xl border border-[#d8d8d8] bg-[#fbeabd] dark:bg-[#3A3157] px-4 py-5 text-center">
                  <p className="text-[clamp(2.25rem,6vw,4rem)] font-semibold text-[#235937] dark:text-white">
                    {latestBadge ? latestBadge.emoji : "🧊"}
                  </p>
                  <p className="px-2 text-sm font-semibold text-[#235937] dark:text-white sm:text-base">
                    {latestBadge ? latestBadge.name : "No badge yet"}
                  </p>
                </div>
              </div>

              <p className="pt-5 text-center font-semibold text-[#235937]">
                Prize-O-Meter
              </p>
            </div>
          </section>

          <section className="overflow-hidden rounded-2xl border border-[#d8d8d8] bg-[#fdf5e7] dark:bg-[#38324D] drop-shadow-xl">
            <div className="bg-[#235937] dark:bg-[#201C2E] dark:border-b-1 dark:border-white px-4 py-4 sm:px-6">
              <b className="text-2xl text-white sm:text-3xl">Rewards</b>
            </div>

            <div className="px-4 py-5 sm:px-6">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                <div className="flex flex-col items-center rounded-xl border border-[#d8d8d8] bg-[#235937] dark:bg-[#3A3157] px-4 py-5 text-center">
                  <p className="text-[clamp(2.25rem,6vw,4rem)] font-semibold text-white">
                    50
                  </p>
                  <p className="mt-2 text-sm font-semibold text-white sm:text-base">
                    Reward Points
                  </p>
                </div>

                <div className="flex flex-col items-center rounded-xl border border-[#d8d8d8] bg-[#235937] dark:bg-[#3A3157] px-4 py-5 text-center">
                      <p className="text-[clamp(2.25rem,6vw,4rem)] font-semibold text-white">
                        {Array.isArray(user?.badges) ? user.badges.length : 0}
                      </p>
                  <p className="mt-2 text-sm font-semibold text-white sm:text-base">
                    Badges
                  </p>
                </div>

                <Link
                  href="/activity"
                  className="flex flex-col items-center rounded-xl border border-[#d8d8d8] bg-[#ffd36b] dark:bg-[#858532] px-4 py-5 text-center"
                >
                  <p className="text-[clamp(1.75rem,6vw,3rem)] font-semibold text-white dark:text-black">
                    Play
                  </p>
                  <p className="mt-2 text-sm font-semibold text-[#235937] sm:text-base dark:text-black">
                    Play a Mini-Game
                  </p>
                </Link>
              </div>
            </div>
          </section>
        </div>

        <section className="flex flex-col items-center rounded-2xl bg-[#235937] dark:bg-[#201C2E] dark:border-1 dark:border-white px-4 py-6 text-center sm:px-6">
          <p className="pb-2 text-2xl font-semibold text-white sm:text-3xl">
            Set Today's Goal
          </p>

          <p className="text-white">Set a session length to start.</p>

          <div className="mt-5 flex w-full max-w-md flex-col gap-4">
            <div className="flex flex-col gap-2 text-left">
              <label className="font-medium text-white">Select number of:</label>
              <select
                defaultValue="minutes"
                className="w-full appearance-none rounded-md border border-white/40 bg-[#1f2a3a] px-4 py-3 text-lg font-semibold text-white focus:outline-none focus:ring-2 focus:ring-white/30"
              >
                <option value="minutes">Minutes</option>
                <option value="modules">Modules</option>
              </select>
            </div>

            <div className="flex flex-col gap-2 text-left">
              <label className="font-medium text-white">Select:</label>
              <select
                defaultValue="breaks"
                className="w-full appearance-none rounded-md border border-white/40 bg-[#1f2a3a] px-4 py-3 text-lg font-semibold text-white focus:outline-none focus:ring-2 focus:ring-white/30"
              >
                <option value="breaks">Breaks</option>
                <option value="short">1</option>
                <option value="long">2</option>
                <option value="none">3</option>
                <option value="none">4</option>
                <option value="none">5</option>
                <option value="none">6</option>
                <option value="none">7</option>
                <option value="none">8</option>
                <option value="none">9</option>
                <option value="none">10</option>
              </select>
            </div>

            <div className="flex flex-col gap-2 text-left">
              <label className="font-medium text-white">Minutes*:</label>
              <select
                value={selectedMinutes}
                onChange={(e) => {
                  const newValue = e.target.value;
                  setSelectedMinutes(newValue);
                  setTime(newValue);
                }}
                className="w-full appearance-none rounded-md border border-white/40 bg-[#1f2a3a] px-4 py-3 text-lg font-semibold text-white focus:outline-none focus:ring-2 focus:ring-white/30"
              >
                <option value="0:05:00">5 mins</option>
                <option value="0:10:00">10 mins</option>
                <option value="0:15:00">15 mins</option>
                <option value="0:20:00">20 mins</option>
                <option value="0:30:00">30 mins</option>
                <option value="0:40:00">40 mins</option>
                <option value="1:00:00">60 mins</option>
                <option value="1:20:00">80 mins</option>
                <option value="1:40:00">100 mins</option>
                <option value="2:00:00">120 mins</option>
              </select>
            </div>
          </div>

          <div className="mt-6 inline-flex items-center justify-center rounded-full bg-[#7ED957] px-6 py-4 font-digital text-2xl font-bold tracking-widest text-[#0b1f14] shadow-inner sm:text-3xl">
            {time}
          </div>

<div className="mt-6 flex w-full justify-center">
  <button
    type="button"
    onClick={handleStartSession}
    disabled={startingSession}
    className="w-full max-w-md rounded-2xl bg-[#D0A234] px-4 py-4 text-lg font-semibold text-white sm:text-xl disabled:opacity-60"
  >
    {startingSession ? "Starting..." : "Start Session"}
  </button>
</div>
        </section>
      </div>
    </div>
  );
}
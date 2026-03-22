"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

export default function Home() {
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

  const [user, setUser] = useState<any>(null);
  const [latestBadge, setLatestBadge] = useState<{
    emoji: string;
    name: string;
  } | null>(null);
  const [quote, setQuote] = useState<string | null>(null);

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

        const favoriteQuote =
          fetchedUser?.favoriteQuote ??
          fetchedUser?.favQuote ??
          fetchedUser?.quote ??
          null;

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
        <div className="rounded-lg bg-[#ffd36b] px-4 py-4 text-lg font-semibold sm:text-xl">
          <p className="text-black">
            {user?.favoriteQuote || "No favorite quote yet."}
          </p>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1.4fr)_minmax(320px,0.8fr)]">
        <div className="flex flex-col gap-6">
          <section className="overflow-hidden rounded-2xl border border-[#d8d8d8] bg-[#fdf5e7] drop-shadow-xl">
            <div className="bg-[#235937] px-4 py-4 sm:px-6">
              <b className="text-2xl text-white sm:text-3xl">My Progress</b>
            </div>

            <div className="px-4 py-5 sm:px-6">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                <div className="flex flex-col items-center rounded-xl border border-[#d8d8d8] bg-[#fbeabd] px-4 py-5 text-center">
                  <p className="text-[clamp(2.25rem,6vw,4rem)] font-semibold text-[#235937]">
                    5
                  </p>
                  <p className="text-base font-semibold text-[#235937] sm:text-lg">
                    Hours Studied
                  </p>
                </div>

                <div className="flex flex-col items-center rounded-xl border border-[#d8d8d8] bg-[#fbeabd] px-4 py-5 text-center">
                  <p className="text-[clamp(2.25rem,6vw,4rem)] font-semibold text-[#235937]">
                    12
                  </p>
                  <p className="text-base font-semibold text-[#235937] sm:text-lg">
                    Tokens
                  </p>
                </div>

                <div className="flex flex-col items-center rounded-xl border border-[#d8d8d8] bg-[#fbeabd] px-4 py-5 text-center">
                  <p className="text-[clamp(2.25rem,6vw,4rem)] font-semibold text-[#235937]">
                    {latestBadge ? latestBadge.emoji : "🧊"}
                  </p>
                  <p className="px-2 text-sm font-semibold text-[#235937] sm:text-base">
                    {latestBadge ? latestBadge.name : "No badge yet"}
                  </p>
                </div>
              </div>

              <p className="pt-5 text-center font-semibold text-[#235937]">
                Prize-O-Meter
              </p>
            </div>
          </section>

          <section className="overflow-hidden rounded-2xl border border-[#d8d8d8] bg-[#fdf5e7] drop-shadow-xl">
            <div className="bg-[#235937] px-4 py-4 sm:px-6">
              <b className="text-2xl text-white sm:text-3xl">Rewards</b>
            </div>

            <div className="px-4 py-5 sm:px-6">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                <div className="flex flex-col items-center rounded-xl border border-[#d8d8d8] bg-[#235937] px-4 py-5 text-center">
                  <p className="text-[clamp(2.25rem,6vw,4rem)] font-semibold text-white">
                    50
                  </p>
                  <p className="mt-2 text-sm font-semibold text-white sm:text-base">
                    Reward Points
                  </p>
                </div>

                <div className="flex flex-col items-center rounded-xl border border-[#d8d8d8] bg-[#235937] px-4 py-5 text-center">
                  <p className="text-[clamp(2.25rem,6vw,4rem)] font-semibold text-white">
                    {Array.isArray(user?.userBadges) ? user.userBadges.length : 0}
                  </p>
                  <p className="mt-2 text-sm font-semibold text-white sm:text-base">
                    Badges
                  </p>
                </div>

                <Link
                  href="/activity"
                  className="flex flex-col items-center rounded-xl border border-[#d8d8d8] bg-[#ffd36b] px-4 py-5 text-center"
                >
                  <p className="text-[clamp(1.75rem,6vw,3rem)] font-semibold text-white">
                    Play
                  </p>
                  <p className="mt-2 text-sm font-semibold text-[#235937] sm:text-base">
                    Play a Mini-Game
                  </p>
                </Link>
              </div>
            </div>
          </section>
        </div>

        <section className="flex flex-col items-center rounded-2xl bg-[#235937] px-4 py-6 text-center sm:px-6">
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
                <option value="short">Short break</option>
                <option value="long">Long break</option>
                <option value="none">No breaks</option>
              </select>
            </div>

            <div className="flex flex-col gap-2 text-left">
              <label className="font-medium text-white">Minutes*:</label>
              <select
                defaultValue="5"
                className="w-full appearance-none rounded-md border border-white/40 bg-[#1f2a3a] px-4 py-3 text-lg font-semibold text-white focus:outline-none focus:ring-2 focus:ring-white/30"
              >
                <option value="5">5 mins</option>
                <option value="10">10 mins</option>
                <option value="15">15 mins</option>
                <option value="20">20 mins</option>
              </select>
            </div>
          </div>

          <div className="mt-6 inline-flex items-center justify-center rounded-full bg-[#7ED957] px-6 py-4 font-digital text-2xl font-bold tracking-widest text-[#0b1f14] shadow-inner sm:text-3xl">
            00:00:00
          </div>

          <Link href="login" className="mt-6 flex w-full justify-center">
            <button className="w-full max-w-md rounded-2xl bg-[#D0A234] px-4 py-4 text-lg font-semibold text-white sm:text-xl">
              Start Session
            </button>
          </Link>
        </section>
      </div>
    </div>
  );
}
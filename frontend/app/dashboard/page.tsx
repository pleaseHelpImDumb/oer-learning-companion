"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { useSession } from "../providers/session-provider";

type Badge = {
  badgeId: number;
  name: string;
  description: string;
  iconUrl: string | null;
  unlockedAt: string;
};

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

type WeekStats = {
  weeklyMinsStudied: number;
  totalCheckIns: number;
  totalMinutes: number;
  aiHelpCount: number;
  totalBreaks: number;
};

export default function Home() {
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

  const [selectedMinutes, setSelectedMinutes] = useState("0:10:00");
  const [time, setTime] = useState("0:10:00");

  const [user, setUser] = useState<UserProfile | null>(null);
const [weekStats, setWeekStats] = useState<WeekStats>({
  weeklyMinsStudied: 0,
  totalCheckIns: 0,
  totalMinutes: 0,
  aiHelpCount: 0,
  totalBreaks: 0,
});
  const [quote, setQuote] = useState("No favorite quote yet.");
  const [loadingProfile, setLoadingProfile] = useState(true);

  const { startSession, sessionActionLoading } = useSession();

  const renderCount = useRef(0);
  renderCount.current += 1;

  useEffect(() => {
    async function loadDashboardData() {
      if (!API_BASE_URL) return;

      try {
        const [profileRes, statsRes] = await Promise.all([
          fetch(`${API_BASE_URL}/users/profile`, {
            method: "GET",
            credentials: "include",
            headers: {
              "Content-Type": "application/json",
            },
          }),
          fetch(`${API_BASE_URL}/users/week-stats`, {
            method: "GET",
            credentials: "include",
            headers: {
              "Content-Type": "application/json",
            },
          }),
        ]);

        const profileData = await profileRes.json().catch(() => null);
        const statsData = await statsRes.json().catch(() => null);

        if (!profileRes.ok) {
          console.error(
            "[PROFILE] request failed:",
            profileData?.error || "Could not fetch user profile"
          );
        } else {
          const fetchedUser = profileData?.user ?? null;
          setUser(fetchedUser);
          setQuote(fetchedUser?.favoriteQuote || "No favorite quote yet.");
        }

        if (!statsRes.ok) {
          console.error(
            "[WEEK STATS] request failed:",
            statsData?.error || "Could not fetch week stats"
          );
        } else {
          setWeekStats(statsData);
        }
      } catch (error) {
        console.error("[DASHBOARD FETCH ERROR]", error);
      } finally {
        setLoadingProfile(false);
      }
    }

    loadDashboardData();
  }, [API_BASE_URL]);

  const latestBadge =
    Array.isArray(user?.badges) && user.badges.length > 0
      ? [...user.badges].sort((a, b) => {
          const aTime = a?.unlockedAt ? new Date(a.unlockedAt).getTime() : 0;
          const bTime = b?.unlockedAt ? new Date(b.unlockedAt).getTime() : 0;
          return bTime - aTime;
        })[0]
      : null;

const weeklyHours = (weekStats.totalMinutes / 60).toFixed(1);
  const totalRewardPoints = user?.totalTokensEarned ?? 0;
  const badgeCount = user?.badges?.length ?? 0;
function durationStringToMinutes(value: string) {
  const parts = value.split(":").map(Number);

  if (parts.length !== 3 || parts.some(Number.isNaN)) {
    return 0;
  }

  const [hours, minutes] = parts;
  return hours * 60 + minutes;
}
  return (
    <div className="flex flex-col px-4 py-4 sm:px-6 lg:px-8">
      <div className="w-full">
        <div className="rounded-lg bg-[#ffd36b] dark:bg-[#26314a] px-4 py-4 text-lg font-semibold sm:text-xl">
          <p className="text-black dark:text-white">
            {quote}
          </p>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1.4fr)_minmax(320px,0.8fr)]">
        <div className="flex flex-col gap-6">
          <section className="overflow-hidden rounded-2xl bg-[#fdf5e7] dark:bg-[#17233d] drop-shadow-xl">
            <div className="bg-[#235937] dark:bg-[#26314a] px-4 py-4 sm:px-6">
              <b className="text-2xl text-white sm:text-3xl">My Progress</b>
            </div>

            <div className="px-4 py-5 sm:px-6">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                <div className="flex flex-col items-center rounded-xl bg-[#fbeabd] dark:bg-[#26314a] px-4 py-5 text-center">
                  <p className="text-[clamp(2.25rem,6vw,4rem)] font-semibold text-[#235937] dark:text-white">
                    {weeklyHours}
                  </p>
                  <p className="text-base font-semibold text-[#235937] dark:text-white sm:text-lg">
                    Hours Studied
                  </p>
                </div>

                <div className="flex flex-col items-center rounded-xl bg-[#fbeabd] dark:bg-[#26314a] px-4 py-5 text-center">
                  <p className="text-[clamp(2.25rem,6vw,4rem)] font-semibold text-[#235937] dark:text-white">
                    {user?.totalTokensEarned ?? 0}
                  </p>
                  <p className="text-base font-semibold text-[#235937] sm:text-lg dark:text-white">
                    Tokens
                  </p>
                </div>

                <div className="flex flex-col items-center rounded-xl bg-[#fbeabd] dark:bg-[#26314a] px-4 py-5 text-center">
                  {latestBadge?.iconUrl ? (
                    <Image
                      src={latestBadge.iconUrl}
                      alt={latestBadge.name}
                      width={64}
                      height={64}
                      className="mb-2 h-16 w-16 object-contain"
                    />
                  ) : (
                    <p className="text-[clamp(2.25rem,6vw,4rem)] font-semibold text-[#235937] dark:text-white">
                      🧊
                    </p>
                  )}

                  <p className="px-2 text-sm font-semibold text-[#235937] dark:text-white sm:text-base">
                    {latestBadge ? latestBadge.name : "No badge yet"}
                  </p>
                </div>
              </div>

              <p className="pt-5 text-center font-semibold text-[#235937] dark:text-white">
                Prize-O-Meter
              </p>
            </div>
          </section>

          <section className="overflow-hidden rounded-2xl bg-[#fdf5e7] dark:bg-[#17233d] drop-shadow-xl">
            <div className="bg-[#235937] dark:bg-[#26314a] px-4 py-4 sm:px-6">
              <b className="text-2xl text-white sm:text-3xl">Rewards</b>
            </div>

            <div className="px-4 py-5 sm:px-6">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                <div className="flex flex-col items-center rounded-xl bg-[#235937] dark:bg-[#26314a] px-4 py-5 text-center">
                  <p className="text-[clamp(2.25rem,6vw,4rem)] font-semibold text-white">
                    {totalRewardPoints}
                  </p>
                  <p className="mt-2 text-sm font-semibold text-white sm:text-base">
                    Reward Points
                  </p>
                </div>

                <div className="flex flex-col items-center rounded-xl bg-[#235937] dark:bg-[#ffd85a] px-4 py-5 text-center">
                  <p className="text-[clamp(2.25rem,6vw,4rem)] font-semibold text-white dark:text-black">
                    {badgeCount}
                  </p>
                  <p className="mt-2 text-sm font-semibold text-white dark:text-black sm:text-base">
                    Badges
                  </p>
                </div>

                <Link
                  href="/activity"
                  className="flex flex-col items-center rounded-xl bg-[#ffd36b] dark:bg-[#fdae3f] px-4 py-5 text-center"
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

        <section className="flex flex-col items-center rounded-2xl bg-[#235937] dark:bg-[#26314a] px-4 py-6 text-center sm:px-6">
          <p className="pb-2 text-2xl font-semibold text-white sm:text-3xl">
            Set Today's Goal
          </p>

          <p className="text-white">Set a session length to start.</p>

          <div className="mt-5 flex w-full max-w-xs flex-col gap-10">
            <div className="flex flex-col gap-2 text-left">
              <label className="font-medium text-white">Select Number Of</label>
              <select
                defaultValue="breaks"
                className="w-full appearance-none rounded-md border border-white/40 bg-[#1f2a3a] px-4 py-3 text-lg font-semibold text-white focus:outline-none focus:ring-2 focus:ring-white/30"
              >
                <option value="breaks">Breaks</option>
                <option value="1">1</option>
                <option value="2">2</option>
                <option value="3">3</option>
                <option value="4">4</option>
                <option value="5">5</option>
                <option value="6">6</option>
                <option value="7">7</option>
                <option value="8">8</option>
                <option value="9">9</option>
                <option value="10">10</option>
              </select>
            </div>

            <div className="flex flex-col gap-2 text-left">
              <label className="font-medium text-white">
                Select Session Duration<span className="text-[#ff0000]">*</span>
              </label>
              <select
                value={selectedMinutes}
                onChange={(e) => {
                  const newValue = e.target.value;
                  setSelectedMinutes(newValue);
                  setTime(newValue);
                }}
                className="w-full appearance-none rounded-md border border-white/40 bg-[#1f2a3a] px-4 py-3 text-lg font-semibold text-white focus:outline-none focus:ring-2 focus:ring-white/30"
              >
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
              onClick={() => void startSession(durationStringToMinutes(selectedMinutes))}
              disabled={sessionActionLoading}
              className="w-full max-w-md rounded-2xl bg-[#D0A234] px-4 py-4 text-lg font-semibold text-white sm:text-xl disabled:opacity-60"
            >
              {sessionActionLoading ? "Starting..." : "Start Session"}
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}
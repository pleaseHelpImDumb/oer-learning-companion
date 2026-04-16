"use client";
import Image from "next/image";
import { useEffect, useState } from "react";

export default function Home() {
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

  const [hours, setHours] = useState(0);
  const [checkins, setCheckins] = useState(0);

  const [sessionMinutes, setSessionMinutes] = useState(0);
  const [sessionAiHelp, setSessionAiHelp] = useState(0);
  const [sessionPausedMinutes, setSessionPausedMinutes] = useState(0);

  const stats = [
    ["Check-Ins", checkins],
    ["Duration Net", `${sessionMinutes} Min`],
    ["AI Help Count", `${sessionAiHelp}`],
    ["With Breaks", `${sessionPausedMinutes} Min`],
  ];

  useEffect(() => {
    async function loadSummary() {
      try {
        const completedSessionId = sessionStorage.getItem("completedSessionId");

        const requests = [
          fetch(`${API_BASE_URL}/users/week-stats`, {
            method: "GET",
            credentials: "include",
            headers: {
              "Content-Type": "application/json",
            },
          }),
        ];

        if (completedSessionId) {
          requests.push(
            fetch(`${API_BASE_URL}/sessions/${completedSessionId}`, {
              method: "GET",
              credentials: "include",
              headers: {
                "Content-Type": "application/json",
              },
            })
          );
        }

        const responses = await Promise.all(requests);

        const statsRes = responses[0];
        const statsData = await statsRes.json();

        if (statsRes.ok) {
          setHours(statsData?.weeklyMinsStudied ?? 0);
          setCheckins(statsData?.totalCheckIns ?? 0);
        }

        const sessionRes = responses[1];
        if (sessionRes) {
          const sessionData = await sessionRes.json();

          if (sessionRes.ok) {
            const session = sessionData?.session ?? sessionData;

            setSessionMinutes(session?.durationMinutes ?? 0);
            setSessionAiHelp(session?.numAiInteractions ?? 0);
            setSessionPausedMinutes(session?.totalPausedMinutes ?? 0);
          }
        }
      } catch (error) {
        console.error("[FETCH ERROR] Failed to fetch summary info:", error);
      }
    }

    if (API_BASE_URL) {
      loadSummary();
    }
  }, [API_BASE_URL]);

  return (
    <div className="w-full">
      {/* page padding + max width so things don't stretch weirdly on ultrawide */}
      <div className="mx-auto w-full max-w-12xl px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
        <div className="mb-4 border-b border-gray-300 pb-3">
  <h1 className="text-black dark:text-white/80 text-3xl sm:text-4xl font-bold">
    Session Summary
  </h1>
</div>
        <div className="flex flex-col gap-6">
          {/* TOP ROW: Progress + Notes */}
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
            {/* Progress card */}
<div className="bg-white dark:bg-[#26314a] rounded-2xl p-4 sm:p-6 lg:col-span-3">
  <div className="flex flex-col md:flex-row md:items-center gap-6">
    {/* Left: image */}
<div className="w-full max-w-sm sm:max-w-md aspect-square relative shrink-0 md:w-[260px]">
  <Image
    src="/assets/progress_circle/1.png"
    alt="progress: 0%"
    fill
    className="object-contain"
    priority
  />

  {/* Centered percentage */}
  <div className="absolute inset-0 flex items-center justify-center">
    <span className="text-[#235937] dark:text-white/80 font-bold text-4xl sm:text-5xl">
      0%
    </span>
  </div>
</div>

    {/* Right: title + bars */}
    <div className="flex-1">
      <h2 className="text-black dark:text-white/80 font-semibold text-xl sm:text-2xl lg:text-3xl mb-4">
        Study Goals Completed
      </h2>

      <div className="space-y-4">
        {[0, 0].map((value, i) => (
          <div key={i} className="flex items-center gap-4">
            <span className="text-[#235937] font-bold text-2xl sm:text-3xl w-6">
              {value}
            </span>
            <div className="h-3 flex-1 rounded-full bg-gray-300">
              <div
                className="h-3 rounded-full bg-[#235937]"
                style={{ width: "0%" }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
</div>

            {/* Notes card */}
            <div className="bg-white dark:bg-[#26314a] rounded-2xl p-4 sm:p-6 lg:col-span-2">
              <h2 className="text-black dark:text-white/80 font-semibold text-xl sm:text-2xl lg:text-3xl">
                Notes
              </h2>
              <p className="text-black dark:text-white/80 mt-2 mb-3">
                ☰ Add a note about this study session...
              </p>

              <textarea
                className="border border-gray-300 w-full rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black p-3 min-h-[140px] sm:min-h-[200px] resize-none dark:text-white/80"
                placeholder="What do you want to remember or reflect upon for next time..."
              />
            </div>
          </div>

          {/* MID ROW: stat cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-6">
            <div className="bg-white dark:bg-[#26314a] rounded-2xl p-4 sm:p-6">
              <p className="text-black dark:text-white/80 font-bold text-[clamp(1.1rem,1.6vw,2rem)] leading-tight">
                Study Goals Completed
              </p>
              <p className="text-[#235937] dark:text-[#639e61] font-bold mt-3 text-[clamp(2rem,4vw,4rem)]">
                3
              </p>
            </div>

            <div className="bg-white dark:bg-[#26314a] rounded-2xl p-4 sm:p-6">
              <p className="text-black dark:text-white/80 font-bold text-[clamp(1.1rem,1.6vw,2rem)] leading-tight">
                Hours Studied This Week
              </p>
              <p className="text-[#235937] dark:text-[#639e61] font-bold mt-3 text-[clamp(2rem,4vw,4rem)]">
                {hours}
              </p>
            </div>
            {/*<div className="bg-white dark:bg-[#26314a] rounded-2xl p-4 sm:p-6">
              <p className="text-black dark:text-white/80 font-bold text-[clamp(1.1rem,1.6vw,2rem)] leading-tight">
                Modules Studied This Week
              </p>
              <p className="text-[#235937] dark:text-[#639e61] font-bold mt-3 text-[clamp(2rem,4vw,4rem)]">
                3
              </p>
            </div>*/}
          </div>

          {/* BOTTOM: 4-up metrics */}
          <div className="bg-white dark:bg-[#26314a] rounded-2xl p-4 sm:p-6">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
              {stats.map(([label, value]) => (
                <div key={label}>
                  <p className="text-black dark:text-white/80 font-bold text-[clamp(1rem,1.4vw,1.8rem)]">{label}</p>
                  <p className="text-[#235937] dark:text-[#639e61] font-bold mt-1 text-[clamp(1.6rem,2.5vw,2.8rem)]">{value}</p>
                </div>
              ))}
            </div>
{/**
 *           <div className="bg-white dark:bg-[#26314a] rounded-2xl p-4 sm:p-6">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                ["Check-Ins", "12"],
                ["Duration Net", "120 Min"],
                ["AI Help Count", "5"],
                ["With Breaks", "2"],
              ].map(([label, value]) => (
                <div key={label} className="min-w-0">
                  <p className="text-black dark:text-white/80 font-bold text-[clamp(1rem,1.4vw,1.8rem)]">
                    {label}
                  </p>
                  <p className="text-[#235937] dark:text-[#639e61] font-bold mt-1 text-[clamp(1.6rem,2.5vw,2.8rem)]">
                    {value}
                  </p>
                </div>
              ))}
            </div>

            <div className="hidden lg:grid lg:grid-cols-4 gap-6 mt-4">
              <div className="h-px bg-transparent" />
              <div className="h-px bg-transparent" />
              <div className="h-px bg-transparent" />
              <div className="h-px bg-transparent" />
            </div>
          </div>
 * 
 */}
            {/* optional dividers on large screens */}
            <div className="hidden lg:grid lg:grid-cols-4 gap-6 mt-4">
              <div className="h-px bg-transparent" />
              <div className="h-px bg-transparent" />
              <div className="h-px bg-transparent" />
              <div className="h-px bg-transparent" />
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
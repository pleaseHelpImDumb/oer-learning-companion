"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Home() {
  const pathname = usePathname();

  const tabBase =
    "shrink-0 border-b-4 px-4 py-3 text-sm font-bold transition sm:px-6 sm:text-base";
  const tabActive = "border-[#235937] text-[#235937]";
  const tabInactive = "border-transparent text-black hover:border-[#235937]";

  const selectClass =
    "w-full appearance-none rounded-md border border-white/40 bg-[#1f2a3a] px-4 py-3 text-base font-semibold text-white focus:outline-none focus:ring-2 focus:ring-white/30";

  const inputClass =
    "w-full rounded border border-black bg-white p-2";

  return (
    <div className="min-h-screen font-sans">
      {/* Header */}
      <div className="border-b bg-[#235937] px-4 py-4 sm:px-6">
        <p className="text-3xl font-bold text-white sm:text-4xl">Settings</p>
      </div>

      {/* Tabs */}
<div className="border-b border-black">
  <div className="flex items-center overflow-x-auto">

    <Link href="/settings" className="flex-1 min-w-[140px] text-center px-6 sm:px-10">
      <button
        className="w-full py-3 border-[7px] border-transparent hover:border-b-[#235937]"
      >
        <p
          className={`font-bold text-lg sm:text-xl p-2 border text-black ${
            pathname === "/settings" ? "border-red-500" : "border-transparent"
          }`}
        >
          General
        </p>
      </button>
    </Link>

    <div className="w-px h-6 bg-gray-400"></div>

    <Link href="/sesshistory" className="flex-1 min-w-[180px] text-center px-6 sm:px-10">
      <button
        className="w-full py-3 border-[7px] border-transparent hover:border-b-[#235937]"
      >
        <p
          className={`font-bold text-lg sm:text-xl p-2 border text-black ${
            pathname === "/sesshistory" ? "border-red-500" : "border-transparent"
          }`}
        >
          Session History
        </p>
      </button>
    </Link>

    <div className="w-px h-6 bg-gray-400"></div>

    <Link href="/badgecollection" className="flex-1 min-w-[200px] text-center px-6 sm:px-10">
      <button
        className="w-full py-3 border-[7px] border-transparent hover:border-b-[#235937]"
      >
        <p
          className={`font-bold text-lg sm:text-xl p-2 border text-black ${
            pathname === "/badgecollection" ? "border-red-500" : "border-transparent"
          }`}
        >
          Badge Collection
        </p>
      </button>
    </Link>

  </div>
</div>

      {/* Content */}
      <div className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6">
        <div className="space-y-6">
          {/* Course + Campus */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="flex flex-col">
              <label htmlFor="course" className="mb-1 font-medium">
                Enter Course (optional).
              </label>
              <input
                id="course"
                className={inputClass}
                placeholder="Please enter your course (optional)."
              />
            </div>

            <div className="flex flex-col">
              <label htmlFor="campus" className="mb-1 font-medium">
                Enter Campus (optional).
              </label>
              <input
                id="campus"
                className={inputClass}
                placeholder="Please enter your campus (optional)."
              />
            </div>
          </div>

          {/* Intervals */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="flex flex-col">
              <label className="mb-1 font-semibold">
                Select a check-in interval.*
              </label>
              <select defaultValue="15 min" className={selectClass}>
                <option value="15 min">15 min</option>
                <option value="30 min">30 min</option>
                <option value="45 min">45 min</option>
                <option value="60 min">60 min</option>
              </select>
            </div>

            <div className="flex flex-col">
              <label className="mb-1 font-semibold">
                Select a break duration.*
              </label>
              <select defaultValue="5 min" className={selectClass}>
                <option value="5 min">5 min</option>
                <option value="10 min">10 min</option>
                <option value="15 min">15 min</option>
                <option value="20 min">20 min</option>
              </select>
            </div>
          </div>

          {/* Quote input / OR / select */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-[1fr_auto_1fr] md:items-end">
            <div className="flex flex-col">
              <label htmlFor="favorite-quote" className="mb-1 font-semibold">
                Type in your favorite quote.
              </label>
              <input
                id="favorite-quote"
                className={inputClass}
                placeholder="Enter a quote"
              />
            </div>

            <div className="flex items-center justify-center py-1 font-semibold text-gray-600 md:pb-3">
              OR
            </div>

            <div className="flex flex-col">
              <label className="mb-1 font-semibold">Select a quote</label>
              <select defaultValue="" className={selectClass}>
                <option value="" disabled>
                  Choose a quote
                </option>
                <option value="quote1">Quote 1</option>
                <option value="quote2">Quote 2</option>
                <option value="quote3">Quote 3</option>
              </select>
            </div>
          </div>

          {/* Nickname */}
          <div className="max-w-xl">
            <div className="flex flex-col">
              <label htmlFor="nickname" className="mb-1 font-semibold">
                Select a nickname.
              </label>
              <input
                id="nickname"
                className={inputClass}
                placeholder="Enter a nickname"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
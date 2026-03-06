"use client";

import Image from "next/image";
import Link from "next/link";
import background from "assets/login_background.jpg";
import { usePathname } from "next/navigation";
export default function Home() {
  const pathname = usePathname();
  return (
    <div className="relative flex flex-col justify-center font-sans">
        <div className="p-[1%] border-b-1 bg-[#235937]">
            <p className="font-8xl font-bold text-white">Settings</p>
        </div>

<div className="border-b border-black flex">
  <div className="flex items-center">

    <Link href="/settings" className="flex-1 text-center px-10">
      <button
        className={`w-full py-3 border-7 border-transparent hover:border-b-[#235937]
        ${pathname === "/settings" ? "border-[#235937]" : ""}`}
      >
        <p className="font-bold text-xl p-2 border-1 border-transparent">General</p>
      </button>
    </Link>

    <div className="w-px h-6 bg-gray-400"></div>

    <Link href="/sesshistory" className="flex-1 text-center px-10 min-w-70">
      <button
        className={`w-full py-3 border-7 border-transparent hover:border-b-[#235937]
        ${pathname === "/sesshistory" ? "border-[#235937]" : ""}`}
      >
        <p className="font-bold text-xl p-2 border-1 border-red-500">Session History</p>
      </button>
    </Link>

    <div className="w-px h-6 bg-gray-400"></div>

    <Link href="/badgecollection" className="flex-1 text-center px-10 min-w-72">
      <button
        className={`w-full py-3 border-7 border-transparent hover:border-b-[#235937]
        ${pathname === "/badgecollection" ? "border-[#235937]" : ""}`}
      >
        <p className="font-bold text-xl p-2 border-1 border-transparent">Badge Collection</p>
      </button>
    </Link>

  </div>
</div>

        <div className="px-[2%] py-[1%]">
            <div className="flex flex-row gap-10">
          <div className="flex flex-col">
            <label htmlFor="course" className="mb-1">Enter Course (optional).</label>
            <input
              id="course"
              className="w-80 bg-white border border-black rounded p-2"
              placeholder="Please enter your course (optional)."
            />
          </div>
          <div className="flex flex-col">
            <label htmlFor="campus" className="mb-1">Enter Campus (optional).</label>
            <input
              id="campus"
              className="w-80 bg-white border border-black rounded p-2"
              placeholder="Please enter your campus (optional)."
            />
          </div>
            </div>
        </div>

                <div className="px-[2%] py-[1%]">
            <div className="flex flex-row gap-10">
              <div className="flex flex-col">
                <a className="font-semibold">Select a check-in interval.*</a>
                <select
        defaultValue="15 min"
        className="
          appearance-none
          bg-[#1f2a3a] text-white font-semibold
          border border-white/40 rounded-md
          px-6 py-3 pr-12
          text-lg
          focus:outline-none focus:ring-2 focus:ring-white/30
          flex 
          flex-col 
          items-center
            "
          >
        <option value="15 min">15 min</option>
        <option value="short">Short break</option>
        <option value="long">Long break</option>
        <option value="none">No breaks</option>
      </select>
              </div>
              <div className="flex flex-col">
                <a className="font-semibold">Select a break duration.*</a>
      <select
        defaultValue="5 min"
        className="
          appearance-none
          bg-[#1f2a3a] text-white font-semibold
          border border-white/40 rounded-md
          px-6 py-3 pr-12
          text-lg
          focus:outline-none focus:ring-2 focus:ring-white/30
          flex 
          flex-col 
          items-center
            "
          >
        <option value="5 min">5 min</option>
        <option value="short">Short break</option>
        <option value="long">Long break</option>
        <option value="none">No breaks</option>
      </select>
              </div>
            </div>
        </div>

        <div className="flex flex-row gap-10 px-[2%] py-[1%]">
          <div className="flex flex-col">
            <label htmlFor="course" className="mb-1 font-semibold">Type in your favorite quote.</label>
            <input
              id="course"
              className="w-80 bg-white border border-black rounded p-2"
              placeholder=""
            />
          </div>
          <a className="pt-8">OR</a>
              <div className="flex flex-col">
                <a className="font-semibold">Select a quote</a>
      <select
        defaultValue="5 min"
        className="
          appearance-none
          bg-[#1f2a3a] text-white font-semibold
          border border-white/40 rounded-md
          px-6 py-3 pr-12
          text-lg
          focus:outline-none focus:ring-2 focus:ring-white/30
          flex 
          flex-col 
          items-center
            "
          >
        <option value="5 min">5 min</option>
        <option value="short">Short break</option>
        <option value="long">Long break</option>
        <option value="none">No breaks</option>
      </select>
              </div>
            </div>

          <div className="flex flex-col px-[2%] py-[1%]">
            <label htmlFor="course" className="mb-1 font-semibold">Select a nickname.</label>
            <input
              id="nickname"
              className="w-80 bg-white border border-black rounded p-2"
              placeholder=""
            />
          </div>
    </div>
  );
}
'use client';
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
export default function Home() {
  const [on, setOn] = useState(true);
  return (
    <div className="flex min-h-screen items-center justify-center font-sans">
      <main className="flex w-full h-[100%] flex-col items-center justify-between py-32 px-16 sm:items-start">
        <div className="bg-[#ffd36b] rounded-sm w-full h-[100%] pl-7 pt-6 ">
          <b>
            ⓘ Welcome! This page helps you personalize your learning companion.
          </b>
          <p className="pl-10 pt-1">
            The choices you make here are used to customize reminders, motivation, and short activities while you study.
          </p>
          <p className="pl-11 pt-5"><b>• Campus & course (optional):</b> Help us understand how the app is being used.</p>
          <p className="pl-11"><b>• Check-in interval:</b> Choose how often the app checks in while you’re studying.</p>
          <p className="pl-11"><b>• Favorite quote:</b> Add your own motivational message, or choose one to see during study sessions.</p>
          <p className="pl-11"><b>• Nickname & avatar:</b> Personalize how the app refers to you.</p>
          <p className="pl-11"><b>• Fun preferences:</b> Select activities you enjoy—these may appear during breaks or pauses to help you reset and stay engaged.</p>
          <p className="pl-11"><b>• Settings can be changed later:</b> Nothing here is permanent.</p>
          <p className="pb-3 pl-1 pt-5">Look for ⓘ icons for quick explanations. Fields marked with <a className="text-[#ff0000]">*</a> are required.</p>
        </div>

        <p className="pt-4">This site uses cookies for the purpose of ad personalization</p>

        <div className="pt-3 flex gap-6">
          <div className="flex flex-col">
            <label htmlFor="campus" className="mb-1">Enter Campus (optional).</label>
            <input
              id="campus"
              className="w-80 bg-white border border-black rounded p-2"
              placeholder="Please enter your campus (optional)."
            />
          </div>

          <div className="flex flex-col pl-[20%]">
            <label htmlFor="course" className="mb-1">Enter Course (optional).</label>
            <input
              id="course"
              className="w-80 bg-white border border-black rounded p-2"
              placeholder="Please enter your course (optional)."
            />
          </div>
        </div>

        <div className="pt-3">
          <label className="block mb-1">
            Select a Check-in Interval.<span className="text-[#ff0000]">*</span>
          </label>

          <div className="flex items-center gap-2">
            {/* clock icon */}

            {/* minutes input */}
            <input
              type="number"
              min="1"
              step="1"
              defaultValue={5}
              className="w-20 border border-black bg-white rounded px-2 py-1"
            />

            {/* unit dropdown */}
            <select className="border border-black bg-white rounded px-2 py-1">
              <option>Minutes</option>
              <option>Hours</option>
            </select>

            {/* info icon */}
            <span
              className="border border-black rounded-full w-6 h-6 flex items-center justify-center text-xs cursor-pointer"
              title="How often we check in with you."
            >
              i
            </span>
          </div>
        </div>

        <div className="flex gap-6">

        <div>
          <p className="pt-4 flex ">Type in your favorite quote.</p>
            <div className="">
            <input
              id="enterQuote"
              className="w-80 bg-white border border-black rounded p-2"
              placeholder="Please enter your campus (optional)."
            />
          </div>
        </div>

        <p>OR</p>

        <div>
          <p className="pt-4 flex ">Select a quote.</p>
        <div className="">
            <input
              id="selectQuote"
              className="w-80 bg-white border border-black rounded p-2"
              placeholder="Select a quote (optional)."
              />
            </div>
          </div>
        </div>   

        <div>
          <p className="pt-4 flex ">Select a nickname.<span className="text-[#ff0000]">*</span></p>
            <div className="flex">
            <input
              id="enterQuote"
              className="w-80 bg-white border border-black rounded p-2"
              placeholder="Please enter your campus (optional)."
            />
            <a className="pl-[10%] w-[35%]">Dark Mode</a>
                <div className="onoffswitch h-[1%] w-[1%]">
      <input
        type="checkbox"
        name="onoffswitch"
        className="onoffswitch-checkbox"
        id="myonoffswitch"
        tabIndex={0}
        checked={on}
        onChange={(e) => setOn(e.target.checked)}
      />
      <label className="onoffswitch-label" htmlFor="myonoffswitch">
        <span className="onoffswitch-inner" />
        <span className="onoffswitch-switch" />
      </label>
    </div>
          </div>
          
        </div> 
<div className="flex justify-center w-full pt-6 pb-[2%]">
        <Link href="login">
            <button className="rounded-lg px-8 py-3 text-white bg-[#235937]">
            Submit
            </button>
        </Link>
        </div>
      </main>
    </div>
  );
}

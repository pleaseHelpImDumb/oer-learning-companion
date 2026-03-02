"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
type StudyTimerProps = {
  /** total duration in seconds */
  durationSec?: number;
  /** optional: start immediately on mount */
  autoStart?: boolean;
};

function pad2(n: number) {
  return n.toString().padStart(2, "0");
}

function formatHMS(totalSeconds: number) {
  const s = Math.max(0, Math.floor(totalSeconds));
  const hh = Math.floor(s / 3600);
  const mm = Math.floor((s % 3600) / 60);
  const ss = s % 60;
  return `${pad2(hh)}:${pad2(mm)}:${pad2(ss)}`;
}

function formatEndTime(endTs: number) {
  const d = new Date(endTs);
  return d.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
}

export default function StudyTimer({ durationSec = 60 * 60, autoStart = false }: StudyTimerProps) {
  const [isRunning, setIsRunning] = useState(autoStart);
  const [remainingMs, setRemainingMs] = useState(durationSec * 1000);

  // store absolute end timestamp when running
  const endRef = useRef<number | null>(null);
  const rafRef = useRef<number | null>(null);

  const totalMs = useMemo(() => durationSec * 1000, [durationSec]);

  // derived
  const remainingSec = remainingMs / 1000;
  const display = formatHMS(remainingSec);

  const endTimeText = useMemo(() => {
    if (!endRef.current) return null;
    return formatEndTime(endRef.current);
  }, [isRunning]);

  const progress = useMemo(() => {
    // 0 -> empty, 1 -> full
    return 1 - Math.min(1, Math.max(0, remainingMs / totalMs));
  }, [remainingMs, totalMs]);

  // animation loop
  useEffect(() => {
    if (!isRunning) return;

    if (!endRef.current) {
      endRef.current = Date.now() + remainingMs;
    }

    const tick = () => {
      const end = endRef.current!;
      const msLeft = Math.max(0, end - Date.now());
      setRemainingMs(msLeft);

      if (msLeft <= 0) {
        setIsRunning(false);
        endRef.current = null;
        return;
      }
      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [isRunning, remainingMs]);

  const start = () => {
    if (remainingMs <= 0) {
      setRemainingMs(totalMs);
    }
    setIsRunning(true);
  };

  const pause = () => {
    setIsRunning(false);
    // keep remainingMs, but clear end timestamp so resume recalculates
    endRef.current = null;
  };

  const reset = () => {
    setIsRunning(false);
    endRef.current = null;
    setRemainingMs(totalMs);
  };

  // ===== Ring math (SVG) =====
  const size = 420;
  const stroke = 13;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference * (1 - progress);

  return (
    <div className="relative flex min-h-screen w-full items-center justify-center font-sans">
        <Image
                src="/login_background.jpg"
                alt="Background"
                fill
                className="object-cover -z-10"
              />
    <div className="flex flex-col h-full w-[80%] justify-center items-center bg-[#1f2a3a] py-[8%] rounded-2xl">
    <div className="w-[80%] h-full flex flex-col items-center justify-center py-[10%]  rounded-xl">
      <div className="relative flex items-center justify-center w-full h-full">
        {/* Center content (not rotated) */}
        <div className="absolute inset-0 flex flex-col items-center justify-center rotate-0 h-full w-full">
          {endRef.current ? (
            <p className="text-white/50 text-sm w-full h-full flex justify-center items-center ">
              Ends at: <span className="text-white/90">{formatEndTime(endRef.current)}</span>
            </p>
          ) : (
            <p className="text-white/50 text-sm w-full h-full flex justify-center items-center pb-[2%]">Here you can set the default break duration.</p>
          )}
      <select
        defaultValue="breaks"
        className="
          appearance-none
          bg-[#10161f] text-white font-semibold
          border border-white/40 rounded-md
          px-6 py-3 pr-12
          text-lg
          focus:outline-none focus:ring-2 focus:ring-white/30
          flex 
          flex-col 
          items-center
            "
          >
        <option value="breaks">Breaks</option>
        <option value="short">Short break</option>
        <option value="long">Long break</option>
        <option value="none">No breaks</option>
      </select>
          {/* Digital display */}
          <div className="font-ds-digital tracking-wider text-white text-6xl md:text-7xl select-none pb-[2%]">
            {display}
          </div>

          {/* Buttons */}
          <div className="mt-5 flex gap-3 w-full h-full flex justify-center items-center">
            {!isRunning ? (
              <button
                onClick={start}
                className="px-[15%] py-[2%] rounded-full bg-amber-500/90 hover:bg-amber-500 text-black font-semibold shadow flex justify-center items-center"
              >
                Start Break
              </button>
            ) : (
              <button
                onClick={pause}
                className="px-[15%] py-[2%] rounded-full bg-amber-500/90 hover:bg-amber-500 text-black font-semibold shadow flex justify-center items-center"
              >
                Pause
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
    <div className="flex flex-col text-white justify-center items-center pt-[1%]">
            <a>Take this opportunity to move and stretch.</a>
            <a>Even something simple can help relieve stress.</a>
          </div>
    </div>
    </div>
  );
}
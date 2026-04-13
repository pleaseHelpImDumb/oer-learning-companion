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
  const [selectedMinutes, setSelectedMinutes] = useState(durationSec / 60);
  const [remainingMs, setRemainingMs] = useState(selectedMinutes * 60 * 1000);
  // store absolute end timestamp when running
  const endRef = useRef<number | null>(null);
  const rafRef = useRef<number | null>(null);

  const totalMs = useMemo(() => selectedMinutes * 60 * 1000, [selectedMinutes]);
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
  <div className="w-full flex flex-col items-center justify-center px-4 py-6">
    <div className="w-full max-w-md flex flex-col items-center gap-4 rounded-2xl bg-[#1f2a3a] p-6 shadow-lg">

      {/* Header */}
      {endRef.current ? (
        <p className="text-white/60 text-sm text-center">
          Ends at: <span className="text-white/90">{formatEndTime(endRef.current)}</span>
        </p>
      ) : (
        <p className="text-white/60 text-sm text-center">
          Set your break duration
        </p>
      )}

      {/* Duration Select */}
      <select
        value={selectedMinutes}
        onChange={(e) => {
          const minutes = Number(e.target.value);
          setSelectedMinutes(minutes);

          setIsRunning(false);
          endRef.current = null;
          setRemainingMs(minutes * 60 * 1000);
        }}
        className="
          appearance-none
          bg-[#10161f]
          text-white
          font-semibold
          border border-white/30
          rounded-md
          px-5 py-2
          text-base
          focus:outline-none focus:ring-2 focus:ring-white/30
        "
      >
        {Array.from({ length: 45 }, (_, i) => {
          const value = (i + 1) * 5;
          return (
            <option key={value} value={value}>
              {value} mins
            </option>
          );
        })}
      </select>

      {/* Timer Display */}
      <div className="font-ds-digital tracking-wider text-white text-5xl sm:text-6xl select-none">
        {display}
      </div>

      {/* Buttons */}
      <div className="flex gap-3 mt-2">
        {!isRunning ? (
          <button
            onClick={start}
            className="px-6 py-2 rounded-full bg-amber-500/90 hover:bg-amber-500 text-black font-semibold shadow transition"
          >
            Start
          </button>
        ) : (
          <button
            onClick={pause}
            className="px-6 py-2 rounded-full bg-amber-500/90 hover:bg-amber-500 text-black font-semibold shadow transition"
          >
            Pause
          </button>
        )}
      </div>

      {/* Footer text */}
      <div className="text-white/70 text-sm text-center pt-2">
        <p>Take a moment to reset.</p>
        <p>Even a short break helps.</p>
      </div>
    </div>
  </div>
);
}
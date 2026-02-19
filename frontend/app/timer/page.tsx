"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";

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
    <div className="w-full h-full flex flex-col items-center justify-center py-10 bg-[#000000]">
      <div className="relative flex items-center justify-center">
        {/* Ring */}
        <svg width={size} height={size} className="rotate-[-90deg]">
          {/* Track */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="rgba(255,255,255,0.10)"
            strokeWidth={stroke}
          />
          {/* Progress */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="#F6D24A"
            strokeWidth={stroke}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={dashOffset}
            className="transition-[stroke-dashoffset] duration-150 ease-linear"
          />
        </svg>

        {/* Center content (not rotated) */}
        <div className="absolute inset-0 flex flex-col items-center justify-center rotate-0">
          {endRef.current ? (
            <p className="text-white/70 text-sm mb-3">
              Ends at: <span className="text-white/90">{formatEndTime(endRef.current)}</span>
            </p>
          ) : (
            <p className="text-white/50 text-sm mb-3">Set duration: {Math.round(totalMs / 60000)} min</p>
          )}

          {/* Digital display */}
          <div className="font-mono tracking-wider text-white text-6xl md:text-7xl select-none">
            {display}
          </div>

          {/* Buttons */}
          <div className="mt-5 flex gap-3">
            {!isRunning ? (
              <button
                onClick={start}
                className="px-5 py-2 rounded-full bg-amber-500/90 hover:bg-amber-500 text-black font-semibold shadow"
              >
                Start Studying
              </button>
            ) : (
              <button
                onClick={pause}
                className="px-5 py-2 rounded-full bg-white/10 hover:bg-white/15 text-white font-semibold"
              >
                Pause
              </button>
            )}

            <button
              onClick={reset}
              className="px-5 py-2 rounded-full bg-white/10 hover:bg-white/15 text-white font-semibold"
            >
              Reset
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
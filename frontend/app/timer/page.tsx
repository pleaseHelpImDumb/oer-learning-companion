"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useSession } from "@/app/providers/session-provider";

type StudyTimerProps = {
  /** fallback planned duration in minutes if no active session duration is available */
  durationMin?: number;
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

function formatClockTime(dateLike: string | number | Date) {
  const d = new Date(dateLike);
  return d.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
}

export default function StudyTimer({ durationMin = 60 }: StudyTimerProps) {
const {
  activeSession,
  startSession,
  pauseSession,
  resumeSession,
  cancelSession,
  sessionActionLoading,
} = useSession();

  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    if (!activeSession) return;

    const interval = window.setInterval(() => {
      setNow(Date.now());
    }, 1000);

    return () => window.clearInterval(interval);
  }, [activeSession]);

const plannedDurationMinutes = durationMin;

  const totalMs = plannedDurationMinutes * 60 * 1000;

  const elapsedMs = useMemo(() => {
    if (!activeSession?.startTime) return 0;

    const startMs = new Date(activeSession.startTime).getTime();
    const pausedMs = (activeSession.totalPausedMinutes ?? 0) * 60 * 1000;

    if (activeSession.status === "PAUSED" && activeSession.lastPauseTime) {
      const lastPauseMs = new Date(activeSession.lastPauseTime).getTime();
      return Math.max(0, lastPauseMs - startMs - pausedMs);
    }

    return Math.max(0, now - startMs - pausedMs);
  }, [
    activeSession?.startTime,
    activeSession?.status,
    activeSession?.lastPauseTime,
    activeSession?.totalPausedMinutes,
    now,
  ]);

  const remainingMs = Math.max(0, totalMs - elapsedMs);
  const remainingSec = remainingMs / 1000;
  const display = formatHMS(remainingSec);

  const isRunning = activeSession?.status === "ACTIVE";
  const isPaused = activeSession?.status === "PAUSED";
  const hasSession = !!activeSession;

  const projectedEndTime = useMemo(() => {
    if (!activeSession?.startTime) return null;

    const startMs = new Date(activeSession.startTime).getTime();
    const pausedMs = (activeSession.totalPausedMinutes ?? 0) * 60 * 1000;

    if (isPaused && activeSession.lastPauseTime) {
      const pauseMs = new Date(activeSession.lastPauseTime).getTime();
      const elapsedAtPause = Math.max(0, pauseMs - startMs - pausedMs);
      const remainingAtPause = Math.max(0, totalMs - elapsedAtPause);
      return new Date(now + remainingAtPause);
    }

    return new Date(startMs + pausedMs + totalMs);
  }, [
    activeSession?.startTime,
    activeSession?.lastPauseTime,
    activeSession?.totalPausedMinutes,
    isPaused,
    now,
    totalMs,
  ]);

  const progress = useMemo(() => {
    if (!hasSession || totalMs <= 0) return 0;
    return Math.min(1, Math.max(0, elapsedMs / totalMs));
  }, [elapsedMs, totalMs, hasSession]);

  const size = 420;
  const stroke = 13;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference * (1 - progress);

  return (
    <div className="flex flex-col h-full w-full">
      <div className="p-[1%] border-b-1 bg-[#235937] dark:bg-[#1C1836]">
        <div className="flex flex-row">
          <p className="text-2xl font-bold text-[#ffd36b] dark:text-white w-[4%]">
            Timer
          </p>
          <p className="text-white text-2xl font-bold pl-[42%]">Minutes</p>
        </div>
      </div>

      <div className="w-full h-full flex flex-col items-center justify-center py-10 bg-[#000000]">
        <div className="relative flex items-center justify-center">
          <svg width={size} height={size} className="rotate-[-90deg]">
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="none"
              stroke="rgba(255,255,255,0.10)"
              strokeWidth={stroke}
            />
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

          <div className="absolute inset-0 flex flex-col items-center justify-center rotate-0">
            <p className="text-white/70 text-sm mb-3">
              {projectedEndTime ? (
                <>
                  Ends at:{" "}
                  <span className="text-white/90">
                    {formatClockTime(projectedEndTime)}
                  </span>
                </>
              ) : (
                <span className="text-white/50">No active study session</span>
              )}
            </p>

            <div className="font-ds-digital tracking-wider text-white text-6xl md:text-7xl select-none">
              {hasSession ? display : formatHMS(plannedDurationMinutes * 60)}
            </div>

            <div className="mt-5 flex gap-3">
              {hasSession ? (
                isRunning ? (
                  <button
                    onClick={() => void pauseSession()}
                    disabled={sessionActionLoading}
                    className="px-5 py-2 rounded-full bg-amber-500/90 hover:bg-amber-500 text-black font-semibold shadow disabled:opacity-60"
                  >
                    {sessionActionLoading ? "Working..." : "Pause"}
                  </button>
                ) : (
                  <button
                    onClick={() => void resumeSession()}
                    disabled={sessionActionLoading}
                    className="px-5 py-2 rounded-full bg-amber-500/90 hover:bg-amber-500 text-black font-semibold shadow disabled:opacity-60"
                  >
                    {sessionActionLoading ? "Working..." : "Resume"}
                  </button>
                )
              ) : (
<button
  onClick={() => void startSession()}
  disabled={sessionActionLoading}
  className="px-5 py-2 rounded-full bg-amber-500/90 hover:bg-amber-500 text-black font-semibold shadow disabled:opacity-60"
>
  {sessionActionLoading ? "Starting..." : "Start Studying"}
</button>
              )}

              <button
                onClick={() => void cancelSession()}
                disabled={!hasSession || sessionActionLoading}
                className="px-5 py-2 rounded-full bg-white/10 hover:bg-white/15 text-white font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {sessionActionLoading ? "Working..." : "Stop"}
              </button>
            </div>

            {isPaused && (
              <p className="mt-3 text-sm text-white/60">Session is paused</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
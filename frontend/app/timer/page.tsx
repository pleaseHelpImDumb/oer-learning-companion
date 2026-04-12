"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useSession } from "@/app/providers/session-provider";

type StudyTimerProps = {
  durationMin?: number;
};

type LocalTimerState = {
  sessionKey: string;
  baseStudySeconds: number;
  anchorMs: number;
  status: "ACTIVE" | "PAUSED";
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

const STORAGE_KEY = "study-timer-local-state";

function readLocalTimerState(): LocalTimerState | null {
  if (typeof window === "undefined") return null;

  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return null;

    const parsed = JSON.parse(raw) as LocalTimerState;

    if (
      !parsed ||
      typeof parsed.sessionKey !== "string" ||
      typeof parsed.baseStudySeconds !== "number" ||
      typeof parsed.anchorMs !== "number" ||
      (parsed.status !== "ACTIVE" && parsed.status !== "PAUSED")
    ) {
      return null;
    }

    return parsed;
  } catch {
    return null;
  }
}

function writeLocalTimerState(state: LocalTimerState | null) {
  if (typeof window === "undefined") return;

  if (!state) {
    sessionStorage.removeItem(STORAGE_KEY);
    return;
  }

  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export default function StudyTimer({ durationMin = 60 }: StudyTimerProps) {
const {
  activeSession,
  liveStudySeconds,
  startSession,
  pauseSession,
  resumeSession,
  cancelSession,
  sessionActionLoading,
} = useSession();

  const [now, setNow] = useState(Date.now());
  const [localTimer, setLocalTimer] = useState<LocalTimerState | null>(null);

  const sessionKey = activeSession
    ? `${activeSession.sessionId}:${activeSession.startTime}`
    : null;

  // Tick once per second only while the local timer is active
  useEffect(() => {
    if (localTimer?.status !== "ACTIVE") return;

    const interval = window.setInterval(() => {
      setNow(Date.now());
    }, 1000);

    return () => window.clearInterval(interval);
  }, [localTimer?.status]);

  // Keep a local precise timer state for the current backend session
  useEffect(() => {
    if (!sessionKey || !activeSession) {
      setLocalTimer(null);
      writeLocalTimerState(null);
      return;
    }

    const stored = readLocalTimerState();

    // Reuse stored precise state if it belongs to the same session
    if (stored && stored.sessionKey === sessionKey) {
      // If backend status changed, update only the status, not the precise seconds
      if (stored.status !== activeSession.status) {
        const updated: LocalTimerState = {
          ...stored,
          status: activeSession.status,
          anchorMs: activeSession.status === "ACTIVE" ? Date.now() : stored.anchorMs,
        };
        setLocalTimer(updated);
        writeLocalTimerState(updated);
      } else {
        setLocalTimer(stored);
      }
      return;
    }

    // First time seeing this session: initialize from backend coarse minutes
    const initial: LocalTimerState = {
      sessionKey,
      baseStudySeconds: (activeSession.currentStudyMinutes ?? 0) * 60,
      anchorMs: Date.now(),
      status: activeSession.status,
    };

    setLocalTimer(initial);
    writeLocalTimerState(initial);
  }, [
    sessionKey,
    activeSession?.sessionId,
    activeSession?.startTime,
    activeSession?.status,
    activeSession?.currentStudyMinutes,
  ]);

  const plannedDurationMinutes = durationMin;
  const totalSeconds = plannedDurationMinutes * 60;

  const hasSession = !!activeSession;
  const isRunning = localTimer?.status === "ACTIVE";
  const isPaused = localTimer?.status === "PAUSED";

const studySeconds = liveStudySeconds;

  const remainingSec = Math.max(0, totalSeconds - studySeconds);
  const display = formatHMS(remainingSec);

  const projectedEndTime = useMemo(() => {
    if (!hasSession) return null;
    return new Date(Date.now() + remainingSec * 1000);
  }, [hasSession, remainingSec]);

  const progress = useMemo(() => {
    if (!hasSession || totalSeconds <= 0) return 0;
    return Math.min(1, Math.max(0, studySeconds / totalSeconds));
  }, [hasSession, totalSeconds, studySeconds]);

  const persistLocalTimer = (next: LocalTimerState | null) => {
    setLocalTimer(next);
    writeLocalTimerState(next);
  };

  const handlePause = async () => {
    if (!localTimer) return;

    const preciseStudySeconds =
      localTimer.status === "ACTIVE"
        ? localTimer.baseStudySeconds +
          Math.max(0, Math.floor((Date.now() - localTimer.anchorMs) / 1000))
        : localTimer.baseStudySeconds;

    const next: LocalTimerState = {
      ...localTimer,
      baseStudySeconds: preciseStudySeconds,
      anchorMs: Date.now(),
      status: "PAUSED",
    };

    persistLocalTimer(next);
    await pauseSession();
  };

  const handleResume = async () => {
    if (!localTimer) return;

    const next: LocalTimerState = {
      ...localTimer,
      anchorMs: Date.now(),
      status: "ACTIVE",
    };

    persistLocalTimer(next);
    await resumeSession();
  };

  const handleStart = async () => {
    await startSession();
  };

  const handleStop = async () => {
    persistLocalTimer(null);
    await cancelSession();
  };

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
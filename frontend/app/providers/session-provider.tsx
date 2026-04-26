"use client";

import { usePopup } from "./popup-provider";
import React, { createContext, useContext, useEffect, useMemo, useRef, useState } from "react";
type ActiveSession = {
  sessionId: number;
  status: "ACTIVE" | "PAUSED";
  startTime: string;
  lastPauseTime?: string | null;
  totalPausedMinutes: number;
  currentStudyMinutes?: number;
  currentStudySeconds?: number;
  tokensAvailable?: number;
  tokensSpent?: number;
  sessionGoalMinutes?: number | null;
};

type SessionContextType = {
  activeSession: ActiveSession | null;
  loading: boolean;
  sessionActionLoading: boolean;
  liveStudySeconds: number;
  displayTokensAvailable: number;
  refreshSession: () => Promise<void>;
  startSession: (sessionGoalMinutes: number) => Promise<void>;
  cancelSession: () => Promise<void>;
  pauseSession: () => Promise<void>;
  resumeSession: () => Promise<void>;
  completeSession: () => Promise<void>;
  spendGameTokens: (amount: number) => Promise<boolean>;
};

type SessionProviderProps = {
  children: React.ReactNode;
  shouldCheckSession?: boolean;
};

const SessionContext = createContext<SessionContextType | null>(null);
export function SessionProvider({
  children,
  shouldCheckSession = true,
}: SessionProviderProps) {
const refreshInFlightRef = useRef(false);

  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
const [activeSession, setActiveSession] = useState<ActiveSession | null>(null);
const [loading, setLoading] = useState<boolean>(shouldCheckSession);
const [sessionActionLoading, setSessionActionLoading] = useState(false);
const [liveStudySeconds, setLiveStudySeconds] = useState(0);
const [sessionClockKey, setSessionClockKey] = useState<string | null>(null);
const [clockAnchorMs, setClockAnchorMs] = useState<number | null>(null);
const [autoCompletingSessionId, setAutoCompletingSessionId] = useState<number | null>(null);
const actionLockRef = useRef(false);
const { showPopup } = usePopup();
const lastToggleAtRef = useRef(0);
const TOGGLE_COOLDOWN_MS = 1000;
const [toggleCooldownUntil, setToggleCooldownUntil] = useState(0);
const PAUSED_SECONDS_KEY = "activeSessionPausedSeconds";
const displayTokensAvailable = useMemo(() => {
  if (!activeSession) return 0;

  const spentTokens = activeSession.tokensSpent ?? 0;
  const earnedTokens = Math.floor(liveStudySeconds / 300);

  return Math.max(0, earnedTokens - spentTokens);
}, [activeSession, liveStudySeconds]);
useEffect(() => {
  if (!activeSession) return;
  if (activeSession.status !== "ACTIVE") return;
  if (!activeSession.sessionGoalMinutes || activeSession.sessionGoalMinutes <= 0) return;
  if (sessionActionLoading) return;

  const goalSeconds = activeSession.sessionGoalMinutes * 60;

  if (
    liveStudySeconds >= goalSeconds &&
    autoCompletingSessionId !== activeSession.sessionId
  ) {
    setAutoCompletingSessionId(activeSession.sessionId);
    void completeSession();
  }
}, [
  activeSession,
  liveStudySeconds,
  sessionActionLoading,
  autoCompletingSessionId,
]);

function buildSessionClockKey(session: ActiveSession | null) {
  if (!session) return null;
  return `${session.sessionId}:${session.startTime}`;
}
function isToggleCoolingDown() {
  return Date.now() - lastToggleAtRef.current < TOGGLE_COOLDOWN_MS;
}
function beginToggleCooldown() {
  lastToggleAtRef.current = Date.now();
  const until = Date.now() + TOGGLE_COOLDOWN_MS;
  setToggleCooldownUntil(until);
}
{/*function syncLocalClockFromSession(session: ActiveSession | null) {
  const nextKey = buildSessionClockKey(session);

  if (!session) {
    localStorage.removeItem(PAUSED_SECONDS_KEY);
    setSessionClockKey(null);
    setLiveStudySeconds(0);
    setClockAnchorMs(null);
    return;
  }

  const localPausedSeconds = Number(
    localStorage.getItem(`${PAUSED_SECONDS_KEY}:${nextKey}`) ?? 0
  );

  const restoredSeconds =
    session.currentStudySeconds ??
    (session.currentStudyMinutes ?? 0) * 60;

  const correctedSeconds = Math.max(0, restoredSeconds - localPausedSeconds);

  setSessionClockKey(nextKey);
  setLiveStudySeconds(correctedSeconds);

  if (session.status === "ACTIVE") {
    setClockAnchorMs(Date.now());
  } else {
    setClockAnchorMs(null);
  }
}*/}
function syncLocalClockFromSession(session: ActiveSession | null) {
  const nextKey = buildSessionClockKey(session);

  if (!session) {
    setSessionClockKey(null);
    setLiveStudySeconds(0);
    setClockAnchorMs(null);
    return;
  }

  const restoredSeconds =
    session.currentStudySeconds ??
    (session.currentStudyMinutes ?? 0) * 60;

  setSessionClockKey(nextKey);
  setLiveStudySeconds(Math.max(0, restoredSeconds));

  if (session.status === "ACTIVE") {
    setClockAnchorMs(Date.now());
  } else {
    setClockAnchorMs(null);
  }
}

const spendGameTokens = async (amount: number): Promise<boolean> => {
  if (!activeSession || !API_BASE_URL) return false;

  try {
    const csrfToken =
      typeof window !== "undefined" ? localStorage.getItem("csrfToken") : null;

    const res = await fetch(
      `${API_BASE_URL}/sessions/${activeSession.sessionId}/consume-token`,
      {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          ...(csrfToken ? { "X-CSRF-TOKEN": csrfToken } : {}),
        },
        body: JSON.stringify({ cost: amount }),
      }
    );

    const data = await res.json().catch(() => ({}));

    if (!res.ok || !data?.session) {
      return false;
    }

    setActiveSession((prev) =>
      prev
        ? {
            ...prev,
            tokensSpent: Number(data.session.tokensSpent ?? prev.tokensSpent ?? 0),
            tokensAvailable: Number(
              data.session.tokensAvailable ?? prev.tokensAvailable ?? 0
            ),
          }
        : prev
    );

    return true;
  } catch (error) {
    console.error("[SESSION PROVIDER] Failed to spend tokens:", error);
    return false;
  }
};

const refreshSession = async () => {
  if (refreshInFlightRef.current) return;

  if (!API_BASE_URL || !shouldCheckSession) {
    setLoading(false);
    setActiveSession(null);
    return;
  }

  refreshInFlightRef.current = true;

  try {
    setLoading(true);

    const res = await fetch(`${API_BASE_URL}/sessions/active`, {
      method: "GET",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
    });

    const data = await res.json().catch(() => ({}));
    console.log("[SESSION PROVIDER] refreshSession response:", data);

    if (res.status === 429) {
      console.warn("[SESSION PROVIDER] refresh rate-limited; keeping previous session state");
      return;
    }

    if (!res.ok) {
      console.error("[SESSION PROVIDER] non-OK response", res.status);
      setActiveSession(null);
      syncLocalClockFromSession(null);
      return;
    }

    const nextSession = data?.session || null;
    setActiveSession(nextSession);
    syncLocalClockFromSession(nextSession);
  } catch (error) {
    console.error("[SESSION PROVIDER ERROR]", error);
  } finally {
    refreshInFlightRef.current = false;
    setLoading(false);
  }
};
const startSession = async (sessionGoalMinutes: number) => {
  if (!API_BASE_URL) {
    console.log("[SESSION PROVIDER] startSession aborted", {
      API_BASE_URL,
    });
    return;
  }

  try {
    setSessionActionLoading(true);

    const csrfToken =
      typeof window !== "undefined" ? localStorage.getItem("csrfToken") : null;
    const res = await fetch(`${API_BASE_URL}/sessions/start`, {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        ...(csrfToken ? { "X-CSRF-TOKEN": csrfToken } : {}),
      },
      body: JSON.stringify({ sessionGoalMinutes }),
    });

    const data = await res.json().catch(() => ({}));
    console.log("[SESSION PROVIDER] start response:", data);

    if (!res.ok) {
      throw new Error(data?.error || data?.message || "Failed to start session");
    }

    await refreshSession();
  } catch (error) {
    console.error("[SESSION PROVIDER] Failed to start session:", error);
  } finally {
    setSessionActionLoading(false);
  }
};
  const cancelSession = async () => {
    if (!activeSession || !API_BASE_URL) {
      console.log("[SESSION PROVIDER] stopSession aborted", {
        hasActiveSession: !!activeSession,
        API_BASE_URL,
      });
      return;
    }

    try {
      setSessionActionLoading(true);

      const csrfToken =
        typeof window !== "undefined" ? localStorage.getItem("csrfToken") : null;

      const res = await fetch(`${API_BASE_URL}/sessions/${activeSession.sessionId}/cancel`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          ...(csrfToken ? { "X-CSRF-TOKEN": csrfToken } : {}),
        },
        body: JSON.stringify({}),
      });

      const data = await res.json().catch(() => ({}));
      console.log("[SESSION PROVIDER] stop response:", data);

      if (!res.ok) {
        throw new Error(data?.error || data?.message || "Failed to stop session");
      }
setLiveStudySeconds(0);
setClockAnchorMs(null);
setSessionClockKey(null);
      await refreshSession();
    } catch (error) {
      console.error("[SESSION PROVIDER] Failed to stop session:", error);
    } finally {
      setSessionActionLoading(false);
    }
  };

const pauseSession = async () => {
  if (
    !activeSession ||
    !API_BASE_URL ||
    sessionActionLoading ||
    actionLockRef.current ||
    isToggleCoolingDown()
  ) {
    return;
  }

  actionLockRef.current = true;
  beginToggleCooldown();

  try {
    setSessionActionLoading(true);

    const csrfToken =
      typeof window !== "undefined" ? localStorage.getItem("csrfToken") : null;

    const res = await fetch(
      `${API_BASE_URL}/sessions/${activeSession.sessionId}/pause`,
      {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          ...(csrfToken ? { "X-CSRF-TOKEN": csrfToken } : {}),
        },
        body: JSON.stringify({}),
      }
    );

    const data = await res.json().catch(() => ({}));

    if (res.status === 429) {
      console.warn("Pause request rate-limited");
      return;
    }

if (!res.ok) {
  if (
    data?.error === "Session is not active" ||
    data?.message === "Session is not active"
  ) {
    await refreshSession();
    return;
  }

  throw new Error(data?.error || data?.message || "Failed to pause session");
}

    setActiveSession((prev) =>
      prev
        ? {
            ...prev,
            status: "PAUSED",
            lastPauseTime: new Date().toISOString(),
          }
        : prev
    );
    if (activeSession) {
  const key = `${PAUSED_SECONDS_KEY}:${buildSessionClockKey(activeSession)}`;
  localStorage.setItem(key, String(liveStudySeconds));
}
    setClockAnchorMs(null);

    //await refreshSession();
  } catch (error) {
    console.error("[SESSION PROVIDER] Failed to pause session:", error);
  } finally {
    setSessionActionLoading(false);
    actionLockRef.current = false;
  }
};

const resumeSession = async () => {
  if (
    !activeSession ||
    !API_BASE_URL ||
    sessionActionLoading ||
    actionLockRef.current ||
    isToggleCoolingDown()
  ) {
    return;
  }

  actionLockRef.current = true;
  beginToggleCooldown();

  try {
    setSessionActionLoading(true);

    const csrfToken =
      typeof window !== "undefined" ? localStorage.getItem("csrfToken") : null;

    const res = await fetch(
      `${API_BASE_URL}/sessions/${activeSession.sessionId}/resume`,
      {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          ...(csrfToken ? { "X-CSRF-TOKEN": csrfToken } : {}),
        },
        body: JSON.stringify({}),
      }
    );

    const data = await res.json().catch(() => ({}));

    if (res.status === 429) {
      console.warn("Resume request rate-limited");
      return;
    }

    if (!res.ok) {
      throw new Error(data?.error || data?.message || "Failed to resume session");
    }

    setActiveSession((prev) =>
      prev
        ? {
            ...prev,
            status: "ACTIVE",
            lastPauseTime: null,
          }
        : prev
    );
if (activeSession) {
  const key = `${PAUSED_SECONDS_KEY}:${buildSessionClockKey(activeSession)}`;
  localStorage.setItem(key, String(liveStudySeconds));
}

setClockAnchorMs(Date.now());
    //await refreshSession();
  } catch (error) {
    console.error("[SESSION PROVIDER] Failed to resume session:", error);
  } finally {
    setSessionActionLoading(false);
    actionLockRef.current = false;
  }
};

const completeSession = async () => {
  if (!activeSession || !API_BASE_URL) {
    console.log("[SESSION PROVIDER] completeSession aborted", {
      hasActiveSession: !!activeSession,
      API_BASE_URL,
    });
    return;
  }

  try {
    setSessionActionLoading(true);

    const completedSessionId = activeSession.sessionId;

    const csrfToken =
      typeof window !== "undefined" ? localStorage.getItem("csrfToken") : null;

    const res = await fetch(
      `${API_BASE_URL}/sessions/${completedSessionId}/complete`,
      {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          ...(csrfToken ? { "X-CSRF-TOKEN": csrfToken } : {}),
        },
        body: JSON.stringify({}),
      }
    );

    const data = await res.json().catch(() => ({}));
    console.log("[SESSION PROVIDER] complete response:", data);

    if (!res.ok) {
      throw new Error(data?.error || data?.message || "Failed to complete session");
    }

  setLiveStudySeconds(0);
  setClockAnchorMs(null);
  setSessionClockKey(null);
  await refreshSession();
    
    const newTokenCount =
  data?.session?.tokensAvailable ??
  data?.tokensAvailable ??
  data?.user?.tokenBalance ??
  data?.tokenBalance;
showPopup({
  type: "sessionCelebration",
  gifSrc: "/assets/popups/confetti.gif",
  imageSrc: "/assets/popups/session-complete.png",
  autoCloseMs: 4000,
  dimBackground: false,
});

if (newTokenCount === 4) {
  window.setTimeout(() => {
    showPopup({
      type: "achievement",
      imageSrc: "/assets/popups/minigame-unlocked.png",
      autoCloseMs: 4000,
      dimBackground: true,
    });
  }, 4100);
}
  } catch (error) {
    console.error("[SESSION PROVIDER] Failed to complete session:", error);
    setAutoCompletingSessionId(null);
  } finally {
    setSessionActionLoading(false);
  }
};

  useEffect(() => {
    void refreshSession();
  }, [API_BASE_URL, shouldCheckSession]);
  useEffect(() => {
  if (!activeSession || activeSession.status !== "ACTIVE" || clockAnchorMs === null) {
    return;
  }

  const interval = window.setInterval(() => {
    setLiveStudySeconds((prev) => prev + 1);
  }, 1000);

  return () => window.clearInterval(interval);
}, [activeSession?.sessionId, activeSession?.status, clockAnchorMs]);
  useEffect(() => {
  if (!activeSession) return;
  if (activeSession.status !== "ACTIVE") return;
  if (!activeSession.sessionGoalMinutes || activeSession.sessionGoalMinutes <= 0) return;
  if (sessionActionLoading) return;

  const goalSeconds = activeSession.sessionGoalMinutes * 60;

  if (
    liveStudySeconds >= goalSeconds &&
    autoCompletingSessionId !== activeSession.sessionId
  ) {
    setAutoCompletingSessionId(activeSession.sessionId);
    void completeSession();
  }
}, [
  activeSession,
  liveStudySeconds,
  sessionActionLoading,
  autoCompletingSessionId,
]);

const value = useMemo(
  () => ({
    activeSession,
    loading,
    sessionActionLoading,
    liveStudySeconds,
    displayTokensAvailable,
    refreshSession,
    startSession,
    cancelSession,
    pauseSession,
    resumeSession,
    completeSession,
    spendGameTokens,
  }),
  [
    activeSession,
    loading,
    sessionActionLoading,
    liveStudySeconds,
    displayTokensAvailable,
  ]
);

  console.log("[SESSION PROVIDER] context value", value);

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

export function useSession() {
  const ctx = useContext(SessionContext);
  if (!ctx) {
    throw new Error("useSession must be used within a SessionProvider");
  }
  return ctx;
}
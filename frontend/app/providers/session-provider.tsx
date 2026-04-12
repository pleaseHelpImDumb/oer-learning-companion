"use client";

import React, { createContext, useContext, useEffect, useMemo, useState } from "react";

type ActiveSession = {
  sessionId: number;
  status: "ACTIVE" | "PAUSED";
  startTime: string;
  lastPauseTime?: string | null;
  totalPausedMinutes: number;
  currentStudyMinutes?: number;
  tokensAvailable?: number;
};

type SessionContextType = {
  activeSession: ActiveSession | null;
  loading: boolean;
  sessionActionLoading: boolean;
  liveStudySeconds: number;
  refreshSession: () => Promise<void>;
  startSession: () => Promise<void>;
  cancelSession: () => Promise<void>;
  pauseSession: () => Promise<void>;
  resumeSession: () => Promise<void>;
  completeSession: () => Promise<void>;
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
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
const [activeSession, setActiveSession] = useState<ActiveSession | null>(null);
const [loading, setLoading] = useState<boolean>(shouldCheckSession);
const [sessionActionLoading, setSessionActionLoading] = useState(false);
const [liveStudySeconds, setLiveStudySeconds] = useState(0);
const [sessionClockKey, setSessionClockKey] = useState<string | null>(null);
const [clockAnchorMs, setClockAnchorMs] = useState<number | null>(null);
function buildSessionClockKey(session: ActiveSession | null) {
  if (!session) return null;
  return `${session.sessionId}:${session.startTime}`;
}

function syncLocalClockFromSession(session: ActiveSession | null) {
  const nextKey = buildSessionClockKey(session);

  if (!session) {
    setSessionClockKey(null);
    setLiveStudySeconds(0);
    setClockAnchorMs(null);
    return;
  }

  const coarseSeconds = (session.currentStudyMinutes ?? 0) * 60;

  setSessionClockKey((prevKey) => {
    const isSameSession = prevKey === nextKey;

    if (!isSameSession) {
      // brand new session: initialize from backend
      setLiveStudySeconds(coarseSeconds);
    } else {
      // same session: NEVER let backend minute rounding pull time backward
      setLiveStudySeconds((prevSeconds) => Math.max(prevSeconds, coarseSeconds));
    }

    return nextKey;
  });

  if (session.status === "ACTIVE") {
    setClockAnchorMs(Date.now());
  } else {
    setClockAnchorMs(null);
  }
}
  const refreshSession = async () => {
    if (!API_BASE_URL || !shouldCheckSession) {
      setLoading(false);
      setActiveSession(null);
      return;
    }

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

      if (!res.ok) {
        setActiveSession(null);
        return;
      }

const nextSession = data?.session || null;
setActiveSession(nextSession);
syncLocalClockFromSession(nextSession);    } catch (error) {
      console.error("[SESSION PROVIDER ERROR]", error);
      setActiveSession(null);
    } finally {
      setLoading(false);
    }
  };
const startSession = async () => {
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
      body: JSON.stringify({}),
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
  if (!activeSession || !API_BASE_URL) {
    console.log("[SESSION PROVIDER] pauseSession aborted", {
      hasActiveSession: !!activeSession,
      API_BASE_URL,
    });
    return;
  }

  try {
    setSessionActionLoading(true);

    const csrfToken =
      typeof window !== "undefined" ? localStorage.getItem("csrfToken") : null;

    const res = await fetch(`${API_BASE_URL}/sessions/${activeSession.sessionId}/pause`, {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        ...(csrfToken ? { "X-CSRF-TOKEN": csrfToken } : {}),
      },
      body: JSON.stringify({}),
    });

    const data = await res.json().catch(() => ({}));
    console.log("[SESSION PROVIDER] pause response:", data);

    if (!res.ok) {
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
setClockAnchorMs(null);
    await refreshSession();
  } catch (error) {
    console.error("[SESSION PROVIDER] Failed to pause session:", error);
  } finally {
    setSessionActionLoading(false);
  }
};

const resumeSession = async () => {
  if (!activeSession || !API_BASE_URL) {
    console.log("[SESSION PROVIDER] resumeSession aborted", {
      hasActiveSession: !!activeSession,
      API_BASE_URL,
    });
    return;
  }

  try {
    setSessionActionLoading(true);

    const csrfToken =
      typeof window !== "undefined" ? localStorage.getItem("csrfToken") : null;

    const res = await fetch(`${API_BASE_URL}/sessions/${activeSession.sessionId}/resume`, {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        ...(csrfToken ? { "X-CSRF-TOKEN": csrfToken } : {}),
      },
      body: JSON.stringify({}),
    });

    const data = await res.json().catch(() => ({}));
    console.log("[SESSION PROVIDER] resume response:", data);

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
setClockAnchorMs(Date.now());
    await refreshSession();
  } catch (error) {
    console.error("[SESSION PROVIDER] Failed to resume session:", error);
  } finally {
    setSessionActionLoading(false);
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

    const csrfToken =
      typeof window !== "undefined" ? localStorage.getItem("csrfToken") : null;

    const res = await fetch(
      `${API_BASE_URL}/sessions/${activeSession.sessionId}/complete`,
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
  } catch (error) {
    console.error("[SESSION PROVIDER] Failed to complete session:", error);
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

const value = useMemo(
  () => ({
    activeSession,
    loading,
    sessionActionLoading,
    liveStudySeconds,
    refreshSession,
    startSession,
    cancelSession,
    pauseSession,
    resumeSession,
    completeSession,
  }),
  [activeSession, loading, sessionActionLoading, liveStudySeconds]
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
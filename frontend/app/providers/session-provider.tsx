"use client";

import React, { createContext, useContext, useEffect, useMemo, useState } from "react";

type ActiveSession = {
  sessionId: number;
  status: "ACTIVE" | "PAUSED";
  startTime: string;
  lastPauseTime?: string | null;
  totalPausedMinutes: number;
  currentStudyMinutes?: number;
};

type SessionContextType = {
  activeSession: ActiveSession | null;
  loading: boolean;
  sessionActionLoading: boolean;
  refreshSession: () => Promise<void>;
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

      setActiveSession(data?.session || null);
    } catch (error) {
      console.error("[SESSION PROVIDER ERROR]", error);
      setActiveSession(null);
    } finally {
      setLoading(false);
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

await refreshSession();
    } catch (error) {
      console.error("[SESSION PROVIDER] Failed to pause session:", error);
    } finally {
      setSessionActionLoading(false);
    }
  };

  function getElapsedMs(session: {
  startTime: string;
  status: "ACTIVE" | "PAUSED";
  lastPauseTime?: string | null;
  totalPausedMinutes: number;
}) {
  const startMs = new Date(session.startTime).getTime();
  const pausedMs = (session.totalPausedMinutes || 0) * 60 * 1000;

  const effectiveNow =
    session.status === "PAUSED" && session.lastPauseTime
      ? new Date(session.lastPauseTime).getTime()
      : Date.now();

  return Math.max(0, effectiveNow - startMs - pausedMs);
}

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

const value = useMemo(
  () => ({
    activeSession,
    loading,
    sessionActionLoading,
    refreshSession,
    cancelSession,
    pauseSession,
    resumeSession,
    completeSession,
  }),
  [activeSession, loading, sessionActionLoading]
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
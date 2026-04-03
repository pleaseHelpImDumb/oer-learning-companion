"use client";

import React, { createContext, useContext, useEffect, useMemo, useState } from "react";

type ActiveSession = {
  id: number;
  status: "ACTIVE" | "PAUSED";
  startTime: string;
  lastPauseTime?: string | null;
  totalPausedMinutes: number;
  currentStudyMinutes?: number;
};

type SessionContextType = {
  activeSession: ActiveSession | null;
  loading: boolean;
  refreshSession: () => Promise<void>;
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

const stopSession = async () => {
  if (!activeSession || !API_BASE_URL) return;

  try {
    setSessionActionLoading(true);
    console.log("[SESSION PROVIDER] Stopping session:", activeSession.id);

    const csrfToken =
      typeof window !== "undefined" ? localStorage.getItem("csrfToken") : null;

    const res = await fetch(
      `${API_BASE_URL}/sessions/${activeSession.id}/cancel`,
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

    console.log("[SESSION PROVIDER] stop response status:", res.status);
    console.log("[SESSION PROVIDER] stop response body:", data);

    if (!res.ok) {
      throw new Error(data?.error || data?.message || "Failed to stop session");
    }

    setActiveSession(null);
    console.log("[SESSION PROVIDER] Session stopped successfully");
  } catch (error) {
    console.error("[SESSION PROVIDER] Failed to stop session:", error);
  } finally {
    setSessionActionLoading(false);
  }
};
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

  useEffect(() => {
    void refreshSession();
  }, [API_BASE_URL, shouldCheckSession]);

  const value = useMemo(
    () => ({
      activeSession,
      loading,
      refreshSession,
    }),
    [activeSession, loading]
  );

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

export function useSession() {
  const ctx = useContext(SessionContext);
  if (!ctx) {
    throw new Error("useSession must be used within a SessionProvider");
  }
  return ctx;
}
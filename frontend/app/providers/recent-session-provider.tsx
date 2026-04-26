"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";

type RecentSession = {
  sessionId: string;
  status: string;
  startTime: string;
  endTime: string | null;
  durationMinutes: number | null;
  sessionGoalMinutes: number | null;
  tokensEarned: number;
  tokensSpent: number;
  tokensAvailable: number;
  numAiInteractions: number;
  notes: string | null;
};
type RecentSessionsContextType = {
  sessions24hrs: RecentSession[];
  tokensEarned24hrs: number;
  tokensSpent24hrs: number;
  tokensAvailable24hrs: number;
  loadingSessions24hrs: boolean;
  refreshSessions24hrs: () => Promise<void>;
};

const RecentSessionsContext = createContext<RecentSessionsContextType | null>(
  null
);

export function RecentSessionsProvider({
  children,
  shouldFetch = true,
}: {
  children: ReactNode;
  shouldFetch?: boolean;
}) {
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

  const [sessions24hrs, setSessions24hrs] = useState<RecentSession[]>([]);
  const [loadingSessions24hrs, setLoadingSessions24hrs] = useState(false);
  const [tokensEarned24hrs, setTokensEarned24hrs] = useState(0);
  const [tokensSpent24hrs, setTokensSpent24hrs] = useState(0);
  const [tokensAvailable24hrs, setTokensAvailable24hrs] = useState(0);
  async function refreshSessions24hrs() {
    if (!API_BASE_URL || !shouldFetch) return;

    try {
      setLoadingSessions24hrs(true);

      const res = await fetch(`${API_BASE_URL}/users/sessions24hrs`, {
        method: "GET",
        credentials: "include",
      });

      if (!res.ok) {
        setSessions24hrs([]);
        return;
      }

const data = await res.json();

console.log("24HR PROVIDER DATA:", data);

setSessions24hrs(data.sessions || []);
setTokensEarned24hrs(data.tokensEarned24hrs || 0);
setTokensSpent24hrs(data.tokensSpent24hrs || 0);
setTokensAvailable24hrs(data.tokensAvailable24hrs || 0);
if (!res.ok) {
  setSessions24hrs([]);
  setTokensEarned24hrs(0);
  setTokensSpent24hrs(0);
  setTokensAvailable24hrs(0);
  return;
}
    } catch (err) {
      console.error("Failed to fetch 24hr sessions:", err);
      setSessions24hrs([]);
    } finally {
      setLoadingSessions24hrs(false);
    }
  }

  useEffect(() => {
    if (!shouldFetch) {
      setSessions24hrs([]);
      return;
    }

    refreshSessions24hrs();
  }, [shouldFetch]);

  return (
    <RecentSessionsContext.Provider
        value={{
        sessions24hrs,
        tokensEarned24hrs,
        tokensSpent24hrs,
        tokensAvailable24hrs,
        loadingSessions24hrs,
        refreshSessions24hrs,
        }}
    >
      {children}
    </RecentSessionsContext.Provider>
  );
}

export function useRecentSessions() {
  const context = useContext(RecentSessionsContext);

  if (!context) {
    throw new Error(
      "useRecentSessions must be used inside RecentSessionsProvider"
    );
  }

  return context;
}
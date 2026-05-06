"use client";

import { createContext, useContext, useState, useEffect } from "react";
import { useSession } from "@/app/providers/session-provider";
type CheckInValue = "up" | "down" | "skip";

type HelpChosen =
  | "None"
  | "Help"
  | "Break"
  | "Silly Activity"
  | "Just Breathe";

type CheckInContextType = {
  checkInWaiting: boolean;
  checkInOpen: boolean;
  setCheckInWaiting: (value: boolean) => void;
  setCheckInOpen: (value: boolean) => void;
  triggerCheckIn: () => void;
  submitCheckIn: (
    value: CheckInValue,
    helpChosen?: HelpChosen
  ) => Promise<void>;
};

const CheckInContext = createContext<CheckInContextType | null>(null);

export function CheckInProvider({ children }: { children: React.ReactNode }) {
  const [checkInWaiting, setCheckInWaiting] = useState(false);
  const [checkInOpen, setCheckInOpen] = useState(false);
const { activeSession } = useSession();
type CheckInValue = "up" | "down" | "skip";
type HelpChosen = "None" | "Help" | "Break" | "Silly Activity" | "Just Breathe";

submitCheckIn: (value: CheckInValue, helpChosen?: HelpChosen) => Promise<void>;
  function triggerCheckIn() {
    setCheckInWaiting(true);
    setCheckInOpen(true);
  }

  useEffect(() => {
    (window as any).triggerCheckIn = triggerCheckIn;
  }, []);

async function submitCheckIn(
  value: CheckInValue,
  helpChosen: HelpChosen = "None"
) {
  const csrfToken = localStorage.getItem("csrfToken");
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

  if (!activeSession?.sessionId) {
    console.error("No active session found for check-in");
    return;
  }

  const res = await fetch(
    `${API_BASE_URL}/sessions/${activeSession.sessionId}/break`,
    {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        ...(csrfToken ? { "X-CSRF-TOKEN": csrfToken } : {}),
      },
      body: JSON.stringify({
        feelingGood: value === "up",
        helpChosen,
      }),
    }
  );

  if (!res.ok) {
    console.error("Failed to save check-in:", await res.text());
    return;
  }

  setCheckInWaiting(false);
  setCheckInOpen(false);
}

  return (
    <CheckInContext.Provider
      value={{
        checkInWaiting,
        checkInOpen,
        setCheckInWaiting,
        setCheckInOpen,
        triggerCheckIn,
        submitCheckIn,
      }}
    >
      {children}
    </CheckInContext.Provider>
  );
}

export function useCheckIn() {
  const ctx = useContext(CheckInContext);
  if (!ctx) {
    throw new Error("useCheckIn must be used inside CheckInProvider");
  }
  return ctx;
}
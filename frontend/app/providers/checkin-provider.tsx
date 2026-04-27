"use client";

import { createContext, useContext, useState, useEffect } from "react";

type CheckInValue = "up" | "down" | "skip";

type CheckInContextType = {
  checkInWaiting: boolean;
  checkInOpen: boolean;
  setCheckInWaiting: (value: boolean) => void;
  setCheckInOpen: (value: boolean) => void;
  triggerCheckIn: () => void;
  submitCheckIn: (value: CheckInValue) => Promise<void>;
};

const CheckInContext = createContext<CheckInContextType | null>(null);

export function CheckInProvider({ children }: { children: React.ReactNode }) {
  const [checkInWaiting, setCheckInWaiting] = useState(false);
  const [checkInOpen, setCheckInOpen] = useState(false);

  function triggerCheckIn() {
    setCheckInWaiting(true);
    setCheckInOpen(true);
  }

  useEffect(() => {
    (window as any).triggerCheckIn = triggerCheckIn;
  }, []);

  async function submitCheckIn(value: CheckInValue) {
    console.log("Check-in answer:", value);

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
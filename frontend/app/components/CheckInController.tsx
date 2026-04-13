"use client";

import { useEffect, useState } from "react";
import QuickCheckInModal from "./QuickCheckInModal";
import StuckModal from "./StuckModal";
import { useStuckAssistant } from "../providers/stuck-assistance-provider";
import { useSession } from "../providers/session-provider";

export default function CheckInController() {
  const [open, setOpen] = useState(false);
  const [stuckOpen, setStuckOpen] = useState(false);
  const [intervalMs, setIntervalMs] = useState<number | null>(null);

  const { openAssistant } = useStuckAssistant();
  const { activeSession } = useSession();

  useEffect(() => {
    (window as any).triggerCheckIn = () => {
      setOpen(true);
      return "Check-in opened";
    };

    return () => {
      delete (window as any).triggerCheckIn;
    };
  }, []);

  useEffect(() => {
    const loadCheckInInterval = async () => {
      try {
        const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

        if (!API_BASE_URL) {
          setIntervalMs(5 * 60 * 1000);
          return;
        }

        const res = await fetch(`${API_BASE_URL}/users/profile`, {
          credentials: "include",
        });

        if (!res.ok) {
          setIntervalMs(5 * 60 * 1000);
          return;
        }

        const data = await res.json();
        const user = data.user || data;

        const minutes = user.checkinIntervalMinutes ?? 5;
        setIntervalMs(minutes * 60 * 1000);
      } catch (err) {
        console.error("Failed to load check-in interval:", err);
        setIntervalMs(5 * 60 * 1000);
      }
    };

    loadCheckInInterval();
  }, []);

  useEffect(() => {
    if (!intervalMs) return;

    const interval = setInterval(() => {
      setOpen((prev) => (prev ? prev : true));
    }, intervalMs);

    return () => clearInterval(interval);
  }, [intervalMs]);

  async function saveWellnessCheck(value: "up" | "down", helpChosen: boolean) {
    const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

    if (!API_BASE_URL || !activeSession) {
      console.log("[CHECK-IN] No active session, skipping DB save");
      return;
    }

    const csrfToken =
      typeof window !== "undefined" ? localStorage.getItem("csrfToken") : null;

    const feelingGood = value === "up";

    try {
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
            feelingGood,
            helpChosen,
          }),
        }
      );

      const data = await res.json().catch(() => ({}));
      console.log("[CHECK-IN] save response:", data);

      if (!res.ok) {
        throw new Error(data?.error || data?.message || "Failed to save wellness check");
      }
    } catch (error) {
      console.error("[CHECK-IN] Failed to save wellness check:", error);
    }
  }

  return (
    <>
      <QuickCheckInModal
        open={open}
        onClose={() => setOpen(false)}
        onSelect={async (value) => {
          console.log("Check-in value:", value);

          if (value === "up") {
            await saveWellnessCheck("up", false);
            setOpen(false);
            return;
          }

          if (value === "down") {
            setOpen(false);
            setStuckOpen(true);
          }
        }}
      />

      <StuckModal
        open={stuckOpen}
        onClose={async () => {
          await saveWellnessCheck("down", false);
          setStuckOpen(false);
        }}
        onHelp={async () => {
          await saveWellnessCheck("down", true);
          setStuckOpen(false);
          openAssistant();
        }}
      />
    </>
  );
}
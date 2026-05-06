"use client";

import { useEffect, useRef, useState } from "react";
import QuickCheckInModal from "./QuickCheckInModal";
import StuckModal from "./StuckModal";
import { useStuckAssistant } from "../providers/stuck-assistance-provider";
import { useSession } from "../providers/session-provider";
//import CheckInBrowserAlert from "./CheckInBrowserAlert";
import { useRouter } from "next/navigation";
import AIHelpModal from "./AIHelp";
import { useCheckIn } from "@/app/providers/checkin-provider";

export default function CheckInController() {
  function hasActiveSession() {
  if (!activeSession?.sessionId) {
    setSessionWarning("Start a study session before submitting a check-in.");
    return false;
  }

  setSessionWarning(null);
  return true;
}
    const { checkInOpen, setCheckInOpen, submitCheckIn } = useCheckIn();
  const [sessionWarning, setSessionWarning] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const savedCheckInRef = useRef(false);
  const [stuckOpen, setStuckOpen] = useState(false);
  const [intervalMs, setIntervalMs] = useState<number | null>(null);

  const { openAssistant } = useStuckAssistant();
  const { activeSession } = useSession();

  useEffect(() => {
(window as any).triggerCheckIn = () => {
  savedCheckInRef.current = false;
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
  if (savedCheckInRef.current) {
    console.log("[CHECK-IN] Already saved, skipping duplicate");
    return;
  }

  savedCheckInRef.current = true;

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
  helpChosen: helpChosen ? "yes" : "no",
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
{/*<CheckInBrowserAlert active={open} />*/}

<QuickCheckInModal
  open={open}
  onClose={() => {
    setOpen(false);
    setSessionWarning(null);
  }}
  warning={sessionWarning}
  onSelect={async (value) => {
    if (!hasActiveSession()) return;

    console.log("Check-in value:", value);

    if (value === "up") {
      await submitCheckIn("up", "None");
      setOpen(false);
      return;
    }

    if (value === "down") {
      setOpen(false);

      requestAnimationFrame(() => {
        setStuckOpen(true);
      });

      return;
    }
  }}
/>

<StuckModal
  open={stuckOpen}
  onClose={() => {
    setStuckOpen(false);
    setSessionWarning(null);
  }}
  onHelp={() => {
    console.log("[CHECK-IN] Help clicked");

    setStuckOpen(false);

    setTimeout(() => {
      console.log("[CHECK-IN] Opening AI assistant");
      openAssistant();
    }, 50);
  }}
  onChooseHelp={async (helpChosen) => {
    if (!hasActiveSession()) {
      setStuckOpen(false);
      setOpen(true);
      return;
    }

    console.log("[CHECK-IN] Saving help choice:", helpChosen);
    await submitCheckIn("down", helpChosen);
  }}
/>
<AIHelpModal />
  </>
);
}
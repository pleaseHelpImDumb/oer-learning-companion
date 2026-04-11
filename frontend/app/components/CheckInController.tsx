"use client";

import { useEffect, useState } from "react";
import QuickCheckInModal from "./QuickCheckInModal";
import StuckModal from "./StuckModal";
import { useStuckAssistant } from "../providers/stuck-assistance-provider";

const FIVE_MINUTES = 5 * 60 * 1000;

export default function CheckInController() {
  const [open, setOpen] = useState(false);
  const [stuckOpen, setStuckOpen] = useState(false);

  const { openAssistant } = useStuckAssistant();

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
    const interval = setInterval(() => {
      setOpen((prev) => (prev ? prev : true));
    }, FIVE_MINUTES);

    return () => clearInterval(interval);
  }, []);

  return (
    <>
      <QuickCheckInModal
        open={open}
        onClose={() => setOpen(false)}
        onSelect={(value) => {
          console.log("Check-in value:", value);

          if (value === "down") {
            setStuckOpen(true);
          }

          setOpen(false);
        }}
      />

      <StuckModal
        open={stuckOpen}
        onClose={() => setStuckOpen(false)}
        onHelp={() => {
          setStuckOpen(false);
          openAssistant();
        }}
      />
    </>
  );
}
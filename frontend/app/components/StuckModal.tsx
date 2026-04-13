"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import BreatheModal from "./Breathe";
import StudyTimer from "./Break";

type StuckModalProps = {
  open: boolean;
  onClose: () => void;
  onHelp: () => void;
};

export default function StuckModal({ open, onClose, onHelp }: StuckModalProps) {
  const router = useRouter();
  const [breathe, setBreathe] = useState(false);
  const [showBreak, setShowBreak] = useState(false);

  if (!open) return null;

const actions = [
  { label: "Help", onClick: onHelp },
  {
    label: "Break",
    onClick: () => {
      setShowBreak((prev) => {
        const next = !prev;
        if (next) setBreathe(false);
        return next;
      });
    },
  },
  { label: "Silly Activity", onClick: () => router.push("/activity") },
  {
    label: "Just Breathe",
    onClick: () => {
      setBreathe((prev) => {
        const next = !prev;
        if (next) setShowBreak(false);
        return next;
      });
    },
  },
] as const;

  const handle = (fn: () => void) => {
    onClose();
    fn();
  };

  return (
    <aside>
      <div
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/13 p-4"
        role="dialog"
        aria-modal="true"
        aria-label="Stuck help"
        onMouseDown={(e) => {
          if (e.target === e.currentTarget) onClose();
        }}
      >
        <div className="relative max-h-[80vh] w-full max-w-5xl overflow-auto rounded-xl bg-white p-6 shadow-lg dark:bg-[#23314c] sm:p-8">
          <button
            onClick={onClose}
            aria-label="Close"
            className="absolute top-3 right-3 flex h-9 w-9 items-center justify-center rounded-full bg-[#ADD8E6]/50 transition hover:bg-[#ADD8E6]/70 dark:bg-[#1C1836] sm:top-4 sm:right-4"
          >
            <span className="text-lg font-semibold">×</span>
          </button>

          <div className="flex flex-col items-center gap-4 sm:gap-6">
            <p className="text-center text-[clamp(1rem,2vw,1.5rem)] font-semibold dark:text-white/80">
              We&apos;ve got you. What would help right now?
            </p>

            <div className="h-px w-full rounded-2xl bg-black/80 dark:bg-white/80" />

            <div className="flex w-full flex-wrap justify-center gap-3 sm:gap-4">
              {actions.map((action) => (
                <button
                  key={action.label}
                  onClick={() => {
                    if (action.label === "Just Breathe" || action.label === "Break") {
                      action.onClick();
                    } else {
                      handle(action.onClick);
                    }
                  }}
                  className={`min-w-[9.5rem] rounded-full border-2 px-4 py-2 text-[clamp(0.9rem,1.4vw,1.25rem)] font-semibold sm:min-w-[10.5rem] ${
                    action.label === "Break" && showBreak
                      ? "border-[#57ba5c] bg-[#57ba5c]/10 text-[#57ba5c]"
                      : "border-[#ADD8E6] text-[#0077B6] dark:border-[#57ba5c] dark:text-[#57ba5c]"
                  }`}
                >
                  {action.label}
                </button>
              ))}
            </div>

            {showBreak && (
              <div className="mt-2 w-full">
                <StudyTimer />
              </div>
            )}
          </div>

          {breathe && <BreatheModal />}
        </div>
      </div>
    </aside>
  );
}
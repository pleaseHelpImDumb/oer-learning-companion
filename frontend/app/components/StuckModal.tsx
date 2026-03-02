"use client";

import { useRouter } from "next/navigation";
import { useStuckAssistant } from "@/app/providers/stuck-assistance-provider";
type StuckModalProps = {
  open: boolean;
  onClose: () => void;
  onHelp: () => void; // ✅ ADD THIS
};

export default function StuckModal({ open, onClose, onHelp }: StuckModalProps) {
  const router = useRouter();

  if (!open) return null;

  const actions = [
    { label: "Help", onClick: onHelp }, // ✅ CHANGE THIS (no router.push)
    { label: "Break", onClick: () => router.push("/break") },
    { label: "Silly Activity", onClick: () => console.log("Silly Activity") },
    { label: "Just Breathe", onClick: () => console.log("Breathing exercise") },
  ] as const;

  const handle = (fn: () => void) => {
    onClose();
    fn();
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/13 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-label="Stuck help"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="relative w-full max-w-5xl bg-white rounded-xl shadow-lg p-6 sm:p-8 max-h-[80vh] overflow-auto">
        <button
          onClick={onClose}
          aria-label="Close"
          className="absolute top-3 right-3 sm:top-4 sm:right-4
                     w-9 h-9 flex items-center justify-center
                     rounded-full bg-[#ADD8E6]/50 hover:bg-[#ADD8E6]/70 transition"
        >
          <span className="text-lg font-semibold">×</span>
        </button>

        <div className="flex flex-col gap-4 sm:gap-6 items-center">
          <p className="text-center font-semibold text-[clamp(1rem,2vw,1.5rem)]">
            We&apos;ve got you. What would help right now?
          </p>

          <div className="w-full h-px bg-black/80 rounded-2xl" />

          <div className="w-full flex flex-wrap justify-center gap-3 sm:gap-4">
            {actions.map((action) => (
              <button
                key={action.label}
                onClick={() => handle(action.onClick)}
                className="border-2 border-[#ADD8E6] text-[#0077B6] font-semibold
                         rounded-full px-4 py-2
                         text-[clamp(0.9rem,1.4vw,1.25rem)]
                         min-w-[9.5rem] sm:min-w-[10.5rem]"
              >
                {action.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
"use client";

import { useStuckAssistant } from "@/app/providers/stuck-assistance-provider";

export default function Robot() {
  const { openAssistant } = useStuckAssistant();

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <button
        onClick={openAssistant}
        aria-label="Open Study Assistant"
        className="flex items-center justify-center
                   w-16 h-16 rounded-full
                   bg-[#ADD8E6]/60 hover:bg-[#ADD8E6]/80
                   shadow-lg transition"
      >
        <span className="text-3xl">🤖</span>
      </button>
    </div>
  );
}